import Image from "next/image";

/**
 * Logotipo editorial de Dharma Kadabra para superficies oscuras.
 * El PNG original ya es transparente; el resplandor dorado se logra con
 * capas de drop-shadow para que "brille" sin duplicar assets.
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
          className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,rgba(199,164,90,.35),transparent_68%)] blur-md"
        />
        <Image
          src="/images/logo.png"
          alt=""
          width={size}
          height={size}
          priority
          className="relative object-contain drop-shadow-[0_0_10px_rgba(199,164,90,.45)]"
        />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-medium tracking-[.18em] text-[#f7f2e7]">
            DHARMA
          </span>
          <span className="font-display text-[17px] font-medium tracking-[.18em] text-[#c7a45a]">
            KADABRA
          </span>
          <span className="mt-1.5 text-[7.5px] font-medium uppercase tracking-[.26em] text-[#e9e2d2]/45">
            Talismanes maestros · Registros akáshicos
          </span>
        </span>
      )}
    </span>
  );
}
