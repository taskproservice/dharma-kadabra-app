/**
 * Disponibilidad real de la agenda.
 *
 * Consulta a Prisma las citas que bloquean horarios (PENDING/CONFIRMED) para
 * un mes dado y devuelve instantes absolutos en ISO. El cálculo de la parrilla
 * (qué slots quedan libres, cuáles días están disponibles) lo hacen los
 * componentes en hora local del navegador, de modo que un mismo registro se
 * interpreta correctamente en cualquier timezone del usuario.
 *
 * FASE 1 · Selección de terapeuta: la consulta acepta `assigneeId` y, cuando
 * se indica, SOLO restan las citas de ese terapeuta. Si el terapeuta no tiene
 * citas a las 10:00, ese horario se muestra disponible aunque otra persona
 * del equipo esté ocupada a esa misma hora.
 */
import { prisma } from "./prisma";
import { slotBlockingWhere } from "./booking";
import { parseAssigneeId } from "./agenda-availability";

export { parseAssigneeId };

export const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonthKey(month: string) {
  return MONTH_KEY_RE.test(month);
}

/**
 * Horarios bloqueados (instantes ISO) para el mes indicado, opcionalmente
 * limitados a un terapeuta. Se extiende la ventana ±2 días para cubrir las
 * diferencias de zona horaria del navegador.
 */
export async function getBlockedDatesForMonth(monthKey: string, assigneeId?: string | null): Promise<string[]> {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - 2 * 24 * 60 * 60 * 1000);
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0) + 2 * 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: start, lt: end }, ...slotBlockingWhere(assigneeId) },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  return appointments.map((appointment) => appointment.date.toISOString());
}
