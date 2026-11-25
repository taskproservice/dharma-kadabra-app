import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { authorize } from "../../../../lib/rbac";
import {
  STORE_CATEGORIES,
  STORE_TEMPLATES,
  type StoreTemplateId,
} from "../../../../modules/holistic-store/types";

export const dynamic = "force-dynamic";

/**
 * Plantillas visuales por categoría de Holistic Store.
 * - GET (público): mapa categoría → plantilla para la tienda.
 * - PUT (solo ADMIN): asigna plantillas; body { styles: [{ category, template }] }.
 */
export async function GET() {
  try {
    const styles = await prisma.storeCategoryStyle.findMany();
    const map: Record<string, StoreTemplateId> = {};
    for (const style of styles) {
      if ((STORE_TEMPLATES as readonly string[]).includes(style.template)) {
        map[style.category] = style.template as StoreTemplateId;
      }
    }
    return NextResponse.json({ styles: map });
  } catch (error) {
    console.error("Error al consultar plantillas de la tienda:", error);
    return NextResponse.json({ styles: {} });
  }
}

const templatesSchema = z.object({
  styles: z
    .array(
      z.object({
        category: z.enum(STORE_CATEGORIES),
        template: z.enum(STORE_TEMPLATES),
      }),
    )
    .min(1)
    .max(STORE_CATEGORIES.length),
});

export async function PUT(request: Request) {
  try {
    const auth = await authorize("store", "PUT");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar plantillas de la tienda:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const parsed = templatesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos: revisa categorías y plantillas." }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      parsed.data.styles.map((style) =>
        prisma.storeCategoryStyle.upsert({
          where: { category: style.category },
          update: { template: style.template },
          create: { category: style.category, template: style.template },
        }),
      ),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al guardar plantillas de la tienda:", error);
    return NextResponse.json(
      { error: "No fue posible guardar las plantillas. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
