import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { authorize } from "../../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Cobro del Punto de Venta — 100% Prisma.
 * POST /api/pos/checkout { items: [{ productId, title, quantity }] }
 *
 * Las ventas de mostrador se registran como `Purchase` ligadas a un
 * cliente "Mostrador" (upsert por email), para que los KPIs del
 * dashboard (ventas del día, ticket promedio) salgan de datos reales.
 */
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        title: z.string().trim().min(1).max(160),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(100),
});

const MOSTRADOR_EMAIL = "mostrador@dharmakadabra.mx";

export async function POST(request: Request) {
  try {
    const auth = await authorize("pos", "POST");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar el cobro:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "El carrito está vacío o tiene datos inválidos." }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.upsert({
      where: { email: MOSTRADOR_EMAIL },
      update: {},
      create: {
        name: "Cliente Mostrador",
        email: MOSTRADOR_EMAIL,
        passwordHash: "pos-mostador-sin-login",
      },
    });

    // Unidades vendidas por producto, para descontar del inventario.
    const quantities = new Map<string, number>();
    for (const item of parsed.data.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
    const soldIds = [...quantities.keys()];

    const results = await prisma.$transaction([
      ...parsed.data.items.flatMap((item) =>
        Array.from({ length: item.quantity }, () =>
          prisma.purchase.create({
            data: {
              customerId: customer.id,
              productId: item.productId,
              title: item.title,
            },
          }),
        ),
      ),
      // Holistic Store · descuenta el stock vendido (sin dejarlo en negativo)…
      ...soldIds.map((productId) =>
        prisma.product.updateMany({
          where: { id: productId, stock: { gte: quantities.get(productId) ?? 1 } },
          data: { stock: { decrement: quantities.get(productId) ?? 1 } },
        }),
      ),
      // …y marca como agotadas las piezas que llegaron a cero.
      prisma.product.updateMany({
        where: { id: { in: soldIds }, stock: { lte: 0 } },
        data: { availability: "out_of_stock" },
      }),
    ]);

    const totalUnits = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
    const purchases = results.slice(0, totalUnits) as { id: string }[];
    return NextResponse.json(
      { ok: true, purchases: totalUnits, saleId: purchases[0]?.id ?? null },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al registrar la venta del POS:", error);
    return NextResponse.json(
      { error: "No fue posible registrar el cobro. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
