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
      <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3 sm:gap-4">
        {POSITIONS.map((position, index) => {
          const rune = revealed[index];
          return (
            <div key={position.number}>
              <div className="mb-2 flex items-baseline justify-between border-b border-[#C5A059]/25 pb-2">
                <p className="rune-display text-xl text-[#F7F3EA]">{position.label}</p>
                <span className="text-[10px] uppercase tracking-[.22em] text-[#C5A059]/70">{position.number}</span>
              </div>
              <p className="mb-2 text-[10px] tracking-wide text-[#F7F3EA]/45">{position.note}</p>

              <div className="[perspective:1400px]">
                <button
                  type="button"
                  onClick={() => reveal(index)}
                  aria-label={rune ? `${position.label}: ${rune.name}, ${rune.meaning}` : `Revelar runa de ${position.label.toLowerCase()}`}
                  className="relative block aspect-[4/5] max-h-[300px] w-full cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
                >
                  <span className="rune-card-3d relative block h-full w-full" data-flipped={Boolean(rune)}>
                    {/* Dorso */}
                    <span className="rune-face absolute inset-0 flex flex-col items-center justify-center border border-[#C5A059]/45 bg-[radial-gradient(circle_at_center,rgba(197,160,89,.14),transparent_62%),linear-gradient(155deg,#1b1b1b,#0e0e0e)] p-3">
                      <span aria-hidden="true" className="absolute inset-3 border border-[#C5A059]/15" />
                      <span aria-hidden="true" className="rune-glyph mb-2 text-2xl text-[#C5A059]/80">ᛟ</span>
                      <span className="relative text-center text-[8px] uppercase leading-4 tracking-[.22em] text-[#F7F3EA]/45">
                        {rune ? "Runa revelada" : "Toca para revelar"}
                      </span>
                    </span>

                    {/* Frente */}
                    <span className="rune-face rune-face--back absolute inset-0 flex flex-col items-center justify-center border border-[#C5A059]/60 bg-[linear-gradient(160deg,#20201d,#111110)] p-3 text-center">
                      <span aria-hidden="true" className="rune-glyph text-4xl text-[#C5A059] sm:text-5xl">{rune?.symbol ?? "✧"}</span>
                      <span className="rune-display mt-2 text-lg text-[#F7F3EA]">{rune?.name ?? ""}</span>
                      <span className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#F7F3EA]/55">{rune?.meaning ?? ""}</span>
                      <span className="mt-auto pt-2 text-[8px] uppercase tracking-[.2em] text-[#C5A059]/70">
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#C5A059]/20 pt-4">
        <p role="status" className="text-xs uppercase tracking-[.2em] text-[#F7F3EA]/50">
          {count === 0 ? "Tres cartas boca abajo te esperan" : `${count} de 3 runas reveladas`}
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[#C5A059] transition hover:text-[#F7F3EA]"
          >
            <RotateCcw size={14} /> Nueva tirada
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <RuneBookingCTA className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#C5A059] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.24em] text-[#121212] shadow-[0_18px_50px_-20px_rgba(197,160,89,.85)] transition hover:bg-[#d9b673]">
          AGENDAR MI LECTURA DE RUNAS <ArrowRight size={15} className="transition group-hover:translate-x-1" />
        </RuneBookingCTA>
        <p className="text-[11px] leading-5 text-[#F7F3EA]/45">
          La tirada es un primer acercamiento. En la sesión profundizamos juntas en tu lectura completa.
        </p>
      </div>
    </div>
  );
}
