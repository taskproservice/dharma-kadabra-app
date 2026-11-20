import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart, Sparkles, Sun } from "lucide-react";
import { HeroCarousel, type HeroSlide } from "../components/landing/hero-carousel";
import { BrandLogo } from "../components/landing/brand-logo";
import { CozyWidget } from "../components/landing/cozy-widget";
import joyeriaSagrada from "../public/images/hero/joyeria-sagrada.jpg";
import sabiduriaAncestral from "../public/images/hero/sabiduria-ancestral.jpg";
import altarRitual from "../public/images/hero/altar-ritual.jpg";
import paolaHernandez from "../public/images/equipo/paola-hernandez.jpg";
import { collaborators } from "../lib/data/collaborators";
import { Storefront } from "../components/landing/storefront";
import { prisma } from "../lib/prisma";

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

const nav = [
  { href: "#manifiesto", label: "Manifiesto" },
  { href: "#paola", label: "Nuestra guía" },
  { href: "#coleccion", label: "Colección" },
  { href: "#servicios", label: "Servicios" },
  { href: "#equipo", label: "Colaboradores" },
  { href: "#nosotros", label: "Pilares" },
  { href: "#beneficios", label: "Beneficios" },
];

function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] ${tone === "light" ? "text-[#D4AF37]" : "text-[#8B6D16]"}`}>
      <span className={`h-px w-10 ${tone === "light" ? "bg-[#D4AF37]/60" : "bg-[#8B6D16]/50"}`} />
      {children}
    </p>
  );
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const upcomingEvents = await prisma.specialEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 2,
    include: { products: true },
  });
  const ritualEvents = upcomingEvents.map((event: { id: string; title: string; description: string; date: Date; products: { name: string }[] }) => ({
    id: event.id, title: event.title, description: event.description, date: event.date.toISOString(), products: event.products.map((product) => product.name),
  }));

  return (
    <>
    <main className="relative bg-[#F4ECD8] text-[#3E2723]">
      {/* Navegación translúcida fija */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#D4AF37]/15 bg-[#1A1A1A]/35 text-[#F4ECD8] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 sm:px-8">
          <Link href="#inicio" aria-label="Dharma Kadabra · Inicio" className="flex items-center justify-start">
            <BrandLogo size={48} />
          </Link>
          <nav className="hidden items-center gap-9 text-[11px] font-medium uppercase tracking-[.25em] text-[#F4ECD8]/85 lg:flex">
            {nav.map((item) => <a key={item.href} href={item.href} className="transition hover:text-[#D4AF37]">{item.label}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/mi-cuenta" className="hidden text-[10px] font-semibold uppercase tracking-[.18em] text-[#F4ECD8] transition hover:text-[#D4AF37] sm:inline">Mi cuenta</Link>
            <a href="#coleccion" className="border border-[#D4AF37]/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.25em] text-[#F4ECD8] transition hover:bg-[#D4AF37] hover:text-[#1A1A1A]">Ver piezas consagradas</a>
          </div>
        </div>
      </header>

      {/* Hero cinematográfico */}
      <HeroCarousel slides={slides}>
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
            className="object-cover w-full h-screen"
          />
        ))}
      </HeroCarousel>

      {/* Manifiesto — Papiro */}
      <section id="manifiesto" className="scroll-mt-16 px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center"><Eyebrow>Manifiesto</Eyebrow></div>
          <p className="mt-10 font-display text-3xl leading-[1.3] text-[#2A1B17] sm:text-4xl lg:text-5xl">
            Unimos la sabiduría espiritual ancestral con herramientas cotidianas para que cultives una relación <em className="italic text-[#8B6D16]">más consciente</em> contigo y con el mundo que te rodea.
          </p>
          <div className="mx-auto mt-12 h-16 w-px bg-gradient-to-b from-[#8B6D16]/60 to-transparent" />
        </div>
      </section>

      {/* Paola Hernández — Tarjeta editorial Papiro sobre fondo oscuro */}
      <section id="paola" className="scroll-mt-16 bg-[#1A1A1A] px-5 py-16 sm:px-8 lg:py-20">
        <article className="relative mx-auto max-w-6xl border border-[#D4AF37]/35 bg-[#F4ECD8] p-6 text-[#3E2723] shadow-[0_40px_90px_-40px_rgba(0,0,0,.8)] sm:p-10 lg:p-16">
          {/* Filete interior dorado: detalle de tarjeta editorial */}
          <div className="pointer-events-none absolute inset-3 border border-[#D4AF37]/25 sm:inset-4" />
          <div className="relative grid items-center gap-12 md:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <figure className="mx-auto w-full max-w-sm md:max-w-none">
              <div className="relative aspect-[2/3] overflow-hidden border-2 border-[#D4AF37] shadow-[0_24px_50px_-20px_rgba(62,39,35,.45)]">
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
              <figcaption className="mt-5 text-center text-[10px] uppercase tracking-[.3em] text-[#3E2723]/55">Fundadora · Dharma Kadabra</figcaption>
            </figure>
            <div>
              <Eyebrow>Una guía cercana</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.02] text-[#2A1B17] sm:text-6xl">Paola <em className="italic text-[#8B6D16]">Hernández</em></h2>
              <p className="mt-5 font-display text-xl italic text-[#8B6D16] sm:text-2xl">&ldquo;Tejedora de Conciencia&rdquo;</p>
              <div className="mt-8 h-px w-16 bg-[#D4AF37]" />
              <div className="mt-8 space-y-5 font-sans text-base leading-8 text-[#3E2723]/75">
                <p>Creo que cada persona guarda una sabiduría profunda, esperando un espacio seguro para manifestarse. Mi camino es acompañarte a escucharla, reconectar con tu esencia y descubrir tus propias respuestas.</p>
                <p>Dharma Kadabra nace del deseo de acercar prácticas ancestrales al mundo moderno: con calidez, sencillez y respeto por el ritmo único de cada quien.</p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <a href="#nosotros" className="inline-flex items-center gap-3 border-b border-[#8B6D16]/40 pb-2 text-[11px] font-semibold uppercase tracking-[.28em] text-[#8B6D16] transition hover:border-[#8B6D16]">Conoce nuestra historia <ArrowRight size={14} /></a>
                <span className="font-display text-lg italic text-[#3E2723]/60">Con amor, Paola</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Tienda y servicios */}
      <Storefront events={ritualEvents} />

      {/* Equipo — retratos editoriales */}
      <section id="equipo" className="scroll-mt-16 px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#3E2723]/10 pb-10">
            <div>
              <Eyebrow>Nuestra comunidad</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[#2A1B17] sm:text-6xl">Personas que <em className="italic text-[#8B6D16]">acompañan.</em></h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#3E2723]/65">Un equipo diverso de profesionales, unidos por una vocación: ofrecerte un espacio cálido para crecer.</p>
          </div>
          <div className="mt-14 grid gap-px bg-[#3E2723]/10 sm:grid-cols-3">
            {collaborators.map((member, index) => (
              <article key={member.id} className="group bg-[#F4ECD8] p-6 transition hover:bg-[#EFE4CB] lg:p-8">
                <span className="font-display text-sm text-[#8B6D16]">{String(index + 1).padStart(2, "0")}</span>
                <div className="relative mt-5 aspect-[4/5] overflow-hidden bg-[#E1D4B8]">
                  <Image src={member.photoUrl} alt={`Retrato de ${member.name}`} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover grayscale sepia-[.2] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:sepia-0" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-[#2A1B17]">{member.name}</h3>
                <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-[#3E2723]/55">{member.specialty}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares — Oscuro sobre imagen, tarjetas de vidrio */}
      <section id="nosotros" className="relative scroll-mt-16 overflow-hidden bg-[#1A1A1A] text-[#F4ECD8]">
        <Image src={altarRitual} alt="" fill sizes="100vw" placeholder="blur" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#1A1A1A]/60 to-[#1A1A1A]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl">
            <Eyebrow tone="light">Información general</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[#F4ECD8] sm:text-6xl">Un refugio para tu <em className="italic text-[#E6C766]">bienestar.</em></h2>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <article key={title} className="border border-[#D4AF37]/20 bg-[#1A1A1A]/40 p-8 backdrop-blur-xl transition hover:border-[#D4AF37]/50 lg:p-10">
                <Icon size={22} strokeWidth={1.25} className="text-[#D4AF37]" />
                <h3 className="mt-10 font-display text-2xl text-[#F4ECD8]">{title}</h3>
                <p className="mt-4 text-sm font-light leading-7 text-[#F4ECD8]/90">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios — Papiro */}
      <section id="beneficios" className="scroll-mt-16 px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <Eyebrow>Tu espacio, a tu manera</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[#2A1B17] sm:text-6xl">Beneficios para acompañar <em className="italic text-[#8B6D16]">tu viaje.</em></h2>
            <p className="mt-8 max-w-md leading-7 text-[#3E2723]/65">Todo lo que necesitas para hacer de tu bienestar una práctica posible y amorosa, desde donde estés.</p>
          </div>
          <ol className="border-t border-[#3E2723]/15">
            {benefits.map((benefit, index) => (
              <li key={benefit.title} className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-[#3E2723]/15 py-7 sm:grid-cols-[4rem_1fr_1fr]">
                <span className="font-display text-lg italic text-[#8B6D16]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-2xl text-[#2A1B17]">{benefit.title}</h3>
                <p className="col-start-2 text-sm leading-6 text-[#3E2723]/60 sm:col-start-3">{benefit.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prueba — Oscuro */}
      <section id="prueba" className="scroll-mt-16 bg-[#1A1A1A] px-5 py-16 text-[#F4ECD8] sm:px-8 lg:py-20">
        <div className="relative mx-auto max-w-5xl border border-[#D4AF37]/25 bg-white/[0.02] px-6 py-10 text-center backdrop-blur-sm sm:px-16 sm:py-12">
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#D4AF37]" />
          <div className="flex justify-center"><Eyebrow tone="light">Tu primer paso empieza aquí</Eyebrow></div>
          <h2 className="mx-auto mt-8 max-w-3xl font-display text-5xl leading-[1.05] text-[#F4ECD8] sm:text-6xl">Regálate un momento para <em className="italic text-[#E6C766]">reconectar.</em></h2>
          <p className="mx-auto mt-6 max-w-lg text-base font-light leading-7 text-[#F4ECD8]/90">Prueba gratis y descubre las herramientas y personas que pueden acompañar tu camino.</p>
          <Link href="/dashboard/pos" className="group mt-12 inline-flex items-center gap-3 bg-[#D4AF37] px-8 py-4 text-[11px] font-semibold uppercase tracking-[.28em] text-[#1A1A1A] transition hover:bg-[#E6C766]">
            Comenzar Prueba Gratis <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <p className="mt-5 text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/75">COMIENZA CUANDO TU ALMA TE LO INDIQUE</p>
        </div>
      </section>

      <footer className="border-t border-[#D4AF37]/15 bg-[#141414] px-5 pb-28 pt-10 text-[#F4ECD8] sm:px-8 sm:pb-10 sm:pr-28 2xl:pr-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <Link href="#inicio" className="font-display text-lg text-[#F4ECD8]">Dharma <em className="italic text-[#D4AF37]">Kadabra</em></Link>
          <p className="text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/75">© 2026 Dharma Kadabra · Un camino hacia ti</p>
          <a href="#inicio" className="text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/85 transition hover:text-[#D4AF37]">Volver arriba ↑</a>
        </div>
      </footer>
    </main>

    {/* Cozy: fuera del contenedor principal para estar siempre visible */}
    <CozyWidget />
    </>
  );
}
