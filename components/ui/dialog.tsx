"use client";
import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({ trigger, title, children }: { trigger: ReactNode; title: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">{trigger}</span>
    {open && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#05070d]/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 text-[#e9e2d2] shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)]">
        <div className="mb-5 flex items-center justify-between border-b border-[#c7a45a]/20 pb-3">
          <h2 className="font-display text-xl font-semibold text-[#f7f2e7]">{title}</h2>
          <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="rounded-lg p-2 text-[#e9e2d2]/60 transition hover:bg-white/[0.06] hover:text-[#c7a45a]">
            <X size={18} />
          </button>
        </div>
        {children(() => setOpen(false))}
      </section>
    </div>}
  </>;
}
