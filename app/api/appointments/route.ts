import { NextResponse } from "next/server";
import { z } from "zod";
import { services } from "../../../lib/data/services";
import { SlotUnavailableError, withSlotLock } from "../../../lib/booking";
import type { Appointment } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

const DEPOSIT_RATE = 0.2;

const bookingSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientEmail: z.string().trim().email().max(180),
  clientPhone: z.string().trim().min(8).max(40),
  dateTime: z.string().datetime(),
  serviceId: z.string().min(1),
});

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

  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa tus datos y vuelve a intentarlo." }, { status: 400 });

  const service = services.find(({ id }) => id === parsed.data.serviceId);
  if (!service) return NextResponse.json({ error: "El servicio seleccionado no está disponible." }, { status: 400 });
  const date = new Date(parsed.data.dateTime);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return NextResponse.json({ error: "El horario debe ser una fecha futura." }, { status: 400 });

  // Un cliente solo puede reservar a su nombre: el correo y la cuenta salen de la sesión.
  const isCustomer = principal.kind === "customer";
  const clientEmail = isCustomer ? principal.email.toLowerCase() : parsed.data.clientEmail.toLowerCase();

  try {
    const appointment = await withSlotLock<Appointment>(date, null, (tx) =>
      tx.appointment.create({
        data: {
          clientName: parsed.data.clientName,
          clientEmail,
          clientPhone: parsed.data.clientPhone,
          date,
          service: service.name,
          status: "PENDING",
          depositPaid: false,
          ...(isCustomer ? { customerId: principal.id } : {}),
        },
      }),
    );

    return NextResponse.json({
      appointment: { id: appointment.id, date: appointment.date, status: appointment.status, depositPaid: appointment.depositPaid },
      payment: { required: true, amount: Math.round(service.price * DEPOSIT_RATE), currency: "MXN" },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SlotUnavailableError) return NextResponse.json({ error: "Ese horario acaba de reservarse. Elige otro horario." }, { status: 409 });
    console.error("Error al crear la cita:", error);
    return NextResponse.json({ error: "No fue posible registrar la reserva. Inténtalo de nuevo." }, { status: 500 });
  }
}
