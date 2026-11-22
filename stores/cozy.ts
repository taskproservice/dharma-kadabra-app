/**
 * Cozy · Estado global del widget flotante (Zustand).
 *
 * - `isOpen`: si el widget está visible (lo abre el botón de la tarjeta).
 * - `productContext`: la pieza que se está consultando (la fija
 *   `openWithProduct` desde `ProductCard` / `WhatsAppButton`).
 * - `messages` / `isTyping`: la conversación (persiste al navegar entre
 *   la landing y la tienda porque vive fuera del componente).
 * - `handoffReady`: cuando el cliente debe mostrar el botón de WhatsApp
 *   con Paola (click en "Hablar con un asesor humano", intención detectada
 *   en el texto o `handoff: true` de la API).
 */

import { create } from "zustand";
import { buildProductInquiry, detectHandoffIntent } from "../lib/cozy/agent";
import type { CozyProductContext } from "../lib/cozy/types";

export type CozyMessage = {
  id: number;
  from: "cozy" | "user";
  text: string;
  time: string;
};

const WELCOME: CozyMessage[] = [
  { id: 1, from: "cozy", text: "Hola, alma bonita. Soy Cozy, la llama que te acompaña en Dharma Kadabra. 🔥", time: "Ahora" },
  { id: 2, from: "cozy", text: "Estoy aquí para escucharte y ayudarte a encontrar el talismán, la lectura o el ritual que tu camino necesita hoy.", time: "Ahora" },
  { id: 3, from: "cozy", text: "¿Qué te gustaría explorar?", time: "Ahora" },
];

const ERROR_REPLY =
  "Ay, tuve un tropiezo por aquí. 🔥 Inténtalo de nuevo en un momento o, si prefieres, habla directo con Paola por WhatsApp.";

let idCounter = WELCOME.length + 1;

function nextId() {
  return idCounter++;
}

function now() {
  return new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function userMessage(text: string): CozyMessage {
  return { id: nextId(), from: "user", text, time: now() };
}

function cozyMessage(text: string): CozyMessage {
  return { id: nextId(), from: "cozy", text, time: now() };
}

type CozyState = {
  isOpen: boolean;
  productContext: CozyProductContext | null;
  /** ID del producto cuya consulta inicial ya se envió (evita duplicados). */
  inquiredProductId: string | null;
  messages: CozyMessage[];
  isTyping: boolean;
  handoffReady: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  openWithProduct: (product: CozyProductContext) => void;
  clearProductContext: () => void;
  sendMessage: (text: string) => Promise<void>;
  requestHuman: () => void;
  resetConversation: () => void;
  processQueue: () => Promise<void>;
};

export const useCozyStore = create<CozyState>((set, get) => ({
  isOpen: false,
  productContext: null,
  inquiredProductId: null,
  messages: WELCOME,
  isTyping: false,
  handoffReady: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  openWithProduct: (product) => {
    const { inquiredProductId, messages } = get();
    const alreadyAsked =
      inquiredProductId === product.id && messages.some((message) => message.from === "user");

    set({ productContext: product, isOpen: true });

    if (!alreadyAsked) {
      set({ inquiredProductId: product.id });
      void get().sendMessage(buildProductInquiry(product));
    }
  },

  clearProductContext: () => set({ productContext: null }),

  sendMessage: async (text) => {
    const clean = text.trim();
    if (!clean) return;

    set((state) => ({
      messages: [...state.messages, userMessage(clean)],
      // Detección en cliente: si pide humano o muestra frustración, el
      // botón de WhatsApp aparece al instante (sin esperar a la API).
      handoffReady: state.handoffReady || detectHandoffIntent(clean),
    }));

    await get().processQueue();
  },

  processQueue: async () => {
    const { isTyping, messages } = get();
    if (isTyping) return;
    // Solo se procesa si el último mensaje es del usuario (pendiente de respuesta).
    if (messages[messages.length - 1]?.from !== "user") return;

    set({ isTyping: true });
    try {
      const { messages: history, productContext } = get();
      const apiMessages = history.map((message) => ({
        role: message.from === "user" ? ("user" as const) : ("assistant" as const),
        content: message.text,
      }));

      const response = await fetch("/api/cozy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, productContext }),
      });
      const data = (await response.json().catch(() => null)) as {
        reply?: string;
        handoff?: boolean;
      } | null;

      const reply = typeof data?.reply === "string" && data.reply.trim() ? data.reply : ERROR_REPLY;
      set((state) => ({
        messages: [...state.messages, cozyMessage(reply)],
        isTyping: false,
        handoffReady: state.handoffReady || Boolean(data?.handoff),
      }));
    } catch {
      set((state) => ({
        messages: [...state.messages, cozyMessage(ERROR_REPLY)],
        isTyping: false,
      }));
    }

    // Si el usuario escribió más mientras Cozy respondía, procesa de nuevo.
    const after = get();
    if (after.messages[after.messages.length - 1]?.from === "user") {
      void after.processQueue();
    }
  },

  requestHuman: () => {
    set((state) => ({
      handoffReady: true,
      messages: [
        ...state.messages,
        cozyMessage(
          "¡Claro que sí! Te conecto con Paola, nuestra asesora humana. Haz clic en el botón de WhatsApp para continuar tu compra con ella. 💬",
        ),
      ],
    }));
  },

  resetConversation: () =>
    set({
      messages: WELCOME,
      productContext: null,
      inquiredProductId: null,
      isTyping: false,
      handoffReady: false,
    }),
}));
