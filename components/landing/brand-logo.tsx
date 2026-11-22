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
      <span className="flex items-center gap-2.5 drop-shadow-[0_0_12px_rgba(197,160,89,0.28)]">
        <Flame size={22} className="text-[#C5A059]" aria-hidden="true" />
        <span className="font-display text-xl tracking-wide text-[#1A1A1A]">
          Dharma <em className="italic text-[#9E7B2F]">Kadabra</em>
        </span>
      </span>
    );
  }

  return (
    <span className="relative grid shrink-0 place-items-center">
      <span
        aria-hidden="true"
        className="absolute inset-[-35%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.28),transparent_66%)] blur-md"
      />
      <Image
        src={LOGO_SRC}
        alt="Dharma Kadabra"
        width={size}
        height={size}
        priority
        className="relative border-none bg-transparent object-contain drop-shadow-[0_4px_12px_rgba(92,72,48,0.18)]"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

/** Bloque de marca completo: logotipo + wordmark editorial + tagline. */
export function BrandLockup({ size = 52, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <BrandLogo size={size} />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[15px] font-medium tracking-[.2em] text-[#1A1A1A] sm:text-[17px] ${glow ? "drop-shadow-[0_0_10px_rgba(197,160,89,.22)]" : ""}`}>
          DHARMA
        </span>
        <span className="font-display text-[15px] font-medium tracking-[.2em] text-[#9E7B2F] sm:text-[17px]">
          KADABRA
        </span>
        <span className="mt-1.5 hidden text-[6.5px] font-medium uppercase leading-relaxed tracking-[.22em] text-[#2C2C2C]/60 sm:block">
          Talismanes maestros
          <br />
          Registros akáshicos
        </span>
      </span>
    </span>
  );
}
