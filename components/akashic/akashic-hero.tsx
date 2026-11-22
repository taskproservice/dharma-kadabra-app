"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicBookingCTA } from "./akashic-booking-cta";
import { Eyebrow } from "./akashic-shared";

/** Sección 01 · Hero — «La memoria del alma». */
export function AkashicHero() {
  const hero = akashicContent.hero;
  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden bg-obsidian pt-24">
      <Image
        src={akashicImages.hero}
        alt="Mujer en meditación al amanecer, en silueta frente a la luz dorada"
        fill
        priority
        sizes="100vw"
        quality={90}
        className="object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,21,.74)_0%,rgba(15,17,21,.48)_35%,rgba(15,17,21,.94)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.14),transparent_68%)] blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-20 text-center sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
        </div>
        <h1 className="akashic-display mt-9 text-[clamp(3rem,10vw,8rem)] font-light uppercase leading-[.92] tracking-[.06em] text-gold drop-shadow-[0_10px_40px_rgba(0,0,0,.75)]">
          {hero.titleTop}
          <br />
          {hero.titleBottom}
        </h1>
        <div className="akashic-hairline mx-auto mt-9 h-px w-56" />
        <p className="mx-auto mt-9 max-w-2xl text-sm leading-8 text-papyrus/78 sm:text-base">
          {hero.subtitle}
        </p>
        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <AkashicBookingCTA
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-gold px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-obsidian shadow-[0_22px_60px_-22px_rgba(197,160,89,.9)] transition hover:bg-gold-light"
            label="Reservar mi lectura de Registros Akáshicos"
          >
            {hero.primaryCta}
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </AkashicBookingCTA>
          <a
            href={hero.secondaryHref}
            className="group inline-flex items-center gap-3 rounded-full border border-gold/70 bg-gold/10 px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-papyrus transition hover:bg-gold hover:text-obsidian"
          >
            {hero.secondaryCta}
            <ArrowDown size={15} className="transition group-hover:translate-y-1" />
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 text-[9px] uppercase tracking-[.3em] text-papyrus/45 sm:justify-between">
        {hero.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
        <span aria-hidden="true" className="text-sm text-gold/70">
          {hero.glyphs}
        </span>
      </div>
    </section>
  );
}
