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
 * - Panel de chat Papiro Premium: pantalla completa en móvil, ventana flotante en escritorio.
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
  const whatsappReady = whatsappNumber.replace(/\D/g, "").length >= 10;
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
          className="cozy-panel fixed inset-0 z-[55] flex flex-col bg-[#0b1020] text-[#e9e2d2] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[#c7a45a]/35 shadow-[0_0_30px_rgba(255,115,0,0.22),0_30px_90px_-30px_rgba(0,0,0,.9)] sm:backdrop-blur-2xl"
        >
          {/* Encabezado */}
          <header className="flex items-center gap-3 border-b border-[#c7a45a]/25 bg-[#080c16]/95 px-4 py-3.5 text-[#f7f2e7] pt-[max(0.875rem,env(safe-area-inset-top))] sm:pt-3.5">
            <span className="grid size-10 shrink-0 place-items-center bg-transparent">
              <Flame size={22} className="text-[#ff7a1a] cozy-flame-live" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate font-display text-lg leading-tight">
                Cozy <span className="italic text-[#c7a45a]">– Tu guía interior</span>
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[.2em] text-[#e9e2d2]/50">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> En línea
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar chat con Cozy"
              className="grid size-9 place-items-center rounded-full text-[#e9e2d2]/60 transition hover:bg-white/[0.08] hover:text-[#e3c57c]"
            >
              <X size={18} />
            </button>
          </header>

          {/* Contexto del producto consultado */}
          {productContext && (
            <div className="flex items-center gap-2 border-b border-[#c7a45a]/15 bg-[#c7a45a]/[0.07] px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs text-[#e9e2d2]/80">
                <span className="font-semibold text-[#f7f2e7]">{productContext.name}</span>
                {" · "}
                {productContext.category}
                {" · "}
                {formatPrice(productContext.price, productContext.currency)}
                {productContext.availability === "out_of_stock" && (
                  <span className="ml-2 rounded-full bg-[#D96538]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.15em] text-[#f0a37e]">
                    Agotado
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={clearProductContext}
                aria-label="Quitar contexto del producto"
                className="grid size-6 shrink-0 place-items-center rounded-full text-[#e9e2d2]/50 transition hover:bg-white/[0.08] hover:text-[#e3c57c]"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Mensajes */}
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
            <p className="text-center text-[10px] uppercase tracking-[.25em] text-[#e9e2d2]/35">Hoy</p>
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2 ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                {message.from === "cozy" && (
                  <span className="grid size-7 shrink-0 place-items-center bg-transparent" aria-hidden="true">
                    <Flame size={15} className="text-[#ff7a1a] cozy-flame-live" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-6 shadow-sm ${
                    message.from === "user"
                      ? "rounded-2xl rounded-br-sm border border-[#c7a45a]/40 bg-[#c7a45a]/15 text-[#f7f2e7]"
                      : "rounded-2xl rounded-bl-sm border border-[#c7a45a]/20 bg-white/[0.05] text-[#e9e2d2]"
                  }`}
                >
                  <span className="sr-only">{message.from === "cozy" ? "Cozy dice:" : "Tú dices:"} </span>
                  {message.text}
                  <span className={`mt-1 block text-[10px] ${message.from === "user" ? "text-[#f7f2e7]/50" : "text-[#e9e2d2]/35"}`}>{message.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2" aria-label="Cozy está escribiendo">
                <span className="grid size-7 shrink-0 place-items-center bg-transparent" aria-hidden="true">
                  <Flame size={15} className="text-[#ff7a1a] cozy-flame-live" />
                </span>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-[#c7a45a]/20 bg-white/[0.05] px-4 py-3.5">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="size-1.5 animate-bounce rounded-full bg-[#d8bc7f]/70" style={{ animationDelay: `${delay}ms` }} />
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
                    className="rounded-full border border-[#c7a45a]/35 px-3 py-1.5 text-xs text-[#d8bc7f] transition hover:border-[#c7a45a] hover:bg-[#c7a45a]/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transferencia a humano: botón de WhatsApp con Paola */}
          {handoffReady && (
            <div className="border-t border-[#c7a45a]/20 bg-[#080c16]/90 px-4 py-3">
              <p className="text-center text-xs text-[#e9e2d2]/70">
                ¿Prefieres hablar con Paola, nuestra asesora?
              </p>
              {whatsappReady ? (
                <a
                  href={handoffUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp con Paola para confirmar tu compra"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-[#062b16] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                >
                  <MessageCircle size={15} className="shrink-0" aria-hidden="true" />
                  <span>Abrir WhatsApp con Paola</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Próximamente"
                  className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#c7a45a]/40 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-[#e9e2d2]/50 opacity-75"
                >
                  <MessageCircle size={15} className="shrink-0" aria-hidden="true" />
                  <span>WhatsApp próximamente</span>
                </button>
              )}
            </div>
          )}

          {/* Hablar con un asesor humano (siempre visible hasta transferir) */}
          {!handoffReady && (
            <div className="bg-[#080c16]/90 px-4 pb-1 pt-2">
              <button
                type="button"
                onClick={requestHuman}
                className="w-full text-center text-[11px] font-medium text-[#d8bc7f]/80 underline-offset-4 transition hover:text-[#e3c57c] hover:underline"
              >
                Hablar con un asesor humano
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-[#c7a45a]/20 bg-[#080c16]/90 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            <label htmlFor={`${titleId}-input`} className="sr-only">Escribe tu mensaje para Cozy</label>
            <input
              ref={inputRef}
              id={`${titleId}-input`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe lo que sientes…"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-full border border-[#c7a45a]/25 bg-[#11182b] px-4 text-sm text-[#f7f2e7] outline-none placeholder:text-[#e9e2d2]/35 focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/25"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[#c7a45a] text-[#0b1020] transition hover:bg-[#e3c57c] disabled:opacity-40"
            >
              <SendHorizontal size={17} />
            </button>
          </form>
        </section>
      )}

      {/* Botón de Acción Flotante: Solo el ícono de la llama, sin fondo ni recuadro */}
      <button
        ref={fabRef}
        type="button"
        onClick={toggle}
        aria-label={open ? "Cerrar chat con Cozy" : "Abrir chat con Cozy, tu guía interior"}
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center bg-transparent border-0 shadow-none p-0 text-[#ff7a1a] transition-transform duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7a45a] ${open ? "max-sm:hidden" : ""}`}
      >
        {open ? (
          <X className="w-10 h-10 text-[#ff7a1a] filter drop-shadow-[0_0_15px_rgba(255,115,0,0.8)]" />
        ) : (
          <Flame
            className="h-16 w-16 text-[#ff7a1a] cozy-flame-live"
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
