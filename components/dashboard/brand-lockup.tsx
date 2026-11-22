import Image from "next/image";

/**
 * Logotipo editorial de Dharma Kadabra sobre superficies Papyrus.
 */
export function BrandLockup({
  size = 44,
  compact = false,
  className = "",
}: {
  size?: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className="relative grid shrink-0 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.28),transparent_68%)] blur-md"
        />
        <Image
          src="/images/logo.png"
          alt=""
          width={size}
          height={size}
          priority
          className="relative object-contain drop-shadow-[0_2px_8px_rgba(92,72,48,.22)]"
        />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-medium tracking-[.18em] text-[#1A1A1A]">
            DHARMA
          </span>
          <span className="font-display text-[17px] font-medium tracking-[.18em] text-[#9E7B2F]">
            KADABRA
          </span>
          <span className="mt-1.5 text-[7.5px] font-medium uppercase tracking-[.26em] text-[#2C2C2C]/65">
            Talismanes maestros · Registros akáshicos
          </span>
        </span>
      )}
    </span>
  );
}
