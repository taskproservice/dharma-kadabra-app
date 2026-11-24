"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, MoonStar } from "lucide-react";

const eyebrowNight =
  "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-gold-bright before:h-px before:w-10 before:bg-gold/60";
const eyebrowWood =
  "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-sanctuary-gold-ink before:h-px before:w-10 before:bg-sanctuary-gold/70";

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
 *
 * `appearance`:
 * - `sanctuary` (por defecto) · banda de madera tostada en la Landing.
 * - `papyrus` · superficie de papiro para las vistas institucionales (/agenda).
 * - `night` · se conserva para cualquier vista nocturna heredada.
 */
export function RitualEventsSection({
  events,
  showAgendaLink = true,
  appearance = "sanctuary",
}: {
  events: RitualEvent[];
  showAgendaLink?: boolean;
  appearance?: "sanctuary" | "papyrus" | "night";
}) {
  const pathname = usePathname();
  const onAgendaPage = !showAgendaLink || pathname === "/agenda";
  const night = appearance === "night";
  const papyrus = appearance === "papyrus";

  return (
    <section
      id="eventos"
      aria-labelledby="rituales-heading"
      className={`relative overflow-x-clip border-y px-5 py-12 sm:px-8 lg:py-16 ${
        night
          ? "border-gold/20 bg-obsidian"
          : papyrus
            ? "border-sanctuary-border bg-sanctuary-parchment-light"
            : "sanctuary-leaf sanctuary-leaf-wood border-sanctuary-border"
      }`}
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className={night ? eyebrowNight : eyebrowWood}>
              Calendario lunar · Encuentros conscientes
            </p>
            <h2
              id="rituales-heading"
              className={`font-display text-3xl sm:text-4xl ${night ? "text-papyrus" : "text-sanctuary-ink"}`}
            >
              Próximos{" "}
              <em className={`italic ${night ? "text-gold-light" : "text-sanctuary-gold-leaf"}`}>
                Rituales.
              </em>
            </h2>
          </div>
          {!onAgendaPage && (
            <Link
              href="/agenda"
              className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] transition ${
                night
                  ? "text-gold-light hover:text-papyrus"
                  : "text-sanctuary-gold-ink hover:text-sanctuary-ink"
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
                className={`flex gap-4 rounded-3xl p-5 ${
                  night
                    ? "border border-gold/15 bg-papyrus/[0.035]"
                    : papyrus
                      ? "sanctuary-card-quiet"
                      : "sanctuary-card-olive"
                }`}
              >
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-full ${
                    night
                      ? "bg-obsidian-soft text-gold-light"
                      : papyrus
                        ? "border border-sanctuary-gold/35 bg-sanctuary-wood-light text-sanctuary-gold-ink"
                        : "border border-[#C5A059]/35 bg-[#F4EFE6]/10 text-[#C5A059]"
                  }`}
                >
                  <MoonStar size={20} />
                </div>
                <div className="min-w-0">
                  <p
                    className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[.15em] ${
                      night ? "text-gold-light" : papyrus ? "text-sanctuary-gold-ink" : "text-[#C5A059]"
                    }`}
                  >
                    <CalendarDays size={13} />
                    {new Intl.DateTimeFormat("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(event.date))}
                  </p>
                  <h3
                    className={`mt-1 font-display text-xl ${
                      night ? "text-papyrus" : papyrus ? "text-sanctuary-ink" : "text-[#C5A059]"
                    }`}
                  >
                    {event.title}
                  </h3>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      night
                        ? "text-papyrus/55"
                        : papyrus
                          ? "text-sanctuary-ink-soft"
                          : "text-[#F4EFE6]/80"
                    }`}
                  >
                    {event.description}
                  </p>
                  {event.products.length > 0 && (
                    <p
                      className={`mt-2 text-[10px] font-medium ${
                        night
                          ? "text-papyrus/45"
                          : papyrus
                            ? "text-sanctuary-ink-soft"
                            : "text-[#F4EFE6]/70"
                      }`}
                    >
                      Objetos rituales: {event.products.join(" · ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p
            className={`mt-6 text-sm ${night ? "text-papyrus/50" : "text-sanctuary-ink-soft"}`}
          >
            Muy pronto compartiremos nuevos encuentros y rituales.
          </p>
        )}
      </div>
    </section>
  );
}
