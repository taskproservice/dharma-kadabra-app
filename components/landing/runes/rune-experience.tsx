"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowRight, Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLockup } from "../brand-logo";
import { PremiumFooter } from "../premium-footer";
import { runes } from "../../../data/runes";
import { services, formatSessionPrice } from "../../../lib/data/services";
import type { Rune } from "../../../types/rune";
import { RuneBookingCTA } from "./booking-cta";
import { RuneDrawer } from "./rune-drawer";
import { ThreeRuneSpread } from "./three-rune-spread";

const IMAGES = {
  hero: "/images/runas/libro-del-destino.jpg",
  knowledge: "/images/runas/piedras-terciopelo.jpg",
  editorial: "/images/runas/runas-sobre-lino.jpg",
  velvet: "/images/runas/runas-velvet-oro.jpg",
  spread: "/images/runas/tres-runas-violetas.jpg",
  wood: "/images/runas/runas-sobre-madera.jpg",
};

const purposes = [
  {
    icon: Compass,
    title: "Autoconocimiento",
    text: "Nombra lo que sientes y reconoce el patrón que se repite. La runa vuelve visible lo que ya sabías en silencio.",
  },
  {
    icon: HeartHandshake,
    title: "Vínculos",
    text: "Mira la calidad de tus relaciones: qué sostienes, qué entregas y qué necesitas recibir para seguir en equilibrio.",
  },
  {
    icon: Sparkles,
    title: "Oportunidades",
    text: "Detecta la puerta que se abre y los recursos que tienes a mano para cruzarla con confianza y sentido.",
  },
  {
    icon: ShieldCheck,
    title: "Desafíos",
    text: "Comprende la fricción sin dramatizarla. Toda resistencia señala un límite, una decisión o una etapa que madura.",
  },
];

