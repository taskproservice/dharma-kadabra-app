"use client";

import { useCallback, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { CATEGORY_META, STORE_WHATSAPP } from "../constants";
import type { CategoryTemplateMap, StoreCategory, StoreProduct } from "../types";
import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";
import { StoreErrorPanel } from "./StoreErrorPanel";
import { ProductCardSkeleton } from "../../../components/ui/skeleton";

type Props = {
  initialCategory: StoreCategory;
  initialProducts: StoreProduct[];
  initialCounts: Record<string, number>;
  templates: CategoryTemplateMap;
  isAuthenticated?: boolean;
  initialError?: { message: string; detail?: string | null } | null;
};

export function StoreExplorer({
  initialCategory,
  initialProducts,
  initialCounts,
  templates,
  isAuthenticated = false,
  initialError = null,
}: Props) {
  const [active, setActive] = useState<StoreCategory>(initialCategory);
  const [cache, setCache] = useState<Record<string, StoreProduct[]>>({ [initialCategory]: initialProducts });
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; detail?: string | null } | null>(initialError);

  const loadCategory = useCallback(async (category: StoreCategory, force = false) => {
    if (!force && cache[category]) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/store/products?category=${encodeURIComponent(category)}`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError({
          message:
            typeof data?.error === "string" && data.error
              ? data.error
              : "No fue posible cargar esta categoría.",
          detail: typeof data?.detail === "string" ? data.detail : null,
        });
        return;
      }
      const products: StoreProduct[] = Array.isArray(data.products) ? data.products : [];
      setCache((prev) => ({ ...prev, [category]: products }));
      setCounts((prev) => ({
        ...prev,
        [category]: typeof data.total === "number" ? data.total : products.length,
      }));
    } catch {
      setError({
        message:
          "No pudimos conectar con el catálogo. Revisa tu conexión y vuelve a intentarlo.",
        detail: null,
      });
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const selectCategory = useCallback(
    (category: StoreCategory) => {
      setActive(category);
      void loadCategory(category);
    },
    [loadCategory],
  );

  const retry = useCallback(() => {
    void loadCategory(active, true);
  }, [active, loadCategory]);

  const products = cache[active] ?? [];
  const template = templates[active] ?? "oro";
  const meta = CATEGORY_META[active];

  return (
    <div id="tienda-holistica-catalogo" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#C5A059]/35 pb-8">
        <div>
          <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.35em] text-[#9E7B2F]">
            <span aria-hidden="true" className="h-px w-10 bg-[#C5A059]" />
            Holistic Store
          </p>
          <h2 className="mt-5 font-display text-4xl leading-none text-[#1A1A1A] sm:text-5xl">
            Explora la <em className="italic text-[#9E7B2F]">colección.</em>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#2C2C2C]/75">
            {meta.symbol} {active} · {meta.tagline}. Piezas publicadas, listas para consultar por WhatsApp.
          </p>
        </div>
        <CategoryTabs active={active} counts={counts} onChange={selectCategory} />
      </div>

      {loading ? (
        <div
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          aria-label={`Cargando ${active}`}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10">
          <StoreErrorPanel
            title={`No pudimos cargar ${active}`}
            message={error.message}
            detail={error.detail}
            onRetry={retry}
          />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-[#C5A059]/45 bg-[#FCFAF5] px-6 py-16 text-center shadow-[0_12px_30px_-20px_rgba(92,72,48,0.1)]">
          <div>
            <Sparkles size={26} className="mx-auto text-[#9E7B2F]" />
            <p className="mt-4 font-display text-2xl text-[#1A1A1A]">Próximamente en {active}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#2C2C2C]/75">
              Estamos preparando nuevas piezas para esta colección. Escríbenos y te avisamos primero.
            </p>
            {STORE_WHATSAPP && (
              <a
                href={`https://wa.me/${STORE_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, quiero que me avisen cuando haya novedades en ${active} de Holistic Store.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C5A059] px-6 py-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#1A1A1A] transition hover:bg-[#b58e45]"
              >
                <MessageCircle size={14} /> Avisarme por WhatsApp
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                template={template}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
          <p className="mt-8 text-center text-[11px] uppercase tracking-[.25em] text-[#2C2C2C]/65">
            Mostrando {products.length} {products.length === 1 ? "pieza" : "piezas"} de {active}
          </p>
        </>
      )}
    </div>
  );
}
