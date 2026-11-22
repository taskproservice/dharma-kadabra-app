"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { STORE_BANNERS, STORE_PALETTE, type StoreBannerSlide } from "../constants";

const AUTOPLAY_MS = 6500;

/**
 * Arte del banner con respaldo ornamental: si la imagen aún no se ha subido
 * a `public/images/store-banner/`, muestra un panel dorado intencional
 * (nunca un icono de imagen rota).
 */
function BannerArt({ slide, eager }: { slide: StoreBannerSlide; eager: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="relative grid h-full min-h-[280px] w-full place-items-center overflow-hidden lg:min-h-[420px]"
        style={{ background: `radial-gradient(ellipse 80% 70% at 50% 40%, rgba(197,160,89,.28), transparent 70%), linear-gradient(150deg, #1d1d1d, ${STORE_PALETTE.nocturno})` }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-6 border border-[#C5A059]/25" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-10 border border-[#C5A059]/12" />
        <span className="font-display text-[7rem] leading-none text-[#C5A059]/70 lg:text-[10rem]">
          {slide.symbol}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden lg:min-h-[420px]">
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        sizes="(min-width: 1024px) 46vw, 100vw"
        priority={eager}
        loading={eager ? "eager" : "lazy"}
        className="object-cover"
        onError={() => setFailed(true)}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121212]/55 via-transparent to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-4 border border-[#F7F3EA]/20" />
    </div>
  );
}

/**
 * Banner comercial de Holistic Store: carrusel editorial de 3 paneles sobre
 * fondo Nocturno, con autoplay, flechas, puntos y CTA a la colección.
 */
export function StoreBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback((next: number) => {
    setIndex((next + STORE_BANNERS.length) % STORE_BANNERS.length);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion.current) return;
    const timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, go]);

  const slide = STORE_BANNERS[index];

  const scrollToCollection = () => {
    document.getElementById("tienda-holistica-catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: STORE_PALETTE.nocturno }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Colecciones destacadas de Holistic Store"
    >
      {/* Resplandor dorado ambiental */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.14),transparent_70%)] blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />

      <div key={slide.src} className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-20">
        {/* Columna editorial */}
        <div>
          <p className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#C5A059]">
            <span aria-hidden="true" className="h-px w-10 bg-[#C5A059]/70" />
            Holistic Store · {slide.kicker}
          </p>
          <h2 className="mt-6 font-display text-5xl leading-[1.04] text-[#F7F3EA] sm:text-6xl lg:text-7xl">
            {slide.title}{" "}
            <em className="italic text-[#C5A059]">{slide.accent}</em>
          </h2>
          <p className="mt-6 max-w-md text-base font-light leading-8 text-[#F7F3EA]/65">
            {slide.text}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={scrollToCollection}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#d9bd7f] via-[#C5A059] to-[#e6cd8d] px-8 py-4 text-[11px] font-bold uppercase tracking-[.28em] text-[#121212] shadow-[0_18px_50px_-20px_rgba(197,160,89,.8)] transition hover:brightness-110"
            >
              Explorar colección
              <ArrowDown size={15} className="transition group-hover:translate-y-0.5" />
            </button>
            <span aria-hidden="true" className="font-display text-lg italic text-[#F7F3EA]/40">
              {String(index + 1).padStart(2, "0")} / {String(STORE_BANNERS.length).padStart(2, "0")}
            </span>
          </div>

          {/* Controles */}
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Colección anterior"
              className="grid size-11 place-items-center rounded-full border border-[#C5A059]/35 text-[#F7F3EA]/70 transition hover:border-[#C5A059] hover:text-[#C5A059]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Colección siguiente"
              className="grid size-11 place-items-center rounded-full border border-[#C5A059]/35 text-[#F7F3EA]/70 transition hover:border-[#C5A059] hover:text-[#C5A059]"
            >
              <ChevronRight size={18} />
            </button>
            <div className="ml-2 flex items-center gap-2" role="tablist" aria-label="Elegir colección">
              {STORE_BANNERS.map((item, i) => (
                <button
                  key={item.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Ver ${item.kicker}`}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === index ? "w-10 bg-[#C5A059]" : "w-4 bg-[#F7F3EA]/20 hover:bg-[#F7F3EA]/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Columna visual */}
        <figure className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute -inset-4 rounded-sm border border-[#C5A059]/20" />
          <div className="overflow-hidden rounded-sm border border-[#C5A059]/40 shadow-[0_40px_90px_-30px_rgba(0,0,0,.85)]">
            <BannerArt slide={slide} eager={index === 0} />
          </div>
          <figcaption className="mt-4 text-center text-[10px] uppercase tracking-[.3em] text-[#F7F3EA]/40">
            {slide.kicker}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
