"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services, formatSessionPrice } from "../../lib/data/services";

const eyebrow = "mb-5 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.35em] text-[#9E7B2F] before:h-px before:w-10 before:bg-[#C5A059]/75";

/** Servicios agendables de la landing. Runas y Registros abren su propia página editorial. */
export function ServicesSection() {
  return (
    <section id="servicios" className="scroll-mt-16 bg-[#F4EFE6] px-5 py-12 text-[#1A1A1A] sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className={eyebrow}>Encuentros para tu camino</p>
          <h2 className="font-display text-5xl leading-tight text-[#1A1A1A] sm:text-6xl">Sabiduría para <em className="italic text-[#9E7B2F]">escucharte.</em></h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#2C2C2C]/80">Las runas son una brújula terrenal para el momento presente; los Registros Akáshicos, una memoria sutil del alma. Dos puertas distintas para encontrar orientación.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.id} className="flex h-full flex-col rounded-2xl border border-[#C5A059]/38 bg-[#FCFAF5] p-7 shadow-[0_16px_40px_-24px_rgba(92,72,48,0.16)] transition hover:border-[#C5A059] sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <span className="font-display text-4xl text-[#9E7B2F]">{service.symbol}</span>
                <span className="text-[10px] font-medium uppercase tracking-[.2em] text-[#2C2C2C]/65">0{index + 1} · {service.duration}</span>
              </div>
              <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.25em] text-[#8B6914]">{service.essence}</p>
              <h3 className="mt-3 font-display text-3xl leading-snug text-[#1A1A1A]">{service.name}{service.id === "registros-akashicos" ? ":" : ""}</h3>
              <p className="mt-5 flex-1 text-sm leading-7 text-[#2C2C2C]/80">{service.description}</p>
              <div className="mt-auto pt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#C5A059]/25">
                <span className="font-display text-xl font-semibold text-[#1A1A1A]">{formatSessionPrice(service.price)}</span>
                {service.id === "lectura-de-runas" ? (
                  <Link
                    href="/servicios/runas"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C5A059] px-6 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#1A1A1A] shadow-[0_10px_24px_-12px_rgba(92,72,48,0.35)] transition hover:bg-[#b58e45]"
                  >
                    Agendar Sesión <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    href="/registros-akashicos"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C5A059] px-6 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#1A1A1A] shadow-[0_10px_24px_-12px_rgba(92,72,48,0.35)] transition hover:bg-[#b58e45]"
                  >
                    Agendar Sesión <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
