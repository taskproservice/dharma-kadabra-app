"use client";

import { useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { runes } from "../../data/runes";
import type { Rune } from "../../types/rune";
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
      <div className="mx-auto grid max-w-2xl gap-2 sm:grid-cols-3 sm:gap-2">
        {POSITIONS.map((position, index) => {
          const rune = revealed[index];
          return (
            <div key={position.number}>
              <div className="mb-1 flex items-baseline justify-between border-b border-sanctuary-gold/40 pb-1">
                <p className="rune-display text-base text-sanctuary-ink">{position.label}</p>
                <span className="text-[10px] uppercase tracking-[.22em] text-sanctuary-gold-ink">{position.number}</span>
              </div>
              <p className="mb-1 text-[10px] tracking-wide text-sanctuary-ink-muted">{position.note}</p>

              <div className="[perspective:1400px]">
                <button
                  type="button"
                  onClick={() => reveal(index)}
                  aria-label={rune ? `${position.label}: ${rune.name}, ${rune.meaning}` : `Revelar runa de ${position.label.toLowerCase()}`}
                  className="relative block aspect-[4/5] max-h-[180px] w-full cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-sanctuary-gold-ink focus-visible:ring-offset-2 focus-visible:ring-offset-sanctuary-parchment"
                >
                  <span className="rune-card-3d relative block h-full w-full" data-flipped={Boolean(rune)}>
                    {/* Dorso */}
                    <span className="rune-face absolute inset-0 flex flex-col items-center justify-center border border-gold/45 bg-[radial-gradient(circle_at_center,rgba(197,160,89,.14),transparent_62%),linear-gradient(155deg,#161920,#0F1115)] p-2">
                      <span aria-hidden="true" className="absolute inset-3 border border-gold/15" />
                      <span aria-hidden="true" className="rune-glyph mb-1 text-xl text-gold/80">ᛟ</span>
                      <span className="relative text-center text-[8px] uppercase leading-4 tracking-[.22em] text-papyrus/45">
                        {rune ? "Runa revelada" : "Toca para revelar"}
                      </span>
                    </span>

                    {/* Frente */}
                    <span className="rune-face rune-face--back absolute inset-0 flex flex-col items-center justify-center border border-gold/60 bg-[linear-gradient(160deg,#1D212B,#0F1115)] p-2 text-center">
                      <span aria-hidden="true" className="rune-glyph text-3xl text-gold sm:text-4xl">{rune?.symbol ?? "✧"}</span>
                      <span className="rune-display mt-1 text-sm text-papyrus">{rune?.name ?? ""}</span>
                      <span className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-papyrus/55">{rune?.meaning ?? ""}</span>
                      <span className="mt-auto pt-1 text-[8px] uppercase tracking-[.2em] text-gold/70">
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sanctuary-border pt-2">
        <p role="status" className="text-xs uppercase tracking-[.2em] text-sanctuary-ink-muted">
          {count === 0 ? "Tres cartas boca abajo te esperan" : `${count} de 3 runas reveladas`}
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-sanctuary-gold-ink transition hover:text-sanctuary-ink"
          >
            <RotateCcw size={14} /> Nueva tirada
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col items-center gap-2 text-center">
        <RuneBookingCTA className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-sanctuary-gold px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[.24em] text-sanctuary-ink shadow-[0_16px_36px_-20px_rgba(80,57,31,.65)] transition hover:bg-sanctuary-gold-light">
          AGENDAR MI LECTURA DE RUNAS <ArrowRight size={15} className="transition group-hover:translate-x-1" />
        </RuneBookingCTA>
        <p className="text-[11px] leading-5 text-sanctuary-ink-muted">
          La tirada es un primer acercamiento. En la sesión profundizamos juntas en tu lectura completa.
        </p>
      </div>
    </div>
  );
}
