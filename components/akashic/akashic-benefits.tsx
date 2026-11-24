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
    <section id="beneficios" className="relative scroll-mt-20 bg-sanctuary-parchment text-sanctuary-ink">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
          <div className="max-w-3xl">
            <Eyebrow light>{benefits.eyebrow}</Eyebrow>
            <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
              {benefits.titleLead}{" "}
              <em className="italic text-sanctuary-gold-leaf">{benefits.titleAccent}</em>
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-sanctuary-ink-soft">
              {benefits.intro}
            </p>
          </div>
          <figure className="hidden lg:block">
            <AkashicImage
              src={akashicImages.benefits}
              alt="Mesa serena con velas encendidas, cuarzo y un diario abierto junto a la ventana"
              sizes="40vw"
              className="aspect-[16/10] border border-sanctuary-gold/30 shadow-[0_30px_60px_-34px_rgba(80,57,31,.55)]"
            />
            <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-sanctuary-gold-ink">
              {benefits.imageCaption}
            </figcaption>
          </figure>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.items.map((item, index) => {
            const Icon = ICONS[item.icon];
            return (
              <article key={item.title} className="sanctuary-card group p-5 lg:p-6">
                <div className="flex items-start justify-between">
                  <Icon size={20} strokeWidth={1.25} className="text-sanctuary-gold-ink" aria-hidden="true" />
                  <span className="akashic-display text-sm text-sanctuary-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="akashic-display mt-6 text-2xl text-sanctuary-ink">{item.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-sanctuary-ink-soft">{item.text}</p>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] leading-5 text-sanctuary-ink-muted">{benefits.disclaimer}</p>
      </div>
    </section>

    {/* Banda editorial entre Beneficios y Proceso, como en la página de Runas. */}
    <section aria-label="Frase editorial" className="relative flex min-h-[34vh] items-center overflow-hidden bg-sanctuary-night">
      <Image
        src={akashicImages.editorial}
        alt="Bosque con rayos de luz dorada atravesando los árboles al amanecer"
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,15,.35),rgba(17,17,15,.88))]" />
      {/* La noche editorial se disuelve en el papiro del santuario. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(245,242,235,.45)_55%,#F5F2EB)]"
      />
      <div className="relative mx-auto max-w-4xl px-5 py-10 text-center sm:px-8">
        <span aria-hidden="true" className="text-2xl text-gold">✧</span>
        <p className="akashic-display mt-4 text-2xl font-light italic leading-tight text-papyrus sm:text-4xl">
          &ldquo;{akashicContent.editorial.quote}&rdquo;
        </p>
        <div className="akashic-hairline mx-auto mt-5 h-px w-40" />
      </div>
    </section>
    </>
  );
}
