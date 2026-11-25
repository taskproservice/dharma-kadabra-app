/**
 * Holistic Store · Acceso a datos del catálogo público.
 *
 * Toda consulta se envuelve en try/catch: la tienda pública NUNCA debe
 * romperse por un problema de base de datos. Si algo falla devolvemos un
 * catálogo de respaldo para que la tienda siga operativa.
 */
import { prisma } from "../../lib/prisma";
import { MAX_PRODUCTS_PER_CATEGORY } from "./constants";
import type {
  CategoryTemplateMap,
  StoreAvailability,
  StoreCategory,
  StoreCurrency,
  StoreProduct,
} from "./types";

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

export type StoreDataError = {
  /** Código corto para logs y para el mensaje de la UI. */
  code: string;
  /** Mensaje listo para mostrarse al visitante. */
  message: string;
  /** Pista técnica (solo se usa en el servidor / en desarrollo). */
  detail?: string;
};

export type StorefrontData = {
  products: StoreProduct[];
  counts: Record<string, number>;
  templates: CategoryTemplateMap;
  error: StoreDataError | null;
};

export type FeaturedStorefrontData = {
  products: StoreProduct[];
  error: StoreDataError | null;
  /** Indica si los productos provienen del fallback estático. */
  isFallback: boolean;
};

export type CatalogStorefrontData = FeaturedStorefrontData & {
  /** Plantillas visuales por categoría asignadas por el Admin. */
  templates: CategoryTemplateMap;
};

/**
 * Catálogo de respaldo: se muestra cuando la base de datos no está disponible,
 * garantizando que la tienda nunca quede en estado de error para el visitante.
 */
export const FALLBACK_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "fallback-cuarzo",
    name: "Pulsera de Cuarzo Natural",
    description: "Claridad y energía positiva en tu día a día.",
    price: 380,
    currency: "MXN",
    imageUrl: "/images/productos/cuarzo-claro.jpg",
    category: "Pulseras",
    availability: "available",
  },
  {
    id: "fallback-medallon-solar",
    name: "Medallón Solar",
    description: "Protección y luz en cada paso.",
    price: 450,
    currency: "MXN",
    imageUrl: "/images/productos/talisman-solar.jpg",
    category: "Cadenas",
    availability: "available",
  },
  {
    id: "fallback-obsidiana",
    name: "Pulsera de Obsidiana",
    description: "Equilibrio y fuerza con intención.",
    price: 420,
    currency: "MXN",
    imageUrl: "/images/productos/amuleto-lunar.jpg",
    category: "Pulseras",
    availability: "available",
  },
  {
    id: "fallback-amatista",
    name: "Drusa de Amatista",
    description: "Armonía y bienestar en tu hogar.",
    price: 680,
    currency: "MXN",
    imageUrl: "/images/productos/set-runas.jpg",
    category: "Piedras",
    availability: "available",
  },
];

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

/** Códigos de error de Prisma que merecen un mensaje distinto al genérico. */
const PRISMA_ERRORS: Record<string, { code: string; message: string }> = {
  P1001: {
    code: "DB_UNREACHABLE",
    message: "No pudimos conectar con el catálogo en este momento. Inténtalo de nuevo en unos segundos.",
  },
  P1002: {
    code: "DB_TIMEOUT",
    message: "El catálogo tardó demasiado en responder. Vuelve a intentarlo.",
  },
  P2021: {
    code: "DB_SCHEMA_MISSING",
    message: "El catálogo aún no está inicializado. Ejecuta el seed de productos para publicarlo.",
  },
  P2022: {
    code: "DB_SCHEMA_MISMATCH",
    message: "El catálogo necesita una actualización. Contacta al equipo técnico.",
  },
};

/**
 * Traduce cualquier excepción a un `StoreDataError` legible.
 * En servidor se registra el detalle completo; al cliente solo le llega
 * un mensaje claro (nunca la cadena de conexión ni el stack).
 */
