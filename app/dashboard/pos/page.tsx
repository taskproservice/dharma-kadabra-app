"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus, Search, ShoppingBag, Trash2, Wallet } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useCartStore, type Product } from "../../../stores/cart";
import { products as collectionProducts } from "../../../lib/data/products";

const products: Product[] = [
  { id: "p1", name: "Lectura de runas", category: "Sesiones", price: 1200, emoji: "ᚱ", description: "Sesión personalizada · 60 min" },
  { id: "p2", name: "Lectura akáshica", category: "Sesiones", price: 1600, emoji: "✧", description: "Conexión con tus registros" },
  { id: "p3", name: "Alineación energética", category: "Sesiones", price: 950, emoji: "☼", description: "Equilibrio y bienestar" },
  { id: "p4", name: "Kit de intención", category: "Productos", price: 640, emoji: "◈", description: "Vela, cuarzo y guía" },
  { id: "p5", name: "Set de runas", category: "Productos", price: 890, emoji: "ᚠ", description: "Madera natural · 24 piezas" },
  { id: "p6", name: "Audio de meditación", category: "Digital", price: 320, emoji: "♫", description: "Acceso digital permanente" },
  { id: "p7", name: "Guía de autocuidado", category: "Digital", price: 280, emoji: "☾", description: "Cuaderno digital descargable" },
  { id: "p8", name: "Círculo de luna", category: "Sesiones", price: 540, emoji: "☽", description: "Encuentro grupal" },
];
const posProducts: Product[] = [
  ...products,
  ...collectionProducts.map((product) => ({ ...product, category: "Productos", emoji: "✧", currency: "USD" as const })),
];
const categories = ["Todos", "Sesiones", "Productos", "Digital"];
const money = (value: number, currency: "MXN" | "USD" = "MXN") => new Intl.NumberFormat("es-MX", { style: "currency", currency, minimumFractionDigits: currency === "USD" ? 2 : 0, maximumFractionDigits: currency === "USD" ? 2 : 0 }).format(value);

