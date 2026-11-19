-- Cuentas del equipo autenticadas con NextAuth y roles RBAC verificados en el servidor.
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'ENGINEER', 'SOCIAL_MEDIA', 'COLLABORATOR', 'CLIENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'COLLABORATOR',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Las reservas nuevas nacen sin anticipo; solo el webhook del procesador de pagos lo marca.
ALTER TABLE "Appointment" ALTER COLUMN "depositPaid" SET DEFAULT false;
