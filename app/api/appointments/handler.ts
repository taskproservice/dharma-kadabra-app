import { NextResponse } from "next/server";
import { z } from "zod";
import { services } from "../../../lib/data/services";
import { SlotUnavailableError, findSlotConflict, withSlotLock } from "../../../lib/booking";
import { prisma, type Appointment, type AppointmentModality, type AppointmentStatus } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";
import { isTherapistRole } from "../../../lib/therapists";
import { appBaseUrl, sendTransactionalEmail } from "../../../lib/resend";
import { appointmentConfirmationEmail } from "../../../lib/email-templates";

export const dynamic = "force-dynamic";

const DEPOSIT_RATE = 0.2;
const modalitySchema = z.enum(["IN_PERSON", "VIDEO_CALL"]).default("IN_PERSON");

/** Reservas por el público (catálogo). Todo el flujo pasa por PENDING y anticipo. */
const customerBookingSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientEmail: z.string().trim().email().max(180),
  clientPhone: z.string().trim().min(8).max(40),
  modality: modalitySchema,
  dateTime: z.string().datetime(),
  serviceId: z.string().min(1),
  /** FASE 1 · Terapeuta elegido en la Agenda Digital ("¿Con quién deseas tu sesión?"). */
  assigneeId: z.string().trim().min(1).optional(),
});

/**
 * Citas del equipo (backoffice): servicio editorial libre ("Lectura Akáshica"),
 * estado elegido en el dashboard, modalidad, responsable y correo opcional.
 * Sin anticipo.
 */
const staffBookingSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientPhone: z.string().trim().min(8).max(40),
  modality: modalitySchema,
  dateTime: z.string().datetime(),
  service: z.string().trim().min(2).max(80),
  status: z.enum(["PENDING", "CONFIRMED"]).default("PENDING"),
  clientEmail: z.string().trim().email().max(180).optional(),
  /** Colaborador responsable de la sesión (lo asigna el equipo). */
  assigneeId: z.string().trim().min(1).optional(),
});

/**
 * Valida que el responsable sea una cuenta agendable (ADMIN o COLLABORATOR)
 * y esté activa. Devuelve el id normalizado o un error 400.
 */
async function resolveAssignee(
  rawAssigneeId: string | undefined,
): Promise<{ ok: true; assigneeId: string | null } | { ok: false; response: NextResponse }> {
  if (!rawAssigneeId) return { ok: true, assigneeId: null };

  const assignee = await prisma.user.findUnique({
    where: { id: rawAssigneeId },
    select: { id: true, active: true, role: true },
  });
  if (!assignee || !assignee.active || !isTherapistRole(assignee.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "El colaborador asignado no está disponible." }, { status: 400 }),
    };
  }
  return { ok: true, assigneeId: assignee.id };
}

function slotTakenResponse() {
  return NextResponse.json(
    { error: "Ese horario acaba de reservarse. Elige otro horario.", code: "SLOT_TAKEN" },
    { status: 409 },
  );
}

/**
 * Crea una cita PENDIENTE y sin anticipo. Solo el webhook del procesador de
 * pagos (Stripe u otro) podrá marcar `depositPaid: true` y confirmar la cita.
 */
