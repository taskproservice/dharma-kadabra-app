"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services, formatSessionPrice } from "../../lib/data/services";
import { FlowCrystal, FlowStone } from "./sanctuary-flow";
import cuarzoClaro from "../../public/images/productos/cuarzo-claro.jpg";

const eyebrow =
  "mb-5 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.35em] text-sanctuary-gold-ink before:h-px before:w-10 before:bg-sanctuary-gold/70";

/** Servicios agendables de la landing. Runas y Registros abren su propia página editorial. */
export function ServicesSection() {
  return (
    <section
      id="servicios"
      className="sanctuary-leaf relative scroll-mt-16 overflow-hidden px-5 py-16 sm:px-8 lg:py-24"
    >
      <FlowStone
        src={cuarzoClaro}
        position="-right-28 top-24 hidden sm:block lg:-right-16 xl:right-0"
        size="size-40 lg:size-56"
        opacity="opacity-[0.15]"
        frame="blob"
        speed="slow"
        rotate="-rotate-6"
      />
      <FlowCrystal className="left-[9%] bottom-16 hidden size-3 lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className={eyebrow}>Encuentros para tu camino</p>
          <h2 className="font-display text-5xl leading-tight text-[#2C241B] sm:text-6xl">
            Sabiduría para{" "}
            <em className="italic text-[#C5A059]">escucharte.</em>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#2C241B]">
            Las runas son una brújula terrenal para el momento presente; los Registros Akáshicos,
            una memoria sutil del alma. Dos puertas distintas para encontrar orientación.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:gap-6">
          {services.map((service, index) => (
            /* Tarjeta Premium Orgánico: fondo blanco, texto café oscuro,
               símbolo en dorado y botón "Agendar Sesión" dorado. */
            <article
              key={service.id}
              className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] sm:p-10"
            >
              <div className="flex items-start justify-between gap-6">
                <span aria-hidden="true" className="font-display text-4xl text-sanctuary-gold">
                  {service.symbol}
                </span>
                <span className="text-[10px] uppercase tracking-[.2em] text-ink-muted">
                  0{index + 1} · {service.duration}
                </span>
              </div>
              <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.25em] text-bronze">
                {service.essence}
              </p>
              <h3 className="mt-3 font-display text-3xl leading-snug text-[#2C241B]">
                {service.name}
                {service.id === "registros-akashicos" ? ":" : ""}
              </h3>
              <p className="mt-5 flex-1 text-sm leading-7 text-[#2C241B]">
                {service.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-8">
                <span className="whitespace-nowrap font-display text-2xl text-[#2C241B]">
                  {formatSessionPrice(service.price)}
                </span>
                <Link
                  href={
                    service.id === "lectura-de-runas" ? "/servicios/runas" : "/registros-akashicos"
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#C5A059] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#2C241B] transition hover:bg-sanctuary-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
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
