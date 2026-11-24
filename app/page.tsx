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
import cuarzoClaro from "../public/images/productos/cuarzo-claro.jpg";
import amuletoLunar from "../public/images/productos/amuleto-lunar.jpg";
import runasLino from "../public/images/runas/runas-sobre-lino.jpg";
import piedrasTerciopelo from "../public/images/runas/piedras-terciopelo.jpg";
import { collaborators } from "../lib/data/collaborators";
import { RitualEventsSection } from "../components/landing/ritual-events";
import { ServicesSection } from "../components/landing/services";
import { PremiumFooter } from "../components/landing/premium-footer";
import { BrandTourTrigger } from "../components/landing/brand-tour-modal";
import { FlowCrystal, FlowStone } from "../components/landing/sanctuary-flow";
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

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p className={`sanctuary-eyebrow${center ? " sanctuary-eyebrow-center" : ""}`}>
      {children}
    </p>
  );
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
    <main className="relative bg-sanctuary-parchment text-sanctuary-ink">
      <PublicHeader />

      {/* Hero cinematográfico: conserva la noche y se funde con el papiro */}
      <HeroCarousel
        slides={slides}
        medallion={<HeroMedallion />}
        cta={
          <>
            <Link
              href="/tienda"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-bright px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.28em] text-obsidian shadow-[0_18px_50px_-20px_rgba(197,160,89,.8)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-bright"
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

      {/* Manifiesto · papiro, mucho aire y palabras en oro antiguo */}
      <section
        id="manifiesto"
        className="sanctuary-leaf relative scroll-mt-24 overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 size-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.16),transparent_70%)] blur-3xl"
        />
        <FlowStone
          src={cuarzoClaro}
          position="-right-28 top-8 hidden sm:block sm:-right-16 lg:right-4 xl:right-16"
          size="size-32 sm:size-40 lg:size-48"
          renderWidth={192}
          opacity="opacity-[0.20]"
          frame="blob"
          speed="slow"
          rotate="rotate-6"
        />
        <FlowCrystal className="left-[8%] top-24 hidden size-3 lg:block" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="flex justify-center">
            <Eyebrow center>Manifiesto</Eyebrow>
          </div>
          <p className="mt-10 font-display text-3xl leading-[1.32] text-sanctuary-ink sm:text-4xl lg:text-[3.2rem]">
            Unimos la sabiduría espiritual ancestral con herramientas cotidianas
            para que cultives una relación{" "}
            <em className="italic text-sanctuary-gold-leaf">más consciente</em>{" "}
            contigo y con el mundo que te rodea.
          </p>
          <div className="mx-auto mt-12 h-16 w-px bg-gradient-to-b from-sanctuary-gold/70 to-transparent" />
        </div>
      </section>

      {/* Quiénes somos — Paola sobre madera clara */}
      <section
        id="paola"
        className="sanctuary-leaf sanctuary-leaf-light relative scroll-mt-24 overflow-hidden border-y border-sanctuary-border-light px-5 py-16 sm:px-8 lg:py-24"
      >
        <FlowStone
          src={piedrasTerciopelo}
          position="-left-32 bottom-8 hidden sm:block lg:-left-20 xl:left-0"
          size="size-40 lg:size-56"
          renderWidth={224}
          opacity="opacity-[0.18] sm:opacity-[0.22]"
          frame="pebble"
          speed="slow"
          rotate="-rotate-6"
        />
        <FlowCrystal className="right-[12%] top-16 hidden size-2.5 lg:block" tone="sage" />
        <article className="relative z-10 mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <figure className="relative mx-auto w-full max-w-sm pb-16 md:max-w-none md:pb-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[0_24px_60px_rgba(44,36,27,0.10)]">
                <Image
                  src={paolaHernandez}
                  alt="Paola Hernández, fundadora y guía de Dharma Kadabra, sentada en una silla colgante de mimbre vestida de blanco"
                  fill
                  sizes="(min-width: 1152px) 420px, (min-width: 768px) 40vw, 90vw"
                  quality={90}
                  placeholder="blur"
                  className="object-cover"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-[#C5A059]/25"
                />
              </div>
              {/* Tarjeta blanca de la fundadora: se posa sobre la fotografía */}
              <figcaption className="absolute -bottom-2 left-3 right-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_16px_40px_rgba(44,36,27,0.08)] sm:left-auto sm:right-0 sm:w-64 lg:-right-6">
                <p className="font-display text-xl leading-tight text-ink">
                  Paola <em className="italic text-bronze">Hernández</em>
                </p>
                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[.22em] text-ink-muted">
                  Fundadora de Dharma Kadabra
                </p>
                <p className="mt-3 border-t border-stone-200 pt-3 font-display text-sm italic text-sanctuary-ink-soft">
                  &ldquo;Tejedora de Conciencia&rdquo;
                </p>
              </figcaption>
            </figure>
            <div>
              <Eyebrow>Una guía cercana</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.02] text-sanctuary-ink sm:text-6xl">
                Paola <em className="italic text-sanctuary-gold-leaf">Hernández</em>
              </h2>
              <p className="mt-5 font-display text-xl italic text-sanctuary-gold-ink sm:text-2xl">
                &ldquo;Tejedora de Conciencia&rdquo;
              </p>
              <div className="mt-8 h-px w-16 bg-gradient-to-r from-sanctuary-gold to-transparent" />
              <div className="mt-8 max-w-xl font-sans text-base leading-8 text-sanctuary-ink-soft">
                <p>
                  Cada alma guarda una sabiduría profunda que merece un espacio seguro para
                  expresarse. A través de mis canalizaciones, camino contigo desde el amor para
                  que reconectes con tu esencia y encuentres tus propias respuestas. Dharma
                  Kadabra acerca prácticas ancestrales al mundo moderno con sencillez, amor y
                  profundo respeto por el ritmo de cada alma.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <a
                  href="#nosotros"
                  className="inline-flex items-center gap-3 border-b border-sanctuary-gold/45 pb-2 text-[11px] font-semibold uppercase tracking-[.28em] text-sanctuary-ink transition duration-300 hover:border-sanctuary-gold-ink hover:text-sanctuary-gold-ink"
                >
                  Conoce nuestra historia <ArrowRight size={14} />
                </a>
                <span className="font-display text-lg italic text-sanctuary-ink-soft">
                  Con amor, Paola
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Próximos rituales — la tienda pública vive ahora en /tienda */}
      <RitualEventsSection events={ritualEvents} />

      {/* Servicios agendables (runas, registros akáshicos) */}
      <ServicesSection />

      {/* Equipo — retratos editoriales sobre madera */}
      <section
        id="equipo"
        className="sanctuary-leaf relative scroll-mt-24 overflow-hidden px-5 py-16 sm:px-8 lg:py-24"
      >
        <FlowStone
          src={amuletoLunar}
          position="-right-28 top-10 hidden sm:block lg:-right-16 xl:right-2"
          size="size-36 lg:size-48"
          renderWidth={192}
          opacity="opacity-[0.19]"
          frame="arch"
          speed="slow"
          rotate="rotate-3"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-8 border-b border-sanctuary-border pb-10">
            <div>
              <Eyebrow>Nuestra comunidad</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.05] text-sanctuary-ink sm:text-6xl">
                Personas que{" "}
                <em className="italic text-sanctuary-gold-leaf">acompañan.</em>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-sanctuary-ink-soft">
              Un equipo diverso de profesionales, unidos por una vocación: ofrecerte un espacio
              cálido para crecer.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-3 lg:gap-6">
            {collaborators.map((member, index) => (
              /* Tarjeta Premium Orgánico: blanca, texto centrado, retrato ovalado
                 con bordes suaves y sombra muy ligera. */
              <article
                key={member.id}
                className="group rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] lg:p-8"
              >
                <span className="font-display text-sm text-bronze">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {/* Retrato compacto: contenedor al 60% del ancho, centrado y elegante.
                    Ovalado con filo blanco y sombra suave. */}
                <div className="relative mx-auto mt-5 aspect-[4/5] w-[62%] overflow-hidden rounded-full border-4 border-white bg-papyrus-warm shadow-[0_16px_40px_rgba(44,36,27,0.10)]">
                  <Image
                    src={member.photoUrl}
                    alt={`Retrato de ${member.name}`}
                    fill
                    sizes="(min-width: 1024px) 18vw, 60vw"
                    className="object-cover grayscale-[.25] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <h3 className="mt-6 font-display text-2xl text-ink">{member.name}</h3>
                <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-ink-muted">
                  {member.specialty}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares — información general sobre papiro profundo */}
      <section
        id="nosotros"
        className="sanctuary-leaf sanctuary-leaf-deep relative scroll-mt-24 overflow-hidden border-y border-sanctuary-border/70 px-5 py-16 sm:px-8 lg:py-24"
      >
        <FlowStone
          src={runasLino}
          position="-left-28 top-1/2 hidden -translate-y-1/2 sm:block lg:-left-16 xl:left-0"
          size="size-40 lg:size-52"
          renderWidth={208}
          opacity="opacity-[0.16]"
          frame="pebble"
          speed="slow"
          rotate="rotate-12"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Eyebrow>Información general</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] text-sanctuary-ink sm:text-6xl">
              Un refugio para tu{" "}
              <em className="italic text-sanctuary-gold-ink">bienestar.</em>
            </h2>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              /* Pilar · tarjeta blanca Premium Orgánico con acento dorado sutil */
              <article
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] lg:p-10"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gold/10 blur-2xl transition duration-300 group-hover:bg-gold/20"
                />
                <span className="relative grid size-11 place-items-center rounded-full border border-gold/40 bg-gold/10">
                  <Icon size={22} strokeWidth={1.25} className="text-bronze" />
                </span>
                <h3 className="relative mt-8 font-display text-2xl text-ink">{title}</h3>
                <p className="relative mt-4 text-sm leading-7 text-sanctuary-ink-soft">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios · layout editorial con filetes finos */}
      <section
        id="beneficios"
        className="sanctuary-leaf relative scroll-mt-24 overflow-hidden px-5 py-16 sm:px-8 lg:py-24"
      >
        <FlowCrystal className="right-[10%] top-24 hidden size-4 lg:block" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <Eyebrow>Tu espacio, a tu manera</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] text-sanctuary-ink sm:text-6xl">
              Beneficios para acompañar{" "}
              <em className="italic text-sanctuary-gold-leaf">tu viaje.</em>
            </h2>
            <p className="mt-8 max-w-md leading-7 text-sanctuary-ink-soft">
              Todo lo que necesitas para hacer de tu bienestar una práctica posible y amorosa,
              desde donde estés.
            </p>
          </div>
          <ol className="border-t border-sanctuary-border">
            {benefits.map((benefit, index) => (
              <li
                key={benefit.title}
                className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-sanctuary-border py-7 sm:grid-cols-[4rem_1fr_1fr]"
              >
                <span className="font-display text-lg italic text-sanctuary-gold-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl text-sanctuary-ink">{benefit.title}</h3>
                <p className="col-start-2 text-sm leading-6 text-sanctuary-ink-soft sm:col-start-3">
                  {benefit.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prueba gratis — tarjeta marfil con sombra cálida */}
      <section
        id="prueba"
        className="sanctuary-leaf relative scroll-mt-24 overflow-hidden px-5 py-12 sm:px-8 lg:py-16"
      >
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-5 overflow-hidden rounded-3xl border border-stone-200 bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:px-16 sm:py-14">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.16),transparent_70%)] blur-2xl"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-sanctuary-gold shadow-[0_0_12px_rgba(197,160,89,.6)]"
          />
          <div className="relative flex justify-center">
            <Eyebrow center>Tu primer paso empieza aquí</Eyebrow>
          </div>
          <h2 className="relative mx-auto max-w-3xl font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
            Regálate un momento para{" "}
            <em className="italic text-bronze">reconectar.</em>
          </h2>
          <p className="relative mx-auto max-w-lg text-base leading-7 text-sanctuary-ink-soft">
            Prueba gratis y descubre las herramientas y personas que pueden acompañar tu camino.
          </p>
          <Link
            href="/mi-cuenta"
            className="group relative inline-flex items-center gap-3 rounded-full bg-sanctuary-gold px-8 py-4 text-[11px] font-semibold uppercase tracking-[.28em] text-ink shadow-[0_14px_30px_-16px_rgba(197,160,89,.75)] transition hover:bg-sanctuary-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze"
          >
            Comenzar Prueba Gratis{" "}
            <ArrowUpRight
              size={15}
              className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
          <p className="relative text-[11px] uppercase tracking-[.2em] text-ink-muted/80">
            COMIENZA CUANDO TU ALMA TE LO INDIQUE
          </p>
        </div>
      </section>

      <PremiumFooter />
    </main>

    {/* Cozy: fuera del contenedor principal para estar siempre visible */}
    <CozyWidget />
    </>
  );
}
