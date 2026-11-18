"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: Message = {
  role: "assistant",
  content: "Hola, soy Cozy. Estoy aquí para acompañarte y acercarte a las piezas de Dharma Kadabra. ¿Qué te gustaría descubrir?",
};

export function CozyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const conversation = [...messages, { role: "user" as const, content }];
    setMessages(conversation);
    setDraft("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        reply?: unknown;
        error?: unknown;
      };

      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Cozy no pudo responder en este momento.");
      }
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("Cozy no recibió una respuesta. Inténtalo de nuevo en un momento.");
      }

      setMessages((current) => [...current, { role: "assistant", content: result.reply as string }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible conectar con Cozy. Inténtalo de nuevo.";
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="cozy-widget" id="cozy">
      {isOpen && (
        <section id="cozy-panel" className="cozy-panel" role="dialog" aria-modal="false" aria-labelledby="cozy-title">
          <header className="cozy-panel-header">
            <div className="cozy-avatar" aria-hidden="true"><span className="mini-flame" /></div>
            <div className="cozy-heading">
              <h2 id="cozy-title">Cozy</h2>
              <p><span className="online-dot" /> En línea</p>
            </div>
            <button className="cozy-close" type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </header>

          <div className="cozy-intro">
            <span>UN ESPACIO PARA TI</span>
            <p>Conversaciones con intención, siempre con calidez.</p>
          </div>

          <div className="cozy-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Mensajes con Cozy">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role === "user" ? "from-user" : "from-cozy"}`} key={`${index}-${message.role}`}>
                {message.role === "assistant" && <span className="message-avatar" aria-hidden="true">✦</span>}
                <p>{message.content}</p>
              </div>
            ))}
            {isSending && (
              <div className="chat-message from-cozy typing-message" aria-label="Cozy está escribiendo">
                <span className="message-avatar" aria-hidden="true">✦</span>
                <p><span /><span /><span /></p>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <form className="cozy-composer" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="cozy-message">Escribe un mensaje para Cozy</label>
            <input
              ref={inputRef}
              id="cozy-message"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe tu mensaje..."
              maxLength={4000}
              autoComplete="off"
              disabled={isSending}
            />
            <button type="submit" disabled={isSending || !draft.trim()} aria-label="Enviar mensaje">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-5.5 16-2.8-6.7L4 12Z" /><path d="m11.7 13.3 4.1-4.1" /></svg>
            </button>
          </form>
          <p className="cozy-disclaimer">Cozy puede equivocarse. Para detalles de tus pedidos, consulta directamente con el equipo.</p>
        </section>
      )}

      <button
        className={`cozy-fab${isOpen ? " is-open" : ""}`}
        type="button"
        aria-label={isOpen ? "Cerrar chat con Cozy" : "Abrir chat con Cozy"}
        aria-expanded={isOpen}
        aria-controls="cozy-panel"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flame-icon" aria-hidden="true">
          <span className="flame-layer flame-outer" />
          <span className="flame-layer flame-middle" />
          <span className="flame-layer flame-core" />
          <i className="flame-spark spark-one" />
          <i className="flame-spark spark-two" />
        </span>
        <span className="sr-only">Cozy, asistente en línea</span>
      </button>
    </div>
  );
}
