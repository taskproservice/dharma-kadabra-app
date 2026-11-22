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
                ? "border-gold bg-gradient-to-r from-gold-light via-gold to-gold-bright text-obsidian shadow-[0_14px_36px_-16px_rgba(197,160,89,.8)]"
                : "border-gold/30 bg-papyrus/[0.03] text-papyrus/65 hover:border-gold/70 hover:text-papyrus"
            }`}
          >
            <span aria-hidden="true" className={selected ? "text-obsidian/70" : "text-gold"}>
              {CATEGORY_META[category].symbol}
            </span>
            {category}
            <span
              aria-label={`${count} piezas`}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-normal ${
                selected ? "bg-obsidian/15 text-obsidian" : "bg-papyrus/10 text-papyrus/50"
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
