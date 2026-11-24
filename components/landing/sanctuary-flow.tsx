import Image, { type StaticImageData } from "next/image";

/**
 * Fotografías de piedras y cristales ya presentes en `public/images`.
 * Se recortan en marcos orgánicos y se tiñen con el papiro para integrarse
 * como objetos del santuario, no como stickers decorativos.
 */
export const FLOW_IMAGES = {
  cuarzo: "/images/productos/cuarzo-claro.jpg",
  piedrasRuna: "/images/runas/piedras-terciopelo.jpg",
  runasLino: "/images/runas/runas-sobre-lino.jpg",
  amuleto: "/images/productos/amuleto-lunar.jpg",
} as const;

/**
 * Elementos flow del Santuario Ancestral: piedras, cuarzos y hojas que flotan
 * en los márgenes de las secciones, como objetos reales dentro del espacio.
 *
 * Dirección de arte
 * - Siempre en los márgenes, nunca detrás de párrafos ni cerca de un CTA.
 * - Opacidad 0.10–0.25, `blur` suave y máscara de degradado para integrarse.
 * - Tamaños asimétricos (una piedra grande por sección + detalles pequeños).
 * - En móvil se reducen de tamaño y bajan su opacidad: el texto manda.
 * - Animación de flotación lenta (8s / 12s) con `prefers-reduced-motion`.
 *
 * Se usan fotografías de piedras y cristales ya presentes en el proyecto
 * (`public/images`), recortadas con `object-cover` dentro de marcos orgánicos;
 * no se añaden assets nuevos ni se sustituyen fotos de marca.
 */

export type FlowStoneProps = {
  src: string | StaticImageData;
  /** Posición absoluta con clases Tailwind (siempre en los márgenes). */
  position: string;
  /** Tamaño en escritorio; el móvil recibe una escala menor. */
  size?: string;
  opacity?: string;
  /** Velocidad de flotación: `slow` para piedras grandes. */
  speed?: "base" | "slow";
  /** Marco orgánico del recorte fotográfico. */
  frame?: "pebble" | "blob" | "arch" | "leaf";
  rotate?: string;
  /** Ancho real del recorte en escritorio, para que `next/image` sirva el tamaño justo. */
  renderWidth?: number;
};

const frameClasses = {
  // Piedra rodada: óvalo irregular.
  pebble: "rounded-[46%_54%_58%_42%/52%_44%_56%_48%]",
  // Cuarzo: gota vertical.
  blob: "rounded-[54%_46%_44%_56%/62%_58%_42%_38%]",
  // Arco de manuscrito antiguo.
  arch: "rounded-t-[999px] rounded-b-[42%]",
  // Hoja: punta superior y base redonda.
  leaf: "rounded-[62%_38%_58%_42%/68%_74%_26%_32%]",
} as const;

export function FlowStone({
  src,
  position,
  size = "size-44",
  opacity = "opacity-20",
  speed = "base",
  frame = "pebble",
  rotate = "rotate-0",
  renderWidth = 220,
}: FlowStoneProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 select-none ${position} ${size} ${opacity} ${rotate} ${
        speed === "slow" ? "float-element-slow" : "float-element"
      }`}
    >
      <div
        className={`relative size-full overflow-hidden blur-[2px] ring-1 ring-inset ring-sanctuary-gold/25 shadow-[0_24px_50px_-30px_rgba(80,57,31,0.55)] [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)] ${frameClasses[frame]}`}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={`(min-width: 1024px) ${renderWidth}px, 55vw`}
          className="object-cover saturate-[.72]"
        />
        {/* Velo cálido: funde la foto con el papiro en vez de parecer un sticker. */}
        <span className="absolute inset-0 bg-[linear-gradient(160deg,rgba(242,235,221,.28),transparent_55%,rgba(169,131,67,.18))]" />
      </div>
    </div>
  );
}

/**
 * Pequeño cristal de detalle (sin foto): un cuarzo dibujado con CSS y filo de
 * oro antiguo, para acompañar títulos y tarjetas sin ruido visual.
 */
export function FlowCrystal({
  className = "",
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "sage";
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 select-none ${className}`}
    >
      <span
        className={`block size-full rotate-[18deg] rounded-[38%] border ${
          tone === "gold"
            ? "border-sanctuary-gold/45 bg-[linear-gradient(150deg,rgba(242,235,221,.85),rgba(217,188,124,.35)_55%,rgba(169,131,67,.28))]"
            : "border-[#8a8a6a]/40 bg-[linear-gradient(150deg,rgba(242,235,221,.8),rgba(160,168,138,.3)_60%,rgba(110,120,94,.22))]"
        } shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_10px_24px_-14px_rgba(80,57,31,.5)]`}
      />
    </span>
  );
}
