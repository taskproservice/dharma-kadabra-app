"use client";

import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Pantalla de error elegante de la tienda pública.
 *
 * Se muestra cuando la base de datos no responde o el catálogo aún no está
 * inicializado. Nunca expone detalles técnicos: ofrece un mensaje humano,
 * el detalle corto enviado por el servidor (si existe) y dos salidas claras.
 */
export function StoreErrorPanel({
  title = "No pudimos cargar la tienda",
  message,
  detail,
  onRetry,
}: {
  title?: string;
  message: string;
  /** Pista corta y segura enviada por el servidor (opcional). */
  detail?: string | null;
  /** Si se define, muestra el botón "Reintentar" en lugar del enlace. */
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative mx-auto grid max-w-2xl place-items-center overflow-hidden rounded-3xl border border-stone-200 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:px-12"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.14),transparent_70%)] blur-2xl"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-2xl border border-gold/20" />

      <span className="relative grid size-12 place-items-center rounded-full border border-gold/40 bg-gold/10 text-bronze">
        <TriangleAlert size={20} strokeWidth={1.5} />
      </span>
      <h2 className="relative mt-6 font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      <p className="relative mt-4 max-w-md text-sm font-light leading-7 text-ink-muted">{message}</p>
      {detail ? (
        <p className="relative mt-3 max-w-md text-[11px] leading-5 text-ink-muted/60">{detail}</p>
      ) : null}

      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-bright px-7 py-3.5 text-[11px] font-bold uppercase tracking-[.24em] text-ink shadow-[0_16px_44px_-20px_rgba(197,160,89,.8)] transition hover:brightness-110"
          >
            <RefreshCw size={14} className="transition group-hover:rotate-180" />
            Reintentar
          </button>
        ) : (
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-bright px-7 py-3.5 text-[11px] font-bold uppercase tracking-[.24em] text-ink shadow-[0_16px_44px_-20px_rgba(197,160,89,.8)] transition hover:brightness-110"
          >
            <RefreshCw size={14} className="transition group-hover:rotate-180" />
            Volver a intentar
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[.24em] text-sanctuary-ink-soft transition hover:border-gold hover:bg-gold/10 hover:text-bronze"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
