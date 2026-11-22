import { Skeleton } from "../../components/ui/skeleton";

/** Esqueleto de la tienda: mantiene el fondo papiro mientras llega el catálogo. */
export default function TiendaLoading() {
  return (
    <main className="min-h-screen bg-[#F4EFE6] text-[#1A1A1A]" aria-busy="true" aria-label="Cargando la tienda">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8">
        <Skeleton className="h-4 w-40 rounded-full" />
        <div className="mx-auto mt-12 max-w-xl text-center">
          <Skeleton className="mx-auto h-3 w-44 rounded-full" />
          <Skeleton className="mx-auto mt-7 h-14 w-[80%] rounded-sm" />
          <Skeleton className="mx-auto mt-6 h-4 w-[65%] rounded-full" />
        </div>
        <Skeleton className="mt-14 h-[320px] w-full rounded-sm" />
        <div className="mt-12 flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-40 rounded-full" />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
