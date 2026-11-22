import Link from "next/link";
import { PublicHeader } from "../../components/landing/public-header";
import { PremiumFooter } from "../../components/landing/premium-footer";
import { RitualEventsSection } from "../../components/landing/ritual-events";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const events = await prisma.specialEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { products: true },
  }).catch(() => []);

  const ritualEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    products: event.products.map((product: { name: string }) => product.name),
  }));

  return (
    <main className="min-h-screen bg-[#0b1020] text-[#e9e2d2]">
      <PublicHeader />
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-36 sm:px-8">
        <Link href="/" className="text-xs uppercase tracking-[.18em] text-[#d8bc7f] hover:text-[#f7f2e7]">← Volver al inicio</Link>
        <h1 className="mt-6 font-cormorant text-5xl text-[#f7f2e7]">Agenda</h1>
        <p className="mt-3 text-sm text-[#e9e2d2]/65">Encuentros y rituales para tu camino.</p>
      </div>
      <RitualEventsSection events={ritualEvents} />
      <PremiumFooter />
    </main>
  );
}
