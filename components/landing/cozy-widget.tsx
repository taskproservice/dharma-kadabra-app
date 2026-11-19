"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Flame, SendHorizontal, X } from "lucide-react";

type Message = { id: number; from: "cozy" | "user"; text: string; time: string };

// Datos de ejemplo: bienvenida simulada mientras se conecta el agente real.
const WELCOME: Message[] = [
  { id: 1, from: "cozy", text: "Hola, alma bonita. Soy Cozy, la llama que te acompaña en Dharma Kadabra. 🔥", time: "Ahora" },
  { id: 2, from: "cozy", text: "Estoy aquí para escucharte y ayudarte a encontrar el talismán, la lectura o el ritual que tu camino necesita hoy.", time: "Ahora" },
  { id: 3, from: "cozy", text: "¿Qué te gustaría explorar?", time: "Ahora" },
];

const SUGGESTIONS = ["Talismanes maestros", "Registros akáshicos", "Agendar una sesión"];

const SAMPLE_REPLY =
  "Gracias por compartirlo conmigo. Respira profundo: muy pronto podré guiarte paso a paso. Mientras tanto, puedes comenzar tu prueba gratis y conocer a nuestras guías.";

function now() {
  return new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

/**
 * Widget flotante de Cozy (la llama).
 * - FAB fijo en la esquina inferior derecha con resplandor dorado animado.
 * - Panel de chat Papiro Premium: pantalla completa en móvil, ventana flotante en escritorio.
 */
export function CozyWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(WELCOME);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const nextId = useRef(WELCOME.length + 1);

  const close = () => {
    setOpen(false);
    fabRef.current?.focus();
  };

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
  }, [open]);

  // Desplaza al último mensaje.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => () => { if (replyTimer.current) clearTimeout(replyTimer.current); }, []);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { id: nextId.current++, from: "user", text: clean, time: now() }]);
    setDraft("");
    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      setMessages((current) => [...current, { id: nextId.current++, from: "cozy", text: SAMPLE_REPLY, time: now() }]);
    }, 1200);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft);
  };

  const showSuggestions = !messages.some((message) => message.from === "user");

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="cozy-panel fixed inset-0 z-[55] flex flex-col bg-[#F4ECD8] text-[#3E2723] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[#D4AF37]/40 sm:shadow-[0_30px_80px_-20px_rgba(26,26,26,.55)]"
        >
          {/* Encabezado */}
          <header className="flex items-center gap-3 border-b border-[#D4AF37]/30 bg-[#1A1A1A] px-4 py-3.5 text-[#F4ECD8] pt-[max(0.875rem,env(safe-area-inset-top))] sm:pt-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#D4AF37]/70 bg-[#D4AF37]/10">
              <Flame size={18} className="text-[#D4AF37]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate font-display text-lg leading-tight">
                Cozy <span className="italic text-[#D4AF37]">– Tu guía interior</span>
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[.2em] text-[#F4ECD8]/55">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> En línea
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar chat con Cozy"
              className="grid size-9 place-items-center rounded-full text-[#F4ECD8]/70 transition hover:bg-white/10 hover:text-[#D4AF37]"
            >
              <X size={18} />
            </button>
          </header>

          {/* Mensajes */}
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
            <p className="text-center text-[10px] uppercase tracking-[.25em] text-[#3E2723]/40">Hoy</p>
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2 ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                {message.from === "cozy" && (
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#D4AF37]/20" aria-hidden="true">
                    <Flame size={13} className="text-[#D4AF37]" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-6 shadow-sm ${
                    message.from === "user"
                      ? "rounded-2xl rounded-br-sm bg-[#3E2723] text-[#F4ECD8]"
                      : "rounded-2xl rounded-bl-sm border border-[#D4AF37]/25 bg-white/70 text-[#3E2723]"
                  }`}
                >
                  <span className="sr-only">{message.from === "cozy" ? "Cozy dice:" : "Tú dices:"} </span>
                  {message.text}
                  <span className={`mt-1 block text-[10px] ${message.from === "user" ? "text-[#F4ECD8]/50" : "text-[#3E2723]/40"}`}>{message.time}</span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-end gap-2" aria-label="Cozy está escribiendo">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#D4AF37]/20" aria-hidden="true">
                  <Flame size={13} className="text-[#D4AF37]" />
                </span>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-[#D4AF37]/25 bg-white/70 px-4 py-3.5">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="size-1.5 animate-bounce rounded-full bg-[#8B6D16]/70" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && !typing && (
              <div className="flex flex-wrap gap-2 pl-9">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-[#8B6D16]/35 px-3 py-1.5 text-xs text-[#8B6D16] transition hover:border-[#8B6D16] hover:bg-[#D4AF37]/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-[#3E2723]/10 bg-[#EFE4CB] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            <label htmlFor={`${titleId}-input`} className="sr-only">Escribe tu mensaje para Cozy</label>
            <input
              ref={inputRef}
              id={`${titleId}-input`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe lo que sientes…"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-full border border-[#3E2723]/15 bg-white/80 px-4 text-sm text-[#3E2723] outline-none placeholder:text-[#3E2723]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[#3E2723] text-[#F4ECD8] transition hover:bg-[#55362f] disabled:opacity-40"
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
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? "Cerrar chat con Cozy" : "Abrir chat con Cozy, tu guía interior"}
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center p-2 text-[#D4AF37] transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${open ? "max-sm:hidden" : ""}`}
      >
        {open ? (
          <X className="w-10 h-10 text-[#D4AF37] filter drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" />
        ) : (
          <Flame
            className="w-10 h-10 text-[#D4AF37] filter drop-shadow-[0_0_20px_rgba(212,175,55,0.6)] animate-pulse"
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