export function normalizeStoreError(error: unknown, context: string): StoreDataError {
  const rawCode =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : "";
  const errorName = error instanceof Error ? error.name : "";
  const detail = error instanceof Error ? error.message : String(error);

  // Sin DATABASE_URL o con la base caída Prisma lanza
  // `PrismaClientInitializationError` SIN `code`: se mapea aparte.
  const isInitialization =
    errorName === "PrismaClientInitializationError" ||
    /Environment variable not found: DATABASE_URL|Can't reach database server/i.test(detail);

  const mapped = isInitialization
    ? {
        code: "DB_UNCONFIGURED",
        message:
          "El catálogo no está conectado todavía. Muy pronto estará disponible; mientras tanto puedes escribirnos.",
      }
    : rawCode
      ? PRISMA_ERRORS[rawCode]
      : undefined;

  console.error(`[Holistic Store] ${context}:`, error);

  return {
    code: mapped?.code ?? (rawCode || "STORE_UNAVAILABLE"),
    message:
      mapped?.message ??
      "No pudimos cargar la tienda en este momento. Vuelve a intentarlo en unos segundos.",
    detail: process.env.NODE_ENV === "production" ? undefined : detail,
  };
}

/**
 * Datos iniciales de la tienda: primera categoría + conteos por categoría +
 * plantillas visuales asignadas por el Admin.
 */
export async function getStorefrontData(
  category: StoreCategory,
  limit = MAX_PRODUCTS_PER_CATEGORY,
): Promise<StorefrontData> {
  const empty: StorefrontData = { products: [], counts: {}, templates: {}, error: null };

  try {
    const [rows, grouped, styles] = await Promise.all([
      prisma.product.findMany({
        where: { published: true, isVisible: true, category },
        select: PUBLIC_SELECT,
        orderBy: [{ availability: "asc" }, { name: "asc" }],
        take: limit,
      }),
      prisma.product.groupBy({
        by: ["category"],
        where: { published: true, isVisible: true },
        _count: { category: true },
      }),
      prisma.storeCategoryStyle.findMany().catch(() => []),
    ]);

    const counts: Record<string, number> = {};
    for (const row of grouped) counts[row.category] = row._count?.category ?? 0;

    const templates: CategoryTemplateMap = {};
    for (const style of styles) {
      if (style.template === "oro" || style.template === "papiro" || style.template === "fuego") {
        templates[style.category] = style.template;
      }
    }

    return { products: rows.map(toStoreProduct), counts, templates, error: null };
  } catch (error) {
    const normalized = normalizeStoreError(error, `no se pudieron leer los productos de ${category}`);
    // Fallback: muestra catálogo estático para que la tienda nunca quede rota.
    const fallback = FALLBACK_STORE_PRODUCTS.filter((p) => p.category === category);
    const fallbackCounts: Record<string, number> = {};
    for (const p of FALLBACK_STORE_PRODUCTS) {
      fallbackCounts[p.category] = (fallbackCounts[p.category] ?? 0) + 1;
    }
    return {
      products: fallback.length > 0 ? fallback : FALLBACK_STORE_PRODUCTS,
      counts: fallbackCounts,
      templates: {},
      error: normalized,
    };
  }
}

/**
 * Productos destacados/publicados para la portada de la tienda.
 * Devuelve hasta `limit` productos publicados y visibles de cualquier categoría.
 * En caso de error de DB, retorna un catálogo de respaldo (nunca rompe la página).
 */
export async function getFeaturedStoreProducts(limit = 8): Promise<FeaturedStorefrontData> {
  try {
    const rows = await prisma.product.findMany({
      where: { published: true, isVisible: true },
      select: PUBLIC_SELECT,
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });

    if (rows.length === 0) {
      return { products: FALLBACK_STORE_PRODUCTS.slice(0, limit), error: null, isFallback: true };
    }

    return { products: rows.map(toStoreProduct), error: null, isFallback: false };
  } catch (error) {
    const normalized = normalizeStoreError(
      error,
      "no se pudieron leer los productos destacados de la tienda",
    );
    return {
      products: FALLBACK_STORE_PRODUCTS.slice(0, limit),
      error: normalized,
      isFallback: true,
    };
  }
}

