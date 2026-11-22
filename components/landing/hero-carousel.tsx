"use client";

import { Children, useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  accent: string;
  text: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  children: ReactNode;
  medallion?: ReactNode;
  cta?: ReactNode;
  interval?: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function HeroCarousel({ slides, children, medallion, cta, interval = 8000 }: HeroCarouselProps) {
  const images = Children.toArray(children);
  const total = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
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
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#F4EFE6] text-[#1A1A1A] lg:h-screen lg:max-h-[1080px] lg:min-h-[760px]"
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
            className={`absolute inset-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(.22,.61,.36,1)] ${isActive ? "opacity-35" : "opacity-0"}`}
          >
            <div className={`h-full w-full ${isActive ? "hero-zoom" : ""}`}>{image}</div>
          </div>
        );
      })}

      {/* Velos cálidos de papiro: unifican la fotografía con el fondo orgánico y protegen la lectura */}
      <div className="pointer-events-none absolute inset-0 bg-[#F4EFE6]/65" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(244,239,230,.96)_0%,rgba(244,239,230,.85)_44%,rgba(244,239,230,.45)_75%,rgba(244,239,230,.75)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#F4EFE6] via-[#F4EFE6]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#F4EFE6]/95 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 pb-10 pt-32 sm:px-8 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-16">
          {/* Titular editorial */}
          <div className="max-w-2xl">
            <div key={active}>
              <div className="hero-rise flex items-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#9E7B2F] to-[#C5A059]/40" aria-hidden="true" />
                <p className="text-[10px] font-semibold uppercase tracking-[.42em] text-[#8B6914] sm:text-[11px]">
                  {current.eyebrow}
                </p>
              </div>
              <h1 className="hero-rise mt-7 font-display text-[clamp(2.7rem,7vw,5.2rem)] font-normal leading-[1.02] tracking-[-.015em] text-[#1A1A1A] [animation-delay:120ms]">
                {current.title}{" "}
                <em className="relative font-display italic text-[#9E7B2F]">
                  {current.accent}
                </em>
              </h1>
              <p className="hero-rise mt-7 max-w-xl text-[15px] font-light leading-7 text-[#2C2C2C]/85 [animation-delay:240ms] sm:text-lg sm:leading-8">
                {current.text}
              </p>
            </div>
            {cta ? (
              <div className="hero-rise mt-10 flex flex-wrap items-center gap-4 [animation-delay:360ms] sm:gap-5">{cta}</div>
            ) : null}
          </div>

          {/* Medallón de marca sobre papiro */}
          {medallion && (
            <div className="medallion-in mx-auto w-full max-w-[360px] [animation-delay:260ms] sm:max-w-[400px] lg:mx-0 lg:max-w-none lg:justify-self-end">
              {medallion}
            </div>
          )}
        </div>
      </div>

      {/* Controles inferiores */}
      <div className="relative z-10 mt-6">
        <div className="mx-auto flex max-w-[1500px] items-center gap-5 px-5 pb-6 sm:px-8">
          <p className="font-display text-sm tabular-nums text-[#1A1A1A]" aria-live="polite">
            <span className="font-semibold text-[#8B6914]">{pad(active + 1)}</span>
            <span className="mx-2 text-[#2C2C2C]/35">/</span>
            <span className="text-[#2C2C2C]/65">{pad(total)}</span>
          </p>
          <div className="hidden max-w-md flex-1 items-center gap-2.5 sm:flex">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ver diapositiva ${index + 1}`}
                aria-current={index === active}
                className="group relative h-5 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#2C2C2C]/20 transition group-hover:bg-[#2C2C2C]/40" />
                <span className={`absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#C5A059] transition-[width] duration-700 ${index === active ? "w-full" : "w-0"}`} />
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Diapositiva anterior"
              className="grid size-10 place-items-center rounded-full border border-[#2C2C2C]/25 bg-[#FCFAF5]/80 text-[#1A1A1A]/80 transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1A1A1A]"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Diapositiva siguiente"
              className="grid size-10 place-items-center rounded-full border border-[#2C2C2C]/25 bg-[#FCFAF5]/80 text-[#1A1A1A]/80 transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1A1A1A]"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Marca editorial flotante del hero: logo y tagline. */
export function HeroMedallion() {
  return (
    <div className="relative mx-auto w-full max-w-[360px] rounded-3xl border border-[#C5A059]/35 bg-[#FCFAF5]/85 p-8 text-center shadow-[0_24px_60px_-28px_rgba(92,72,48,0.18)] backdrop-blur-md sm:max-w-[400px]">
      <div className="relative mx-auto w-fit">
        <span aria-hidden="true" className="glow-pulse absolute inset-[-45%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.28),transparent_62%)] blur-xl" />
        <Image
          src="/images/logo.png"
          alt="Emblema de Dharma Kadabra: talismán de geometría sagrada"
          width={150}
          height={150}
          priority
          className="relative mx-auto h-[118px] w-[118px] object-contain drop-shadow-[0_6px_18px_rgba(92,72,48,0.2)] sm:h-[132px] sm:w-[132px]"
        />
      </div>

      <p className="relative mt-5 font-display text-[26px] leading-[1.05] tracking-[.08em] text-[#1A1A1A] sm:text-[30px]">
        DHARMA
        <br />
        <span className="text-[#9E7B2F]">KADABRA</span>
      </p>
      <p className="relative mx-auto mt-3 max-w-[15rem] text-[8.5px] font-semibold uppercase leading-relaxed tracking-[.24em] text-[#2C2C2C]/70">
        Talismanes maestros
        <br />
        Registros akáshicos
      </p>
      <p className="relative mt-5 font-display text-[15px] italic text-[#8B6914] sm:text-base">
        Conecta · Transforma · Armoniza
      </p>

      <span aria-hidden="true" className="relative mt-6 flex items-center justify-center gap-2 text-[#C5A059]">
        <Sparkles size={11} />
        <span className="h-px w-10 bg-[#C5A059]/50" />
        <Sparkles size={11} />
      </span>
    </div>
  );
}
