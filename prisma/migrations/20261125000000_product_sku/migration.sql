-- SKU · identificador único de cada pieza del inventario.
-- Es obligatorio y el `id` que Meta Commerce Manager (Facebook/Instagram)
-- usa para sincronizar el catálogo, por eso lleva índice UNIQUE.
--
-- Los productos existentes no tienen SKU: se rellena con un valor legible
-- derivado del id (en MAYÚSCULAS, p. ej. "PULSERA-OJO-DE-TIGRE") para poder
-- aplicar el NOT NULL sin perder registros. Paola puede renombrarlos después
-- desde el panel de Marketing (ej. "PUL-001").

-- Idempotente: si un `prisma db push` anterior ya creó la columna (aunque
-- fallara por el NOT NULL), aquí simplemente se continúa con el relleno.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;

-- Relleno del SKU histórico: slug del id en mayúsculas; los empates reciben
-- un sufijo corto y determinista (hash del id) para no violar el UNIQUE.
WITH normalized AS (
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
  FROM normalized
)
UPDATE "Product" AS p
SET "sku" = CASE
    -- Sufijo extra si el candidato ya lo ocupa otra fila (evita el UNIQUE).
    WHEN EXISTS (
      SELECT 1 FROM "Product" AS q
      WHERE q."id" <> p."id" AND q."sku" = CASE
        WHEN r.position = 1 THEN r.base_sku
        ELSE r.base_sku || '-' || UPPER(SUBSTRING(MD5(r."id") FROM 1 FOR 6))
      END
    )
    THEN (CASE
      WHEN r.position = 1 THEN r.base_sku
      ELSE r.base_sku || '-' || UPPER(SUBSTRING(MD5(r."id") FROM 1 FOR 6))
    END) || '-' || UPPER(SUBSTRING(MD5(p."id") FROM 1 FOR 8))
    WHEN r.position = 1 THEN r.base_sku
    ELSE r.base_sku || '-' || UPPER(SUBSTRING(MD5(r."id") FROM 1 FOR 6))
  END
FROM ranked AS r
WHERE p."id" = r."id";

-- Red de seguridad: nunca aplicar NOT NULL con filas sin SKU.
DO $$
DECLARE
  faltantes INTEGER;
BEGIN
  SELECT COUNT(*) INTO faltantes
  FROM "Product"
  WHERE "sku" IS NULL OR BTRIM("sku") = '';

  IF faltantes > 0 THEN
    RAISE EXCEPTION 'Abortado: % producto(s) quedaron sin SKU.', faltantes;
  END IF;
END $$;

ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");