export default function PosPage() {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("Todos");
  const items = useCartStore((state) => state.items); const add = useCartStore((state) => state.add); const decrement = useCartStore((state) => state.decrement); const remove = useCartStore((state) => state.remove); const clear = useCartStore((state) => state.clear);
  const filtered = useMemo(() => posProducts.filter((p) => (category === "Todos" || p.category === category) && `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())), [query, category]);
  const totalByCurrency = items.reduce((totals, item) => {
    const currency = item.currency ?? "MXN";
    totals[currency] += item.price * item.quantity;
    return totals;
  }, { MXN: 0, USD: 0 });
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const checkout = () => {
    if (!items.length) return;
    const totals = [totalByCurrency.MXN > 0 ? money(totalByCurrency.MXN, "MXN") : "", totalByCurrency.USD > 0 ? money(totalByCurrency.USD, "USD") : ""].filter(Boolean).join(" + ");
    alert(`Cobro de ${totals} registrado (demo)`);
    clear();
  };
  return <div className="-m-8 flex min-h-[calc(100vh-76px)] flex-col xl:flex-row">
    <section className="min-w-0 flex-1 p-6 lg:p-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-medium text-[#9A7B28]">Terminal de venta</p><h1 className="mt-1 text-3xl font-semibold">Punto de Venta</h1></div><div className="rounded-xl bg-white/60 px-4 py-2 text-sm text-[#3E2723]/65">{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</div></div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-3 text-[#3E2723]/40"/><Input className="pl-9" placeholder="Buscar productos o servicios..." value={query} onChange={(e) => setQuery(e.target.value)}/></div><div className="flex gap-2 overflow-auto">{categories.map((c) => <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ${category === c ? "bg-[#3E2723] text-[#F4ECD8]" : "bg-white/60 hover:bg-white"}`}>{c}</button>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{filtered.map((product) => <button key={product.id} onClick={() => add(product)} className="group text-left"><Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-[#D4AF37]/60 hover:shadow-lg"><div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8DCC0]/70 to-[#D4AF37]/15 text-5xl text-[#9A7B28] transition group-hover:scale-[1.02]">{product.imageUrl ? <Image src={product.imageUrl} alt="" fill sizes="300px" className="object-cover" /> : product.emoji}</div><div className="p-4"><div className="mb-1 flex items-start justify-between gap-2"><h2 className="font-semibold">{product.name}</h2><span className="whitespace-nowrap text-sm font-bold text-[#8B6D16]">{money(product.price, product.currency ?? "MXN")}</span></div><p className="text-xs text-[#3E2723]/55">{product.description}</p><span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A7B28]"><Plus size={14}/>Agregar</span></div></Card></button>)}</div>
      {filtered.length === 0 && <div className="py-16 text-center text-sm text-[#3E2723]/55">No encontramos productos para esa búsqueda.</div>}
    </section>
    <aside className="flex w-full flex-col border-t border-[#3E2723]/10 bg-[#E8DCC0]/60 p-6 xl:w-[370px] xl:border-l xl:border-t-0"><div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-semibold"><ShoppingBag size={20}/>Carrito</h2><span className="rounded-full bg-[#D4AF37]/20 px-2.5 py-1 text-xs font-bold">{count}</span></div>
      <div className="flex-1 space-y-3 overflow-y-auto">{items.length ? items.map((item) => <div key={item.id} className="rounded-2xl border border-white/70 bg-white/70 p-4"><div className="flex justify-between gap-3"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-[#3E2723]/55">{money(item.price, item.currency ?? "MXN")} c/u</p></div><button aria-label={`Quitar ${item.name}`} onClick={() => remove(item.id)} className="self-start rounded-lg p-1.5 text-[#3E2723]/50 hover:bg-red-50 hover:text-red-700"><Trash2 size={15}/></button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><button onClick={() => decrement(item.id)} className="grid size-7 place-items-center rounded-lg border border-[#3E2723]/15"><Minus size={13}/></button><span className="w-5 text-center text-sm font-semibold">{item.quantity}</span><button onClick={() => add(item)} className="grid size-7 place-items-center rounded-lg border border-[#3E2723]/15"><Plus size={13}/></button></div><span className="font-bold">{money(item.price * item.quantity, item.currency ?? "MXN")}</span></div></div>) : <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[#3E2723]/20 text-center text-sm text-[#3E2723]/45"><div><ShoppingBag size={26} className="mx-auto mb-2 opacity-50"/>El carrito está vacío.<br/>Agrega productos para comenzar.</div></div>}</div>
      <div className="mt-5 space-y-3 border-t border-[#3E2723]/15 pt-5"><div className="flex justify-between text-sm text-[#3E2723]/65"><span>Subtotal · MXN</span><span>{totalByCurrency.MXN > 0 ? money(totalByCurrency.MXN, "MXN") : "—"}</span></div><div className="flex justify-between text-sm text-[#3E2723]/65"><span>Subtotal · USD</span><span>{totalByCurrency.USD > 0 ? money(totalByCurrency.USD, "USD") : "—"}</span></div><div className="flex justify-between text-sm text-[#3E2723]/65"><span>Impuestos</span><span>Incluidos</span></div><div className="flex justify-between text-xl font-bold"><span>Total</span><span className="max-w-[65%] text-right text-base">{[totalByCurrency.MXN > 0 ? money(totalByCurrency.MXN, "MXN") : "", totalByCurrency.USD > 0 ? money(totalByCurrency.USD, "USD") : ""].filter(Boolean).join(" + ") || money(0, "MXN")}</span></div><Button disabled={!items.length} onClick={checkout} className="h-12 w-full bg-[#D4AF37] text-[#3E2723] hover:bg-[#c4a02e]"><Wallet size={18}/>Cobrar</Button><p className="flex items-center justify-center gap-1 text-center text-[11px] text-[#3E2723]/50"><Check size={12}/>Cobro seguro · Pago registrado al confirmar</p></div>
    </aside>
  </div>;
}
