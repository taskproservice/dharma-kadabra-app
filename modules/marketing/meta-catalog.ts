/**
 * Catálogo para Meta Commerce Manager (Facebook/Instagram).
 *
 * Genera el CSV que se sube a Meta Commerce Manager con las columnas del
 * feed de producto: id, title, description, availability, condition, price,
 * link, image_link y brand. `id` es el SKU de la pieza, que es el
 * identificador con el que Meta sincroniza el catálogo.
 *
 * Este módulo es puro (sin Prisma ni red) para poder probarlo con node:test.
 */

/** Columnas exactas del feed de producto de Meta. */
export const META_CATALOG_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
] as const;

/** Campos de un producto que entran al catálogo. */
export type MetaCatalogProduct = {
  /** SKU único de la pieza (identificador de Meta). */
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  availability: string;
  imageUrl: string;
  published: boolean;
  isVisible: boolean;
};

export type MetaCatalogOptions = {
  /** Origen público del sitio (ej. "https://dharmakadabra.mx"), sin "/" final. */
  baseUrl: string;
  brand?: string;
};

export type MetaCatalogResult = {
  /** Contenido CSV (UTF-8, encabezado + una fila por producto). */
  csv: string;
  /** Productos incluidos en el archivo. */
  included: number;
  /** Productos omitidos (ocultos, no publicados o sin imagen, que Meta rechaza). */
  skipped: number;
};

/** Meta solo acepta estas dos disponibilidades en el feed. */
function metaAvailability(product: MetaCatalogProduct): "in stock" | "out of stock" {
  return product.stock <= 0 || product.availability === "out_of_stock" ? "out of stock" : "in stock";
}

/** Precio con el formato que espera Meta: "450.00 MXN". */
function metaPrice(product: MetaCatalogProduct): string {
  const amount = (Number.isFinite(product.price) ? Math.max(0, product.price) : 0).toFixed(2);
  const currency = /^[A-Z]{3}$/.test(product.currency) ? product.currency : "MXN";
  return `${amount} ${currency}`;
}

/** Escapa un valor según RFC 4180 (comillas dobles, comas y saltos de línea). */
function csvCell(value: string): string {
  const text = value.replace(/\r\n?/g, "\n");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** URL absoluta: respeta los enlaces que ya lo son y resuelve las rutas locales. */
function absoluteUrl(url: string, baseUrl: string): string {
  const value = url.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}

/**
 * Un producto entra al feed de Meta solo si es comprable en la tienda:
 * publicado, visible e con imagen (Meta exige `image_link`).
 */
function isEligible(product: MetaCatalogProduct): boolean {
  return Boolean(product.published && product.isVisible && product.imageUrl.trim() && product.sku.trim());
}

/**
 * Construye el CSV del catálogo para Meta Commerce Manager.
 *
 * @param products Productos del inventario (tabla `Product`).
 * @param options  Origen público del sitio y marca del feed.
 */
export function buildMetaCatalogCsv(
  products: MetaCatalogProduct[],
  options: MetaCatalogOptions,
): MetaCatalogResult {
  const brand = (options.brand ?? "Dharma Kadabra").trim() || "Dharma Kadabra";
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const rows: string[] = [META_CATALOG_COLUMNS.join(",")];
  let skipped = 0;

  for (const product of products) {
    if (!isEligible(product)) {
      skipped += 1;
      continue;
    }
    const link = `${baseUrl}/tienda#producto-${encodeURIComponent(product.sku)}`;
    const cells = [
      product.sku.trim().toUpperCase(),
      product.name,
      product.description,
      metaAvailability(product),
      "new",
      metaPrice(product),
      link,
      absoluteUrl(product.imageUrl, baseUrl),
      brand,
    ];
    rows.push(cells.map(csvCell).join(","));
  }

  return { csv: `${rows.join("\n")}\n`, included: rows.length - 1, skipped };
}

/** Nombre del archivo descargado (fechado para no sobrescribir versiones). */
export function metaCatalogFilename(date: Date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `catalogo-meta-${stamp}.csv`;
}
