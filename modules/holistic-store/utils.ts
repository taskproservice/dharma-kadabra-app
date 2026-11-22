/**
 * Holistic Store · Funciones de formato y utilidades comerciales.
 */

import type { StoreCurrency } from "./types";

/**
 * Formatea un precio con su moneda usando `Intl.NumberFormat`.
 * Ejemplos: "$350.00 MXN" · "$28.00 USD".
 */
export function formatPrice(value: number, currency: StoreCurrency | string): string {
  const normalized: StoreCurrency = currency === "USD" ? "USD" : "MXN";
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: normalized,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
  return `${formatted} ${normalized}`;
}

/**
 * Construye la URL de WhatsApp para consultar por un producto.
 * Incluye ID, nombre y precio con su moneda en el mensaje.
 */
export function buildWhatsAppUrl(
  product: { id: string; name: string; price: number; currency: StoreCurrency | string },
  phone?: string | null,
): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const message =
    `Hola, me interesa este producto de Holistic Store:\n` +
    `• ID: ${product.id}\n` +
    `• Producto: ${product.name}\n` +
    `• Precio: ${formatPrice(product.price, product.currency)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Construye la URL de WhatsApp para la transferencia a humano (Paola)
 * desde el chat de Cozy. El mensaje incluye la pieza que se estaba
 * consultando para que la asesora tenga todo el contexto.
 */
export function buildHandoffWhatsAppUrl(
  product: { name: string } | null | undefined,
  phone?: string | null,
): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const message = product
    ? `Hola Paola, vengo de la tienda. Estaba hablando con Cozy sobre la pieza ${product.name} y me gustaría confirmar mi compra / hablar con un asesor.`
    : `Hola Paola, vengo de la tienda. Estaba hablando con Cozy y me gustaría hablar con un asesor.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Calcula el margen de utilidad (%) a partir de costo y precio de venta.
 * Margen = (precio − costo) / precio × 100.
 */
export function calcMargin(cost: number, price: number): number {
  if (!Number.isFinite(cost) || !Number.isFinite(price) || price <= 0) return 0;
  return Math.max(0, ((price - cost) / price) * 100);
}

/**
 * Calcula el precio de venta sugerido a partir de costo y margen deseado (%).
 * Precio = costo / (1 − margen/100).
 */
export function calcPriceFromMargin(cost: number, margin: number): number {
  if (!Number.isFinite(cost) || cost < 0) return 0;
  if (!Number.isFinite(margin) || margin <= 0) return cost;
  if (margin >= 100) return cost;
  return cost / (1 - margin / 100);
}
