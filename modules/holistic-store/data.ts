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
  sku: true,
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
  sku: string;
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

export type CatalogStorefrontData = {
  products: StoreProduct[];
  error: StoreDataError | null;
  /** Indica si los productos provienen del fallback estático. */
  isFallback: boolean;
  /** Plantillas visuales por categoría asignadas por el Admin. */
  templates: CategoryTemplateMap;
};

/**
 * Catálogo de respaldo: se muestra cuando la base de datos no está disponible,
 * garantizando que la tienda nunca quede en estado de error para el visitante.
 */
export const FALLBACK_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "pulsera-ojo-de-tigre",
    name: "Pulsera de Ojo de Tigre",
    description: "Piedra volcánica dorada con destellos ámbar. Protección, valor y claridad.",
    price: 450,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-1.jpg",
    category: "Pulseras",
    sku: "PUL-001",
    availability: "available",
  },
  {
    id: "pulsera-ojo-de-tigre-turquesa",
    name: "Pulsera de Ojo de Tigre con Turquesa",
    description: "El ánimo del tigre unido a la voz serena de la turquesa.",
    price: 520,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-2.jpg",
    category: "Pulseras",
    sku: "PUL-002",
    availability: "available",
  },
  {
    id: "pulsera-ojo-de-tigre-coral",
    name: "Pulsera de Ojo de Tigre con Coral Rojo",
    description: "Vitalidad ardiente entre cuentas doradas. El coral despierta la sangre.",
    price: 540,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-3.jpg",
    category: "Pulseras",
    sku: "PUL-003",
    availability: "available",
  },
  {
    id: "pulsera-ojo-de-tigre-lapislazuli",
    name: "Pulsera de Ojo de Tigre con Lapislázuli",
    description: "Verdad interior y cielo profundo. Intuición y soberanía.",
    price: 560,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-4.jpg",
    category: "Pulseras",
    sku: "PUL-004",
    availability: "available",
  },
  {
    id: "pulsera-ojo-de-tigre-cuarzo",
    name: "Pulsera de Ojo de Tigre con Cuarzo Champagne",
    description: "Luz suave y claridad absoluta. El cuarzo amplifica la intención del tigre.",
    price: 580,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-5.jpg",
    category: "Pulseras",
    sku: "PUL-005",
    availability: "available",
  },
  {
    id: "pulsera-ojo-de-tigre-pluma",
    name: "Pulsera de Ojo de Tigre con Pluma de Plata",
    description: "La pluma guía; el tigre protege. Un camino ligero y firme.",
    price: 620,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-6.jpg",
    category: "Pulseras",
    sku: "PUL-006",
    availability: "available",
  },
  {
    id: "pulsera-ojo-de-tigre-san-benito",
    name: "Pulsera de Ojo de Tigre con Medalla de San Benito",
    description: "Fe ancestral y piedra de poder. Un escudo dorado contra la sombra.",
    price: 650,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-7.jpg",
    category: "Pulseras",
    sku: "PUL-007",
    availability: "available",
  },
  {
    id: "pulsera-triple-proteccion",
    name: "Pulsera de Protección Triple",
    description: "Ojo de tigre, ágata roja y ónix. Tres guardianes en una sola trama.",
    price: 680,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-8.jpg",
    category: "Pulseras",
    sku: "PUL-008",
    availability: "available",
  },
  {
    id: "pulsera-roja-nudo-celta",
    name: "Pulsera Roja del Nudo Celta",
    description: "El hilo rojo ata la fortuna. Nudo eterno de la suerte, la salud y el amor.",
    price: 480,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-9.jpg",
    category: "Pulseras",
    sku: "PUL-009",
    availability: "available",
  },
  {
    id: "pulsera-ojo-de-tigre-citrino",
    name: "Pulsera de Ojo de Tigre con Citrino",
    description: "Abundancia que amanece entre cuentas doradas. Citrino y tigre atraen prosperidad.",
    price: 590,
    currency: "MXN",
    imageUrl: "/images/products/pulsera-10.jpg",
    category: "Pulseras",
    sku: "PUL-010",
    availability: "available",
  },
  {
    id: "collar-cuarzo-esmerilado-om",
    name: "Collar de Cuarzo Esmerilado y Om de Plata",
    description: "Cuentas de cuarzo esmerilado consagradas con el mantra Om en plata antigua.\nSerena la mente, purifica el aura y ancla la vibración de paz en el pecho.",
    price: 680,
    currency: "MXN",
    imageUrl: "/images/products/cadena-1.jpg",
    category: "Cadenas",
    sku: "CAD-001",
    availability: "available",
  },
  {
    id: "mala-tibetano-granate-carmesi",
    name: "Mala Tibetano de Granate y Borla Carmesí",
    description: "Cuentas de granate profundo con sellos tibetanos en oro y borla ritual carmesí.\nEnciende la fuerza vital, custodia tus meditaciones y disipa toda densidad.",
    price: 790,
    currency: "MXN",
    imageUrl: "/images/products/cadena-2.jpg",
    category: "Cadenas",
    sku: "CAD-002",
    availability: "available",
  },
  {
    id: "collar-amatista",
    name: "Collar de Amatista",
    description: "Punta natural de amatista engarzada en cobre sobre semillas y piedras de tierra.\nTransmuta la energía densa, despierta la intuición y protege tu campo espiritual.",
    price: 820,
    currency: "MXN",
    imageUrl: "/images/products/cadena-3.jpg",
    category: "Cadenas",
    sku: "CAD-003",
    availability: "available",
  },
  {
    id: "collar-mala-loto-sagrado",
    name: "Collar Mala del Loto Sagrado",
    description: "Rosario oriental de cuentas oscuras con cuenta gurú de turquesa y coral.\nGuía la respiración consciente y sella un círculo de calma alrededor del alma.",
    price: 760,
    currency: "MXN",
    imageUrl: "/images/products/cadena-4.jpg",
    category: "Cadenas",
    sku: "CAD-004",
    availability: "available",
  },
  {
    id: "cadena-dorada-cuarzo-cristal",
    name: "Cadena Dorada con Punta de Cuarzo Cristal",
    description: "Cristal maestro de cuarzo transparente suspendido entre nácar blanco y cuentas doradas.\nAmplifica tus intenciones, ilumina el corazón y eleva tu frecuencia vital.",
    price: 850,
    currency: "MXN",
    imageUrl: "/images/products/cadena-5.jpg",
    category: "Cadenas",
    sku: "CAD-005",
    availability: "available",
  },
  {
    id: "collar-turmalina-negra-perla",
    name: "Collar de Turmalina Negra y Perla Solar",
    description: "Turmalina negra en bruto bañada en oro junto a perla, lava volcánica y ojo de tigre.\nEscudo supremo de arraigo y protección contra envidias y cargas ajenas.",
    price: 880,
    currency: "MXN",
    imageUrl: "/images/products/cadena-6.jpg",
    category: "Cadenas",
    sku: "CAD-006",
    availability: "available",
  },
  {
    id: "collar-cuarzo-medallon-om",
    name: "Collar de Cuarzo Maestro y Medallón Om",
    description: "Esferas de cristal de roca tejidas en hilo rojo con medallón tibetano de turquesa.\nArmoniza los centros de energía y atrae claridad luminosa a tu propósito.",
    price: 780,
    currency: "MXN",
    imageUrl: "/images/products/cadena-7.jpg",
    category: "Cadenas",
    sku: "CAD-007",
    availability: "available",
  },
  {
    id: "collar-sodalita-real-sandalo",
    name: "Collar de Sodalita Real y Sándalo",
    description: "Obelisco natural de sodalita azul entre madera sagrada y piedras de sabiduría.\nAbre la visión interior, templa la palabra y conecta con la verdad profunda.",
    price: 840,
    currency: "MXN",
    imageUrl: "/images/products/cadena-8.jpg",
    category: "Cadenas",
    sku: "CAD-008",
    availability: "available",
  },
  {
    id: "cadena-luz-lunar-cuarzo",
    name: "Cadena de Luz Lunar con Cuarzo Blanco",
    description: "Destellos facetados y cuentas blancas que abrazan una punta pura de cuarzo.\nRenueva la serenidad emocional y envuelve tu presencia en luz cristalina.",
    price: 720,
    currency: "MXN",
    imageUrl: "/images/products/cadena-9.jpg",
    category: "Cadenas",
    sku: "CAD-009",
    availability: "available",
  },
  {
    id: "collar-ojo-de-tigre-san-benito",
    name: "Collar de Ojo de Tigre y San Benito",
    description: "Cuentas de ojo de tigre y destellos dorados coronados por la medalla de San Benito.\nTalismán consagrado de custodia espiritual, firmeza y bendición en tu camino.",
    price: 650,
    currency: "MXN",
    imageUrl: "/images/products/cadena-10.jpg",
    category: "Cadenas",
    sku: "CAD-010",
    availability: "available",
  },
];

function toStoreProduct(row: PublicRow): StoreProduct {
  return {
    id: row.id,
    sku: row.sku,
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
