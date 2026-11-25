"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, Zap } from "lucide-react";
import { PublicHeader } from "./landing/public-header";
import { PremiumFooter } from "./landing/premium-footer";
import { CozyWidget } from "./landing/cozy-widget";
import bowl from "../public/images/mi-cuenta/cuenco.jpg";

function Lotus({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M24 37c-9-5-12-16 0-28 12 12 9 23 0 28Z" />
      <path d="M24 37C11 37 7 27 8 17c5 1 8 3 10 6m6 14c13 0 17-10 16-20-5 1-8 3-10 6M12 27l-9 1c4 10 13 13 21 9 8 4 17 1 21-9l-9-1" />
    </svg>
  );
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
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/customer-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, name, email, phone, password }),
      });
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
  const field =
    "h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-normal text-[#2C241B] placeholder:text-stone-400 transition focus:border-[#C5A059] focus-visible:outline-none focus:ring-2 focus:ring-[#C5A059]/20";
  const icon = "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6B5D4A]";
  const textAction =
    "cursor-pointer font-semibold text-[#8B6914] underline decoration-[#C5A059] underline-offset-4 transition hover:text-[#2C241B]";

  return (
    <>
      <div className="flex min-h-screen flex-col bg-[#F4EFE6] text-[#2C241B]">
        <PublicHeader />

        <main className="flex flex-1 items-center pt-[76px]">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
            {/* Columna Izquierda: Encabezado editorial + Tarjeta del formulario */}
              <div className="w-full">
                <header className="mb-8 text-left">
                  <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] text-[#8B6914]">
                    <span aria-hidden="true" className="h-px w-8 bg-[#C5A059]" />
                    <span>{login ? "Bienvenido de nuevo" : "Bienvenido a Dharma Kadabra"}</span>
                    <span aria-hidden="true" className="h-px w-8 bg-[#C5A059]" />
                  </p>
                  <h1 className="mt-3 font-display text-5xl leading-[1.02] text-[#2C241B] sm:text-6xl lg:text-[4.25rem]">
                    {login ? "Iniciar" : "Crear"}{" "}
                    <em className="italic text-[#9A7020]">{login ? "Sesión" : "cuenta"}</em>
                  </h1>
                  <p className="mt-4 max-w-md text-[15px] leading-7 text-[#514333]">
                    Accede a tu cuenta para gestionar tus reservas, consultar tu historial y recibir novedades.
                  </p>
                </header>

                <section
                  aria-labelledby="account-title"
                  className="rounded-3xl border border-[#EAE2D3] bg-[#FCFAF5] p-6 shadow-[0_20px_55px_-18px_rgba(44,36,27,0.09)] sm:p-10"
                >
                  <div className="text-center">
                    <Lotus className="mx-auto size-11 text-[#9A7020]" />
                    <h2
                      id="account-title"
                      className="mt-2.5 font-display text-[1.85rem] leading-tight text-[#2C241B] sm:text-[2.05rem]"
                    >
                      Tu espacio en Dharma Kadabra
                    </h2>
                    <p className="mt-1.5 text-sm text-[#5B5143]">
                      Conecta, gestiona y sigue tu camino.
                    </p>
                  </div>

                  <form onSubmit={submit} className="mt-7 space-y-3.5">
                    {!login && (
                      <>
                        <label className="block text-xs font-semibold text-[#2C241B]">
                          Nombre completo
                          <span className="relative mt-1.5 block">
                            <UserRound aria-hidden="true" className={icon} />
                            <input
                              required
                              minLength={2}
                              autoComplete="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Tu nombre"
                              className={`${field} pl-10`}
                            />
                          </span>
                        </label>
                        <label className="block text-xs font-semibold text-[#2C241B]">
                          Teléfono <span className="font-normal text-[#6B5D4A]">(opcional)</span>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoComplete="tel"
                            placeholder="+52 664 123 4567"
                            className={`${field} mt-1.5`}
                          />
                        </label>
                      </>
                    )}

                    <label className="relative block">
                      <span className="sr-only">Correo electrónico</span>
                      <Mail aria-hidden="true" className={icon} />
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        className={`${field} pl-10`}
                      />
                    </label>

                    <div className="relative">
                      <label htmlFor="customer-password" className="sr-only">
                        Contraseña
                      </label>
                      <LockKeyhole aria-hidden="true" className={icon} />
                      <input
                        id="customer-password"
                        required
                        type={visible ? "text" : "password"}
                        minLength={10}
                        maxLength={128}
                        autoComplete={login ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={login ? "Contraseña" : "Contraseña (mínimo 10 caracteres)"}
                        className={`${field} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                        onClick={() => setVisible(!visible)}
                        className="absolute inset-y-1 right-1.5 grid w-9 cursor-pointer place-items-center rounded-lg text-[#6B5D4A] transition hover:bg-[#F4EFE6] hover:text-[#2C241B]"
                      >
                        {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                      </button>
                    </div>

                    {login && (
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1 text-xs">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-[#2C241B]">
                          <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="size-4 rounded border-stone-300 accent-[#2C241B]"
                          />
                          <span>Mantener mi sesión iniciada</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setNotice("Próximamente: recuperación de contraseña.")}
                          className="cursor-pointer font-medium text-[#514333] transition hover:text-[#2C241B] hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                    )}

                    {error && (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                      >
                        {error}
                      </p>
                    )}

                    <div className="pt-1">
                      <button
                        disabled={pending}
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#241E18] text-sm font-semibold text-[#FCFAF5] shadow-[0_12px_28px_-12px_rgba(36,30,24,0.55)] transition hover:bg-[#3A3026] disabled:cursor-wait disabled:opacity-60"
                      >
                        <span>{pending ? "Un momento…" : login ? "Iniciar Sesión" : "Crear mi cuenta"}</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </form>

                  <div className="my-5 flex items-center gap-4 text-xs text-[#6B5D4A] before:h-px before:flex-1 before:bg-stone-200 after:h-px after:flex-1 after:bg-stone-200">
                    o
                  </div>

                  <div className="mx-auto grid max-w-sm gap-2.5">
                    {["Google", "Apple"].map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => setNotice(`Próximamente: acceso con ${provider}.`)}
                        className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-stone-200 bg-transparent px-4 text-xs font-semibold text-[#2C241B] transition hover:border-stone-300 hover:bg-white"
                      >
                        <Image
                          src={`/images/mi-cuenta/${provider.toLowerCase()}.svg`}
                          width={16}
                          height={16}
                          alt=""
                        />
                        <span>Continuar con {provider}</span>
                      </button>
                    ))}
                  </div>

                  <p
                    role="status"
                    className="text-center text-xs font-semibold text-[#8B6914] empty:hidden not-empty:mt-3"
                  >
                    {notice}
                  </p>

                  <p className="mt-6 text-center text-xs text-[#514333]">
                    {login ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
                    <button
                      type="button"
                      disabled={pending}
                      className={textAction}
                      onClick={() => {
                        setMode(login ? "register" : "login");
                        setError("");
                        setNotice("");
                        setVisible(false);
                      }}
                    >
                      {login ? "Crear cuenta" : "Iniciar sesión"}
                    </button>
                  </p>
                </section>
              </div>

              {/* Columna Derecha: Imagen continua integrada en el papiro + Beneficios debajo */}
              <aside aria-label="Beneficios de tu cuenta" className="flex h-full w-full flex-col justify-between">
                <div className="relative min-h-[340px] w-full overflow-hidden sm:min-h-[430px] lg:min-h-[500px]">
                  <Image
                    src={bowl}
                    alt="Cuenco tibetano de bronce junto a una drusa de amatista sobre piedra natural"
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="h-full w-full object-cover object-center"
                  />
                  {/* Fundidos suaves hacia el papiro (#F4EFE6) para unificar sin bordes de tarjeta */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#F4EFE6] via-[#F4EFE6]/40 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F4EFE6] via-[#F4EFE6]/45 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#F4EFE6] via-transparent to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F4EFE6] via-[#F4EFE6]/65 to-transparent"
                  />
                </div>

                <ul className="relative z-10 -mt-4 flex flex-col gap-6 px-2 py-4 sm:px-6 lg:ml-4 lg:border-l lg:border-[#D6CCB8] lg:pl-10">
                  {benefits.map(({ Icon, title, description }) => (
                    <li key={title} className="flex items-start gap-4">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center text-[#9A7020]">
                        <Icon className="size-7" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-[1.4rem] leading-snug text-[#2C241B]">
                          {title}
                        </h3>
                        <p className="mt-0.5 text-xs leading-5 text-[#2C241B]/80">{description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
          </div>
        </main>

        <PremiumFooter />
      </div>

      <CozyWidget />
    </>
  );
}
