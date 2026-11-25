"use client";
import { useEffect, useRef, useState } from "react";
import { Flame, MessageCircle, Paperclip, Send, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

type Message = { id: number; role: "assistant" | "user"; text: string; time: string };
const initial: Message[] = [
  { id: 1, role: "assistant", text: "¡Hola, Paola! ✨ Qué alegría tenerte por aquí. ¿En qué puedo acompañarte hoy?", time: "10:24" },
  { id: 2, role: "user", text: "Ayúdame a preparar una intención para mi círculo de luna nueva.", time: "10:25" },
  { id: 3, role: "assistant", text: "Claro. Para la luna nueva podemos crear un espacio para sembrar aquello que quieres invitar a tu vida. Te propongo esta intención: “Me abro con confianza a nuevos comienzos. Honro mi camino y doy la bienvenida a lo que nutre mi propósito”. ¿Te gustaría que la hagamos más personal?", time: "10:25" },
];
const conversations = ["Círculo de luna nueva", "Ritual de intención", "Ideas para contenido", "Bienestar y descanso"];
const INSPIRATIONS = [
  "Ayúdame a redactar una intención para la próxima Luna Llena.",
  "Sugiere tres preguntas conscientes para abrir una lectura de runas.",
  "Propón un mensaje cálido de seguimiento post-sesión para mis consultantes.",
];
export default function CozyPage() {
  const [messages, setMessages] = useState(initial); const [text, setText] = useState(""); const [active, setActive] = useState(conversations[0]); const [inspIndex, setInspIndex] = useState(0); const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => scroll.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  const send = (event: React.FormEvent) => { event.preventDefault(); const value = text.trim(); if (!value) return; const now = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }); setMessages((list) => [...list, { id: Date.now(), role: "user", text: value, time: now }]); setText(""); window.setTimeout(() => setMessages((list) => [...list, { id: Date.now() + 1, role: "assistant", text: "Gracias por compartirlo conmigo. ✨ Cuéntame un poquito más y encontraremos juntas una intención que resuene contigo.", time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) }]), 650); };
  const handleInspire = () => {
    setText(INSPIRATIONS[inspIndex % INSPIRATIONS.length]);
    setInspIndex((n) => n + 1);
  };
  return <div className="-mx-4 -my-6 flex sm:-mx-6 lg:-mx-8 lg:-my-8 h-[calc(100vh-68px)] min-h-[560px] overflow-hidden rounded-none bg-papyrus/[0.025]"><aside className="hidden w-72 shrink-0 border-r border-gold/14 bg-obsidian-soft/75 p-5 md:block"><div className="mb-7 flex items-center gap-3"><span className="grid size-10 place-items-center bg-transparent text-[#FF7300]"><Flame size={26} className="text-[#FF7300] cozy-flame-live"/></span><div><h1 className="font-semibold text-papyrus">Cozy</h1><p className="text-xs text-papyrus/45">Tu compañera de camino</p></div></div><Button className="mb-6 w-full" variant="outline" onClick={() => { setActive("Nueva conversación"); setMessages([{ id: Date.now(), role: "assistant", text: "Estoy aquí para escucharte. ¿Qué tienes en mente?", time: "Ahora" }]); }}><MessageCircle size={16}/>Nueva conversación</Button><p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-papyrus/35">Recientes</p><nav className="space-y-1">{conversations.map((conversation) => <button key={conversation} type="button" onClick={() => setActive(conversation)} className={`w-full cursor-pointer truncate rounded-xl px-3 py-2.5 text-left text-sm ${active === conversation ? "bg-papyrus/[0.05] font-medium text-papyrus" : "text-papyrus/70 hover:bg-papyrus/[0.04]"}`}><MessageCircle size={14} className="mr-2 inline opacity-50"/>{conversation}</button>)}</nav></aside>
    <section className="flex min-w-0 flex-1 flex-col"><header className="flex items-center justify-between border-b border-gold/14 bg-obsidian-soft/75 px-5 py-4 sm:px-8"><div><p className="text-sm font-semibold text-papyrus">{active}</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400"/>Cozy está aquí para ti</p></div><Button type="button" variant="ghost" size="sm" onClick={handleInspire}><Sparkles size={16}/>Inspirarme</Button></header>
      <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-8">{messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>{message.role === "assistant" && <span className="mt-1 grid size-8 shrink-0 place-items-center bg-transparent text-[#FF7300]"><Flame size={18} className="text-[#FF7300] cozy-flame-live"/></span>}<div className={`max-w-[min(80%,640px)] rounded-2xl px-4 py-3 ${message.role === "user" ? "rounded-br-sm border border-gold/40 bg-gold/15 text-papyrus" : "rounded-bl-sm border border-gold/20 bg-papyrus/[0.05]"}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p><p className={`mt-2 text-right text-[10px] ${message.role === "user" ? "text-papyrus/55" : "text-papyrus/40"}`}>{message.time}</p></div></div>)}<div ref={scroll}/></div>
      <form onSubmit={send} className="border-t border-gold/14 bg-papyrus/[0.03] p-4 sm:px-8 sm:py-5"><div className="mx-auto flex max-w-4xl items-center gap-2 rounded-2xl border border-gold/18 bg-obsidian-soft/70 p-2"><button type="button" disabled aria-disabled="true" aria-label="Adjuntar archivo (Próximamente)" title="Adjuntar archivo · Próximamente" className="cursor-not-allowed rounded-lg p-2 text-papyrus/30 opacity-50"><Paperclip size={18}/></button><Input value={text} onChange={(e) => setText(e.target.value)} className="h-11 border-0 bg-transparent shadow-none focus:ring-0" placeholder="Escribe tu mensaje a Cozy..."/><Button type="submit" size="sm" aria-label="Enviar mensaje" className="size-10 rounded-xl p-0"><Send size={17}/></Button></div><p className="mt-2 text-center text-[10px] text-papyrus/35">Cozy es una asistente virtual. Las respuestas en este panel interno son de demostración.</p></form>
    </section></div>;
}
