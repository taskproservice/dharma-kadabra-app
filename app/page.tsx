import Image from "next/image";
import { CozyChat } from "@/components/cozy-chat";
import { HeroCarousel } from "@/components/hero-carousel";

const creatorBiography =
  "Ser puente. Esa ha sido, desde siempre, la más suave y firme misión de mi camino. Cómo va la vida?? Me presento…hola soy Paola, y concibo la vida como un tejido invisible donde la intuición es el pulso que nos guía a casa. Estar al servicio de los demás no es solo una vocación; es el lenguaje con el que honro mi paso por este mundo. Acompañar en la quietud, sostener con amor y abrir la puerta sagrada de los Registros Akáshicos es permitir que el alma hable sin prisa y recuerde su luz. De esa misma danza entre lo invisible y lo terrenal nace Dharma Kadabra. Cada talismán y cada pieza que mis manos modelan -desde un collar hasta un diseño que descansa sobre el pulso de tu mano- llevan impregnada una intención viva, un latido de alquimia y refugio. Porque hay verdades tan profundas que no se buscan: se encuentran. Como siempre lo he sentido, hay piezas que no se compran, se reconocen. Un talismán maestro es eso: un espejo que te abraza el pecho o te acompaña en el compás de las manos con absoluta elegancia y paz. Aquí no venimos a inventar la magia, sino a habitarla. Si mi voz, mis manos o el arte que creo pueden ser el puente para que regreses a ti, entonces todo tiene sentido.";

const benefits = [
  {
    title: "Punto de Venta",
    copy: "Una experiencia sencilla y cercana para acompañar cada venta, con la misma calidez que pones en cada encuentro.",
    icon: "pos",
  },
  {
    title: "Catálogo Visual",
    copy: "Presenta tus piezas con belleza y encuentra, de un vistazo, el talismán que resuena contigo.",
    icon: "catalog",
  },
  {
    title: "Inventario Inteligente",
    copy: "Mantén tus creaciones organizadas y su disponibilidad clara, sin perder de vista la intención detrás de cada una.",
    icon: "inventory",
  },
  {
    title: "Cozy IA",
    copy: "Una compañera digital disponible para orientar con calidez y acercar a cada persona a su propósito.",
    icon: "cozy",
  },
] as const;

