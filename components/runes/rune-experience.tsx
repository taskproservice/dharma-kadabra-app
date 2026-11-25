"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowRight, Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLockup } from "../landing/brand-logo";
import { CozyWidget } from "../landing/cozy-widget";
import { PremiumFooter } from "../landing/premium-footer";
import { runes } from "../../data/runes";
import { services, formatSessionPrice } from "../../lib/data/services";
import type { Rune } from "../../types/rune";
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
      className={`flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.34em] before:h-px before:w-9 before:bg-sanctuary-gold ${
        light ? "text-sanctuary-gold-ink" : "text-gold"
      }`}
    >
      {children}
    </p>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-stone-200 bg-[#FCFAF5] text-[#2C241B]">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Volver al inicio de Dharma Kadabra" className="shrink-0">
          <BrandLockup size={40} tone="papyrus" />
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
              className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#2C241B] transition hover:text-sanctuary-gold-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <RuneBookingCTA
          className="shrink-0 cursor-pointer rounded-full border border-[#C5A059] bg-[#C5A059]/15 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[.2em] text-[#2C241B] transition hover:bg-[#C5A059] sm:px-6"
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
    <section id="inicio" className="relative flex min-h-[92svh] items-center overflow-hidden bg-gradient-to-b from-[#F4EFE6] to-[#FCFAF5] pt-24 text-[#2C241B]">
      <Image
        src={IMAGES.hero}
        alt="Libro antiguo abierto con un círculo de símbolos rúnicos iluminado por una vela"
        fill
        priority
        sizes="100vw"
        quality={90}
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,250,245,.92)_0%,rgba(244,239,230,.82)_45%,rgba(244,239,230,.96)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.16),transparent_68%)] blur-3xl" />

      {/* Gradiente inferior: conecta la portada con el fondo beige del santuario */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[clamp(110px,18vh,180px)] bg-gradient-to-b from-transparent to-[#F4EFE6]"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-20 text-center sm:px-8">
        <div className="flex justify-center">
          <Eyebrow light>Dharma Kadabra · Sabiduría nórdica</Eyebrow>
        </div>
        <h1 className="rune-display mt-9 text-[clamp(3rem,10vw,8rem)] font-light uppercase leading-[.92] tracking-[.06em] text-[#2C241B]">
          EL LENGUAJE
          <br />
          <span className="text-[#C5A059]">DEL DESTINO</span>
        </h1>
        <div className="rune-hairline mx-auto mt-9 h-px w-56" />
        <p className="mx-auto mt-9 max-w-2xl text-sm leading-8 text-[#2C241B]/85 sm:text-base">
          Veinticinco símbolos, tres posiciones y una conversación honesta con el momento que vives. Las runas no dictan tu camino: te enseñan a leerlo.
        </p>
        <button
          type="button"
          onClick={() => document.getElementById("biblioteca")?.scrollIntoView({ behavior: "smooth" })}
          className="group mt-11 inline-flex cursor-pointer items-center gap-4 rounded-full border border-[#2C241B] bg-transparent px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-[#2C241B] transition hover:border-[#C5A059] hover:bg-[#C5A059]"
        >
          DESCUBRIR LAS RUNAS
          <ArrowDown size={15} className="transition group-hover:translate-y-1" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 text-[9px] uppercase tracking-[.3em] text-[#2C241B]/70 sm:justify-between">
        <span>25 símbolos</span>
        <span className="rune-glyph text-sm text-bronze">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ</span>
        <span>Una lectura presente</span>
      </div>
    </section>
  );
}

function Knowledge() {
  return (
    <section id="conocimiento" className="sanctuary-leaf relative scroll-mt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-4 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:py-5">
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-sanctuary-gold/30 shadow-[0_30px_60px_-34px_rgba(80,57,31,.55)]">
            <Image
              src={IMAGES.knowledge}
              alt="Piedras de ruta con símbolos rúnicos sobre terciopelo burdeos y velas encendidas"
              fill
              sizes="(min-width: 1024px) 42vw, 90vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-[10px] uppercase tracking-[.24em] text-sanctuary-gold-ink">
            Piedras, fuego y silencio · El ritual de la lectura
          </figcaption>
        </figure>

        <div>
          <Eyebrow light>01 · Conocimiento</Eyebrow>
          <h2 className="rune-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            Un alfabeto de símbolos para <em className="italic text-sanctuary-gold-leaf">mirar el presente.</em>
          </h2>
          <div className="mt-5 h-px w-24 bg-gradient-to-r from-sanctuary-gold to-transparent" />
          <div className="mt-5 space-y-3 text-[14px] leading-7 text-sanctuary-ink-soft">
            <p>
              El Futhark antiguo fue el alfabeto de los pueblos nórdicos. Cada signo guardaba una idea fuerza: el ganado, el hielo, el sol, la cosecha. Leer las runas es acercarse a esas imágenes con una pregunta concreta y observar qué responden.
            </p>
            <p>
              No se trata de adivinar un futuro cerrado, sino de conversar con lo que está ocurriendo ahora. La piedra que aparece no decide por ti: ilumina un ángulo que todavía no habías mirado.
            </p>
          </div>
          <dl className="mt-7 grid grid-cols-3 gap-3 border-y border-sanctuary-border py-5">
            {[
              { value: "24", label: "Runas históricas" },
              { value: "+1", label: "Runa vacía" },
              { value: "3", label: "Posiciones" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="rune-display text-3xl text-sanctuary-gold-ink">{stat.value}</dt>
                <dd className="mt-0.5 text-[9px] uppercase tracking-[.2em] text-sanctuary-ink-muted">{stat.label}</dd>
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
    <section className="sanctuary-leaf sanctuary-leaf-light relative border-y border-sanctuary-border-light">
      <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:pb-10">
        <div className="max-w-3xl">
          <Eyebrow light>02 · Propósito</Eyebrow>
          <h2 className="rune-display mt-5 text-5xl font-light leading-[1.03] sm:text-6xl">
            Cuatro maneras de <em className="italic text-sanctuary-gold-leaf">escucharte.</em>
          </h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-7 text-sanctuary-ink-soft">
            Cada lectura es distinta, pero todas tienen un propósito concreto: poner palabras a aquello que el día a día deja sin nombrar.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {purposes.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="sanctuary-card group p-5 lg:p-6">
              <div className="flex items-start justify-between">
                <Icon size={20} strokeWidth={1.25} className="text-sanctuary-gold-ink" aria-hidden="true" />
                <span className="rune-display text-sm text-sanctuary-ink-muted">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="rune-display mt-6 text-2xl text-sanctuary-ink">{title}</h3>
              <p className="mt-2 text-[12px] leading-6 text-sanctuary-ink-soft">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialBreak() {
  return (
    <section className="relative flex min-h-[34vh] items-center overflow-hidden border-y border-stone-200 bg-[#FCFAF5]">
      <Image
        src={IMAGES.editorial}
        alt="Piedras negras con runas doradas extendidas sobre un paño de lino"
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,250,245,.88),rgba(244,239,230,.94))]" />
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-10 text-center sm:px-8">
        <span aria-hidden="true" className="rune-glyph text-2xl text-[#C5A059]">ᛟ</span>
        <p className="rune-display mt-4 text-2xl font-light italic leading-tight text-[#2C241B] sm:text-4xl">
          &ldquo;La runa no predice el destino: revela la pregunta que el alma ya estaba haciendo.&rdquo;
        </p>
        <div className="rune-hairline mx-auto mt-5 h-px w-40" />
      </div>
    </section>
  );
}

function Library({ onSelect }: { onSelect: (rune: Rune) => void }) {
  return (
    <section id="biblioteca" className="sanctuary-leaf sanctuary-leaf-wood scroll-mt-20 border-y border-sanctuary-border py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-sanctuary-border pb-3">
          <div>
            <Eyebrow>03 · Biblioteca</Eyebrow>
            <h2 className="rune-display mt-2 text-4xl font-light leading-none sm:text-5xl">
              Los <em className="italic text-sanctuary-gold-leaf">25 símbolos</em>
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-5 text-sanctuary-ink-soft">
            Veinticuatro runas del Futhark antiguo y la runa vacía que completa la tirada. Toca cualquier símbolo para leer su significado.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5">
          {runes.map((rune) => (
            <button
              key={rune.id}
              type="button"
              onClick={() => onSelect(rune)}
              aria-label={`Ver significado de ${rune.name}`}
              className="group relative flex min-h-[78px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-sanctuary-gold/30 bg-sanctuary-wood-light p-2 text-center shadow-[0_8px_20px_-14px_rgba(80,57,31,.6)] transition duration-300 hover:-translate-y-1 hover:border-sanctuary-gold-ink/60 hover:bg-sanctuary-parchment-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sanctuary-gold-ink sm:min-h-[92px] sm:p-2.5"
            >
              <span className="absolute left-2 top-1.5 text-[8px] tracking-[.18em] text-sanctuary-gold-ink/70">
                {String(rune.number).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="rune-glyph text-2xl text-sanctuary-gold-ink transition group-hover:scale-110 sm:text-3xl">
                {rune.symbol}
              </span>
              <span className="rune-display text-xs leading-tight text-sanctuary-ink sm:text-sm">{rune.name}</span>
              <span className="hidden text-[8px] uppercase tracking-[.16em] text-sanctuary-ink-muted sm:block">
                {rune.keywords[0]}
              </span>
              <span aria-hidden="true" className="absolute bottom-1.5 right-2 text-transparent transition group-hover:text-sanctuary-gold-ink">↗</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[10px] leading-5 text-sanctuary-ink-muted">
          Nota histórica: el Elder Futhark tiene 24 caracteres. La runa vacía (Wyrd) es un complemento moderno de los juegos de lectura y aparece aquí como vigésimo quinta piedra.
        </p>
      </div>
    </section>
  );
}

function Spread() {
  return (
    <section
      id="tirada"
      className="sanctuary-leaf relative scroll-mt-20 overflow-hidden border-y border-sanctuary-border py-12 sm:py-16"
    >
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Eyebrow light>04 · Tirada de 3 runas</Eyebrow>
          <h2 className="rune-display mt-3 text-4xl font-light leading-[1.02] text-sanctuary-ink sm:text-5xl">
            Tres piedras, <em className="italic text-sanctuary-gold-leaf">una conversación.</em>
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-sanctuary-ink-soft">
            Voltea las cartas una a una. Cada runa llega de forma aleatoria de la biblioteca y habla desde una posición: pasado, presente y futuro.
          </p>
        </div>
        <div className="mt-6">
          <ThreeRuneSpread />
        </div>
      </div>
    </section>
  );
}

function Transformations() {
  return (
    <section className="sanctuary-leaf relative py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-sanctuary-border pb-2">
          <div>
            <Eyebrow>05 · Los umbrales</Eyebrow>
            <h2 className="rune-display mt-2 text-3xl font-light leading-none sm:text-4xl">
              Protección, transformación <em className="italic text-sanctuary-gold-leaf">y destino.</em>
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-5 text-sanctuary-ink-soft">
            Cuatro miradas sobre el mismo recorrido: cuidar, soltar, elegir e integrar.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="group relative min-h-[160px] overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
              <Image
                src={pillar.image}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover opacity-15 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-25"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,250,245,.86),rgba(255,255,255,.94))]" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[.28em] text-bronze">{pillar.number}</span>
                  <span aria-hidden="true" className="rune-glyph text-xl text-[#C5A059]">{pillar.glyph}</span>
                </div>
                <div className="mt-auto">
                  <h3 className="rune-display text-2xl font-light text-[#2C241B] sm:text-3xl">{pillar.title}</h3>
                  <div className="rune-hairline my-1.5 h-px w-20" />
                  <p className="max-w-md text-xs leading-5 text-[#2C241B]/80">{pillar.text}</p>
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
    <section id="consulta" className="sanctuary-leaf sanctuary-leaf-deep relative scroll-mt-20 overflow-hidden border-t border-sanctuary-border px-5 py-14 text-center sm:px-8 lg:py-20">
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.2),transparent_70%)] blur-3xl" />
      <span aria-hidden="true" className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rotate-45 bg-gold shadow-[0_0_14px_rgba(197,160,89,.9)]" />
      <div className="relative mx-auto max-w-4xl">
        <div className="flex justify-center">
          <Eyebrow>Tu siguiente paso</Eyebrow>
        </div>
        <h2 className="rune-display mt-4 text-4xl font-light leading-[1.04] text-sanctuary-ink sm:text-5xl">
          El destino tiene un lenguaje.
          <br />
          <em className="italic text-sanctuary-gold-leaf">Aprende a interpretarlo.</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sanctuary-ink-soft">
          Una sesión de 45 minutos para poner tus runas sobre la mesa, escuchar lo que dicen y salir con una decisión concreta.
        </p>
        <div className="mt-3 flex justify-center">
          <RuneBookingCTA
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-sanctuary-gold px-7 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-sanctuary-ink shadow-[0_18px_40px_-22px_rgba(80,57,31,.65)] transition hover:bg-sanctuary-gold-light"
            label="Iniciar mi consulta de Lectura de Runas"
          >
            INICIAR MI CONSULTA <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </RuneBookingCTA>
        </div>
        {service && (
          <p className="mt-3 text-[10px] uppercase tracking-[.24em] text-sanctuary-ink-muted">
            {service.duration} · {formatSessionPrice(service.price)} · Reserva con anticipo del 20%
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-sanctuary-ink-soft">
          ¿Ya tienes cuenta? <Link href="/mi-cuenta" className="font-medium text-sanctuary-gold-ink underline underline-offset-4 hover:text-sanctuary-ink">Accede a Mi Cuenta</Link> para ver tus lecturas agendadas.
        </p>
      </div>
    </section>
  );
}

export function RuneExperience({ fontClassName }: { fontClassName?: string }) {
  const [selected, setSelected] = useState<Rune | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openRune(rune: Rune) {
    setSelected(rune);
    setDrawerOpen(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-sanctuary-parchment text-sanctuary-ink">
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
      <CozyWidget />
    </>
  );
}
