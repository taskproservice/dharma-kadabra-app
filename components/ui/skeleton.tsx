import type { HTMLAttributes } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Primitivo Skeleton estilo shadcn/ui para estados de carga sobre papiro. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer rounded-xl bg-[#E5DBC9]/80",
        className,
      )}
      {...props}
    />
  );
}

/** Esqueleto con las proporciones exactas de una ProductCard de la tienda y POS. */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#C5A059]/30 bg-[#FCFAF5] p-3 shadow-[0_8px_24px_-12px_rgba(92,72,48,0.1)]"
    >
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <div className="flex flex-1 flex-col gap-2.5 px-1.5 pb-1.5 pt-3.5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-1 h-4 w-24" />
        <Skeleton className="mt-2 h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Fila esqueleto para los slots de la agenda sobre papiro. */
export function AgendaSlotSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#C5A059]/30 bg-[#FCFAF5] p-5 sm:flex-row sm:items-center sm:justify-between">
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
