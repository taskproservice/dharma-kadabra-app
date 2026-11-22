"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { STORE_BANNERS, type StoreBannerSlide } from "../constants";

const AUTOPLAY_MS = 6500;

function BannerArt({ slide, eager }: { slide: StoreBannerSlide; eager: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="relative grid h-full min-h-[280px] w-full place-items-center overflow-hidden lg:min-h-[420px]"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 40%, rgba(197,160,89,.26), transparent 70%), linear-gradient(150deg, #FCFAF5, #EDE5D7)`,
        }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-6 border border-[#C5A059]/45" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-10 border border-[#C5A059]/25" />
        <span className="font-display text-[7rem] leading-none text-[#9E7B2F]/80 lg:text-[10rem]">
          {slide.symbol}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-[#EDE5D7] lg:min-h-[420px]">
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        sizes="(min-width: 1024px) 46vw, 100vw"
        priority={eager}
        loading={eager ? "eager" : "lazy"}
        className="object-cover transition-transform duration-[9000ms] ease-out"
        onError={() => setFailed(true)}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2E231D]/35 via-transparent to-transparent"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-4 border border-[#FCFAF5]/55" />
    </div>
  );
}

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
    setIndex(((next % STORE_BANNERS.length) + STORE_BANNERS.length) % STORE_BANNERS.length);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion.current) return;
    const timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, go]);

  const slide = STORE_BANNERS[index];
  const total = STORE_BANNERS.length;

  const scrollToCollection = () => {
    document
      .getElementById("tienda-holistica-catalogo")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="relative overflow-hidden border-y border-[#C5A059]/30 bg-[#EDE5D7]/60"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Colecciones destacadas de Holistic Store"
    >
      {/* Resplandor dorado ambiental */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.18),transparent_70%)] blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/65 to-transparent"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-16">
        {/* Columna editorial */}
        <div key={slide.src} className="store-slide-in">
          <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.35em] text-[#8B6914]">
            <span aria-hidden="true" className="h-px w-10 bg-[#C5A059]" />
            Holistic Store · {slide.kicker}
          </p>
          <h2 className="mt-6 font-display text-4xl leading-[1.04] text-[#1A1A1A] sm:text-5xl lg:text-6xl">
            {slide.title}{" "}
            <em className="italic text-[#9E7B2F]">{slide.accent}</em>
          </h2>
          <p className="mt-6 max-w-md text-base font-light leading-8 text-[#2C2C2C]/80">{slide.text}</p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={scrollToCollection}
              className="group inline-flex items-center gap-3 rounded-full bg-[#C5A059] px-8 py-4 text-[11px] font-bold uppercase tracking-[.28em] text-[#1A1A1A] shadow-[0_14px_36px_-16px_rgba(92,72,48,.35)] transition hover:bg-[#b58e45]"
            >
              Ver catálogo
              <ArrowDown size={15} className="transition group-hover:translate-y-0.5" />
            </button>
            <span aria-hidden="true" className="font-display text-lg italic text-[#2C2C2C]/60">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Controles */}
          <div className="mt-9 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Colección anterior"
              className="grid size-11 place-items-center rounded-full border border-[#2C2C2C]/25 bg-[#FCFAF5] text-[#1A1A1A]/80 transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1A1A1A]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Colección siguiente"
              className="grid size-11 place-items-center rounded-full border border-[#2C2C2C]/25 bg-[#FCFAF5] text-[#1A1A1A]/80 transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1A1A1A]"
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
                    i === index ? "w-10 bg-[#C5A059]" : "w-4 bg-[#2C2C2C]/20 hover:bg-[#2C2C2C]/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Columna visual */}
        <figure className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute -inset-4 rounded-sm border border-[#C5A059]/30" />
          <div className="relative aspect-[8/5] overflow-hidden rounded-sm border border-[#C5A059]/55 shadow-[0_28px_65px_-28px_rgba(92,72,48,.32)] lg:aspect-[16/11]">
            {STORE_BANNERS.map((item, i) => {
              const isActive = i === index;
              return (
                <div
                  key={item.src}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-opacity duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <BannerArt slide={item} eager={i === 0} />
                </div>
              );
            })}
          </div>
          <figcaption className="mt-4 text-center text-[10px] uppercase tracking-[.3em] text-[#2C2C2C]/65">
            {slide.kicker}
          </figcaption>
        </figure>
      </div>

      {/* Puntos inferiores para pantallas pequeñas */}
      <div className="relative flex justify-center gap-2 pb-8 lg:hidden" role="tablist" aria-label="Elegir colección">
        {STORE_BANNERS.map((item, i) => (
          <button
            key={item.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Ver ${item.kicker}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-10 bg-[#C5A059]" : "w-4 bg-[#2C2C2C]/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
