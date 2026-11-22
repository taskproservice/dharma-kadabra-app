import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CozyWidget } from "../../components/landing/cozy-widget";
import { DigitalAgenda } from "../../components/landing/digital-agenda";
import { PremiumFooter } from "../../components/landing/premium-footer";
import { PublicHeader } from "../../components/landing/public-header";
import { RitualEventsSection } from "../../components/landing/ritual-events";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda Digital · Dharma Kadabra",
  description: "Agenda tus rituales, lecturas y limpiezas energéticas en sintonía con los ciclos lunares.",
};

export default async function AgendaPage() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const events = await prisma.specialEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { products: true },
  }).catch(() => []);

  const ritualEvents = events.map((event: { id: string; title: string; description: string; date: Date; products: { name: string }[] }) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    products: event.products.map((product: { name: string }) => product.name),
  }));

  // A diferencia de overflow-hidden, clip no impide que el panel de reserva sea sticky.
  return (
    <main className="min-h-screen overflow-x-clip bg-obsidian text-papyrus">
      <PublicHeader />

      <section className="relative isolate overflow-hidden px-5 pb-10 pt-32 sm:px-8 sm:pb-14 sm:pt-36">
        <span aria-hidden="true" className="pointer-events-none absolute -right-36 -top-48 size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.12),transparent_68%)] blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -left-48 top-28 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.07),transparent_68%)] blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <Link href="/" className="inline-flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.2em] text-gold-light/80 transition hover:text-papyrus">
            <ArrowLeft size={13} aria-hidden="true" /> Volver al inicio
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.27em] text-gold">
                <Sparkles size={14} aria-hidden="true" /> Un espacio para tu intención
              </p>
              <h1 className="mt-4 font-cormorant text-6xl font-light leading-[.95] text-papyrus sm:text-7xl lg:text-[5.5rem]">
                Agenda <em className="italic text-gold">Digital</em>
              </h1>
              <p className="mt-5 max-w-2xl font-[family-name:var(--font-montserrat)] text-sm leading-7 text-papyrus/65 sm:text-base sm:leading-8">
                Elige un momento para tus rituales, lecturas y limpiezas energéticas. Encuentra una fecha en sintonía con la luna y reserva tu espacio con calma.
              </p>
            </div>
            <div className="flex items-center gap-3 border-l border-gold/25 pl-4 text-[9px] font-medium uppercase tracking-[.18em] text-papyrus/50 sm:pl-5 lg:mb-2">
              <span className="grid size-10 place-items-center rounded-full border border-gold/25 bg-gold/[.06] text-gold-light"><Sparkles size={16} aria-hidden="true" /></span>
              <span>Rituales <i className="px-1 text-gold">·</i> Lecturas <i className="px-1 text-gold">·</i> Limpiezas</span>
            </div>
          </div>
        </div>
      </section>

      <DigitalAgenda todayKey={todayKey} />
      <RitualEventsSection events={ritualEvents} showAgendaLink={false} />
      <PremiumFooter />
      <CozyWidget />
    </main>
  );
}
