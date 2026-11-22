"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Check,
  Clapperboard,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  Minus,
  Package,
  Palette,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  Unlock,
  Wallet,
} from "lucide-react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { useCartStore } from "../../stores/cart";
import { CATEGORY_META, STORE_TEMPLATE_META } from "../../modules/holistic-store/constants";
import type {
  AdminProduct,
  CategoryTemplateMap,
  StoreCategory,
  StoreTemplateId,
} from "../../modules/holistic-store/types";
import { STORE_CATEGORIES } from "../../modules/holistic-store/types";
import { calcMargin, calcPriceFromMargin, formatPrice } from "../../modules/holistic-store/utils";
import { ProductCard } from "../../modules/holistic-store/components/ProductCard";

/** Categorías del Admin: tienda pública + heredadas del POS. */
const ADMIN_CATEGORIES = [...STORE_CATEGORIES, "Collares", "Veladoras"] as const;

const CATEGORY_EMOJI: Record<string, string> = {
  Pulseras: "◈",
  Cadenas: "✧",
  Runas: "ᚱ",
  Piedras: "⬢",
  Collares: "✧",
  Veladoras: "☼",
};

/** Stock igual o menor a este valor dispara la alerta "Por agotarse". */
const LOW_STOCK_THRESHOLD = 5;

type TabId = "inventario" | "plantillas" | "venta" | "video";

const TABS: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: "inventario", label: "Inventario", icon: Package },
  { id: "plantillas", label: "Plantillas", icon: Palette },
  { id: "venta", label: "Venta rápida", icon: ShoppingCart },
  { id: "video", label: "Video IA", icon: Clapperboard },
];

type StockLevel = "out" | "low" | "ok";

