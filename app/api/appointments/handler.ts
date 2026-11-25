import * as React from "react";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppointmentConfirmation } from "../../../emails/AppointmentConfirmation";
import { services } from "../../../lib/data/services";
import { SlotUnavailableError, findSlotConflict, withSlotLock } from "../../../lib/booking";
import { prisma, type Appointment, type AppointmentModality, type AppointmentStatus } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";
import { isTherapistRole } from "../../../lib/therapists";
import { appBaseUrl, sendEmail } from "../../../lib/resend";

export const dynamic = "force-dynamic";

const DEPOSIT_RATE = 0.2;
const STUDIO_TIMEZONE = "America/Tijuana";
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
 * y esté activa. Devuelve el id y nombre normalizados o un error 400.
 */
async function resolveAssignee(
  rawAssigneeId: string | undefined,
): Promise<
  | { ok: true; assigneeId: string | null; assigneeName: string | null }
  | { ok: false; response: NextResponse }
> {
  if (!rawAssigneeId) return { ok: true, assigneeId: null, assigneeName: null };

  const assignee = await prisma.user.findUnique({
    where: { id: rawAssigneeId },
    select: { id: true, name: true, active: true, role: true },
  });
  if (!assignee || !assignee.active || !isTherapistRole(assignee.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "El colaborador asignado no está disponible." }, { status: 400 }),
    };
  }
  return { ok: true, assigneeId: assignee.id, assigneeName: assignee.name };
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
  let assigneeName: string | null = null;
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
    // Se usa el correo dejado en el formulario y se vincula además customerId a la sesión.
    clientEmail = parsed.data.clientEmail.toLowerCase() || principal.email.toLowerCase();
    depositPrice = Math.round(service.price * DEPOSIT_RATE);

    // El cliente elige a su terapeuta; se valida que sea una cuenta agendable activa.
    const resolved = await resolveAssignee(parsed.data.assigneeId);
    if (!resolved.ok) return resolved.response;
    assigneeId = resolved.assigneeId;
    assigneeName = resolved.assigneeName;
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
    assigneeName = resolved.assigneeName;
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

    // Confirmación por correo (Resend + React Email). Envuelto en try/catch
    // para que un fallo en el envío de email jamás provoque la pérdida de la cita.
    if (clientEmail) {
      try {
        const dateFormatted = new Intl.DateTimeFormat("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: STUDIO_TIMEZONE,
        }).format(date);
        const timeFormatted = `${new Intl.DateTimeFormat("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: STUDIO_TIMEZONE,
        }).format(date)} hrs (hora Tijuana)`;
        const base = appBaseUrl(new URL(request.url).origin);

        await sendEmail({
          to: clientEmail,
          subject: "Tu reserva está registrada · Dharma Kadabra",
          react: React.createElement(AppointmentConfirmation, {
            clientName,
            service: serviceName,
            date: dateFormatted,
            time: timeFormatted,
            modality,
            therapistName: assigneeName,
            depositAmount: isCustomer ? depositPrice : null,
            folio: appointment.id.slice(-8).toUpperCase(),
            accountUrl: `${base}/mi-cuenta`,
          }),
        });
      } catch (emailError) {
        console.error("Error al enviar correo de confirmación de cita:", emailError);
      }
    }

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

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    if (error instanceof SlotUnavailableError) return slotTakenResponse();
    console.error("Error al crear la cita:", error);
    return NextResponse.json({ error: "No fue posible registrar la reserva. Inténtalo de nuevo." }, { status: 500 });
  }
}
