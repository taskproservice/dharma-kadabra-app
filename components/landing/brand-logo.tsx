"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";

/** Ruta pública del logo oficial. Reemplaza el archivo para actualizar la marca. */
const LOGO_SRC = "/images/logo.png";

/**
 * Logo de la marca para el header.
 * Muestra `public/images/logo.png` (48px, `object-contain` para respetar la
 * proporción de cualquier archivo). Si la imagen no existe o falla al cargar,
 * cae a un fallback tipográfico elegante con el texto "Dharma Kadabra".
 */
export function BrandLogo({ size = 48 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex items-center gap-3">
        <Flame size={20} className="text-[#D4AF37]" aria-hidden="true" />
        <span className="font-display text-xl tracking-wide">
          Dharma <em className="italic text-[#D4AF37]">Kadabra</em>
        </span>
      </span>
    );
  }

  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full ring-1 ring-[#D4AF37]/50 shadow-[0_0_18px_-4px_rgba(212,175,55,.55)]"
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO_SRC}
        alt="Dharma Kadabra"
        width={size}
        height={size}
        priority
        sizes={`${size}px`}
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
