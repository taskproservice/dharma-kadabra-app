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
  /** Un <Image> por diapositiva, en el mismo orden que `slides` (renderizados en el servidor). */
  children: ReactNode;
  /** Emblema de marca flotante que acompaña al hero (opcional). */
  medallion?: ReactNode;
  /** Acción principal del hero (p. ej. el botón que abre el Tour de marca). */
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
      className="hero-sanctuary relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-sanctuary-night text-papyrus lg:h-screen lg:max-h-[1080px] lg:min-h-[760px]"
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
      <div className="pointer-events-none absolute inset-0 bg-obsidian/55" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(10,12,15,.92)_0%,rgba(15,17,21,.72)_42%,rgba(15,17,21,.12)_72%,rgba(15,17,21,.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-sanctuary-night via-sanctuary-night/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-obsidian/90 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 pb-10 pt-32 sm:px-8 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-16">
          {/* Titular editorial */}
          <div className="max-w-2xl">
            <div key={active}>
              <div className="hero-rise flex items-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold-light/80 to-gold-light/30" aria-hidden="true" />
                <p className="text-[10px] font-medium uppercase tracking-[.42em] text-gold-bright sm:text-[11px]">
                  {current.eyebrow}
                </p>
              </div>
              <h1 className="hero-rise mt-7 font-display text-[clamp(2.7rem,7vw,5.2rem)] font-normal leading-[1.02] tracking-[-.015em] text-papyrus [animation-delay:120ms] [text-shadow:0_2px_40px_rgba(0,0,0,.55)]">
                {current.title}{" "}
                <em className="relative font-display italic text-gold-bright [text-shadow:0_0_38px_rgba(197,160,89,.35)]">
                  {current.accent}
                </em>
              </h1>
              <p className="hero-rise mt-7 max-w-xl text-[15px] font-light leading-7 text-papyrus/80 [animation-delay:240ms] sm:text-lg sm:leading-8">
                {current.text}
              </p>
            </div>
            {cta ? (
              <div className="hero-rise mt-10 flex flex-wrap items-center gap-4 [animation-delay:360ms] sm:gap-5">{cta}</div>
            ) : null}
          </div>

          {/* Tarjeta de cristal con el logo oficial */}
          {medallion && (
            <div className="medallion-in mx-auto w-full max-w-[360px] [animation-delay:260ms] sm:max-w-[400px] lg:mx-0 lg:max-w-none lg:justify-self-end">
              {medallion}
            </div>
          )}
        </div>
      </div>

      {/* Controles inferiores · por encima del degradado hacia el papiro */}
      <div className="relative z-10 mt-6">
        <div className="mx-auto flex max-w-[1500px] items-center gap-5 px-5 pb-6 sm:px-8">
          <p className="font-display text-sm tabular-nums text-sanctuary-ink" aria-live="polite">
            <span className="text-sanctuary-gold-ink">{pad(active + 1)}</span>
            <span className="mx-2 text-sanctuary-ink-muted">/</span>
            <span className="text-sanctuary-ink-soft">{pad(total)}</span>
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
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-sanctuary-ink/15 transition group-hover:bg-sanctuary-ink/35" />
                <span className={`absolute left-0 top-1/2 h-px -translate-y-1/2 bg-sanctuary-gold-ink shadow-[0_0_8px_rgba(107,78,30,.5)] transition-[width] duration-700 ${index === active ? "w-full" : "w-0"}`} />
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Diapositiva anterior"
              className="grid size-10 place-items-center rounded-full border border-sanctuary-gold-ink/45 bg-sanctuary-wood-light/70 text-sanctuary-ink-soft transition hover:border-sanctuary-gold-ink hover:text-sanctuary-gold-ink hover:shadow-[0_8px_20px_-12px_rgba(80,57,31,.55)]"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Diapositiva siguiente"
              className="grid size-10 place-items-center rounded-full border border-sanctuary-gold-ink/45 bg-sanctuary-wood-light/70 text-sanctuary-ink-soft transition hover:border-sanctuary-gold-ink hover:text-sanctuary-gold-ink hover:shadow-[0_8px_20px_-12px_rgba(80,57,31,.55)]"
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
    <div className="relative mx-auto w-full max-w-[360px] text-center sm:max-w-[400px]">
        <div className="relative mx-auto w-fit">
          <span aria-hidden="true" className="glow-pulse absolute inset-[-45%] rounded-full bg-[radial-gradient(circle,rgba(227,197,124,.35),transparent_62%)] blur-xl" />
          <Image
            src="/images/logo.png"
            alt="Emblema de Dharma Kadabra: talismán de geometría sagrada"
            width={150}
            height={150}
            sizes="132px"
            priority
            className="relative mx-auto h-[118px] w-[118px] object-contain drop-shadow-[0_0_20px_rgba(197,160,89,0.4)] sm:h-[132px] sm:w-[132px]"
          />
        </div>

        <p className="relative mt-5 font-display text-[26px] leading-[1.05] tracking-[.08em] text-papyrus drop-shadow-md sm:text-[30px]">
          DHARMA
          <br />
          <span className="text-gold-bright">KADABRA</span>
        </p>
        <p className="relative mx-auto mt-3 max-w-[15rem] text-[8.5px] font-medium uppercase leading-relaxed tracking-[.24em] text-papyrus/75 drop-shadow-md">
          Talismanes maestros
          <br />
          Registros akáshicos
        </p>
        <p className="relative mt-5 font-display text-[15px] italic text-gold-bright drop-shadow-md sm:text-base">
          Conecta · Transforma · Armoniza
        </p>

        <span aria-hidden="true" className="relative mt-6 flex items-center justify-center gap-2 text-gold/40">
          <Sparkles size={11} />
          <span className="h-px w-10 bg-gold/25" />
          <Sparkles size={11} />
        </span>
    </div>
  );
}
