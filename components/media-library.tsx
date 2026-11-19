"use client";
import { useRef, useState } from "react";
import { FileAudio, FileVideo, MoreHorizontal, Play, Plus, Search, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

type MediaKind = "audio" | "video";
const demo = {
  audio: [
    { title: "Meditación de arraigo", detail: "12:48 · Meditaciones", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", icon: "☼" },
    { title: "Respiración consciente", detail: "08:32 · Bienestar", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", icon: "◌" },
    { title: "Ritual de luna nueva", detail: "16:05 · Rituales", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", icon: "☾" },
  ],
  video: [
    { title: "Conoce las runas", detail: "04:32 · Sabiduría ancestral", src: "https://www.w3schools.com/html/mov_bbb.mp4", icon: "ᚱ" },
    { title: "Ritual de intención", detail: "06:18 · Rituales", src: "https://www.w3schools.com/html/movie.mp4", icon: "✧" },
    { title: "Preparación para tu sesión", detail: "03:45 · Guías", src: "https://www.w3schools.com/html/mov_bbb.mp4", icon: "☼" },
  ],
};

export function MediaLibrary({ kind }: { kind: MediaKind }) {
  const isAudio = kind === "audio"; const picker = useRef<HTMLInputElement>(null); const [query, setQuery] = useState(""); const [uploaded, setUploaded] = useState<File[]>([]);
  const entries = demo[kind].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-7xl space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-[#9A7B28]">Tu espacio creativo</p><h1 className="mt-1 text-3xl font-semibold">Biblioteca de {isAudio ? "audio" : "video"}</h1><p className="mt-2 text-[#3E2723]/60">Organiza y reproduce tus {isAudio ? "pistas y meditaciones" : "videos y recursos visuales"}.</p></div><Button onClick={() => picker.current?.click()}><Upload size={16}/>Subir {isAudio ? "audio" : "video"}</Button><input ref={picker} type="file" accept={isAudio ? "audio/*" : "video/*"} multiple className="hidden" onChange={(event) => setUploaded((list) => [...list, ...Array.from(event.target.files ?? [])])}/></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="relative w-full max-w-sm"><Search size={16} className="absolute left-3 top-3 text-[#3E2723]/40"/><Input className="pl-9" placeholder="Buscar en tu biblioteca..." value={query} onChange={(e) => setQuery(e.target.value)}/></div><span className="text-sm text-[#3E2723]/55">{entries.length + uploaded.length} elementos</span></div>
    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{entries.map((item) => <Card key={item.title} className="overflow-hidden"><div className={`relative grid h-40 place-items-center bg-gradient-to-br from-[#E8DCC0] to-[#D4AF37]/25 ${isAudio ? "" : ""}`}>{isAudio ? <span className="text-6xl text-[#9A7B28]">{item.icon}</span> : <video className="h-full w-full object-cover" src={item.src} controls preload="none" aria-label={item.title} />}{isAudio && <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-[#3E2723] text-[#D4AF37]"><Play size={18} fill="currentColor"/></span>}</div><div className="p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="font-semibold">{item.title}</h2><p className="mt-1 text-xs text-[#3E2723]/55">{item.detail}</p></div><button aria-label="Más opciones" className="rounded-lg p-1.5 hover:bg-black/5"><MoreHorizontal size={18}/></button></div>{isAudio && <audio className="h-9 w-full accent-[#9A7B28]" src={item.src} controls preload="none" aria-label={`Reproducir ${item.title}`}/>}</div></Card>)}
      {uploaded.map((file, index) => <Card key={`${file.name}-${index}`} className="p-5"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-xl bg-[#D4AF37]/15 text-[#9A7B28]">{isAudio ? <FileAudio/> : <FileVideo/>}</span><div className="min-w-0"><p className="truncate font-semibold">{file.name}</p><p className="text-xs text-[#3E2723]/55">Archivo recién agregado · {(file.size / 1024 / 1024).toFixed(1)} MB</p></div></div>{isAudio ? <audio className="mt-4 w-full" controls src={URL.createObjectURL(file)}/> : <video className="mt-4 w-full rounded-lg" controls src={URL.createObjectURL(file)}/>}</Card>)}
      {!entries.length && !uploaded.length && <div className="col-span-full rounded-2xl border border-dashed border-[#3E2723]/20 py-16 text-center text-sm text-[#3E2723]/55">No se encontraron elementos.</div>}
    </div><div className="flex items-center gap-2 text-xs text-[#3E2723]/50"><Plus size={14}/>Los archivos seleccionados se muestran localmente en esta sesión de demostración.</div>
  </div>;
}
