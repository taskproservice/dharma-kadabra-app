import { NextResponse } from "next/server";
import { z } from "zod";
import { services } from "../../../lib/data/services";
import { prisma } from "../../../lib/prisma";
import { getCustomerSession } from "../../../lib/customer-auth";

const bookingSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientEmail: z.string().trim().email().max(180),
  clientPhone: z.string().trim().min(8).max(40),
  dateTime: z.string().datetime(),
  serviceId: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa tus datos y vuelve a intentarlo." }, { status: 400 });

  const service = services.find(({ id }) => id === parsed.data.serviceId);
  if (!service) return NextResponse.json({ error: "El servicio seleccionado no está disponible." }, { status: 400 });
  const date = new Date(parsed.data.dateTime);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return NextResponse.json({ error: "El horario debe ser una fecha futura." }, { status: 400 });

  const occupied = await prisma.appointment.findMany({ where: { date } });
  if (occupied.some((appointment: { date: Date; status: string }) => new Date(appointment.date).getTime() === date.getTime() && appointment.status !== "COMPLETED")) {
    return NextResponse.json({ error: "Ese horario acaba de reservarse. Elige otro horario." }, { status: 409 });
  }

  const session = await getCustomerSession();
  const appointment = await prisma.appointment.create({
    data: {
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail.toLowerCase(),
      clientPhone: parsed.data.clientPhone,
      date,
      service: service.name,
      status: "PENDING",
      depositPaid: true,
      ...(session ? { customerId: session.id } : {}),
    },
  });

  return NextResponse.json({ appointment: { id: appointment.id, date: appointment.date, status: appointment.status, depositPaid: appointment.depositPaid } }, { status: 201 });
}
