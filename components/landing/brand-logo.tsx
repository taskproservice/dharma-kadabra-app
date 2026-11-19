"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";

const LOGO_SRC = "/images/logo.png";

/** Logotipo transparente, sin marcos ni fondos decorativos. */
export function BrandLogo({ size = 52 }: { size?: number }) {
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
    <Image
      src={LOGO_SRC}
      alt="Dharma Kadabra"
      width={size}
      height={size}
      priority
      sizes={`${size}px`}
      className="h-auto max-h-14 w-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,.35)]"
      onError={() => setFailed(true)}
    />
  );
}
