"use client";

import { useState } from "react";
import Image from "next/image";
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

/**
 * Mi Cuenta (sesión activa) · Premium Orgánico.
 * Fondo beige, tarjetas blancas con sombra suave y acentos en bronce/dorado.
 */
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

  return (
    <main className="min-h-screen bg-papyrus px-5 py-12 text-ink sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-stone-200 pb-8">
          <div>
            <Link href="/" className="text-[10px] font-semibold uppercase tracking-[.2em] text-bronze">Dharma Kadabra</Link>
            <p className="mt-4 text-[10px] uppercase tracking-[.22em] text-ink-muted">Mi cuenta</p>
            <h1 className="mt-1 font-display text-4xl text-ink sm:text-5xl">Hola, {customer.name.split(" ")[0]}.</h1>
            <p className="mt-2 text-sm text-ink-muted">{customer.email}</p>
          </div>
          <button type="button" disabled={signingOut} onClick={signOut} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-gold/60 hover:bg-gold/10">
            <LogOut size={15} />{signingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </header>

        <section className="mt-9">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-bronze"><CalendarDays size={14} /> Tu camino</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Próximas citas</h2>
            </div>
            <Link href="/agenda" className="inline-flex items-center gap-1 text-xs font-semibold text-bronze transition hover:text-ink">Agendar sesión <ArrowRight size={14} /></Link>
          </div>
          {appointments.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {appointments.map((appointment) => (
                <article key={appointment.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[.16em] text-bronze">{appointment.service}</p>
                      <h3 className="mt-2 font-display text-2xl text-ink">{dateFormat.format(new Date(appointment.date))}</h3>
                    </div>
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-bronze">{appointment.status === "PENDING" ? "Pendiente" : appointment.status === "CONFIRMED" ? "Confirmada" : "Completada"}</span>
                  </div>
                  <p className="mt-4 inline-flex items-center gap-2 text-xs text-ink-muted">{appointment.depositPaid ? <><Check size={14} className="text-[#436746]" /> Anticipo recibido</> : "Anticipo pendiente"}</p>
                  {appointment.status !== "COMPLETED" && (
                    <div className="mt-4 border-t border-stone-200 pt-4">
                      {rescheduleId === appointment.id ? (
                        <form onSubmit={(event) => reschedule(event, appointment.id)} className="space-y-3">
                          <label className="block text-xs font-semibold text-ink">
                            Nuevo horario
                            <input required type="datetime-local" min={`${todayLocal()}T00:00`} value={newDate} onChange={(event) => setNewDate(event.target.value)} className="field-light mt-1.5 h-10 text-xs" />
                          </label>
                          {error && (
                            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
                              <CalendarClock size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                              <span>{error}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button disabled={savingId === appointment.id} className="cursor-pointer rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60">
                              {savingId === appointment.id ? "Guardando…" : "Confirmar cambio"}
                            </button>
                            <button type="button" onClick={() => { setRescheduleId(""); setError(""); }} className="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 text-xs text-ink-muted transition hover:border-gold/60 hover:text-ink">Cancelar</button>
                          </div>
                        </form>
                      ) : (
                        <button type="button" onClick={() => { setRescheduleId(appointment.id); setNewDate(""); setError(""); }} className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-bronze transition hover:text-ink">
                          <CalendarClock size={15} /> Reagendar cita
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={<CalendarDays size={19} />} title="Todavía no tienes citas" text="Cuando reserves una sesión, aparecerá aquí con su fecha y estado." action={<Link href="/agenda" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-bronze transition hover:text-ink">Explorar sesiones <ArrowRight size={13} /></Link>} />
          )}
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section>
            <SectionTitle icon={<Headphones size={16} />} title="Mis audios" />
            <div className="mt-4 space-y-3">
              {audios.length ? (
                audios.map((audio) => (
                  <article key={audio.id} className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                    <div>
                      <h3 className="font-display text-lg text-ink">{audio.title}</h3>
                      <p className="mt-1 text-[10px] text-ink-muted">Adquirido el {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(audio.purchasedAt))}</p>
                    </div>
                    {audio.audioUrl && <a href={audio.audioUrl} className="text-xs font-semibold text-bronze transition hover:text-ink">Escuchar</a>}
                  </article>
                ))
              ) : (
                <EmptyState icon={<Headphones size={18} />} title="Tu biblioteca está lista para crecer" text="Los audios que adquieras aparecerán en este espacio." />
              )}
            </div>
          </section>
          <section>
            <SectionTitle icon={<Package size={16} />} title="Mis productos" />
            <div className="mt-4 space-y-3">
              {purchases.length ? (
                purchases.map((purchase) => (
                  <article key={purchase.id} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                    {purchase.product?.imageUrl ? (
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-papyrus">
                        <Image src={purchase.product.imageUrl} alt={purchase.title} fill sizes="56px" className="object-cover" />
                      </span>
                    ) : (
                      <span className="grid size-14 shrink-0 place-items-center rounded-lg border border-stone-200 bg-papyrus text-bronze">
                        <Package size={20} />
                      </span>
                    )}
                    <div>
                      <h3 className="font-display text-lg text-ink">{purchase.title}</h3>
                      <p className="mt-1 text-[10px] text-ink-muted">Adquirido el {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(purchase.purchasedAt))}</p>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState icon={<Package size={18} />} title="Aún no hay productos comprados" text="Tus piezas y objetos rituales aparecerán aquí después de tu compra." />
              )}
            </div>
          </section>
        </div>
        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <Sparkles size={17} className="mx-auto text-bronze" />
          <p className="mt-2 font-display text-xl text-ink">Un espacio para volver a ti.</p>
          <p className="mt-1 text-xs text-ink-muted">Gracias por caminar con Dharma Kadabra.</p>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <h2 className="flex items-center gap-2 font-display text-2xl text-ink">{icon}<span>{title}</span></h2>;
}

function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-28 flex-col justify-center rounded-xl border border-dashed border-stone-300 bg-papyrus-light px-5 py-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-bronze">{icon}{title}</p>
      <p className="mt-2 text-xs leading-5 text-ink-muted">{text}</p>
      {action}
    </div>
  );
}
