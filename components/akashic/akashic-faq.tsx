"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 07 · Preguntas frecuentes — acordeón interactivo estilo shadcn/ui. */
export function AkashicFAQ() {
  const faq = akashicContent.faq;
  return (
    <section id="faq" className="sanctuary-leaf sanctuary-leaf-wood relative scroll-mt-20 border-y border-sanctuary-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12 lg:py-10">
        <div>
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            {faq.titleLead}{" "}
            <em className="italic text-sanctuary-gold-leaf">{faq.titleAccent}</em>
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-7 text-sanctuary-ink-soft">
            {faq.intro}
          </p>
          <figure className="mt-6 hidden lg:block">
            <AkashicImage
              src={akashicImages.faq}
              alt="Libro antiguo abierto junto a una vela encendida sobre una mesa de madera"
              sizes="38vw"
              className="aspect-[16/10] border border-sanctuary-gold/30 shadow-[0_30px_60px_-40px_rgba(80,57,31,.5)]"
            />
          </figure>
        </div>

        <Accordion
          defaultValue={faq.items[0]?.question ?? null}
          className="divide-y divide-sanctuary-border border-y border-sanctuary-border self-start"
        >
          {faq.items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="akashic-display cursor-pointer py-4 text-xl font-light text-sanctuary-ink transition-colors hover:text-sanctuary-gold-ink data-[state=open]:text-sanctuary-gold-ink lg:py-5 lg:text-2xl [&_svg]:text-sanctuary-gold-ink">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 pr-8 text-[13px] leading-7 text-sanctuary-ink-soft">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
