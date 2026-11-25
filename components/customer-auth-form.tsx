"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Sparkles, UserRound } from "lucide-react";

/**
 * Login / Registro de clientes · Premium Orgánico.
 * Fondo Beige (#F4EFE6), tarjeta blanca central con bordes muy redondeados
 * (rounded-3xl) y sombra suave; campos limpios con fondo beige muy claro y
 * botón de acción en Café Oscuro.
 */
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

  return (
    <main className="min-h-screen bg-papyrus px-5 py-16 text-ink">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-bronze transition hover:text-ink">
          <ArrowLeft size={15} /> Volver a Dharma Kadabra
        </Link>
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-9">
          <div className="mb-7 grid size-12 place-items-center rounded-full border border-gold/40 bg-gold/10 text-bronze">
            <Sparkles size={22} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-bronze">Tu espacio personal</p>
          <h1 className="mt-2 font-display text-4xl text-ink">{mode === "login" ? "Qué gusto verte." : "Un espacio para ti."}</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">Consulta tus citas, productos y audios desde un solo lugar.</p>
          <div className="mt-6 grid grid-cols-2 rounded-xl border border-stone-200 bg-papyrus-light p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`cursor-pointer rounded-lg py-2.5 transition ${
                mode === "login" ? "bg-white text-ink shadow-[0_4px_14px_rgba(44,36,27,0.08)]" : "text-ink-muted hover:text-ink"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`cursor-pointer rounded-lg py-2.5 transition ${
                mode === "register" ? "bg-white text-ink shadow-[0_4px_14px_rgba(44,36,27,0.08)]" : "text-ink-muted hover:text-ink"
              }`}
            >
              Crear cuenta
            </button>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <label className="block text-xs font-semibold text-ink">
                  Nombre completo
                  <span className="relative mt-1.5 block">
                    <UserRound size={15} className="absolute left-3 top-3 text-bronze/70" />
                    <input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="field-light h-11 pl-9 pr-3" />
                  </span>
                </label>
                <label className="block text-xs font-semibold text-ink">
                  Teléfono <span className="font-normal text-ink-muted">(opcional)</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+52 664 123 4567" className="field-light mt-1.5 h-11 px-3" />
                </label>
              </>
            )}
            <label className="block text-xs font-semibold text-ink">
              Correo electrónico
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="field-light mt-1.5 h-11 px-3" />
            </label>
            <label className="block text-xs font-semibold text-ink">
              Contraseña
              <span className="relative mt-1.5 block">
                <KeyRound size={15} className="absolute left-3 top-3 text-bronze/70" />
                <input required type="password" minLength={10} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 10 caracteres" className="field-light h-11 pl-9 pr-3" />
              </span>
            </label>
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}
            <button
              disabled={pending}
              className="h-12 w-full cursor-pointer rounded-xl bg-ink text-sm font-semibold text-papyrus transition hover:bg-[#3D3226] disabled:opacity-60"
            >
              {pending ? "Un momento…" : mode === "login" ? "Iniciar Sesión" : "Crear mi cuenta"}
            </button>
          </form>
          <p className="mt-5 text-center text-[11px] leading-5 text-ink-muted">
            Tus datos se guardan de forma segura. La contraseña se almacena protegida y tu sesión se mantiene privada.
          </p>
        </section>
      </div>
    </main>
  );
}
