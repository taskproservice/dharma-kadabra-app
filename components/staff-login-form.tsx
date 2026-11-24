"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSession, signIn } from "next-auth/react";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import { DASHBOARD_HOME_BY_ROLE, parseRole } from "../lib/rbac-config";

/**
 * Login del equipo · Premium Orgánico.
 * Fondo beige, tarjeta blanca rounded-3xl con sombra suave, campos limpios y
 * botón de acción en Café Oscuro.
 */
export function StaffLoginForm({ callbackUrl, hasError }: { callbackUrl: string | null; hasError: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(hasError ? "No fue posible iniciar sesión. Inténtalo de nuevo." : "");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await signIn("staff", { email, password, redirect: false, callbackUrl: callbackUrl ?? "/dashboard" });
      if (!result || result.error) throw new Error("Correo o contraseña incorrectos.");
      // Sin callbackUrl explícito, cada rol entra directo a su panel:
      // Admin → /dashboard/admin, Ingeniería → /dashboard/ingenieria, etc.
      let target = callbackUrl;
      if (!target) {
        const session = await getSession().catch(() => null);
        const role = parseRole(session?.user?.role);
        target = role ? DASHBOARD_HOME_BY_ROLE[role] : "/dashboard";
      }
      window.location.assign(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inténtalo de nuevo.");
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-papyrus px-5 py-16 text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/2 top-[-12rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.10),transparent_68%)] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.18em] text-bronze transition hover:text-ink">
          <ArrowLeft size={14} /> Volver a Dharma Kadabra
        </Link>

        <section className="relative mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-9">
          <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <div className="relative mx-auto w-fit">
            <span aria-hidden="true" className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.18),transparent_65%)] blur-lg" />
            <Image src="/images/logo.png" alt="Dharma Kadabra" width={76} height={76} sizes="76px" priority className="relative object-contain drop-shadow-[0_0_12px_rgba(197,160,89,.35)]" />
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[.26em] text-bronze">
            <Lock size={11} /> Acceso del equipo
          </p>
          <h1 className="mt-2 text-center font-display text-3xl text-ink">Panel Dharma Kadabra</h1>
          <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-ink-muted">
            Inicia sesión con tu cuenta de colaboradora, soporte o administración.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-[11px] font-semibold uppercase tracking-[.14em] text-sanctuary-ink-soft">
              Correo electrónico
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="equipo@dharmakadabra.com"
                className="field-light mt-1.5 h-11"
              />
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-[.14em] text-sanctuary-ink-soft">
              Contraseña
              <span className="relative mt-1.5 block">
                <KeyRound size={15} className="absolute left-3 top-3 text-bronze/70" />
                <input
                  required
                  type="password"
                  maxLength={128}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-light h-11 pl-9"
                />
              </span>
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={pending}
              className="h-12 w-full cursor-pointer rounded-xl bg-ink text-[11px] font-semibold uppercase tracking-[.2em] text-papyrus transition hover:bg-[#3D3226] disabled:opacity-60"
            >
              {pending ? "Verificando…" : "Iniciar Sesión"}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-5 text-ink-muted">
            ¿Eres cliente? Entra a <Link href="/mi-cuenta" className="text-bronze underline underline-offset-4 transition hover:text-ink">Mi Cuenta</Link>.
          </p>
        </section>

        <p className="mt-6 text-center font-display text-xs italic text-ink-muted/70">Conecta · Transforma · Armoniza</p>
      </div>
    </main>
  );
}
