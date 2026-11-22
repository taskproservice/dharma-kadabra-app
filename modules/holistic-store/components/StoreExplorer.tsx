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
  /** Si el usuario cuenta con sesión activa para abrir el carrito directo al comprar. */
  isAuthenticated?: boolean;
  /** Error de la carga inicial (render del servidor); si existe, la tienda abre en estado de error. */
  initialError?: { message: string; detail?: string | null } | null;
};

/**
 * Explorador de la tienda: pestañas por categoría + grid de productos.
 *
 * CERO CARGA INNECESARIA: la primera categoría llega renderizada desde el
 * servidor y cada categoría adicional se pide a la API solo al seleccionarla
 * (solo piezas publicadas, máximo 35). Los resultados se cachean en memoria;
 * los errores se muestran con una pantalla elegante y opción de reintentar.
 */
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
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#C5A059]/20 pb-8">
        <div>
          <p className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#C5A059]">
            <span aria-hidden="true" className="h-px w-10 bg-[#C5A059]/60" />
            Holistic Store
          </p>
          <h2 className="mt-5 font-display text-4xl leading-none text-[#F7F3EA] sm:text-5xl">
            Explora la <em className="italic text-[#C5A059]">colección.</em>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#F7F3EA]/55">
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
        <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-[#C5A059]/25 bg-[#F7F3EA]/[0.02] px-6 py-16 text-center">
          <div>
            <Sparkles size={26} className="mx-auto text-[#C5A059]" />
            <p className="mt-4 font-display text-2xl text-[#F7F3EA]">Próximamente en {active}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#F7F3EA]/55">
              Estamos preparando nuevas piezas para esta colección. Escríbenos y te avisamos primero.
            </p>
            {STORE_WHATSAPP && (
              <a
                href={`https://wa.me/${STORE_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, quiero que me avisen cuando haya novedades en ${active} de Holistic Store.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#C5A059]/50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#e8cf92] transition hover:bg-[#C5A059] hover:text-[#121212]"
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
          <p className="mt-8 text-center text-[11px] uppercase tracking-[.25em] text-[#F7F3EA]/35">
            Mostrando {products.length} {products.length === 1 ? "pieza" : "piezas"} de {active}
          </p>
        </>
      )}
    </div>
  );
}
