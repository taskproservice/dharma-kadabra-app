"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Shield, ShoppingBag, Sparkles } from "lucide-react";
import { useCartStore } from "../../../stores/cart";
import { CATEGORY_META } from "../constants";
import type { StoreProduct } from "../types";

type Props = {
  product: StoreProduct;
};

export function StorefrontHero({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartStore((state) => state.openCart);

  const handleBuy = () => {
    if (product.availability === "out_of_stock") return;
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
    <section className="relative overflow-hidden bg-[#F3EDE1]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/store-banner/banner-pulseras.jpg"
          alt="Pulsera de obsidiana sobre fondo natural"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(243,237,225,0.92)_0%,rgba(243,237,225,0.82)_28%,rgba(243,237,225,0.35)_55%,rgba(243,237,225,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,237,225,0.10)_0%,rgba(243,237,225,0.0)_35%,rgba(243,237,225,0.15)_100%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1fr_1fr] lg:pb-20 lg:pt-14">
        <div className="max-w-2xl">
          <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.35em] text-[#8B6914]">
            <span aria-hidden="true" className="h-px w-12 bg-[#B8902E]" />
            Producto destacado
          </p>

          <h1 className="mt-7 font-display text-[clamp(3rem,7vw,5.6rem)] leading-[0.95] tracking-[-0.02em] text-[#3B2A1A]">
            Pulsera de
            <br />
            Obsidiana
          </h1>

          <p className="mt-5 font-display text-[clamp(2rem,3.6vw,3.5rem)] italic leading-[1.1] text-[#A07A1A]">
            Protección y equilibrio
            <br />
            en tu día a día
          </p>

          <p className="mt-7 max-w-xl text-[17px] leading-8 text-[#5B5143]">
            La obsidiana te ayuda a liberar energías negativas, fortalecer tu mente y mantener la calma.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={handleBuy}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#C5A059] px-8 py-4 text-[16px] font-semibold text-[#2C241B] shadow-[0_12px_30px_rgba(197,160,89,0.28)] transition hover:bg-[#D1AE68] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]"
            >
              <ShoppingBag size={18} aria-hidden="true" />
              Agregar al carrito
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <Link
              href="#productos-destacados"
              className="inline-flex items-center gap-2 text-[16px] font-medium text-[#3B2A1A] underline decoration-[#3B2A1A]/30 underline-offset-4 transition hover:text-[#8B6914]"
            >
              Conoce más
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#8B6914]/15 pt-8 text-[#5B5143]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-[#8B6914]/25 bg-white/40 text-[#8B6914]">
                <Shield size={18} strokeWidth={1.5} />
              </span>
              <span className="text-[15px]">Protección energética</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-[#8B6914]/25 bg-white/40 text-[#8B6914]">
                <Heart size={18} strokeWidth={1.5} />
              </span>
              <span className="text-[15px]">Equilibrio emocional</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-[#8B6914]/25 bg-white/40 text-[#8B6914]">
                <Sparkles size={18} strokeWidth={1.5} />
              </span>
              <span className="text-[15px]">Bienestar integral</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:justify-self-end">
          <div className="relative aspect-[4/4.5] overflow-hidden rounded-[36px] shadow-[0_30px_80px_rgba(44,36,27,0.22)]">
            <Image
              src={product.imageUrl || "/images/store-banner/banner-pulseras.jpg"}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>

          <div className="absolute -right-2 -top-4 grid size-[132px] place-items-center rounded-full border border-[#C5A059]/50 bg-[#F7F3EA]/95 text-center shadow-[0_12px_30px_rgba(44,36,27,0.12)] sm:right-4 sm:top-4">
            <div className="px-4">
              <p className="font-display text-[2rem] leading-none text-[#8B6914]">Envío</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.15em] text-[#5B5143]">
                gratis en
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-[#5B5143]">
                México
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
