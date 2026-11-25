import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Catálogo del Punto de Venta + Inventario de Holistic Store — 100% Prisma.
 * - GET /api/products → productos de la tabla `Product` (ADMIN, ENGINEER).
 * - POST /api/products → alta de producto (solo ADMIN).
 * - PUT /api/products → edición completa por `id` (solo ADMIN).
 * - DELETE /api/products?id=... → baja de producto (solo ADMIN).
 */

const productSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/i, "El ID solo admite letras, números, guiones y guion bajo."),
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(160),
  description: z.string().trim().max(500).default(""),
  price: z.number().finite().min(0).max(1000000),
  cost: z.number().finite().min(0).max(1000000).default(0),
  profitMargin: z.number().finite().min(0).max(100).default(0),
  currency: z.enum(["MXN", "USD"]).default("MXN"),
  availability: z.enum(["available", "out_of_stock"]).default("available"),
  published: z.boolean().default(false),
  /** Botón de visibilidad del panel de Marketing. */
  isVisible: z.boolean().default(true),
  stock: z.number().int().min(0).max(1000000).default(0),
  imageUrl: z.string().trim().max(500).default(""),
  category: z.string().trim().min(1).max(60),
});

const createSchema = productSchema.extend({
  /** En altas el ID es opcional: si se omite se genera desde el nombre. */
  id: productSchema.shape.id.optional(),
});

function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || `producto-${Date.now().toString(36)}`;
}

/** Margen de utilidad (%) redondeado a 1 decimal. Fuente de verdad: costo y precio. */
function marginFrom(cost: number, price: number): number {
  if (!Number.isFinite(cost) || !Number.isFinite(price) || price <= 0) return 0;
  return Math.round(Math.max(0, ((price - cost) / price) * 100) * 10) / 10;
}

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

export async function POST(request: Request) {
  try {
    const auth = await authorize("products", "POST");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar el alta de producto:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos del producto inválidos." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        id: data.id?.trim() || `${slugify(data.name)}-${Date.now().toString(36)}`,
        name: data.name,
        description: data.description,
        price: data.price,
        cost: data.cost,
        profitMargin: marginFrom(data.cost, data.price),
        currency: data.currency,
        availability: data.stock === 0 ? "out_of_stock" : data.availability,
        published: data.published,
        isVisible: data.isVisible,
        stock: data.stock,
        imageUrl: data.imageUrl,
        category: data.category,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un producto con ese ID. Elige otro." },
        { status: 409 },
      );
    }
    console.error("Error al crear el producto:", error);
    return NextResponse.json(
      { error: "No fue posible crear el producto. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await authorize("products", "PUT");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la edición de producto:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos del producto inválidos." },
      { status: 400 },
    );
  }

  const { id, ...data } = parsed.data;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        cost: data.cost,
        profitMargin: marginFrom(data.cost, data.price),
        currency: data.currency,
        availability: data.stock === 0 ? "out_of_stock" : data.availability,
        published: data.published,
        isVisible: data.isVisible,
        stock: data.stock,
        imageUrl: data.imageUrl,
        category: data.category,
      },
    });
    return NextResponse.json({ product });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "El producto ya no existe." }, { status: 404 });
    }
    console.error("Error al actualizar el producto:", error);
    return NextResponse.json(
      { error: "No fue posible actualizar el producto. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authorize("products", "DELETE");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la baja de producto:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Falta el ID del producto." }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "El producto ya no existe." }, { status: 404 });
    }
    console.error("Error al eliminar el producto:", error);
    return NextResponse.json(
      { error: "No fue posible eliminar el producto. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
