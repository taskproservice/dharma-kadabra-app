-- Recuperación de contraseña de clientes (Resend).
-- Solo se almacena el hash SHA-256 del token + su expiración (1 hora).
-- El token en claro viaja únicamente en el enlace del correo.

ALTER TABLE "Customer"
  ADD COLUMN "resetTokenHash" TEXT;

ALTER TABLE "Customer"
  ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);
