"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../../../stores/cart";
import { CATEGORY_META } from "../constants";
import type { StoreProduct, StoreTemplateId } from "../types";
import { formatPrice } from "../utils";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * Estilos de tarjeta unificados bajo la estética Papyrus (#FCFAF5),
 * con sombras cálidas en marrón claro (nunca negro) y tipografía oscura de alto contraste.
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
    card: "border-[#C5A059]/45 bg-[#FCFAF5] hover:border-[#C5A059]",
    id: "text-[#8B6914]/85",
    name: "text-[#1A1A1A]",
    description: "text-[#2C2C2C]/75",
    price: "text-[#1A1A1A]",
    currencyChip: "border-[#C5A059]/60 text-[#8B6914]",
    categoryChip: "bg-[#FCFAF5]/95 text-[#1A1A1A] border border-[#C5A059]/40",
  },
  papiro: {
    card: "border-[#C5A059]/45 bg-[#FCFAF5] hover:border-[#C5A059]",
    id: "text-[#2C2C2C]/60",
    name: "text-[#1A1A1A]",
    description: "text-[#2C2C2C]/75",
    price: "text-[#1A1A1A]",
    currencyChip: "border-[#2C2C2C]/25 text-[#2C2C2C]",
    categoryChip: "bg-[#FCFAF5]/95 text-[#1A1A1A] border border-[#2C2C2C]/15",
  },
  fuego: {
    card: "border-[#D96538]/40 bg-[#FCFAF5] hover:border-[#D96538]",
    id: "text-[#B54B22]",
    name: "text-[#1A1A1A]",
    description: "text-[#2C2C2C]/75",
    price: "text-[#1A1A1A]",
    currencyChip: "border-[#D96538]/50 text-[#B54B22]",
    categoryChip: "bg-[#FCFAF5]/95 text-[#B54B22] border border-[#D96538]/35",
  },
};

function CardImage({ product, template }: { product: StoreProduct; template: StoreTemplateId }) {
  const [failed, setFailed] = useState(false);
  const out = product.availability === "out_of_stock";

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EDE5D7]">
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
          style={{ background: "linear-gradient(150deg, #F4EFE6, #E5DBC9)" }}
        >
          <span className="font-display text-6xl text-[#9E7B2F]/70">
            ✧
          </span>
        </div>
      )}
      <span
        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[.2em] shadow-[0_2px_8px_rgba(92,72,48,0.12)] backdrop-blur-sm ${TEMPLATE_STYLES[template].categoryChip}`}
      >
        {product.category}
      </span>
      {out && (
        <span className="absolute right-3 top-3 rounded-full bg-[#D96538] px-3 py-1 text-[9px] font-bold uppercase tracking-[.2em] text-white shadow-sm">
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
};

/**
 * Tarjeta de producto de la tienda pública sobre blanco cálido (#FCFAF5)
 * con sombra marrón clara muy sutil, títulos/precios oscuros y botón COMPRAR dorado con texto oscuro.
 */
export function ProductCard({ product, template, isAuthenticated = false }: Props) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartStore((state) => state.openCart);

  const styles = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.oro;
  const outOfStock = product.availability === "out_of_stock";

  const handleBuy = () => {
    if (outOfStock) return;
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/tienda");
      return;
    }

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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border p-3 shadow-[0_10px_28px_-10px_rgba(120,95,65,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_-12px_rgba(120,95,65,0.2)] ${styles.card}`}
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
        <h3 className={`mt-1.5 line-clamp-1 font-display text-lg font-medium leading-snug ${styles.name}`}>
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
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#1A1A1A] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E7B2F] ${
              outOfStock
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-[#b58e45] hover:shadow-[0_8px_20px_-6px_rgba(120,95,65,0.3)] active:scale-[0.99]"
            }`}
          >
            {!outOfStock && <ShoppingBag size={14} className="shrink-0" aria-hidden="true" />}
            <span>{outOfStock ? "AGOTADO" : "COMPRAR"}</span>
          </button>

          <WhatsAppButton product={product} template={template} />
        </div>
      </div>
    </article>
  );
}
