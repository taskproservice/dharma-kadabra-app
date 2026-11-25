"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../../stores/cart";
import { CATEGORY_META } from "../constants";
import { recordProductView } from "../data";
import type { StoreProduct, StoreTemplateId } from "../types";
import { formatPrice } from "../utils";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * Premium Orgánico: las tres plantillas de categoría comparten la tarjeta
 * blanca limpia (fondo #FFFFFF, borde stone sutil, sombra muy suave) y se
 * distinguen solo por el chip de categoría, en colores pasteles con texto
 * oscuro: beige (Oro), verde salvia (Papiro) y blush (Fuego).
 */
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
    card: "border-stone-200 bg-white hover:border-gold/50 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]",
    id: "text-ink-muted/70",
    name: "text-ink",
    description: "text-ink-muted",
    price: "text-ink",
    currencyChip: "border-stone-200 text-ink-muted",
    /* Pastel beige */
    categoryChip: "bg-[#F3EDDF] text-[#6B5D4A]",
  },
  papiro: {
    card: "border-stone-200 bg-white hover:border-gold/50 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]",
    id: "text-ink-muted/70",
    name: "text-ink",
    description: "text-ink-muted",
    price: "text-ink",
    currencyChip: "border-stone-200 text-ink-muted",
    /* Pastel verde salvia */
    categoryChip: "bg-[#E8EDE0] text-[#4F5B43]",
  },
  fuego: {
    card: "border-stone-200 bg-white hover:border-gold/50 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]",
    id: "text-ink-muted/70",
    name: "text-ink",
    description: "text-ink-muted",
    price: "text-ink",
    currencyChip: "border-stone-200 text-ink-muted",
    /* Pastel blush */
    categoryChip: "bg-[#F4E8E0] text-[#7A4A33]",
  },
};

function CardImage({ product, template }: { product: StoreProduct; template: StoreTemplateId }) {
  const [failed, setFailed] = useState(false);
  const out = product.availability === "out_of_stock";
  const fallbackBg =
    template === "fuego"
      ? "linear-gradient(150deg, #F7F0EA, #F0E0D3)"
      : "linear-gradient(150deg, #FAF8F3, #F0EBE0)";

  return (
    <div className="relative h-36 w-full overflow-hidden bg-papyrus sm:h-40">
      {!failed && product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw"
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
          <span className="font-display text-6xl text-gold/50">✧</span>
        </div>
      )}
      <span
        className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[.18em] shadow-sm backdrop-blur-sm ${(TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.oro).categoryChip}`}
      >
        {product.category.toUpperCase()}
      </span>
      {out && (
        <span className="absolute right-3 top-3 rounded-full bg-[#E9E4DA] px-3 py-1 text-[9px] font-bold uppercase tracking-[.2em] text-[#6B5D4A] shadow-md">
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
 * El acento pastel del chip lo define la plantilla asignada a su categoría.
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
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 ${styles.card}`}
    >
      <div className="overflow-hidden rounded-xl">
        <CardImage product={product} template={template} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 pt-2.5">
        <p
          className={`truncate font-mono text-[10px] uppercase tracking-[.18em] ${styles.id}`}
          title={product.id}
        >
          #{product.id}
        </p>
        <h3
          className={`mt-1 line-clamp-1 font-display text-base leading-snug ${styles.name}`}
          title={product.name}
        >
          {product.name}
        </h3>
        <p className={`mt-0.5 line-clamp-2 min-h-[2rem] text-xs leading-4 ${styles.description}`}>
          {product.description}
        </p>
        <p className="mt-2 flex items-center gap-2">
          <span className={`text-sm font-bold tracking-wide ${styles.price}`}>
            {formatPrice(product.price, product.currency)}
          </span>
        </p>

        <div className="mt-auto flex flex-col gap-1.5 pt-2.5">
          <button
            type="button"
            disabled={outOfStock}
            aria-disabled={outOfStock}
            onClick={handleBuy}
            aria-label={outOfStock ? `${product.name} agotado` : `Agregar ${product.name} al carrito`}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gold px-2 py-2 text-[10px] font-semibold text-ink transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              outOfStock
                ? "cursor-not-allowed bg-stone-200 text-ink-muted"
                : "cursor-pointer hover:bg-gold-light hover:shadow-[0_8px_20px_rgba(197,160,89,0.35)] active:scale-[0.99]"
            }`}
          >
            <ShoppingCart size={14} className="shrink-0" aria-hidden="true" />
            <span>{outOfStock ? "Agotado" : "Agregar al carrito"}</span>
          </button>

          {/* Embudo de Cozy: abre el widget con el contexto del producto.
              Incluso agotado, para que Cozy se disculpe y ofrezca similares. */}
          <WhatsAppButton product={product} template={template} />
        </div>
      </div>
    </article>
  );
}