function BenefitIcon({ name }: { name: (typeof benefits)[number]["icon"] }) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.55,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  if (name === "pos") {
    return (
      <svg {...shared}>
        <path d="M4 8h16v11H4zM4 12h16M8 16h3" />
        <path d="m8 8 1.2-3h5.6L16 8" />
      </svg>
    );
  }

  if (name === "catalog") {
    return (
      <svg {...shared}>
        <rect x="4" y="4" width="16" height="16" rx="2.5" />
        <path d="M8 9h8M8 12.5h8M8 16h4" />
        <circle cx="7" cy="7" r=".4" fill="currentColor" />
      </svg>
    );
  }

  if (name === "inventory") {
    return (
      <svg {...shared}>
        <path d="m12 3.5 8 4.25v8.5l-8 4.25-8-4.25v-8.5L12 3.5Z" />
        <path d="m4 7.75 8 4.5 8-4.5M12 12.25v8.1M8 5.65l8 4.5" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path d="M5 5.5h14v10H9l-4 3v-13Z" />
      <path d="M12 8v4M10 10h4" />
      <path d="m18.5 3 .45 1.4L20.5 5l-1.55.6L18.5 7l-.45-1.4L16.5 5l1.55-.6L18.5 3Z" />
    </svg>
  );
}

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      <a href="#coleccion" onClick={mobile ? undefined : undefined}>
        Colección
      </a>
      <a href="#creadora">El creador</a>
      <a href="#beneficios">Beneficios</a>
    </>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-papyrus text-ink">
      <header className="site-header">
        <div className="header-inner section-wrap">
          <a className="brand-lockup" href="#inicio" aria-label="Dharma Kadabra, inicio">
            <Image
              className="brand-mark"
              src="/brand/logo.png"
              alt=""
              width={52}
              height={52}
              priority
            />
            <span className="brand-name">
              <span>DHARMA</span>
              <span>KADABRA</span>
            </span>
          </a>

          <nav className="main-navigation" aria-label="Navegación principal">
            <NavigationLinks />
          </nav>

          <a className="button button-small header-cta" href="#beneficios">
            Comenzar <span aria-hidden="true">↗</span>
          </a>

          <details className="mobile-navigation">
            <summary aria-label="Abrir menú de navegación">
              <span className="menu-lines" aria-hidden="true"><i /><i /></span>
              Menú
            </summary>
            <nav aria-label="Navegación móvil">
              <NavigationLinks />
            </nav>
          </details>
        </div>
      </header>

      <section className="hero section-wrap" id="inicio" aria-labelledby="hero-title">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-star" aria-hidden="true">✦</span> Piezas consagradas · Hechas con intención</p>
            <h1 id="hero-title">Talismanes consagrados para <em>despertar tu propósito</em></h1>
            <p className="hero-intro">
              Amuletos artesanales que acompañan tu camino, honran tu intuición y te recuerdan la magia que ya habita en ti.
            </p>
            <a className="button hero-cta" href="#beneficios">
              Iniciar Prueba Gratis de 14 Días <span aria-hidden="true">→</span>
            </a>
            <div className="hero-promises" aria-label="Elaboración artesanal">
              <span><i aria-hidden="true">✧</i> Hecho a mano</span>
              <span><i aria-hidden="true">✧</i> Intención viva</span>
              <span><i aria-hidden="true">✧</i> Tu protección hecha arte</span>
            </div>
          </div>
          <HeroCarousel />
        </div>
        <a className="scroll-cue" href="#beneficios" aria-label="Descubrir beneficios">
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="benefits-section" id="beneficios" aria-labelledby="benefits-title">
        <div className="section-wrap">
          <div className="section-heading">
            <p className="eyebrow">Un espacio para crecer</p>
            <h2 id="benefits-title">Tu arte, sostenido por la <em>intención</em></h2>
            <p>Herramientas creadas para que la energía de tus piezas llegue más lejos.</p>
          </div>
          <div className="benefit-grid">
            {benefits.map((benefit, index) => (
              <article className="benefit-card" key={benefit.title}>
                <div className="benefit-card-top">
                  <span className="benefit-icon"><BenefitIcon name={benefit.icon} /></span>
                  <span className="benefit-number">0{index + 1}</span>
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
                <span className="benefit-rule" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="creator-section section-wrap" id="creadora" aria-labelledby="creator-title">
        <div className="creator-frame">
          <div className="creator-photo-wrap">
            <Image
              className="creator-photo"
              src="/brand/creator.jpg"
              alt="Espacio editorial reservado para la fotografía original de Paola Hernández; el retrato aún no fue adjuntado."
              width={1000}
              height={1250}
            />
            <div className="creator-photo-caption"><span>Un puente entre lo visible y lo sagrado</span></div>
            <span className="photo-corner photo-corner-top" aria-hidden="true" />
            <span className="photo-corner photo-corner-bottom" aria-hidden="true" />
          </div>
          <div className="creator-copy">
            <p className="eyebrow">El corazón detrás de cada pieza</p>
            <h2 id="creator-title">Paola Hernández <span>- Creadora de Dharma Kadabra</span></h2>
            <p className="creator-tagline">“Tu protección hecha arte”</p>
            <span className="creator-divider" aria-hidden="true"><i>✦</i></span>
            <p className="creator-biography">{creatorBiography}</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-wrap footer-inner">
          <a className="footer-brand" href="#inicio">Dharma Kadabra</a>
          <p>Creado con intención, en Tijuana, México.</p>
          <a href="#inicio" className="back-to-top">Volver arriba ↑</a>
        </div>
      </footer>

      <CozyChat />
    </main>
  );
}
