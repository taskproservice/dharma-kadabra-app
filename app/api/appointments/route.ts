import { NextResponse } from "next/server";
import { z } from "zod";
import { services } from "../../../lib/data/services";
import { SlotUnavailableError, findSlotConflict, withSlotLock } from "../../../lib/booking";
import { prisma, type Appointment, type AppointmentModality, type AppointmentStatus } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";

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

    // Si se asigna un responsable, debe existir y ser una cuenta activa.
    if (parsed.data.assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: parsed.data.assigneeId }, select: { id: true, active: true } });
      if (!assignee || !assignee.active) {
        return NextResponse.json({ error: "El colaborador asignado no está disponible." }, { status: 400 });
      }
      assigneeId = assignee.id;
    }
  }

  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return NextResponse.json({ error: "El horario debe ser una fecha futura." }, { status: 400 });

  // Lista explícita de conflicto antes de escribir: ese horario exacto no lo
  // puede tener otro usuario hace apenas unos segundos.
  try {
    const conflict = await findSlotConflict(date);
    if (conflict) return slotTakenResponse();
  } catch (error) {
    console.error("Error al verificar el horario:", error);
    return NextResponse.json({ error: "No fue posible registrar la reserva. Inténtalo de nuevo." }, { status: 500 });
  }

  try {
    const appointment = await withSlotLock<Appointment>(date, null, (tx) =>
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
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    if (error instanceof SlotUnavailableError) return slotTakenResponse();
    console.error("Error al crear la cita:", error);
    return NextResponse.json({ error: "No fue posible registrar la reserva. Inténtalo de nuevo." }, { status: 500 });
  }
}
