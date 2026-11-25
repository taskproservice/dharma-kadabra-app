export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-7" aria-busy="true" aria-label="Cargando panel">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-papyrus/[0.08]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-gold/10 bg-papyrus/[0.035]" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-gold/10 bg-papyrus/[0.035]" />
    </div>
  );
}
