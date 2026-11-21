"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus, RefreshCw, Search, ShoppingBag, Sparkles, Trash2, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ProductCardSkeleton } from "../ui/skeleton";
import { useCartStore, type Product } from "../../stores/cart";

type DbProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
};

const CATEGORIES = ["Todos", "Pulseras", "Collares", "Veladoras", "Runas"] as const;

const CATEGORY_EMOJI: Record<string, string> = {
  Pulseras: "◈",
  Collares: "✧",
  Veladoras: "☼",
  Runas: "ᚱ",
};

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

function toCartProduct(product: DbProduct): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    emoji: CATEGORY_EMOJI[product.category] ?? "✧",
    description: product.description,
    currency: "MXN",
    imageUrl: product.imageUrl || undefined,
  };
}

function ProductCard({
  product,
  added,
  onAdd,
}: {
  product: DbProduct;
  added: boolean;
  onAdd: (product: DbProduct) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(product.imageUrl) && !imgError;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#c7a45a]/20 bg-[#11182b]/80  backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#c7a45a]/60 hover:shadow-[0_20px_44px_-20px_rgba(0,0,0,0.55)]">
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#1c2438] to-[#c7a45a]/10">
        {showImage ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-5xl text-[#d8bc7f]" aria-hidden="true">
            {CATEGORY_EMOJI[product.category] ?? "✧"}
          </span>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#0b1020]/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.18em] text-[#e9d3a1] shadow-sm backdrop-blur-sm">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h2 className="line-clamp-1 font-display text-base leading-snug text-[#f7f2e7] sm:text-lg">{product.name}</h2>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#e9e2d2]/45">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-sm font-bold text-[#d8bc7f]">{money(product.price)}</span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          aria-label={`Agregar ${product.name} al carrito`}
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[.14em] transition-all duration-300 ${
            added
              ? "bg-emerald-600 text-white"
              : "border border-[#c7a45a]/45 bg-[#c7a45a]/12 text-[#e3c57c] hover:bg-[#c7a45a] hover:text-[#0b1020]"
          }`}
        >
          {added ? (
            <>
              <Check size={14} className="cart-pop" /> Agregado
            </>
          ) : (
            <>
              <Plus size={14} /> Agregar
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export function PosClient() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todos");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const addTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = useCartStore((state) => state.items);
  const add = useCartStore((state) => state.add);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "No fue posible cargar el catálogo.");
      }
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el catálogo.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => () => {
    if (addTimer.current) clearTimeout(addTimer.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) map.set(product.category, (map.get(product.category) ?? 0) + 1);
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const inCategory = category === "Todos" || product.category === category;
      const inQuery = !q || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [products, category, query]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const handleAdd = (product: DbProduct) => {
    add(toCartProduct(product));
    setJustAddedId(product.id);
    showToast(`${product.name} agregado al carrito`);
    if (addTimer.current) clearTimeout(addTimer.current);
    addTimer.current = setTimeout(() => setJustAddedId(null), 900);
  };

  const checkout = async () => {
    if (!items.length || checkoutState === "sending") return;
    setCheckoutState("sending");
    setCheckoutError(null);
    try {
      const response = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, title: item.name, quantity: item.quantity })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible registrar el cobro.");
      setCheckoutState("done");
      showToast("Venta registrada correctamente");
      clear();
      setTimeout(() => setCheckoutState("idle"), 2200);
    } catch (err) {
      setCheckoutState("error");
      setCheckoutError(err instanceof Error ? err.message : "No fue posible registrar el cobro.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col gap-6 xl:flex-row">
      {/* Catálogo */}
      <section className="min-w-0 flex-1" aria-label="Catálogo de productos">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#d8bc7f]">Terminal de venta</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-[#f7f2e7]">Punto de Venta</h1>
          </div>
          <div className="rounded-xl bg-white/[0.04] px-4 py-2 text-sm capitalize text-[#e9e2d2]/55">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>

        {/* Buscador + filtros de categoría */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-3 text-[#e9e2d2]/40" />
            <Input
              className="pl-9"
              placeholder="Buscar productos..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar productos"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por categoría">
            {CATEGORIES.map((item) => {
              const active = category === item;
              const itemCount = item === "Todos" ? products.length : (counts.get(item) ?? 0);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(item)}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active ? "border border-[#c7a45a]/55 bg-[#c7a45a]/18 text-[#f7f2e7] shadow-sm" : "bg-white/[0.04] hover:bg-white/[0.06]"
                  }`}
                >
                  {item}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-[#c7a45a]/20 text-[#e3c57c]" : "bg-white/[0.06] text-[#e9e2d2]/45"}`}>
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de productos: 5 columnas en pantallas grandes */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Cargando productos">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-[#c7a45a]/20 bg-white/[0.025] px-6 py-16 text-center">
            <div>
              <p className="font-display text-xl text-[#f7f2e7]">No pudimos cargar el catálogo</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#e9e2d2]/55">{error}</p>
              <Button variant="outline" className="mt-5" onClick={loadProducts}>
                <RefreshCw size={15} /> Reintentar
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-[#c7a45a]/20 bg-white/[0.025] px-6 py-16 text-center">
            <div>
              <Sparkles size={26} className="mx-auto text-[#d8bc7f]" />
              <p className="mt-3 font-display text-xl text-[#f7f2e7]">Aún no hay piezas en esta categoría</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#e9e2d2]/55">
                {category === "Todos"
                  ? "Cuando agregues productos desde la base de datos, aparecerán aquí."
                  : `La categoría ${category} todavía no tiene productos. Explora otra categoría o agrega piezas nuevas.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} added={justAddedId === product.id} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>

      {/* Carrito lateral */}
      <aside className="flex w-full flex-col rounded-2xl border border-[#c7a45a]/20 bg-[#11182b]/60 p-5  backdrop-blur-xl sm:p-6 xl:sticky xl:top-[92px] xl:h-[calc(100vh-116px)] xl:w-[370px] xl:shrink-0">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-[#f7f2e7]">
            <ShoppingBag size={20} className="text-[#d8bc7f]" /> Carrito
          </h2>
          <span
            key={count}
            aria-live="polite"
            className={`cart-pop rounded-full bg-[#c7a45a]/20 px-2.5 py-1 text-xs font-bold text-[#d8bc7f] ${count > 0 ? "" : ""}`}
          >
            {count}
          </span>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
          {items.length ? (
            items.map((item) => (
              <div
                key={`${item.id}-${item.quantity}`}
                className="cart-item-in rounded-2xl border border-[#c7a45a]/20 bg-white/[0.05] p-4"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#f7f2e7]">{item.name}</p>
                    <p className="mt-1 text-sm text-[#e9e2d2]/45">{money(item.price)} c/u</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar ${item.name}`}
                    onClick={() => remove(item.id)}
                    className="self-start rounded-lg p-1.5 text-[#e9e2d2]/40 transition hover:bg-red-500/15 hover:text-red-300"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Quitar uno de ${item.name}`}
                      onClick={() => decrement(item.id)}
                      className="grid size-7 place-items-center rounded-lg border border-[#c7a45a]/18 transition hover:bg-white/[0.06]"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Agregar uno de ${item.name}`}
                      onClick={() => add(item)}
                      className="grid size-7 place-items-center rounded-lg border border-[#c7a45a]/18 transition hover:bg-white/[0.06]"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-bold text-[#f7f2e7]">{money(item.price * item.quantity)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[#c7a45a]/20 px-4 text-center text-sm text-[#e9e2d2]/35">
              <div>
                <ShoppingBag size={26} className="mx-auto mb-2 opacity-50" />
                El carrito está vacío.
                <br />
                Agrega productos para comenzar.
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 shrink-0 space-y-3 border-t border-[#c7a45a]/18 pt-5">
          <div className="flex justify-between text-sm text-[#e9e2d2]/55">
            <span>Subtotal</span>
            <span aria-live="polite">{money(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#e9e2d2]/55">
            <span>Impuestos</span>
            <span>Incluidos</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-[#f7f2e7]">Total</span>
            <span key={subtotal} aria-live="polite" className="total-tick font-display text-2xl font-bold text-[#f7f2e7]">
              {money(subtotal)}
            </span>
          </div>
          {checkoutError && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300">
              {checkoutError}
            </p>
          )}
          <Button
            disabled={!items.length || checkoutState === "sending"}
            onClick={checkout}
            className="h-12 w-full bg-[#c7a45a] text-[#e9e2d2] hover:bg-[#c4a02e]"
          >
            {checkoutState === "sending" ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Registrando...
              </>
            ) : checkoutState === "done" ? (
              <>
                <Check size={18} /> Venta registrada
              </>
            ) : (
              <>
                <Wallet size={18} /> Cobrar
              </>
            )}
          </Button>
          <p className="flex items-center justify-center gap-1 text-center text-[11px] text-[#e9e2d2]/40">
            <Check size={12} /> Cobro seguro · Pago registrado al confirmar
          </p>
        </div>
      </aside>

      {/* Toast de feedback */}
      {toast && (
        <div
          role="status"
          className="toast-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-[#0b1020] px-5 py-3 text-sm font-medium text-[#f7f2e7] shadow-2xl"
        >
          <span className="grid size-6 place-items-center rounded-full bg-[#c7a45a] text-[#0b1020]">
            <Check size={13} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
