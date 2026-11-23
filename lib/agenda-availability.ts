/**
 * Lógica de negocio y utilidades de fechas/horarios para la Agenda Digital.
 *
 * Calcula la disponibilidad real de la plantilla de trabajo (09:00–18:00 en
 * hora local del navegador) restando los horarios ya ocupados por citas
 * registradas en Prisma. Todas las funciones de disponibilidad son puras:
 * reciben los horarios bloqueados (instantes absolutos en ISO) y no hablan
 * con la base de datos; la consulta vive en `lib/availability.ts`.
 */

export const AGENDA_WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
export const WEEKDAYS = AGENDA_WEEKDAYS;

/** Ritmo de la plantilla: bloques de una hora, de 09:00 a 18:00 (hora local). */
export const WORK_TEMPLATE_START_HOUR = 9;
export const WORK_TEMPLATE_END_HOUR = 18;

export function pad(value: number) {
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

/* -------------------------------------------------------------------------- */
/* FASE 1 · Agenda por terapeuta                                               */
/* -------------------------------------------------------------------------- */

/** Límite razonable de longitud para un id de Prisma (cuid/uuid) recibido por query. */
const ASSIGNEE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Normaliza el `assigneeId` de una query string:
 * - ausente, vacío o `all` → `null` (disponibilidad de toda la casa).
 * - con formato inválido → `undefined` (la ruta responde 400).
 */
export function parseAssigneeId(raw: string | null | undefined): string | null | undefined {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "all") return null;
  return ASSIGNEE_ID_RE.test(trimmed) ? trimmed : undefined;
}

/* -------------------------------------------------------------------------- */
/* Disponibilidad real desde la plantilla de trabajo                           */
/* -------------------------------------------------------------------------- */

/** "HH:MM" locales (09:00, 10:00, … 17:00) que define la plantilla de trabajo. */
export function getWorkTemplateSlots() {
  const slots: string[] = [];
  for (let hour = WORK_TEMPLATE_START_HOUR; hour < WORK_TEMPLATE_END_HOUR; hour += 1) {
    slots.push(`${pad(hour)}:00`);
  }
  return slots;
}

/** Clave de fecha local "YYYY-MM-DD" del navegador. */
export function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Clave de hora local "HH:MM" del navegador. */
export function toLocalTimeKey(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Para una fecha local, el conjunto de "HH:MM" ocupados por las citas bloqueadas. */
export function getBlockedSlotKeysForDate(dateKey: string, blocked: readonly string[]) {
  const keys = new Set<string>();
  for (const instant of blocked) {
    const date = new Date(instant);
    if (Number.isNaN(date.getTime())) continue;
    if (toLocalDateKey(date) === dateKey) keys.add(toLocalTimeKey(date));
  }
  return keys;
}

/**
 * Horarios disponibles para un día dado, restando de la plantilla de trabajo
 * los horarios ya ocupados por citas (`blocked`) y, si `dateKey` es hoy, los
 * horarios que ya pasaron. `now` es inyectable para pruebas.
 */
export function getAvailableSlotsForDate(dateKey: string, blocked: readonly string[], now: Date = new Date()) {
  const isToday = dateKey === toLocalDateKey(now);
  const blockedKeys = getBlockedSlotKeysForDate(dateKey, blocked);
  const [year, month, day] = dateKey.split("-").map(Number);

  return getWorkTemplateSlots().filter((slot) => {
    if (blockedKeys.has(slot)) return false;
    if (!isToday) return true;
    const [hour, minute] = slot.split(":").map(Number);
    const slotDate = new Date(year, month - 1, day, hour, minute, 0, 0);
    return slotDate.getTime() > now.getTime();
  });
}

/** ¿El día tiene al menos un horario disponible? (ignora días pasados) */
export function isDateAvailable(dateKey: string, blocked: readonly string[], todayKey: string, now: Date = new Date()) {
  if (dateKey < todayKey) return false;
  return getAvailableSlotsForDate(dateKey, blocked, now).length > 0;
}

/** Primer día disponible del mes (>= todayKey), o `null` si no hay ninguno. */
export function findFirstAvailableDate(monthKey: string, todayKey: string, blocked: readonly string[], now: Date = new Date()) {
  const dayCount = getDaysInMonth(monthKey);
  for (let day = 1; day <= dayCount; day += 1) {
    const dateKey = `${monthKey}-${pad(day)}`;
    if (isDateAvailable(dateKey, blocked, todayKey, now)) return dateKey;
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
