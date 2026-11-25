"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, CalendarDays, CalendarX2, Check, CreditCard, LoaderCircle, MapPin, Sparkles, Video } from "lucide-react";
import { getWorkTemplateSlots } from "../../lib/agenda-availability";
import type { Service } from "../../lib/data/services";
import type { PublicCollaborator } from "../../lib/therapists";
import { TherapistAvatar } from "../agenda/therapist-selector";

const bookingSchema = z.object({
  clientName: z.string().trim().min(2, "Escribe tu nombre completo."),
  clientEmail: z.string().trim().email("Escribe un correo válido."),
  clientPhone: z.string().trim().min(8, "Incluye un teléfono válido."),
  modality: z.enum(["IN_PERSON", "VIDEO_CALL"]),
  date: z.string().min(1, "Elige una fecha."),
  time: z.string().min(1, "Elige un horario."),
}).refine((value) => new Date(`${value.date}T${value.time}:00`).getTime() > Date.now(), {
  path: ["date"], message: "Elige una fecha y hora futuras.",
});
type BookingValues = z.infer<typeof bookingSchema>;

const timeSlots = getWorkTemplateSlots();
const today = new Date();
const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

type BookingDialogProps = {
  service: Service;
  close: () => void;
  initialDate?: string;
  initialTime?: string;
  appearance?: "night" | "papyrus";
  /** FASE 1 · Terapeuta elegido en la Agenda: se guarda como `assigneeId`. */
  assignee?: PublicCollaborator | null;
  /** Notifica cuando la reserva se registra correctamente (para refrescar la agenda). */
  onBooked?: () => void;
};

