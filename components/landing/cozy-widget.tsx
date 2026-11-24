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
          className="cozy-panel fixed inset-0 z-[55] flex flex-col bg-sanctuary-wood-light text-sanctuary-ink sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-sanctuary-gold/40 shadow-[0_0_30px_rgba(255,115,0,0.18),0_30px_80px_-32px_rgba(80,57,31,.6)]"
          style={{ colorScheme: "light" }}
        >
          {/* Encabezado */}
          <header className="flex items-center gap-3 border-b border-sanctuary-border bg-sanctuary-wood-light px-4 py-3.5 text-sanctuary-ink pt-[max(0.875rem,env(safe-area-inset-top))] sm:pt-3.5">
            <span className="grid size-10 shrink-0 place-items-center bg-transparent">
              <Flame size={22} className="text-[#ff7a1a] cozy-flame-live" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate font-display text-lg leading-tight text-sanctuary-ink">
                Cozy <span className="italic text-sanctuary-gold-leaf">– Tu guía interior</span>
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[.2em] text-sanctuary-ink-soft">
                <span className="size-1.5 rounded-full bg-emerald-600" aria-hidden="true" /> En línea
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar chat con Cozy"
              className="grid size-9 place-items-center rounded-full text-sanctuary-ink-soft transition hover:bg-sanctuary-gold/15 hover:text-sanctuary-ink"
            >
              <X size={18} />
            </button>
          </header>

          {/* Contexto del producto consultado */}
          {productContext && (
            <div className="flex items-center gap-2 border-b border-sanctuary-border/70 bg-sanctuary-wood px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs text-sanctuary-ink-soft">
                <span className="font-semibold text-sanctuary-ink">{productContext.name}</span>
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
                className="grid size-6 shrink-0 place-items-center rounded-full text-sanctuary-ink-soft transition hover:bg-sanctuary-gold/15 hover:text-sanctuary-ink"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Mensajes */}
          <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
            <p className="text-center text-[10px] uppercase tracking-[.25em] text-sanctuary-ink-soft">Hoy</p>
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
                      ? "rounded-2xl rounded-br-sm border border-sanctuary-gold/45 bg-sanctuary-parchment text-sanctuary-ink"
                      : "rounded-2xl rounded-bl-sm border border-sanctuary-border bg-sanctuary-wood-light text-sanctuary-ink"
                  }`}
                >
                  <span className="sr-only">{message.from === "cozy" ? "Cozy dice:" : "Tú dices:"} </span>
                  {message.text}
                  <span className="mt-1 block text-[10px] text-sanctuary-ink-soft">{message.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2" aria-label="Cozy está escribiendo">
                <span className="grid size-7 shrink-0 place-items-center bg-transparent" aria-hidden="true">
                  <Flame size={15} className="text-[#ff7a1a] cozy-flame-live" />
                </span>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-sanctuary-border bg-sanctuary-wood-light px-4 py-3.5">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="size-1.5 animate-bounce rounded-full bg-sanctuary-gold-ink" style={{ animationDelay: `${delay}ms` }} />
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
                    className="rounded-full border border-sanctuary-gold/45 bg-sanctuary-wood-light px-3 py-1.5 text-xs text-sanctuary-gold-ink transition hover:border-sanctuary-gold-ink hover:bg-sanctuary-wood"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transferencia a humano: botón de WhatsApp con Paola */}
          {handoffReady && (
            <div className="border-t border-sanctuary-border bg-sanctuary-wood-light px-4 py-3">
              <p className="text-center text-xs text-sanctuary-ink-soft">
                ¿Prefieres hablar con Paola, nuestra asesora?
              </p>
              {whatsappReady ? (
                <a
                  href={handoffUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp con Paola para confirmar tu compra"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-obsidian transition hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
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
                  className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-sanctuary-gold/40 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-sanctuary-ink-soft opacity-80"
                >
                  <MessageCircle size={15} className="shrink-0" aria-hidden="true" />
                  <span>WhatsApp · Próximamente</span>
                </button>
              )}
            </div>
          )}

          {/* Hablar con un asesor humano (siempre visible hasta transferir) */}
          {!handoffReady && (
            <div className="bg-sanctuary-wood-light px-4 pb-1 pt-2">
              <button
                type="button"
                onClick={requestHuman}
                className="w-full text-center text-[11px] font-medium text-sanctuary-gold-ink underline-offset-4 transition hover:text-sanctuary-ink hover:underline"
              >
                Hablar con un asesor humano
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-sanctuary-border bg-sanctuary-wood px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            <label htmlFor={`${titleId}-input`} className="sr-only">Escribe tu mensaje para Cozy</label>
            <input
              ref={inputRef}
              id={`${titleId}-input`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe lo que sientes…"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-full border border-sanctuary-gold/40 bg-sanctuary-wood-light px-4 text-sm text-sanctuary-ink outline-none placeholder:text-sanctuary-ink-soft focus:border-sanctuary-gold-ink focus:ring-2 focus:ring-sanctuary-gold/25"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-obsidian transition hover:bg-gold-bright disabled:opacity-40"
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
        className={`fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full border border-sanctuary-gold/45 bg-sanctuary-wood-light/95 shadow-[0_14px_34px_-18px_rgba(80,57,31,.7)] backdrop-blur-sm transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sanctuary-gold-ink ${open ? "max-sm:hidden" : ""}`}
      >
        {open ? (
          <X className="h-6 w-6 text-sanctuary-gold-ink" />
        ) : (
          <Flame
            className="h-8 w-8 text-[#ff7a1a] cozy-flame-live"
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
