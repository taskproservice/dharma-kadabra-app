"use client";

import { CATEGORY_META } from "../constants";
import { STORE_CATEGORIES, type StoreCategory } from "../types";

type Props = {
  active: StoreCategory;
  counts: Record<string, number>;
  onChange: (category: StoreCategory) => void;
};

/**
 * Navegación de categorías de la tienda sobre fondo Papiro.
 * Las píldoras inactivas tienen fondo papiro claro y bordes oscuros sutiles;
 * la píldora activa mantiene fondo dorado (#C5A059) con texto oscuro (#1A1A1A).
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
                ? "border-[#C5A059] bg-[#C5A059] text-[#1A1A1A] shadow-[0_12px_30px_-14px_rgba(92,72,48,.35)]"
                : "border-[#2C2C2C]/25 bg-[#FCFAF5] text-[#2C2C2C]/80 hover:border-[#2C2C2C]/50 hover:bg-[#FFFDF9] hover:text-[#1A1A1A]"
            }`}
          >
            <span aria-hidden="true" className={selected ? "text-[#1A1A1A]/80" : "text-[#9E7B2F]"}>
              {CATEGORY_META[category].symbol}
            </span>
            {category}
            <span
              aria-label={`${count} piezas`}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-normal ${
                selected ? "bg-[#1A1A1A]/12 text-[#1A1A1A]" : "bg-[#2C2C2C]/[0.08] text-[#2C2C2C]/75"
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
