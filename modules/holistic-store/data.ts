/**
 * Holistic Store · Acceso a datos del catálogo público.
 *
 * Toda consulta se envuelve en try/catch: la tienda pública NUNCA debe
 * romperse por un problema de base de datos. Si algo falla devolvemos un
 * `StoreDataError` descriptivo y la UI muestra una pantalla de error elegante
 * con opción de reintentar.
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
        where: { published: true, category },
        select: PUBLIC_SELECT,
        orderBy: [{ availability: "asc" }, { name: "asc" }],
        take: limit,
      }),
      prisma.product.groupBy({
        by: ["category"],
        where: { published: true },
        _count: { category: true },
      }),
      prisma.storeCategoryStyle.findMany().catch(() => []),
    ]);

    const counts: Record<string, number> = {};
    for (const row of grouped) counts[row.category] = row._count.category;

    const templates: CategoryTemplateMap = {};
    for (const style of styles) {
      if (style.template === "oro" || style.template === "papiro" || style.template === "fuego") {
        templates[style.category] = style.template;
      }
    }

    return { products: rows.map(toStoreProduct), counts, templates, error: null };
  } catch (error) {
    return {
      ...empty,
      error: normalizeStoreError(error, `no se pudieron leer los productos de ${category}`),
    };
  }
}

/** Productos publicados de una categoría (usado por la API pública). */
export async function getPublishedProducts(category: StoreCategory, limit = MAX_PRODUCTS_PER_CATEGORY) {
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, category },
      select: PUBLIC_SELECT,
      orderBy: [{ availability: "asc" }, { name: "asc" }],
      take: limit,
    }),
    prisma.product.count({ where: { published: true, category } }),
  ]);

  return { products: rows.map(toStoreProduct), total };
}
