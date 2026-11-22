import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { MAX_PRODUCTS_PER_CATEGORY } from "../../../../modules/holistic-store/constants";
import { STORE_CATEGORIES } from "../../../../modules/holistic-store/types";

export const dynamic = "force-dynamic";

/**
 * Tienda pública — GET /api/store/products?category=Pulseras
 *
 * Devuelve SOLO piezas publicadas de la categoría pedida (máximo 35),
 * con los campos públicos (sin costo, margen ni datos internos).
 * No requiere sesión: es el catálogo de la landing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";

  if (!(STORE_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json(
      { error: `Categoría inválida. Usa una de: ${STORE_CATEGORIES.join(", ")}.` },
      { status: 400 },
    );
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { published: true, category },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          currency: true,
          imageUrl: true,
          category: true,
          availability: true,
        },
        orderBy: [{ availability: "asc" }, { name: "asc" }],
        take: MAX_PRODUCTS_PER_CATEGORY,
      }),
      prisma.product.count({ where: { published: true, category } }),
    ]);
    return NextResponse.json({ products, total });
  } catch (error) {
    console.error("Error al consultar la tienda pública:", error);
    return NextResponse.json(
      { error: "No fue posible cargar la tienda. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
