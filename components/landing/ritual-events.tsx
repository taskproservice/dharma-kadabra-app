"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, MoonStar } from "lucide-react";

const eyebrowDark =
  "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-gold-bright before:h-px before:w-10 before:bg-gold/60";
const eyebrowPapyrus =
  "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-bronze before:h-px before:w-10 before:bg-[#C5A059]/70";

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
  appearance = "night",
}: {
  events: RitualEvent[];
  showAgendaLink?: boolean;
  /** `papyrus` integra la sección con las vistas de Papiro (p. ej. /agenda). */
  appearance?: "night" | "papyrus";
}) {
  const pathname = usePathname();
  const onAgendaPage = !showAgendaLink || pathname === "/agenda";
  const papyrus = appearance === "papyrus";

  return (
    <section
      id="eventos"
      aria-labelledby="rituales-heading"
      className={`border-y px-5 py-10 sm:px-8 lg:py-14 ${
        papyrus ? "border-[#C5A059]/35 bg-[#EDE4D4]/55" : "border-gold/20 bg-obsidian"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className={papyrus ? eyebrowPapyrus : eyebrowDark}>Calendario lunar · Encuentros conscientes</p>
            <h2 id="rituales-heading" className={`font-display text-3xl sm:text-4xl ${papyrus ? "text-ink" : "text-papyrus"}`}>
              Próximos <em className={`italic ${papyrus ? "text-bronze" : "text-gold-light"}`}>Rituales.</em>
            </h2>
          </div>
          {!onAgendaPage && (
            <Link
              href="/agenda"
              className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] transition ${
                papyrus ? "text-bronze hover:text-ink" : "text-gold-light hover:text-papyrus"
              }`}
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
                className={`flex gap-4 p-5 ${
                  papyrus
                    ? "border border-[#C5A059]/30 bg-[#FCFAF5] shadow-[0_14px_34px_-30px_rgba(128,95,43,.7)]"
                    : "border border-gold/15 bg-papyrus/[0.035]"
                }`}
              >
                <div className={`grid size-11 shrink-0 place-items-center rounded-full ${papyrus ? "bg-[#F4EFE6] text-bronze" : "bg-obsidian-soft text-gold-light"}`}>
                  <MoonStar size={20} />
                </div>
                <div className="min-w-0">
                  <p className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[.15em] ${papyrus ? "text-bronze" : "text-gold-light"}`}>
                    <CalendarDays size={13} />
                    {new Intl.DateTimeFormat("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(event.date))}
                  </p>
                  <h3 className={`mt-1 font-display text-xl ${papyrus ? "text-ink" : "text-papyrus"}`}>{event.title}</h3>
                  <p className={`mt-1 text-xs leading-5 ${papyrus ? "text-ink-muted" : "text-papyrus/55"}`}>{event.description}</p>
                  {event.products.length > 0 && (
                    <p className={`mt-2 text-[10px] font-medium ${papyrus ? "text-ink-muted" : "text-papyrus/45"}`}>
                      Objetos rituales: {event.products.join(" · ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={`mt-6 text-sm ${papyrus ? "text-ink-muted" : "text-papyrus/50"}`}>
            Muy pronto compartiremos nuevos encuentros y rituales.
          </p>
        )}
      </div>
    </section>
  );
}
