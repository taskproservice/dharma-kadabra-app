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

            {typing && (
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

            {showSuggestions && !typing && (
              <div className="flex flex-wrap gap-2 pl-9">
                {SUGGESTIONS.map((suggestion) => (
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
        onClick={() => (open ? close() : setOpen(true))}
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
