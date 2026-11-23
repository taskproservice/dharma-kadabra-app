-- FASE 1-4 · Arquitectura multirrol (RBAC), modalidad de citas,
-- visibilidad de productos, disponibilidad semanal y analítica de Marketing.
--
-- Nota de despliegue: `ALTER TYPE ... RENAME VALUE` conserva a los usuarios
-- que tuvieran el rol SOCIAL_MEDIA y los convierte en MARKETING sin pérdida.
-- En despliegues nuevos (sin datos) este rename simplemente queda sin efecto
-- porque el valor ya no existe en el tipo.

-- 1) MARKETING sustituye a SOCIAL_MEDIA.
ALTER TYPE "Role" RENAME VALUE 'SOCIAL_MEDIA' TO 'MARKETING';

-- 2) Modalidad obligatoria de las citas (presencial / videollamada).
DO $$ BEGIN
  CREATE TYPE "Modality" AS ENUM ('IN_PERSON', 'VIDEO_CALL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Appointment"
  ADD COLUMN "modality" "Modality" NOT NULL DEFAULT 'IN_PERSON';

-- 3) Colaborador responsable de la cita (la agenda del rol COLLABORATOR
--    solo muestra sus propias citas).
ALTER TABLE "Appointment"
  ADD COLUMN "assigneeId" TEXT;

CREATE INDEX "Appointment_assigneeId_date_idx" ON "Appointment"("assigneeId", "date");

DO $$ BEGIN
  ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4) Botón de visibilidad del panel de Marketing: al apagarse, la pieza
--    desaparece de la tienda pública sin borrar el registro.
ALTER TABLE "Product"
  ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Product_category_published_isVisible_idx"
  ON "Product"("category", "published", "isVisible");

-- 5) Disponibilidad semanal del colaborador:
--    [{ "weekday": 0-6, "hour": 9-18 }, ...]
ALTER TABLE "User"
  ADD COLUMN "weeklyAvailability" JSONB NOT NULL DEFAULT '[]';

-- 6) Ajustes operativos del sistema (modo mantenimiento del panel de Ingeniería).
CREATE TABLE "SystemSetting" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- 7) Analítica de Marketing.
CREATE TABLE "StoreVisit" (
  "id" TEXT NOT NULL,
  "path" TEXT NOT NULL DEFAULT '/tienda',
  "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoreVisit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StoreVisit_visitedAt_idx" ON "StoreVisit"("visitedAt");

CREATE TABLE "ProductView" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProductView_productId_viewedAt_idx" ON "ProductView"("productId", "viewedAt");

DO $$ BEGIN
  ALTER TABLE "ProductView"
    ADD CONSTRAINT "ProductView_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
