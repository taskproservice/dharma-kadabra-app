"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CreditCard, LoaderCircle, Sparkles } from "lucide-react";
import type { Service } from "../../lib/data/services";

const bookingSchema = z.object({
  clientName: z.string().trim().min(2, "Escribe tu nombre completo."),
  clientEmail: z.string().trim().email("Escribe un correo válido."),
  clientPhone: z.string().trim().min(8, "Incluye un teléfono válido."),
  date: z.string().min(1, "Elige una fecha."),
  time: z.string().min(1, "Elige un horario."),
}).refine((value) => new Date(`${value.date}T${value.time}:00`).getTime() > Date.now(), {
  path: ["date"], message: "Elige una fecha y hora futuras.",
});
type BookingValues = z.infer<typeof bookingSchema>;

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const today = new Date();
const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

export function BookingDialog({ service, close }: { service: Service; close: () => void }) {
  const [step, setStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingValues | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<BookingValues>({ resolver: zodResolver(bookingSchema), defaultValues: { date: "", time: "" } });
  const deposit = Math.round(service.price * 0.2);

  const continueToPayment = handleSubmit((values) => {
    setBookingInfo(values);
    setError("");
    setStep(2);
  });

  async function payDeposit() {
    setError("");
    setNeedsLogin(false);
    setIsPaying(true);
    try {
      if (!bookingInfo) throw new Error("Completa tus datos antes de continuar.");
      const payload = {
        clientName: bookingInfo.clientName,
        clientEmail: bookingInfo.clientEmail,
        clientPhone: bookingInfo.clientPhone,
        dateTime: new Date(`${bookingInfo.date}T${bookingInfo.time}:00`).toISOString(),
        serviceId: service.id,
      };
      const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (response.status === 401) setNeedsLogin(true);
      if (!response.ok) throw new Error(result.error || "No fue posible completar la reserva.");
      setBookingId(result.appointment.id);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inténtalo de nuevo en un momento.");
    } finally {
      setIsPaying(false);
    }
  }

  return <div className="space-y-6">
    <ol aria-label="Pasos de reserva" className="grid grid-cols-3 gap-2">
      {["Tus datos", "Anticipo", "Preparación"].map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const done = number < step;
        return <li key={label} className={`border-b-2 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] ${active ? "border-[#c7a45a] text-[#e3c57c]" : done ? "border-[#a9c08a] text-[#a9c08a]" : "border-[#c7a45a]/15 text-[#e9e2d2]/40"}`}>
          <span className="mb-1 flex items-center gap-1.5">{done ? <Check size={13} /> : <span>{`0${number}`}</span>}{label}</span>
        </li>;
      })}
    </ol>

    {step === 1 && <form id="booking-form" onSubmit={continueToPayment} className="space-y-4">
      <div><h3 className="font-display text-2xl">Comencemos por conocerte.</h3><p className="mt-1 text-sm text-[#e9e2d2]/55">Tus datos nos ayudan a preparar tu encuentro.</p></div>
      <Field label="Nombre completo" error={errors.clientName?.message}><input {...register("clientName")} autoComplete="name" placeholder="Tu nombre" className="h-10 w-full rounded-xl border border-[#c7a45a]/20 bg-[#0b1020]/60 px-3 text-sm outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/20" /></Field>
      <Field label="Correo electrónico" error={errors.clientEmail?.message}><input {...register("clientEmail")} type="email" autoComplete="email" placeholder="tu@correo.com" className="h-10 w-full rounded-xl border border-[#c7a45a]/20 bg-[#0b1020]/60 px-3 text-sm outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/20" /></Field>
      <Field label="Teléfono / WhatsApp" error={errors.clientPhone?.message}><input {...register("clientPhone")} type="tel" autoComplete="tel" placeholder="+52 664 123 4567" className="h-10 w-full rounded-xl border border-[#c7a45a]/20 bg-[#0b1020]/60 px-3 text-sm outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/20" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha" error={errors.date?.message}><input {...register("date")} type="date" min={minDate} className="h-10 w-full rounded-xl border border-[#c7a45a]/20 bg-[#0b1020]/60 px-2 text-xs outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/20" /></Field>
        <Field label="Horario" error={errors.time?.message}><select {...register("time")} defaultValue="" className="h-10 w-full rounded-xl border border-[#c7a45a]/20 bg-[#0b1020]/60 px-2 text-xs outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/20"><option value="" disabled>Elige hora</option>{timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}</select></Field>
      </div>
      <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c7a45a] px-5 text-sm font-semibold text-[#0b1020] transition hover:bg-[#e3c57c]">Continuar al anticipo <ArrowRight size={16} /></button>
    </form>}

    {step === 2 && <div className="space-y-5">
      <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#d8bc7f]">Resumen de tu sesión</p><h3 className="mt-2 font-display text-2xl">{service.name}</h3></div>
      <div className="divide-y divide-[#c7a45a]/12 rounded-xl border border-[#c7a45a]/15 bg-white/[0.04] px-4">
        <SummaryRow label="Costo del servicio" value={`$${service.price.toLocaleString("es-MX")} MXN`} />
        <SummaryRow label="Anticipo para reservar · 20%" value={`$${deposit.toLocaleString("es-MX")} MXN`} emphasis />
        <SummaryRow label="Resto el día de tu sesión" value={`$${(service.price - deposit).toLocaleString("es-MX")} MXN`} />
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-[#e9e2d2]/55"><CreditCard size={15} className="mt-0.5 shrink-0" />Al continuar apartaremos tu horario con estado pendiente. La cita se confirma únicamente cuando el procesador de pagos acredite el anticipo; todavía no se realiza ningún cargo.</p>
      {error && <p role="alert" className="rounded-lg border border-red-400/35 bg-red-500/10 p-3 text-sm text-red-200">{error}{needsLogin && <> <Link href="/mi-cuenta" className="font-semibold underline underline-offset-4">Ir a Mi Cuenta</Link></>}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={() => setStep(1)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#c7a45a]/20 px-4 text-sm"><ArrowLeft size={15} /> Volver</button>
        <button type="button" disabled={isPaying} onClick={payDeposit} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c7a45a] px-4 text-sm font-bold text-[#0b1020] shadow-sm transition hover:bg-[#e3c57c] disabled:cursor-wait disabled:opacity-70">{isPaying ? <><LoaderCircle size={16} className="animate-spin" /> Procesando…</> : <>Apartar y pagar anticipo (20%) <ArrowRight size={15} /></>}</button>
      </div>
    </div>}

    {step === 3 && <div className="space-y-5 py-2">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-white/[0.04] text-[#a9c08a]"><Check size={28} /></div>
      <div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#d8bc7f]">Reserva registrada</p><h3 className="mt-2 font-display text-3xl">Tu horario está apartado.</h3><p className="mt-2 text-sm text-[#e9e2d2]/55">Folio {bookingId.slice(-8).toUpperCase()}</p></div>
      <div className="rounded-xl border border-[#c7a45a]/30 bg-[#11182b] p-4">
        <p className="flex items-center gap-2 font-semibold"><Sparkles size={16} className="text-[#d8bc7f]" /> Prepara tu espacio</p>
        <p className="mt-2 text-sm leading-6 text-[#e9e2d2]/70">Busca un lugar sin ruido, usa audífonos y ten cerca tus registros o runas. Recibirás el link de la videollamada por correo y WhatsApp.</p>
      </div>
      <p className="flex items-center gap-2 text-xs text-[#e9e2d2]/50"><CalendarDays size={14} /> Estado de la cita: pendiente de pago del anticipo. Te confirmaremos en cuanto se acredite.</p>
      <button type="button" onClick={close} className="h-12 w-full rounded-xl bg-[#c7a45a] text-sm font-semibold text-[#0b1020]">Listo</button>
    </div>}
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-[#e9e2d2]/80">{label}<span className="booking-field mt-1.5 block">{children}</span>{error && <span className="mt-1 block font-normal text-red-300">{error}</span>}</label>;
}
function SummaryRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className="flex items-center justify-between gap-3 py-3 text-sm"><span className="text-[#e9e2d2]/55">{label}</span><span className={emphasis ? "font-bold text-[#d8bc7f]" : "font-medium"}>{value}</span></div>;
}
