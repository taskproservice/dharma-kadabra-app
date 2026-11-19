"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { products, formatPrice } from "../../lib/data/products";
import { services, formatSessionPrice } from "../../lib/data/services";
import { useCartStore } from "../../stores/cart";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

const eyebrow = "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#8B6D16] before:h-px before:w-10 before:bg-[#8B6D16]/50";

export function Storefront() {
  const add = useCartStore((state) => state.add);
  const items = useCartStore((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <section id="coleccion" className="scroll-mt-16 bg-[#EEE4CF] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#3E2723]/15 pb-9">
            <div>
              <p className={eyebrow}>Objetos con intención</p>
              <h2 className="font-display text-5xl leading-none text-[#2A1B17] sm:text-6xl">La <em className="italic text-[#8B6D16]">Colección.</em></h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#3E2723]/65">Piezas rituales elegidas para acompañar tus momentos de pausa, protección y transformación.</p>
            </div>
            <Link href="/dashboard/pos" className="inline-flex items-center gap-2 border-b border-[#8B6D16]/40 pb-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[#8B6D16] hover:border-[#8B6D16]">
              <ShoppingBag size={15} /> Carrito{count > 0 ? ` (${count})` : ""} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <article key={product.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#E1D4B8]">
                  <Image src={product.imageUrl} alt={product.name} fill sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute left-3 top-3 bg-[#F4ECD8]/90 px-2.5 py-1.5 text-[9px] uppercase tracking-[.2em] text-[#3E2723]">{product.category}</span>
                </div>
                <div className="flex flex-1 flex-col pt-4">
                  <h3 className="font-display text-xl leading-snug text-[#2A1B17]">{product.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#3E2723]/55">{product.description}</p>
                  <p className="mt-3 text-sm font-semibold tracking-wide text-[#8B6D16]">{formatPrice(product.price)}</p>
                  <button type="button" onClick={() => add({ ...product, emoji: "✧", currency: "USD" })} className="mt-4 inline-flex h-11 items-center justify-center gap-2 bg-[#1A1A1A] px-4 text-[10px] font-semibold uppercase tracking-[.18em] text-[#F4ECD8] transition hover:bg-[#3E2723] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6D16]">
                    <ShoppingBag size={14} /> Añadir al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
          {count > 0 && <p role="status" className="mt-8 flex items-center justify-center gap-2 text-sm text-[#5E6B3A]"><Check size={16} /> {count} {count === 1 ? "pieza añadida" : "piezas añadidas"}. <Link href="/dashboard/pos" className="underline underline-offset-4">Ir al carrito</Link></p>}
        </div>
      </section>

      <section id="servicios" className="scroll-mt-16 bg-[#1A1A1A] px-5 py-24 text-[#F4ECD8] sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#D4AF37] before:h-px before:w-10 before:bg-[#D4AF37]/60">Encuentros para tu camino</p>
            <h2 className="font-display text-5xl leading-tight sm:text-6xl">Sabiduría para <em className="italic text-[#E6C766]">escucharte.</em></h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#F4ECD8]/65">Las runas son una brújula terrenal para el momento presente; los Registros Akáshicos, una memoria sutil del alma. Dos puertas distintas para encontrar orientación.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <article key={service.id} className="flex min-h-full flex-col border border-[#D4AF37]/20 bg-white/[.025] p-7 sm:p-10">
                <div className="flex items-start justify-between gap-6">
                  <span className="font-display text-4xl text-[#D4AF37]">{service.symbol}</span>
                  <span className="text-[10px] uppercase tracking-[.2em] text-[#F4ECD8]/45">0{index + 1} · {service.duration}</span>
                </div>
                <p className="mt-8 text-[10px] uppercase tracking-[.25em] text-[#D4AF37]">{service.essence}</p>
                <h3 className="mt-3 font-display text-3xl leading-snug">{service.name}{service.id === "registros-akashicos" ? ":" : ""}</h3>
                <p className="mt-5 flex-1 text-sm leading-7 text-[#F4ECD8]/70">{service.description}</p>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#F4ECD8]/10 pt-6">
                  <span className="font-display text-xl text-[#E6C766]">{formatSessionPrice(service.price)}</span>
                  <Dialog trigger={<button type="button" className="inline-flex items-center gap-2 border border-[#D4AF37]/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[.18em] transition hover:bg-[#D4AF37] hover:text-[#1A1A1A]">Agendar Sesión <ArrowRight size={14} /></button>} title={`Agendar · ${service.name}`}>
                    {(close) => <div className="space-y-5"><p className="font-display text-2xl">Selecciona fecha y hora</p><p className="text-sm leading-6 text-[#3E2723]/65">Continúa a la Agenda para consultar disponibilidad y elegir el momento que mejor te acompañe.</p><Link href="/dashboard/agenda" onClick={close} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#3E2723] px-4 text-sm font-medium text-[#F4ECD8] transition hover:bg-[#55362f]">Ir a la Agenda <ArrowRight size={15} /></Link></div>}
                  </Dialog>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
