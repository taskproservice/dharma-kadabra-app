import { AgendaSlotSkeleton, Skeleton } from "../../../components/ui/skeleton";

/** Skeleton de la agenda mientras cargan las citas (navegación). */
export default function AgendaLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8" aria-busy="true" aria-label="Cargando agenda">
      <header className="border-b border-[#c7a45a]/30 pb-7">
        <Skeleton className="h-3 w-64" />
        <Skeleton className="mt-3 h-10 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>
        </div>
      </header>
      <div className="space-y-3.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <AgendaSlotSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
