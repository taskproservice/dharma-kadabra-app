import Link from "next/link";
import { ArrowRight, MoonStar } from "lucide-react";
import { getLunarInfo } from "../../lib/lunar-utils";

export function LunarBanner() {
  const { phase, nextFullMoon } = getLunarInfo();
  const fullMoonDate = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(nextFullMoon);

  return (
    <section aria-label="Calendario lunar" className="relative z-10 px-5 sm:px-8">
      <div className="mx-auto -mt-6 grid max-w-7xl gap-7 rounded-2xl border border-[#C5A059]/30 bg-[#101523]/90 p-6 font-[family-name:var(--font-montserrat)] shadow-[0_24px_65px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8 lg:grid-cols-[1fr_1.4fr_auto] lg:items-center lg:gap-10">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#d8bc7f]">
            <MoonStar size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[.2em] text-[#e9e2d2]/60">Fase Lunar Actual:</p>
            <h2 className="mt-1 font-cormorant text-2xl font-semibold text-[#f7f2e7]">{phase}</h2>
          </div>
        </div>
        <div className="border-t border-[#C5A059]/20 pt-6 lg:border-l lg:border-t-0 lg:py-0 lg:pl-10">
          <h3 className="font-cormorant text-2xl font-semibold leading-tight text-[#d8bc7f]">Próximo Ritual de Limpieza Energética</h3>
          <p className="mt-2 text-sm text-[#f7f2e7]">Próxima Luna Llena: <time dateTime={nextFullMoon.toISOString()}>{fullMoonDate}</time> <span className="text-xs text-[#e9e2d2]/55">(fecha estimada, UTC)</span></p>
          <p className="mt-1 text-xs leading-5 text-[#e9e2d2]/65">Ideal para limpiar Runas, Pulseras y Piedras</p>
        </div>
        <Link href="/agenda" className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] px-6 py-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#0b1020] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c57c]">
          VER AGENDA COMPLETA <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
