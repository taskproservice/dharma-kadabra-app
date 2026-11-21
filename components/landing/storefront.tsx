"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, MoonStar, ShoppingBag } from "lucide-react";
import { products, formatPrice } from "../../lib/data/products";
import { useCartStore } from "../../stores/cart";
import { ServicesSection } from "./services";

const eyebrow = "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#d8bc7f] before:h-px before:w-10 before:bg-[#c7a45a]/60";

type RitualEvent = { id: string; title: string; description: string; date: string; products: string[] };

export function Storefront({ events }: { events: RitualEvent[] }) {
  const add = useCartStore((state) => state.add);
  const items = useCartStore((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <section id="coleccion" className="scroll-mt-16 bg-[#0b1020] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#c7a45a]/15 pb-9">
            <div>
              <p className={eyebrow}>Objetos con intención</p>
              <h2 className="font-display text-5xl leading-none text-[#f7f2e7] sm:text-6xl">La <em className="italic text-[#d8bc7f]">Colección.</em></h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#e9e2d2]/55">Piezas rituales elegidas para acompañar tus momentos de pausa, protección y transformación.</p>
            </div>
            <Link href="/dashboard/pos" className="inline-flex items-center gap-2 border-b border-[#c7a45a]/45 pb-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[#d8bc7f] hover:border-[#c7a45a]">
              <ShoppingBag size={15} /> Carrito{count > 0 ? ` (${count})` : ""} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <article
                key={product.id}
                className="group flex h-full flex-col rounded-2xl bg-white/[0.035] p-4 border border-[#c7a45a]/20 shadow-lg shadow-black/40 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#11182b]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[#0b1020]/85 px-3 py-1 text-[9px] font-medium uppercase tracking-[.2em] text-[#e9e2d2] shadow-sm backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col pt-4">
                  <h3 className="font-display text-xl leading-snug text-[#f7f2e7]">{product.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#e9e2d2]/55">{product.description}</p>
                  <p className="mt-3 text-sm font-semibold tracking-wide text-[#d8bc7f]">{formatPrice(product.price)}</p>
                  <button
                    type="button"
                    onClick={() => add({ ...product, emoji: "✧", currency: "USD" })}
                    className="mt-auto flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-lg border border-[#c7a45a]/45 bg-[#c7a45a]/10 text-[#e3c57c] hover:bg-[#c7a45a] hover:text-[#0b1020] transition-all duration-300 font-medium tracking-wide text-xs whitespace-nowrap shadow-sm hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7a45a]"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>Añadir al carrito</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
          {count > 0 && <p role="status" className="mt-8 flex items-center justify-center gap-2 text-sm text-[#a9c08a]"><Check size={16} /> {count} {count === 1 ? "pieza añadida" : "piezas añadidas"}. <Link href="/dashboard/pos" className="underline underline-offset-4">Ir al carrito</Link></p>}
        </div>
      </section>

      <section aria-labelledby="rituales-heading" className="border-y border-[#c7a45a]/20 bg-[#080c16] px-5 py-7 sm:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className={eyebrow}>Calendario lunar · Encuentros conscientes</p>
              <h2 id="rituales-heading" className="font-display text-3xl text-[#f7f2e7] sm:text-4xl">Próximos <em className="italic text-[#d8bc7f]">Rituales.</em></h2>
            </div>
            <a href="/dashboard/eventos" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d8bc7f] transition hover:text-[#e9e2d2]">Ver calendario <ArrowRight size={14} /></a>
          </div>
          {events.length ? <div className="mt-7 grid gap-4 md:grid-cols-2">
            {events.map((event) => <article key={event.id} className="flex gap-4 border border-[#c7a45a]/12 bg-white/[0.035] p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0b1020] text-[#d8bc7f]"><MoonStar size={20} /></div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.15em] text-[#d8bc7f]"><CalendarDays size={13} />{new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(new Date(event.date))}</p>
                <h3 className="mt-1 font-display text-xl text-[#f7f2e7]">{event.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#e9e2d2]/55">{event.description}</p>
                {event.products.length > 0 && <p className="mt-2 text-[10px] font-medium text-[#e9e2d2]/45">Objetos rituales: {event.products.join(" · ")}</p>}
              </div>
            </article>)}
          </div> : <p className="mt-6 text-sm text-[#e9e2d2]/50">Muy pronto compartiremos nuevos encuentros y rituales.</p>}
        </div>
      </section>

      <ServicesSection />
    </>
  );
}
