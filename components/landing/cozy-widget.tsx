"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Flame, MessageCircle, SendHorizontal, X } from "lucide-react";
import { useCozyStore } from "../../stores/cozy";
import { STORE_WHATSAPP } from "../../modules/holistic-store/constants";
import { buildHandoffWhatsAppUrl, formatPrice } from "../../modules/holistic-store/utils";

const SUGGESTIONS = ["Talismanes maestros", "Registros akáshicos", "Agendar una sesión"];

const PRODUCT_SUGGESTIONS = ["¿Haces envíos?", "¿Cómo cuido esta pieza?", "¿Qué energía tiene?"];

/**
 * Widget flotante de Cozy (la llama) — embudo de ventas de la tienda · Tema Papyrus.
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
          className="cozy-panel fixed inset-0 z-[55] flex flex-col bg-[#F4EFE6] text-[#1A1A1A] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[#C5A059]/55 shadow-[0_24px_70px_-24px_rgba(92,72,48,.35)] sm:backdrop-blur-2xl"
        >
          {/* Encabezado */}
          <header className="flex items-center gap-3 border-b border-[#C5A059]/35 bg-[#FCFAF5] px-4 py-3.5 text-[#1A1A1A] pt-[max(0.875rem,env(safe-area-inset-top))] sm:pt-3.5">
            <span className="grid size-10 shrink-0 place-items-center bg-transparent">
              <Flame size={22} className="text-[#e2641b] cozy-flame-live" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate font-display text-lg leading-tight text-[#1A1A1A]">
                Cozy <span className="italic text-[#9E7B2F]">– Tu guía interior</span>
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[.2em] text-[#2C2C2C]/65">
                <span className="size-1.5 rounded-full bg-emerald-600" aria-hidden="true" /> En línea
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar chat con Cozy"
              className="grid size-9 place-items-center rounded-full text-[#2C2C2C]/70 transition hover:bg-[#2C2C2C]/[0.06] hover:text-[#1A1A1A]"
            >
              <X size={18} />
            </button>
          </header>

          {/* Contexto del producto consultado */}
          {productContext && (
            <div className="flex items-center gap-2 border-b border-[#C5A059]/25 bg-[#C5A059]/12 px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs text-[#2C2C2C]/85">
                <span className="font-semibold text-[#1A1A1A]">{productContext.name}</span>
                {" · "}
                {productContext.category}
                {" · "}
                {formatPrice(productContext.price, productContext.currency)}
                {productContext.availability === "out_of_stock" && (
                  <span className="ml-2 rounded-full bg-[#D96538]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.15em] text-[#B54B22]">
                    Agotado
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={clearProductContext}
                aria-label="Quitar contexto del producto"
                className="grid size-6 shrink-0 place-items-center rounded-full text-[#2C2C2C]/60 transition hover:bg-[#2C2C2C]/[0.08] hover:text-[#1A1A1A]"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Mensajes */}
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
            <p className="text-center text-[10px] uppercase tracking-[.25em] text-[#2C2C2C]/55">Hoy</p>
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2 ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                {message.from === "cozy" && (
                  <span className="grid size-7 shrink-0 place-items-center bg-transparent" aria-hidden="true">
                    <Flame size={15} className="text-[#e2641b] cozy-flame-live" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-6 shadow-[0_4px_14px_-6px_rgba(92,72,48,0.12)] ${
                    message.from === "user"
                      ? "rounded-2xl rounded-br-sm border border-[#C5A059] bg-[#C5A059]/25 text-[#1A1A1A]"
                      : "rounded-2xl rounded-bl-sm border border-[#C5A059]/35 bg-[#FCFAF5] text-[#2C2C2C]"
                  }`}
                >
                  <span className="sr-only">{message.from === "cozy" ? "Cozy dice:" : "Tú dices:"} </span>
                  {message.text}
                  <span className={`mt-1 block text-[10px] ${message.from === "user" ? "text-[#1A1A1A]/60" : "text-[#2C2C2C]/50"}`}>{message.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2" aria-label="Cozy está escribiendo">
                <span className="grid size-7 shrink-0 place-items-center bg-transparent" aria-hidden="true">
                  <Flame size={15} className="text-[#e2641b] cozy-flame-live" />
                </span>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-[#C5A059]/35 bg-[#FCFAF5] px-4 py-3.5">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="size-1.5 animate-bounce rounded-full bg-[#9E7B2F]" style={{ animationDelay: `${delay}ms` }} />
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
                    className="rounded-full border border-[#C5A059]/55 bg-[#FCFAF5] px-3 py-1.5 text-xs font-medium text-[#8B6914] transition hover:border-[#9E7B2F] hover:bg-[#C5A059]/18"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transferencia a humano: botón de WhatsApp con Paola */}
          {handoffReady && (
            <div className="border-t border-[#C5A059]/30 bg-[#FCFAF5] px-4 py-3">
              <p className="text-center text-xs text-[#2C2C2C]/80">
                ¿Prefieres hablar con Paola, nuestra asesora?
              </p>
              {whatsappReady ? (
                <a
                  href={handoffUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp con Paola para confirmar tu compra"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-[#062b16] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
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
                  className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#C5A059]/50 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.18em] text-[#2C2C2C]/55 opacity-75"
                >
                  <MessageCircle size={15} className="shrink-0" aria-hidden="true" />
                  <span>WhatsApp próximamente</span>
                </button>
              )}
            </div>
          )}

          {/* Hablar con un asesor humano */}
          {!handoffReady && (
            <div className="bg-[#FCFAF5] px-4 pb-1 pt-2">
              <button
                type="button"
                onClick={requestHuman}
                className="w-full text-center text-[11px] font-semibold text-[#8B6914] underline-offset-4 transition hover:text-[#1A1A1A] hover:underline"
              >
                Hablar con un asesor humano
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-[#C5A059]/30 bg-[#FCFAF5] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            <label htmlFor={`${titleId}-input`} className="sr-only">Escribe tu mensaje para Cozy</label>
            <input
              ref={inputRef}
              id={`${titleId}-input`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe lo que sientes…"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-full border border-[#C5A059]/45 bg-[#F4EFE6] px-4 text-sm text-[#1A1A1A] outline-none placeholder:text-[#2C2C2C]/45 focus:border-[#9E7B2F] focus:ring-2 focus:ring-[#C5A059]/25"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[#C5A059] text-[#1A1A1A] transition hover:bg-[#b58e45] disabled:opacity-40"
            >
              <SendHorizontal size={17} />
            </button>
          </form>
        </section>
      )}

      {/* Botón de Acción Flotante: Solo el ícono de la llama */}
      <button
        ref={fabRef}
        type="button"
        onClick={toggle}
        aria-label={open ? "Cerrar chat con Cozy" : "Abrir chat con Cozy, tu guía interior"}
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center bg-transparent border-0 shadow-none p-0 text-[#e2641b] transition-transform duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E7B2F] ${open ? "max-sm:hidden" : ""}`}
      >
        {open ? (
          <X className="w-10 h-10 text-[#1A1A1A] filter drop-shadow-[0_2px_10px_rgba(92,72,48,0.3)]" />
        ) : (
          <Flame
            className="h-16 w-16 text-[#e2641b] cozy-flame-live"
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
