"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DateSelectArg, EventInput } from "@fullcalendar/core";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

const initialEvents = [
  { id: "1", title: "Lectura akáshica · Mariana", start: "2026-11-18T10:00:00", end: "2026-11-18T11:00:00", backgroundColor: "#3E2723", borderColor: "#3E2723", extendedProps: { status: "Reservada" } },
  { id: "2", title: "Disponible · Lectura akáshica", start: "2026-11-18T11:30:00", end: "2026-11-18T12:30:00", backgroundColor: "#D4AF37", borderColor: "#D4AF37", textColor: "#3E2723", extendedProps: { status: "Disponible" } },
  { id: "3", title: "Lectura akáshica · Sofía", start: "2026-11-18T14:00:00", end: "2026-11-18T15:00:00", backgroundColor: "#3E2723", borderColor: "#3E2723", extendedProps: { status: "Reservada" } },
  { id: "4", title: "Disponible · Lectura akáshica", start: "2026-11-19T09:30:00", end: "2026-11-19T10:30:00", backgroundColor: "#D4AF37", borderColor: "#D4AF37", textColor: "#3E2723", extendedProps: { status: "Disponible" } },
  { id: "5", title: "Sesión de integración · Lucía", start: "2026-11-20T12:00:00", end: "2026-11-20T13:00:00", backgroundColor: "#8B6D16", borderColor: "#8B6D16", extendedProps: { status: "Reservada" } },
];

export default function AgendaPage() {
  const [events, setEvents] = useState<EventInput[]>(initialEvents);
  const [view, setView] = useState("timeGridWeek");
  const [calendarKey, setCalendarKey] = useState(0);
  const selectSlot = (selection: DateSelectArg) => {
    const title = window.prompt("Nombre de la cita akáshica:");
    if (title?.trim()) setEvents((list) => [...list, { id: String(Date.now()), title: `Lectura akáshica · ${title.trim()}`, start: selection.startStr, end: selection.endStr, backgroundColor: "#3E2723", borderColor: "#3E2723", extendedProps: { status: "Reservada" } }]);
  };
  const clickEvent = (info: EventClickArg) => {
    const status = info.event.extendedProps.status;
    if (status === "Disponible" && window.confirm("¿Reservar este espacio para una lectura akáshica?")) {
      info.event.setProp("title", "Lectura akáshica · Nueva reserva"); info.event.setProp("backgroundColor", "#3E2723"); info.event.setProp("borderColor", "#3E2723"); info.event.setExtendedProp("status", "Reservada");
      setEvents((list) => list.map((event) => event.id === info.event.id ? { ...event, title: "Lectura akáshica · Nueva reserva", backgroundColor: "#3E2723", borderColor: "#3E2723", extendedProps: { status: "Reservada" } } : event));
    } else if (status !== "Disponible") window.alert(info.event.title);
  };
  const changeView = (next: string) => { setView(next); setCalendarKey((key) => key + 1); };
  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-[#9A7B28]">Organiza tu energía y tu tiempo</p><h1 className="mt-1 text-3xl font-semibold">Agenda electrónica</h1><p className="mt-2 text-[#3E2723]/60">Administra lecturas akáshicas, sesiones y espacios disponibles.</p></div><Button onClick={() => { const title = window.prompt("Nombre del cliente:"); if (title) setEvents((list) => [...list, { id: String(Date.now()), title: `Lectura akáshica · ${title}`, start: new Date().toISOString(), backgroundColor: "#3E2723", borderColor: "#3E2723", extendedProps: { status: "Reservada" } }]); }}><Plus size={16}/>Nueva cita</Button></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2">{[["timeGridDay", "Día"], ["timeGridWeek", "Semana"], ["dayGridMonth", "Mes"]].map(([key, label]) => <Button key={key} size="sm" variant={view === key ? "default" : "outline"} onClick={() => changeView(key)}>{label}</Button>)}</div><div className="flex items-center gap-4 text-xs text-[#3E2723]/65"><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-[#D4AF37]"/>Disponible</span><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-[#3E2723]"/>Reservada</span></div></div>
    <Card className="p-4 sm:p-6"><div className="mb-4 flex items-center gap-2 text-sm text-[#3E2723]/55"><CalendarDays size={16}/>Selecciona un espacio libre para reservarlo · También puedes arrastrar sobre el calendario para crear una cita.</div><div className="calendar-papiro"><FullCalendar key={calendarKey} plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView={view} initialDate="2026-11-18" headerToolbar={{ left: "prev,next today", center: "title", right: "" }} events={events} selectable selectMirror select={selectSlot} eventClick={clickEvent} height="auto" slotMinTime="08:00:00" slotMaxTime="19:00:00" allDaySlot={false} nowIndicator locale="es" buttonText={{ today: "Hoy" }} /></div></Card>
  </div>;
}
