"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Sparkles, UserRound } from "lucide-react";

export function CustomerAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/customer-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, name, email, phone, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No fue posible acceder a tu cuenta.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  const inputBase =
    "h-11 w-full rounded-xl border border-[#C5A059]/45 bg-[#FCFAF5] text-sm text-[#1A1A1A] outline-none placeholder:text-[#2C2C2C]/45 focus:border-[#9E7B2F] focus:ring-2 focus:ring-[#C5A059]/25";

  return <main className="min-h-screen bg-[#F4EFE6] px-5 py-16 text-[#1A1A1A]">
    <div className="mx-auto max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B6914] transition hover:text-[#1A1A1A]"><ArrowLeft size={15} /> Volver a Dharma Kadabra</Link>
      <section className="mt-8 glass-panel overflow-hidden p-7 sm:p-9">
        <div className="mb-7 grid size-12 place-items-center rounded-full border border-[#C5A059]/50 bg-[#C5A059]/15 text-[#9E7B2F]"><Sparkles size={22} /></div>
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#8B6914]">Tu espacio personal</p>
        <h1 className="mt-2 font-display text-4xl text-[#1A1A1A]">{mode === "login" ? "Qué gusto verte." : "Un espacio para ti."}</h1>
        <p className="mt-3 text-sm leading-6 text-[#2C2C2C]/75">Consulta tus citas, productos y audios desde un solo lugar.</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl border border-[#C5A059]/35 bg-[#EDE5D7] p-1 text-xs font-semibold">
          <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-lg py-2.5 transition ${mode === "login" ? "bg-[#FCFAF5] text-[#1A1A1A] shadow-sm" : "text-[#2C2C2C]/65 hover:text-[#1A1A1A]"}`}>Iniciar sesión</button>
          <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-lg py-2.5 transition ${mode === "register" ? "bg-[#FCFAF5] text-[#1A1A1A] shadow-sm" : "text-[#2C2C2C]/65 hover:text-[#1A1A1A]"}`}>Crear cuenta</button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <>
            <label className="block text-xs font-semibold text-[#1A1A1A]">Nombre completo<span className="relative mt-1.5 block"><UserRound size={15} className="absolute left-3 top-3 text-[#9E7B2F]" /><input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={`${inputBase} pl-9 pr-3`} /></span></label>
            <label className="block text-xs font-semibold text-[#1A1A1A]">Teléfono <span className="font-normal text-[#2C2C2C]/55">(opcional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+52 664 123 4567" className={`mt-1.5 px-3 ${inputBase}`} /></label>
          </>}
          <label className="block text-xs font-semibold text-[#1A1A1A]">Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={`mt-1.5 px-3 ${inputBase}`} /></label>
          <label className="block text-xs font-semibold text-[#1A1A1A]">Contraseña<span className="relative mt-1.5 block"><KeyRound size={15} className="absolute left-3 top-3 text-[#9E7B2F]" /><input required type="password" minLength={10} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 10 caracteres" className={`${inputBase} pl-9 pr-3`} /></span></label>
          {error && <p role="alert" className="rounded-lg border border-red-600/30 bg-red-500/10 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={pending} className="h-12 w-full rounded-xl bg-[#C5A059] text-sm font-semibold text-[#1A1A1A] shadow-[0_14px_34px_-16px_rgba(92,72,48,.35)] transition hover:bg-[#b58e45] disabled:opacity-60">{pending ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear mi cuenta"}</button>
        </form>
        <p className="mt-5 text-center text-[11px] leading-5 text-[#2C2C2C]/65">Tus datos se guardan de forma segura. La contraseña se almacena protegida y tu sesión se mantiene privada.</p>
      </section>
    </div>
  </main>;
}