const pillars = [
  {
    number: "01",
    title: "Protección",
    text: "Algiz y Tiwaz recuerdan que cuidar tu espacio también es una forma de avanzar.",
    glyph: "ᛉ",
    image: IMAGES.velvet,
  },
  {
    number: "02",
    title: "Transformación",
    text: "Hagallaz, Nauthiz y Dagaz acompañan los cambios que rompen lo viejo para hacer lugar a lo nuevo.",
    glyph: "ᛞ",
    image: IMAGES.editorial,
  },
  {
    number: "03",
    title: "Destino",
    text: "Perthro y Wyrd hablan de aquello que no controlamos y de la manera en que elegimos responder.",
    glyph: "ᛈ",
    image: IMAGES.spread,
  },
  {
    number: "04",
    title: "Integración",
    text: "Jera y Othala cierran el círculo: integrar lo aprendido y llevarlo a la vida cotidiana.",
    glyph: "ᛃ",
    image: IMAGES.wood,
  },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.34em] before:h-px before:w-9 before:bg-[#C5A059] ${
        light ? "text-[#2E231D]/65" : "text-[#C5A059]"
      }`}
    >
      {children}
    </p>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#C5A059]/20 bg-[#121212]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Volver al inicio de Dharma Kadabra" className="shrink-0">
          <BrandLockup size={40} />
        </Link>
        <nav aria-label="Secciones de la lectura" className="hidden items-center gap-8 lg:flex">
          {[
            { href: "#conocimiento", label: "Conocimiento" },
            { href: "#biblioteca", label: "Biblioteca" },
            { href: "#tirada", label: "Tirada de 3 runas" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#F7F3EA]/65 transition hover:text-[#C5A059]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <RuneBookingCTA
          className="shrink-0 border border-[#C5A059]/70 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[.2em] text-[#C5A059] transition hover:bg-[#C5A059] hover:text-[#121212] sm:px-6"
          label="Reservar sesión de Lectura de Runas"
        >
          Reservar sesión
        </RuneBookingCTA>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#121212] pt-24">
      <Image
        src={IMAGES.hero}
        alt="Libro antiguo abierto con un círculo de símbolos rúnicos iluminado por una vela"
        fill
        priority
        sizes="100vw"
        quality={90}
        className="object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,.72)_0%,rgba(18,18,18,.48)_35%,rgba(18,18,18,.92)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.14),transparent_68%)] blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-20 text-center sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>Dharma Kadabra · Sabiduría nórdica</Eyebrow>
        </div>
        <h1 className="rune-display mt-9 text-[clamp(3rem,10vw,8rem)] font-light uppercase leading-[.92] tracking-[.06em] text-[#C5A059] drop-shadow-[0_10px_40px_rgba(0,0,0,.75)]">
          EL LENGUAJE
          <br />
          DEL DESTINO
        </h1>
        <div className="rune-hairline mx-auto mt-9 h-px w-56" />
        <p className="mx-auto mt-9 max-w-2xl text-sm leading-8 text-[#F7F3EA]/78 sm:text-base">
          Veinticinco símbolos, tres posiciones y una conversación honesta con el momento que vives. Las runas no dictan tu camino: te enseñan a leerlo.
        </p>
        <button
          type="button"
          onClick={() => document.getElementById("biblioteca")?.scrollIntoView({ behavior: "smooth" })}
          className="group mt-11 inline-flex items-center gap-4 rounded-full border border-[#C5A059]/70 bg-[#C5A059]/10 px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-[#F7F3EA] transition hover:bg-[#C5A059] hover:text-[#121212]"
        >
          DESCUBRIR LAS RUNAS
          <ArrowDown size={15} className="transition group-hover:translate-y-1" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 text-[9px] uppercase tracking-[.3em] text-[#F7F3EA]/45 sm:justify-between">
        <span>25 símbolos</span>
        <span className="rune-glyph text-sm text-[#C5A059]/70">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ</span>
        <span>Una lectura presente</span>
      </div>
    </section>
  );
}

function Knowledge() {
  return (
    <section id="conocimiento" className="relative scroll-mt-20 bg-[#F7F3EA] text-[#2E231D]">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:py-28">
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden border border-[#2E231D]/15 shadow-[0_30px_70px_-40px_rgba(46,35,29,.65)]">
            <Image
              src={IMAGES.knowledge}
              alt="Piedras de ruta con símbolos rúnicos sobre terciopelo burdeos y velas encendidas"
              fill
              sizes="(min-width: 1024px) 42vw, 90vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 text-[10px] uppercase tracking-[.24em] text-[#2E231D]/50">
            Piedras, fuego y silencio · El ritual de la lectura
          </figcaption>
        </figure>

        <div>
          <Eyebrow light>01 · Conocimiento</Eyebrow>
          <h2 className="rune-display mt-7 text-5xl font-light leading-[1.03] sm:text-6xl">
            Un alfabeto de símbolos para <em className="italic text-[#967325]">mirar el presente.</em>
          </h2>
          <div className="mt-8 h-px w-24 bg-gradient-to-r from-[#967325] to-transparent" />
          <div className="mt-8 space-y-5 text-[15px] leading-8 text-[#2E231D]/75">
            <p>
              El Futhark antiguo fue el alfabeto de los pueblos nórdicos. Cada signo guardaba una idea fuerza: el ganado, el hielo, el sol, la cosecha. Leer las runas es acercarse a esas imágenes con una pregunta concreta y observar qué responden.
            </p>
            <p>
              No se trata de adivinar un futuro cerrado, sino de conversar con lo que está ocurriendo ahora. La piedra que aparece no decide por ti: ilumina un ángulo que todavía no habías mirado.
            </p>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-[#2E231D]/12 py-7">
            {[
              { value: "24", label: "Runas históricas" },
              { value: "+1", label: "Runa vacía" },
              { value: "3", label: "Posiciones" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="rune-display text-4xl text-[#967325]">{stat.value}</dt>
                <dd className="mt-1 text-[9px] uppercase tracking-[.2em] text-[#2E231D]/55">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Purpose() {
  return (
    <section className="bg-[#F7F3EA] text-[#2E231D]">
      <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="max-w-3xl">
          <Eyebrow light>02 · Propósito</Eyebrow>
          <h2 className="rune-display mt-7 text-5xl font-light leading-[1.03] sm:text-6xl">
            Cuatro maneras de <em className="italic text-[#967325]">escucharte.</em>
          </h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#2E231D]/70">
            Cada lectura es distinta, pero todas tienen un propósito concreto: poner palabras a aquello que el día a día deja sin nombrar.
          </p>
        </div>

        <div className="mt-12 grid gap-px border border-[#2E231D]/12 bg-[#2E231D]/12 sm:grid-cols-2 lg:grid-cols-4">
          {purposes.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="group bg-[#F7F3EA] p-7 transition-colors hover:bg-[#efe8d8] lg:p-8">
              <div className="flex items-start justify-between">
                <Icon size={25} strokeWidth={1.25} className="text-[#967325]" aria-hidden="true" />
                <span className="rune-display text-lg text-[#2E231D]/30">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="rune-display mt-12 text-3xl">{title}</h3>
              <p className="mt-4 text-[13px] leading-7 text-[#2E231D]/65">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialBreak() {
  return (
    <section className="relative flex min-h-[46vh] items-center overflow-hidden bg-[#121212]">
      <Image
        src={IMAGES.editorial}
        alt="Piedras negras con runas doradas extendidas sobre un paño de lino"
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,.35),rgba(18,18,18,.92))]" />
      <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <span aria-hidden="true" className="rune-glyph text-3xl text-[#C5A059]">ᛟ</span>
        <p className="rune-display mt-7 text-3xl font-light italic leading-tight text-[#F7F3EA] sm:text-5xl">
          &ldquo;La runa no predice el destino:revela la pregunta que el alma ya estaba haciendo.&rdquo;
        </p>
        <div className="rune-hairline mx-auto mt-8 h-px w-40" />
      </div>
    </section>
  );
}

function Library({ onSelect }: { onSelect: (rune: Rune) => void }) {
  return (
    <section id="biblioteca" className="scroll-mt-20 bg-[#121212] py-20 text-[#F7F3EA] sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#C5A059]/20 pb-9">
          <div>
            <Eyebrow>03 · Biblioteca</Eyebrow>
            <h2 className="rune-display mt-6 text-5xl font-light leading-none sm:text-6xl">
              Los <em className="italic text-[#C5A059]">25 símbolos</em>
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-7 text-[#F7F3EA]/55">
            Veinticuatro runas del Futhark antiguo y la runa vacía que completa la tirada. Toca cualquier símbolo para leer su significado.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-2.5 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {runes.map((rune) => (
            <button
              key={rune.id}
              type="button"
              onClick={() => onSelect(rune)}
              aria-label={`Ver significado de ${rune.name}`}
              className="group relative flex aspect-[4/5] flex-col items-center justify-center border border-[#C5A059]/20 bg-[linear-gradient(160deg,rgba(197,160,89,.07),rgba(255,255,255,.015))] px-2 text-center transition duration-300 hover:-translate-y-1 hover:border-[#C5A059]/70 hover:bg-[#C5A059]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]"
            >
              <span className="absolute left-3 top-3 text-[9px] tracking-[.18em] text-[#C5A059]/60">
                {String(rune.number).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="rune-glyph text-4xl text-[#C5A059] transition group-hover:scale-110 sm:text-5xl">
                {rune.symbol}
              </span>
              <span className="rune-display mt-4 text-base leading-tight text-[#F7F3EA] sm:text-xl">{rune.name}</span>
              <span className="mt-2 hidden text-[9px] uppercase tracking-[.16em] text-[#F7F3EA]/40 sm:block">
                {rune.keywords[0]}
              </span>
              <span aria-hidden="true" className="absolute bottom-3 right-3 text-[#C5A059]/0 transition group-hover:text-[#C5A059]/80">↗</span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-[11px] leading-6 text-[#F7F3EA]/40">
          Nota histórica: el Elder Futhark tiene 24 caracteres. La runa vacía (Wyrd) es un complemento moderno de los juegos de lectura y aparece aquí como vigésimo quinta piedra.
        </p>
      </div>
    </section>
  );
}

function Spread() {
  return (
    <section id="tirada" className="relative scroll-mt-20 overflow-hidden border-y border-[#C5A059]/20 bg-[#121212] py-20 sm:py-28">
      <Image
        src={IMAGES.spread}
        alt="Tres runas negras con símbolos dorados sobre un mantel violeta iluminado por una vela"
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,.78),rgba(18,18,18,.95))]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Eyebrow>04 · Tirada de 3 runas</Eyebrow>
          <h2 className="rune-display mt-7 text-5xl font-light leading-[1.02] sm:text-6xl">
            Tres piedras, <em className="italic text-[#C5A059]">una conversación.</em>
          </h2>
          <p className="mt-6 text-[15px] leading-8 text-[#F7F3EA]/65">
            Voltea las cartas una a una. Cada runa llega de forma aleatoria de la biblioteca y habla desde una posición: pasado, presente y futuro.
          </p>
        </div>
        <div className="mt-14">
          <ThreeRuneSpread />
        </div>
      </div>
    </section>
  );
}

function Transformations() {
  return (
    <section className="bg-[#121212] py-20 text-[#F7F3EA] sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#C5A059]/20 pb-9">
          <div>
            <Eyebrow>05 · Los umbrales</Eyebrow>
            <h2 className="rune-display mt-6 text-5xl font-light leading-none sm:text-6xl">
              Protección, transformación <em className="italic text-[#C5A059]">y destino.</em>
            </h2>
          </div>
          <p className="max-w-xs text-[13px] leading-7 text-[#F7F3EA]/50">
            Cuatro miradas sobre el mismo recorrido: cuidar, soltar, elegir e integrar.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="group relative min-h-[360px] overflow-hidden border border-[#C5A059]/20 p-8 sm:p-10">
              <Image
                src={pillar.image}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover opacity-35 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-45"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,.5),rgba(18,18,18,.94))]" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[.28em] text-[#C5A059]">{pillar.number}</span>
                  <span aria-hidden="true" className="rune-glyph text-3xl text-[#C5A059]/70">{pillar.glyph}</span>
                </div>
                <div className="mt-auto">
                  <h3 className="rune-display text-4xl font-light sm:text-5xl">{pillar.title}</h3>
                  <div className="rune-hairline my-5 h-px w-24" />
                  <p className="max-w-md text-[13px] leading-7 text-[#F7F3EA]/65">{pillar.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Consultation() {
  const service = services.find((item) => item.id === "lectura-de-runas");

  return (
    <section id="consulta" className="relative scroll-mt-20 overflow-hidden bg-[#0e0e0e] px-5 py-24 text-center sm:px-8 sm:py-32">
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.2),transparent_70%)] blur-3xl" />
      <span aria-hidden="true" className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rotate-45 bg-[#C5A059] shadow-[0_0_14px_rgba(197,160,89,.9)]" />
      <div className="relative mx-auto max-w-4xl">
        <div className="flex justify-center">
          <Eyebrow>Tu siguiente paso</Eyebrow>
        </div>
        <h2 className="rune-display mt-9 text-5xl font-light leading-[1.04] text-[#F7F3EA] sm:text-7xl">
          El destino tiene un lenguaje.
          <br />
          <em className="italic text-[#C5A059]">Aprende a interpretarlo.</em>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-[15px] leading-8 text-[#F7F3EA]/60">
          Una sesión de 45 minutos para poner tus runas sobre la mesa, escuchar lo que dicen y salir con una decisión concreta.
        </p>
        <div className="mt-11 flex justify-center">
          <RuneBookingCTA
            className="group inline-flex items-center gap-4 rounded-full bg-[#C5A059] px-10 py-5 text-[11px] font-semibold uppercase tracking-[.26em] text-[#121212] shadow-[0_22px_60px_-22px_rgba(197,160,89,.9)] transition hover:bg-[#d9b673]"
            label="Iniciar mi consulta de Lectura de Runas"
          >
            INICIAR MI CONSULTA <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </RuneBookingCTA>
        </div>
        {service && (
          <p className="mt-6 text-[10px] uppercase tracking-[.24em] text-[#F7F3EA]/40">
            {service.duration} · {formatSessionPrice(service.price)} · Reserva con anticipo del 20%
          </p>
        )}
        <p className="mt-3 text-[11px] text-[#F7F3EA]/40">
          ¿Ya tienes cuenta? <Link href="/mi-cuenta" className="text-[#C5A059] underline underline-offset-4">Accede a Mi Cuenta</Link> para ver tus lecturas agendadas.
        </p>
      </div>
    </section>
  );
}

export function RuneExperience({ fontClassName }: { fontClassName: string }) {
  const [selected, setSelected] = useState<Rune | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openRune(rune: Rune) {
    setSelected(rune);
    setDrawerOpen(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-[#121212] text-[#F7F3EA]">
        <Hero />
        <Knowledge />
        <Purpose />
        <EditorialBreak />
        <Library onSelect={openRune} />
        <Spread />
        <Transformations />
        <Consultation />
      </main>
      <PremiumFooter />
      <RuneDrawer rune={selected} open={drawerOpen} onOpenChange={setDrawerOpen} fontClassName={fontClassName} />
    </>
  );
}
