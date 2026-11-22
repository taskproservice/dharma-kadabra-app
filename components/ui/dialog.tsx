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
    {open && <div className="fixed inset-0 z-[60] grid place-items-center bg-obsidian-deep/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={papyrus ? { colorScheme: "light" } : undefined}
        className={`w-full max-w-lg overflow-y-auto rounded-2xl shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] ${papyrus ? "max-h-[min(90dvh,calc(100dvh-2rem))] border border-gold/30 bg-papyrus p-5 text-ink sm:p-6" : "glass-strong max-h-[90vh] p-6 text-papyrus"}`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-gold/20 pb-3">
          <h2 className={`font-display text-xl font-semibold ${papyrus ? "text-ink" : "text-papyrus"}`}>{title}</h2>
          <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className={`rounded-lg p-2 transition ${papyrus ? "text-ink-muted hover:bg-gold/10 hover:text-ink" : "text-papyrus/60 hover:bg-papyrus/[0.06] hover:text-gold"}`}>
            <X size={18} />
          </button>
        </div>
        {children(() => setOpen(false))}
      </section>
    </div>}
  </>;
}
