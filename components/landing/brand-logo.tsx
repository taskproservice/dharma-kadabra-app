"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";

const LOGO_SRC = "/images/logo.png";

/** Logotipo transparente, flotante, sin marcos ni fondos decorativos. */
export function BrandLogo({ size = 48 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex items-center gap-2.5 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
        <Flame size={22} className="text-[#D4AF37]" aria-hidden="true" />
        <span className="font-display text-xl tracking-wide text-[#F4ECD8]">
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
      className="border-none bg-transparent object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.25)]"
      onError={() => setFailed(true)}
    />
  );
}
