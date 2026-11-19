import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Derivación de contraseñas con scrypt (formato `salt:digest` en hex).
 * Compartido por las cuentas de clientes y por el equipo (NextAuth).
 */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Hash ficticio para igualar el tiempo de respuesta cuando el correo no existe
// y evitar la enumeración de cuentas por timing.
const DUMMY_HASH = hashPassword(randomBytes(24).toString("hex"));
export function burnPasswordCheck(password: string) {
  verifyPassword(password, DUMMY_HASH);
  return false;
}
