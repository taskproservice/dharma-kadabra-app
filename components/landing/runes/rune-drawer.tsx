"use client";

import { ArrowRight } from "lucide-react";
import type { Rune } from "../../../types/rune";
import { RuneBookingCTA } from "./booking-cta";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../ui/drawer";

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <section className="border-t border-[#C5A059]/30 py-7 first:border-t-0 first:pt-0">
      <h3 className="text-[10px] font-semibold uppercase tracking-[.32em] text-[#8B6914]">{label}</h3>
      <p className="mt-4 text-[15px] leading-8 text-[#2C2C2C]/85">{text}</p>
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
  /** Clase de next/font: el drawer se porta al body y no hereda la variable. */
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
              <p className="text-[10px] font-semibold uppercase tracking-[.34em] text-[#8B6914]">
                Runa {String(rune.number).padStart(2, "0")} · El Futhark antiguo
              </p>
              <div className="mt-7 flex items-end gap-6">
                <span aria-hidden="true" className="rune-glyph pb-1 text-6xl text-[#9E7B2F] sm:text-7xl">
                  {rune.symbol}
                </span>
                <div className="min-w-0">
                  <DrawerTitle className="text-[#1A1A1A]">{rune.name}</DrawerTitle>
                  <DrawerDescription id={`rune-${rune.id}-description`} className="mt-2 text-[11px] font-medium uppercase tracking-[.16em] text-[#6B4E24]">
                    {rune.keywords.join(" · ")}
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-7 py-8 sm:px-9">
              <Detail label="Significado" text={rune.meaning} />
              <Detail label="Interpretación" text={rune.interpretation} />
              <Detail label="Aplicación" text={rune.application} />
              <p className="mt-6 border-l-2 border-[#C5A059] pl-4 font-sans text-xs leading-6 text-[#2C2C2C]/70">
                La runa es un espejo del momento presente, no una sentencia. Tu decisión siempre tiene la última palabra.
              </p>
            </div>

            <div className="border-t border-[#C5A059]/30 bg-[#EDE5D7]/70 px-7 py-6 sm:px-9">
              <RuneBookingCTA
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#C5A059] px-5 py-4 text-[10px] font-semibold uppercase tracking-[.24em] text-[#1A1A1A] shadow-[0_12px_28px_-14px_rgba(92,72,48,0.35)] transition hover:bg-[#b58e45]"
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
