"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 05 · Proceso — antes, durante y después de la sesión sobre Papiro. */
export function AkashicProcess() {
  const process = akashicContent.process;
  return (
    <section id="proceso" className="scroll-mt-20 bg-[#F4EFE6] text-[#1A1A1A]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:py-16">
        <figure>
          <AkashicImage
            src={akashicImages.process}
            alt="Diario abierto con pluma, vela encendida y mala de cuentas sobre una mesa"
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="aspect-[4/5] border border-[#C5A059]/45 shadow-[0_24px_60px_-32px_rgba(92,72,48,.35)]"
          />
          <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-[#2C2C2C]/60">
            {process.imageCaption}
          </figcaption>
        </figure>

        <div>
          <Eyebrow>{process.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] text-[#1A1A1A] sm:text-6xl">
            {process.titleLead}{" "}
            <em className="italic text-[#9E7B2F]">{process.titleAccent}</em>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-7 text-[#2C2C2C]/80">
            {process.intro}
          </p>

          <ol className="mt-7 space-y-3">
            {process.phases.map((phase) => (
              <li
                key={phase.number}
                className="flex gap-5 rounded-xl border border-[#C5A059]/40 bg-[#FCFAF5] p-4 shadow-[0_8px_22px_-12px_rgba(92,72,48,0.12)] lg:p-5"
              >
                <span className="akashic-display shrink-0 text-3xl font-light text-[#8B6914]">
                  {phase.number}
                </span>
                <div>
                  <h3 className="akashic-display text-2xl text-[#1A1A1A]">{phase.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-[#2C2C2C]/75">{phase.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
