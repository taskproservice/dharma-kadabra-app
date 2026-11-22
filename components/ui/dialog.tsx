"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

type DialogProps = {
  trigger: ReactNode;
  title: string;
  children: (close: () => void) => ReactNode;
  appearance?: "night" | "papyrus";
  triggerClassName?: string;
};

export function Dialog({ trigger, title, children, appearance = "night", triggerClassName = "" }: DialogProps) {
  const [open, setOpen] = useState(false);
  const papyrus = appearance === "papyrus";

  return <>
    <span onClick={() => setOpen(true)} className={`inline-flex cursor-pointer ${triggerClassName}`}>{trigger}</span>
    {open && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#05070d]/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={papyrus ? { colorScheme: "light" } : undefined}
        className={`w-full max-w-lg overflow-y-auto rounded-2xl shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] ${papyrus ? "max-h-[min(90dvh,calc(100dvh-2rem))] border border-[#C5A059]/30 bg-[#F4EFE6] p-5 text-[#1A1A1A] sm:p-6" : "glass-strong max-h-[90vh] p-6 text-[#e9e2d2]"}`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-[#c7a45a]/20 pb-3">
          <h2 className={`font-display text-xl font-semibold ${papyrus ? "text-[#1A1A1A]" : "text-[#f7f2e7]"}`}>{title}</h2>
          <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className={`rounded-lg p-2 transition ${papyrus ? "text-[#5B5143] hover:bg-[#C5A059]/10 hover:text-[#1A1A1A]" : "text-[#e9e2d2]/60 hover:bg-white/[0.06] hover:text-[#c7a45a]"}`}>
            <X size={18} />
          </button>
        </div>
        {children(() => setOpen(false))}
      </section>
    </div>}
  </>;
}
