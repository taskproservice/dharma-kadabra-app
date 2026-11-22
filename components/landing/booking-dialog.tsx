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

type BookingDialogProps = {
  service: Service;
  close: () => void;
  initialDate?: string;
  initialTime?: string;
  appearance?: "night" | "papyrus";
};

export function BookingDialog({ service, close, initialDate = "", initialTime = "", appearance = "night" }: BookingDialogProps) {
  const [step, setStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingValues | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<BookingValues>({ resolver: zodResolver(bookingSchema), defaultValues: { date: initialDate, time: initialTime } });
  const deposit = Math.round(service.price * 0.2);
  const papyrus = appearance === "papyrus";
  const mutedText = papyrus ? "text-ink-muted" : "text-papyrus/55";
  const accentText = papyrus ? "text-bronze" : "text-gold-light";
  const fieldClasses = `h-10 min-w-0 w-full rounded-xl border outline-none focus:ring-2 ${papyrus
    ? "border-gold/35 bg-papyrus-soft text-ink placeholder:text-ink-muted focus:border-bronze focus:ring-gold/25"
    : "border-gold/20 bg-obsidian-deep/70 text-papyrus placeholder:text-papyrus/40 focus:border-gold focus:ring-gold/20"}`;

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
    <ol aria-label="Pasos de reserva" className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {["Tus datos", "Anticipo", "Preparación"].map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const done = number < step;
        return <li key={label} className={`min-w-0 border-b-2 pb-2 text-[9px] font-semibold uppercase tracking-[.08em] sm:text-[10px] sm:tracking-[.14em] ${active
          ? `border-gold ${papyrus ? "text-bronze" : "text-gold-bright"}`
          : done
            ? `border-[#a9c08a] ${papyrus ? "text-[#436746]" : "text-[#a9c08a]"}`
            : `border-gold/15 ${papyrus ? "text-ink-muted" : "text-papyrus/40"}`}`}>
          <span className="mb-1 flex flex-wrap items-center gap-1.5">{done ? <Check size={13} /> : <span>{`0${number}`}</span>}{label}</span>
        </li>;
      })}
    </ol>

    {step === 1 && <form id="booking-form" onSubmit={continueToPayment} className="space-y-4">
      <div><h3 className="font-display text-2xl">Comencemos por conocerte.</h3><p className={`mt-1 text-sm ${mutedText}`}>Tus datos nos ayudan a preparar tu encuentro.</p></div>
      <Field label="Nombre completo" error={errors.clientName?.message} papyrus={papyrus}><input {...register("clientName")} autoComplete="name" placeholder="Tu nombre" className={`${fieldClasses} px-3 text-sm`} /></Field>
      <Field label="Correo electrónico" error={errors.clientEmail?.message} papyrus={papyrus}><input {...register("clientEmail")} type="email" autoComplete="email" placeholder="tu@correo.com" className={`${fieldClasses} px-3 text-sm`} /></Field>
      <Field label="Teléfono / WhatsApp" error={errors.clientPhone?.message} papyrus={papyrus}><input {...register("clientPhone")} type="tel" autoComplete="tel" placeholder="+52 664 123 4567" className={`${fieldClasses} px-3 text-sm`} /></Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Fecha" error={errors.date?.message} papyrus={papyrus}><input {...register("date")} type="date" min={minDate} className={`${fieldClasses} px-2 text-xs`} /></Field>
        <Field label="Horario" error={errors.time?.message} papyrus={papyrus}><select {...register("time")} defaultValue="" className={`${fieldClasses} px-2 text-xs`}><option value="" disabled>Elige hora</option>{timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}</select></Field>
      </div>
      <button type="submit" className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-center text-sm font-semibold leading-5 text-obsidian transition hover:bg-gold-bright">Continuar al anticipo <ArrowRight size={16} className="shrink-0" /></button>
    </form>}

    {step === 2 && <div className="space-y-5">
      <div><p className={`text-[10px] font-semibold uppercase tracking-[.2em] ${accentText}`}>Resumen de tu sesión</p><h3 className="mt-2 font-display text-2xl">{service.name}</h3></div>
      <div className={`divide-y divide-gold/12 rounded-xl border border-gold/20 px-4 ${papyrus ? "bg-papyrus-soft" : "bg-papyrus/[0.04]"}`}>
        <SummaryRow label="Costo del servicio" value={`$${service.price.toLocaleString("es-MX")} MXN`} papyrus={papyrus} />
        <SummaryRow label="Anticipo para reservar · 20%" value={`$${deposit.toLocaleString("es-MX")} MXN`} emphasis papyrus={papyrus} />
        <SummaryRow label="Resto el día de tu sesión" value={`$${(service.price - deposit).toLocaleString("es-MX")} MXN`} papyrus={papyrus} />
      </div>
      <p className={`flex items-start gap-2 text-xs leading-5 ${mutedText}`}><CreditCard size={15} className="mt-0.5 shrink-0" />Al continuar apartaremos tu horario con estado pendiente. La pasarela de cobro automático está en integración, por lo que no se realiza ningún cargo en este paso.</p>
      {error && <p role="alert" className={`rounded-lg border border-red-500/35 bg-red-500/10 p-3 text-sm ${papyrus ? "text-red-800" : "text-red-200"}`}>{error}{needsLogin && <> <Link href="/mi-cuenta" className="font-semibold underline underline-offset-4">Ir a Mi Cuenta</Link></>}</p>}
      <div className="space-y-2.5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => setStep(1)} className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gold/30 px-4 text-sm sm:w-auto ${papyrus ? "bg-papyrus-soft hover:bg-papyrus-warm" : "hover:bg-papyrus/[0.04]"}`}><ArrowLeft size={15} /> Volver</button>
          <button type="button" disabled={isPaying} onClick={payDeposit} className="flex min-h-12 min-w-0 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-center text-sm font-bold leading-5 text-obsidian shadow-sm transition hover:bg-gold-bright disabled:cursor-wait disabled:opacity-70 sm:flex-1">{isPaying ? <><LoaderCircle size={16} className="shrink-0 animate-spin" /> Procesando…</> : <>Apartar horario (sin cargo ahora) <ArrowRight size={15} className="shrink-0" /></>}</button>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Próximamente: cobro automático del anticipo (20%) con tarjeta en integración"
          className={`flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gold/20 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[.14em] opacity-70 ${papyrus ? "bg-papyrus-soft/70 text-ink-muted" : "bg-papyrus/[0.02] text-papyrus/40"}`}
        >
          <CreditCard size={14} className="shrink-0 opacity-70" />
          <span>Pago en línea con tarjeta (20%) · Próximamente</span>
        </button>
      </div>
    </div>}

    {step === 3 && <div className="space-y-5 py-2">
      <div className={`mx-auto grid size-14 place-items-center rounded-full ${papyrus ? "bg-papyrus-soft text-[#436746]" : "bg-papyrus/[0.04] text-[#a9c08a]"}`}><Check size={28} /></div>
      <div className="text-center"><p className={`text-[10px] font-semibold uppercase tracking-[.22em] ${accentText}`}>Reserva registrada</p><h3 className="mt-2 font-display text-3xl">Tu horario está apartado.</h3><p className={`mt-2 text-sm ${mutedText}`}>Folio {bookingId.slice(-8).toUpperCase()}</p></div>
      <div className={`rounded-xl border border-gold/30 p-4 ${papyrus ? "bg-papyrus-soft" : "bg-obsidian-soft"}`}>
        <p className="flex items-center gap-2 font-semibold"><Sparkles size={16} className={accentText} /> Prepara tu espacio</p>
        <p className={`mt-2 text-sm leading-6 ${papyrus ? "text-ink-muted" : "text-papyrus/70"}`}>Busca un lugar sin ruido, usa audífonos y ten cerca tus registros o runas. Recibirás el link de la videollamada por correo y WhatsApp.</p>
      </div>
      <p className={`flex items-center gap-2 text-xs ${papyrus ? "text-ink-muted" : "text-papyrus/50"}`}><CalendarDays size={14} className="shrink-0" /> Estado de la cita: pendiente de pago del anticipo. Te confirmaremos en cuanto se acredite.</p>
      <button type="button" onClick={close} className="h-12 w-full cursor-pointer rounded-xl bg-gold text-sm font-semibold text-obsidian">Listo</button>
    </div>}
  </div>;
}

function Field({ label, error, children, papyrus }: { label: string; error?: string; children: React.ReactNode; papyrus: boolean }) {
  return <label className={`block min-w-0 text-xs font-semibold ${papyrus ? "text-ink" : "text-papyrus/80"}`}>{label}<span className="booking-field mt-1.5 block">{children}</span>{error && <span className={`mt-1 block font-normal ${papyrus ? "text-red-800" : "text-red-300"}`}>{error}</span>}</label>;
}

function SummaryRow({ label, value, emphasis = false, papyrus }: { label: string; value: string; emphasis?: boolean; papyrus: boolean }) {
  return <div className="flex items-center justify-between gap-3 py-3 text-sm"><span className={papyrus ? "text-ink-muted" : "text-papyrus/55"}>{label}</span><span className={emphasis ? `font-bold ${papyrus ? "text-bronze" : "text-gold-light"}` : "font-medium"}>{value}</span></div>;
}
