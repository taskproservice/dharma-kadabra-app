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

  return <main className="min-h-screen bg-[#F4ECD8] px-5 py-16 text-[#3E2723]">
    <div className="mx-auto max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#8B6D16] hover:text-[#3E2723]"><ArrowLeft size={15} /> Volver a Dharma Kadabra</Link>
      <section className="mt-8 border border-[#D4AF37]/30 bg-white/55 p-7 shadow-[0_24px_60px_-35px_rgba(62,39,35,.45)] sm:p-9">
        <div className="mb-7 grid size-12 place-items-center rounded-full bg-[#EEE4CF] text-[#8B6D16]"><Sparkles size={22} /></div>
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#8B6D16]">Tu espacio personal</p>
        <h1 className="mt-2 font-display text-4xl">{mode === "login" ? "Qué gusto verte." : "Un espacio para ti."}</h1>
        <p className="mt-3 text-sm leading-6 text-[#3E2723]/65">Consulta tus citas, productos y audios desde un solo lugar.</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#EEE4CF] p-1 text-xs font-semibold"><button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-lg py-2.5 ${mode === "login" ? "bg-[#F4ECD8] shadow-sm" : "text-[#3E2723]/60"}`}>Iniciar sesión</button><button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-lg py-2.5 ${mode === "register" ? "bg-[#F4ECD8] shadow-sm" : "text-[#3E2723]/60"}`}>Crear cuenta</button></div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <>
            <label className="block text-xs font-semibold">Nombre completo<span className="relative mt-1.5 block"><UserRound size={15} className="absolute left-3 top-3 text-[#8B6D16]" /><input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="h-11 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 pl-9 pr-3 text-sm outline-none focus:border-[#D4AF37]" /></span></label>
            <label className="block text-xs font-semibold">Teléfono <span className="font-normal text-[#3E2723]/50">(opcional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+52 664 123 4567" className="mt-1.5 h-11 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 px-3 text-sm outline-none focus:border-[#D4AF37]" /></label>
          </>}
          <label className="block text-xs font-semibold">Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="mt-1.5 h-11 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 px-3 text-sm outline-none focus:border-[#D4AF37]" /></label>
          <label className="block text-xs font-semibold">Contraseña<span className="relative mt-1.5 block"><KeyRound size={15} className="absolute left-3 top-3 text-[#8B6D16]" /><input required type="password" minLength={10} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 10 caracteres" className="h-11 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 pl-9 pr-3 text-sm outline-none focus:border-[#D4AF37]" /></span></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={pending} className="h-12 w-full rounded-xl bg-[#1A1A1A] text-sm font-semibold text-[#F4ECD8] transition hover:bg-[#3E2723] disabled:opacity-60">{pending ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear mi cuenta"}</button>
        </form>
        <p className="mt-5 text-center text-[11px] leading-5 text-[#3E2723]/55">Tus datos se guardan de forma segura. La contraseña se almacena protegida y tu sesión se mantiene privada.</p>
      </section>
    </div>
  </main>;
}
