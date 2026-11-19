import { prisma } from "../../../lib/prisma";
import { products } from "../../../lib/data/products";
import { EventsCalendar, type CalendarEvent } from "../../../components/events-calendar";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.specialEvent.findMany({ include: { products: true }, orderBy: { date: "asc" } });
  const initialEvents: CalendarEvent[] = events.map((event: { id: string; title: string; description: string; date: Date; products: { id: string; name: string }[] }) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    start: event.date.toISOString(),
    productNames: event.products.map((product) => product.name),
  }));

  return <div className="mx-auto max-w-7xl space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.28em] text-[#8B6D16]">Ciclos · Encuentros · Comunidad</p>
        <h1 className="font-display text-4xl text-[#2A1B17]">Eventos especiales</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3E2723]/65">Organiza el calendario lunar y vincula los objetos que acompañan cada ritual.</p>
      </div>
      <span className="rounded-full border border-[#D4AF37]/30 bg-white/45 px-4 py-2 text-xs text-[#3E2723]/65">{initialEvents.length} eventos en calendario</span>
    </header>
    <EventsCalendar initialEvents={initialEvents} products={products.map(({ id, name }) => ({ id, name }))} />
  </div>;
}
