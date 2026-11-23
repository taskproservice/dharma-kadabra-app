"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../../../stores/cart";
import { CATEGORY_META } from "../constants";
import { recordProductView } from "../data";
import type { StoreProduct, StoreTemplateId } from "../types";
import { formatPrice } from "../utils";
import { WhatsAppButton } from "./WhatsAppButton";

const TEMPLATE_STYLES: Record<
  StoreTemplateId,
  {
    card: string;
    id: string;
    name: string;
    description: string;
    price: string;
    currencyChip: string;
    categoryChip: string;
  }
> = {
  oro: {
    card: "border-gold/35 bg-gradient-to-b from-obsidian-soft to-obsidian hover:border-gold/70",
    id: "text-gold/80",
    name: "text-papyrus",
    description: "text-papyrus/55",
    price: "text-gold",
    currencyChip: "border-gold/40 text-gold",
    categoryChip: "bg-obsidian/85 text-gold-bright",
  },
  papiro: {
    card: "border-gold/50 bg-papyrus hover:border-gold hover:shadow-[0_24px_50px_-24px_rgba(26,26,26,.45)]",
    id: "text-ink/50",
    name: "text-ink",
    description: "text-ink/65",
    price: "text-ink",
    currencyChip: "border-ink/30 text-ink/80",
    categoryChip: "bg-papyrus/90 text-ink",
  },
  fuego: {
    card: "border-ember/45 bg-gradient-to-b from-[#221310] to-[#140d0b] hover:border-ember/80 hover:shadow-[0_24px_50px_-24px_rgba(217,101,56,.35)]",
    id: "text-ember/90",
    name: "text-papyrus",
    description: "text-papyrus/55",
    price: "text-[#e88a5f]",
    currencyChip: "border-ember/50 text-[#e88a5f]",
    categoryChip: "bg-[#140d0b]/85 text-[#f0a37e]",
  },
};

function CardImage({ product, template }: { product: StoreProduct; template: StoreTemplateId }) {
  const [failed, setFailed] = useState(false);
  const out = product.availability === "out_of_stock";
  const fallbackBg =
    template === "papiro"
      ? "linear-gradient(150deg, #F4EFE6, #EDE4D4)"
      : "linear-gradient(150deg, #161920, #0F1115)";

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-obsidian-soft">
      {!failed && product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          loading="lazy"
          className={`object-cover transition duration-500 group-hover:scale-105 ${out ? "opacity-60 grayscale" : ""}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="grid h-full w-full place-items-center"
          style={{ background: fallbackBg }}
        >
          <span
            className={`font-display text-6xl ${template === "papiro" ? "text-gold/60" : "text-gold/50"}`}
          >
            ✧
          </span>
        </div>
      )}
      <span
        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[.2em] shadow-sm backdrop-blur-sm ${TEMPLATE_STYLES[template].categoryChip}`}
      >
        {product.category}
      </span>
      {out && (
        <span className="absolute right-3 top-3 rounded-full bg-ember px-3 py-1 text-[9px] font-bold uppercase tracking-[.2em] text-papyrus shadow-md">
          Agotado
        </span>
      )}
    </div>
  );
}

type Props = {
  product: StoreProduct;
  template: StoreTemplateId;
  isAuthenticated?: boolean;
  /** Solo la tienda pública registra vistas (las vistas previas del Admin no). */
  trackableView?: boolean;
};

/**
 * Tarjeta de producto de la tienda pública: ID, imagen, nombre, descripción
 * corta, precio con moneda y acciones de compra (carrito + Cozy, que
 * transfiere a WhatsApp con un humano si hace falta).
 * El estilo visual lo define la plantilla asignada a su categoría.
 */
export function ProductCard({ product, template, isAuthenticated = false, trackableView = false }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartStore((state) => state.openCart);
  const trackedRef = useRef(false);

  // Analítica de Marketing: una vista por montaje de la tarjeta real.
  useEffect(() => {
    if (!trackableView || trackedRef.current) return;
    trackedRef.current = true;
    void recordProductView(product.id);
  }, [trackableView, product.id]);

  const styles = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.oro;
  const outOfStock = product.availability === "out_of_stock";

  const handleBuy = () => {
    if (outOfStock) return;

    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      currency: product.currency,
      description: product.description,
      imageUrl: product.imageUrl,
      emoji: CATEGORY_META[product.category]?.symbol ?? "✧",
    });
    openCart();
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border p-3 shadow-lg shadow-obsidian-deep/45 transition-all duration-300 hover:-translate-y-1 ${styles.card}`}
    >
      <div className="overflow-hidden rounded-xl">
        <CardImage product={product} template={template} />
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3.5">
        <p
          className={`truncate font-mono text-[10px] uppercase tracking-[.18em] ${styles.id}`}
          title={product.id}
        >
          #{product.id}
        </p>
        <h3 className={`mt-1.5 line-clamp-1 font-display text-lg leading-snug ${styles.name}`}>
          {product.name}
        </h3>
        <p className={`mt-1 line-clamp-2 text-xs leading-5 ${styles.description}`}>
          {product.description}
        </p>
        <p className="mt-3 flex items-center gap-2">
          <span className={`text-base font-bold tracking-wide ${styles.price}`}>
            {formatPrice(product.price, product.currency)}
          </span>
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-3.5">
          <button
            type="button"
            disabled={outOfStock}
            aria-disabled={outOfStock}
            onClick={handleBuy}
            aria-label={outOfStock ? `${product.name} agotado` : `Comprar ${product.name}`}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-obsidian transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              outOfStock
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gold-light hover:shadow-[0_0_16px_rgba(197,160,89,0.4)] active:scale-[0.99]"
            }`}
          >
            {!outOfStock && <ShoppingBag size={14} className="shrink-0" aria-hidden="true" />}
            <span>{outOfStock ? "AGOTADO" : "COMPRAR"}</span>
          </button>

          {/* Embudo de Cozy: abre el widget con el contexto del producto.
              Incluso agotado, para que Cozy se disculpe y ofrezca similares. */}
          <WhatsAppButton product={product} template={template} />
        </div>
      </div>
    </article>
  );
}
