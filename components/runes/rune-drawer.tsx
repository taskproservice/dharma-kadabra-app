"use client";

import { ArrowRight } from "lucide-react";
import type { Rune } from "../../types/rune";
import { RuneBookingCTA } from "./booking-cta";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <section className="border-t border-gold/15 py-7 first:border-t-0 first:pt-0">
      <h3 className="text-[10px] font-semibold uppercase tracking-[.32em] text-gold">{label}</h3>
      <p className="mt-4 text-[15px] leading-8 text-papyrus/78">{text}</p>
    </section>
  );
}

export function RuneDrawer({
  rune,
  open,
  onOpenChange,
  fontClassName,
}: {
  rune: Rune | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Clase de next/font opcional: el drawer se porta al body. */
  fontClassName?: string;
}) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={fontClassName}
        aria-describedby={rune ? `rune-${rune.id}-description` : undefined}
      >
        {rune && (
          <>
            <DrawerHeader>
              <p className="text-[10px] uppercase tracking-[.34em] text-gold/75">
                Runa {String(rune.number).padStart(2, "0")} · El Futhark antiguo
              </p>
              <div className="mt-7 flex items-end gap-6">
                <span aria-hidden="true" className="rune-glyph pb-1 text-6xl text-gold sm:text-7xl">
                  {rune.symbol}
                </span>
                <div className="min-w-0">
                  <DrawerTitle>{rune.name}</DrawerTitle>
                  <DrawerDescription id={`rune-${rune.id}-description`} className="mt-2 text-[11px] uppercase tracking-[.16em] text-papyrus/45">
                    {rune.keywords.join(" · ")}
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-7 py-8 sm:px-9">
              <Detail label="Significado" text={rune.meaning} />
              <Detail label="Interpretación" text={rune.interpretation} />
              <Detail label="Aplicación" text={rune.application} />
              <p className="mt-6 border-l border-gold/40 pl-4 font-sans text-xs leading-6 text-papyrus/45">
                La runa es un espejo del momento presente, no una sentencia. Tu decisión siempre tiene la última palabra.
              </p>
            </div>

            <div className="border-t border-gold/20 bg-obsidian-soft px-7 py-6 sm:px-9">
              <RuneBookingCTA
                className="inline-flex w-full cursor-pointer items-center justify-center gap-3 border border-gold/60 px-5 py-4 text-[10px] font-semibold uppercase tracking-[.24em] text-gold transition hover:bg-gold hover:text-obsidian"
                label={`Agendar lectura con ${rune.name}`}
              >
                Agendar mi lectura <ArrowRight size={14} />
              </RuneBookingCTA>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
