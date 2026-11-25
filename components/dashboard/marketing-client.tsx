"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  BarChart3,
  Check,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  UploadCloud,
  X,
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
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ADMIN_CATEGORIES = [...STORE_CATEGORIES, "Collares", "Veladoras"];
/** Mismo patrón que valida la API: letras, números, punto, guion y guion bajo. */
const SKU_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;

const EMPTY_FORM = {
  sku: "",
  name: "",
  description: "",
  category: "Pulseras" as string,
  price: "",
  stock: "",
  imageUrl: "",
  isVisible: true,
};

type ProductFormState = typeof EMPTY_FORM;

function formFromProduct(product: AdminProduct): ProductFormState {
  return {
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    imageUrl: product.imageUrl,
    isVisible: product.isVisible,
  };
}

/**
 * Panel Marketing · inventario, visibilidad de la tienda, alta/edición de
 * piezas con imagen (Vercel Blob) y exportación del catálogo a Meta.
 */
export function MarketingClient({ initialProducts, initialAnalytics }: { initialProducts: AdminProduct[]; initialAnalytics: AnalyticsSummary }) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(initialAnalytics);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Formulario (alta y edición comparten el mismo estado)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = editingId !== null;

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
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

  // La vista previa local (object URL) se libera al cambiar o cerrar el formulario.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        !q ||
        `${product.sku} ${product.id} ${product.name} ${product.description} ${product.category}`
          .toLowerCase()
          .includes(q),
    );
  }, [products, query]);

  const outCount = products.filter((product) => product.stock <= 0).length;
  /** Piezas que Meta acepta en el feed: visibles, publicadas y con imagen. */
  const metaReadyCount = products.filter(
    (product) => product.published && product.isVisible && product.imageUrl,
  ).length;

  const resetForm = () => {
    if (preview) URL.revokeObjectURL(preview);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview(null);
    setFormError(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setFormError(null);
    setEditingId(product.id);
    setForm(formFromProduct(product));
    setIsFormOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const patch = (key: keyof ProductFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  /** Valida el archivo elegido (por clic o por arrastre) y arma la miniatura. */
  const acceptFile = (selected: File | null | undefined) => {
    setFormError(null);
    if (!selected) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      return setFormError("Formato no soportado. Usa JPEG, PNG o WebP.");
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      return setFormError("La imagen supera el máximo permitido de 5 MB.");
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const pickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    patch("imageUrl", "");
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

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const sku = form.sku.trim().toUpperCase();
    const price = Math.round((Number(form.price) || 0) * 100) / 100;
    const stock = Math.max(0, Math.floor(Number(form.stock) || 0));

    if (!sku) return setFormError("El SKU es obligatorio (ej. PUL-001).");
    if (!SKU_PATTERN.test(sku)) {
      return setFormError("El SKU solo admite letras, números, puntos, guiones y guion bajo (ej. PUL-001).");
    }
    if (form.name.trim().length < 2) return setFormError("El nombre del producto es obligatorio.");
    if (!(price >= 0)) return setFormError("Revisa el precio unitario.");
    if (!form.category) return setFormError("Elige una categoría.");

    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      const payload = {
        ...(isEditing ? { id: editingId } : {}),
        sku,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price,
        // El costo real (margen del panel Admin) se conserva al editar aquí.
        cost: isEditing ? (products.find((item) => item.id === editingId)?.cost ?? 0) : 0,
        currency: "MXN",
        stock,
        availability: stock === 0 ? "out_of_stock" : "available",
        // Visibilidad On/Off: apagada, la pieza desaparece de la tienda.
        published: form.isVisible,
        isVisible: form.isVisible,
        imageUrl,
      };
      const response = await fetch("/api/products", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible guardar el producto.");
      notify(
        isEditing
          ? `«${data.product.name}» actualizado · SKU ${data.product.sku}`
          : `«${data.product.name}» agregado al inventario · SKU ${data.product.sku}`,
      );
      closeForm();
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (product: AdminProduct) => {
    if (busyId) return;
    setBusyId(product.id);
    try {
      const next = !product.isVisible;
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, published: next, isVisible: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible actualizar la visibilidad.");
      notify(next ? `«${product.name}» visible en la tienda` : `«${product.name}» oculto de la tienda`);
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

  /** Descarga el CSV del catálogo con las columnas del feed de Meta. */
  const exportMetaCatalog = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await fetch("/api/products/export/meta", { cache: "no-store" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No fue posible generar el catálogo para Meta.");
      }
      const rows = Number(response.headers.get("X-Meta-Rows") ?? "0");
      const skipped = Number(response.headers.get("X-Meta-Skipped") ?? "0");
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "catalogo-meta.csv";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      notify(
        skipped > 0
          ? `Catálogo listo: ${rows} pieza(s) · ${skipped} omitida(s) por estar ocultas o sin imagen`
          : `Catálogo listo: ${rows} pieza(s) exportadas para Meta`,
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : "No fue posible generar el catálogo para Meta.");
    } finally {
      setExporting(false);
    }
  };

  const topProduct = analytics.topProducts[0];
  const previewSrc = preview ?? form.imageUrl.trim();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#d8bc7f]">Panel Marketing · Community Manager</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#f7f2e7]">Inventario y visibilidad</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e9e2d2]/55">
            Sube piezas con SKU e imagen, controla qué aparece en la tienda pública y prepara el catálogo para Meta.
          </p>
        </div>
        <Button variant="gold" onClick={isFormOpen && !isEditing ? closeForm : openCreate}>
          {isFormOpen && !isEditing ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen && !isEditing ? "Cerrar formulario" : "Nuevo producto"}
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

      {/* Catálogo para Meta */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
              <FileSpreadsheet size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg text-[#f7f2e7]">Exportar catálogo para Meta (CSV)</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[#e9e2d2]/50">
                Genera el archivo con las columnas <span className="font-mono">id, title, description, availability,
                condition, price, link, image_link, brand</span> para subirlo a Meta Commerce Manager
                (Facebook/Instagram). El <span className="font-mono">id</span> es el SKU de cada pieza.
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[.14em] text-[#d8bc7f]/80">
                {metaReadyCount} de {products.length} piezas listas · las ocultas o sin imagen se omiten
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={exportMetaCatalog} disabled={exporting || metaReadyCount === 0}>
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {exporting ? "Generando…" : "Descargar CSV"}
          </Button>
        </CardContent>
      </Card>

      {/* Alta / edición de producto */}
      {isFormOpen && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#c7a45a]/15">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag size={18} className="text-gold" />
                  {isEditing ? "Editar producto" : "Nuevo producto"}
                </CardTitle>
                <CardDescription>
                  SKU, descripción, imagen y precio unitario en MXN. El SKU es el identificador que Meta usa para sincronizar el catálogo.
                </CardDescription>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Cerrar formulario"
                className="grid size-9 place-items-center rounded-lg border border-[#c7a45a]/25 text-[#e9e2d2]/60 transition hover:bg-white/[0.06] hover:text-[#f7f2e7]"
              >
                <X size={16} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={saveProduct} className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
              {/* Imagen · Drag & Drop + vista previa */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#e9e2d2]/55">Imagen del producto</p>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
                    isDragging
                      ? "border-[#e3c57c] bg-[#c7a45a]/15"
                      : "border-[#c7a45a]/30 bg-white/[0.03] hover:border-[#c7a45a]/55"
                  }`}
                >
                  {previewSrc ? (
                    <>
                      <Image src={previewSrc} alt="Vista previa del producto" fill sizes="(min-width: 1024px) 320px, 90vw" unoptimized className="object-cover" />
                      <button
                        type="button"
                        onClick={clearImage}
                        aria-label="Quitar imagen"
                        className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg border border-black/40 bg-[#0b1020]/85 text-[#e9e2d2]/80 backdrop-blur transition hover:text-white"
                      >
                        <X size={14} />
                      </button>
                      <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-[#0b1020]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#e3c57c] backdrop-blur">
                        {preview ? "Vista previa · sin guardar" : "Imagen actual"}
                      </span>
                    </>
                  ) : (
                    <div className="px-6 text-center">
                      <span className="mx-auto grid size-12 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
                        <ImagePlus size={22} />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-[#f7f2e7]">Arrastra tu foto aquí</p>
                      <p className="mt-1 text-xs leading-5 text-[#e9e2d2]/50">JPEG, PNG o WebP · máximo 5 MB</p>
                      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud size={14} /> Elegir archivo
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="sr-only"
                  onChange={pickFile}
                  aria-label="Seleccionar imagen del producto"
                />

                {previewSrc && (
                  <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud size={14} /> Cambiar imagen
                  </Button>
                )}

                {file && (
                  <p className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs text-[#e9e2d2]/70">
                    <Check size={12} className="text-emerald-300" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-[#e9e2d2]/40">· {(file.size / 1024).toFixed(0)} KB</span>
                  </p>
                )}

                <label className="block space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">
                  …o URL de la imagen
                  <Input
                    value={form.imageUrl}
                    onChange={(event) => patch("imageUrl", event.target.value)}
                    placeholder="https://…blob.vercel-storage.com/productos/pieza.jpg"
                    className="font-mono text-xs"
                  />
                </label>
                <p className="text-[11px] leading-4 text-[#e9e2d2]/40">
                  Se guarda la URL pública devuelta por Vercel Blob al guardar el producto.
                </p>
              </div>

              {/* Datos del producto */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">
                    SKU *
                    <Input
                      value={form.sku}
                      onChange={(event) => patch("sku", event.target.value.toUpperCase())}
                      placeholder="PUL-001"
                      maxLength={60}
                      required
                      autoComplete="off"
                      spellCheck={false}
                      className="font-mono uppercase tracking-[.08em]"
                    />
                    <span className="block text-[11px] font-normal leading-4 text-[#e9e2d2]/45">
                      Identificador único para sincronización con Meta
                    </span>
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">
                    Nombre del producto *
                    <Input
                      value={form.name}
                      onChange={(event) => patch("name", event.target.value)}
                      placeholder="Pulsera de Cuarzo"
                      maxLength={160}
                      required
                    />
                    <span className="block text-[11px] font-normal leading-4 text-[#e9e2d2]/45">
                      Aparece como título en la tienda y en Meta.
                    </span>
                  </label>
                </div>

                <label className="block space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">
                  Descripción del producto
                  <textarea
                    value={form.description}
                    onChange={(event) => patch("description", event.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Cuarzo pulido · claridad y enfoque. Piedra consagrada en luna llena…"
                    className="field-dark w-full rounded-xl px-3 py-2.5 text-sm leading-6"
                  />
                  <span className="flex items-center justify-between text-[11px] font-normal leading-4 text-[#e9e2d2]/45">
                    <span>Descripción mágica/energética que se muestra en la tienda.</span>
                    <span className="font-mono">{form.description.length}/500</span>
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">
                    Categoría
                    <select
                      value={form.category}
                      onChange={(event) => patch("category", event.target.value)}
                      className="field-dark h-10 w-full rounded-xl px-3 text-sm"
                    >
                      {ADMIN_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">
                    <label htmlFor="product-price">Precio unitario</label>
                    <div className="flex items-stretch gap-2">
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#d8bc7f]">$</span>
                        <Input
                          id="product-price"
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={form.price}
                          onChange={(event) => patch("price", event.target.value)}
                          placeholder="450.00"
                          className="pl-7 text-right font-mono"
                          required
                        />
                      </div>
                      <span className="grid shrink-0 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 px-3 text-[11px] font-bold tracking-[.12em] text-[#e3c57c]">
                        MXN
                      </span>
                    </div>
                    <span className="block text-[11px] font-normal leading-4 text-[#e9e2d2]/45">
                      {Number(form.price) > 0 ? formatPrice(Number(form.price) || 0, "MXN") : "Precio de venta al público."}
                    </span>
                  </div>

                  <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">
                    Stock
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={form.stock}
                      onChange={(event) => patch("stock", event.target.value)}
                      placeholder="10"
                      className="font-mono"
                    />
                    <span className="block text-[11px] font-normal leading-4 text-[#e9e2d2]/45">
                      En 0 la tienda marca la pieza como «Agotado».
                    </span>
                  </label>
                </div>

                {/* Visibilidad On/Off */}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#f7f2e7]">Visibilidad en la tienda</p>
                    <p className="mt-0.5 text-xs text-[#e9e2d2]/50">
                      {form.isVisible ? "La pieza se muestra en la tienda pública." : "Oculta: no aparece en la tienda ni en el catálogo de Meta."}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isVisible}
                    aria-label="Visibilidad del producto"
                    onClick={() => patch("isVisible", !form.isVisible)}
                    className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                      form.isVisible ? "border-emerald-400/40 bg-emerald-400/25" : "border-white/15 bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 grid size-6 place-items-center rounded-full bg-papyrus text-obsidian shadow transition-all ${
                        form.isVisible ? "left-[22px]" : "left-0.5"
                      }`}
                    >
                      {form.isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                    </span>
                  </button>
                </div>

                {formError && (
                  <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300">
                    {formError}
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" onClick={closeForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gold" disabled={saving}>
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Guardar producto"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Inventario */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Gestión de inventario</CardTitle>
            <CardDescription>
              {products.length} {products.length === 1 ? "pieza registrada" : "piezas registradas"} · SKU único por pieza.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-[#e9e2d2]/40" />
              <Input
                className="w-56 pl-9"
                placeholder="Buscar SKU o pieza…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Buscar producto"
              />
            </div>
            <Button variant="outline" onClick={load} disabled={loading} aria-label="Recargar inventario">
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
                  {products.length === 0
                    ? "Crea tu primera pieza con «Nuevo producto»: SKU, descripción, imagen y precio."
                    : "Ninguna pieza coincide con tu búsqueda."}
                </p>
                {products.length === 0 && (
                  <Button variant="gold" className="mt-5" onClick={openCreate}>
                    <Plus size={16} /> Nuevo producto
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#c7a45a]/15 text-[10px] font-semibold uppercase tracking-[.14em] text-[#e9e2d2]/45">
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-center">Piezas</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3 text-center">Visibilidad</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c7a45a]/8">
                  {filtered.map((product) => (
                    <tr key={product.id} className="align-middle transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-[#c7a45a]/25 bg-[#c7a45a]/10 px-2 py-1 font-mono text-[11px] font-semibold tracking-[.06em] text-[#e3c57c]">
                          {product.sku}
                        </span>
                      </td>
                      <td className="max-w-[300px] px-4 py-3">
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
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[#e3c57c]">{formatPrice(product.price, product.currency)}</td>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            title={`Editar ${product.name}`}
                            className="grid size-8 place-items-center rounded-lg border border-[#c7a45a]/25 text-[#e3c57c]/85 transition hover:bg-[#c7a45a]/15"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(product)}
                            disabled={busyId === product.id}
                            title={`Eliminar ${product.name}`}
                            className="grid size-8 place-items-center rounded-lg border border-red-400/25 text-red-300/80 transition hover:bg-red-500/15 disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
        <p role="status" className="fixed bottom-6 left-1/2 z-[70] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-full border border-[#c7a45a]/40 bg-[#0b1020]/95 px-5 py-3 text-sm text-[#f7f2e7] shadow-2xl backdrop-blur-xl">
          <Check size={15} className="shrink-0 text-emerald-300" /> <span className="truncate">{toast}</span>
        </p>
      )}
    </div>
  );
}
