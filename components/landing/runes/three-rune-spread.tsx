"use client";

import { useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { runes } from "../../../data/runes";
import type { Rune } from "../../../types/rune";
import { RuneBookingCTA } from "./booking-cta";

const POSITIONS = [
  { number: "01", label: "Pasado", note: "Lo que dejas atrás" },
  { number: "02", label: "Presente", note: "Lo que te pide atención" },
  { number: "03", label: "Futuro", note: "Lo que puede nacer" },
] as const;

function shuffledDeck() {
  const deck = [...runes];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function ThreeRuneSpread() {
  const deck = useRef<Rune[]>([]);
  const [revealed, setRevealed] = useState<Array<Rune | null>>([null, null, null]);
  const count = revealed.filter(Boolean).length;

  function reveal(index: number) {
    if (revealed[index]) return;
    if (deck.current.length === 0) deck.current = shuffledDeck();

    setRevealed((previous) => {
      const used = new Set(previous.filter(Boolean).map((rune) => rune!.id));
      const available = deck.current.filter((rune) => !used.has(rune.id));
      const pick = available[Math.floor(Math.random() * available.length)];
      if (!pick) return previous;
      return previous.map((rune, position) => (position === index ? pick : rune));
    });
  }

  function reset() {
    deck.current = [];
    setRevealed([null, null, null]);
  }

  return (
    <div>
      <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3 sm:gap-4">
        {POSITIONS.map((position, index) => {
          const rune = revealed[index];
          return (
            <div key={position.number}>
              <div className="mb-1 flex items-baseline justify-between border-b border-[#C5A059]/35 pb-1">
                <p className="rune-display text-base font-medium text-[#1A1A1A]">{position.label}</p>
                <span className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#8B6914]">{position.number}</span>
              </div>
              <p className="mb-2 text-[10px] tracking-wide text-[#2C2C2C]/70">{position.note}</p>

              <div className="[perspective:1400px]">
                <button
                  type="button"
                  onClick={() => reveal(index)}
                  aria-label={rune ? `${position.label}: ${rune.name}, ${rune.meaning}` : `Revelar runa de ${position.label.toLowerCase()}`}
                  className="relative block aspect-[4/5] max-h-[190px] w-full cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#9E7B2F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE6]"
                >
                  <span className="rune-card-3d relative block h-full w-full" data-flipped={Boolean(rune)}>
                    {/* Dorso */}
                    <span className="rune-face absolute inset-0 flex flex-col items-center justify-center border border-[#C5A059]/55 bg-[radial-gradient(circle_at_center,rgba(197,160,89,.18),transparent_65%),linear-gradient(155deg,#FCFAF5,#EDE5D7)] p-2 shadow-[0_12px_28px_-16px_rgba(92,72,48,0.2)]">
                      <span aria-hidden="true" className="absolute inset-3 border border-[#C5A059]/30" />
                      <span aria-hidden="true" className="rune-glyph mb-1 text-2xl text-[#9E7B2F]">ᛟ</span>
                      <span className="relative text-center text-[8.5px] font-medium uppercase leading-4 tracking-[.22em] text-[#2C2C2C]/70">
                        {rune ? "Runa revelada" : "Toca para revelar"}
                      </span>
                    </span>

                    {/* Frente */}
                    <span className="rune-face rune-face--back absolute inset-0 flex flex-col items-center justify-center border border-[#C5A059] bg-[#FCFAF5] p-3 text-center shadow-[0_14px_32px_-16px_rgba(92,72,48,0.24)]">
                      <span aria-hidden="true" className="rune-glyph text-3xl text-[#9E7B2F] sm:text-4xl">{rune?.symbol ?? "✧"}</span>
                      <span className="rune-display mt-1 text-sm font-semibold text-[#1A1A1A]">{rune?.name ?? ""}</span>
                      <span className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-[#6B4E24]">{rune?.meaning ?? ""}</span>
                      <span className="mt-auto pt-1 text-[8px] font-semibold uppercase tracking-[.2em] text-[#8B6914]">
                        {rune ? `Runa ${String(rune.number).padStart(2, "0")}` : ""}
                      </span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#C5A059]/30 pt-3">
        <p role="status" className="text-xs uppercase tracking-[.2em] text-[#2C2C2C]/70">
          {count === 0 ? "Tres cartas boca abajo te esperan" : `${count} de 3 runas reveladas`}
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[#8B6914] transition hover:text-[#1A1A1A]"
          >
            <RotateCcw size={14} /> Nueva tirada
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <RuneBookingCTA className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#C5A059] px-6 py-3 text-[10px] font-semibold uppercase tracking-[.24em] text-[#1A1A1A] shadow-[0_14px_34px_-16px_rgba(92,72,48,.38)] transition hover:bg-[#b58e45]">
          AGENDAR MI LECTURA DE RUNAS <ArrowRight size={15} className="transition group-hover:translate-x-1" />
        </RuneBookingCTA>
        <p className="text-[11px] leading-5 text-[#2C2C2C]/70">
          La tirada es un primer acercamiento. En la sesión profundizamos juntas en tu lectura completa.
        </p>
      </div>
    </div>
  );
}
