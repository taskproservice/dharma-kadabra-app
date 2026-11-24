"use client";

import { useCallback, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { CATEGORY_META, STORE_WHATSAPP } from "../constants";
import type { CategoryTemplateMap, StoreCategory, StoreProduct } from "../types";
import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";
import { StoreErrorPanel } from "./StoreErrorPanel";

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

  const whatsappDigits = STORE_WHATSAPP.replace(/\D/g, "");
  const whatsappValid =
    whatsappDigits.length >= 10 &&
    !whatsappDigits.endsWith("1234567") &&
    !whatsappDigits.endsWith("12345678");

  return (
    <div id="tienda-holistica-catalogo" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-stone-200 pb-8">
        <div>
          <p className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-bronze">
            <span aria-hidden="true" className="h-px w-10 bg-gold/60" />
            Holistic Store
          </p>
          <h2 className="mt-5 font-display text-4xl leading-none text-ink sm:text-5xl">
            Explora la <em className="italic text-bronze">colección.</em>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink-muted">
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
            <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="aspect-[4/5] w-full animate-pulse bg-papyrus" />
              <div className="space-y-2.5 p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-papyrus" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-papyrus" />
                <div className="h-3 w-full animate-pulse rounded bg-papyrus" />
                <div className="h-9 w-full animate-pulse rounded-xl bg-papyrus" />
              </div>
            </div>
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
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div>
            <Sparkles size={26} className="mx-auto text-bronze" />
            <p className="mt-4 font-display text-2xl text-ink">Próximamente en {active}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-muted">
              Estamos preparando nuevas piezas para esta colección. Escríbenos y te avisamos primero.
            </p>
            {whatsappValid && (
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, quiero que me avisen cuando haya novedades en ${active} de Holistic Store.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[11px] font-semibold uppercase tracking-[.22em] text-ink transition hover:bg-gold-light"
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
                trackableView
              />
            ))}
          </div>
          <p className="mt-8 text-center text-[11px] uppercase tracking-[.25em] text-ink-muted/70">
            Mostrando {products.length} {products.length === 1 ? "pieza" : "piezas"} de {active}
          </p>
        </>
      )}
    </div>
  );
}
