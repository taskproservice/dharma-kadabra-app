"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";

export function StaffLoginForm({ callbackUrl, hasError }: { callbackUrl: string; hasError: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(hasError ? "No fue posible iniciar sesión. Inténtalo de nuevo." : "");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await signIn("staff", { email, password, redirect: false, callbackUrl });
      if (!result || result.error) throw new Error("Correo o contraseña incorrectos.");
      window.location.assign(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inténtalo de nuevo.");
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4EFE6] px-5 py-16 text-[#1A1A1A]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/2 top-[-12rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.22),transparent_68%)] blur-3xl" />
        <span className="absolute bottom-[-16rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.14),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#8B6914] transition hover:text-[#1A1A1A]">
          <ArrowLeft size={14} /> Volver a Dharma Kadabra
        </Link>

        <section className="glass-panel mt-8 overflow-hidden p-7 sm:p-9">
          <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />

          <div className="relative mx-auto w-fit">
            <span aria-hidden="true" className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.28),transparent_65%)] blur-lg" />
            <Image src="/images/logo.png" alt="Dharma Kadabra" width={76} height={76} priority className="relative object-contain drop-shadow-[0_4px_14px_rgba(92,72,48,.22)]" />
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[.26em] text-[#8B6914]">
            <Lock size={11} /> Acceso del equipo
          </p>
          <h1 className="mt-2 text-center font-display text-3xl text-[#1A1A1A]">Panel Dharma Kadabra</h1>
          <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-[#2C2C2C]/75">
            Inicia sesión con tu cuenta de colaboradora, soporte o administración.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-[11px] font-semibold uppercase tracking-[.14em] text-[#2C2C2C]/80">
              Correo electrónico
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="equipo@dharmakadabra.com"
                className="field-dark mt-1.5 h-11"
              />
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-[.14em] text-[#2C2C2C]/80">
              Contraseña
              <span className="relative mt-1.5 block">
                <KeyRound size={15} className="absolute left-3 top-3.5 text-[#9E7B2F]" />
                <input
                  required
                  type="password"
                  maxLength={128}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-dark h-11 pl-9"
                />
              </span>
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-600/30 bg-red-500/10 p-3 text-sm text-red-800">{error}</p>}
            <button
              disabled={pending}
              className="h-12 w-full rounded-xl bg-[#C5A059] text-[11px] font-bold uppercase tracking-[.2em] text-[#1A1A1A] shadow-[0_14px_34px_-16px_rgba(92,72,48,.38)] transition hover:bg-[#b58e45] disabled:opacity-60"
            >
              {pending ? "Verificando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-5 text-[#2C2C2C]/65">
            ¿Eres cliente? Entra a <Link href="/mi-cuenta" className="font-semibold text-[#8B6914] underline underline-offset-4 hover:text-[#1A1A1A]">Mi Cuenta</Link>.
          </p>
        </section>

        <p className="mt-6 text-center font-display text-xs italic text-[#2C2C2C]/55">Conecta · Transforma · Armoniza</p>
      </div>
    </main>
  );
}
