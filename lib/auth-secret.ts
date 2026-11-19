/**
 * Secreto compartido para firmar sesiones (NextAuth y cuentas de cliente).
 * Edge-safe: solo lee variables de entorno, sin dependencias de Node.
 *
 * En producción NO hay valor por defecto: si falta `AUTH_SECRET`, las sesiones
 * no se pueden emitir ni verificar y todo acceso protegido falla de forma cerrada.
 */
const DEV_ONLY_SECRET = "local-only-dharma-kadabra-secret";

export function getAuthSecret(): string | undefined {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  return process.env.NODE_ENV === "production" ? undefined : DEV_ONLY_SECRET;
}
