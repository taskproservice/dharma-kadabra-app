"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 05 · Proceso — antes, durante y después de la sesión. */
export function AkashicProcess() {
  const process = akashicContent.process;
  return (
    <section id="proceso" className="sanctuary-leaf sanctuary-leaf-light relative scroll-mt-20 border-y border-sanctuary-border-light">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:py-10">
        <figure>
          <AkashicImage
            src={akashicImages.process}
            alt="Diario abierto con pluma, vela encendida y mala de cuentas sobre una mesa oscura"
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="aspect-[4/5] border border-sanctuary-gold/30 shadow-[0_30px_60px_-34px_rgba(80,57,31,.55)]"
          />
          <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-sanctuary-gold-ink">
            {process.imageCaption}
          </figcaption>
        </figure>

        <div>
          <Eyebrow>{process.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            {process.titleLead}{" "}
            <em className="italic text-sanctuary-gold-leaf">{process.titleAccent}</em>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-7 text-sanctuary-ink-soft">
            {process.intro}
          </p>

          <ol className="mt-7 space-y-3">
            {process.phases.map((phase) => (
              <li key={phase.number} className="sanctuary-card flex gap-5 p-4 lg:p-5">
                <span className="akashic-display shrink-0 text-3xl font-light text-sanctuary-gold-ink">
                  {phase.number}
                </span>
                <div>
                  <h3 className="akashic-display text-2xl text-sanctuary-ink">{phase.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-sanctuary-ink-soft">{phase.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
