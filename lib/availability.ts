/**
 * Disponibilidad real de la agenda.
 *
 * Consulta a Prisma las citas que bloquean horarios (PENDING/CONFIRMED) para
 * un mes dado y devuelve instantánes absolutos en ISO. El cálculo de la parrilla
 * (qué slots quedan libres, cuáles días están disponibles) lo hacen los
 * componentes en hora local del navegador, de modo que un mismo registro se
 * interpreta correctamente en cualquier timezone del usuario.
 */
import { prisma } from "./prisma";
import { SLOT_BLOCKING_STATUSES } from "./booking";

export const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonthKey(month: string) {
  return MONTH_KEY_RE.test(month);
}

/**
 * IDs de los horarios bloqueados para el mes. Se extiende la ventana ±2 días
 * para cubrir las diferencias de zona horaria del navegador.
 */
export async function getBlockedDatesForMonth(monthKey: string): Promise<string[]> {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - 2 * 24 * 60 * 60 * 1000);
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0) + 2 * 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: start, lt: end }, status: { in: [...SLOT_BLOCKING_STATUSES] } },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  return appointments.map((appointment) => appointment.date.toISOString());
}
