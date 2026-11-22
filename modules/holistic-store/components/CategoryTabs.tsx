"use client";

import { CATEGORY_META } from "../constants";
import { STORE_CATEGORIES, type StoreCategory } from "../types";

type Props = {
  active: StoreCategory;
  counts: Record<string, number>;
  onChange: (category: StoreCategory) => void;
};

/**
 * Navegación de categorías de la tienda (sin recargar la página).
 * Pulseras · Cadenas · Runas · Piedras, con contador de piezas publicadas.
 */
export function CategoryTabs({ active, counts, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Categorías de Holistic Store"
      className="flex flex-wrap items-center gap-2.5"
    >
      {STORE_CATEGORIES.map((category) => {
        const selected = category === active;
        const count = counts[category] ?? 0;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(category)}
            className={`group inline-flex items-center gap-2.5 rounded-full border px-5 py-3 text-[11px] font-semibold uppercase tracking-[.22em] transition-all duration-300 ${
              selected
                ? "border-[#C5A059] bg-gradient-to-r from-[#d9bd7f] via-[#C5A059] to-[#e6cd8d] text-[#121212] shadow-[0_14px_36px_-16px_rgba(197,160,89,.8)]"
                : "border-[#C5A059]/30 bg-[#F7F3EA]/[0.03] text-[#F7F3EA]/65 hover:border-[#C5A059]/70 hover:text-[#F7F3EA]"
            }`}
          >
            <span aria-hidden="true" className={selected ? "text-[#121212]/70" : "text-[#C5A059]"}>
              {CATEGORY_META[category].symbol}
            </span>
            {category}
            <span
              aria-label={`${count} piezas`}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-normal ${
                selected ? "bg-[#121212]/15 text-[#121212]" : "bg-[#F7F3EA]/10 text-[#F7F3EA]/50"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
