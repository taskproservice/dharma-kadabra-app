"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Flame, Lock, Mail, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/resumen";

  const [email, setEmail] = useState("paola@dharmakadabra.com");
  const [password, setPassword] = useState("dharma2026");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res || res.error) {
        setErrorMessage("Credenciales no válidas. Revisa tu correo y contraseña.");
        setIsLoading(false);
        return;
      }

      // Éxito: redirigir a la URL de retorno o al dashboard
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorMessage("Ocurrió un error al intentar iniciar sesión. Inténtalo nuevamente.");
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("paola@dharmakadabra.com");
    setPassword("dharma2026");
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/40 bg-white/75 p-7 sm:p-10 shadow-[0_20px_60px_-15px_rgba(26,26,26,0.15)] backdrop-blur-md">
      {/* Marca / Llama Sagrada */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 transition hover:scale-105">
          <Flame className="w-10 h-10 text-[#D4AF37] filter drop-shadow-[0_0_16px_rgba(212,175,55,0.7)] animate-pulse" />
          <span className="font-display font-serif text-2xl text-[#2A1B17]">
            Dharma <span className="text-[#8B6D16] italic">Kadabra</span>
          </span>
        </Link>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8B6D16]">
          Acceso Exclusivo · Dashboard
        </p>
        <h1 className="mt-1 font-display font-serif text-3xl text-[#2A1B17]">
          Bienvenida a tu templo
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#3E2723]/70">
          Ingresa tus credenciales de administradora o colaboradora para gestionar la comunidad.
        </p>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800">
          <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 mb-1.5"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B6D16]/60">
              <Mail size={16} />
            </span>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="paola@dharmakadabra.com"
              className="w-full rounded-xl border border-[#3E2723]/20 bg-white/80 pl-10 pr-4 py-2.5 text-sm text-[#3E2723] outline-none transition placeholder:text-[#3E2723]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 mb-1.5"
          >
            Contraseña
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B6D16]/60">
              <Lock size={16} />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#3E2723]/20 bg-white/80 pl-10 pr-11 py-2.5 text-sm text-[#3E2723] outline-none transition placeholder:text-[#3E2723]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3E2723]/50 hover:text-[#3E2723]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37] shadow-sm transition hover:bg-[#D4AF37] hover:text-[#1A1A1A] disabled:opacity-50"
        >
          {isLoading ? (
            <span>Conectando...</span>
          ) : (
            <>
              <span>Entrar al Dashboard</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Credenciales de Demostración */}
      <div className="mt-6 rounded-xl border border-[#D4AF37]/20 bg-[#F4ECD8]/80 p-3.5 text-xs text-[#3E2723]/80">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-[#8B6D16]">
            <ShieldCheck size={14} /> Acceso Rápido
          </span>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-[11px] font-medium text-[#8B6D16] underline underline-offset-2 hover:text-[#1A1A1A]"
          >
            Autocompletar
          </button>
        </div>
        <p className="mt-1 font-mono text-[11px] text-[#3E2723]/70">
          Email: <span className="font-bold">paola@dharmakadabra.com</span>
          <br />
          Pass: <span className="font-bold">dharma2026</span>
        </p>
      </div>

      {/* Enlace de regreso */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B6D16] hover:text-[#3E2723]"
        >
          <ArrowLeft size={13} /> Volver a la página principal
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4ECD8] px-4 py-12 text-[#3E2723]">
      <Suspense fallback={<div className="text-sm text-[#8B6D16]">Cargando acceso...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
