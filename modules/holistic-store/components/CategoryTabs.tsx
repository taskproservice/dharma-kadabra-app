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
                ? "border-gold bg-gold text-ink shadow-[0_14px_36px_-16px_rgba(197,160,89,.8)]"
                : "border-stone-200 bg-white text-sanctuary-ink-soft hover:border-gold/60 hover:text-bronze"
            }`}
          >
            <span aria-hidden="true" className={selected ? "text-ink/70" : "text-bronze"}>
              {CATEGORY_META[category].symbol}
            </span>
            {category}
            <span
              aria-label={`${count} piezas`}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-normal ${
                selected ? "bg-ink/10 text-ink" : "bg-papyrus text-sanctuary-ink-soft"
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
