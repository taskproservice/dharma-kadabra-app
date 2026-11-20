"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, MoonStar, ShoppingBag } from "lucide-react";
import { products, formatPrice } from "../../lib/data/products";
import { services, formatSessionPrice } from "../../lib/data/services";
import { useCartStore } from "../../stores/cart";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { BookingDialog } from "./booking-dialog";

const eyebrow = "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#8B6D16] before:h-px before:w-10 before:bg-[#8B6D16]/50";

type RitualEvent = { id: string; title: string; description: string; date: string; products: string[] };

export function Storefront({ events }: { events: RitualEvent[] }) {
  const add = useCartStore((state) => state.add);
  const items = useCartStore((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <section id="coleccion" className="scroll-mt-16 bg-[#EEE4CF] px-5 py-16 sm:px-8 lg:py-20">
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
              <article
                key={product.id}
                className="group flex h-full flex-col rounded-2xl bg-[#F4ECD8]/70 p-4 border border-[#D4AF37]/20 shadow-lg shadow-[#1A1A1A]/5 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E1D4B8]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[#F4ECD8]/90 px-3 py-1 text-[9px] font-medium uppercase tracking-[.2em] text-[#3E2723] shadow-sm backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col pt-4">
                  <h3 className="font-display text-xl leading-snug text-[#2A1B17]">{product.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#3E2723]/65">{product.description}</p>
                  <p className="mt-3 text-sm font-semibold tracking-wide text-[#8B6D16]">{formatPrice(product.price)}</p>
                  <button
                    type="button"
                    onClick={() => add({ ...product, emoji: "✧", currency: "USD" })}
                    className="mt-auto flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-lg bg-[#1A1A1A] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all duration-300 font-medium tracking-wide text-xs whitespace-nowrap shadow-sm hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>Añadir al carrito</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
          {count > 0 && <p role="status" className="mt-8 flex items-center justify-center gap-2 text-sm text-[#5E6B3A]"><Check size={16} /> {count} {count === 1 ? "pieza añadida" : "piezas añadidas"}. <Link href="/dashboard/pos" className="underline underline-offset-4">Ir al carrito</Link></p>}
        </div>
      </section>

      <section aria-labelledby="rituales-heading" className="border-y border-[#D4AF37]/20 bg-[#F4ECD8] px-5 py-14 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className={eyebrow}>Calendario lunar · Encuentros conscientes</p>
              <h2 id="rituales-heading" className="font-display text-3xl text-[#2A1B17] sm:text-4xl">Próximos <em className="italic text-[#8B6D16]">Rituales.</em></h2>
            </div>
            <a href="/dashboard/eventos" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#8B6D16] transition hover:text-[#3E2723]">Ver calendario <ArrowRight size={14} /></a>
          </div>
          {events.length ? <div className="mt-7 grid gap-4 md:grid-cols-2">
            {events.map((event) => <article key={event.id} className="flex gap-4 border border-[#3E2723]/10 bg-white/45 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#EEE4CF] text-[#8B6D16]"><MoonStar size={20} /></div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.15em] text-[#8B6D16]"><CalendarDays size={13} />{new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(new Date(event.date))}</p>
                <h3 className="mt-1 font-display text-xl text-[#2A1B17]">{event.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#3E2723]/65">{event.description}</p>
                {event.products.length > 0 && <p className="mt-2 text-[10px] font-medium text-[#3E2723]/55">Objetos rituales: {event.products.join(" · ")}</p>}
              </div>
            </article>)}
          </div> : <p className="mt-6 text-sm text-[#3E2723]/60">Muy pronto compartiremos nuevos encuentros y rituales.</p>}
        </div>
      </section>

      <section id="servicios" className="scroll-mt-16 bg-[#1A1A1A] px-5 py-16 text-[#F4ECD8] sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#D4AF37] before:h-px before:w-10 before:bg-[#D4AF37]/60">Encuentros para tu camino</p>
            <h2 className="font-display text-5xl leading-tight text-[#F4ECD8] sm:text-6xl">Sabiduría para <em className="italic text-[#E6C766]">escucharte.</em></h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#F4ECD8]/90">Las runas son una brújula terrenal para el momento presente; los Registros Akáshicos, una memoria sutil del alma. Dos puertas distintas para encontrar orientación.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <article key={service.id} className="flex h-full flex-col border border-[#D4AF37]/20 bg-white/[.025] p-7 sm:p-10">
                <div className="flex items-start justify-between gap-6">
                  <span className="font-display text-4xl text-[#D4AF37]">{service.symbol}</span>
                  <span className="text-[10px] uppercase tracking-[.2em] text-[#F4ECD8]/80">0{index + 1} · {service.duration}</span>
                </div>
                <p className="mt-8 text-[10px] uppercase tracking-[.25em] text-[#D4AF37]">{service.essence}</p>
                <h3 className="mt-3 font-display text-3xl leading-snug text-[#F4ECD8]">{service.name}{service.id === "registros-akashicos" ? ":" : ""}</h3>
                <p className="mt-5 flex-1 text-sm leading-7 text-[#F4ECD8]/90">{service.description}</p>
                <div className="mt-auto pt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#F4ECD8]/15">
                  <span className="font-display text-xl text-[#E6C766]">{formatSessionPrice(service.price)}</span>
                  <Dialog trigger={<button type="button" className="inline-flex items-center gap-2 border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#F4ECD8] transition hover:bg-[#D4AF37] hover:text-[#1A1A1A]">Agendar Sesión <ArrowRight size={14} /></button>} title={`Agendar · ${service.name}`}>
                    {(close) => <BookingDialog service={service} close={close} />}
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
