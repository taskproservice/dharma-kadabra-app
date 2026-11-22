/**
 * Holistic Store · Constantes del módulo.
 *
 * Paleta oficial Papyrus (Light Mode) — Papiro #F4EFE6 · Superficie #FCFAF5 ·
 * Oro #C5A059 · Carbón #1A1A1A · Fuego #D96538.
 */

import type { StoreCategory, StoreTemplateId } from "./types";

export const STORE_PALETTE = {
  papiro: "#F4EFE6",
  superficie: "#FCFAF5",
  nocturno: "#F4EFE6",
  oro: "#C5A059",
  tinta: "#1A1A1A",
  fuego: "#D96538",
} as const;

/** Máximo de piezas por categoría en el grid público (5 columnas × 7 filas). */
export const MAX_PRODUCTS_PER_CATEGORY = 35;

/** Categoría inicial de la tienda pública. */
export const DEFAULT_CATEGORY: StoreCategory = "Pulseras";

/** Número comercial de WhatsApp (dígitos con código de país). */
export const STORE_WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "";

export type StoreBannerSlide = {
  src: string;
  alt: string;
  symbol: string;
  kicker: string;
  title: string;
  accent: string;
  text: string;
};

export const STORE_BANNERS: StoreBannerSlide[] = [
  {
    src: "/images/store-banner/banner-pulseras.jpg",
    alt: "Colección de pulseras artesanales con piedras naturales",
    symbol: "◈",
    kicker: "Colección · Pulseras",
    title: "Pulseras que",
    accent: "protegen tu energía.",
    text: "Obsidiana, cuarzo y ámbar tejidos a mano para acompañar tu día con intención.",
  },
  {
    src: "/images/store-banner/banner-cadenas.jpg",
    alt: "Cadenas y collares dorados con amuletos y medallas",
    symbol: "✧",
    kicker: "Colección · Cadenas",
    title: "Cadenas con",
    accent: "intención sagrada.",
    text: "Medallas, lunas y soles en dorado: piezas que visten tu cuello y tu propósito.",
  },
  {
    src: "/images/store-banner/banner-piedras.jpg",
    alt: "Piedras y cristales naturales sobre papiro",
    symbol: "⬢",
    kicker: "Colección · Piedras",
    title: "Piedras vivas",
    accent: "para tu altar.",
    text: "Cuarzos, amatistas y guardianes minerales elegidos para tus rituales.",
  },
];

export const CATEGORY_META: Record<StoreCategory, { symbol: string; tagline: string }> = {
  Pulseras: { symbol: "◈", tagline: "Tejidas a mano, cargadas de intención" },
  Cadenas: { symbol: "✧", tagline: "Medallas y amuletos en dorado" },
  Runas: { symbol: "ᚱ", tagline: "Símbolos ancestrales para tu lectura" },
  Piedras: { symbol: "⬢", tagline: "Cristales y guardianes minerales" },
};

export type TemplateMeta = {
  id: StoreTemplateId;
  name: string;
  description: string;
  swatches: [string, string, string];
};

/** Las 3 plantillas visuales sobre superficie cálida Papiro (#FCFAF5) que el Admin asigna por categoría. */
export const STORE_TEMPLATE_META: TemplateMeta[] = [
  {
    id: "oro",
    name: "Oro Clásico",
    description: "Tarjeta cálida papiro con filetes dorados y tipografía oscura.",
    swatches: ["#FCFAF5", "#C5A059", "#1A1A1A"],
  },
  {
    id: "papiro",
    name: "Papiro Editorial",
    description: "Tarjeta orgánica con tinta carbón profunda y sello dorado.",
    swatches: ["#FCFAF5", "#2C2C2C", "#9E7B2F"],
  },
  {
    id: "fuego",
    name: "Fuego Ritual",
    description: "Tarjeta cálida papiro con acentos terracota para piezas de poder.",
    swatches: ["#FCFAF5", "#D96538", "#1A1A1A"],
  },
];
