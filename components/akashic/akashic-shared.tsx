"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Piezas compartidas por las secciones de Registros Akáshicos.
 * Sistema «Nordic Mystic Luxury»: Papiro #F7F3EA · Nocturno #121212 ·
 * Oro #C5A059 · Tinta #2E231D · Fuego #D96538.
 */

/** Placeholder de carga: marfil cálido (#F2EBDD), coherente con el papiro. */
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMkVCREQiLz48L3N2Zz4=";

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.34em] before:h-px before:w-9 before:bg-sanctuary-gold ${
        light ? "text-sanctuary-gold-ink" : "text-gold"
      }`}
    >
      {children}
    </p>
  );
}

/** Imagen editorial con fondo papiro temporal mientras carga. */
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
    <div className={`relative overflow-hidden bg-sanctuary-wood ${className}`}>
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