/**
 * Catálogo completo de la tienda pública (todas las categorías): productos
 * publicados y visibles, más la plantilla visual por categoría. En caso de
 * error de DB devuelve el catálogo de respaldo y `error` normalizado, de
 * modo que la página nunca se rompe.
 */
export async function getStorefrontCatalog(
  limit = MAX_PRODUCTS_PER_CATEGORY,
): Promise<CatalogStorefrontData> {
  try {
    const [rows, styles] = await Promise.all([
      prisma.product.findMany({
        where: { published: true, isVisible: true },
        select: PUBLIC_SELECT,
        orderBy: [{ createdAt: "desc" }],
        take: limit,
      }),
      prisma.storeCategoryStyle.findMany().catch(() => []),
    ]);

    const templates: CategoryTemplateMap = {};
    for (const style of styles) {
      if (style.template === "oro" || style.template === "papiro" || style.template === "fuego") {
        templates[style.category] = style.template;
      }
    }

    if (rows.length === 0) {
      return { products: FALLBACK_STORE_PRODUCTS, error: null, isFallback: true, templates };
    }

    return { products: rows.map(toStoreProduct), error: null, isFallback: false, templates };
  } catch (error) {
    const normalized = normalizeStoreError(
      error,
      "no se pudo leer el catálogo completo de la tienda",
    );
    return { products: FALLBACK_STORE_PRODUCTS, error: normalized, isFallback: true, templates: {} };
  }
}

/** Productos publicados de una categoría (usado por la API pública). */
export async function getPublishedProducts(category: StoreCategory, limit = MAX_PRODUCTS_PER_CATEGORY) {
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, isVisible: true, category },
      select: PUBLIC_SELECT,
      orderBy: [{ availability: "asc" }, { name: "asc" }],
      take: limit,
    }),
    prisma.product.count({ where: { published: true, isVisible: true, category } }),
  ]);

  return { products: rows.map(toStoreProduct), total };
}

/* -------------------------------------------------------------------------- */
/*  Analítica de Marketing · visitas y productos más vistos                    */
/* -------------------------------------------------------------------------- */

/** Registra una visita a la tienda pública. Nunca debe romper la página. */
export async function recordStoreVisit(path = "/tienda"): Promise<boolean> {
  try {
    await prisma.storeVisit.create({ data: { path } });
    return true;
  } catch (error) {
    console.error("[Holistic Store] no se pudo registrar la visita:", error);
    return false;
  }
}

/** Registra la vista de una ficha de producto (desde la tienda pública). */
export async function recordProductView(productId: string): Promise<boolean> {
  if (!productId) return false;
  try {
    await prisma.productView.create({ data: { productId } });
    return true;
  } catch (error) {
    console.error("[Holistic Store] no se pudo registrar la vista del producto:", error);
    return false;
  }
}

export type AnalyticsSummary = {
  totalVisits: number;
  visitsLast7Days: number;
  topProducts: { id: string; name: string; views: number }[];
};

/**
 * Resumen para el Panel de Marketing: visitas acumuladas y las 5 piezas más
 * vistas. Si la base de datos falla, devuelve ceros (nunca cifras inventadas).
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = { totalVisits: 0, visitsLast7Days: 0, topProducts: [] };
  try {
    const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const [totalVisits, visitsLast7Days, grouped] = await Promise.all([
      prisma.storeVisit.count(),
      prisma.storeVisit.count({ where: { visitedAt: { gte: since } } }),
      prisma.productView.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      }),
    ]);

    const ids = grouped.map((row) => row.productId);
    const products = ids.length
      ? await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
      : [];
    const nameById = new Map(products.map((product) => [product.id, product.name]));
    const topProducts = grouped.map((row) => ({
      id: row.productId,
      name: nameById.get(row.productId) ?? "Producto eliminado",
      views: row._count.productId,
    }));

    return { totalVisits, visitsLast7Days, topProducts };
  } catch (error) {
    console.error("[Holistic Store] no se pudo calcular la analítica:", error);
    return empty;
  }
}
