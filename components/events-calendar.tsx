"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { CalendarDays, Check, Clock3, MoonStar, Plus, Sparkles, X } from "lucide-react";

export type CalendarEvent = { id: string; title: string; description: string; start: string; productNames: string[] };
type EventProduct = { id: string; name: string };
type Draft = { title: string; description: string; date: string };

function localDateTime(date = new Date()) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

export function EventsCalendar({ initialEvents, products }: { initialEvents: CalendarEvent[]; products: EventProduct[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>({ title: "", description: "", date: "" });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const calendarEvents: EventInput[] = useMemo(() => events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    backgroundColor: "#C5A059",
    borderColor: "#E3C57C",
    textColor: "#0F1115",
    extendedProps: { description: event.description, productNames: event.productNames },
  })), [events]);

  function openForDate(date = new Date()) {
    setDraft({ title: "", description: "", date: localDateTime(date) });
    setSelectedProducts([]);
    setError("");
    setShowForm(true);
  }

  function clickDate(info: DateClickArg) {
    const date = new Date(`${info.dateStr}T18:00:00`);
    openForDate(date);
  }

  function showEvent(info: EventClickArg) {
    const event = events.find((item) => item.id === info.event.id);
    if (event) setNotice(`${event.title} — ${event.description}${event.productNames.length ? ` · Productos: ${event.productNames.join(", ")}` : ""}`);
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, date: new Date(draft.date).toISOString(), productIds: selectedProducts }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar el evento.");
      const saved: CalendarEvent = {
        id: result.event.id,
        title: result.event.title,
        description: result.event.description,
        start: new Date(result.event.date).toISOString(),
        productNames: result.event.products.map((product: { name: string }) => product.name),
      };
      setEvents((current) => [...current, saved].sort((a, b) => a.start.localeCompare(b.start)));
      setShowForm(false);
      setNotice("El evento especial se guardó correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  const upcoming = events.filter((event) => new Date(event.start).getTime() >= Date.now()).sort((a, b) => a.start.localeCompare(b.start));

  return <>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="calendar-papiro min-w-0 rounded-2xl border border-[#c7a45a]/14 bg-white/[0.04] p-3 shadow-sm sm:p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          firstDay={1}
          height="auto"
          events={calendarEvents}
          dateClick={clickDate}
          eventClick={showEvent}
          eventDisplay="block"
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          buttonText={{ today: "Hoy" }}
        />
      </div>
      <aside className="space-y-4">
        <button type="button" onClick={() => openForDate()} className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-obsidian shadow-sm transition hover:bg-gold-light"><Plus size={17} /> Agregar evento</button>
        {notice && <div role="status" className="relative rounded-xl border border-gold/30 bg-obsidian-soft p-4 pr-9 text-xs leading-5 text-papyrus/80"><button type="button" onClick={() => setNotice("")} className="absolute right-2 top-2 rounded p-1" aria-label="Cerrar"><X size={14} /></button>{notice}</div>}
        <div className="rounded-2xl border border-[#c7a45a]/14 bg-white/[0.03] p-5">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-[#d8bc7f]"><MoonStar size={15} /> Próximos rituales</p>
          <div className="mt-4 space-y-4">
            {upcoming.length ? upcoming.map((event) => <article key={event.id} className="border-l-2 border-[#c7a45a] pl-3">
              <p className="text-[10px] text-[#d8bc7f]">{new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(event.start))}</p>
              <h3 className="mt-1 font-display text-lg leading-tight">{event.title}</h3>
              <p className="mt-1 text-xs leading-5 text-[#e9e2d2]/55">{event.description}</p>
              {event.productNames.length > 0 && <p className="mt-2 text-[10px] text-[#e9e2d2]/45">{event.productNames.join(" · ")}</p>}
            </article>) : <p className="text-xs leading-5 text-[#e9e2d2]/45">Aún no hay rituales próximos. Agrega una fecha al calendario para compartirla en la Landing.</p>}
          </div>
        </div>
        <p className="flex items-start gap-2 px-1 text-xs leading-5 text-[#e9e2d2]/45"><Sparkles size={14} className="mt-0.5 shrink-0 text-[#d8bc7f]" />Los eventos próximos se muestran automáticamente en la página de inicio.</p>
      </aside>
    </section>

    {showForm && <div className="fixed inset-0 z-[70] grid place-items-center bg-[#05070d]/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="event-form-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#c7a45a]/35 bg-[#11182b] p-6 text-[#e9e2d2] shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#c7a45a]/14 pb-4">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#d8bc7f]">Calendario lunar</p><h2 id="event-form-title" className="mt-1 font-display text-2xl">Nuevo evento especial</h2></div>
          <button type="button" onClick={() => setShowForm(false)} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-white/[0.05]"><X size={18} /></button>
        </div>
        <form onSubmit={saveEvent} className="space-y-4">
          <label className="block text-xs font-semibold">Título<input required minLength={3} maxLength={160} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Luna Llena · Limpieza de Talismanes" className="mt-1.5 h-11 w-full rounded-xl border border-[#c7a45a]/18 bg-[#11182b]/80 px-3 text-sm outline-none focus:border-[#c7a45a]" /></label>
          <label className="block text-xs font-semibold">Fecha y hora<span className="relative mt-1.5 block"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-3 text-[#d8bc7f]" /><input required type="datetime-local" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="h-11 w-full rounded-xl border border-[#c7a45a]/18 bg-[#11182b]/80 pl-9 pr-3 text-sm outline-none focus:border-[#c7a45a]" /></span></label>
          <label className="block text-xs font-semibold">Descripción<textarea required minLength={5} maxLength={2000} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Describe el propósito y la experiencia del encuentro…" className="mt-1.5 w-full resize-y rounded-xl border border-[#c7a45a]/18 bg-[#11182b]/80 p-3 text-sm outline-none focus:border-[#c7a45a]" /></label>
          <fieldset className="rounded-xl border border-[#c7a45a]/14 bg-white/[0.025] p-4"><legend className="px-1 text-xs font-semibold">Productos asociados <span className="font-normal text-[#e9e2d2]/40">(opcional)</span></legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">{products.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-white/[0.06]"><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={(event) => setSelectedProducts((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} className="accent-[#c7a45a]" />{product.name}</label>)}</div>
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="h-11 rounded-xl border border-[#c7a45a]/18 px-4 text-sm">Cancelar</button><button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#c7a45a] px-5 text-sm font-semibold text-[#0b1020] hover:bg-[#E6C766] disabled:opacity-60">{saving ? <Clock3 size={15} className="animate-pulse" /> : <Check size={15} />} {saving ? "Guardando…" : "Guardar evento"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
