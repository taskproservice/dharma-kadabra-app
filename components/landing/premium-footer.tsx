"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Check, Clock, Facebook, Instagram, Mail, MessageCircle, Send } from "lucide-react";
import { BrandLogo } from "./brand-logo";

const SUPPORT_EMAIL = "hola@dharmakadabra.mx";
const WHATSAPP_DISPLAY = "+52 55 1234 5678";
const WHATSAPP_HREF = "https://wa.me/525512345678";

const policies = [
  { label: "Aviso de privacidad", href: "#privacidad" },
  { label: "Términos y condiciones", href: "#terminos" },
  { label: "Política de envíos", href: "#envios" },
];

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.3em] text-[#D4AF37]">
      <span className="h-px w-6 bg-[#D4AF37]/60" />
      {children}
    </h3>
  );
}

export function PremiumFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

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
    <footer className="border-t border-[#D4AF37]/20 bg-[#141414] px-5 pb-10 pt-16 text-[#F4ECD8] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          {/* Columna 1 — Marca */}
          <div>
            <Link href="#inicio" aria-label="Dharma Kadabra · Inicio" className="inline-flex">
              <BrandLogo size={56} />
            </Link>
            <p className="mt-5 max-w-xs font-display text-lg italic leading-relaxed text-[#F4ECD8]/85">
              Un camino hacia ti.
            </p>
            <p className="mt-3 max-w-xs text-sm font-light leading-6 text-[#F4ECD8]/60">
              Sabiduría ancestral para el mundo moderno, con sencillez, amor y profundo respeto por el ritmo de cada alma.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram de Dharma Kadabra"
                className="grid size-10 place-items-center rounded-full border border-[#D4AF37]/30 text-[#F4ECD8]/80 transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A]"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook de Dharma Kadabra"
                className="grid size-10 place-items-center rounded-full border border-[#D4AF37]/30 text-[#F4ECD8]/80 transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A]"
              >
                <Facebook size={17} />
              </a>
            </div>
          </div>

          {/* Columna 2 — Atención a clientes */}
          <nav aria-label="Atención a clientes">
            <ColumnTitle>Atención a Clientes</ColumnTitle>
            <ul className="mt-6 space-y-4 text-sm font-light leading-6 text-[#F4ECD8]/75">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-start gap-3 transition hover:text-[#D4AF37]">
                  <Mail size={16} className="mt-1 shrink-0 text-[#D4AF37]/80" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[.2em] text-[#F4ECD8]/50">Email de soporte</span>
                    {SUPPORT_EMAIL}
                  </span>
                </a>
              </li>
              <li>
                <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className="flex items-start gap-3 transition hover:text-[#D4AF37]">
                  <MessageCircle size={16} className="mt-1 shrink-0 text-[#D4AF37]/80" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[.2em] text-[#F4ECD8]/50">WhatsApp de contacto</span>
                    {WHATSAPP_DISPLAY}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-1 shrink-0 text-[#D4AF37]/80" />
                <span>
                  <span className="block text-[10px] uppercase tracking-[.2em] text-[#F4ECD8]/50">Horarios</span>
                  Lun a Sáb · 9:00 a 19:00
                </span>
              </li>
            </ul>
          </nav>

          {/* Columna 3 — Políticas */}
          <nav aria-label="Políticas">
            <ColumnTitle>Políticas</ColumnTitle>
            <ul className="mt-6 space-y-3.5 text-sm font-light text-[#F4ECD8]/75">
              {policies.map((policy) => (
                <li key={policy.href}>
                  <a href={policy.href} className="transition hover:text-[#D4AF37]">
                    {policy.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 4 — Newsletter */}
          <div>
            <ColumnTitle>Newsletter</ColumnTitle>
            <p className="mt-6 font-display text-xl leading-snug text-[#F4ECD8]">
              Recibe rituales y novedades
            </p>
            <p className="mt-2 text-sm font-light leading-6 text-[#F4ECD8]/60">
              Una carta breve, una vez al mes. Sin ruido, solo intención.
            </p>
            {status === "done" ? (
              <p role="status" className="toast-in mt-5 flex items-center gap-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-3.5 text-sm text-[#E6C766]">
                <Check size={16} className="shrink-0" />
                ¡Gracias! Recibirás rituales y novedades en tu correo.
              </p>
            ) : (
              <form onSubmit={subscribe} noValidate className="mt-5">
                <label htmlFor="newsletter-email" className="sr-only">
                  Tu correo electrónico
                </label>
                <div className="flex overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-white/[0.04] focus-within:border-[#D4AF37]">
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
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-[#F4ECD8] outline-none placeholder:text-[#F4ECD8]/35"
                  />
                  <button
                    type="submit"
                    aria-label="Suscribirme al newsletter"
                    className="grid w-14 shrink-0 place-items-center bg-[#D4AF37] text-[#1A1A1A] transition hover:bg-[#E6C766]"
                  >
                    <Send size={16} />
                  </button>
                </div>
                {status === "error" && (
                  <p role="alert" className="mt-2 text-xs text-[#E6A766]">
                    Escribe un correo válido para suscribirte.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#F4ECD8]/10 pt-7">
          <p className="text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/60">
            © 2026 Dharma Kadabra · Un camino hacia ti
          </p>
          <a href="#inicio" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[.2em] text-[#F4ECD8]/80 transition hover:text-[#D4AF37]">
            Volver arriba <ArrowUp size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
