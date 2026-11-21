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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1020] px-5 py-16 text-[#e9e2d2]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/2 top-[-12rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(199,164,90,.16),transparent_68%)] blur-3xl" />
        <span className="absolute bottom-[-16rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(28,36,56,.9),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.18em] text-[#d8bc7f]/80 transition hover:text-[#e3c57c]">
          <ArrowLeft size={14} /> Volver a Dharma Kadabra
        </Link>

        <section className="glass-panel mt-8 overflow-hidden p-7 sm:p-9">
          <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e3c57c]/70 to-transparent" />

          <div className="relative mx-auto w-fit">
            <span aria-hidden="true" className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(199,164,90,.35),transparent_65%)] blur-lg" />
            <Image src="/images/logo.png" alt="Dharma Kadabra" width={76} height={76} priority className="relative object-contain drop-shadow-[0_0_18px_rgba(216,188,127,.45)]" />
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[.26em] text-[#c7a45a]">
            <Lock size={11} /> Acceso del equipo
          </p>
          <h1 className="mt-2 text-center font-display text-3xl text-[#f7f2e7]">Panel Dharma Kadabra</h1>
          <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-[#e9e2d2]/55">
            Inicia sesión con tu cuenta de colaboradora, soporte o administración.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-[11px] font-semibold uppercase tracking-[.14em] text-[#e9e2d2]/70">
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
            <label className="block text-[11px] font-semibold uppercase tracking-[.14em] text-[#e9e2d2]/70">
              Contraseña
              <span className="relative mt-1.5 block">
                <KeyRound size={15} className="absolute left-3 top-3.5 text-[#c7a45a]/70" />
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
            {error && <p role="alert" className="rounded-lg border border-red-400/35 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <button
              disabled={pending}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] text-[11px] font-semibold uppercase tracking-[.2em] text-[#0b1020] shadow-[0_16px_40px_-18px_rgba(199,164,90,.8)] transition hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Verificando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-5 text-[#e9e2d2]/45">
            ¿Eres cliente? Entra a <Link href="/mi-cuenta" className="text-[#d8bc7f] underline underline-offset-4 hover:text-[#e3c57c]">Mi Cuenta</Link>.
          </p>
        </section>

        <p className="mt-6 text-center font-display text-xs italic text-[#e9e2d2]/35">Conecta · Transforma · Armoniza</p>
      </div>
    </main>
  );
}
