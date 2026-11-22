"use client";

import Image from "next/image";
import { Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

const ICONS = {
  compass: Compass,
  heart: HeartHandshake,
  sparkles: Sparkles,
  shield: ShieldCheck,
} as const;

/** Sección 04 · Beneficios — cuatro frutos de la lectura. */
export function AkashicBenefits() {
  const benefits = akashicContent.benefits;
  return (
    <>
      <section id="beneficios" className="scroll-mt-20 border-t border-[#C5A059]/25 bg-[#FCFAF5] text-[#1A1A1A]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
            <div className="max-w-3xl">
              <Eyebrow>{benefits.eyebrow}</Eyebrow>
              <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] text-[#1A1A1A] sm:text-6xl">
                {benefits.titleLead}{" "}
                <em className="italic text-[#9E7B2F]">{benefits.titleAccent}</em>
              </h2>
              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-[#2C2C2C]/80">
                {benefits.intro}
              </p>
            </div>
            <figure className="hidden lg:block">
              <AkashicImage
                src={akashicImages.benefits}
                alt="Mesa serena con velas encendidas, cuarzo y un diario abierto junto a la ventana"
                sizes="40vw"
                className="aspect-[16/10] border border-[#C5A059]/40 shadow-[0_24px_60px_-32px_rgba(92,72,48,.35)]"
              />
              <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-[#2C2C2C]/60">
                {benefits.imageCaption}
              </figcaption>
            </figure>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.items.map((item, index) => {
              const Icon = ICONS[item.icon];
              return (
                <article
                  key={item.title}
                  className="group rounded-xl border border-[#C5A059]/35 bg-[#F4EFE6]/70 p-4 transition-colors hover:border-[#C5A059] hover:bg-[#FFFDF9] lg:p-5"
                >
                  <div className="flex items-start justify-between">
                    <Icon size={20} strokeWidth={1.25} className="text-[#8B6914]" aria-hidden="true" />
                    <span className="akashic-display text-sm text-[#6B4E24]/55">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="akashic-display mt-6 text-2xl text-[#1A1A1A]">{item.title}</h3>
                  <p className="mt-2 text-[12px] leading-6 text-[#2C2C2C]/75">{item.text}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-[#2C2C2C]/60">{benefits.disclaimer}</p>
        </div>
      </section>

      {/* Banda editorial entre Beneficios y Proceso sobre papiro cálido. */}
      <section aria-label="Frase editorial" className="relative flex min-h-[30vh] items-center overflow-hidden border-y border-[#C5A059]/30 bg-[#EDE5D7]">
        <Image
          src={akashicImages.editorial}
          alt="Bosque con rayos de luz dorada atravesando los árboles al amanecer"
          fill
          sizes="100vw"
          quality={90}
          className="object-cover opacity-18"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,230,.82),rgba(244,239,230,.94))]" />
        <div className="relative mx-auto max-w-4xl px-5 py-12 text-center sm:px-8">
          <span aria-hidden="true" className="text-2xl text-[#9E7B2F]">✧</span>
          <p className="akashic-display mt-4 text-2xl font-light italic leading-tight text-[#1A1A1A] sm:text-4xl">
            &ldquo;{akashicContent.editorial.quote}&rdquo;
          </p>
          <div className="akashic-hairline mx-auto mt-5 h-px w-40" />
        </div>
      </section>
    </>
  );
}
