"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../../../stores/cart";
import { CATEGORY_META } from "../constants";
import type { StoreProduct } from "../types";
import { formatPrice } from "../utils";

export type FeaturedBadge = "mas-vendido" | "nuevo" | "oferta";

export type FeaturedProduct = StoreProduct & {
  badge?: FeaturedBadge;
  compareAtPrice?: number;
  subtitle?: string;
};

const BADGE_STYLES: Record<FeaturedBadge, string> = {
  "mas-vendido": "bg-[#C9A227] text-[#2C241B]",
  "nuevo": "bg-[#1A1A1A] text-white",
  "oferta": "bg-[#7C6BC4] text-white",
};

const BADGE_LABELS: Record<FeaturedBadge, string> = {
  "mas-vendido": "Más vendido",
  "nuevo": "Nuevo",
  "oferta": "Oferta",
};

function CardImage({ product }: { product: FeaturedProduct }) {
  const [failed, setFailed] = useState(false);
  const out = product.availability === "out_of_stock";

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-[#F3EFE6]">
      {!failed && product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition duration-500 group-hover:scale-[1.03] ${out ? "opacity-60 grayscale" : ""}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#FAF8F3,#EAE2D2)]"
        >
          <span className="font-display text-6xl text-[#C5A059]/50">✧</span>
        </div>
      )}
      {product.badge && (
        <span
          className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-[11px] font-semibold shadow-sm ${BADGE_STYLES[product.badge]}`}
        >
          {BADGE_LABELS[product.badge]}
        </span>
      )}
      {out && (
        <span className="absolute right-4 top-4 rounded-full bg-[#E9E4DA] px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-[#6B5D4A]">
          Agotado
        </span>
      )}
    </div>
  );
}

export function FeaturedProductCard({ product }: { product: FeaturedProduct }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartStore((state) => state.openCart);
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

  const categoryLabel = product.subtitle
    ? `${product.category.toUpperCase()} · ${product.subtitle.toUpperCase()}`
    : product.category.toUpperCase();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E8E1D5] bg-[#FCFAF5] shadow-[0_8px_30px_rgba(44,36,27,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(44,36,27,0.08)]">
      <CardImage product={product} />
      <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
        <p className="text-[11px] font-medium uppercase tracking-[.28em] text-[#8A7A63]">
          {categoryLabel}
        </p>
        <h3 className="mt-3 font-display text-[2rem] leading-[1.1] text-[#2C241B]">
          {product.name}
        </h3>
        <p className="mt-3 text-[15px] leading-7 text-[#6B5D4A]">
          {product.description}
        </p>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-display text-[2rem] leading-none text-[#8B6914]">
            {formatPrice(product.price, product.currency)}
          </span>
          {typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price && (
            <span className="text-lg text-[#A89B87] line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            disabled={outOfStock}
            aria-disabled={outOfStock}
            onClick={handleBuy}
            aria-label={outOfStock ? `${product.name} agotado` : `Agregar ${product.name} al carrito`}
            className={`inline-flex w-full items-center justify-center gap-3 rounded-full border px-6 py-4 text-[15px] font-medium transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] ${
              outOfStock
                ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                : "cursor-pointer border-[#2C241B]/60 bg-transparent text-[#2C241B] hover:border-[#C5A059] hover:bg-[#C5A059]/5"
            }`}
          >
            <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>{outOfStock ? "Agotado" : "Agregar al carrito"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
