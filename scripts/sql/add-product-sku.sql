-- ============================================================================
-- Dharma Kadabra · Inventario con SKU (PR #71)
-- ----------------------------------------------------------------------------
-- Añade "Product"."sku" SIN perder registros y rellena los productos que ya
-- existen con un SKU derivado de su id (en MAYÚSCULAS):
--
--     pulsera-ojo-de-tigre  →  PULSERA-OJO-DE-TIGRE
--
-- Después puedes renombrarlos desde /dashboard/marketing (ej. "PUL-001").
--
-- Características:
--   · IDEMPOTENTE: se puede ejecutar las veces que haga falta, incluso si una
--     ejecución anterior falló a medias (columna creada pero sin rellenar).
--   · TRANSACCIONAL: si algo falla, no deja la tabla en un estado intermedio.
--   · NO BORRA NI MODIFICA ninguna fila: solo agrega y rellena "sku".
--
-- Cómo ejecutarlo:
--   A) Supabase → SQL Editor → pega todo este archivo → Run.
--   B) Terminal → node scripts/apply-sku.mjs
--                (o: npx prisma db execute --file scripts/sql/add-product-sku.sql
--                     --schema prisma/schema.prisma)
-- ============================================================================

BEGIN;

-- 0) Verificación temprana: la tabla debe existir.
DO $$
BEGIN
  IF to_regclass('"Product"') IS NULL THEN
    RAISE EXCEPTION 'No existe la tabla "Product". Revisa que DATABASE_URL apunte a tu base de Dharma Kadabra.';
  END IF;
END $$;

-- 1) Columna (si ya existe por un intento anterior, no hace nada).
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;

-- 2) Relleno de los productos existentes.
--    base_sku  = slug del id en MAYÚSCULAS (o PROD-<hash> si el id no tiene
--                caracteres utilizables).
--    Si dos ids generan el mismo base_sku, el primero se queda el limpio y el
--    resto recibe un sufijo determinista.
--    Si el candidato ya lo usa otra fila, se añade un sufijo extra para no
--    violar el UNIQUE.
WITH base AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(
        BTRIM(UPPER(REGEXP_REPLACE(TRIM("id"), '[^a-zA-Z0-9]+', '-', 'g')), '-'),
        ''
      ),
      'PROD-' || UPPER(SUBSTRING(MD5("id") FROM 1 FOR 10))
    ) AS base_sku
  FROM "Product"
  WHERE "sku" IS NULL OR BTRIM("sku") = ''
),
ranked AS (
  SELECT
    "id",
    base_sku,
    ROW_NUMBER() OVER (PARTITION BY base_sku ORDER BY "id") AS position
  FROM base
),
candidates AS (
  SELECT
    r."id",
    CASE
      WHEN r.position = 1 THEN r.base_sku
      ELSE r.base_sku || '-' || UPPER(SUBSTRING(MD5(r."id") FROM 1 FOR 6))
    END AS candidate
  FROM ranked AS r
)
UPDATE "Product" AS p
SET "sku" = CASE
    WHEN EXISTS (
      SELECT 1
      FROM "Product" AS q
      WHERE q."id" <> p."id" AND q."sku" = c.candidate
    )
    THEN c.candidate || '-' || UPPER(SUBSTRING(MD5(p."id") FROM 1 FOR 8))
    ELSE c.candidate
  END
FROM candidates AS c
WHERE p."id" = c."id";

-- 3) Bloqueo de seguridad: si quedara alguna fila sin SKU, abortamos todo
--    (rollback) en lugar de aplicar un NOT NULL roto.
DO $$
DECLARE
  faltantes INTEGER;
BEGIN
  SELECT COUNT(*) INTO faltantes
  FROM "Product"
  WHERE "sku" IS NULL OR BTRIM("sku") = '';

  IF faltantes > 0 THEN
    RAISE EXCEPTION 'Abortado: % producto(s) quedaron sin SKU. Ningún cambio fue aplicado.', faltantes;
  END IF;
END $$;

-- 4) NOT NULL (sin efecto si ya estaba aplicado).
ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;

-- 5) Índice UNIQUE con el mismo nombre que genera Prisma, para que
--    `prisma db push` / `migrate deploy` lo reconozcan y no lo dupliquen.
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");

-- 6) Resumen (aparece como NOTICE en la consola de Supabase/psql).
DO $$
DECLARE
  total INTEGER;
  duplicados INTEGER;
BEGIN
  SELECT COUNT(*) INTO total FROM "Product";
  SELECT COUNT(*) INTO duplicados
  FROM (SELECT "sku" FROM "Product" GROUP BY "sku" HAVING COUNT(*) > 1) AS d;

  RAISE NOTICE 'SKU aplicado en "Product": % producto(s) conservados, % SKU(s) duplicado(s).', total, duplicados;
  RAISE NOTICE 'Siguiente paso opcional: node scripts/seed-products.mjs (asigna PUL-001…010 / CAD-001…010).';
END $$;

COMMIT;
