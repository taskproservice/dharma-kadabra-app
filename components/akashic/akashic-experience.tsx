"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 06 · Experiencia — tono humano, sin juicios ni imposiciones. */
export function AkashicExperience() {
  const experience = akashicContent.experience;
  return (
    <section id="experiencia" className="relative scroll-mt-20 bg-sanctuary-parchment-light text-sanctuary-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:py-10">
        <div>
          <Eyebrow light>{experience.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            {experience.titleLead}{" "}
            <em className="italic text-sanctuary-gold-leaf">{experience.titleAccent}</em>
          </h2>
          <div className="mt-5 h-px w-24 bg-gradient-to-r from-sanctuary-gold to-transparent" />
          <div className="mt-5 space-y-3 text-[14px] leading-7 text-sanctuary-ink-soft">
            {experience.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <p className="akashic-display mt-6 text-2xl font-light italic leading-snug text-sanctuary-ink sm:text-3xl">
            &ldquo;{experience.quote}&rdquo;
          </p>
        </div>

        <div className="relative">
          <figure>
            <AkashicImage
              src={akashicImages.experience}
              alt="Espacio de calma con cortinas de lino, luz natural, banco de madera y cojín de meditación"
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="aspect-[16/11] border border-sanctuary-gold/30 shadow-[0_30px_60px_-34px_rgba(80,57,31,.55)]"
            />
            <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-sanctuary-gold-ink">
              {experience.imageCaption}
            </figcaption>
          </figure>
          <figure className="mt-4 lg:absolute lg:-bottom-10 lg:-left-10 lg:mt-0 lg:w-56">
            <AkashicImage
              src={akashicImages.experienceDetail}
              alt="Mujer en perfil junto a una ventana, iluminada por la luz cálida del atardecer"
              sizes="(min-width: 1024px) 20vw, 90vw"
              className="aspect-[4/3] border border-sanctuary-wood-light shadow-[0_24px_50px_-32px_rgba(80,57,31,.6)]"
            />
            <figcaption className="mt-2 text-[9px] uppercase tracking-[.22em] text-sanctuary-gold-ink">
              {experience.detailCaption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
