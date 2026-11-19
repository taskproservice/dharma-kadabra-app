"use client";

import { Children, useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  accent: string;
  text: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  /** Un <Image> por diapositiva, en el mismo orden que `slides` (renderizados en el servidor). */
  children: ReactNode;
  interval?: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function HeroCarousel({ slides, children, interval = 7000 }: HeroCarouselProps) {
  const images = Children.toArray(children);
  const total = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Las diapositivas 2 y 3 no se montan hasta que la página terminó de cargar:
  // así no compiten por ancho de banda con la imagen LCP (la primera).
  const [loadRest, setLoadRest] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const go = () => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(() => setLoadRest(true), { timeout: 2500 });
      else setTimeout(() => setLoadRest(true), 1200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  const goTo = useCallback((index: number) => {
    setLoadRest(true);
    setActive(((index % total) + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || reducedMotion || !loadRest) return;
    const timer = window.setTimeout(() => goTo(active + 1), interval);
    return () => window.clearTimeout(timer);
  }, [active, paused, reducedMotion, loadRest, interval, goTo]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const current = slides[active];

  return (
    <section
      id="inicio"
      aria-roledescription="carrusel"
      aria-label="Dharma Kadabra"
      className="relative h-screen w-full overflow-hidden bg-[#1A1A1A] text-[#F4ECD8]"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") goTo(active + 1);
        if (event.key === "ArrowLeft") goTo(active - 1);
      }}
    >
      {images.map((image, index) => {
        const isActive = index === active;
        if (index > 0 && !loadRest) return null;
        return (
          <div
            key={index}
            aria-hidden={!isActive}
            aria-roledescription="diapositiva"
            className={`absolute inset-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(.22,.61,.36,1)] ${isActive ? "opacity-100" : "opacity-0"}`}
          >
            <div className={`h-full w-full ${isActive ? "hero-zoom" : ""}`}>{image}</div>
          </div>
        );
      })}

      {/* Velos cinematográficos */}
      {/* Overlay oscuro uniforme para legibilidad del título y el botón */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-28 sm:px-8 sm:pb-32 lg:pb-36">
        <div key={active} className="max-w-3xl">
          <p className="hero-rise flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#D4AF37]">
            <span className="h-px w-10 bg-[#D4AF37]/70" />
            {current.eyebrow}
          </p>
          <h1 className="hero-rise mt-6 font-display text-[2.75rem] font-normal leading-[1.02] tracking-[-.01em] [animation-delay:120ms] sm:text-6xl lg:text-[5.5rem]">
            {current.title} <em className="font-normal italic text-[#E6C766]">{current.accent}</em>
          </h1>
          <p className="hero-rise mt-6 max-w-xl text-base font-light leading-7 text-[#F4ECD8]/75 [animation-delay:240ms] sm:text-lg">
            {current.text}
          </p>
          <div className="hero-rise mt-10 flex flex-wrap items-center gap-6 [animation-delay:360ms]">
            <a href="#prueba" className="group inline-flex items-center gap-3 border border-[#D4AF37]/70 bg-[#D4AF37]/10 px-7 py-4 text-[11px] font-semibold uppercase tracking-[.28em] text-[#F4ECD8] backdrop-blur-md transition hover:bg-[#D4AF37] hover:text-[#1A1A1A]">
              Prueba gratis <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href="#manifiesto" className="text-[11px] font-medium uppercase tracking-[.28em] text-[#F4ECD8]/70 underline-offset-8 transition hover:text-[#F4ECD8] hover:underline">
              Descubrir
            </a>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-[#D4AF37]/15 bg-[#1A1A1A]/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 py-4 pl-5 pr-24 sm:pl-8 sm:pr-28 2xl:pr-8">
          <p className="font-display text-sm tabular-nums text-[#F4ECD8]/80" aria-live="polite">
            <span className="text-[#D4AF37]">{pad(active + 1)}</span>
            <span className="mx-2 text-[#F4ECD8]/30">/</span>
            {pad(total)}
          </p>
          <div className="hidden flex-1 items-center gap-3 sm:flex">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ver diapositiva ${index + 1}`}
                aria-current={index === active}
                className="group relative h-6 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#F4ECD8]/20 transition group-hover:bg-[#F4ECD8]/40" />
                <span className={`absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#D4AF37] transition-[width] duration-700 ${index === active ? "w-full" : "w-0"}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Diapositiva anterior" className="grid size-10 place-items-center rounded-full border border-[#D4AF37]/30 text-[#F4ECD8]/80 transition hover:border-[#D4AF37] hover:text-[#D4AF37]">
              <ArrowLeft size={16} />
            </button>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Diapositiva siguiente" className="grid size-10 place-items-center rounded-full border border-[#D4AF37]/30 text-[#F4ECD8]/80 transition hover:border-[#D4AF37] hover:text-[#D4AF37]">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
