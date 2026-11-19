import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSession } from "../../../../lib/customer-auth";
import { prisma } from "../../../../lib/prisma";

const rescheduleSchema = z.object({ dateTime: z.string().datetime() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Inicia sesión para reagendar tu cita." }, { status: 401 });
  const parsed = rescheduleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Selecciona una fecha y hora válidas." }, { status: 400 });
  const date = new Date(parsed.data.dateTime);
  if (date.getTime() <= Date.now()) return NextResponse.json({ error: "Elige una fecha futura." }, { status: 400 });
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || (appointment.customerId !== session.id && appointment.clientEmail.toLowerCase() !== session.email.toLowerCase())) return NextResponse.json({ error: "No encontramos esa cita en tu cuenta." }, { status: 404 });
  if (appointment.status === "COMPLETED") return NextResponse.json({ error: "Las sesiones completadas no se pueden reagendar." }, { status: 409 });
  const appointmentsAtSlot = await prisma.appointment.findMany({ where: { date } });
  if (appointmentsAtSlot.some((item: { id: string; status: string; date: Date }) => item.id !== id && item.status !== "COMPLETED" && new Date(item.date).getTime() === date.getTime())) {
    return NextResponse.json({ error: "Ese horario no está disponible." }, { status: 409 });
  }
  const updated = await prisma.appointment.update({ where: { id }, data: { date, status: "PENDING" } });
  return NextResponse.json({ appointment: { id: updated.id, date: updated.date, status: updated.status } });
}
