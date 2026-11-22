/**
 * Lógica de negocio y utilidades de fechas/horarios para la Agenda Digital.
 *
 * Centraliza el cálculo de celdas del calendario mensual, el formato horario
 * y la disponibilidad de demostración hasta conectar disponibilidad en vivo
 * desde Prisma.
 */

export const AGENDA_WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
export const WEEKDAYS = AGENDA_WEEKDAYS;

/** Horarios de demostración por día de la semana (0 = Dom … 6 = Sáb). */
const MOCK_SLOTS_BY_WEEKDAY: Record<number, readonly string[]> = {
  0: [],
  1: ["10:00", "14:00"],
  2: ["10:00", "14:00", "16:00"],
  3: [],
  4: ["10:00", "14:00", "16:00"],
  5: ["10:00", "14:00"],
  6: ["10:00", "16:00"],
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  // Mediodía UTC evita desfases al representar una fecha de calendario.
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function keyFromDate(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

export function shiftMonth(monthKey: string, amount: number) {
  const [year, month] = monthKey.split("-").map(Number);
  return getMonthKey(new Date(Date.UTC(year, month - 1 + amount, 1, 12)));
}

export function getDaysInMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
}

export function getCalendarDates(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1, 12)).getUTCDay();
  const mondayOffset = (firstWeekday + 6) % 7;
  const dayCount = getDaysInMonth(monthKey);
  const cellCount = Math.ceil((mondayOffset + dayCount) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) =>
    keyFromDate(new Date(Date.UTC(year, month - 1, 1 - mondayOffset + index, 12))),
  );
}

export function getMockAvailability(dateKey: string, todayKey: string) {
  if (dateKey <= todayKey) return [];

  const date = dateFromKey(dateKey);
  // Algunos días se reservan como no disponibles para que la vista sea realista.
  if (date.getUTCDate() % 9 === 0) return [];

  return [...(MOCK_SLOTS_BY_WEEKDAY[date.getUTCDay()] ?? [])];
}

export function findFirstAvailableDate(monthKey: string, todayKey: string) {
  const dayCount = getDaysInMonth(monthKey);
  for (let day = 1; day <= dayCount; day += 1) {
    const dateKey = `${monthKey}-${pad(day)}`;
    if (getMockAvailability(dateKey, todayKey).length > 0) return dateKey;
  }
  return null;
}

export function formatAgendaDate(dateKey: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", { ...options, timeZone: "UTC" }).format(dateFromKey(dateKey));
}

export function capitalizeEs(value: string) {
  return value.charAt(0).toLocaleUpperCase("es-MX") + value.slice(1);
}

export function formatSlotTime(time: string) {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}
export const formatTime = formatSlotTime;

export function getLunarPhaseGuidance(phase: string) {
  if (phase === "Luna llena") return "Un momento simbólico para agradecer, soltar y limpiar.";
  if (phase === "Luna nueva") return "Ideal para sembrar intenciones y comenzar un nuevo ciclo.";
  return "Una pausa para escuchar tu intuición y elegir con calma.";
}
