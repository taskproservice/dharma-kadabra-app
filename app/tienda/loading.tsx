/** Esqueleto de la tienda: mantiene el fondo beige Premium Orgánico mientras llega el catálogo. */
export default function TiendaLoading() {
  return (
    <main className="min-h-screen bg-papyrus text-ink" aria-busy="true" aria-label="Cargando la tienda">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8">
        <div className="h-4 w-40 animate-pulse rounded-full bg-papyrus-warm" />
        <div className="mx-auto mt-12 max-w-xl text-center">
          <div className="mx-auto h-3 w-44 animate-pulse rounded-full bg-papyrus-warm" />
          <div className="mx-auto mt-7 h-14 w-[80%] animate-pulse rounded-sm bg-papyrus-warm" />
          <div className="mx-auto mt-6 h-4 w-[65%] animate-pulse rounded-full bg-papyrus-warm" />
        </div>
        <div className="mt-14 h-[320px] w-full animate-pulse rounded-sm bg-papyrus-warm" />
        <div className="mt-12 flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-11 w-40 animate-pulse rounded-full bg-papyrus-warm" />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] w-full animate-pulse rounded-2xl border border-stone-200 bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
