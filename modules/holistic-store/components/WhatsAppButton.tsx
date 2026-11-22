"use client";

import { MessageCircle } from "lucide-react";
import { STORE_WHATSAPP } from "../constants";
import type { StoreProduct, StoreTemplateId } from "../types";
import { buildWhatsAppUrl } from "../utils";

type WhatsAppButtonProps = {
  product: StoreProduct;
  template?: StoreTemplateId;
  disabled?: boolean;
  className?: string;
};

/**
 * Botón secundario de consulta por WhatsApp para la Tienda Holística.
 *
 * - Si el producto está agotado (`disabled`), se deshabilita y muestra "AGOTADO".
 * - Si `NEXT_PUBLIC_STORE_WHATSAPP` no está configurado, muestra un estado sutil
 *   y un tooltip con "Próximamente" en lugar de un mensaje técnico de error.
 * - Si está disponible y configurado, abre el chat con `buildWhatsAppUrl`.
 */
export function WhatsAppButton({
  product,
  template = "oro",
  disabled = false,
  className = "",
}: WhatsAppButtonProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? STORE_WHATSAPP;
  const whatsappReady = whatsappNumber.replace(/\D/g, "").length >= 10;
  const whatsappUrl = buildWhatsAppUrl(product, whatsappNumber);

  const isLightCard = template === "papiro";

  const baseClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-transparent px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] transition-all duration-300";

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`${baseClasses} cursor-not-allowed border-[#C5A059]/30 ${
          isLightCard ? "text-[#2E231D]/45" : "text-[#F7F3EA]/40"
        } opacity-60 ${className}`}
      >
        <span>AGOTADO</span>
      </button>
    );
  }

  if (!whatsappReady) {
    return (
      <div className={`group/wa relative w-full ${className}`}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Próximamente"
          aria-label={`Consulta por WhatsApp para ${product.name}: próximamente`}
          className={`${baseClasses} cursor-not-allowed border-[#C5A059]/45 ${
            isLightCard ? "text-[#2E231D]/65" : "text-[#C5A059]/75"
          } opacity-75`}
        >
          <MessageCircle size={14} className="shrink-0" aria-hidden="true" />
          <span>Próximamente</span>
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#C5A059]/45 bg-[#121212]/95 px-2.5 py-1 text-[10px] font-medium tracking-[.12em] text-[#e8cf92] opacity-0 shadow-lg transition-opacity duration-200 group-hover/wa:opacity-100 group-focus-within/wa:opacity-100"
        >
          Próximamente
        </span>
      </div>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Consultar ${product.name} por WhatsApp`}
      className={`${baseClasses} border-[#C5A059] ${
        isLightCard
          ? "text-[#2E231D] hover:bg-[#C5A059]/15"
          : "text-[#C5A059] hover:bg-[#C5A059]/15 hover:text-[#e8cf92]"
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] ${className}`}
    >
      <MessageCircle size={14} className="shrink-0" aria-hidden="true" />
      <span>WHATSAPP</span>
    </a>
  );
}
