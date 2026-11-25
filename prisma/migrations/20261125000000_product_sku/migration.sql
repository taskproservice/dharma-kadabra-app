-- SKU · identificador único de cada pieza del inventario.
-- Es obligatorio y el `id` que Meta Commerce Manager (Facebook/Instagram)
-- usa para sincronizar el catálogo, por eso lleva índice UNIQUE.
--
-- Los productos existentes no tienen SKU: se rellena con un valor legible
-- derivado del id (en MAYÚSCULAS, p. ej. "PULSERA-OJO-DE-TIGRE") para poder
-- aplicar el NOT NULL sin perder registros. Paola puede renombrarlos después
-- desde el panel de Marketing (ej. "PUL-001").

ALTER TABLE "Product" ADD COLUMN "sku" TEXT;

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
  WHERE "sku" IS NULL
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
  WHEN r.position = 1 THEN r.base_sku
  ELSE r.base_sku || '-' || UPPER(SUBSTRING(MD5(r."id") FROM 1 FOR 6))
END
FROM ranked AS r
WHERE p."id" = r."id";

ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
