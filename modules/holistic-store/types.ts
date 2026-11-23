/**
 * Holistic Store · Tipos del módulo comercial.
 *
 * La tienda pública consume `StoreProduct` (sin costo ni margen: esos datos
 * son exclusivos del panel administrativo y nunca se exponen en la API pública).
 */

export const STORE_CATEGORIES = ["Pulseras", "Cadenas", "Runas", "Piedras"] as const;
export type StoreCategory = (typeof STORE_CATEGORIES)[number];

/** Monedas soportadas por la tienda. */
export type StoreCurrency = "MXN" | "USD";

/** Disponibilidad de una pieza. */
export type StoreAvailability = "available" | "out_of_stock";

/** Plantillas visuales de tarjeta (las asigna el Admin por categoría). */
export const STORE_TEMPLATES = ["oro", "papiro", "fuego"] as const;
export type StoreTemplateId = (typeof STORE_TEMPLATES)[number];

/** Producto tal como lo ve la tienda pública. */
export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: StoreCurrency;
  imageUrl: string;
  category: StoreCategory;
  availability: StoreAvailability;
};

/** Producto completo para el panel administrativo (incluye datos de costo). */
export type AdminProduct = StoreProduct & {
  cost: number;
  profitMargin: number;
  published: boolean;
  /** Botón de visibilidad del panel de Marketing. */
  isVisible: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryTemplateMap = Record<string, StoreTemplateId>;

export function isStoreCategory(value: string): value is StoreCategory {
  return (STORE_CATEGORIES as readonly string[]).includes(value);
}

export function isStoreTemplate(value: string): value is StoreTemplateId {
  return (STORE_TEMPLATES as readonly string[]).includes(value);
}
