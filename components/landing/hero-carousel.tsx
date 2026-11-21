"use client";

import { Children, useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MoveUpRight, Sparkles } from "lucide-react";

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
  /** Tarjeta de cristal de marca que acompaña al hero (opcional). */
  medallion?: ReactNode;
  interval?: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function HeroCarousel({ slides, children, medallion, interval = 8000 }: HeroCarouselProps) {
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
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#080c16] text-[#f7f2e7] lg:h-screen lg:max-h-[1080px] lg:min-h-[760px]"
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

      {/* Velos cinematográficos: oscurecen el libro y protegen la legibilidad */}
      <div className="pointer-events-none absolute inset-0 bg-[#080c16]/55" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(5,7,13,.92)_0%,rgba(8,12,22,.72)_42%,rgba(8,12,22,.12)_72%,rgba(8,12,22,.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#080c16] via-[#080c16]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080c16]/90 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 pb-10 pt-32 sm:px-8 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-16">
          {/* Titular editorial */}
          <div key={active} className="max-w-2xl">
            <div className="hero-rise flex items-center gap-4">
              <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#d8bc7f]/80 to-[#d8bc7f]/30" aria-hidden="true" />
              <p className="text-[10px] font-medium uppercase tracking-[.42em] text-[#e3c57c] sm:text-[11px]">
                {current.eyebrow}
              </p>
            </div>
            <h1 className="hero-rise mt-7 font-display text-[clamp(2.7rem,7vw,5.2rem)] font-normal leading-[1.02] tracking-[-.015em] text-[#f7f2e7] [animation-delay:120ms] [text-shadow:0_2px_40px_rgba(0,0,0,.55)]">
              {current.title}{" "}
              <em className="relative font-display italic text-[#e3c57c] [text-shadow:0_0_38px_rgba(199,164,90,.35)]">
                {current.accent}
              </em>
            </h1>
            <p className="hero-rise mt-7 max-w-xl text-[15px] font-light leading-7 text-[#e9e2d2]/80 [animation-delay:240ms] sm:text-lg sm:leading-8">
              {current.text}
            </p>
            <div className="hero-rise mt-10 flex flex-wrap items-center gap-4 [animation-delay:360ms] sm:gap-5">
              <a
                href="#coleccion"
                className="group inline-flex items-center gap-3 rounded-full border border-[#c7a45a] bg-transparent px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.28em] text-[#f7f2e7] transition duration-300 hover:bg-[#c7a45a] hover:text-[#0b1020] hover:shadow-[0_0_40px_-6px_rgba(199,164,90,.7)]"
              >
                Explorar colección
                <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </a>
              <a
                href="#manifiesto"
                className="group inline-flex items-center gap-3 rounded-full border border-[#c7a45a]/50 bg-transparent px-7 py-3.5 text-[10px] font-medium uppercase tracking-[.28em] text-[#e9e2d2]/85 transition duration-300 hover:border-[#c7a45a] hover:text-[#e3c57c] hover:shadow-[0_0_30px_-8px_rgba(199,164,90,.5)]"
              >
                Descubrir
                <MoveUpRight size={13} className="text-[#d8bc7f]/70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Tarjeta de cristal con el logo oficial */}
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
          <p className="font-display text-sm tabular-nums text-[#f7f2e7]" aria-live="polite">
            <span className="text-[#e3c57c]">{pad(active + 1)}</span>
            <span className="mx-2 text-[#e9e2d2]/35">/</span>
            <span className="text-[#e9e2d2]/55">{pad(total)}</span>
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
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#f7f2e7]/15 transition group-hover:bg-[#f7f2e7]/35" />
                <span className={`absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#d8bc7f] shadow-[0_0_8px_rgba(216,188,127,.8)] transition-[width] duration-700 ${index === active ? "w-full" : "w-0"}`} />
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Diapositiva anterior"
              className="grid size-10 place-items-center rounded-full border border-[#c7a45a]/30 text-[#f7f2e7]/70 transition hover:border-[#c7a45a] hover:text-[#e3c57c] hover:shadow-[0_0_20px_rgba(199,164,90,.28)]"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Diapositiva siguiente"
              className="grid size-10 place-items-center rounded-full border border-[#c7a45a]/30 text-[#f7f2e7]/70 transition hover:border-[#c7a45a] hover:text-[#e3c57c] hover:shadow-[0_0_20px_rgba(199,164,90,.28)]"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Tarjeta de cristal del hero: logo, tagline y CTA "Conoce más". */
export function HeroMedallion() {
  return (
    <div className="relative">
      {/* Resplandor exterior */}
      <span
        aria-hidden="true"
        className="glow-pulse absolute inset-[-14%] rounded-[42%] bg-[radial-gradient(circle,rgba(199,164,90,.28),transparent_62%)] blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[2rem] border border-[#c7a45a]/35 bg-[linear-gradient(155deg,rgba(28,36,56,.82)_0%,rgba(11,16,32,.72)_55%,rgba(199,164,90,.10)_100%)] px-7 pb-7 pt-8 text-center shadow-[0_40px_110px_-40px_rgba(0,0,0,.95),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl sm:px-9 sm:pb-8 sm:pt-9">
        {/* Órbita decorativa */}
        <span aria-hidden="true" className="spin-slow pointer-events-none absolute inset-3 rounded-[1.6rem] border border-[#c7a45a]/15" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e3c57c]/70 to-transparent" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c7a45a]/40 to-transparent" />

        <div className="relative mx-auto w-fit">
          <span aria-hidden="true" className="glow-pulse absolute inset-[-45%] rounded-full bg-[radial-gradient(circle,rgba(227,197,124,.35),transparent_62%)] blur-xl" />
          <Image
            src="/images/logo.png"
            alt="Emblema de Dharma Kadabra: talismán de geometría sagrada"
            width={150}
            height={150}
            priority
            className="relative mx-auto h-[118px] w-[118px] object-contain drop-shadow-[0_0_26px_rgba(216,188,127,.55)] sm:h-[132px] sm:w-[132px]"
          />
        </div>

        <p className="relative mt-5 font-display text-[26px] leading-[1.05] tracking-[.08em] text-[#f7f2e7] sm:text-[30px]">
          DHARMA
          <br />
          <span className="text-[#e3c57c]">KADABRA</span>
        </p>
        <p className="relative mx-auto mt-3 max-w-[15rem] text-[8.5px] font-medium uppercase leading-relaxed tracking-[.24em] text-[#e9e2d2]/55">
          Talismanes maestros
          <br />
          Registros akáshicos
        </p>
        <p className="relative mt-5 font-display text-[15px] italic text-[#e3c57c] sm:text-base">
          Conecta · Transforma · Armoniza
        </p>

        <a
          href="#manifiesto"
          className="group relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#c7a45a]/55 bg-white/[0.03] px-6 py-3 text-[10px] font-semibold uppercase tracking-[.24em] text-[#f7f2e7] transition hover:border-[#e3c57c] hover:bg-[#c7a45a]/15"
        >
          Conoce más
          <ArrowRight size={13} className="transition group-hover:translate-x-1" />
        </a>

        <span aria-hidden="true" className="relative mt-4 flex items-center justify-center gap-2 text-[#c7a45a]/40">
          <Sparkles size={11} />
          <span className="h-px w-10 bg-[#c7a45a]/25" />
          <Sparkles size={11} />
        </span>
      </div>
    </div>
  );
}
