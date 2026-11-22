"use client";

import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

export function StoreErrorPanel({
  title = "No pudimos cargar la tienda",
  message,
  detail,
  onRetry,
}: {
  title?: string;
  message: string;
  detail?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative mx-auto grid max-w-2xl place-items-center overflow-hidden rounded-2xl border border-[#C5A059]/45 bg-[#FCFAF5] px-6 py-14 text-center shadow-[0_20px_50px_-24px_rgba(92,72,48,0.18)] sm:px-12"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.18),transparent_70%)] blur-2xl"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-xl border border-[#C5A059]/20" />

      <span className="relative grid size-12 place-items-center rounded-full border border-[#C5A059]/50 bg-[#C5A059]/15 text-[#8B6914]">
        <TriangleAlert size={20} strokeWidth={1.5} />
      </span>
      <h2 className="relative mt-6 font-display text-3xl leading-tight text-[#1A1A1A] sm:text-4xl">{title}</h2>
      <p className="relative mt-4 max-w-md text-sm font-light leading-7 text-[#2C2C2C]/80">{message}</p>
      {detail ? (
        <p className="relative mt-3 max-w-md text-[11px] leading-5 text-[#2C2C2C]/55">{detail}</p>
      ) : null}

      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#C5A059] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[.24em] text-[#1A1A1A] shadow-[0_14px_34px_-16px_rgba(92,72,48,.35)] transition hover:bg-[#b58e45]"
          >
            <RefreshCw size={14} className="transition group-hover:rotate-180" />
            Reintentar
          </button>
        ) : (
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#C5A059] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[.24em] text-[#1A1A1A] shadow-[0_14px_34px_-16px_rgba(92,72,48,.35)] transition hover:bg-[#b58e45]"
          >
            <RefreshCw size={14} className="transition group-hover:rotate-180" />
            Volver a intentar
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#2C2C2C]/30 bg-transparent px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[.24em] text-[#1A1A1A] transition hover:border-[#C5A059] hover:bg-[#C5A059]/12"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
