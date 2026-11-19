import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Flame, Heart, Sparkles, Sun } from "lucide-react";
import { HeroCarousel, type HeroSlide } from "../components/landing/hero-carousel";
import joyeriaSagrada from "../public/images/hero/joyeria-sagrada.jpg";
import sabiduriaAncestral from "../public/images/hero/sabiduria-ancestral.jpg";
import altarRitual from "../public/images/hero/altar-ritual.jpg";

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

const team = [
  { name: "Lucía Moreno", role: "Terapeuta holística", initials: "LM" },
  { name: "Mateo Sánchez", role: "Lector de runas", initials: "MS" },
  { name: "Isabel Vega", role: "Guía de meditación", initials: "IV" },
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

export default function HomePage() {
  return (
    <main className="relative bg-[#F4ECD8] text-[#3E2723]">
      {/* Navegación translúcida fija */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#D4AF37]/15 bg-[#1A1A1A]/35 text-[#F4ECD8] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="#inicio" className="flex items-center gap-3">
            <Flame size={20} className="text-[#D4AF37]" />
            <span className="font-display text-xl tracking-wide">Dharma <em className="italic text-[#D4AF37]">Kadabra</em></span>
          </Link>
          <nav className="hidden items-center gap-9 text-[11px] font-medium uppercase tracking-[.25em] text-[#F4ECD8]/70 lg:flex">
            {nav.map((item) => <a key={item.href} href={item.href} className="transition hover:text-[#D4AF37]">{item.label}</a>)}
          </nav>
          <a href="#prueba" className="border border-[#D4AF37]/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.25em] transition hover:bg-[#D4AF37] hover:text-[#1A1A1A]">Comienza gratis</a>
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
      <section id="manifiesto" className="scroll-mt-16 px-5 py-28 sm:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center"><Eyebrow>Manifiesto</Eyebrow></div>
          <p className="mt-10 font-display text-3xl leading-[1.3] text-[#2A1B17] sm:text-4xl lg:text-5xl">
            Unimos la sabiduría espiritual ancestral con herramientas cotidianas para que cultives una relación <em className="italic text-[#8B6D16]">más consciente</em> contigo y con el mundo que te rodea.
          </p>
          <div className="mx-auto mt-12 h-16 w-px bg-gradient-to-b from-[#8B6D16]/60 to-transparent" />
        </div>
      </section>

      {/* Paola — Oscuro */}
      <section id="paola" className="scroll-mt-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 sm:px-8 md:grid-cols-[.9fr_1.1fr] lg:gap-24 lg:py-32">
          <figure className="relative">
            <div className="absolute -inset-3 border border-[#D4AF37]/20" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src={sabiduriaAncestral} alt="Libro antiguo de sabiduría con un medallón dorado" fill sizes="(min-width: 768px) 45vw, 100vw" placeholder="blur" className="object-cover object-[62%_center]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-transparent to-transparent" />
            </div>
            <figcaption className="absolute -bottom-6 right-6 border border-[#D4AF37]/25 bg-[#1A1A1A]/60 px-6 py-4 backdrop-blur-md">
              <span className="block font-display text-lg italic text-[#D4AF37]">Con amor,</span>
              <span className="text-[11px] uppercase tracking-[.25em] text-[#F4ECD8]/70">Paola Hernández</span>
            </figcaption>
          </figure>
          <div>
            <Eyebrow tone="light">Una guía cercana</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl">Hola, soy <em className="italic text-[#E6C766]">Paola.</em></h2>
            <p className="mt-8 max-w-xl text-base font-light leading-8 text-[#F4ECD8]/70">Creo que cada persona guarda una sabiduría profunda, esperando un espacio seguro para manifestarse. Mi camino es acompañarte a escucharla, reconectar con tu esencia y descubrir tus propias respuestas.</p>
            <p className="mt-5 max-w-xl text-base font-light leading-8 text-[#F4ECD8]/70">Dharma Kadabra nace del deseo de acercar prácticas ancestrales al mundo moderno: con calidez, sencillez y respeto por el ritmo único de cada quien.</p>
            <a href="#nosotros" className="mt-10 inline-flex items-center gap-3 border-b border-[#D4AF37]/40 pb-2 text-[11px] font-semibold uppercase tracking-[.28em] text-[#D4AF37] transition hover:border-[#D4AF37]">Conoce nuestra historia <ArrowRight size={14} /></a>
          </div>
        </div>
      </section>

      {/* Equipo — Papiro */}
      <section id="equipo" className="scroll-mt-16 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#3E2723]/10 pb-10">
            <div>
              <Eyebrow>Nuestra comunidad</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[#2A1B17] sm:text-6xl">Personas que <em className="italic text-[#8B6D16]">acompañan.</em></h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#3E2723]/65">Un equipo diverso de profesionales, unidos por una vocación: ofrecerte un espacio cálido para crecer.</p>
          </div>
          <div className="mt-14 grid gap-px bg-[#3E2723]/10 sm:grid-cols-3">
            {team.map((member, index) => (
              <article key={member.name} className="group bg-[#F4ECD8] p-8 transition hover:bg-[#EFE4CB] lg:p-10">
                <span className="font-display text-sm text-[#8B6D16]">{String(index + 1).padStart(2, "0")}</span>
                <div className="mt-8 grid size-24 place-items-center rounded-full border border-[#8B6D16]/40 font-display text-3xl italic text-[#2A1B17] transition group-hover:border-[#8B6D16]">{member.initials}</div>
                <h3 className="mt-8 font-display text-2xl text-[#2A1B17]">{member.name}</h3>
                <p className="mt-2 text-[11px] uppercase tracking-[.25em] text-[#3E2723]/55">{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares — Oscuro sobre imagen, tarjetas de vidrio */}
      <section id="nosotros" className="relative scroll-mt-16 overflow-hidden bg-[#1A1A1A] text-[#F4ECD8]">
        <Image src={altarRitual} alt="" fill sizes="100vw" placeholder="blur" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#1A1A1A]/60 to-[#1A1A1A]" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 lg:py-40">
          <div className="max-w-2xl">
            <Eyebrow tone="light">Información general</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl">Un refugio para tu <em className="italic text-[#E6C766]">bienestar.</em></h2>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <article key={title} className="border border-[#D4AF37]/20 bg-[#1A1A1A]/40 p-8 backdrop-blur-xl transition hover:border-[#D4AF37]/50 lg:p-10">
                <Icon size={22} strokeWidth={1.25} className="text-[#D4AF37]" />
                <h3 className="mt-10 font-display text-2xl">{title}</h3>
                <p className="mt-4 text-sm font-light leading-7 text-[#F4ECD8]/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios — Papiro */}
      <section id="beneficios" className="scroll-mt-16 px-5 py-24 sm:px-8 lg:py-32">
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
      <section id="prueba" className="scroll-mt-16 bg-[#1A1A1A] px-5 py-28 text-[#F4ECD8] sm:px-8 lg:py-36">
        <div className="relative mx-auto max-w-5xl border border-[#D4AF37]/25 bg-white/[0.02] px-6 py-16 text-center backdrop-blur-sm sm:px-16 sm:py-24">
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#D4AF37]" />
          <div className="flex justify-center"><Eyebrow tone="light">Tu primer paso empieza aquí</Eyebrow></div>
          <h2 className="mx-auto mt-8 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">Regálate un momento para <em className="italic text-[#E6C766]">reconectar.</em></h2>
          <p className="mx-auto mt-6 max-w-lg text-base font-light leading-7 text-[#F4ECD8]/65">Prueba gratis y descubre las herramientas y personas que pueden acompañar tu camino.</p>
          <Link href="/dashboard" className="group mt-12 inline-flex items-center gap-3 bg-[#D4AF37] px-8 py-4 text-[11px] font-semibold uppercase tracking-[.28em] text-[#1A1A1A] transition hover:bg-[#E6C766]">
            Comenzar mi prueba gratis <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <p className="mt-5 text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/40">Sin compromiso · Empieza cuando estés lista</p>
        </div>
      </section>

      <footer className="border-t border-[#D4AF37]/15 bg-[#141414] px-5 py-10 text-[#F4ECD8] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <Link href="#inicio" className="font-display text-lg">Dharma <em className="italic text-[#D4AF37]">Kadabra</em></Link>
          <p className="text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/40">© 2026 Dharma Kadabra · Un camino hacia ti</p>
          <a href="#inicio" className="text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/60 transition hover:text-[#D4AF37]">Volver arriba ↑</a>
        </div>
      </footer>
    </main>
  );
}