export function BookingDialog({ service, close, initialDate = "", initialTime = "", appearance = "night", assignee = null, onBooked }: BookingDialogProps) {
  const [step, setStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingValues | null>(null);
  // Estado elegante para el 409 ("ese horario acaba de reservarse").
  const [conflict, setConflict] = useState("");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BookingValues>({ resolver: zodResolver(bookingSchema), defaultValues: { date: initialDate, time: initialTime, modality: "IN_PERSON" } });
  const deposit = Math.round(service.price * 0.2);
  const papyrus = appearance === "papyrus";
  const mutedText = papyrus ? "text-ink-muted" : "text-papyrus/55";
  const accentText = papyrus ? "text-bronze" : "text-gold-light";
  const fieldClasses = `h-10 min-w-0 w-full rounded-xl border outline-none focus:ring-2 ${papyrus
    ? "border-stone-200 bg-white text-ink placeholder:text-ink-muted focus:border-bronze focus:ring-gold/25"
    : "border-gold/20 bg-obsidian-deep/70 text-papyrus placeholder:text-papyrus/40 focus:border-gold focus:ring-gold/20"}`;

  const continueToPayment = handleSubmit((values) => {
    setBookingInfo(values);
    setError("");
    setConflict("");
    setStep(2);
  });

  async function payDeposit() {
    setError("");
    setConflict("");
    setNeedsLogin(false);
    setIsPaying(true);
    try {
      if (!bookingInfo) throw new Error("Completa tus datos antes de continuar.");
      const payload = {
        clientName: bookingInfo.clientName,
        clientEmail: bookingInfo.clientEmail,
        clientPhone: bookingInfo.clientPhone,
        modality: bookingInfo.modality,
        dateTime: new Date(`${bookingInfo.date}T${bookingInfo.time}:00`).toISOString(),
        serviceId: service.id,
        ...(assignee ? { assigneeId: assignee.id } : {}),
      };
      const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) setNeedsLogin(true);
      if (response.status === 409) {
        // El horario acaba de ocuparse: volver a elegirlo en el paso 1.
        setConflict(result.error || "Ese horario acaba de reservarse. Elige otro horario.");
        setStep(1);
        setValue("time", "");
        return;
      }
      if (!response.ok) throw new Error(result.error || "No fue posible completar la reserva.");
      setBookingId(result.appointment.id);
      onBooked?.();
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

    {step === 1 && <>
      {conflict && (
        <div role="alert" className={`flex items-start gap-3 rounded-xl border p-4 ${papyrus ? "border-gold/40 bg-gold/[.09] text-ink" : "border-gold/30 bg-gold/[.08] text-papyrus"}`}>
          <CalendarX2 size={20} className={`mt-0.5 shrink-0 ${papyrus ? "text-bronze" : "text-gold-bright"}`} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">{conflict}</p>
            <p className={`mt-1 text-xs leading-5 ${mutedText}`}>Este horario acaba de reservarse. Elige otro horario en la lista y continúa con tu reserva.</p>
          </div>
        </div>
      )}
      <form id="booking-form" onSubmit={continueToPayment} className="space-y-4">
      <div><h3 className="font-display text-2xl">Comencemos por conocerte.</h3><p className={`mt-1 text-sm ${mutedText}`}>Tus datos nos ayudan a preparar tu encuentro.</p></div>
      <Field label="Nombre completo" error={errors.clientName?.message} papyrus={papyrus}><input {...register("clientName")} autoComplete="name" placeholder="Tu nombre" className={`${fieldClasses} px-3 text-sm`} /></Field>
      <Field label="Correo electrónico" error={errors.clientEmail?.message} papyrus={papyrus}><input {...register("clientEmail")} type="email" autoComplete="email" placeholder="tu@correo.com" className={`${fieldClasses} px-3 text-sm`} /></Field>
      <Field label="Teléfono / WhatsApp" error={errors.clientPhone?.message} papyrus={papyrus}><input {...register("clientPhone")} type="tel" autoComplete="tel" placeholder="+52 664 123 4567" className={`${fieldClasses} px-3 text-sm`} /></Field>
      <fieldset>
        <legend className={`text-xs font-semibold ${papyrus ? "text-ink" : "text-papyrus/80"}`}>Modalidad de tu sesión</legend>
        <div className="mt-1.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Elige entre sesión presencial o videollamada">
          <label className={`block min-w-0 cursor-pointer rounded-xl border p-3 transition peer-focus-visible:ring-2 peer-focus-visible:ring-gold/40 ${papyrus ? "border-gold/30 bg-papyrus-light" : "border-gold/20 bg-obsidian-deep/60"}`}>
            <input {...register("modality")} type="radio" value="IN_PERSON" className="peer sr-only" />
            <span className={`flex items-start gap-2.5 rounded-lg p-1 transition peer-checked:bg-gold/12 peer-checked:ring-1 peer-checked:ring-gold/50`}>
              <MapPin size={17} className={`mt-0.5 shrink-0 ${papyrus ? "text-bronze" : "text-gold-light"}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${papyrus ? "text-ink" : "text-papyrus"}`}>Presencial</span>
                <span className={`mt-0.5 block text-[11px] leading-4 ${papyrus ? "text-ink-muted" : "text-papyrus/50"}`}>En el estudio · Tijuana</span>
              </span>
            </span>
          </label>
          <label className={`block min-w-0 cursor-pointer rounded-xl border p-3 transition peer-focus-visible:ring-2 peer-focus-visible:ring-gold/40 ${papyrus ? "border-gold/30 bg-papyrus-light" : "border-gold/20 bg-obsidian-deep/60"}`}>
            <input {...register("modality")} type="radio" value="VIDEO_CALL" className="peer sr-only" />
            <span className={`flex items-start gap-2.5 rounded-lg p-1 transition peer-checked:bg-gold/12 peer-checked:ring-1 peer-checked:ring-gold/50`}>
              <Video size={17} className={`mt-0.5 shrink-0 ${papyrus ? "text-bronze" : "text-gold-light"}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${papyrus ? "text-ink" : "text-papyrus"}`}>Videollamada</span>
                <span className={`mt-0.5 block text-[11px] leading-4 ${papyrus ? "text-ink-muted" : "text-papyrus/50"}`}>Zoom / Meet · desde tu espacio</span>
              </span>
            </span>
          </label>
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Fecha" error={errors.date?.message} papyrus={papyrus}><input {...register("date")} type="date" min={minDate} className={`${fieldClasses} px-2 text-xs`} /></Field>
        <Field label="Horario" error={errors.time?.message} papyrus={papyrus}><select {...register("time")} defaultValue="" className={`${fieldClasses} px-2 text-xs`}><option value="" disabled>Elige hora</option>{timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}</select></Field>
      </div>
      <button type="submit" className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-center text-sm font-semibold leading-5 text-obsidian transition hover:bg-gold-bright">Continuar al anticipo <ArrowRight size={16} className="shrink-0" /></button>
      </form>
    </>}

    {step === 2 && <div className="space-y-5">
      <div><p className={`text-[10px] font-semibold uppercase tracking-[.2em] ${accentText}`}>Resumen de tu sesión</p><h3 className="mt-2 font-display text-2xl">{service.name}</h3></div>
      <div className={`divide-y divide-gold/12 rounded-xl border border-gold/20 px-4 ${papyrus ? "bg-papyrus-light" : "bg-papyrus/[0.04]"}`}>
        {assignee && (
          <div className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className={papyrus ? "text-ink-muted" : "text-papyrus/55"}>Tu terapeuta</span>
            <span className="inline-flex items-center gap-2 font-medium">
              <TherapistAvatar person={assignee} size={24} /> {assignee.name}
            </span>
          </div>
        )}
        <SummaryRow label="Modalidad" value={bookingInfo?.modality === "VIDEO_CALL" ? "Videollamada · Zoom / Meet" : "Presencial · Estudio"} papyrus={papyrus} />
        <SummaryRow label="Costo del servicio" value={`$${service.price.toLocaleString("es-MX")} MXN`} papyrus={papyrus} />
        <SummaryRow label="Anticipo para reservar · 20%" value={`$${deposit.toLocaleString("es-MX")} MXN`} emphasis papyrus={papyrus} />
        <SummaryRow label="Resto el día de tu sesión" value={`$${(service.price - deposit).toLocaleString("es-MX")} MXN`} papyrus={papyrus} />
      </div>
      <p className={`flex items-start gap-2 text-xs leading-5 ${mutedText}`}><CreditCard size={15} className="mt-0.5 shrink-0" />Al continuar apartaremos tu horario con estado pendiente. La pasarela de cobro automático está en integración, por lo que no se realiza ningún cargo en este paso.</p>
      {error && <p role="alert" className={`rounded-lg border border-red-500/35 bg-red-500/10 p-3 text-sm ${papyrus ? "text-red-800" : "text-red-200"}`}>{error}{needsLogin && <> <Link href="/mi-cuenta" className="font-semibold underline underline-offset-4">Ir a Mi Cuenta</Link></>}</p>}
      <div className="space-y-2.5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => setStep(1)} className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gold/30 px-4 text-sm sm:w-auto ${papyrus ? "bg-papyrus-light hover:bg-papyrus-warm" : "hover:bg-papyrus/[0.04]"}`}><ArrowLeft size={15} /> Volver</button>
          <button type="button" disabled={isPaying} onClick={payDeposit} className="flex min-h-12 min-w-0 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-center text-sm font-bold leading-5 text-obsidian shadow-sm transition hover:bg-gold-bright disabled:cursor-wait disabled:opacity-70 sm:flex-1">{isPaying ? <><LoaderCircle size={16} className="shrink-0 animate-spin" /> Procesando…</> : <>Apartar horario (sin cargo ahora) <ArrowRight size={15} className="shrink-0" /></>}</button>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Próximamente: cobro automático del anticipo (20%) con tarjeta en integración"
          className={`flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gold/20 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[.14em] opacity-70 ${papyrus ? "bg-papyrus-light/70 text-ink-muted" : "bg-papyrus/[0.02] text-papyrus/40"}`}
        >
          <CreditCard size={14} className="shrink-0 opacity-70" />
          <span>Pago en línea con tarjeta (20%) · Próximamente</span>
        </button>
      </div>
    </div>}

    {step === 3 && <div className="space-y-5 py-2">
      <div className={`mx-auto grid size-14 place-items-center rounded-full ${papyrus ? "bg-papyrus-light text-[#436746]" : "bg-papyrus/[0.04] text-[#a9c08a]"}`}><Check size={28} /></div>
      <div className="text-center"><p className={`text-[10px] font-semibold uppercase tracking-[.22em] ${accentText}`}>Reserva registrada</p><h3 className="mt-2 font-display text-3xl">Tu horario está apartado.</h3><p className={`mt-2 text-sm ${mutedText}`}>Folio {bookingId.slice(-8).toUpperCase()}</p></div>
      <div className={`rounded-xl border border-gold/30 p-4 ${papyrus ? "bg-papyrus-light" : "bg-obsidian-soft"}`}>
        <p className="flex items-center gap-2 font-semibold"><Sparkles size={16} className={accentText} /> Prepara tu espacio</p>
        <p className={`mt-2 text-sm leading-6 ${papyrus ? "text-ink-muted" : "text-papyrus/70"}`}>
          {bookingInfo?.modality === "VIDEO_CALL"
            ? "Busca un lugar sin ruido, usa audífonos y ten a la mano tus registros o runas. Recibirás el link de la videollamada por correo y WhatsApp."
            : "Llega con unos minutos de anticipación y ten a la mano tus registros o runas. Te esperamos en el estudio. Confirmaremos tu cita por correo y WhatsApp."}
        </p>
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
