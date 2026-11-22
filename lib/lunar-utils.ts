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
