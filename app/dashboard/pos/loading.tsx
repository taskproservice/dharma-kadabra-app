import { ProductCardSkeleton, Skeleton } from "../../../components/ui/skeleton";

/** Skeleton del POS mientras se carga la ruta (navegación). */
export default function PosLoading() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col gap-6 xl:flex-row" aria-busy="true" aria-label="Cargando Punto de Venta">
      <section className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-56" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24 shrink-0" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
      <aside className="w-full rounded-2xl border border-[#C5A059]/35 bg-[#FCFAF5] p-6 xl:w-[370px] xl:shrink-0">
        <Skeleton className="h-7 w-32" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-12 w-full rounded-xl" />
      </aside>
    </div>
  );
}
