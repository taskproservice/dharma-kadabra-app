"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarClock, CalendarDays, Check, Headphones, LogOut, Package, Sparkles } from "lucide-react";

export type CustomerAppointment = { id: string; clientName: string; date: string; service: string; status: string; depositPaid: boolean };
export type CustomerPurchase = { id: string; title: string; purchasedAt: string; product?: { imageUrl?: string | null } | null };
export type CustomerAudio = { id: string; title: string; purchasedAt: string; audioUrl?: string | null };

type Props = { customer: { name: string; email: string }; appointments: CustomerAppointment[]; purchases: CustomerPurchase[]; audios: CustomerAudio[] };
const dateFormat = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const todayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function CustomerAccount({ customer, appointments: initialAppointments, purchases, audios }: Props) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [rescheduleId, setRescheduleId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/customer-auth", { method: "DELETE" });
    router.refresh();
  }

  async function reschedule(event: React.FormEvent<HTMLFormElement>, appointmentId: string) {
    event.preventDefault();
    setSavingId(appointmentId);
    setError("");
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dateTime: new Date(newDate).toISOString() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo reagendar.");
      setAppointments((current) => current.map((appointment) => appointment.id === appointmentId ? { ...appointment, date: new Date(result.appointment.date).toISOString(), status: result.appointment.status } : appointment));
      setRescheduleId("");
      setNewDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inténtalo de nuevo.");
    } finally {
      setSavingId("");
    }
  }

  return <main className="min-h-screen bg-[#F4EFE6] px-5 py-12 text-[#1A1A1A] sm:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#C5A059]/30 pb-8">
        <div>
          <Link href="/" className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#8B6914] hover:text-[#1A1A1A]">Dharma Kadabra</Link>
          <p className="mt-4 text-[10px] uppercase tracking-[.22em] text-[#8B6914]">Mi cuenta</p>
          <h1 className="mt-1 font-display text-4xl text-[#1A1A1A] sm:text-5xl">Hola, {customer.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm text-[#2C2C2C]/70">{customer.email}</p>
        </div>
        <button type="button" disabled={signingOut} onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-[#2C2C2C]/25 bg-[#FCFAF5] px-4 py-2.5 text-xs font-semibold text-[#1A1A1A] transition hover:border-[#C5A059] hover:bg-[#C5A059]/15"><LogOut size={15} />{signingOut ? "Saliendo…" : "Cerrar sesión"}</button>
      </header>

      <section className="mt-9">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#8B6914]"><CalendarDays size={14} /> Tu camino</p>
            <h2 className="mt-2 font-display text-3xl text-[#1A1A1A]">Próximas citas</h2>
          </div>
          <Link href="/#servicios" className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B6914] hover:text-[#1A1A1A]">Agendar sesión <ArrowRight size={14} /></Link>
        </div>
        {appointments.length ? <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((appointment) => <article key={appointment.id} className="rounded-2xl border border-[#C5A059]/40 bg-[#FCFAF5] p-5 shadow-[0_10px_28px_-14px_rgba(92,72,48,0.14)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#8B6914]">{appointment.service}</p>
                <h3 className="mt-2 font-display text-2xl text-[#1A1A1A]">{dateFormat.format(new Date(appointment.date))}</h3>
              </div>
              <span className="rounded-full border border-[#C5A059]/45 bg-[#C5A059]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#6B4E24]">
                {appointment.status === "PENDING" ? "Pendiente" : appointment.status === "CONFIRMED" ? "Confirmada" : "Completada"}
              </span>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#2C2C2C]/75">{appointment.depositPaid ? <><Check size={14} className="text-emerald-700" /> Anticipo recibido</> : "Anticipo pendiente"}</p>
            {appointment.status !== "COMPLETED" && <div className="mt-4 border-t border-[#C5A059]/25 pt-4">
              {rescheduleId === appointment.id ? <form onSubmit={(event) => reschedule(event, appointment.id)} className="space-y-3">
                <label className="block text-xs font-semibold text-[#1A1A1A]">Nuevo horario<input required type="datetime-local" min={`${todayLocal()}T00:00`} value={newDate} onChange={(event) => setNewDate(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-[#C5A059]/45 bg-[#F4EFE6] px-3 text-xs text-[#1A1A1A]" /></label>
                {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
                <div className="flex gap-2"><button disabled={savingId === appointment.id} className="rounded-lg bg-[#C5A059] px-4 py-2 text-xs font-semibold text-[#1A1A1A] disabled:opacity-60">{savingId === appointment.id ? "Guardando…" : "Confirmar cambio"}</button><button type="button" onClick={() => { setRescheduleId(""); setError(""); }} className="rounded-lg border border-[#2C2C2C]/25 px-4 py-2 text-xs text-[#2C2C2C]">Cancelar</button></div>
              </form> : <button type="button" onClick={() => { setRescheduleId(appointment.id); setNewDate(""); setError(""); }} className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B6914] hover:text-[#1A1A1A]"><CalendarClock size={15} /> Reagendar cita</button>}
            </div>}
          </article>)}
        </div> : <EmptyState icon={<CalendarDays size={19} />} title="Todavía no tienes citas" text="Cuando reserves una sesión, aparecerá aquí con su fecha y estado." action={<Link href="/#servicios" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8B6914] hover:text-[#1A1A1A]">Explorar sesiones <ArrowRight size={13} /></Link>} />}
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section><SectionTitle icon={<Headphones size={16} />} title="Mis audios" /><div className="mt-4 space-y-3">{audios.length ? audios.map((audio) => <article key={audio.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] p-4"><div><h3 className="font-display text-lg text-[#1A1A1A]">{audio.title}</h3><p className="mt-1 text-[10px] text-[#2C2C2C]/60">Adquirido el {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(audio.purchasedAt))}</p></div>{audio.audioUrl && <a href={audio.audioUrl} className="text-xs font-semibold text-[#8B6914] hover:text-[#1A1A1A]">Escuchar</a>}</article>) : <EmptyState icon={<Headphones size={18} />} title="Tu biblioteca está lista para crecer" text="Los audios que adquieras aparecerán en este espacio." />}</div></section>
        <section><SectionTitle icon={<Package size={16} />} title="Mis productos" /><div className="mt-4 space-y-3">{purchases.length ? purchases.map((purchase) => <article key={purchase.id} className="flex items-center gap-4 rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] p-4">{purchase.product?.imageUrl ? <img src={purchase.product.imageUrl} alt="" className="size-14 rounded-lg object-cover" /> : <span className="grid size-14 place-items-center rounded-lg border border-[#C5A059]/35 bg-[#EDE5D7] text-[#8B6914]"><Package size={20} /></span>}<div><h3 className="font-display text-lg text-[#1A1A1A]">{purchase.title}</h3><p className="mt-1 text-[10px] text-[#2C2C2C]/60">Adquirido el {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(purchase.purchasedAt))}</p></div></article>) : <EmptyState icon={<Package size={18} />} title="Aún no hay productos comprados" text="Tus piezas y objetos rituales aparecerán aquí después de tu compra." />}</div></section>
      </div>
      <div className="mt-12 rounded-2xl border border-[#C5A059]/40 bg-[#FCFAF5] p-6 text-center shadow-[0_10px_28px_-14px_rgba(92,72,48,0.12)]"><Sparkles size={17} className="mx-auto text-[#9E7B2F]" /><p className="mt-2 font-display text-xl text-[#1A1A1A]">Un espacio para volver a ti.</p><p className="mt-1 text-xs text-[#2C2C2C]/70">Gracias por caminar con Dharma Kadabra.</p></div>
    </div>
  </main>;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <h2 className="flex items-center gap-2 font-display text-2xl text-[#1A1A1A]"><span className="text-[#8B6914]">{icon}</span><span>{title}</span></h2>; }
function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) { return <div className="flex min-h-28 flex-col justify-center rounded-xl border border-dashed border-[#C5A059]/45 bg-[#FCFAF5] px-5 py-4"><p className="flex items-center gap-2 text-xs font-semibold text-[#8B6914]">{icon}{title}</p><p className="mt-2 text-xs leading-5 text-[#2C2C2C]/75">{text}</p>{action}</div>; }
