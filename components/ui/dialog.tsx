"use client";
import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({ trigger, title, children }: { trigger: ReactNode; title: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">{trigger}</span>
    {open && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#2E231D]/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 text-[#1A1A1A] shadow-[0_32px_90px_-28px_rgba(92,72,48,.35)]">
        <div className="mb-5 flex items-center justify-between border-b border-[#C5A059]/35 pb-3">
          <h2 className="font-display text-xl font-semibold text-[#1A1A1A]">{title}</h2>
          <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="rounded-lg p-2 text-[#2C2C2C]/70 transition hover:bg-[#2C2C2C]/[0.06] hover:text-[#8B6914]">
            <X size={18} />
          </button>
        </div>
        {children(() => setOpen(false))}
      </section>
    </div>}
  </>;
}
