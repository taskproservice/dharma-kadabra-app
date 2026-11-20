import type { HTMLAttributes } from "react";

/**
 * Skeleton Loader — bloque gris animado con brillo (shimmer).
 * Se usa mientras cargan los productos del POS y las citas de la agenda.
 * Respeta `prefers-reduced-motion` vía CSS (ver globals.css).
 */
export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-xl bg-[#3E2723]/10 ${className}`}
      {...props}
    />
  );
}

/** Tarjeta esqueleto para el grid de productos del POS (5 columnas en desktop). */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#3E2723]/10 bg-white/60">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Fila esqueleto para los slots de la agenda. */
export function AgendaSlotSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#D4AF37]/20 bg-white/50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-7 w-28" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <Skeleton className="h-8 w-32 rounded-lg" />
    </div>
  );
}
