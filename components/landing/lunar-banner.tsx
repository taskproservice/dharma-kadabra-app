import Link from "next/link";
import { ArrowRight, MoonStar } from "lucide-react";
import { getLunarInfo } from "../../lib/lunar-utils";

/**
 * Calendario lunar · Premium Orgánico.
 *
 * Tarjeta blanca limpia sobre el beige: fondo #FFFFFF, borde stone sutil y
 * sombra muy suave; texto café oscuro con acentos en bronce y dorado cálido.
 */
export function LunarBanner() {
  const { phase, nextFullMoon } = getLunarInfo();
  const fullMoonDate = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(nextFullMoon);

  return (
    <section
      aria-label="Calendario lunar"
      className="relative z-10 overflow-x-clip px-5 pt-10 sm:px-8 lg:pt-14"
    >
      <div className="mx-auto grid max-w-7xl gap-7 rounded-3xl border border-stone-200 bg-[#FCFAF5] p-6 font-montserrat shadow-[0_10px_30px_-22px_rgba(44,36,27,.30)] sm:p-8 lg:grid-cols-[1fr_1.4fr_auto] lg:items-center lg:gap-10">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-bronze">
            <MoonStar size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-bronze">
              Fase Lunar Actual:
            </p>
            <h2 className="mt-1 font-cormorant text-2xl font-semibold text-ink">{phase}</h2>
          </div>
        </div>
        <div className="border-t border-stone-200 pt-6 lg:border-l lg:border-t-0 lg:py-0 lg:pl-10">
          <h3 className="font-cormorant text-2xl font-semibold leading-tight text-ink">
            Próximo Ritual de Limpieza Energética
          </h3>
          <p className="mt-2 text-sm text-sanctuary-ink-soft">
            Próxima Luna Llena:{" "}
            <time dateTime={nextFullMoon.toISOString()}>{fullMoonDate}</time>{" "}
            <span className="text-xs text-ink-muted">(fecha estimada, UTC)</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            Ideal para limpiar Runas, Pulseras y Piedras
          </p>
        </div>
        <Link
          href="/agenda"
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-gold px-6 py-4 text-[10px] font-semibold uppercase tracking-[.16em] text-ink shadow-[0_10px_24px_-14px_rgba(197,160,89,0.7)] transition hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze"
        >
          VER AGENDA COMPLETA{" "}
          <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
