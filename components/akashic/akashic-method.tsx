"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 03 · Método — recorrido de la sesión en cuatro pasos. */
export function AkashicMethod() {
  const method = akashicContent.method;
  return (
    <section id="metodo" className="scroll-mt-20 bg-obsidian text-papyrus">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12 lg:py-10">
        <div>
          <Eyebrow>{method.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            {method.titleLead}{" "}
            <em className="italic text-gold">{method.titleAccent}</em>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-7 text-papyrus/65">
            {method.intro}
          </p>

          <ol className="mt-7 grid gap-px border border-gold/20 bg-gold/20 sm:grid-cols-2">
            {method.steps.map((step) => (
              <li key={step.number} className="bg-obsidian p-4 lg:p-5">
                <div className="flex items-start justify-between">
                  <span className="akashic-display text-2xl text-gold">{step.number}</span>
                  <span aria-hidden="true" className="mt-1.5 size-1.5 rotate-45 bg-ember" />
                </div>
                <h3 className="akashic-display mt-4 text-2xl">{step.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-papyrus/60">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-l border-gold/40 pl-4 text-xs leading-6 text-papyrus/45">
            {method.note}
          </p>
        </div>

        <figure>
          <AkashicImage
            src={akashicImages.method}
            alt="Manuscrito antiguo abierto sobre una mesa de madera junto a una vela encendida"
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="aspect-[4/5] border border-gold/20 shadow-[0_30px_70px_-40px_rgba(0,0,0,.9)]"
          />
          <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-papyrus/45">
            {method.imageCaption}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
