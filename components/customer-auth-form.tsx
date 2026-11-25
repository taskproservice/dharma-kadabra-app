"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, Zap } from "lucide-react";
import bowl from "../public/images/mi-cuenta/cuenco.jpg";

function Lotus({ className }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
    <path d="M24 37c-9-5-12-16 0-28 12 12 9 23 0 28Z" />
    <path d="M24 37C11 37 7 27 8 17c5 1 8 3 10 6m6 14c13 0 17-10 16-20-5 1-8 3-10 6M12 27l-9 1c4 10 13 13 21 9 8 4 17 1 21-9l-9-1" />
  </svg>;
}

const benefits = [
  { Icon: ShieldCheck, title: "Compra segura", description: "Tus datos protegidos" },
  { Icon: Lotus, title: "Experiencia personalizada", description: "Gestiona tus preferencias" },
  { Icon: Zap, title: "Acceso rápido", description: "A tus reservas y beneficios" },
];

export function CustomerAuthForm({ callbackUrl = "" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");
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

  const login = mode === "login";
  const field = "h-12 w-full rounded-xl border border-[#DDD3C3] bg-white text-sm font-normal placeholder:text-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#92651D]";
  const icon = "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#79571F]";
  const textAction = "cursor-pointer font-semibold text-[#79571F] underline underline-offset-4 hover:text-[#2C241B]";

  return (
    <main className="min-h-screen bg-[#F4EFE6] px-5 py-10 text-[#2C241B] [font-family:var(--font-montserrat)] sm:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#79571F] hover:underline">
          <ArrowLeft size={15} aria-hidden="true" /> Volver a Dharma Kadabra
        </Link>
        <header className="mb-8 mt-8">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.24em] text-[#79571F] before:h-px before:w-7 before:bg-current">
            {login ? "Bienvenido de nuevo" : "Bienvenido a Dharma Kadabra"}
          </p>
          <h1 className="mt-2 text-5xl leading-none [font-family:var(--font-cormorant-garamond)] sm:text-7xl">
            {login ? "Iniciar" : "Crear"} <em className="text-[#92651D]">{login ? "Sesión" : "cuenta"}</em>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-700">Gestiona tus reservas, consulta tu historial y recibe novedades.</p>
        </header>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <section aria-labelledby="account-title" className="rounded-3xl border border-[#E3D9C9] bg-[#FCFAF5] p-6 shadow-[0_16px_45px_rgba(44,36,27,0.07)] sm:p-10">
            <div className="text-center">
              <Lotus className="mx-auto size-12 text-[#92651D]" />
              <h2 id="account-title" className="mt-2 text-3xl font-semibold [font-family:var(--font-cormorant-garamond)]">Tu espacio en Dharma Kadabra</h2>
              <p className="mt-1 text-sm text-stone-700">Conecta, gestiona y sigue tu camino.</p>
            </div>
            <form onSubmit={submit} className="mt-7 space-y-4">
              {!login && (
                <>
                  <label className="block text-xs font-semibold">
                    Nombre completo
                    <span className="relative mt-1.5 block">
                      <UserRound aria-hidden="true" className={icon} />
                      <input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={`${field} pl-10 pr-3`} />
                    </span>
                  </label>
                  <label className="block text-xs font-semibold">
                    Teléfono <span className="font-normal text-stone-600">(opcional)</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+52 664 123 4567" className={`${field} mt-1.5 px-3`} />
                  </label>
                </>
              )}
              <label className="relative block">
                <span className="sr-only">Correo electrónico</span>
                <Mail aria-hidden="true" className={icon} />
                <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className={`${field} pl-10 pr-3`} />
              </label>
              <div className="relative">
                <label htmlFor="customer-password" className="sr-only">Contraseña</label>
                <LockKeyhole aria-hidden="true" className={icon} />
                <input id="customer-password" required type={visible ? "text" : "password"} minLength={10} maxLength={128} autoComplete={login ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={login ? "Contraseña" : "Contraseña (mínimo 10 caracteres)"} className={`${field} pl-10 pr-12`} />
                <button type="button" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible(!visible)} className="absolute inset-y-1 right-1 grid w-10 cursor-pointer place-items-center rounded-lg text-stone-700 hover:bg-[#F4EFE6]">
                  {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
              {login && (
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
                  <label className="flex items-center gap-2 text-stone-600">
                    <input type="checkbox" disabled aria-describedby="remember-note" /> Mantener mi sesión iniciada
                  </label>
                  <button type="button" className={textAction} onClick={() => setNotice("Próximamente: recuperación de contraseña.")}>¿Olvidaste tu contraseña?</button>
                  <small id="remember-note" className="w-full text-stone-600">La duración de la sesión no se puede personalizar por ahora.</small>
                </div>
              )}
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button disabled={pending} className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#2C241B] text-sm font-semibold text-[#FCFAF5] transition hover:bg-[#473728] disabled:cursor-wait disabled:opacity-60">
                {pending ? "Un momento…" : login ? "Iniciar Sesión" : "Crear mi cuenta"}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
            <div className="my-4 flex items-center gap-3 text-xs text-stone-600 before:h-px before:flex-1 before:bg-[#DDD3C3] after:h-px after:flex-1 after:bg-[#DDD3C3]">o</div>
            <div className="mx-auto grid max-w-sm gap-2">
              {["Google", "Apple"].map((provider) => (
                <button key={provider} type="button" onClick={() => setNotice(`Próximamente: acceso con ${provider}.`)} className="flex min-h-10 cursor-pointer items-center justify-center gap-3 rounded-full border border-[#DDD3C3] px-4 text-xs font-semibold transition hover:bg-[#F4EFE6]">
                  <Image src={`/images/mi-cuenta/${provider.toLowerCase()}.svg`} width={16} height={16} alt="" />
                  Continuar con {provider}
                </button>
              ))}
            </div>
            <p role="status" className="text-center text-xs font-semibold text-[#79571F] empty:hidden not-empty:mt-3">{notice}</p>
            <p className="mt-6 text-center text-xs">
              {login ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button type="button" disabled={pending} className={textAction} onClick={() => { setMode(login ? "register" : "login"); setError(""); setNotice(""); setVisible(false); }}>
                {login ? "Crear cuenta" : "Iniciar sesión"}
              </button>
            </p>
          </section>
          <aside aria-label="Beneficios de tu cuenta" className="overflow-hidden rounded-3xl border border-[#E3D9C9] bg-[#F8F2E8]">
            <div className="relative aspect-[16/10]">
              <Image src={bowl} alt="Cuenco tibetano de bronce junto a un racimo de amatistas" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
            <ul className="grid gap-5 p-6 sm:px-10 sm:py-7">
              {benefits.map(({ Icon, title, description }) => (
                <li key={title} className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#EFE4D0] text-[#92651D]"><Icon className="size-6" aria-hidden="true" /></span>
                  <div>
                    <h2 className="text-2xl leading-tight font-semibold [font-family:var(--font-cormorant-garamond)]">{title}</h2>
                    <p className="text-xs leading-5 text-stone-700">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
