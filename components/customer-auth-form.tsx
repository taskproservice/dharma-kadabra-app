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

  return <main className="min-h-screen bg-[#0b1020] px-5 py-16 text-[#e9e2d2]">
    <div className="mx-auto max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#d8bc7f] hover:text-[#e9e2d2]"><ArrowLeft size={15} /> Volver a Dharma Kadabra</Link>
      <section className="mt-8 glass-panel overflow-hidden p-7 sm:p-9 sm:p-9">
        <div className="mb-7 grid size-12 place-items-center rounded-full bg-[#151d31] text-[#d8bc7f]"><Sparkles size={22} /></div>
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#d8bc7f]">Tu espacio personal</p>
        <h1 className="mt-2 font-display text-4xl">{mode === "login" ? "Qué gusto verte." : "Un espacio para ti."}</h1>
        <p className="mt-3 text-sm leading-6 text-[#e9e2d2]/55">Consulta tus citas, productos y audios desde un solo lugar.</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#151d31] p-1 text-xs font-semibold"><button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-lg py-2.5 ${mode === "login" ? "bg-[#11182b] shadow-sm" : "text-[#e9e2d2]/55"}`}>Iniciar sesión</button><button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-lg py-2.5 ${mode === "register" ? "bg-[#11182b] shadow-sm" : "text-[#e9e2d2]/55"}`}>Crear cuenta</button></div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <>
            <label className="block text-xs font-semibold">Nombre completo<span className="relative mt-1.5 block"><UserRound size={15} className="absolute left-3 top-3 text-[#d8bc7f]" /><input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="h-11 w-full rounded-xl border border-[#c7a45a]/18 bg-[#11182b]/80 pl-9 pr-3 text-sm outline-none focus:border-[#c7a45a]" /></span></label>
            <label className="block text-xs font-semibold">Teléfono <span className="font-normal text-[#e9e2d2]/40">(opcional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+52 664 123 4567" className="mt-1.5 h-11 w-full rounded-xl border border-[#c7a45a]/18 bg-[#11182b]/80 px-3 text-sm outline-none focus:border-[#c7a45a]" /></label>
          </>}
          <label className="block text-xs font-semibold">Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="mt-1.5 h-11 w-full rounded-xl border border-[#c7a45a]/18 bg-[#11182b]/80 px-3 text-sm outline-none focus:border-[#c7a45a]" /></label>
          <label className="block text-xs font-semibold">Contraseña<span className="relative mt-1.5 block"><KeyRound size={15} className="absolute left-3 top-3 text-[#d8bc7f]" /><input required type="password" minLength={10} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 10 caracteres" className="h-11 w-full rounded-xl border border-[#c7a45a]/18 bg-[#11182b]/80 pl-9 pr-3 text-sm outline-none focus:border-[#c7a45a]" /></span></label>
          {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={pending} className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] text-sm font-semibold text-[#0b1020] transition hover:brightness-110 disabled:opacity-60">{pending ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear mi cuenta"}</button>
        </form>
        <p className="mt-5 text-center text-[11px] leading-5 text-[#e9e2d2]/45">Tus datos se guardan de forma segura. La contraseña se almacena protegida y tu sesión se mantiene privada.</p>
      </section>
    </div>
  </main>;
}
