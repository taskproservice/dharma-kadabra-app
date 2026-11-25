/**
 * Holistic Store · Constantes del módulo.
 *
 * Paleta oficial — Papiro #F7F3EA · Nocturno #121212 · Oro #C5A059 ·
 * Tinta #2E231D · Fuego #D96538.
 */

import type { StoreCategory, StoreTemplateId } from "./types";

/** Máximo de piezas por categoría en el grid público (5 columnas × 7 filas). */
export const MAX_PRODUCTS_PER_CATEGORY = 35;

/** Categoría inicial de la tienda pública. */
export const DEFAULT_CATEGORY: StoreCategory = "Pulseras";

/** Número comercial de WhatsApp (dígitos con código de país). */
export const STORE_WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "";

export const CATEGORY_META: Record<StoreCategory, { symbol: string; tagline: string }> = {
  Pulseras: { symbol: "◈", tagline: "Tejidas a mano, cargadas de intención" },
  Cadenas: { symbol: "✧", tagline: "Medallas y amuletos en dorado" },
  Runas: { symbol: "ᚱ", tagline: "Símbolos ancestrales para tu lectura" },
  Piedras: { symbol: "⬢", tagline: "Cristales y guardianes minerales" },
};

/**
 * Plantilla pastel por defecto para cada categoría cuando el Admin aún no ha
 * guardado una preferencia en `StoreCategoryStyle`. Todas conservan la tarjeta
 * blanca uniforme y solo distinguen el chip superior (beige / salvia / blush).
 */
export const DEFAULT_CATEGORY_TEMPLATES: Record<StoreCategory, StoreTemplateId> = {
  Pulseras: "oro",
  Cadenas: "papiro",
  Runas: "fuego",
  Piedras: "oro",
};

export type TemplateMeta = {
  id: StoreTemplateId;
  name: string;
  description: string;
  swatches: [string, string, string];
};

/** Las 3 plantillas visuales que el Admin asigna por categoría. */
export const STORE_TEMPLATE_META: TemplateMeta[] = [
  {
    id: "oro",
    name: "Oro Clásico",
    description: "Tarjeta nocturna con filetes dorados y precio en oro.",
    swatches: ["#121212", "#C5A059", "#F7F3EA"],
  },
  {
    id: "papiro",
    name: "Papiro Editorial",
    description: "Tarjeta clara sobre papiro con tinta cálida y sello dorado.",
    swatches: ["#F7F3EA", "#2E231D", "#C5A059"],
  },
  {
    id: "fuego",
    name: "Fuego Ritual",
    description: "Tarjeta nocturna con acentos fuego para piezas de poder.",
    swatches: ["#1A0F0B", "#D96538", "#F7F3EA"],
  },
];
