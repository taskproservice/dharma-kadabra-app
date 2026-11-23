"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  BarChart3,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import type { AdminProduct } from "../../modules/holistic-store/types";
import { STORE_CATEGORIES } from "../../modules/holistic-store/types";
import { formatPrice } from "../../modules/holistic-store/utils";

interface AnalyticsSummary {
  totalVisits: number;
  visitsLast7Days: number;
  topProducts: { id: string; name: string; views: number }[];
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ADMIN_CATEGORIES = [...STORE_CATEGORIES, "Collares", "Veladoras"];

/** Panel Marketing · inventario, visibilidad de la tienda y KPIs comerciales. */
export function MarketingClient({ initialProducts, initialAnalytics }: { initialProducts: AdminProduct[]; initialAnalytics: AnalyticsSummary }) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(initialAnalytics);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Formulario "Subir Producto"
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Pulseras",
    price: "",
    stock: "",
    imageUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catalogResponse, analyticsResponse] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/analytics", { cache: "no-store" }),
      ]);
      const catalog = await catalogResponse.json().catch(() => ({}));
      if (!catalogResponse.ok) throw new Error(catalog?.error || "No fue posible cargar el inventario.");
      setProducts(Array.isArray(catalog.products) ? catalog.products : []);
      if (analyticsResponse.ok) {
        const summary = await analyticsResponse.json().catch(() => null);
        if (summary && typeof summary.totalVisits === "number") setAnalytics(summary);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "No fue posible cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => !q || `${product.id} ${product.name} ${product.description}`.toLowerCase().includes(q));
  }, [products, query]);

  const outCount = products.filter((product) => product.stock <= 0).length;

  const pickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setFormError(null);
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      return setFormError("Formato no soportado. Usa JPEG, PNG o WebP.");
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      return setFormError("La imagen supera el máximo permitido de 5 MB.");
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const resetForm = () => {
    if (preview) URL.revokeObjectURL(preview);
    setForm({ name: "", description: "", category: "Pulseras", price: "", stock: "", imageUrl: "" });
    setFile(null);
    setPreview(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (): Promise<string> => {
    if (!file) return form.imageUrl.trim();
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/products/upload", { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "No fue posible subir la imagen.");
    return data.url as string;
  };

  const createProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const price = Math.round((Number(form.price) || 0) * 100) / 100;
    const stock = Math.max(0, Math.floor(Number(form.stock) || 0));
    if (form.name.trim().length < 2) return setFormError("El nombre del producto es obligatorio.");
    if (!(price >= 0)) return setFormError("Revisa el precio de venta.");
    if (!form.category) return setFormError("Elige una categoría.");

    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          price,
          cost: 0,
          currency: "MXN",
          stock,
          availability: stock === 0 ? "out_of_stock" : "available",
          published: true,
          isVisible: true,
          imageUrl,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible crear el producto.");
      notify(`Producto «${data.product.name}» subido a la tienda`);
      setIsCreating(false);
      resetForm();
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible crear el producto.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (product: AdminProduct) => {
    if (busyId) return;
    setBusyId(product.id);
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, isVisible: !product.isVisible }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible actualizar la visibilidad.");
      notify(product.isVisible ? `«${product.name}» oculto de la tienda` : `«${product.name}» visible en la tienda`);
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : "No fue posible actualizar la visibilidad.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (product: AdminProduct) => {
    if (busyId) return;
    setBusyId(product.id);
    try {
      const response = await fetch(`/api/products?id=${encodeURIComponent(product.id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible eliminar el producto.");
      notify(`«${product.name}» eliminado`);
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : "No fue posible eliminar el producto.");
    } finally {
      setBusyId(null);
    }
  };

  const topProduct = analytics.topProducts[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#d8bc7f]">Panel Marketing · Community Manager</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#f7f2e7]">Inventario y visibilidad</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e9e2d2]/55">
            Sube piezas, controla qué aparecen en la tienda pública y mira cómo se mueve la audiencia.
          </p>
        </div>
        <Button variant="gold" onClick={() => setIsCreating((value) => !value)}>
          <Plus size={16} /> Subir producto
        </Button>
      </header>

      {/* KPIs */}
      <section aria-label="Indicadores de marketing" className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Visitas a la tienda</CardDescription>
              <CardTitle className="mt-2 font-display text-3xl">{analytics.totalVisits}</CardTitle>
            </div>
            <span className="grid size-11 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
              <ShoppingBag size={20} />
            </span>
          </CardHeader>
          <CardContent><p className="text-xs text-[#e9e2d2]/45">{analytics.visitsLast7Days} en los últimos 7 días.</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Producto más visto</CardDescription>
              <CardTitle className="mt-2 truncate font-display text-2xl">{topProduct?.name ?? "Sin datos"}</CardTitle>
            </div>
            <span className="grid size-11 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
              <BarChart3 size={20} />
            </span>
          </CardHeader>
          <CardContent><p className="text-xs text-[#e9e2d2]/45">{topProduct ? `${topProduct.views} vistas acumuladas.` : "Las vistas de ficha aparecerán aquí."}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Piezas agotadas</CardDescription>
              <CardTitle className="mt-2 font-display text-3xl">{outCount}</CardTitle>
            </div>
            <span className={`grid size-11 place-items-center rounded-xl border ${outCount > 0 ? "border-amber-400/35 bg-amber-400/10 text-amber-300" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>
              <Package size={20} />
            </span>
          </CardHeader>
          <CardContent><p className="text-xs text-[#e9e2d2]/45">Con stock en 0 la tienda muestra «Agotado» sola.</p></CardContent>
        </Card>
      </section>

      {/* Subir producto */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UploadCloud size={18} className="text-gold" /> Subir producto</CardTitle>
            <CardDescription>La imagen es opcional; si no eliges una, la tarjeta usará el ornamento dorado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createProduct} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Nombre *
                  <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Pulsera de Cuarzo" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Categoría
                  <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="field-dark h-10 w-full rounded-xl px-3 text-sm">
                    {ADMIN_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Precio (MXN)
                  <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="450" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Piezas (stock)
                  <Input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} placeholder="10" />
                </label>
              </div>

              <label className="block space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Descripción
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  maxLength={500}
                  placeholder="Cuarzo pulido · claridad y enfoque"
                  className="field-dark w-full rounded-xl px-3 py-2.5 text-sm"
                />
              </label>

              {/* Imagen con next/image y validación de peso */}
              <div className="rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative grid size-36 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#c7a45a]/25 bg-[#1c2438]">
                    {preview || form.imageUrl ? (
                      <Image
                        src={preview ?? form.imageUrl}
                        alt="Vista previa del producto"
                        fill
                        sizes="144px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlus size={26} className="text-[#e9e2d2]/25" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-[#f7f2e7]">Imagen del producto</p>
                      <p className="mt-1 text-xs leading-5 text-[#e9e2d2]/50">
                        JPEG, PNG o WebP · máximo 5 MB. También puedes pegar la ruta de una imagen ya subida.
                      </p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickFile} aria-label="Seleccionar imagen del producto" />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud size={15} /> Elegir imagen
                      </Button>
                      {file && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs text-[#e9e2d2]/70">
                          {file.name} · {(file.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>
                    <label className="block space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">…o URL de imagen
                      <Input value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} placeholder="/images/productos/mi-pieza.jpg" className="font-mono text-xs" />
                    </label>
                  </div>
                </div>
              </div>

              {formError && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setFormError(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? "Subiendo…" : "Subir producto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Inventario */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Gestión de inventario</CardTitle>
            <CardDescription>{products.length} {products.length === 1 ? "pieza registrada" : "piezas registradas"}.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-[#e9e2d2]/40" />
              <Input className="w-52 pl-9" placeholder="Buscar pieza…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar producto" />
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <div>
                <Package size={26} className="mx-auto text-[#d8bc7f]" />
                <p className="mt-3 font-display text-xl text-[#f7f2e7]">Sin productos por aquí</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#e9e2d2]/55">
                  {products.length === 0 ? "Sube tu primer producto con el botón «Subir producto»." : "Ninguna pieza coincide con tu búsqueda."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#c7a45a]/15 text-[10px] font-semibold uppercase tracking-[.14em] text-[#e9e2d2]/45">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-center">Piezas</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3 text-center">Visibilidad</th>
                    <th className="px-4 py-3 text-right">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c7a45a]/8">
                  {filtered.map((product) => (
                    <tr key={product.id} className="align-middle transition hover:bg-white/[0.02]">
                      <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs text-[#c7a45a]/80" title={product.id}>#{product.id}</td>
                      <td className="max-w-[260px] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#c7a45a]/20 bg-[#1c2438]">
                            {product.imageUrl ? (
                              <Image src={product.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                            ) : (
                              <span className="text-[#d8bc7f]">✧</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#f7f2e7]">{product.name}</p>
                            <p className="truncate text-xs text-[#e9e2d2]/50">{product.description || product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${product.stock <= 0 ? "bg-red-500/15 text-red-300" : product.stock <= 5 ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/10 text-emerald-300"}`}>
                          {product.stock <= 0 ? "Agotado" : product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#e3c57c]">{formatPrice(product.price, product.currency)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(product)}
                          disabled={busyId === product.id}
                          role="switch"
                          aria-checked={product.isVisible}
                          title={product.isVisible ? "Visible en la tienda · clic para ocultar" : "Oculto de la tienda · clic para mostrar"}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50 ${
                            product.isVisible
                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                              : "border-white/15 bg-white/[0.05] text-[#e9e2d2]/45 hover:bg-white/[0.08]"
                          }`}
                        >
                          {busyId === product.id ? <Loader2 size={12} className="animate-spin" /> : product.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.isVisible ? "Visible" : "Oculto"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => remove(product)}
                          disabled={busyId === product.id}
                          title={`Eliminar ${product.name}`}
                          className="grid size-8 place-items-center rounded-lg border border-red-400/25 text-red-300/80 transition hover:bg-red-500/15 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {toast && (
        <p role="status" className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#c7a45a]/40 bg-[#0b1020]/95 px-5 py-3 text-sm text-[#f7f2e7] shadow-2xl backdrop-blur-xl">
          <Check size={15} className="text-emerald-300" /> {toast}
        </p>
      )}
    </div>
  );
}
