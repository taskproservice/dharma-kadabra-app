"use client";

import { MessageCircle } from "lucide-react";
import { useCozyStore } from "../../../stores/cozy";
import type { StoreProduct, StoreTemplateId } from "../types";

type WhatsAppButtonProps = {
  product: StoreProduct;
  template?: StoreTemplateId;
  className?: string;
};

export function WhatsAppButton({
  product,
  className = "",
}: WhatsAppButtonProps) {
  const openWithProduct = useCozyStore((state) => state.openWithProduct);

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
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#2C2C2C]/25 bg-transparent px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#1A1A1A] transition-all duration-300 hover:border-[#C5A059] hover:bg-[#C5A059]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E7B2F] ${className}`}
    >
      <MessageCircle size={14} className="shrink-0 text-[#9E7B2F]" aria-hidden="true" />
      <span>PREGUNTAR A COZY</span>
    </button>
  );
}
