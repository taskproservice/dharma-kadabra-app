/**
 * Aplica la columna `Product.sku` en la base configurada (local o Supabase)
 * SIN perder datos.
 *
 *   node scripts/apply-sku.mjs
 *
 * Usa el mismo SQL idempotente de `scripts/sql/add-product-sku.sql`:
 *   1. agrega la columna si no existe (si un `prisma db push` falló a medias,
 *      la columna ya está: no pasa nada),
 *   2. rellena los productos existentes con un SKU derivado de su id,
 *   3. verifica que no quede ninguna fila sin SKU (si quedara, hace rollback),
 *   4. aplica NOT NULL + índice UNIQUE "Product_sku_key".
 *
 * Alternativa sin terminal: pega el contenido de
 * `scripts/sql/add-product-sku.sql` en el SQL Editor de Supabase.
 *
 * ⚠️ No ejecuta `prisma db push` ni `migrate reset`: tus productos actuales
 *    se conservan intactos.
 */
import { spawnSync } from "node:child_process";

const databaseUrl = (process.env.DATABASE_URL ?? "").trim();
if (!databaseUrl) {
  console.error(
    [
      "Falta DATABASE_URL.",
      "",
      "Ejecútalo con la cadena de conexión de tu base, por ejemplo:",
      '  DATABASE_URL="postgresql://usuario:clave@host:5432/dharma_kadabra" node scripts/apply-sku.mjs',
      "",
      "O pega scripts/sql/add-product-sku.sql en el SQL Editor de Supabase.",
    ].join("\n"),
  );
  process.exit(1);
}

const result = spawnSync(
  "npx",
  [
    "prisma",
    "db",
    "execute",
    "--schema",
    "prisma/schema.prisma",
    "--file",
    "scripts/sql/add-product-sku.sql",
  ],
  { stdio: "inherit", env: process.env },
);

if (result.status !== 0) {
  console.error(
    "\nLa aplicación del SKU falló. Ningún cambio quedó a medias (todo corre en una transacción).",
  );
  process.exit(result.status ?? 1);
}

console.log(
  [
    "",
    "✔ Columna \"sku\" lista (NOT NULL + UNIQUE) y productos existentes conservados.",
    "",
    "Siguiente paso opcional — SKUs comerciales legibles para el catálogo real",
    "(PUL-001…010 / CAD-001…010, sin borrar nada):",
    "  node scripts/seed-products.mjs",
    "",
    "Verificación rápida en Supabase (SQL Editor):",
    '  SELECT id, sku, name FROM "Product" ORDER BY sku;',
  ].join("\n"),
);
