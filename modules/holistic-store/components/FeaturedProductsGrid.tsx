"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StoreProduct } from "../types";
import { FeaturedProductCard, type FeaturedProduct } from "./FeaturedProductCard";

function enrichProducts(products: StoreProduct[]): FeaturedProduct[] {
  return products.slice(0, 4).map((product, index) => {
    const enriched: FeaturedProduct = { ...product };
    // Asignar badges/subtítulos demostrativos cuando el producto coincide con el diseño de referencia
    const name = product.name.toLowerCase();
    if (name.includes("cuarzo")) {
      enriched.badge = "mas-vendido";
      enriched.subtitle = "Cuarzo";
    } else if (name.includes("medallón") || name.includes("medallon") || name.includes("solar")) {
      enriched.badge = "nuevo";
      enriched.subtitle = "Protección";
    } else if (name.includes("obsidiana")) {
      enriched.badge = "oferta";
      enriched.subtitle = "Equilibrio";
      if (!enriched.compareAtPrice || enriched.compareAtPrice <= enriched.price) {
        enriched.compareAtPrice = enriched.price + 100;
      }
    } else if (name.includes("amatista") || name.includes("drusa")) {
      enriched.subtitle = "Armonía";
    } else if (index === 0) {
      enriched.badge = "mas-vendido";
    } else if (index === 1) {
      enriched.badge = "nuevo";
    } else if (index === 2) {
      enriched.badge = "oferta";
      enriched.compareAtPrice = enriched.compareAtPrice ?? enriched.price + 100;
    }

    // Subtítulo por defecto basado en categoría si no se asignó
    if (!enriched.subtitle) {
      if (product.category === "Pulseras") enriched.subtitle = "Cuarzo";
      else if (product.category === "Cadenas") enriched.subtitle = "Protección";
      else if (product.category === "Piedras") enriched.subtitle = "Armonía";
      else if (product.category === "Runas") enriched.subtitle = "Sabiduría";
    }

    return enriched;
  });
}

export function FeaturedProductsGrid({ products }: { products: StoreProduct[] }) {
  const featured = enrichProducts(products);

  return (
    <section aria-labelledby="featured-products-title" className="bg-[#F7F3EA] px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#8B6914]">
              <span aria-hidden="true" className="h-px w-10 bg-[#C5A059]" />
              Nuestra colección
            </p>
            <h2
              id="featured-products-title"
              className="mt-5 font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] tracking-[-0.01em] text-[#2C241B]"
            >
              Productos{" "}
              <em className="italic text-[#8B6914]">destacados</em>
            </h2>
          </div>
          <Link
            href="#productos-destacados"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#C5A059]/60 bg-transparent px-7 py-3.5 text-[14px] font-medium text-[#2C241B] transition hover:border-[#C5A059] hover:bg-[#C5A059]/5"
          >
            Ver toda la tienda
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
