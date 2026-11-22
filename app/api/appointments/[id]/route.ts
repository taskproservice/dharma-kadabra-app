import { NextResponse } from "next/server";
import { z } from "zod";
import { SlotUnavailableError, findSlotConflict, withSlotLock } from "../../../../lib/booking";
import { prisma, type Appointment } from "../../../../lib/prisma";
import { authorize } from "../../../../lib/rbac";

export const dynamic = "force-dynamic";

const rescheduleSchema = z.object({ dateTime: z.string().datetime() });

/** Reagenda una cita. Clientes: solo las propias. Equipo autorizado: cualquiera. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("appointments", "PATCH");
  if (!auth.ok) return auth.status === 401 ? NextResponse.json({ error: "Inicia sesión para reagendar tu cita." }, { status: 401 }) : auth.response;
  const { principal } = auth;

  const parsed = rescheduleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Selecciona una fecha y hora válidas." }, { status: 400 });
  const date = new Date(parsed.data.dateTime);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return NextResponse.json({ error: "Elige una fecha futura." }, { status: 400 });
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({ where: { id } }) as Appointment | null;
  const ownsAppointment = principal.kind === "staff" || (appointment && (appointment.customerId === principal.id || appointment.clientEmail.toLowerCase() === principal.email.toLowerCase()));
  // 404 (no 403) para no revelar la existencia de citas ajenas.
  if (!appointment || !ownsAppointment) return NextResponse.json({ error: "No encontramos esa cita en tu cuenta." }, { status: 404 });
  if (appointment.status === "COMPLETED") return NextResponse.json({ error: "Las sesiones completadas no se pueden reagendar." }, { status: 409 });

  // Lista explícita de conflicto antes de escribir: el horario exacto no lo ha
  // podido ocupar otro usuario hace apenas unos segundos.
  try {
    const conflict = await findSlotConflict(date, id);
    if (conflict) return NextResponse.json({ error: "Ese horario acaba de reservarse. Elige otro horario.", code: "SLOT_TAKEN" }, { status: 409 });
  } catch (error) {
    console.error("Error al verificar el horario:", error);
    return NextResponse.json({ error: "No fue posible reagendar la cita." }, { status: 500 });
  }

  try {
    // El anticipo ya pagado se conserva; la cita vuelve a PENDING hasta que se confirme el nuevo horario.
    const updated = await withSlotLock<Appointment>(date, id, (tx) => tx.appointment.update({ where: { id }, data: { date, status: "PENDING" } }));
    return NextResponse.json({ appointment: { id: updated.id, date: updated.date, status: updated.status } });
  } catch (error) {
    if (error instanceof SlotUnavailableError) return NextResponse.json({ error: "Ese horario no está disponible.", code: "SLOT_TAKEN" }, { status: 409 });
    console.error("Error al reagendar la cita:", error);
    return NextResponse.json({ error: "No fue posible reagendar la cita." }, { status: 500 });
  }
}
