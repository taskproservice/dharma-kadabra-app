"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services, formatSessionPrice } from "../../lib/data/services";
import runasMadera from "../../public/images/runas/runas-sobre-madera.jpg";
import libroVela from "../../public/images/akashic/libro-vela.jpg";

/**
 * Fotografía real de cada servicio, asociada por `id` (no por posición) para que
 * el fondo siempre corresponda: el libro con la vela para los Registros
 * Akáshicos y las piedras de runas para la lectura de Runas.
 */
const serviceImages: Record<string, { src: typeof runasMadera; alt: string }> = {
  "registros-akashicos": {
    src: libroVela,
    alt: "Libro antiguo abierto con un mapa celeste junto a una vela encendida",
  },
  "lectura-de-runas": {
    src: runasMadera,
    alt: "Piedras de runas grabadas dispuestas sobre una mesa de madera oscura",
  },
};

const eyebrow =
  "mb-5 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.35em] text-sanctuary-gold-ink before:h-px before:w-10 before:bg-sanctuary-gold/70";

/** Servicios agendables de la landing. Runas y Registros abren su propia página editorial. */
export function ServicesSection() {
  return (
    <section
      id="servicios"
      className="sanctuary-leaf-oxidized relative scroll-mt-16 overflow-hidden px-5 py-12 sm:px-8 sm:py-14 lg:py-[4.5rem]"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className={eyebrow}>Encuentros para tu camino</p>
            <h2 className="font-display text-4xl leading-tight text-[#2C241B] sm:text-5xl lg:text-6xl">
              Sabiduría para{" "}
              <em className="italic text-[#6B4E1E]">escucharte.</em>
            </h2>
          </div>
          <p className="max-w-sm pb-1 text-sm leading-6 text-[#514333]">
            Dos caminos de encuentro para escuchar tu intuición y recibir guía en el momento presente.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-10 lg:gap-6">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="sanctuary-papyrus-oxidized group relative isolate flex min-h-[350px] flex-col overflow-hidden rounded-[1.75rem] text-[#2C241B] shadow-[0_18px_46px_-24px_rgba(44,36,27,.35)] transition duration-500 hover:shadow-[0_24px_56px_-26px_rgba(44,36,27,.42)] sm:min-h-[390px]"
            >
              {/* Fotografía como textura de papel: opacidad muy baja y fundida en
                  el pergamino, para que la tarjeta se lea como papiro antiguo. */}
              <Image
                src={serviceImages[service.id].src}
                alt={serviceImages[service.id].alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                quality={88}
                className="-z-20 object-cover object-center opacity-[.18] mix-blend-multiply transition duration-700 group-hover:scale-[1.03] group-hover:opacity-[.22]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(232,220,200,.86)_0%,rgba(232,220,200,.74)_45%,rgba(223,209,190,.92)_100%)]"
              />

              <div className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-8 sm:pt-8">
                <span className="rune-glyph text-3xl text-[#805F2B]" aria-hidden="true">{service.symbol}</span>
                <span className="rounded-full border border-[#2C241B]/25 bg-[#FCFAF5]/60 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[.2em] text-[#2C241B]/85 backdrop-blur-[2px]">
                  0{index + 1} · {service.duration}
                </span>
              </div>

              <div className="relative z-10 mt-auto p-6 sm:p-8">
                <p className="text-[9px] font-semibold uppercase tracking-[.25em] text-[#6B4E1E]">
                  {service.essence}
                </p>
                <h3 className="mt-2 max-w-lg font-display text-3xl leading-tight text-[#6B4E1E] sm:text-4xl">
                  {service.name}{service.id === "registros-akashicos" ? ":" : ""}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#2C241B]/85 sm:text-[15px]">
                  {service.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#2C241B]/20 pt-5">
                  <span className="font-display text-xl text-[#2C241B]">
                    {formatSessionPrice(service.price)}
                  </span>
                  <Link
                    href={service.id === "lectura-de-runas" ? "/servicios/runas" : "/registros-akashicos"}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2C241B]/50 bg-[#FCFAF5]/70 px-5 py-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#2C241B] backdrop-blur-[2px] transition hover:border-[#2C241B] hover:bg-[#FCFAF5] hover:text-[#6B4E1E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2C241B]"
                  >
                    Reserva tu sesión <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
