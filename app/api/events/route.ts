import { NextResponse } from "next/server";
import { z } from "zod";
import { products as catalog } from "../../../lib/data/products";
import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(2000),
  date: z.string().min(1),
  productIds: z.array(z.string()).max(30),
});

export async function POST(request: Request) {
  const auth = await authorize("events", "POST");
  if (!auth.ok) return auth.response;

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Completa el título, la descripción y la fecha del evento." }, { status: 400 });
  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "La fecha del evento no es válida." }, { status: 400 });
  const selected = catalog.filter((product) => parsed.data.productIds.includes(product.id));

  for (const product of selected) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { name: product.name, description: product.description, price: product.price, imageUrl: product.imageUrl, category: product.category },
      create: { ...product },
    });
  }

  const event = await prisma.specialEvent.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      date,
      products: { connect: selected.map(({ id }) => ({ id })) },
    },
    include: { products: true },
  });
  return NextResponse.json({ event }, { status: 201 });
}
