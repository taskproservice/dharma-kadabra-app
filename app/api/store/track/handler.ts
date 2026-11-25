import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { recordProductView } from "../../../../modules/holistic-store/data";

export const dynamic = "force-dynamic";

/**
 * Analítica de Marketing · registro de vista de ficha (público).
 * La tienda llama a este endpoint cuando se muestra una tarjeta real.
 * Nunca expone errores sensibles ni detiene la visita.
 */
const schema = z.object({ productId: z.string().trim().min(1).max(80) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { published: true, isVisible: true },
    });
    if (!product || !product.published || !product.isVisible) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    await recordProductView(parsed.data.productId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al registrar la vista del producto:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
