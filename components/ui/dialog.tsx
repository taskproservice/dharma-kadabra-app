"use client";
import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({ trigger, title, children }: { trigger: ReactNode; title: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">{trigger}</span>
    {open && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#211410]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-2xl border border-white/70 bg-[#F4ECD8] p-6 text-[#3E2723] shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-black/5"><X size={18} /></button></div>
        {children(() => setOpen(false))}
      </section>
    </div>}
  </>;
}
