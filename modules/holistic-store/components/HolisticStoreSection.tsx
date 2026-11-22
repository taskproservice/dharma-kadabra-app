import { prisma } from "../../../lib/prisma";
import { DEFAULT_CATEGORY, MAX_PRODUCTS_PER_CATEGORY } from "../constants";
import type { CategoryTemplateMap, StoreAvailability, StoreCategory, StoreCurrency, StoreProduct } from "../types";
import { StoreBanner } from "./StoreBanner";
import { StoreExplorer } from "./StoreExplorer";

/** Campos públicos: costo, margen y stock interno jamás salen a la web. */
const PUBLIC_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  imageUrl: true,
  category: true,
  availability: true,
} as const;

type PublicRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  availability: string;
};

function toStoreProduct(row: PublicRow): StoreProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: (row.currency === "USD" ? "USD" : "MXN") as StoreCurrency,
    imageUrl: row.imageUrl,
    category: row.category as StoreCategory,
    availability: (row.availability === "out_of_stock" ? "out_of_stock" : "available") as StoreAvailability,
  };
}

async function getInitialData(): Promise<{
  products: StoreProduct[];
  counts: Record<string, number>;
  templates: CategoryTemplateMap;
}> {
  const fallback = { products: [] as StoreProduct[], counts: {} as Record<string, number>, templates: {} as CategoryTemplateMap };
  try {
    const [rows, grouped, styles] = await Promise.all([
      prisma.product.findMany({
        where: { published: true, category: DEFAULT_CATEGORY },
        select: PUBLIC_SELECT,
        orderBy: [{ availability: "asc" }, { name: "asc" }],
        take: MAX_PRODUCTS_PER_CATEGORY,
      }),
      prisma.product.groupBy({
        by: ["category"],
        where: { published: true },
        _count: { category: true },
      }),
      prisma.storeCategoryStyle.findMany(),
    ]);
    const counts: Record<string, number> = {};
    for (const row of grouped) counts[row.category] = row._count.category;
    const templates: CategoryTemplateMap = {};
    for (const style of styles) {
      if (style.template === "oro" || style.template === "papiro" || style.template === "fuego") {
        templates[style.category] = style.template;
      }
    }
    return { products: rows.map(toStoreProduct), counts, templates };
  } catch (error) {
    console.error("Holistic Store: sin datos iniciales (¿base de datos disponible?):", error);
    return fallback;
  }
}

/**
 * Holistic Store · Sección pública de la tienda.
 * Banner comercial + explorador por categorías. Solo muestra piezas publicadas.
 */
export async function HolisticStoreSection() {
  const { products, counts, templates } = await getInitialData();

  return (
    <section id="tienda-holistica" aria-label="Holistic Store" className="scroll-mt-16 bg-[#121212]">
      <StoreBanner />
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-18">
        <StoreExplorer
          initialCategory={DEFAULT_CATEGORY}
          initialProducts={products}
          initialCounts={counts}
          templates={templates}
        />
      </div>
    </section>
  );
}
