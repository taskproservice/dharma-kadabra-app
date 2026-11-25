import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CirclePlay } from "lucide-react";
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
    <main className="min-h-screen overflow-x-clip bg-papyrus text-ink">
      <PublicHeader tone="papyrus" />

      <section className="relative isolate min-h-[350px] overflow-hidden border-b border-[#C5A059]/20 px-5 pb-8 pt-[5.6rem] sm:min-h-[365px] sm:px-8 sm:pb-9 sm:pt-[5.8rem] lg:min-h-[345px]">
        <Image
          src="/images/hero/altar-ritual.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_52%]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6]/[.97] via-[#F4EFE6]/[.88] via-55% to-[#F4EFE6]/[.15]" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#F4EFE6]/[.12] via-transparent to-[#F4EFE6]/[.2]" />
        <div className="relative mx-auto max-w-7xl">
          <Link href="/" className="inline-flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[10px] font-medium text-[#6B4E1E] transition hover:text-ink">
            <ArrowLeft size={14} aria-hidden="true" /> Volver al inicio
          </Link>
          <div className="mt-7 max-w-3xl sm:mt-8">
            <p className="inline-flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.25em] text-[#6B4E1E] sm:text-[10px]">
              <span aria-hidden="true" className="h-px w-6 bg-[#C5A059]" />
              Calendario mensual
              <span aria-hidden="true" className="h-px w-6 bg-[#C5A059]" />
            </p>
            <h1 className="mt-2 font-cormorant text-[3.35rem] font-light leading-[.92] text-ink sm:text-7xl lg:text-[5.25rem]">
              Agenda <em className="italic text-[#805F2B]">Digital</em>
            </h1>
            <p className="mt-4 max-w-xl font-[family-name:var(--font-montserrat)] text-[13px] leading-6 text-[#3D352B] sm:text-sm sm:leading-7">
              Elige un momento para tus rituales, lecturas y limpiezas energéticas. Encuentra una fecha en sintonía con la luna y reserva tu espacio con calma.
            </p>
            <Link
              href="#calendario"
              className="mt-5 inline-flex min-h-10 items-center gap-3 rounded-full border border-[#C5A059] bg-[#FCFAF5]/55 px-5 py-2 font-[family-name:var(--font-montserrat)] text-[11px] font-semibold text-[#5A4116] shadow-[0_5px_18px_-12px_rgba(44,36,27,.45)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
            >
              Cómo funciona <CirclePlay size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <DigitalAgenda todayKey={todayKey} />
      <RitualEventsSection events={ritualEvents} showAgendaLink={false} appearance="papyrus" />
      <PremiumFooter />
      <CozyWidget />
    </main>
  );
}
