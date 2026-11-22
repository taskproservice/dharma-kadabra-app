"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, MoonStar } from "lucide-react";

const eyebrow =
  "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#e3c57c] before:h-px before:w-10 before:bg-[#c7a45a]/60";

export type RitualEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  products: string[];
};

/**
 * Próximos rituales de la landing.
 *
 * Antes vivía dentro de `storefront.tsx` junto a la colección antigua. La
 * tienda se movió a `/tienda`, así que aquí queda solo el calendario
 * editorial de encuentros (sin carrito ni precios).
 */
export function RitualEventsSection({ events }: { events: RitualEvent[] }) {
  return (
    <section
      aria-labelledby="rituales-heading"
      className="border-y border-[#c7a45a]/20 bg-[#080c16] px-5 py-10 sm:px-8 lg:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className={eyebrow}>Calendario lunar · Encuentros conscientes</p>
            <h2 id="rituales-heading" className="font-display text-3xl text-[#f7f2e7] sm:text-4xl">
              Próximos <em className="italic text-[#d8bc7f]">Rituales.</em>
            </h2>
          </div>
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d8bc7f] transition hover:text-[#e9e2d2]"
          >
            Ver calendario <ArrowRight size={14} />
          </Link>
        </div>

        {events.length ? (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="flex gap-4 border border-[#c7a45a]/12 bg-white/[0.035] p-5"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0b1020] text-[#d8bc7f]">
                  <MoonStar size={20} />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.15em] text-[#d8bc7f]">
                    <CalendarDays size={13} />
                    {new Intl.DateTimeFormat("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(event.date))}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-[#f7f2e7]">{event.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#e9e2d2]/55">{event.description}</p>
                  {event.products.length > 0 && (
                    <p className="mt-2 text-[10px] font-medium text-[#e9e2d2]/45">
                      Objetos rituales: {event.products.join(" · ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-[#e9e2d2]/50">
            Muy pronto compartiremos nuevos encuentros y rituales.
          </p>
        )}
      </div>
    </section>
  );
}
