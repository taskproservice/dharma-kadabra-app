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
import amuletoLunar from "../public/images/productos/amuleto-lunar.jpg";
import manuscritosPalma from "../public/images/akashic/manuscritos-palma.jpg";
import bosqueLuz from "../public/images/akashic/bosque-luz.jpg";
import meditacionAmanecer from "../public/images/akashic/meditacion-amanecer.jpg";
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
  { src: altarRitual, alt: "Altar con velas encendidas, merkaba dorada, cuarzos, lavanda e incienso sobre un pergamino de símbolos" },
  { src: joyeriaSagrada, alt: "Medallas de geometría sagrada en oro y bronce con piedras de lapislázuli sobre piedra y papiro" },
  { src: sabiduriaAncestral, alt: "Libro antiguo abierto con un medallón dorado, compás y pergaminos sobre una mesa de madera" },
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

      {/* Hero luminoso Premium Orgánico: degradado de papiro a marfil */}
      <HeroCarousel
        slides={slides}
        medallion={<HeroMedallion />}
        cta={
          <>
            <Link
              href="/tienda"
              className="group inline-flex items-center gap-3 rounded-full bg-[#C5A059] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.28em] text-[#2C241B] shadow-[0_14px_34px_-16px_rgba(197,160,89,.75)] transition hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C241B]"
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

      {/* Manifiesto editorial: declaración y fotografía a sangre en dos columnas */}
      <section
        id="manifiesto"
        className="scroll-mt-24 overflow-hidden bg-[#F5F2EB]"
      >
        <div className="grid min-h-[390px] lg:min-h-[440px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))] lg:py-20 lg:pr-14 xl:pl-[max(5rem,calc((100vw-80rem)/2))]">
            <Eyebrow>Manifiesto</Eyebrow>
            <p className="mt-7 max-w-2xl font-display text-[2rem] leading-[1.15] text-[#2C241B] sm:text-4xl lg:text-[2.65rem]">
              Unimos la sabiduría ancestral con herramientas cotidianas, para que cultives una relación{" "}
              <em className="italic text-[#6B4E1E]">más consciente</em>{" "}
              contigo y con el mundo que te rodea.
            </p>
          </div>
          <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px] lg:min-h-full">
            <Image
              src={manuscritosPalma}
              alt="Manuscritos antiguos iluminados por la luz suave de una ventana"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={88}
              className="object-cover object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#4B3925]/15 via-transparent to-[#2C241B]/10" />
            <p className="absolute bottom-8 right-8 max-w-48 border-l border-[#F5F2EB]/80 pl-4 font-sans text-[10px] font-semibold uppercase leading-5 tracking-[.24em] text-white drop-shadow-md sm:bottom-12 sm:right-12">
              Tradición con propósito para la vida real
            </p>
          </div>
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
              <figcaption className="absolute -bottom-2 left-3 right-3 rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:left-auto sm:right-0 sm:w-64 lg:-right-6">
                <p className="font-display text-xl leading-tight text-[#2C241B]">
                  Paola <em className="italic text-bronze">Hernández</em>
                </p>
                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[.22em] text-ink-muted">
                  Fundadora de Dharma Kadabra
                </p>
                <p className="mt-3 border-t border-stone-200 pt-3 font-display text-sm italic text-[#2C241B]">
                  &ldquo;Tejedora de Conciencia&rdquo;
                </p>
              </figcaption>
            </figure>
            <div>
              <Eyebrow>Una guía cercana</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.02] text-[#2C241B] sm:text-6xl">
                Paola <em className="italic text-[#C5A059]">Hernández</em>
              </h2>
              <p className="mt-5 font-display text-xl italic text-sanctuary-gold-ink sm:text-2xl">
                &ldquo;Tejedora de Conciencia&rdquo;
              </p>
              <div className="mt-8 h-px w-16 bg-gradient-to-r from-sanctuary-gold to-transparent" />
              <div className="mt-8 max-w-xl font-sans text-base leading-8 text-[#2C241B]">
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
                  className="inline-flex items-center gap-3 rounded-full bg-[#C5A059] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[.24em] text-[#2C241B] shadow-[0_12px_28px_-14px_rgba(197,160,89,0.7)] transition duration-300 hover:bg-gold-light"
                >
                  Conoce nuestra historia <ArrowRight size={14} />
                </a>
                <span className="font-display text-lg italic text-[#2C241B]">
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
        className="sanctuary-leaf relative scroll-mt-24 overflow-hidden px-5 py-12 sm:px-8 lg:py-16"
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
            <p className="max-w-sm text-sm leading-7 text-[#2C241B]">
              Un equipo diverso de profesionales, unidos por una vocación: ofrecerte un espacio
              cálido para crecer.
            </p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-3 lg:gap-5">
            {collaborators.map((member, index) => (
              /* Tarjeta Premium Orgánico: blanca, texto centrado, retrato ovalado
                 con bordes suaves y sombra muy ligera. */
              <article
                key={member.id}
                className="group rounded-3xl border border-[#E6DFD1] bg-[#F0EBE0]/75 p-6 text-center shadow-[0_6px_22px_rgba(44,36,27,.045)] transition duration-300 hover:-translate-y-1 hover:bg-[#F5F2EB] hover:shadow-[0_12px_30px_rgba(0,0,0,0.07)] lg:p-8"
              >
                <span className="font-display text-sm text-bronze">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {/* Retrato compacto: contenedor al 60% del ancho, centrado y elegante.
                    Ovalado con filo blanco y sombra suave. */}
                <div className="relative mx-auto mt-5 aspect-square w-[62%] overflow-hidden rounded-full border-4 border-white bg-papyrus-warm shadow-[0_16px_40px_rgba(44,36,27,0.10)]">
                  <Image
                    src={member.photoUrl}
                    alt={`Retrato de ${member.name}`}
                    fill
                    sizes="(min-width: 1024px) 18vw, 60vw"
                    className="object-cover grayscale-[.25] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <h3 className="mt-6 font-display text-2xl text-[#805F2B]">{member.name}</h3>
                <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-[#514333]">
                  {member.specialty}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Refugio: mitad editorial oscura y mitad tarjetas de pilares */}
      <section
        id="nosotros"
        className="scroll-mt-24 overflow-hidden bg-[#F0EBE0]"
      >
        <div className="grid lg:min-h-[430px] lg:grid-cols-2">
          <div className="relative flex min-h-[330px] items-end overflow-hidden px-7 py-10 sm:px-12 sm:py-14 lg:min-h-[430px] lg:px-16 lg:py-16">
            <Image
              src={bosqueLuz}
              alt="Luz del amanecer entre árboles de un bosque"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,24,16,.82),rgba(24,31,20,.57)),linear-gradient(0deg,rgba(16,20,14,.52),transparent)]" />
            <div className="relative z-10 max-w-lg">
              <p className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.3em] text-[#D8BC7F] before:h-px before:w-8 before:bg-[#D8BC7F]/80">Tu bienestar, nuestro propósito</p>
              <h2 className="mt-5 font-display text-4xl leading-[1.05] text-[#FCFAF5] sm:text-5xl lg:text-[3.4rem]">
                Un refugio para tu <em className="italic text-[#D8BC7F]">bienestar.</em>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#F5F2EB]/90">
                Tradición, herramientas y personas que te acompañan en cada paso.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            {pillars.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-[#E4DDCF] bg-white px-5 py-5 shadow-[0_5px_18px_rgba(44,36,27,.045)] sm:gap-5 sm:px-6"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F5F2EB] text-[#805F2B]">
                  <Icon size={21} strokeWidth={1.35} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl text-[#2C241B] sm:text-2xl">{title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#5B5143] sm:text-sm">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios · layout editorial con filetes finos */}
      <section
        id="beneficios"
        className="sanctuary-leaf relative scroll-mt-24 overflow-hidden px-5 py-10 sm:px-8 lg:py-14"
      >
        <FlowCrystal className="right-[10%] top-24 hidden size-4 lg:block" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
          <div>
            <Eyebrow>Tu espacio, a tu manera</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] text-sanctuary-ink sm:text-6xl">
              Beneficios para acompañar{" "}
              <em className="italic text-sanctuary-gold-leaf">tu viaje.</em>
            </h2>
            <p className="mt-8 max-w-md leading-7 text-[#2C241B]">
              Todo lo que necesitas para hacer de tu bienestar una práctica posible y amorosa,
              desde donde estés.
            </p>
          </div>
          <ol className="border-t border-sanctuary-border">
            {benefits.map((benefit, index) => (
              <li
                key={benefit.title}
                className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-sanctuary-border py-5 sm:grid-cols-[4rem_1fr_1fr]"
              >
                <span className="font-display text-lg italic text-sanctuary-gold-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl text-[#2C241B]">{benefit.title}</h3>
                <p className="col-start-2 text-sm leading-6 text-[#2C241B] sm:col-start-3">
                  {benefit.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prueba gratis — cierre panorámico y luminoso antes del footer */}
      <section
        id="prueba"
        className="relative isolate scroll-mt-24 overflow-hidden px-5 py-12 text-center sm:px-8 sm:py-14 lg:py-16"
      >
        <Image
          src={meditacionAmanecer}
          alt="Silueta meditando al amanecer en un paisaje cálido"
          fill
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#F5F2EB]/55" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-3">
          <Eyebrow center>Tu primer paso empieza aquí</Eyebrow>
          <h2 className="mx-auto max-w-4xl font-display text-4xl leading-[1.05] text-[#2C241B] sm:text-5xl lg:text-[3.4rem]">
            Regálate un momento para <em className="italic text-[#6B4E1E]">reconectar.</em>
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-6 text-[#2C241B]">
            Prueba gratis y descubre las herramientas y personas que pueden acompañar tu camino.
          </p>
          <Link
            href="/mi-cuenta"
            className="group mt-2 inline-flex items-center gap-3 rounded-full bg-[#C5A059] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.24em] text-[#2C241B] shadow-[0_14px_30px_-16px_rgba(197,160,89,.75)] transition hover:bg-[#D8BC7F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C241B]"
          >
            Comenzar prueba gratis{" "}
            <ArrowUpRight size={14} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <PremiumFooter />
    </main>

    {/* Cozy: fuera del contenedor principal para estar siempre visible */}
    <CozyWidget />
    </>
  );
}
