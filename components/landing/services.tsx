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
      className="sanctuary-leaf relative scroll-mt-16 overflow-hidden px-5 py-12 sm:px-8 sm:py-14 lg:py-[4.5rem]"
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
          <p className="max-w-sm pb-1 text-sm leading-6 text-[#5B5143]">
            Dos caminos de encuentro para escuchar tu intuición y recibir guía en el momento presente.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-10 lg:gap-6">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="group relative isolate flex min-h-[350px] flex-col overflow-hidden rounded-[1.75rem] bg-[#241E18] text-white shadow-[0_18px_46px_rgba(44,36,27,.16)] sm:min-h-[390px]"
            >
              <Image
                src={serviceImages[service.id].src}
                alt={serviceImages[service.id].alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                quality={88}
                className="-z-20 object-cover object-center transition duration-700 group-hover:scale-[1.04]"
              />
              {/* Degradado oscuro sobre la fotografía: el texto marfil y dorado
                  se lee con contraste AA en cualquier punto de la imagen. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
              />

              <div className="flex items-center justify-between px-6 pt-6 sm:px-8 sm:pt-8">
                <span className="rune-glyph text-3xl text-[#E3C57C]" aria-hidden="true">{service.symbol}</span>
                <span className="rounded-full border border-white/40 bg-black/15 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[.2em] text-white/90 backdrop-blur-sm">
                  0{index + 1} · {service.duration}
                </span>
              </div>

              <div className="mt-auto p-6 sm:p-8">
                <p className="text-[9px] font-semibold uppercase tracking-[.25em] text-[#E3C57C]">
                  {service.essence}
                </p>
                <h3 className="mt-2 max-w-lg font-display text-3xl leading-tight text-white sm:text-4xl">
                  {service.name}{service.id === "registros-akashicos" ? ":" : ""}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-[15px]">
                  {service.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/25 pt-5">
                  <span className="font-display text-xl text-white">
                    {formatSessionPrice(service.price)}
                  </span>
                  <Link
                    href={service.id === "lectura-de-runas" ? "/servicios/runas" : "/registros-akashicos"}
                    className="inline-flex items-center gap-2 rounded-full bg-[#F5F2EB] px-5 py-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#2C241B] transition hover:bg-[#D8BC7F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
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
