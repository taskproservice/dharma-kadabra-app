"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services, formatSessionPrice } from "../../lib/data/services";

const eyebrow = "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#e3c57c] before:h-px before:w-10 before:bg-[#c7a45a]/60";

/** Servicios agendables de la landing. Runas y Registros abren su propia página editorial. */
export function ServicesSection() {
  return (
    <section id="servicios" className="scroll-mt-16 bg-[#0b1020] px-5 py-8 text-[#e9e2d2] sm:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className={eyebrow}>Encuentros para tu camino</p>
          <h2 className="font-display text-5xl leading-tight text-[#e9e2d2] sm:text-6xl">Sabiduría para <em className="italic text-[#e3c57c]">escucharte.</em></h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#e9e2d2]/90">Las runas son una brújula terrenal para el momento presente; los Registros Akáshicos, una memoria sutil del alma. Dos puertas distintas para encontrar orientación.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.id} className="flex h-full flex-col border border-[#C5A059]/30 bg-[#F4EFE6] p-7 text-[#1A1A1A] sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <span aria-hidden="true" className="font-display text-4xl text-[#C5A059]">{service.symbol}</span>
                <span className="text-[10px] uppercase tracking-[.2em] text-stone-800">0{index + 1} · {service.duration}</span>
              </div>
              <p className="mt-8 text-[10px] uppercase tracking-[.25em]">{service.essence}</p>
              <h3 className="mt-3 font-display text-3xl leading-snug">{service.name}{service.id === "registros-akashicos" ? ":" : ""}</h3>
              <p className="mt-5 flex-1 text-sm leading-7 text-stone-800">{service.description}</p>
              <div className="mt-auto pt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#C5A059]/30">
                <span className="bg-[#0b1020] px-2 font-display text-xl text-[#C5A059]">{formatSessionPrice(service.price)}</span>
                <Link
                  href={service.id === "lectura-de-runas" ? "/servicios/runas" : "/registros-akashicos"}
                  className="inline-flex items-center gap-2 border border-[#c7a45a]/60 bg-[#c7a45a]/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[.18em] transition hover:bg-[#c7a45a] hover:text-[#0b1020]"
                >
                  Agendar Sesión <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
