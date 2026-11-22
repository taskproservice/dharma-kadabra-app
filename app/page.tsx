import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart, Sparkles, Sun } from "lucide-react";
import { HeroCarousel, HeroMedallion, type HeroSlide } from "../components/landing/hero-carousel";
import { LunarBanner } from "../components/landing/lunar-banner";
import { PublicHeader } from "../components/landing/public-header";
import { CozyWidget } from "../components/landing/cozy-widget";
import joyeriaSagrada from "../public/images/hero/joyeria-sagrada.jpg";
import sabiduriaAncestral from "../public/images/hero/sabiduria-ancestral.jpg";
import altarRitual from "../public/images/hero/altar-ritual.jpg";
import paolaHernandez from "../public/images/equipo/paola-hernandez.jpg";
import { collaborators } from "../lib/data/collaborators";
import { RitualEventsSection } from "../components/landing/ritual-events";
import { ServicesSection } from "../components/landing/services";
import { PremiumFooter } from "../components/landing/premium-footer";
import { BrandTourTrigger } from "../components/landing/brand-tour-modal";
import { prisma } from "../lib/prisma";
import { DEFAULT_TOUR, parseTourChapters, type TourVideoConfig } from "../lib/tour";

const heroImages = [
  { src: joyeriaSagrada, alt: "Medallas de geometría sagrada en oro y bronce con piedras de lapislázuli sobre piedra y papiro" },
  { src: sabiduriaAncestral, alt: "Libro antiguo abierto con un medallón dorado, compás y pergaminos sobre una mesa de madera" },
  { src: altarRitual, alt: "Altar con velas encendidas, merkaba dorada, cuarzos, lavanda e incienso sobre un pergamino de símbolos" },
];

const slides: HeroSlide[] = [
  { eyebrow: "Un espacio para volver a ti", title: "La sabiduría antigua, viva en tu", accent: "presente.", text: "Encuentra guía, calma y herramientas para caminar tu propio sendero." },
  { eyebrow: "Escucha lo que tu alma ya sabe", title: "Tu camino interior merece ser", accent: "escuchado.", text: "Rituales, lecturas y acompañamiento consciente para cada etapa." },
  { eyebrow: "Pequeños rituales, grandes comienzos", title: "Crea una vida que se sienta como", accent: "tuya.", text: "Una comunidad que te acompaña a crecer con intención y amor." },
];

const pillars = [
  { icon: Sun, title: "Sabiduría viva", text: "Tradiciones ancestrales compartidas con cuidado, contexto y corazón." },
  { icon: Heart, title: "Acompañamiento humano", text: "Guías y especialistas que te escuchan sin juicios y a tu propio ritmo." },
  { icon: Sparkles, title: "Prácticas para tu día", text: "Rituales, recursos y momentos de pausa que caben en la vida real." },
];

