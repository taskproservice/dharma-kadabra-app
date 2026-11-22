/**
 * Cozy · Tipos compartidos entre el widget, el store y la API.
 *
 * `CozyProductContext` es el contexto de la pieza que el visitante está
 * consultando (lo fija el botón de la tarjeta de producto). La API lo usa
 * para inyectar los datos reales de la pieza en el prompt del sistema.
 */

export type CozyProductContext = {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  availability: "available" | "out_of_stock";
  description?: string;
  imageUrl?: string;
};

export type CozyRole = "user" | "assistant";

export type CozyApiMessage = {
  role: CozyRole;
  content: string;
};

/** Respuesta de `POST /api/cozy`. */
export type CozyApiResponse = {
  reply: string;
  /** `true` cuando el cliente debe mostrar el botón de WhatsApp con Paola. */
  handoff: boolean;
};
