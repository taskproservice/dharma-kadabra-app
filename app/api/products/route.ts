import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Catálogo del Punto de Venta — 100% Prisma.
 * GET /api/products → productos reales de la tabla `Product`,
 * ordenados por categoría y nombre para el grid del POS.
 */
export async function GET() {
  try {
    const auth = await authorize("products", "GET");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar el catálogo:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error al consultar el catálogo:", error);
    return NextResponse.json(
      { error: "No fue posible consultar el catálogo. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