const benefits = [
  { title: "Sesiones personalizadas", text: "Con guías de confianza, a tu medida." },
  { title: "Biblioteca viva", text: "Audios, rituales y recursos para cada ciclo." },
  { title: "Agenda flexible", text: "Reserva a tu ritmo, desde donde estés." },
  { title: "Comunidad", text: "Personas que crecen y aprenden contigo." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow-gold">{children}</p>;
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Sin base de datos (o con error de conexión) la landing se muestra sin
  // eventos en lugar de fallar: el resto del contenido es estático.
  const upcomingEvents = await prisma.specialEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 2,
    include: { products: true },
  }).catch(() => []);
  const ritualEvents = upcomingEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    products: event.products.map((product: { name: string }) => product.name),
  }));

  // Tour de marca: el contenido real (video, capítulos y CTA) vive en Prisma.
  // Si la base de datos no responde o aún no hay registro, se usa una
  // configuración de respaldo para que el Hero nunca pierda su CTA.
  const tourRecord = await prisma.tourVideo
    .findFirst({ orderBy: { updatedAt: "desc" } })
    .catch(() => null);
  const tourConfig: TourVideoConfig = tourRecord
    ? {
        title: tourRecord.title,
        videoUrl: tourRecord.videoUrl,
        chapters: parseTourChapters(tourRecord.chapters),
        ctaText: tourRecord.ctaText,
        ctaLink: tourRecord.ctaLink,
      }
    : DEFAULT_TOUR;

  return (
    <>
    <main className="relative bg-[#0b1020] text-[#e9e2d2]">
      <PublicHeader />

      {/* Hero cinematográfico con tarjeta de cristal */}
      <HeroCarousel
        slides={slides}
        medallion={<HeroMedallion />}
        cta={
          <>
            <Link
              href="/tienda"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.28em] text-[#0b1020] shadow-[0_18px_50px_-20px_rgba(199,164,90,.8)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c57c]"
            >
              Explorar Colección
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <BrandTourTrigger config={tourConfig} />
          </>
        }
      >
        {heroImages.map((image, index) => (
          <Image
            key={image.alt}
            src={image.src}
            alt={image.alt}
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
            sizes="100vw"
            quality={90}
            placeholder="blur"
            className="object-cover w-full h-full"
          />
        ))}
      </HeroCarousel>

      <LunarBanner />

      {/* Manifiesto */}
      <section id="manifiesto" className="relative scroll-mt-24 overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(199,164,90,.10),transparent_70%)] blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="flex justify-center"><Eyebrow>Manifiesto</Eyebrow></div>
          <p className="mt-10 font-display text-3xl leading-[1.32] text-[#f7f2e7] sm:text-4xl lg:text-[3.2rem]">
            Unimos la sabiduría espiritual ancestral con herramientas cotidianas para que cultives una relación <em className="italic text-[#e3c57c]">más consciente</em> contigo y con el mundo que te rodea.
          </p>
          <div className="mx-auto mt-12 h-16 w-px bg-gradient-to-b from-[#c7a45a]/70 to-transparent" />
        </div>
      </section>

      {/* Quiénes somos — Paola sobre Papiro */}
      <section id="paola" className="papyrus-section relative scroll-mt-24 overflow-hidden bg-[#F4EFE6] px-5 py-16 text-[#1A1A1A] sm:px-8 lg:py-24">
        <article className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <figure className="mx-auto w-full max-w-sm md:max-w-none">
              <div className="relative aspect-[2/3] overflow-hidden rounded-sm border border-[#C5A059]/60 shadow-[0_30px_60px_-30px_rgba(26,26,26,0.3)]">
                <Image
                  src={paolaHernandez}
                  alt="Paola Hernández, fundadora y guía de Dharma Kadabra, sentada en una silla colgante de mimbre vestida de blanco"
                  fill
                  sizes="(min-width: 1152px) 420px, (min-width: 768px) 40vw, 90vw"
                  quality={90}
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-5 text-center text-[10px] uppercase tracking-[.3em] text-[#1A1A1A]/70">Fundadora · Dharma Kadabra</figcaption>
            </figure>
            <div>
              <Eyebrow>Una guía cercana</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.02] text-[#1A1A1A] sm:text-6xl">Paola <em className="italic text-[#805F2B]">Hernández</em></h2>
              <p className="mt-5 font-display text-xl italic text-[#805F2B] sm:text-2xl">&ldquo;Tejedora de Conciencia&rdquo;</p>
              <div className="mt-8 h-px w-16 bg-gradient-to-r from-[#C5A059] to-transparent" />
              <div className="mt-8 font-sans text-base leading-8 text-stone-800">
                <p>Cada alma guarda una sabiduría profunda que merece un espacio seguro para expresarse. A través de mis canalizaciones, camino contigo desde el amor para que reconectes con tu esencia y encuentres tus propias respuestas. Dharma Kadabra acerca prácticas ancestrales al mundo moderno con sencillez, amor y profundo respeto por el ritmo de cada alma.</p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <a href="#nosotros" className="inline-flex items-center gap-3 border-b border-[#C5A059]/40 pb-2 text-[11px] font-semibold uppercase tracking-[.28em] text-[#1A1A1A] transition duration-300 hover:border-[#C5A059] hover:text-[#805F2B]">Conoce nuestra historia <ArrowRight size={14} /></a>
                <span className="font-display text-lg italic text-[#1A1A1A]/70">Con amor, Paola</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Próximos rituales — la tienda pública vive ahora en /tienda */}
      <RitualEventsSection events={ritualEvents} />

      {/* Servicios agendables (runas, registros akáshicos) */}
      <ServicesSection />

      {/* Equipo — retratos editoriales */}
      <section id="equipo" className="relative scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#c7a45a]/15 pb-10">
            <div>
              <Eyebrow>Nuestra comunidad</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[#f7f2e7] sm:text-6xl">Personas que <em className="italic text-[#e3c57c]">acompañan.</em></h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#e9e2d2]/55">Un equipo diverso de profesionales, unidos por una vocación: ofrecerte un espacio cálido para crecer.</p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#c7a45a]/15 bg-[#c7a45a]/12 sm:grid-cols-3">
            {collaborators.map((member, index) => (
              <article key={member.id} className="group bg-[#0b1020] p-6 text-center transition hover:bg-[#11182b] lg:p-8">
                <span className="font-display text-sm text-[#c7a45a]">{String(index + 1).padStart(2, "0")}</span>
                {/* Retrato compacto: contenedor al 60% del ancho, centrado y elegante */}
                <div className="relative mx-auto mt-5 aspect-[4/5] w-[60%] overflow-hidden border border-[#c7a45a]/25 bg-[#11182b] shadow-[0_24px_50px_-24px_rgba(0,0,0,.8)]">
                  <Image src={member.photoUrl} alt={`Retrato de ${member.name}`} fill sizes="(min-width: 1024px) 18vw, 60vw" className="object-cover grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-[#f7f2e7]">{member.name}</h3>
                <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-[#e9e2d2]/45">{member.specialty}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares — imagen de altar con tarjetas Papiro */}
      <section id="nosotros" className="relative scroll-mt-24 overflow-hidden bg-[#080c16] text-[#f7f2e7]">
        <Image src={altarRitual} alt="" fill sizes="100vw" placeholder="blur" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c16] via-[#080c16]/70 to-[#080c16]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <Eyebrow>Información general</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[#f7f2e7] sm:text-6xl">Un refugio para tu <em className="italic text-[#e3c57c]">bienestar.</em></h2>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <article key={title} className="papyrus-card group relative overflow-hidden rounded-2xl border border-[#C5A059]/30 bg-[#F4EFE6] p-8 shadow-[0_24px_50px_-24px_rgba(26,26,26,0.25),inset_0_1px_0_rgba(255,255,255,0.7)] transition duration-300 hover:-translate-y-1 hover:border-[#C5A059]/60 hover:shadow-[0_30px_60px_-24px_rgba(26,26,26,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] lg:p-10">
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[#C5A059]/15 blur-2xl transition duration-300 group-hover:bg-[#C5A059]/25" />
                <Icon size={22} strokeWidth={1.25} className="relative text-[#C5A059]" />
                <h3 className="relative mt-10 font-display text-2xl text-[#1A1A1A]">{title}</h3>
                <p className="relative mt-4 text-sm font-light leading-7 text-[#1A1A1A]/70">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="relative scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <Eyebrow>Tu espacio, a tu manera</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[#f7f2e7] sm:text-6xl">Beneficios para acompañar <em className="italic text-[#e3c57c]">tu viaje.</em></h2>
            <p className="mt-8 max-w-md leading-7 text-[#e9e2d2]/55">Todo lo que necesitas para hacer de tu bienestar una práctica posible y amorosa, desde donde estés.</p>
          </div>
          <ol className="border-t border-[#c7a45a]/15">
            {benefits.map((benefit, index) => (
              <li key={benefit.title} className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-[#c7a45a]/15 py-7 sm:grid-cols-[4rem_1fr_1fr]">
                <span className="font-display text-lg italic text-[#c7a45a]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-2xl text-[#f7f2e7]">{benefit.title}</h3>
                <p className="col-start-2 text-sm leading-6 text-[#e9e2d2]/50 sm:col-start-3">{benefit.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prueba gratis — tarjeta Papiro */}
      <section id="prueba" className="scroll-mt-24 bg-[#080c16] px-5 py-12 sm:px-8 lg:py-16">
        <div className="papyrus-card relative mx-auto flex max-w-5xl flex-col items-center gap-5 overflow-hidden rounded-[1.25rem] border border-[#C5A059]/30 bg-[#F4EFE6] px-6 py-10 text-center shadow-[0_24px_60px_-32px_rgba(26,26,26,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] transition duration-300 sm:px-16 sm:py-14">
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.28),transparent_70%)] blur-2xl" />
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#C5A059] shadow-[0_0_12px_rgba(197,160,89,.9)]" />
          <div className="relative flex justify-center"><Eyebrow>Tu primer paso empieza aquí</Eyebrow></div>
          <h2 className="relative mx-auto max-w-3xl font-display text-5xl leading-[1.05] text-[#1A1A1A] sm:text-6xl">Regálate un momento para <em className="italic text-[#C5A059]">reconectar.</em></h2>
          <p className="relative mx-auto max-w-lg text-base font-light leading-7 text-[#1A1A1A]/70">Prueba gratis y descubre las herramientas y personas que pueden acompañar tu camino.</p>
          <Link href="/dashboard/pos" className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] px-8 py-4 text-[11px] font-semibold uppercase tracking-[.28em] text-[#0b1020] shadow-[0_18px_50px_-20px_rgba(199,164,90,.8)] transition hover:brightness-110">
            Comenzar Prueba Gratis <ArrowUpRight size={15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <p className="relative text-[11px] uppercase tracking-[.2em] text-[#1A1A1A]/50">COMIENZA CUANDO TU ALMA TE LO INDIQUE</p>
        </div>
      </section>

      <PremiumFooter />
    </main>

    {/* Cozy: fuera del contenedor principal para estar siempre visible */}
    <CozyWidget />
    </>
  );
}
