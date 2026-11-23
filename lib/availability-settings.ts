/**
 * Disponibilidad semanal del colaborador (parrilla de días y horas).
 *
 * Formato persistido en `User.weeklyAvailability` (JSON):
 *   [{ "weekday": 0, "hour": 9 }, ...] · weekday 0 = lunes.
 *
 * Es un módulo puro: lo usan el panel de agenda (cliente) y la API.
 */

export interface AvailabilitySlot {
  weekday: number; // 0 = lunes … 6 = domingo
  hour: number;    // hora de inicio, 9–17
}

export const AVAILABILITY_WEEKDAYS = [
  { value: 0, short: "Lun", label: "Lunes" },
  { value: 1, short: "Mar", label: "Martes" },
  { value: 2, short: "Mié", label: "Miércoles" },
  { value: 3, short: "Jue", label: "Jueves" },
  { value: 4, short: "Vie", label: "Viernes" },
  { value: 5, short: "Sáb", label: "Sábado" },
  { value: 6, short: "Dom", label: "Domingo" },
] as const;

export const AVAILABILITY_HOURS = Array.from({ length: 9 }, (_, index) => {
  const hour = 9 + index;
  return { value: hour, label: `${String(hour).padStart(2, "0")}:00` };
});

/** Limpia cualquier valor desconocido y elimina duplicados. */
export function normalizeAvailability(raw: unknown): AvailabilitySlot[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const slots: AvailabilitySlot[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const { weekday, hour } = item as { weekday?: unknown; hour?: unknown };
    if (
      typeof weekday !== "number" || !Number.isInteger(weekday) || weekday < 0 || weekday > 6 ||
      typeof hour !== "number" || !Number.isInteger(hour) || hour < 9 || hour > 17
    ) {
      continue;
    }
    const key = `${weekday}-${hour}`;
    if (seen.has(key)) continue;
    seen.add(key);
    slots.push({ weekday, hour });
  }
  return slots.sort((a, b) => a.weekday - b.weekday || a.hour - b.hour);
}

export function isSlotEnabled(slots: readonly AvailabilitySlot[], weekday: number, hour: number): boolean {
  return slots.some((slot) => slot.weekday === weekday && slot.hour === hour);
}
