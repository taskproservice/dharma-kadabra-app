"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Piezas compartidas por las secciones de Registros Akáshicos · Tema Papyrus.
 * Papiro #F4EFE6 · Superficie cálida #FCFAF5 · Carbón #1A1A1A · Oro #C5A059 / #8B6914.
 */

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.34em] before:h-px before:w-9 before:bg-[#C5A059] ${
        light ? "text-[#2C2C2C]/70" : "text-[#8B6914]"
      }`}
    >
      {children}
    </p>
  );
}

/** Imagen editorial con fondo cálido temporal mientras carga. */
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
    <div className={`relative overflow-hidden bg-[#EDE5D7] ${className}`}>
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