function stockLevel(product: AdminProduct): StockLevel {
  if (product.availability === "out_of_stock" || product.stock <= 0) return "out";
  if (product.stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

function StockBadge({ product }: { product: AdminProduct }) {
  const level = stockLevel(product);
  if (level === "out") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-red-800">
        <span className="size-1.5 rounded-full bg-red-400" /> Agotado
      </span>
    );
  }
  if (level === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-amber-800">
        <AlertTriangle size={11} /> Por agotarse · {product.stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-800">
      <span className="size-1.5 rounded-full bg-emerald-400" /> Stock · {product.stock}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Formulario de producto (alta / edición)                                    */
/* -------------------------------------------------------------------------- */

type ProductFormProps = {
  product: AdminProduct | null;
  trigger: React.ReactNode;
  notify: (message: string) => void;
  onSaved: () => void;
};

function ProductFormDialog({ product, trigger, notify, onSaved }: ProductFormProps) {
  const isEdit = product !== null;
  const [form, setForm] = useState({
    id: product?.id ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "Pulseras",
    price: product ? String(product.price) : "",
    cost: product ? String(product.cost) : "0",
    margin: product ? String(product.profitMargin) : "60",
    currency: product?.currency ?? "MXN",
    stock: product ? String(product.stock) : "0",
    availability: product?.availability ?? "available",
    published: product?.published ?? false,
    imageUrl: product?.imageUrl ?? "",
  });
  const [priceFromMargin, setPriceFromMargin] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  const costNum = Number(form.cost) || 0;
  const priceNum = Number(form.price) || 0;
  const marginNum = Number(form.margin) || 0;
  const liveMargin = priceFromMargin ? marginNum : calcMargin(costNum, priceNum);
  const effectivePrice = priceFromMargin ? calcPriceFromMargin(costNum, marginNum) : priceNum;

  const previewSrc = filePreview || form.imageUrl;

  const save = async (close: () => void) => {
    const price = Math.round(effectivePrice * 100) / 100;
    const cost = Math.max(0, costNum);
    const stock = Math.max(0, Math.floor(Number(form.stock) || 0));
    if (!form.name.trim()) return setFormError("El nombre es obligatorio.");
    if (!isEdit && form.id.trim() && !/^[a-z0-9][a-z0-9-_]*$/i.test(form.id.trim())) {
      return setFormError("El ID solo admite letras, números, guiones y guion bajo.");
    }
    if (!(price >= 0)) return setFormError("Revisa el precio de venta.");
    if (priceFromMargin && !(marginNum > 0 && marginNum < 100)) {
      return setFormError("El margen debe estar entre 1 y 99 para calcular el precio.");
    }

    setSaving(true);
    setFormError(null);
    try {
      const response = await fetch("/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: product.id } : form.id.trim() ? { id: form.id.trim() } : {}),
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          price,
          cost,
          profitMargin: Math.round(liveMargin * 10) / 10,
          currency: form.currency,
          stock,
          availability: stock === 0 ? "out_of_stock" : form.availability,
          published: form.published,
          imageUrl: form.imageUrl.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible guardar el producto.");
      notify(isEdit ? "Producto actualizado" : "Producto creado");
      onSaved();
      close();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No fue posible guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.16em] text-[#2C2C2C]/70";
  const selectClass =
    "field-dark h-10 w-full rounded-xl px-3 text-sm";

  return (
    <Dialog trigger={trigger} title={isEdit ? "Editar producto" : "Nuevo producto"}>
      {(close) => (
        <div className="space-y-4">
          {!isEdit && (
            <div>
              <label htmlFor="f-id" className={label}>ID (opcional · se genera solo si se deja vacío)</label>
              <Input
                id="f-id"
                value={form.id}
                onChange={(e) => set("id", e.target.value)}
                placeholder="pulsera-obsidiana"
                className="font-mono text-xs"
              />
            </div>
          )}
          <div>
            <label htmlFor="f-name" className={label}>Nombre *</label>
            <Input id="f-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Pulsera de Obsidiana" />
          </div>
          <div>
            <label htmlFor="f-desc" className={label}>Descripción corta</label>
            <textarea
              id="f-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Obsidiana negra · protección y arraigo"
              rows={2}
              maxLength={500}
              className="field-dark w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-cat" className={label}>Categoría</label>
              <select id="f-cat" value={form.category} onChange={(e) => set("category", e.target.value)} className={selectClass}>
                {ADMIN_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-cur" className={label}>Moneda</label>
              <select id="f-cur" value={form.currency} onChange={(e) => set("currency", e.target.value)} className={selectClass}>
                <option value="MXN">MXN · Pesos</option>
                <option value="USD">USD · Dólares</option>
              </select>
            </div>
          </div>

          {/* Precio / costo / margen */}
          <div className="rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#8B6914]">
                Precio · Costo · Margen
              </p>
              <button
                type="button"
                onClick={() => setPriceFromMargin((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C5A059]/50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-[#8B6914] transition hover:bg-[#C5A059]/10"
                title={priceFromMargin ? "Fijar el precio manualmente" : "Calcular el precio desde el margen"}
              >
                {priceFromMargin ? <Lock size={12} /> : <Unlock size={12} />}
                {priceFromMargin ? "Precio auto" : "Precio manual"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="f-cost" className={label}>Costo</label>
                <Input id="f-cost" type="number" min="0" step="0.01" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
              </div>
              <div>
                <label htmlFor="f-price" className={label}>
                  Precio {priceFromMargin && "(auto)"}
                </label>
                <Input
                  id="f-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceFromMargin ? effectivePrice.toFixed(2) : form.price}
                  onChange={(e) => set("price", e.target.value)}
                  disabled={priceFromMargin}
                  className={priceFromMargin ? "opacity-70" : ""}
                />
              </div>
              <div>
                <label htmlFor="f-margin" className={label}>
                  Margen % {!priceFromMargin && "(auto)"}
                </label>
                <Input
                  id="f-margin"
                  type="number"
                  min="0"
                  max="99"
                  step="0.5"
                  value={priceFromMargin ? form.margin : liveMargin.toFixed(1)}
                  onChange={(e) => set("margin", e.target.value)}
                  disabled={!priceFromMargin}
                  className={!priceFromMargin ? "opacity-70" : ""}
                />
              </div>
            </div>
            <p className="mt-2.5 text-xs leading-5 text-[#2C2C2C]/70">
              {priceFromMargin
                ? `Precio sugerido: ${formatPrice(effectivePrice, form.currency)} con ${marginNum}% de margen.`
                : `Margen actual: ${liveMargin.toFixed(1)}% · Ganancia: ${formatPrice(Math.max(0, priceNum - costNum), form.currency)} por pieza.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-stock" className={label}>Stock</label>
              <Input id="f-stock" type="number" min="0" step="1" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
            <div>
              <label htmlFor="f-avail" className={label}>Disponibilidad</label>
              <select id="f-avail" value={form.availability} onChange={(e) => set("availability", e.target.value)} className={selectClass}>
                <option value="available">Disponible</option>
                <option value="out_of_stock">Agotado</option>
              </select>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label htmlFor="f-img" className={label}>Imagen (URL)</label>
            <div className="flex gap-3">
              <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#C5A059]/35 bg-[#1c2438]">
                {previewSrc && !imgError ? (
                  <Image src={previewSrc} alt="Vista previa" fill sizes="80px" className="object-cover" onError={() => setImgError(true)} />
                ) : (
                  <ImagePlus size={20} className="text-[#2C2C2C]/45" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  id="f-img"
                  value={form.imageUrl}
                  onChange={(e) => { set("imageUrl", e.target.value); setImgError(false); }}
                  placeholder="/images/productos/mi-pieza.jpg"
                  className="font-mono text-xs"
                />
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[#2C2C2C]/70 transition hover:text-[#8B6914]">
                  <ImagePlus size={14} /> Previsualizar archivo local
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (filePreview) URL.revokeObjectURL(filePreview);
                        setFilePreview(URL.createObjectURL(file));
                        setImgError(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-[#2C2C2C]/60">
              Sube la imagen a <span className="font-mono">public/images/</span> y pega aquí su ruta. Sin imagen se muestra un ornamento dorado.
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-[#1A1A1A]">Publicado en la tienda</span>
              <span className="block text-xs text-[#2C2C2C]/70">Solo las piezas publicadas aparecen en la web.</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.published}
              onClick={() => set("published", !form.published)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${form.published ? "bg-[#C5A059]" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${form.published ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </label>

          {formError && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-800">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={close}>Cancelar</Button>
            <Button variant="gold" type="button" onClick={() => save(close)} disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pestaña: Inventario                                                        */
/* -------------------------------------------------------------------------- */

function InventoryTab({
  products,
  loading,
  notify,
  reload,
}: {
  products: AdminProduct[];
  loading: boolean;
  notify: (message: string) => void;
  reload: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const inCategory = category === "Todas" || p.category === category;
      const inQuery = !q || `${p.id} ${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [products, query, category]);

  const alerts = useMemo(() => {
    let out = 0;
    let low = 0;
    for (const p of products) {
      const level = stockLevel(p);
      if (level === "out") out += 1;
      else if (level === "low") low += 1;
    }
    return { out, low };
  }, [products]);

  const togglePublished = async (product: AdminProduct) => {
    setBusyId(product.id);
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, published: !product.published }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible actualizar.");
      notify(product.published ? "Producto ocultado de la tienda" : "Producto publicado");
      reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : "No fue posible actualizar.");
    } finally {
      setBusyId(null);
    }
  };

  const adjustStock = async (product: AdminProduct, delta: number) => {
    const stock = Math.max(0, product.stock + delta);
    setBusyId(product.id);
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, stock }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No fue posible ajustar el stock.");
      }
      reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : "No fue posible ajustar el stock.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible eliminar.");
      notify("Producto eliminado");
      setConfirmDeleteId(null);
      reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : "No fue posible eliminar.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {/* Alertas + filtros */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-3 text-[#2C2C2C]/60" />
          <Input className="pl-9" placeholder="Buscar por nombre, ID o descripción…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar productos" />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoría"
            className="field-dark h-10 rounded-xl px-3 text-sm"
          >
            <option value="Todas">Todas las categorías</option>
            {ADMIN_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${alerts.out > 0 ? "bg-red-500/15 text-red-800" : "bg-[#FCFAF5] text-[#2C2C2C]/65"}`}>
            <span className="size-1.5 rounded-full bg-current" /> {alerts.out} agotados
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${alerts.low > 0 ? "bg-amber-500/15 text-amber-800" : "bg-[#FCFAF5] text-[#2C2C2C]/65"}`}>
            <AlertTriangle size={12} /> {alerts.low} por agotarse
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-label="Cargando inventario">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-[#C5A059]/35 bg-white/[0.025] px-6 py-16 text-center">
          <div>
            <Package size={26} className="mx-auto text-[#8B6914]" />
            <p className="mt-3 font-display text-xl text-[#1A1A1A]">Sin productos por aquí</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#2C2C2C]/70">
              {products.length === 0 ? "Crea tu primer producto con el botón «Nuevo producto»." : "Ningún producto coincide con tu búsqueda."}
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((product) => (
            <li
              key={product.id}
              className={`flex flex-col gap-4 rounded-2xl border bg-[#FCFAF5] p-4 backdrop-blur-xl sm:p-5 lg:flex-row lg:items-center ${
                stockLevel(product) === "out" ? "border-red-400/25" : stockLevel(product) === "low" ? "border-amber-400/25" : "border-[#C5A059]/30"
              }`}
            >
              {/* Identidad */}
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#C5A059]/35 bg-[#1c2438]">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <span className="text-xl text-[#8B6914]">{CATEGORY_EMOJI[product.category] ?? "✧"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-[10px] uppercase tracking-[.16em] text-[#8B6914]" title={product.id}>
                    #{product.id}
                  </p>
                  <h3 className="truncate font-display text-lg leading-snug text-[#1A1A1A]">{product.name}</h3>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#2C2C2C]/70">
                    <span className="rounded-full bg-[#EDE5D7]/80 px-2 py-0.5">{product.category}</span>
                    <StockBadge product={product} />
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${product.published ? "bg-[#C5A059]/15 text-[#8B6914]" : "bg-[#FCFAF5] text-[#2C2C2C]/65"}`}>
                      {product.published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {product.published ? "Publicado" : "Oculto"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Comercial */}
              <div className="grid shrink-0 grid-cols-3 gap-4 rounded-xl bg-[#FCFAF5] px-4 py-3 text-center lg:w-72">
                <div>
                  <p className="text-[10px] uppercase tracking-[.14em] text-[#2C2C2C]/60">Precio</p>
                  <p className="mt-0.5 text-sm font-bold text-[#8B6914]">{formatPrice(product.price, product.currency)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[.14em] text-[#2C2C2C]/60">Costo</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#2C2C2C]/85">{formatPrice(product.cost, product.currency)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[.14em] text-[#2C2C2C]/60">Margen</p>
                  <p className="mt-0.5 text-sm font-semibold text-emerald-800">{product.profitMargin.toFixed(1)}%</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-[#C5A059]/35 px-2 py-1.5">
                  <button type="button" aria-label={`Quitar uno del stock de ${product.name}`} onClick={() => adjustStock(product, -1)} disabled={busyId === product.id || product.stock === 0} className="grid size-7 place-items-center rounded-lg transition hover:bg-white/[0.07] disabled:opacity-40">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold" aria-live="polite">{product.stock}</span>
                  <button type="button" aria-label={`Agregar uno al stock de ${product.name}`} onClick={() => adjustStock(product, 1)} disabled={busyId === product.id} className="grid size-7 place-items-center rounded-lg transition hover:bg-white/[0.07] disabled:opacity-40">
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => togglePublished(product)}
                  disabled={busyId === product.id}
                  title={product.published ? "Ocultar de la tienda" : "Publicar en la tienda"}
                  className="grid size-10 place-items-center rounded-xl border border-[#C5A059]/45 text-[#8B6914] transition hover:bg-[#C5A059]/10 disabled:opacity-40"
                >
                  {busyId === product.id ? <Loader2 size={15} className="animate-spin" /> : product.published ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <ProductFormDialog
                  product={product}
                  notify={notify}
                  onSaved={reload}
                  trigger={
                    <span className="grid size-10 place-items-center rounded-xl border border-[#C5A059]/45 text-[#2C2C2C]/85 transition hover:border-[#C5A059]/60 hover:text-[#8B6914]" title={`Editar ${product.name}`}>
                      <Pencil size={15} />
                    </span>
                  }
                />
                {confirmDeleteId === product.id ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Button variant="danger" size="sm" onClick={() => remove(product.id)} disabled={busyId === product.id}>
                      {busyId === product.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Confirmar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>No</Button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(product.id)}
                    title={`Eliminar ${product.name}`}
                    className="grid size-10 place-items-center rounded-xl border border-red-400/25 text-red-800/80 transition hover:bg-red-500/15"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pestaña: Plantillas visuales                                               */
/* -------------------------------------------------------------------------- */

const SAMPLE_PRODUCT = (
  category: StoreCategory,
  products: AdminProduct[],
): AdminProduct =>
  products.find((p) => p.category === category) ?? {
    id: `demo-${category.toLowerCase()}`,
    name: `Pieza de ${category}`,
    description: "Vista previa de demostración · agrega productos para ver piezas reales",
    price: 350,
    cost: 0,
    profitMargin: 0,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 1,
    imageUrl: "",
    category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

function TemplatesTab({ products, notify }: { products: AdminProduct[]; notify: (m: string) => void }) {
  const [styles, setStyles] = useState<CategoryTemplateMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/store/templates", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (data?.styles) setStyles(data.styles);
      } catch {
        /* conserva los valores por defecto ("oro") */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/store/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styles: STORE_CATEGORIES.map((category) => ({
            category,
            template: styles[category] ?? "oro",
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible guardar.");
      notify("Plantillas actualizadas en la tienda");
    } catch (err) {
      notify(err instanceof Error ? err.message : "No fue posible guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2" aria-label="Cargando plantillas">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C5A059]/35 bg-[#FCFAF5] p-5">
        <div>
          <h2 className="font-display text-xl text-[#1A1A1A]">Plantillas de tarjeta por categoría</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[#2C2C2C]/70">
            Elige cómo se ven las tarjetas de cada colección en la tienda pública. La vista previa usa una pieza real de tu inventario.
          </p>
        </div>
        <Button variant="gold" onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {saving ? "Guardando…" : "Guardar plantillas"}
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {STORE_CATEGORIES.map((category) => {
          const current: StoreTemplateId = styles[category] ?? "oro";
          return (
            <article key={category} className="overflow-hidden rounded-2xl border border-[#C5A059]/35 bg-[#F4EFE6]/80">
              <div className="flex items-center justify-between border-b border-[#C5A059]/30 px-5 py-3.5">
                <h3 className="font-display text-lg text-[#1A1A1A]">
                  <span className="mr-2 text-[#8B6914]">{CATEGORY_META[category].symbol}</span>
                  {category}
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#2C2C2C]/65">
                  {STORE_TEMPLATE_META.find((t) => t.id === current)?.name}
                </span>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-[180px_1fr]">
                <div className="mx-auto w-full max-w-[180px]">
                  <ProductCard product={SAMPLE_PRODUCT(category, products)} template={current} />
                </div>
                <div className="space-y-2.5" role="radiogroup" aria-label={`Plantilla para ${category}`}>
                  {STORE_TEMPLATE_META.map((template) => {
                    const selected = current === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setStyles((prev) => ({ ...prev, [category]: template.id }))}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                          selected
                            ? "border-[#C5A059]/70 bg-[#C5A059]/10"
                            : "border-[#2C2C2C]/15 bg-[#F4EFE6]/60 hover:border-[#C5A059]/40"
                        }`}
                      >
                        <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                          {template.swatches.map((color) => (
                            <span key={color} className="size-6 rounded-full border border-black/40" style={{ backgroundColor: color }} />
                          ))}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-[#1A1A1A]">{template.name}</span>
                          <span className="block truncate text-xs text-[#2C2C2C]/70">{template.description}</span>
                        </span>
                        {selected && <Check size={16} className="ml-auto shrink-0 text-[#8B6914]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pestaña: Venta rápida (POS interno del staff)                              */
/* -------------------------------------------------------------------------- */

function QuickSaleTab({ products, notify, reload }: { products: AdminProduct[]; notify: (m: string) => void; reload: () => void }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [saleError, setSaleError] = useState<string | null>(null);
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const sellable = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => !q || `${p.name} ${p.id} ${p.category}`.toLowerCase().includes(q))
      .sort((a, b) => Number(a.stock <= 0) - Number(b.stock <= 0) || a.name.localeCompare(b.name));
  }, [products, query]);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const currency = item.currency ?? "MXN";
      map.set(currency, (map.get(currency) ?? 0) + item.price * item.quantity);
    }
    return [...map.entries()];
  }, [items]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = async () => {
    if (!items.length || state === "sending") return;
    setState("sending");
    setSaleError(null);
    try {
      const response = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, title: item.name, quantity: item.quantity })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible registrar la venta.");
      setState("done");
      notify("Venta registrada y stock descontado");
      clear();
      reload();
      setTimeout(() => setState("idle"), 2400);
    } catch (err) {
      setState("error");
      setSaleError(err instanceof Error ? err.message : "No fue posible registrar la venta.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {/* Selector de piezas */}
      <section aria-label="Piezas para venta presencial" className="min-w-0">
        <div className="relative mb-4">
          <Search size={17} className="absolute left-3 top-3 text-[#2C2C2C]/60" />
          <Input className="pl-9" placeholder="Buscar pieza para vender…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar pieza" />
        </div>
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto overscroll-contain pr-1">
          {sellable.map((product) => {
            const soldOut = product.stock <= 0 || product.availability === "out_of_stock";
            return (
              <li
                key={product.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                  soldOut ? "border-[#2C2C2C]/12 bg-[#F4EFE6]/50 opacity-55" : "border-[#C5A059]/30 bg-[#FCFAF5] hover:border-[#C5A059]/40"
                }`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#FCFAF5] text-lg text-[#8B6914]" aria-hidden="true">
                  {CATEGORY_EMOJI[product.category] ?? "✧"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1A1A1A]">{product.name}</p>
                  <p className="mt-0.5 text-xs text-[#2C2C2C]/70">
                    {formatPrice(product.price, product.currency)} · {soldOut ? "Agotado" : `Stock: ${product.stock}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={soldOut}
                  onClick={() =>
                    add({
                      id: product.id,
                      name: product.name,
                      category: product.category,
                      price: product.price,
                      emoji: CATEGORY_EMOJI[product.category] ?? "✧",
                      description: product.description,
                      currency: product.currency === "USD" ? "USD" : "MXN",
                      imageUrl: product.imageUrl || undefined,
                    })
                  }
                >
                  <Plus size={14} /> Agregar
                </Button>
              </li>
            );
          })}
          {sellable.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#C5A059]/35 px-4 py-10 text-center text-sm text-[#2C2C2C]/65">
              Sin piezas que coincidan con tu búsqueda.
            </li>
          )}
        </ul>
      </section>

      {/* Carrito del staff */}
      <aside aria-label="Carrito de venta presencial" className="flex h-fit flex-col rounded-2xl border border-[#C5A059]/35 bg-[#FCFAF5] p-5 backdrop-blur-xl xl:sticky xl:top-[92px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl text-[#1A1A1A]">
            <Wallet size={19} className="text-[#8B6914]" /> Venta presencial
          </h2>
          <span className="rounded-full bg-[#C5A059]/20 px-2.5 py-1 text-xs font-bold text-[#8B6914]" aria-live="polite">{count}</span>
        </div>
        <p className="mb-4 rounded-xl bg-[#C5A059]/8 px-3 py-2 text-[11px] leading-5 text-[#2C2C2C]/70">
          Carrito interno del staff: no es visible en la web pública. Al cobrar se descuenta el stock automáticamente.
        </p>
        <div className="max-h-64 space-y-2.5 overflow-y-auto overscroll-contain pr-1">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#C5A059]/30 bg-[#FCFAF5] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-[#1A1A1A]">{item.name}</p>
                  <button type="button" aria-label={`Quitar ${item.name}`} onClick={() => remove(item.id)} className="rounded-lg p-1 text-[#2C2C2C]/60 transition hover:bg-red-500/15 hover:text-red-800">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <button type="button" aria-label="Quitar uno" onClick={() => decrement(item.id)} className="grid size-6 place-items-center rounded-lg border border-[#C5A059]/35 transition hover:bg-[#EDE5D7]/80">
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                    <button type="button" aria-label="Agregar uno" onClick={() => add(item)} className="grid size-6 place-items-center rounded-lg border border-[#C5A059]/35 transition hover:bg-[#EDE5D7]/80">
                      <Plus size={12} />
                    </button>
                  </span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{formatPrice(item.price * item.quantity, item.currency ?? "MXN")}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-[#C5A059]/35 px-4 py-8 text-center text-xs leading-5 text-[#2C2C2C]/60">
              El carrito está vacío.<br />Agrega piezas para comenzar la venta.
            </p>
          )}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-[#C5A059]/30 pt-4">
          {totals.map(([currency, total]) => (
            <div key={currency} className="flex items-baseline justify-between">
              <span className="text-sm text-[#2C2C2C]/70">Total {currency}</span>
              <span className="font-display text-xl font-bold text-[#1A1A1A]">{formatPrice(total, currency)}</span>
            </div>
          ))}
          {totals.length === 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#2C2C2C]/70">Total</span>
              <span className="font-display text-xl font-bold text-[#1A1A1A]">{formatPrice(0, "MXN")}</span>
            </div>
          )}
        </div>
        {saleError && (
          <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-800">{saleError}</p>
        )}
        <Button variant="gold" className="mt-4 h-12 w-full" disabled={!items.length || state === "sending"} onClick={checkout}>
          {state === "sending" ? (<><Loader2 size={16} className="animate-spin" /> Registrando…</>) : state === "done" ? (<><Check size={16} /> Venta registrada</>) : (<><Wallet size={16} /> Cobrar venta</>)}
        </Button>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pestaña: Generador de video IA (UI + demo)                                 */
/* -------------------------------------------------------------------------- */

const VIDEO_PHASES = ["Escribiendo el guion…", "Generando escenas…", "Etalonaje dorado…", "Mezclando audio ritual…"];

function VideoTab({ notify }: { notify: (m: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematográfico dorado");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [history, setHistory] = useState<{ prompt: string; style: string; date: string }[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const generate = () => {
    if (!prompt.trim() || status === "processing") return;
    setStatus("processing");
    setProgress(0);
    setPhase(0);
    const started = Date.now();
    const DURATION = 5200;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      const elapsed = Date.now() - started;
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setProgress(pct);
      setPhase(Math.min(VIDEO_PHASES.length - 1, Math.floor((elapsed / DURATION) * VIDEO_PHASES.length)));
      if (pct >= 100) {
        if (timer.current) clearInterval(timer.current);
        setStatus("done");
        setHistory((prev) => [{ prompt: prompt.trim(), style, date: new Date().toLocaleString("es-MX") }, ...prev].slice(0, 5));
        notify("Video comercial de demostración listo");
      }
    }, 120);
  };

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setStatus("idle");
    setProgress(0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* Formulario */}
      <section aria-label="Generar video comercial" className="h-fit rounded-2xl border border-[#C5A059]/35 bg-[#FCFAF5] p-5 backdrop-blur-xl sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-xl text-[#1A1A1A]">
          <Sparkles size={19} className="text-[#8B6914]" /> Generar Video Comercial
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-[#2C2C2C]/70">
          Describe el comercial y la IA lo produce con la estética Dharma Kadabra. Demo funcional: la API externa de video se conecta después.
        </p>
        <label htmlFor="video-prompt" className="mb-1.5 mt-5 block text-[11px] font-semibold uppercase tracking-[.16em] text-[#2C2C2C]/70">
          Descripción del video
        </label>
        <textarea
          id="video-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="Ej. Comercial de 30 segundos: travelling sobre pulseras de obsidiana y cuarzo entre velas, destellos dorados, texto final «Holistic Store · Piezas con intención»…"
          className="field-dark w-full rounded-xl px-3 py-2.5 text-sm leading-6"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="video-style" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.16em] text-[#2C2C2C]/70">Estilo</label>
            <select id="video-style" value={style} onChange={(e) => setStyle(e.target.value)} className="field-dark h-10 w-full rounded-xl px-3 text-sm">
              <option>Cinematográfico dorado</option>
              <option>Ritual minimalista</option>
              <option>Editorial papiro</option>
              <option>Fuego nocturno</option>
            </select>
          </div>
          <div>
            <label htmlFor="video-duration" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.16em] text-[#2C2C2C]/70">Duración</label>
            <select id="video-duration" className="field-dark h-10 w-full rounded-xl px-3 text-sm" defaultValue="30 segundos">
              <option>15 segundos</option>
              <option>30 segundos</option>
              <option>60 segundos</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="gold" onClick={generate} disabled={!prompt.trim() || status === "processing"} className="flex-1">
            {status === "processing" ? (<><Loader2 size={15} className="animate-spin" /> Procesando… {progress}%</>) : (<><Clapperboard size={15} /> Generar video</>)}
          </Button>
          {(status === "processing" || status === "done") && (
            <Button variant="outline" onClick={reset}><RefreshCw size={15} /> Nuevo</Button>
          )}
        </div>
        {status === "processing" && (
          <div className="mt-4" role="status" aria-label="Generando video">
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 animate-pulse text-xs text-[#8B6914]">{VIDEO_PHASES[phase]}</p>
          </div>
        )}
      </section>

      {/* Resultado + historial */}
      <div className="space-y-5">
        <section aria-label="Vista previa del video" className="overflow-hidden rounded-2xl border border-[#C5A059]/35 bg-[#FCFAF5]">
          <div className="relative grid aspect-video place-items-center overflow-hidden">
            <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(197,160,89,.22),transparent_70%),linear-gradient(150deg,#F4EFE6,#E5DBC9)]" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-5 border border-[#C5A059]/45" />
            {status === "done" ? (
              <div className="relative px-8 text-center">
                <button
                  type="button"
                  onClick={() => notify("Reproducción demo: conecta la API de video para ver el comercial real")}
                  aria-label="Reproducir video de demostración"
                  className="group mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] text-[#1A1A1A] shadow-[0_0_50px_-10px_rgba(199,164,90,.7)] transition hover:scale-105"
                >
                  <Play size={30} className="ml-1" />
                </button>
                <p className="mt-4 inline-block rounded-full bg-[#C5A059]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-[#8B6914]">
                  Video demo · {style}
                </p>
                <p className="mx-auto mt-3 max-w-md truncate font-display text-lg italic text-[#1A1A1A]/85" title={prompt}>“{prompt}”</p>
              </div>
            ) : (
              <div className="relative px-8 text-center">
                <Clapperboard size={40} className="mx-auto text-[#8B6914]/50" />
                <p className="mt-3 font-display text-xl text-[#1A1A1A]/80">
                  {status === "processing" ? "Creando tu comercial…" : "Tu comercial aparecerá aquí"}
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#2C2C2C]/65">
                  {status === "processing" ? VIDEO_PHASES[phase] : "Describe el video y pulsa «Generar video»."}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C5A059]/30 px-5 py-3.5">
            <p className="text-[11px] leading-5 text-[#2C2C2C]/65">
              Estado: <span className="font-semibold text-[#8B6914]">{status === "idle" ? "En espera" : status === "processing" ? "Procesando" : "Listo (demo)"}</span>
              {" "}· La generación real requiere conectar la API externa de video.
            </p>
            <Button variant="outline" size="sm" disabled title="Disponible al conectar la API externa de video">
              Descargar
            </Button>
          </div>
        </section>

        {history.length > 0 && (
          <section aria-label="Historial de videos" className="rounded-2xl border border-[#C5A059]/30 bg-[#EDE5D7]/70 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#2C2C2C]/70">Generados en esta sesión</h3>
            <ul className="mt-3 space-y-2.5">
              {history.map((item, i) => (
                <li key={`${item.date}-${i}`} className="flex items-start justify-between gap-3 rounded-xl bg-[#FCFAF5] px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[#1A1A1A]/85" title={item.prompt}>“{item.prompt}”</p>
                    <p className="mt-1 text-[11px] text-[#2C2C2C]/65">{item.style} · {item.date}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setPrompt(item.prompt); setStyle(item.style); reset(); }}>
                    Reutilizar
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contenedor principal                                                       */
/* -------------------------------------------------------------------------- */

export function InventarioClient() {
  const [tab, setTab] = useState<TabId>("inventario");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible cargar el inventario.");
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el inventario.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8B6914]">Holistic Store · Administración</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#1A1A1A]">Inventario</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadProducts} disabled={loading} title="Recargar inventario">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Recargar
          </Button>
          {tab === "inventario" && (
            <ProductFormDialog
              product={null}
              notify={notify}
              onSaved={loadProducts}
              trigger={
                <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] px-4 text-sm font-semibold text-[#1A1A1A] shadow-[0_10px_30px_-14px_rgba(199,164,90,.7)] transition hover:brightness-110">
                  <Plus size={16} /> Nuevo producto
                </span>
              }
            />
          )}
        </div>
      </div>

      {/* Pestañas */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Secciones del inventario">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border border-[#C5A059]/55 bg-[#C5A059]/18 text-[#1A1A1A] shadow-sm"
                  : "border border-transparent bg-[#FCFAF5] text-[#2C2C2C]/75 hover:bg-white/[0.07] hover:text-[#1A1A1A]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#8B6914]" : ""} />
              {label}
            </button>
          );
        })}
      </div>

      {error && tab === "inventario" ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-[#C5A059]/35 bg-white/[0.025] px-6 py-16 text-center">
          <div>
            <p className="font-display text-xl text-[#1A1A1A]">No pudimos cargar el inventario</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#2C2C2C]/70">{error}</p>
            <Button variant="outline" className="mt-5" onClick={loadProducts}>
              <RefreshCw size={15} /> Reintentar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {tab === "inventario" && <InventoryTab products={products} loading={loading} notify={notify} reload={loadProducts} />}
          {tab === "plantillas" && <TemplatesTab products={products} notify={notify} />}
          {tab === "venta" && <QuickSaleTab products={products} notify={notify} reload={loadProducts} />}
          {tab === "video" && <VideoTab notify={notify} />}
        </>
      )}

      {/* Toast */}
      {toast && (
        <p role="status" className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#C5A059]/40 bg-[#F4EFE6]/95 px-5 py-3 text-sm text-[#1A1A1A] shadow-2xl backdrop-blur-xl">
          <Check size={15} className="text-emerald-800" /> {toast}
        </p>
      )}
    </div>
  );
}
