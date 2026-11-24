"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Check, Clock, Facebook, Instagram, Mail, MessageCircle, Send } from "lucide-react";
import { BrandLogo } from "./brand-logo";

const SUPPORT_EMAIL = "hola@dharmakadabra.mx";

function resolveWhatsappDigits(raw: string | undefined): string {
  const digits = (raw ?? "").replace(/\D+/g, "");
  if (digits.length < 10 || digits.endsWith("1234567") || digits.endsWith("12345678")) {
    return "";
  }
  return digits;
}

const policies = [
  { label: "Aviso de privacidad" },
  { label: "Términos y condiciones" },
  { label: "Política de envíos" },
];

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.3em] text-[#D8BC7F]">
      <span className="h-px w-6 bg-[#C5A059]/70" />
      {children}
    </h3>
  );
}

/**
 * Footer Premium Orgánico: Café muy oscuro / Madera Oscura (#1E1914) como en la
 * referencia, con textos claros (#F5F2EB), acentos dorados (#C5A059) y un filete
 * de oro antiguo en la parte superior para un contraste impecable.
 */
export function PremiumFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");
  const instagramUrl = (process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "").trim();
  const facebookUrl = (process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "").trim();
  const whatsappDigits = resolveWhatsappDigits(process.env.NEXT_PUBLIC_STORE_WHATSAPP);

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus("error");
      return;
    }
    setStatus("done");
    setEmail("");
  };

  return (
    <footer
      className="relative isolate overflow-hidden border-t border-[#C5A059]/25 px-5 pb-10 pt-14 text-[#F5F2EB] sm:px-8"
      style={{
        backgroundImage: "linear-gradient(rgba(22, 18, 14, .88), rgba(22, 18, 14, .94)), url('/images/runas/runas-sobre-madera.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 55%",
      }}
    >
      {/* Filete de oro antiguo: la marca se cierra con una línea de luz. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(197,160,89,.65),transparent)]"
      />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          {/* Columna 1 — Marca */}
          <div>
            <Link href="/" aria-label="Dharma Kadabra · Inicio" className="inline-flex items-center gap-3">
              <BrandLogo size={56} />
              <span className="flex flex-col leading-none">
                <span className="font-display text-base tracking-[.2em] text-[#F5F2EB]">DHARMA</span>
                <span className="font-display text-base tracking-[.2em] text-[#C5A059]">KADABRA</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs font-display text-lg italic leading-relaxed text-[#E8E1D5]">
              Un camino hacia ti.
            </p>
            <p className="mt-3 max-w-xs text-sm font-light leading-6 text-[#F5F2EB]/75">
              Sabiduría ancestral para el mundo moderno, con sencillez, amor y profundo respeto por el ritmo de cada alma.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram de Dharma Kadabra"
                  className="grid size-10 place-items-center rounded-full border border-[#F5F2EB]/25 text-[#F5F2EB]/85 transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1E1914]"
                >
                  <Instagram size={17} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Instagram oficial · Próximamente"
                  aria-label="Instagram de Dharma Kadabra (Próximamente)"
                  className="grid size-10 cursor-not-allowed place-items-center rounded-full border border-[#F5F2EB]/20 text-[#F5F2EB]/50"
                >
                  <Instagram size={17} />
                </button>
              )}
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook de Dharma Kadabra"
                  className="grid size-10 place-items-center rounded-full border border-[#F5F2EB]/25 text-[#F5F2EB]/85 transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1E1914]"
                >
                  <Facebook size={17} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Facebook oficial · Próximamente"
                  aria-label="Facebook de Dharma Kadabra (Próximamente)"
                  className="grid size-10 cursor-not-allowed place-items-center rounded-full border border-[#F5F2EB]/20 text-[#F5F2EB]/50"
                >
                  <Facebook size={17} />
                </button>
              )}
            </div>
          </div>

          {/* Columna 2 — Atención a clientes */}
          <nav aria-label="Atención a clientes">
            <ColumnTitle>Atención a Clientes</ColumnTitle>
            <ul className="mt-6 space-y-4 text-sm font-light leading-6 text-[#F5F2EB]/85">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-start gap-3 transition hover:text-[#D8BC7F]">
                  <Mail size={16} className="mt-1 shrink-0 text-[#C5A059]" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[.2em] text-[#F5F2EB]/60">Email de soporte</span>
                    {SUPPORT_EMAIL}
                  </span>
                </a>
              </li>
              <li>
                {whatsappDigits ? (
                  <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 transition hover:text-[#D8BC7F]">
                    <MessageCircle size={16} className="mt-1 shrink-0 text-[#C5A059]" />
                    <span>
                      <span className="block text-[10px] uppercase tracking-[.2em] text-[#F5F2EB]/60">WhatsApp de contacto</span>
                      +{whatsappDigits}
                    </span>
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    title="Línea directa de WhatsApp · Próximamente"
                    className="flex cursor-not-allowed items-start gap-3 text-[#F5F2EB]/65"
                  >
                    <MessageCircle size={16} className="mt-1 shrink-0 text-[#C5A059]/60" />
                    <span>
                      <span className="block text-[10px] uppercase tracking-[.2em] text-[#F5F2EB]/55">WhatsApp de contacto</span>
                      Próximamente
                    </span>
                  </span>
                )}
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-1 shrink-0 text-[#C5A059]" />
                <span>
                  <span className="block text-[10px] uppercase tracking-[.2em] text-[#F5F2EB]/60">Horarios</span>
                  Lun a Sáb · 9:00 a 19:00
                </span>
              </li>
            </ul>
          </nav>

          {/* Columna 3 — Políticas */}
          <nav aria-label="Políticas">
            <ColumnTitle>Políticas</ColumnTitle>
            <ul className="mt-6 space-y-3.5 text-sm font-light text-[#F5F2EB]/85">
              {policies.map((policy) => (
                <li key={policy.label}>
                  <span
                    aria-disabled="true"
                    title={`${policy.label} · Próximamente`}
                    className="inline-flex cursor-not-allowed items-center gap-2 text-[#F5F2EB]/75"
                  >
                    <span>{policy.label}</span>
                    <span className="rounded-full border border-[#F5F2EB]/25 px-2 py-0.5 text-[9px] uppercase tracking-[.16em] text-[#D8BC7F]">
                      Próximamente
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 4 — Newsletter */}
          <div>
            <ColumnTitle>Newsletter</ColumnTitle>
            <p className="mt-6 font-display text-xl leading-snug text-[#F5F2EB]">
              Recibe rituales y novedades
            </p>
            <p className="mt-2 text-sm font-light leading-6 text-[#F5F2EB]/75">
              Una carta breve, una vez al mes. Sin ruido, solo intención.
            </p>
            {status === "done" ? (
              <p role="status" className="toast-in mt-5 flex items-center gap-2.5 rounded-xl border border-[#C5A059]/50 bg-[#C5A059]/15 px-4 py-3.5 text-sm text-[#E8E1D5]">
                <Check size={16} className="shrink-0 text-[#C5A059]" />
                ¡Gracias! Recibirás rituales y novedades en tu correo.
              </p>
            ) : (
              <form onSubmit={subscribe} noValidate className="mt-5">
                <label htmlFor="newsletter-email" className="sr-only">
                  Tu correo electrónico
                </label>
                <div className="flex overflow-hidden rounded-xl border border-[#C5A059]/35 bg-[#2A231C] focus-within:border-[#C5A059]">
                  <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setStatus("idle");
                    }}
                    aria-invalid={status === "error"}
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-[#F5F2EB] outline-none placeholder:text-[#F5F2EB]/45"
                  />
                  <button
                    type="submit"
                    aria-label="Suscribirme al newsletter"
                    className="grid w-14 shrink-0 cursor-pointer place-items-center bg-[#C5A059] text-[#1E1914] transition hover:bg-[#D8BC7F]"
                  >
                    <Send size={16} />
                  </button>
                </div>
                {status === "error" && (
                  <p role="alert" className="mt-2 text-xs text-amber-300">
                    Escribe un correo válido para suscribirte.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#F5F2EB]/15 pt-7">
          <p className="text-[11px] uppercase tracking-[.2em] text-[#F5F2EB]/65">
            © 2026 Dharma Kadabra · Un camino hacia ti
          </p>
          {/* Único acceso interno del sitio público: lleva a /login y, tras
              autenticarse, cada rol cae en su propio panel. Los dashboards
              nunca se enlazan desde la vista pública. */}
          <Link
            href="/login"
            className="text-[11px] uppercase tracking-[.2em] text-[#F5F2EB]/60 transition hover:text-[#D8BC7F]"
          >
            Acceso equipo
          </Link>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[.2em] text-[#F5F2EB]/80 transition hover:text-[#D8BC7F]"
          >
            Volver arriba <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}
