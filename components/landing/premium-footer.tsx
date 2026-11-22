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
    <h3 className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.3em] text-[#c7a45a]">
      <span className="h-px w-6 bg-[#c7a45a]/60" />
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
    <footer className="border-t border-[#c7a45a]/18 bg-[#080c16] px-5 pb-10 pt-16 text-[#f7f2e7] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          {/* Columna 1 — Marca */}
          <div>
            <Link href="/" aria-label="Dharma Kadabra · Inicio" className="inline-flex">
              <BrandLogo size={56} />
            </Link>
            <p className="mt-5 max-w-xs font-display text-lg italic leading-relaxed text-[#e9e2d2]/80">
              Un camino hacia ti.
            </p>
            <p className="mt-3 max-w-xs text-sm font-light leading-6 text-[#e9e2d2]/50">
              Sabiduría ancestral para el mundo moderno, con sencillez, amor y profundo respeto por el ritmo de cada alma.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram de Dharma Kadabra"
                className="grid size-10 place-items-center rounded-full border border-[#c7a45a]/30 text-[#e9e2d2]/70 transition hover:border-[#c7a45a] hover:bg-[#c7a45a] hover:text-[#0b1020]"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook de Dharma Kadabra"
                className="grid size-10 place-items-center rounded-full border border-[#c7a45a]/30 text-[#e9e2d2]/70 transition hover:border-[#c7a45a] hover:bg-[#c7a45a] hover:text-[#0b1020]"
              >
                <Facebook size={17} />
              </a>
            </div>
          </div>

          {/* Columna 2 — Atención a clientes */}
          <nav aria-label="Atención a clientes">
            <ColumnTitle>Atención a Clientes</ColumnTitle>
            <ul className="mt-6 space-y-4 text-sm font-light leading-6 text-[#e9e2d2]/60">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-start gap-3 transition hover:text-[#c7a45a]">
                  <Mail size={16} className="mt-1 shrink-0 text-[#c7a45a]/80" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[.2em] text-[#e9e2d2]/40">Email de soporte</span>
                    {SUPPORT_EMAIL}
                  </span>
                </a>
              </li>
              <li>
                <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className="flex items-start gap-3 transition hover:text-[#c7a45a]">
                  <MessageCircle size={16} className="mt-1 shrink-0 text-[#c7a45a]/80" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[.2em] text-[#e9e2d2]/40">WhatsApp de contacto</span>
                    {WHATSAPP_DISPLAY}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-1 shrink-0 text-[#c7a45a]/80" />
                <span>
                  <span className="block text-[10px] uppercase tracking-[.2em] text-[#e9e2d2]/40">Horarios</span>
                  Lun a Sáb · 9:00 a 19:00
                </span>
              </li>
            </ul>
          </nav>

          {/* Columna 3 — Políticas */}
          <nav aria-label="Políticas">
            <ColumnTitle>Políticas</ColumnTitle>
            <ul className="mt-6 space-y-3.5 text-sm font-light text-[#e9e2d2]/60">
              {policies.map((policy) => (
                <li key={policy.href}>
                  <a href={policy.href} className="transition hover:text-[#c7a45a]">
                    {policy.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 4 — Newsletter */}
          <div>
            <ColumnTitle>Newsletter</ColumnTitle>
            <p className="mt-6 font-display text-xl leading-snug text-[#f7f2e7]">
              Recibe rituales y novedades
            </p>
            <p className="mt-2 text-sm font-light leading-6 text-[#e9e2d2]/50">
              Una carta breve, una vez al mes. Sin ruido, solo intención.
            </p>
            {status === "done" ? (
              <p role="status" className="toast-in mt-5 flex items-center gap-2.5 rounded-xl border border-[#c7a45a]/40 bg-[#c7a45a]/10 px-4 py-3.5 text-sm text-[#e3c57c]">
                <Check size={16} className="shrink-0" />
                ¡Gracias! Recibirás rituales y novedades en tu correo.
              </p>
            ) : (
              <form onSubmit={subscribe} noValidate className="mt-5">
                <label htmlFor="newsletter-email" className="sr-only">
                  Tu correo electrónico
                </label>
                <div className="flex overflow-hidden rounded-xl border border-[#c7a45a]/30 bg-white/[0.04] focus-within:border-[#D4AF37]">
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
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-[#f7f2e7] outline-none placeholder:text-[#e9e2d2]/40"
                  />
                  <button
                    type="submit"
                    aria-label="Suscribirme al newsletter"
                    className="grid w-14 shrink-0 place-items-center bg-[#c7a45a] text-[#0b1020] transition hover:bg-[#e3c57c]"
                  >
                    <Send size={16} />
                  </button>
                </div>
                {status === "error" && (
                  <p role="alert" className="mt-2 text-xs text-[#e6a766]">
                    Escribe un correo válido para suscribirte.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#e9e2d2]/10 pt-7">
          <p className="text-[11px] uppercase tracking-[.2em] text-[#e9e2d2]/50">
            © 2026 Dharma Kadabra · Un camino hacia ti
          </p>
          <a href="/#inicio" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[.2em] text-[#e9e2d2]/70 transition hover:text-[#c7a45a]">
            Volver arriba <ArrowUp size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
