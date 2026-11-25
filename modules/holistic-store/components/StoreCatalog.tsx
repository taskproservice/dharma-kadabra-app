"use client";

import { useMemo, useState } from "react";
import { Sparkles, TriangleAlert } from "lucide-react";
import { STORE_CATEGORIES, type CategoryTemplateMap, type StoreCategory, type StoreProduct } from "../types";
import { ProductCard } from "./ProductCard";

export type StoreFilter = "Todas" | StoreCategory;

const FILTERS: StoreFilter[] = ["Todas", ...STORE_CATEGORIES];

type Props = {
  products: StoreProduct[];
  templates: CategoryTemplateMap;
  /** Error de la carga inicial (servidor). Los productos de respaldo se muestran igual. */
  initialError?: { message: string } | null;
  isFallback?: boolean;
};

/**
 * Catálogo público con filtros por categoría (estado local, sin recargar):
 * pastillas “Todas · Pulseras · Cadenas · Runas · Piedras”.
 *
 * La primera pintura llega del servidor; filtrar es instantáneo en cliente.
 * Si la base de datos falló en el render, se muestra un aviso elegante y se
 * sirve el catálogo de respaldo en lugar de romper la página.
 */
export function StoreCatalog({ products, templates, initialError = null, isFallback = false }: Props) {
  const [active, setActive] = useState<StoreFilter>("Todas");

  const visible = useMemo(
    () => (active === "Todas" ? products : products.filter((product) => product.category === active)),
    [active, products],
  );

  return (
    <section aria-labelledby="store-catalog-title" className="bg-[#F7F3EA] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#8B6914]">
              <span aria-hidden="true" className="h-px w-10 bg-[#C5A059]" />
              Nuestra colección
            </p>
            <h2
              id="store-catalog-title"
              className="mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.01em] text-[#2C241B]"
            >
              Explora la <em className="italic text-[#8B6914]">colección</em>
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-6 text-[#6B5D4A]">
            Piezas publicadas, elegidas con intención. Filtra por categoría y encuentra la tuya.
          </p>
        </div>

        {/* Barra de filtros por categoría */}
        <div
          role="tablist"
          aria-label="Filtrar productos por categoría"
          className="mt-8 flex flex-wrap items-center gap-2 border-y border-[#C5A059]/20 py-4 sm:gap-2.5"
        >
          {FILTERS.map((filter) => {
            const selected = filter === active;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(filter)}
                className={`inline-flex cursor-pointer items-center whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[.18em] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] ${
                  selected
                    ? "border-[#C5A059] bg-[#C5A059] text-[#2C241B] shadow-[0_12px_28px_-14px_rgba(197,160,89,.9)]"
                    : "border-[#C5A059]/30 bg-transparent text-[#2C241B] hover:border-[#C5A059]/60 hover:bg-[#C5A059]/5"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Aviso elegante cuando el catálogo en vivo falló (se muestran respaldos) */}
        {initialError && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/5 px-4 py-3 text-[#6B5D4A]"
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-[#8B6914]" aria-hidden="true" />
            <div className="text-xs leading-6">
              <p className="font-semibold text-[#2C241B]">El catálogo en vivo no está disponible en este momento.</p>
              <p>{initialError.message} Mientras tanto, mostramos una selección de la colección.</p>
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-[#C5A059]/40 bg-white/60 px-6 py-16 text-center">
            <div>
              <Sparkles size={26} className="mx-auto text-[#8B6914]" aria-hidden="true" />
              <p className="mt-4 font-display text-2xl text-[#2C241B]">Próximamente en {active}</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6B5D4A]">
                Estamos preparando nuevas piezas para esta colección. Vuelve pronto o escríbenos por WhatsApp.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                template={templates[product.category] ?? "oro"}
                trackableView={!isFallback}
              />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-[10px] uppercase tracking-[.25em] text-[#6B5D4A]/80">
          {visible.length} {visible.length === 1 ? "pieza" : "piezas"} · {active === "Todas" ? "Toda la colección" : active}
        </p>
      </div>
    </section>
  );
}
