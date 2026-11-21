"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Piezas compartidas por las secciones de Registros Akáshicos.
 * Sistema «Nordic Mystic Luxury»: Papiro #F7F3EA · Nocturno #121212 ·
 * Oro #C5A059 · Tinta #2E231D · Fuego #D96538.
 */

/** Placeholder de carga: fondo nocturno (las fotos viven en public/images/akashic/). */
const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.34em] before:h-px before:w-9 before:bg-[#C5A059] ${
        light ? "text-[#2E231D]/65" : "text-[#C5A059]"
      }`}
    >
      {children}
    </p>
  );
}

/** Imagen editorial con fondo nocturno temporal mientras carga. */
export function AkashicImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#121212] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={90}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        className="object-cover"
      />
    </div>
  );
}
