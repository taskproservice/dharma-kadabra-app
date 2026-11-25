"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";

export function CustomerResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/customer-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "reset", token, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "No fue posible restablecer tu contraseña.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "h-12 w-full rounded-xl border border-stone-200 bg-white px-4 pl-11 pr-11 text-sm font-normal text-[#2C241B] placeholder:text-stone-400 transition focus:border-[#C5A059] focus-visible:outline-none focus:ring-2 focus:ring-[#C5A059]/20";
  const icon = "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6B5D4A]";

  if (done) {
    return (
      <div className="rounded-3xl border border-stone-200/50 bg-[#FCFAF5] p-8 text-center shadow-sm">
        <CheckCircle2 size={44} className="mx-auto text-[#C5A059]" aria-hidden="true" />
        <h1 className="mt-4 font-display text-3xl text-[#2C241B]">Contraseña actualizada</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-600">
          Ya puedes iniciar sesión con tu contraseña nueva.
        </p>
        <Link
          href="/mi-cuenta"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#241E18] px-6 py-3 text-sm font-semibold text-[#FCFAF5] transition hover:bg-[#3A3026]"
        >
          Ir a Mi Cuenta <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-stone-200/50 bg-[#FCFAF5] p-8 shadow-sm">
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] text-[#8B6914]">
        <span aria-hidden="true" className="h-px w-8 bg-[#C5A059]" />
        Restablecer contraseña
      </p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] text-[#2C241B]">
        Elige tu <em className="italic text-[#C5A059]">nueva contraseña</em>
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Debe tener al menos 10 caracteres. El enlace del correo es válido por 1 hora.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-3.5">
        <div className="relative">
          <LockKeyhole size={16} className={icon} aria-hidden="true" />
          <input
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Contraseña nueva (mínimo 10 caracteres)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={10}
            maxLength={128}
            className={field}
          />
          <button
            type="button"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-1 right-1.5 grid w-9 cursor-pointer place-items-center rounded-lg text-stone-600 transition hover:bg-[#F4EFE6] hover:text-[#2C241B]"
          >
            {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>

        <div className="relative">
          <LockKeyhole size={16} className={icon} aria-hidden="true" />
          <input
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirma tu contraseña nueva"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            minLength={10}
            maxLength={128}
            className={field}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#241E18] text-sm font-semibold text-[#FCFAF5] shadow-[0_12px_28px_-12px_rgba(36,30,24,0.55)] transition hover:bg-[#3A3026] disabled:cursor-wait disabled:opacity-60"
        >
          <span>{pending ? "Un momento…" : "Guardar contraseña nueva"}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-600">
        ¿El enlace expiró?{" "}
        <Link href="/mi-cuenta" className="font-semibold text-[#8B6914] underline decoration-[#C5A059] underline-offset-4 transition hover:text-[#2C241B]">
          Solicita uno nuevo
        </Link>
      </p>
    </div>
  );
}
