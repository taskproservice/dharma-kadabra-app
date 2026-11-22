"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 06 · Experiencia — tono humano, sin juicios ni imposiciones. */
export function AkashicExperience() {
  const experience = akashicContent.experience;
  return (
    <section id="experiencia" className="scroll-mt-20 bg-[#F7F3EA] text-[#2E231D]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:py-10">
        <div>
          <Eyebrow light>{experience.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            {experience.titleLead}{" "}
            <em className="italic text-[#967325]">{experience.titleAccent}</em>
          </h2>
          <div className="mt-5 h-px w-24 bg-gradient-to-r from-[#967325] to-transparent" />
          <div className="mt-5 space-y-3 text-[14px] leading-7 text-[#2E231D]/75">
            {experience.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <p className="akashic-display mt-6 text-2xl font-light italic leading-snug text-[#2E231D] sm:text-3xl">
            &ldquo;{experience.quote}&rdquo;
          </p>
        </div>

        <div className="relative">
          <figure>
            <AkashicImage
              src={akashicImages.experience}
              alt="Espacio de calma con cortinas de lino, luz natural, banco de madera y cojín de meditación"
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="aspect-[16/11] border border-[#2E231D]/15 shadow-[0_30px_70px_-40px_rgba(46,35,29,.65)]"
            />
            <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-[#2E231D]/50">
              {experience.imageCaption}
            </figcaption>
          </figure>
          <figure className="mt-4 lg:absolute lg:-bottom-10 lg:-left-10 lg:mt-0 lg:w-56">
            <AkashicImage
              src={akashicImages.experienceDetail}
              alt="Mujer en perfil junto a una ventana, iluminada por la luz cálida del atardecer"
              sizes="(min-width: 1024px) 20vw, 90vw"
              className="aspect-[4/3] border border-[#F7F3EA] shadow-[0_24px_50px_-30px_rgba(46,35,29,.7)]"
            />
            <figcaption className="mt-2 text-[9px] uppercase tracking-[.22em] text-[#2E231D]/50">
              {experience.detailCaption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
