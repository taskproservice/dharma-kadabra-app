"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Sparkles, UserRound } from "lucide-react";

export function CustomerAuthForm({ callbackUrl = "" }: { callbackUrl?: string }) {
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
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return <main className="min-h-screen bg-obsidian px-5 py-16 text-papyrus">
    <div className="mx-auto max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-gold hover:text-papyrus"><ArrowLeft size={15} /> Volver a Dharma Kadabra</Link>
      <section className="glass-panel mt-8 overflow-hidden p-7 sm:p-9">
        <div className="mb-7 grid size-12 place-items-center rounded-full border border-gold/25 bg-obsidian-soft text-gold"><Sparkles size={22} /></div>
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-gold">Tu espacio personal</p>
        <h1 className="mt-2 font-display text-4xl text-papyrus">{mode === "login" ? "Qué gusto verte." : "Un espacio para ti."}</h1>
        <p className="mt-3 text-sm leading-6 text-papyrus/55">Consulta tus citas, productos y audios desde un solo lugar.</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl border border-gold/18 bg-obsidian-deep p-1 text-xs font-semibold"><button type="button" onClick={() => { setMode("login"); setError(""); }} className={`cursor-pointer rounded-lg py-2.5 transition ${mode === "login" ? "bg-obsidian-soft text-gold shadow-sm" : "text-papyrus/55 hover:text-papyrus"}`}>Iniciar sesión</button><button type="button" onClick={() => { setMode("register"); setError(""); }} className={`cursor-pointer rounded-lg py-2.5 transition ${mode === "register" ? "bg-obsidian-soft text-gold shadow-sm" : "text-papyrus/55 hover:text-papyrus"}`}>Crear cuenta</button></div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <>
            <label className="block text-xs font-semibold text-papyrus">Nombre completo<span className="relative mt-1.5 block"><UserRound size={15} className="absolute left-3 top-3 text-gold" /><input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="field-dark h-11 pl-9 pr-3" /></span></label>
            <label className="block text-xs font-semibold text-papyrus">Teléfono <span className="font-normal text-papyrus/40">(opcional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+52 664 123 4567" className="field-dark mt-1.5 h-11 px-3" /></label>
          </>}
          <label className="block text-xs font-semibold text-papyrus">Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="field-dark mt-1.5 h-11 px-3" /></label>
          <label className="block text-xs font-semibold text-papyrus">Contraseña<span className="relative mt-1.5 block"><KeyRound size={15} className="absolute left-3 top-3 text-gold" /><input required type="password" minLength={10} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 10 caracteres" className="field-dark h-11 pl-9 pr-3" /></span></label>
          {error && <p role="alert" className="rounded-lg border border-red-400/35 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={pending} className="h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-gold-light via-gold to-gold-bright text-sm font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-60">{pending ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear mi cuenta"}</button>
        </form>
        <p className="mt-5 text-center text-[11px] leading-5 text-papyrus/45">Tus datos se guardan de forma segura. La contraseña se almacena protegida y tu sesión se mantiene privada.</p>
      </section>
    </div>
  </main>;
}
