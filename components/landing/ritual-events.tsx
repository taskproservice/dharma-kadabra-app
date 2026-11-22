"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, MoonStar } from "lucide-react";

const eyebrow =
  "mb-5 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.35em] text-[#9E7B2F] before:h-px before:w-10 before:bg-[#C5A059]/75";

export type RitualEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  products: string[];
};

export function RitualEventsSection({ events }: { events: RitualEvent[] }) {
  return (
    <section
      aria-labelledby="rituales-heading"
      className="border-y border-[#C5A059]/30 bg-[#EDE5D7]/60 px-5 py-10 sm:px-8 lg:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className={eyebrow}>Calendario lunar · Encuentros conscientes</p>
            <h2 id="rituales-heading" className="font-display text-3xl text-[#1A1A1A] sm:text-4xl">
              Próximos <em className="italic text-[#9E7B2F]">Rituales.</em>
            </h2>
          </div>
          <Link
            href="/mi-cuenta"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#8B6914] transition hover:text-[#1A1A1A]"
          >
            Ver calendario <ArrowRight size={14} />
          </Link>
        </div>

        {events.length ? (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="flex gap-4 rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] p-5 shadow-[0_12px_30px_-20px_rgba(92,72,48,0.14)]"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-full border border-[#C5A059]/35 bg-[#F4EFE6] text-[#9E7B2F]">
                  <MoonStar size={20} />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-[#8B6914]">
                    <CalendarDays size={13} />
                    {new Intl.DateTimeFormat("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(event.date))}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-[#1A1A1A]">{event.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#2C2C2C]/75">{event.description}</p>
                  {event.products.length > 0 && (
                    <p className="mt-2 text-[10px] font-medium text-[#2C2C2C]/65">
                      Objetos rituales: {event.products.join(" · ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-[#2C2C2C]/70">
            Muy pronto compartiremos nuevos encuentros y rituales.
          </p>
        )}
      </div>
    </section>
  );
}
