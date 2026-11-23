import { NextResponse } from "next/server";
import { isMaintenanceMode } from "../../../../lib/maintenance";
import { MAX_PRODUCTS_PER_CATEGORY } from "../../../../modules/holistic-store/constants";
import { getPublishedProducts, normalizeStoreError } from "../../../../modules/holistic-store/data";
import { STORE_CATEGORIES, type StoreCategory } from "../../../../modules/holistic-store/types";

export const dynamic = "force-dynamic";

/** Códigos de error de Prisma con una respuesta HTTP más precisa. */
const STATUS_BY_CODE: Record<string, number> = {
  DB_UNCONFIGURED: 503,
  DB_UNREACHABLE: 503,
  DB_TIMEOUT: 503,
  DB_SCHEMA_MISSING: 503,
  DB_SCHEMA_MISMATCH: 500,
};

/**
 * Tienda pública — GET /api/store/products?category=Pulseras
 *
 * Devuelve SOLO piezas publicadas de la categoría pedida (máximo 35),
 * con los campos públicos (sin costo, margen ni datos internos).
 * No requiere sesión: es el catálogo de la tienda.
 *
 * Nunca responde con una excepción sin manejar: cualquier fallo de base de
 * datos se traduce en `{ error, code }` para que el frontend muestre una
 * pantalla de error elegante.
 */
export async function GET(request: Request) {
  // Modo Mantenimiento (Panel de Ingeniería): el catálogo se retira temporalmente.
  if (await isMaintenanceMode().catch(() => false)) {
    return NextResponse.json(
      { error: "La tienda está en mantenimiento. Vuelve en unos minutos.", code: "MAINTENANCE" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";

  if (!(STORE_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json(
      {
        error: `Categoría inválida. Usa una de: ${STORE_CATEGORIES.join(", ")}.`,
        code: "INVALID_CATEGORY",
      },
      { status: 400 },
    );
  }

  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_PRODUCTS_PER_CATEGORY)
      : MAX_PRODUCTS_PER_CATEGORY;

  try {
    const { products, total } = await getPublishedProducts(category as StoreCategory, limit);
    return NextResponse.json(
      { products, total },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const failure = normalizeStoreError(error, `GET /api/store/products?category=${category}`);
    return NextResponse.json(
      { error: failure.message, code: failure.code, detail: failure.detail ?? null },
      { status: STATUS_BY_CODE[failure.code] ?? 500 },
    );
  }
}
