"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 03 · Método — recorrido de la sesión en cuatro pasos sobre Papiro. */
export function AkashicMethod() {
  const method = akashicContent.method;
  return (
    <section id="metodo" className="scroll-mt-20 border-t border-[#C5A059]/25 bg-[#F4EFE6] text-[#1A1A1A]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12 lg:py-16">
        <div>
          <Eyebrow>{method.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] text-[#1A1A1A] sm:text-6xl">
            {method.titleLead}{" "}
            <em className="italic text-[#9E7B2F]">{method.titleAccent}</em>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-7 text-[#2C2C2C]/80">
            {method.intro}
          </p>

          <ol className="mt-7 grid gap-3 sm:grid-cols-2">
            {method.steps.map((step) => (
              <li
                key={step.number}
                className="rounded-xl border border-[#C5A059]/40 bg-[#FCFAF5] p-4 shadow-[0_8px_22px_-12px_rgba(92,72,48,0.12)] lg:p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="akashic-display text-2xl font-medium text-[#8B6914]">{step.number}</span>
                  <span aria-hidden="true" className="mt-1.5 size-1.5 rotate-45 bg-[#D96538]" />
                </div>
                <h3 className="akashic-display mt-4 text-2xl text-[#1A1A1A]">{step.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-[#2C2C2C]/75">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-l border-[#C5A059] pl-4 text-xs leading-6 text-[#2C2C2C]/65">
            {method.note}
          </p>
        </div>

        <figure>
          <AkashicImage
            src={akashicImages.method}
            alt="Manuscrito antiguo abierto sobre una mesa de madera junto a una vela encendida"
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="aspect-[4/5] border border-[#C5A059]/45 shadow-[0_24px_60px_-32px_rgba(92,72,48,.35)]"
          />
          <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-[#2C2C2C]/60">
            {method.imageCaption}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
