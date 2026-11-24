"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 02 · Introducción — incluye la nota editorial destacada. */
export function AkashicIntroduction() {
  const intro = akashicContent.introduction;
  return (
    <section id="introduccion" className="relative scroll-mt-20 bg-sanctuary-parchment text-sanctuary-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:py-10">
        <figure>
          <AkashicImage
            src={akashicImages.introduction}
            alt="Manuscritos antiguos de hoja de palma atados con hilo rojo sobre una mesa de madera"
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="aspect-[4/5] border border-sanctuary-gold/30 shadow-[0_30px_60px_-34px_rgba(80,57,31,.55)]"
          />
          <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-sanctuary-gold-ink">
            {intro.imageCaption}
          </figcaption>
        </figure>

        <div>
          <Eyebrow light>{intro.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            {intro.titleLead}{" "}
            <em className="italic text-sanctuary-gold-leaf">{intro.titleAccent}</em>
          </h2>
          <div className="mt-5 h-px w-24 bg-gradient-to-r from-sanctuary-gold to-transparent" />
          <div className="mt-5 space-y-3 text-[14px] leading-7 text-sanctuary-ink-soft">
            {intro.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <blockquote className="mt-6 border-l-2 border-sanctuary-gold bg-sanctuary-wood px-5 py-4">
            <p className="akashic-display text-xl font-light italic leading-snug text-sanctuary-ink sm:text-2xl">
              &ldquo;{intro.editorialNote}&rdquo;
            </p>
            <cite className="mt-2 block text-[9px] font-semibold uppercase not-italic tracking-[.28em] text-sanctuary-gold-ink">
              {intro.editorialNoteLabel} · Dharma Kadabra
            </cite>
          </blockquote>

          <dl className="mt-7 grid grid-cols-3 gap-3 border-y border-sanctuary-border py-5">
            {intro.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="akashic-display text-3xl text-sanctuary-gold-ink">{stat.value}</dt>
                <dd className="mt-0.5 text-[9px] uppercase tracking-[.2em] text-sanctuary-ink-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
