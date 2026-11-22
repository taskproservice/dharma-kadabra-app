"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services, formatSessionPrice } from "../../lib/data/services";

const eyebrow = "mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#805F2B] before:h-px before:w-10 before:bg-[#C5A059]/70";

/** Servicios agendables de la landing. Runas y Registros abren su propia página editorial. */
export function ServicesSection() {
  return (
    <section id="servicios" className="scroll-mt-16 bg-[#F4EFE6] px-5 py-16 text-[#1A1A1A] sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className={eyebrow}>Encuentros para tu camino</p>
          <h2 className="font-display text-5xl leading-tight text-[#1A1A1A] sm:text-6xl">Sabiduría para <em className="italic text-[#805F2B]">escucharte.</em></h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-800">Las runas son una brújula terrenal para el momento presente; los Registros Akáshicos, una memoria sutil del alma. Dos puertas distintas para encontrar orientación.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.id} className="flex h-full flex-col rounded-2xl border border-[#C5A059]/30 bg-[#FCFAF5] p-7 text-[#1A1A1A] shadow-[0_16px_36px_-28px_rgba(26,26,26,0.35)] sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <span aria-hidden="true" className="font-display text-4xl text-[#C5A059]">{service.symbol}</span>
                <span className="text-[10px] uppercase tracking-[.2em] text-stone-800">0{index + 1} · {service.duration}</span>
              </div>
              <p className="mt-8 text-[10px] uppercase tracking-[.25em] text-[#805F2B]">{service.essence}</p>
              <h3 className="mt-3 font-display text-3xl leading-snug text-[#1A1A1A]">{service.name}{service.id === "registros-akashicos" ? ":" : ""}</h3>
              <p className="mt-5 flex-1 text-sm leading-7 text-stone-800">{service.description}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#C5A059]/30 pt-8">
                <span className="whitespace-nowrap font-display text-2xl text-[#805F2B]">{formatSessionPrice(service.price)}</span>
                <Link
                  href={service.id === "lectura-de-runas" ? "/servicios/runas" : "/registros-akashicos"}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-stone-800 transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#805F2B]"
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
