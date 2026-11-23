"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";

const LOGO_SRC = "/images/logo.png";

/**
 * Logotipo oficial con resplandor dorado, sin marcos ni fondos.
 * Se usa en el header público, el footer y la tarjeta de cristal del hero.
 */
export function BrandLogo({ size = 48 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex items-center gap-2.5 drop-shadow-[0_0_15px_rgba(197,160,89,0.35)]">
        <Flame size={22} className="text-gold" aria-hidden="true" />
        <span className="font-display text-xl tracking-wide text-papyrus">
          Dharma <em className="italic text-gold">Kadabra</em>
        </span>
      </span>
    );
  }

  return (
    <span className="relative grid shrink-0 place-items-center">
      <span
        aria-hidden="true"
        className="absolute inset-[-35%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.38),transparent_66%)] blur-md"
      />
      <Image
        src={LOGO_SRC}
        alt="Dharma Kadabra"
        width={size}
        height={size}
        sizes={`${size}px`}
        priority
        className="relative border-none bg-transparent object-contain drop-shadow-[0_0_12px_rgba(197,160,89,0.55)]"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

/**
 * Bloque de marca completo: logotipo + wordmark editorial + tagline.
 * `tone="papyrus"` lo tiñe para fondos claros (p. ej. /agenda en Papiro).
 */
export function BrandLockup({ size = 52, glow = false, tone = "dark" }: { size?: number; glow?: boolean; tone?: "dark" | "papyrus" }) {
  const light = tone === "papyrus";
  return (
    <span className="flex items-center gap-3">
      <BrandLogo size={size} />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[15px] font-medium tracking-[.2em] sm:text-[17px] ${light ? "text-ink" : "text-papyrus"} ${glow ? "drop-shadow-[0_0_14px_rgba(244,239,230,.18)]" : ""}`}>
          DHARMA
        </span>
        <span className={`font-display text-[15px] font-medium tracking-[.2em] sm:text-[17px] ${light ? "text-bronze" : "text-gold-light"}`}>
          KADABRA
        </span>
        <span className={`mt-1.5 hidden text-[6.5px] font-medium uppercase leading-relaxed tracking-[.22em] sm:block ${light ? "text-ink-muted" : "text-papyrus/45"}`}>
          Talismanes maestros
          <br />
          Registros akáshicos
        </span>
      </span>
    </span>
  );
}
