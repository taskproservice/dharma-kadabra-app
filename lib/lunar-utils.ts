/**
 * Aproximación con mes sinódico medio, a partir de la luna nueva del
 * 6 de enero de 2000 a las 18:14 UTC. No es una efeméride astronómica.
 */
const SYNODIC_MONTH_MS = Math.round(29.53 * 24 * 60 * 60 * 1000);
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

const PHASES = [
  "Luna nueva",
  "Luna creciente",
  "Cuarto creciente",
  "Luna gibosa creciente",
  "Luna llena",
  "Luna gibosa menguante",
  "Cuarto menguante",
  "Luna menguante",
] as const;

export function getLunarInfo(date: Date = new Date()) {
  const elapsed = date.getTime() - KNOWN_NEW_MOON_MS;
  // El doble módulo mantiene la edad positiva incluso antes de la época.
  const age = ((elapsed % SYNODIC_MONTH_MS) + SYNODIC_MONTH_MS) % SYNODIC_MONTH_MS;
  const phaseIndex = Math.floor((age / SYNODIC_MONTH_MS) * 8 + 0.5) % 8;
  let untilFullMoon = SYNODIC_MONTH_MS / 2 - age;
  if (untilFullMoon <= 0) untilFullMoon += SYNODIC_MONTH_MS;

  return {
    phase: PHASES[phaseIndex],
    nextFullMoon: new Date(date.getTime() + untilFullMoon),
  };
}

// Hitos del ciclo medio (UTC); no se anuncian eclipses sin una efeméride real.
const MONTHLY_PHASES = [
  { phase: "Luna nueva", title: "Luna Nueva", offset: 0 },
  { phase: "Cuarto creciente", title: "Cuarto Creciente", offset: 0.25 },
  { phase: "Luna llena", title: "Luna Llena", offset: 0.5 },
  { phase: "Cuarto menguante", title: "Cuarto Menguante", offset: 0.75 },
] as const;

export type MonthlyLunarEvent = {
  phase: (typeof MONTHLY_PHASES)[number]["phase"];
  title: (typeof MONTHLY_PHASES)[number]["title"];
  date: string;
};

/** Tres o cuatro fases destacadas del mes visible, con fechas estimadas en UTC. */
export function getMonthlyLunarEvents(monthKey: string): MonthlyLunarEvent[] {
  const [year, month] = monthKey.split("-").map(Number);
  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);
  const firstCycle = Math.floor((start - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS) - 1;
  const lastCycle = Math.ceil((end - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS);

  return Array.from({ length: lastCycle - firstCycle + 1 }, (_, index) => firstCycle + index)
    .flatMap((cycle) => MONTHLY_PHASES.map(({ phase, title, offset }) => ({
      phase,
      title,
      timestamp: Math.round(KNOWN_NEW_MOON_MS + (cycle + offset) * SYNODIC_MONTH_MS),
    })))
    .filter(({ timestamp }) => timestamp >= start && timestamp < end)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 4)
    .map(({ phase, title, timestamp }) => ({
      phase,
      title,
      date: new Date(timestamp).toISOString().slice(0, 10),
    }));
}
