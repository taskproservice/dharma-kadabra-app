import { NextResponse } from "next/server";
import { authorize } from "../../../../../lib/rbac";
import { appBaseUrl } from "../../../../../lib/resend";
import { prisma } from "../../../../../lib/prisma";
import { buildMetaCatalogCsv, metaCatalogFilename } from "../../../../../modules/marketing/meta-catalog";

export const dynamic = "force-dynamic";

/**
 * Exportar catálogo para Meta (Facebook/Instagram Commerce).
 *
 * GET /api/products/export/meta
 *
 * Devuelve un CSV con las columnas del feed de producto de Meta
 * (`id, title, description, availability, condition, price, link, image_link,
 * brand`). `id` es el SKU y `link` apunta a la ficha de la pieza en la tienda.
 *
 * Solo se exportan las piezas publicadas y visibles con imagen (Meta rechaza
 * el feed si falta `image_link`); el resto se informa en `X-Meta-Skipped`.
 * Requiere sesión de ADMIN o MARKETING (mismo permiso que el inventario).
 */
export async function GET(request: Request) {
  try {
    const auth = await authorize("products", "GET");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la exportación del catálogo:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        sku: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        stock: true,
        availability: true,
        imageUrl: true,
        published: true,
        isVisible: true,
      },
    });

    const { csv, included, skipped } = buildMetaCatalogCsv(products, {
      baseUrl: appBaseUrl(new URL(request.url).origin),
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${metaCatalogFilename()}"`,
        "Cache-Control": "no-store",
        "X-Meta-Rows": String(included),
        "X-Meta-Skipped": String(skipped),
      },
    });
  } catch (error) {
    console.error("Error al generar el catálogo para Meta:", error);
    return NextResponse.json(
      { error: "No fue posible generar el catálogo para Meta. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
