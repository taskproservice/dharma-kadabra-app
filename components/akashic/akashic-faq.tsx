"use client";

import { akashicContent, akashicImages } from "../../data/akashic-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { AkashicImage, Eyebrow } from "./akashic-shared";

/** Sección 07 · Preguntas frecuentes — acordeón interactivo estilo shadcn/ui. */
export function AkashicFAQ() {
  const faq = akashicContent.faq;
  return (
    <section id="faq" className="scroll-mt-20 bg-[#121212] text-[#F7F3EA]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12 lg:py-10">
        <div>
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 className="akashic-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            {faq.titleLead}{" "}
            <em className="italic text-[#C5A059]">{faq.titleAccent}</em>
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-7 text-[#F7F3EA]/65">
            {faq.intro}
          </p>
          <figure className="mt-6 hidden lg:block">
            <AkashicImage
              src={akashicImages.faq}
              alt="Libro antiguo abierto junto a una vela encendida sobre una mesa de madera"
              sizes="38vw"
              className="aspect-[16/10] border border-[#C5A059]/20"
            />
          </figure>
        </div>

        <Accordion
          defaultValue={faq.items[0]?.question ?? null}
          className="divide-y divide-[#C5A059]/15 border-y border-[#C5A059]/15 self-start"
        >
          {faq.items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="akashic-display py-4 text-xl font-light text-[#F7F3EA] transition-colors hover:text-[#C5A059] data-[state=open]:text-[#C5A059] lg:py-5 lg:text-2xl [&_svg]:text-[#C5A059]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 pr-8 text-[13px] leading-7 text-[#F7F3EA]/65">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