export async function POST(request: Request) {
  const auth = await authorize("appointments", "POST");
  if (!auth.ok) {
    if (auth.status === 401) return NextResponse.json({ error: "Inicia sesión o crea tu cuenta para reservar.", loginUrl: "/mi-cuenta" }, { status: 401 });
    return auth.response;
  }
  const { principal } = auth;
  const isCustomer = principal.kind === "customer";

  const body = await request.json().catch(() => null);

  let clientName: string;
  let clientPhone: string;
  let date: Date;
  let serviceName: string;
  let clientEmail = "";
  let status: AppointmentStatus = "PENDING";
  let modality: AppointmentModality = "IN_PERSON";
  let assigneeId: string | null = null;
  let depositPrice: number | null = null;

  if (isCustomer) {
    const parsed = customerBookingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Revisa tus datos y vuelve a intentarlo." }, { status: 400 });
    const service = services.find(({ id }) => id === parsed.data.serviceId);
    if (!service) return NextResponse.json({ error: "El servicio seleccionado no está disponible." }, { status: 400 });

    clientName = parsed.data.clientName;
    clientPhone = parsed.data.clientPhone;
    date = new Date(parsed.data.dateTime);
    serviceName = service.name;
    modality = parsed.data.modality;
    // Un cliente solo puede reservar a su nombre: el correo y la cuenta salen de la sesión.
    clientEmail = principal.email.toLowerCase();
    depositPrice = Math.round(service.price * DEPOSIT_RATE);

    // El cliente elige a su terapeuta; se valida que sea una cuenta agendable activa.
    const resolved = await resolveAssignee(parsed.data.assigneeId);
    if (!resolved.ok) return resolved.response;
    assigneeId = resolved.assigneeId;
  } else {
    const parsed = staffBookingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Revisa tus datos y vuelve a intentarlo." }, { status: 400 });
    clientName = parsed.data.clientName;
    clientPhone = parsed.data.clientPhone;
    date = new Date(parsed.data.dateTime);
    serviceName = parsed.data.service;
    status = parsed.data.status;
    modality = parsed.data.modality;
    clientEmail = parsed.data.clientEmail?.toLowerCase() ?? "";

    // Si se asigna un responsable, debe existir, estar activo y ser agendable.
    const resolved = await resolveAssignee(parsed.data.assigneeId);
    if (!resolved.ok) return resolved.response;
    assigneeId = resolved.assigneeId;
  }

  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return NextResponse.json({ error: "El horario debe ser una fecha futura." }, { status: 400 });

  // Lista explícita de conflicto antes de escribir: ese horario exacto no lo
  // puede tener otro usuario hace apenas unos segundos.
  try {
    const conflict = await findSlotConflict(date, { assigneeId });
    if (conflict) return slotTakenResponse();
  } catch (error) {
    console.error("Error al verificar el horario:", error);
    return NextResponse.json({ error: "No fue posible registrar la reserva. Inténtalo de nuevo." }, { status: 500 });
  }

  try {
    const appointment = await withSlotLock<Appointment>(date, { assigneeId }, (tx) =>
      tx.appointment.create({
        data: {
          clientName,
          clientEmail,
          clientPhone,
          date,
          service: serviceName,
          modality,
          status,
          depositPaid: false,
          ...(isCustomer ? { customerId: principal.id } : {}),
          ...(assigneeId ? { assigneeId } : {}),
        },
      }),
    );

    const payload: Record<string, unknown> = {
      appointment: {
        id: appointment.id,
        date: appointment.date,
        modality: appointment.modality,
        status: appointment.status,
        depositPaid: appointment.depositPaid,
        assigneeId: appointment.assigneeId ?? null,
      },
    };
    if (isCustomer) payload.payment = { required: true, amount: depositPrice, currency: "MXN" };

    // Confirmación por correo (Resend). Nunca bloquea la reserva: si el
    // envío falla, la cita ya quedó creada y el cliente la ve en Mi Cuenta.
    if (clientEmail) {
      try {
        const dateLabel = new Intl.DateTimeFormat("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
        const base = appBaseUrl(new URL(request.url).origin);
        const { subject, html } = appointmentConfirmationEmail({
          clientName,
          service: serviceName,
          dateLabel,
          modality,
          depositAmount: isCustomer ? depositPrice : null,
          accountUrl: base ? `${base}/mi-cuenta` : "/mi-cuenta",
        });
        await sendTransactionalEmail({ to: clientEmail, subject, html });
      } catch (error) {
        console.error("Error al enviar confirmación de cita:", error);
      }
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    if (error instanceof SlotUnavailableError) return slotTakenResponse();
    console.error("Error al crear la cita:", error);
    return NextResponse.json({ error: "No fue posible registrar la reserva. Inténtalo de nuevo." }, { status: 500 });
  }
}
