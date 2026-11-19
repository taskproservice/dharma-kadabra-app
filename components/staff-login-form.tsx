"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, Flame, KeyRound } from "lucide-react";

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

  return <main className="min-h-screen bg-[#F4ECD8] px-5 py-16 text-[#3E2723]">
    <div className="mx-auto max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#8B6D16] hover:text-[#3E2723]"><ArrowLeft size={15} /> Volver a Dharma Kadabra</Link>
      <section className="mt-8 border border-[#D4AF37]/30 bg-white/55 p-7 shadow-[0_24px_60px_-35px_rgba(62,39,35,.45)] sm:p-9">
        <div className="mb-7 grid size-12 place-items-center text-[#FF7300]"><Flame size={30} className="cozy-flame-live" /></div>
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#8B6D16]">Acceso del equipo</p>
        <h1 className="mt-2 font-display text-4xl">Panel Dharma Kadabra</h1>
        <p className="mt-3 text-sm leading-6 text-[#3E2723]/65">Inicia sesión con tu cuenta de colaboradora, soporte o administración.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold">Correo electrónico<input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="equipo@dharmakadabra.com" className="mt-1.5 h-11 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 px-3 text-sm outline-none focus:border-[#D4AF37]" /></label>
          <label className="block text-xs font-semibold">Contraseña<span className="relative mt-1.5 block"><KeyRound size={15} className="absolute left-3 top-3 text-[#8B6D16]" /><input required type="password" maxLength={128} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 pl-9 pr-3 text-sm outline-none focus:border-[#D4AF37]" /></span></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={pending} className="h-12 w-full rounded-xl bg-[#1A1A1A] text-sm font-semibold text-[#F4ECD8] transition hover:bg-[#3E2723] disabled:opacity-60">{pending ? "Verificando…" : "Iniciar sesión"}</button>
        </form>
        <p className="mt-5 text-center text-[11px] leading-5 text-[#3E2723]/55">¿Eres cliente? Entra a <Link href="/mi-cuenta" className="underline underline-offset-4">Mi Cuenta</Link>.</p>
      </section>
    </div>
  </main>;
}
