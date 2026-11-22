"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicBookingCTA } from "./akashic-booking-cta";
import { Eyebrow } from "./akashic-shared";

/** Sección 01 · Hero — «La memoria del alma» sobre Papiro cálido. */
export function AkashicHero() {
  const hero = akashicContent.hero;
  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#F4EFE6] pt-24">
      <Image
        src={akashicImages.hero}
        alt="Mujer en meditación al amanecer, en silueta frente a la luz dorada"
        fill
        priority
        sizes="100vw"
        quality={90}
        className="object-cover opacity-22"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,230,.85)_0%,rgba(244,239,230,.72)_38%,rgba(244,239,230,.98)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.22),transparent_68%)] blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-20 text-center sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
        </div>
        <h1 className="akashic-display mt-9 text-[clamp(3rem,10vw,8rem)] font-light uppercase leading-[.92] tracking-[.06em] text-[#1A1A1A]">
          {hero.titleTop}
          <br />
          <span className="text-[#9E7B2F]">{hero.titleBottom}</span>
        </h1>
        <div className="akashic-hairline mx-auto mt-9 h-px w-56" />
        <p className="mx-auto mt-9 max-w-2xl text-sm leading-8 text-[#2C2C2C]/85 sm:text-base">
          {hero.subtitle}
        </p>
        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <AkashicBookingCTA
            className="group inline-flex items-center gap-3 rounded-full bg-[#C5A059] px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-[#1A1A1A] shadow-[0_18px_45px_-18px_rgba(92,72,48,.4)] transition hover:bg-[#b58e45]"
            label="Reservar mi lectura de Registros Akáshicos"
          >
            {hero.primaryCta}
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </AkashicBookingCTA>
          <a
            href={hero.secondaryHref}
            className="group inline-flex items-center gap-3 rounded-full border border-[#2C2C2C]/35 bg-[#FCFAF5]/85 px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-[#1A1A1A] transition hover:border-[#C5A059] hover:bg-[#C5A059]"
          >
            {hero.secondaryCta}
            <ArrowDown size={15} className="transition group-hover:translate-y-1" />
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 text-[9px] uppercase tracking-[.3em] text-[#2C2C2C]/65 sm:justify-between">
        {hero.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
        <span aria-hidden="true" className="text-sm text-[#9E7B2F]">
          {hero.glyphs}
        </span>
      </div>
    </section>
  );
}
