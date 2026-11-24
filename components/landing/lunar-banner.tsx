import Link from "next/link";
import { ArrowRight, MoonStar } from "lucide-react";
import { getLunarInfo } from "../../lib/lunar-utils";

/**
 * Calendario lunar · contenedor de la paleta holística.
 *
 * Antes era una franja negra flotante y luego madera tostada; ahora es una
 * pieza de Verde Oliva posada sobre el papiro: conserva la jerarquía (fase,
 * próximo ritual, CTA) con texto Beige Claro y títulos en Dorado.
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
      <div className="sanctuary-card-olive mx-auto grid max-w-7xl gap-7 p-6 font-montserrat sm:p-8 lg:grid-cols-[1fr_1.4fr_auto] lg:items-center lg:gap-10">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-[#C5A059]/40 bg-[#F4EFE6]/10 text-[#C5A059]">
            <MoonStar size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#C5A059]">
              Fase Lunar Actual:
            </p>
            <h2 className="mt-1 font-cormorant text-2xl font-semibold text-[#C5A059]">{phase}</h2>
          </div>
        </div>
        <div className="border-t border-[#F4EFE6]/20 pt-6 lg:border-l lg:border-t-0 lg:py-0 lg:pl-10">
          <h3 className="font-cormorant text-2xl font-semibold leading-tight text-[#C5A059]">
            Próximo Ritual de Limpieza Energética
          </h3>
          <p className="mt-2 text-sm text-[#F4EFE6]/85">
            Próxima Luna Llena:{" "}
            <time dateTime={nextFullMoon.toISOString()}>{fullMoonDate}</time>{" "}
            <span className="text-xs text-[#F4EFE6]/70">(fecha estimada, UTC)</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-[#F4EFE6]/85">
            Ideal para limpiar Runas, Pulseras y Piedras
          </p>
        </div>
        <Link
          href="/agenda"
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-sanctuary-gold px-6 py-4 text-[10px] font-semibold uppercase tracking-[.16em] text-sanctuary-ink shadow-[0_14px_30px_-18px_rgba(80,57,31,.6)] transition hover:bg-sanctuary-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sanctuary-gold-ink"
        >
          VER AGENDA COMPLETA{" "}
          <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
