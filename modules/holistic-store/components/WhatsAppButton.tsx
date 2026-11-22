"use client";

import { MessageCircle } from "lucide-react";
import { useCozyStore } from "../../../stores/cozy";
import type { StoreProduct, StoreTemplateId } from "../types";

type WhatsAppButtonProps = {
  product: StoreProduct;
  template?: StoreTemplateId;
  className?: string;
};

/**
 * Botón de consulta de la Tienda Holística — ahora es la entrada del
 * embudo de Cozy (no abre `wa.me` directo).
 *
 * Al hacer clic abre el widget flotante de Cozy con el contexto del
 * producto y el mensaje inicial ya cargado. Cozy atiende primero; si el
 * visitante pide un humano, el widget muestra el botón de WhatsApp con
 * Paola. Funciona también con piezas agotadas: Cozy se disculpa y ofrece
 * piezas similares de la misma categoría.
 */
export function WhatsAppButton({
  product,
  template = "oro",
  className = "",
}: WhatsAppButtonProps) {
  const openWithProduct = useCozyStore((state) => state.openWithProduct);

  const isLightCard = template === "papiro";

  const baseClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-transparent px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] transition-all duration-300";

  return (
    <button
      type="button"
      onClick={() =>
        openWithProduct({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          currency: product.currency,
          availability: product.availability,
          description: product.description,
          imageUrl: product.imageUrl,
        })
      }
      aria-label={`Consultar ${product.name} con Cozy`}
      className={`${baseClasses} border-[#C5A059] ${
        isLightCard
          ? "text-[#2E231D] hover:bg-[#C5A059]/15"
          : "text-[#C5A059] hover:bg-[#C5A059]/15 hover:text-[#e8cf92]"
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] ${className}`}
    >
      <MessageCircle size={14} className="shrink-0" aria-hidden="true" />
      <span>PREGUNTAR A COZY</span>
    </button>
  );
}
