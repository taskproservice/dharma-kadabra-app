"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, MoonStar } from "lucide-react";

const eyebrow =
  "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-gold-bright before:h-px before:w-10 before:bg-gold/60";

export type RitualEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  products: string[];
};

/**
 * Próximos rituales de la landing y la agenda.
 *
 * Oculta automáticamente el enlace a `/agenda` cuando ya se renderiza dentro de
 * `/agenda`, evitando botones redundantes hacia la misma vista.
 */
export function RitualEventsSection({
  events,
  showAgendaLink = true,
}: {
  events: RitualEvent[];
  showAgendaLink?: boolean;
}) {
  const pathname = usePathname();
  const onAgendaPage = !showAgendaLink || pathname === "/agenda";

  return (
    <section
      id="eventos"
      aria-labelledby="rituales-heading"
      className="border-y border-gold/20 bg-obsidian px-5 py-10 sm:px-8 lg:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className={eyebrow}>Calendario lunar · Encuentros conscientes</p>
            <h2 id="rituales-heading" className="font-display text-3xl text-papyrus sm:text-4xl">
              Próximos <em className="italic text-gold-light">Rituales.</em>
            </h2>
          </div>
          {!onAgendaPage && (
            <Link
              href="/agenda"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-gold-light transition hover:text-papyrus"
            >
              Ver calendario <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {events.length ? (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="flex gap-4 border border-gold/15 bg-papyrus/[0.035] p-5"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-obsidian-soft text-gold-light">
                  <MoonStar size={20} />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.15em] text-gold-light">
                    <CalendarDays size={13} />
                    {new Intl.DateTimeFormat("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(event.date))}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-papyrus">{event.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-papyrus/55">{event.description}</p>
                  {event.products.length > 0 && (
                    <p className="mt-2 text-[10px] font-medium text-papyrus/45">
                      Objetos rituales: {event.products.join(" · ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-papyrus/50">
            Muy pronto compartiremos nuevos encuentros y rituales.
          </p>
        )}
      </div>
    </section>
  );
}
