"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Flame, MessageCircle, SendHorizontal, X } from "lucide-react";
import { useCozyStore } from "../../stores/cozy";
import { STORE_WHATSAPP } from "../../modules/holistic-store/constants";
import { buildHandoffWhatsAppUrl, formatPrice } from "../../modules/holistic-store/utils";

const SUGGESTIONS = ["Talismanes maestros", "Registros akáshicos", "Agendar una sesión"];

const PRODUCT_SUGGESTIONS = ["¿Haces envíos?", "¿Cómo cuido esta pieza?", "¿Qué energía tiene?"];

/**
 * Widget flotante de Cozy (la llama) — embudo de ventas de la tienda.
 * - FAB fijo en la esquina inferior derecha con resplandor dorado animado.
 * - Panel de chat Santuario de Lujo (Papiro #F4EFE6): pantalla completa en móvil, ventana flotante en escritorio.
 * - Recibe el contexto del producto desde el store global (`productContext`)
 *   cuando el visitante hace clic en "Preguntar a Cozy" de una tarjeta.
 * - "Hablar con un asesor humano" (o la detección de frustración) muestra el
 *   botón de WhatsApp con Paola y el mensaje pre-escrito de transferencia.
 */
export function CozyWidget() {
  const open = useCozyStore((state) => state.isOpen);
  const messages = useCozyStore((state) => state.messages);
  const isTyping = useCozyStore((state) => state.isTyping);
  const productContext = useCozyStore((state) => state.productContext);
  const handoffReady = useCozyStore((state) => state.handoffReady);
  const toggle = useCozyStore((state) => state.toggle);
  const close = useCozyStore((state) => state.close);
  const sendMessage = useCozyStore((state) => state.sendMessage);
  const requestHuman = useCozyStore((state) => state.requestHuman);
  const clearProductContext = useCozyStore((state) => state.clearProductContext);

  const [draft, setDraft] = useState("");
  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const whatsappNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? STORE_WHATSAPP;
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");
  const whatsappReady =
    whatsappDigits.length >= 10 &&
    !whatsappDigits.endsWith("1234567") &&
    !whatsappDigits.endsWith("12345678");
  const handoffUrl = buildHandoffWhatsAppUrl(productContext, whatsappNumber);

  // Escape para cerrar, foco en el input al abrir y bloqueo de scroll en móvil (pantalla completa).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  // Desplaza al último mensaje.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, open]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setDraft("");
    void sendMessage(clean);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft);
  };

  const showSuggestions = !messages.some((message) => message.from === "user");
  const suggestions = productContext ? PRODUCT_SUGGESTIONS : SUGGESTIONS;

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="cozy-panel fixed inset-0 z-[55] flex flex-col overflow-hidden rounded-none bg-[#F4EFE6] text-[#2C241B] shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[390px] sm:rounded-2xl sm:border sm:border-[#C5A059]/30"
          style={{ colorScheme: "light" }}
        >
          {/* Encabezado Santuario de Lujo */}
          <header className="flex items-center gap-3.5 border-b border-[#C5A059]/25 bg-gradient-to-r from-[#EAD7C3] to-[#F4EFE6] px-4 py-3.5 text-[#2C241B] pt-[max(0.875rem,env(safe-area-inset-top))] sm:px-5 sm:py-4 sm:pt-4">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-white/55 shadow-[0_0_16px_rgba(197,160,89,0.22)] ring-1 ring-[#C5A059]/35">
              <Flame size={28} strokeWidth={1.6} className="text-[#ff7a1a] cozy-flame-live" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate font-cormorant text-[22px] font-semibold leading-tight tracking-[0.01em] text-[#2C241B]">
                Cozy <span className="font-normal italic text-[#805F2B]">- Tu guía interior</span>
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[.22em] text-[#6B5D4A]">
                <span className="size-1.5 rounded-full bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.45)]" aria-hidden="true" /> En línea
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar chat con Cozy"
              className="grid size-9 place-items-center rounded-full text-[#514333] transition hover:bg-[#C5A059]/15 hover:text-[#2C241B]"
            >
              <X size={18} />
            </button>
          </header>

          {/* Contexto del producto consultado */}
          {productContext && (
            <div className="flex items-center gap-2 border-b border-[#C5A059]/20 bg-[#EFE6D8] px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs text-[#514333]">
                <span className="font-semibold text-[#2C241B]">{productContext.name}</span>
                {" · "}
                {productContext.category}
                {" · "}
                {formatPrice(productContext.price, productContext.currency)}
                {productContext.availability === "out_of_stock" && (
                  <span className="ml-2 rounded-full bg-ember/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.15em] text-ember">
                    Agotado
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={clearProductContext}
                aria-label="Quitar contexto del producto"
                className="grid size-6 shrink-0 place-items-center rounded-full text-[#514333] transition hover:bg-[#C5A059]/20 hover:text-[#2C241B]"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Mensajes */}
          <div ref={listRef} className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#F4EFE6] px-4 py-5" aria-live="polite">
            <p className="text-center text-[10px] font-medium uppercase tracking-[.26em] text-[#805F2B]/75">Hoy</p>
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2.5 ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                {message.from === "cozy" && (
                  <span className="mb-1 grid size-7 shrink-0 place-items-center bg-transparent" aria-hidden="true">
                    <Flame size={16} className="text-[#ff7a1a] cozy-flame-live" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 text-[#2C241B] ${
                    message.from === "user"
                      ? "bg-[#D8C8B4] shadow-[0_2px_10px_rgba(44,36,27,0.06)]"
                      : "border border-[#C5A059]/15 bg-white shadow-[0_4px_16px_rgba(44,36,27,0.05)]"
                  }`}
                >
                  <span className="sr-only">{message.from === "cozy" ? "Cozy dice:" : "Tú dices:"} </span>
                  {message.text}
                  <span className={`mt-1.5 block text-[10px] ${message.from === "user" ? "text-right text-[#514333]/80" : "text-[#6B5D4A]/80"}`}>
                    {message.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2.5" aria-label="Cozy está escribiendo">
                <span className="mb-1 grid size-7 shrink-0 place-items-center bg-transparent" aria-hidden="true">
                  <Flame size={16} className="text-[#ff7a1a] cozy-flame-live" />
                </span>
                <div className="flex gap-1.5 rounded-2xl border border-[#C5A059]/15 bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(44,36,27,0.05)]">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="size-1.5 animate-bounce rounded-full bg-[#C5A059]" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && !isTyping && (
              <div className="flex flex-wrap gap-2 pl-9">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="cursor-pointer rounded-full border border-[#C5A059]/45 bg-white px-3.5 py-1.5 text-xs font-medium text-[#2C241B] shadow-[0_2px_8px_rgba(44,36,27,0.04)] transition-all duration-200 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#2C241B] hover:shadow-[0_4px_12px_rgba(197,160,89,0.3)]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transferencia a humano: botón de WhatsApp con Paola */}
          {handoffReady && (
            <div className="border-t border-[#C5A059]/20 bg-[#EFE6D8]/75 px-4 py-3">
              <p className="text-center text-xs text-[#514333]">
                ¿Prefieres hablar con Paola, nuestra asesora?
              </p>
              {whatsappReady ? (
                <a
                  href={handoffUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp con Paola para confirmar tu compra"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-[#2C241B] shadow-[0_4px_14px_rgba(197,160,89,0.3)] transition hover:bg-[#D8BC7F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]"
                >
                  <MessageCircle size={15} className="shrink-0" aria-hidden="true" />
                  <span>Abrir WhatsApp con Paola</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="WhatsApp comercial directo · Próximamente"
                  className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#C5A059]/35 bg-white/60 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-[#514333] opacity-80"
                >
                  <MessageCircle size={15} className="shrink-0" aria-hidden="true" />
                  <span>WhatsApp · Próximamente</span>
                </button>
              )}
            </div>
          )}

          {/* Hablar con un asesor humano (siempre visible hasta transferir) */}
          {!handoffReady && (
            <div className="bg-[#F4EFE6] px-4 pb-1.5 pt-1">
              <button
                type="button"
                onClick={requestHuman}
                className="w-full cursor-pointer text-center text-[11px] font-medium text-[#805F2B] underline-offset-4 transition hover:text-[#2C241B] hover:underline"
              >
                Hablar con un asesor humano
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="flex items-center gap-2.5 border-t border-[#C5A059]/20 bg-[#F4EFE6] px-3.5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3.5">
            <label htmlFor={`${titleId}-input`} className="sr-only">Escribe tu mensaje para Cozy</label>
            <input
              ref={inputRef}
              id={`${titleId}-input`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe lo que sientes…"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-full border border-[#C5A059]/30 bg-white px-4 text-sm text-[#2C241B] shadow-[inset_0_1px_2px_rgba(44,36,27,0.04)] outline-none transition placeholder:text-[#6B5D4A]/70 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/25"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#C5A059] text-[#2C241B] shadow-[0_4px_12px_rgba(197,160,89,0.35)] transition hover:bg-[#D8BC7F] hover:shadow-[0_6px_16px_rgba(197,160,89,0.45)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
            >
              <SendHorizontal size={17} strokeWidth={1.85} />
            </button>
          </form>
        </section>
      )}

      {/* Botón de Acción Flotante: Solo la silueta de la flama, sin círculo ni fondo */}
      <button
        ref={fabRef}
        type="button"
        onClick={toggle}
        aria-label={open ? "Cerrar chat con Cozy" : "Abrir chat con Cozy, tu guía interior"}
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center bg-transparent p-0 transition-transform duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059] ${open ? "max-sm:hidden" : ""}`}
      >
        {open ? (
          <X className="h-8 w-8 text-[#2C241B] drop-shadow-[0_2px_8px_rgba(244,239,230,0.9)]" />
        ) : (
          <Flame
            className="h-16 w-16 text-[#ff7a1a] cozy-flame-live"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
