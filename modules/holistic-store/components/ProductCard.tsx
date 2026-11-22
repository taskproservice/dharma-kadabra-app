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
    card: "border-[#C5A059]/35 bg-gradient-to-b from-[#1b1b1b] to-[#141414] hover:border-[#C5A059]/70",
    id: "text-[#C5A059]/80",
    name: "text-[#F7F3EA]",
    description: "text-[#F7F3EA]/55",
    price: "text-[#C5A059]",
    currencyChip: "border-[#C5A059]/40 text-[#C5A059]",
    categoryChip: "bg-[#121212]/85 text-[#e8cf92]",
  },
  papiro: {
    card: "border-[#C5A059]/50 bg-[#F7F3EA] hover:border-[#C5A059] hover:shadow-[0_24px_50px_-24px_rgba(46,35,29,.45)]",
    id: "text-[#2E231D]/50",
    name: "text-[#2E231D]",
    description: "text-[#2E231D]/65",
    price: "text-[#2E231D]",
    currencyChip: "border-[#2E231D]/30 text-[#2E231D]/80",
    categoryChip: "bg-[#F7F3EA]/90 text-[#2E231D]",
  },
  fuego: {
    card: "border-[#D96538]/45 bg-gradient-to-b from-[#221310] to-[#140d0b] hover:border-[#D96538]/80 hover:shadow-[0_24px_50px_-24px_rgba(217,101,56,.35)]",
    id: "text-[#D96538]/90",
    name: "text-[#F7F3EA]",
    description: "text-[#F7F3EA]/55",
    price: "text-[#e88a5f]",
    currencyChip: "border-[#D96538]/50 text-[#e88a5f]",
    categoryChip: "bg-[#140d0b]/85 text-[#f0a37e]",
  },
};

function CardImage({ product, template }: { product: StoreProduct; template: StoreTemplateId }) {
  const [failed, setFailed] = useState(false);
  const out = product.availability === "out_of_stock";
  const fallbackBg =
    template === "papiro"
      ? "linear-gradient(150deg, #efe7d6, #e2d5bd)"
      : "linear-gradient(150deg, #232323, #121212)";

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1c1c1c]">
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
            className={`font-display text-6xl ${template === "papiro" ? "text-[#C5A059]/60" : "text-[#C5A059]/50"}`}
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
        <span className="absolute right-3 top-3 rounded-full bg-[#D96538] px-3 py-1 text-[9px] font-bold uppercase tracking-[.2em] text-white shadow-md">
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
 * Tarjeta de producto de la tienda pública: ID, imagen, nombre, descripción
 * corta, precio con moneda y acciones de compra (carrito + Cozy, que
 * transfiere a WhatsApp con un humano si hace falta).
 * El estilo visual lo define la plantilla asignada a su categoría.
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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border p-3 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 ${styles.card}`}
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
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#121212] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] ${
              outOfStock
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-[#d4b26a] hover:shadow-[0_0_16px_rgba(197,160,89,0.4)] active:scale-[0.99]"
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
