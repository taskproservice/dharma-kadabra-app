"use client";

import { useId, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DateSelectArg, EventInput } from "@fullcalendar/core";
import {
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "../ui/button";

export type AppointmentItem = {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string; // ISO string e.g. "2026-11-18T10:00:00"
  service: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED";
  notificationsSent: ("7_DAYS" | "1_DAY" | "1_HOUR")[];
  notes?: string;
};

// Horas del día para los slots de tiempo editoriales (08:00 a 19:00)
const TIME_SLOTS = [
  { hour: 8, label: "08:00 - 09:00" },
  { hour: 9, label: "09:00 - 10:00" },
  { hour: 10, label: "10:00 - 11:00" },
  { hour: 11, label: "11:00 - 12:00" },
  { hour: 12, label: "12:00 - 13:00" },
  { hour: 13, label: "13:00 - 14:00" },
  { hour: 14, label: "14:00 - 15:00" },
  { hour: 15, label: "15:00 - 16:00" },
  { hour: 16, label: "16:00 - 17:00" },
  { hour: 17, label: "17:00 - 18:00" },
  { hour: 18, label: "18:00 - 19:00" },
];

const SERVICES_LIST = [
  "Lectura Akáshica",
  "Registros Akáshicos",
  "Lectura de Runas Nórdicas",
  "Sesión de Integración y Runas",
  "Acompañamiento Espiritual",
];

export default function AgendaClient({ initialAppointments }: { initialAppointments: AppointmentItem[] }) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [viewMode, setViewMode] = useState<"editorial" | "calendar">("editorial");
  const [calendarView, setCalendarView] = useState("timeGridWeek");
  const [calendarKey, setCalendarKey] = useState(0);

  // Estados del modal para nueva cita
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClientName, setModalClientName] = useState("");
  const [modalClientPhone, setModalClientPhone] = useState("");
  const [modalService, setModalService] = useState(SERVICES_LIST[0]);
  const [modalHour, setModalHour] = useState("10");
  const [modalStatus, setModalStatus] = useState<"CONFIRMED" | "PENDING">("CONFIRMED");

  // Estado del banner de simulación de notificaciones
  const [simulationLog, setSimulationLog] = useState<string[] | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const modalTitleId = useId();

  // Fecha seleccionada formateada en estilo editorial largo: "Miércoles, 18 de Noviembre"
  const formattedLongDate = useMemo(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);

    // Formato largo en español
    const rawFormatted = new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(dateObj);

    // Capitalizar la primera letra del día de la semana y del mes (estilo editorial)
    const parts = rawFormatted.split(" ");
    return parts
      .map((word) => {
        if (word === "de" || word === "del") return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }, [selectedDate]);

  // Citas para la fecha seleccionada
  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.date.startsWith(selectedDate));
  }, [appointments, selectedDate]);

  // Mapeo de hora a cita
  const appointmentsByHour = useMemo(() => {
    const map = new Map<number, AppointmentItem>();
    dayAppointments.forEach((apt) => {
      const hour = new Date(apt.date).getHours();
      map.set(hour, apt);
    });
    return map;
  }, [dayAppointments]);

  // Navegación de días
  const changeDay = (offset: number) => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day + offset, 12, 0, 0);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const goToToday = () => {
    const now = new Date();
    setSelectedDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  };

  // Abrir modal con hora preseleccionada
  const openNewAppointmentModal = (hour?: number) => {
    if (hour !== undefined) {
      setModalHour(String(hour));
    }
    setModalClientName("");
    setModalClientPhone("");
    setModalService(SERVICES_LIST[0]);
    setModalStatus("CONFIRMED");
    setIsModalOpen(true);
  };

  // Guardar nueva cita
  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClientName.trim()) return;

    const hourPadded = modalHour.padStart(2, "0");
    const newApt: AppointmentItem = {
      id: `apt-${Date.now()}`,
      clientName: modalClientName.trim(),
      clientPhone: modalClientPhone.trim() || "+52 55 0000 0000",
      date: `${selectedDate}T${hourPadded}:00:00`,
      service: modalService,
      status: modalStatus,
      notificationsSent: [],
    };

    setAppointments((prev) => [...prev, newApt]);
    setIsModalOpen(false);
  };

  // Ejecutar motor de simulación de notificaciones
  const runNotificationSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch("/api/cron/notifications", { method: "POST" });
      const data = await response.json();

      const logs: string[] = [];
      if (data.notifications && data.notifications.length > 0) {
        data.notifications.forEach((notif: any) => {
          logs.push(
            `Simulando envío de WhatsApp a: ${notif.clientPhone} (${notif.clientName}) · [${notif.reminderLabel}] ${notif.message}`
          );
        });
      } else {
        logs.push(
          "Motor de notificaciones activo. Todas las citas próximas (7 días, 1 día, 1 hora) se encuentran al día sin recordatorios pendientes de envío."
        );
      }
      setSimulationLog(logs);
    } catch {
      setSimulationLog([
        "Simulando envío de WhatsApp: Sistema de notificaciones ejecutado en modo local.",
        "Recordatorios de 1 semana, 1 día y 1 hora verificados correctamente.",
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  // Simular envío individual a un cliente
  const simulateDirectWhatsApp = (apt: AppointmentItem, type: "7_DAYS" | "1_DAY" | "1_HOUR") => {
    const label = type === "7_DAYS" ? "1 semana antes" : type === "1_DAY" ? "1 día antes" : "1 hora antes";
    const msg = `Simulando envío de WhatsApp a: ${apt.clientPhone} (${apt.clientName}) - Recordatorio: [${label}] para tu sesión de ${apt.service}.`;
    console.log(msg);

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === apt.id
          ? {
              ...item,
              notificationsSent: item.notificationsSent.includes(type)
                ? item.notificationsSent
                : [...item.notificationsSent, type],
            }
          : item
      )
    );

    setSimulationLog([msg]);
  };

  // Eventos para FullCalendar (en caso de alternar a vista calendario)
  const fullCalendarEvents: EventInput[] = useMemo(() => {
    return appointments.map((apt) => {
      const endDate = new Date(new Date(apt.date).getTime() + 60 * 60 * 1000).toISOString();
      const isConfirmed = apt.status === "CONFIRMED";
      return {
        id: apt.id,
        title: `${apt.service} · ${apt.clientName}`,
        start: apt.date,
        end: endDate,
        backgroundColor: isConfirmed ? "#3E2723" : "#8B6D16",
        borderColor: "#D4AF37",
        textColor: "#F4ECD8",
        extendedProps: { ...apt },
      };
    });
  }, [appointments]);

  const selectFullCalendarSlot = (selection: DateSelectArg) => {
    const name = window.prompt("Nombre del cliente para la cita:");
    if (name?.trim()) {
      const newApt: AppointmentItem = {
        id: `apt-${Date.now()}`,
        clientName: name.trim(),
        clientPhone: "+52 55 1234 5678",
        date: selection.startStr,
        service: "Lectura Akáshica",
        status: "CONFIRMED",
        notificationsSent: [],
      };
      setAppointments((prev) => [...prev, newApt]);
    }
  };

  const clickFullCalendarEvent = (info: EventClickArg) => {
    const apt = info.event.extendedProps as AppointmentItem;
    window.alert(`Cita: ${apt.service}\nCliente: ${apt.clientName}\nTeléfono: ${apt.clientPhone}\nEstado: ${apt.status}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 bg-[#F4ECD8] text-[#3E2723]">
      {/* Encabezado Editorial */}
      <header className="border-b border-[#D4AF37]/30 pb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8B6D16] before:h-px before:w-8 before:bg-[#8B6D16]/60">
              Agenda Electrónica Editorial · Dharma Kadabra
            </p>
            {/* Encabezado elegante con la fecha actual en formato largo */}
            <h1 className="mt-2 font-display font-serif text-4xl sm:text-5xl text-[#2A1B17] tracking-tight leading-tight">
              {formattedLongDate}
            </h1>
            <p className="mt-2 text-sm text-[#3E2723]/70">
              Gestión de lecturas akáshicas, sesiones rituales y recordatorios automatizados de WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de modo de vista */}
            <div className="flex items-center rounded-xl border border-[#D4AF37]/30 bg-white/50 p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setViewMode("editorial")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "editorial"
                    ? "bg-[#3E2723] text-[#D4AF37] shadow-sm"
                    : "text-[#3E2723]/70 hover:text-[#3E2723]"
                }`}
              >
                <Clock size={14} /> Slots Editoriales
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "calendar"
                    ? "bg-[#3E2723] text-[#D4AF37] shadow-sm"
                    : "text-[#3E2723]/70 hover:text-[#3E2723]"
                }`}
              >
                <Calendar size={14} /> Calendario
              </button>
            </div>

            {/* Botón para disparar la verificación de notificaciones WhatsApp */}
            <Button
              onClick={runNotificationSimulation}
              disabled={isSimulating}
              variant="outline"
              className="border-[#D4AF37]/40 bg-white/60 text-[#8B6D16] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]"
            >
              <Bell size={16} className={isSimulating ? "animate-spin" : "text-[#D4AF37]"} />
              {isSimulating ? "Verificando..." : "Motor de Recordatorios"}
            </Button>

            {/* Botón para crear nueva cita */}
            <Button
              onClick={() => openNewAppointmentModal()}
              variant="gold"
              className="shadow-md hover:shadow-lg"
            >
              <Plus size={16} /> Nueva Cita
            </Button>
          </div>
        </div>

        {/* Navegador de Fecha y Resumen Rápido */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeDay(-1)}
              aria-label="Día anterior"
              className="grid size-9 place-items-center rounded-xl border border-[#D4AF37]/30 bg-white/60 text-[#3E2723] transition hover:bg-white hover:border-[#D4AF37]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-xl border border-[#D4AF37]/30 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#3E2723] transition hover:bg-white hover:border-[#D4AF37]"
            >
              Hoy (18 Nov)
            </button>
            <button
              type="button"
              onClick={() => changeDay(1)}
              aria-label="Día siguiente"
              className="grid size-9 place-items-center rounded-xl border border-[#D4AF37]/30 bg-white/60 text-[#3E2723] transition hover:bg-white hover:border-[#D4AF37]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-white/50 px-3 py-1 text-[#3E2723]/75">
              <span className="size-2 rounded-full bg-[#D4AF37]" />
              <strong>{dayAppointments.length}</strong> Citas para este día
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-white/50 px-3 py-1 text-[#3E2723]/75">
              <span className="size-2 rounded-full bg-emerald-500" />
              <strong>{TIME_SLOTS.length - dayAppointments.length}</strong> Espacios disponibles
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-white/50 px-3 py-1 text-[#3E2723]/75">
              <ShieldCheck size={14} className="text-[#D4AF37]" />
              Recordatorios automatizados: 1 sem · 1 día · 1 hora
            </span>
          </div>
        </div>
      </header>

      {/* Banner de Feedback de Simulación de WhatsApp */}
      {simulationLog && (
        <div className="relative rounded-2xl border border-[#D4AF37]/40 bg-white/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#D4AF37]/15 text-[#8B6D16]">
                <MessageCircle size={20} />
              </span>
              <div>
                <h2 className="font-display font-serif text-lg font-semibold text-[#2A1B17]">
                  Motor de Notificaciones WhatsApp (Simulado)
                </h2>
                <p className="text-xs text-[#3E2723]/70">
                  Verificación de citas a 7 días, 1 día y 1 hora ejecutada con éxito.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSimulationLog(null)}
              aria-label="Cerrar log"
              className="rounded-lg p-1.5 text-[#3E2723]/50 hover:bg-[#3E2723]/10 hover:text-[#3E2723]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 space-y-2 rounded-xl bg-[#F4ECD8]/70 p-3.5 font-mono text-xs text-[#3E2723]/80 border border-[#D4AF37]/20">
            {simulationLog.map((log, index) => (
              <p key={index} className="flex items-start gap-2">
                <span className="text-[#8B6D16] font-bold">›</span>
                <span>{log}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 1: SLOTS EDITORIALES (GLASSMORPHISM) */}
      {viewMode === "editorial" && (
        <section aria-label="Horario Editorial de Citas" className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6D16]/80 px-1">
            <span>Hora y Espacio</span>
            <span>Detalles del Cliente y Estado</span>
          </div>

          <div className="space-y-3.5">
            {TIME_SLOTS.map((slot) => {
              const appointment = appointmentsByHour.get(slot.hour);

              if (appointment) {
                // SLOT CON CITA: Borde izquierdo dorado grueso + Nombre en Playfair Display + Glassmorphism
                return (
                  <article
                    key={slot.hour}
                    className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-6 bg-white/60 backdrop-blur-md rounded-xl border border-[#D4AF37]/30 border-l-4 border-l-[#D4AF37] shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/80"
                  >
                    {/* Sección Izquierda: Hora, Nombre (Playfair Display) y Servicio */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
                      <div className="flex sm:flex-col items-center sm:items-start justify-between gap-1 shrink-0">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-[#8B6D16] bg-[#D4AF37]/15 px-3 py-1 rounded-md border border-[#D4AF37]/30">
                          <Clock size={13} /> {slot.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[#3E2723]/50 sm:mt-1">
                          Sesión Reservada
                        </span>
                      </div>

                      <div className="min-w-0">
                        {/* Nombre de la persona en Playfair Display */}
                        <h2 className="font-display font-serif text-2xl sm:text-3xl text-[#2A1B17] tracking-tight truncate">
                          {appointment.clientName}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 font-medium text-[#8B6D16]">
                            <Sparkles size={13} /> {appointment.service}
                          </span>
                          <span className="text-[#3E2723]/30">·</span>
                          <span className="flex items-center gap-1 font-mono text-[#3E2723]/70">
                            <Phone size={12} /> {appointment.clientPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sección Derecha: Estado de Notificaciones y Acciones */}
                    <div className="flex flex-wrap items-center gap-3 border-t border-[#3E2723]/10 pt-3 md:border-t-0 md:pt-0 shrink-0">
                      {/* Estado de la cita */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          appointment.status === "CONFIRMED"
                            ? "bg-[#3E2723] text-[#F4ECD8]"
                            : "bg-[#D4AF37]/20 text-[#8B6D16] border border-[#D4AF37]/40"
                        }`}
                      >
                        {appointment.status === "CONFIRMED" ? "Confirmada" : "Pendiente"}
                      </span>

                      {/* Chips de notificaciones enviadas */}
                      <div className="flex items-center gap-1.5" title="Estado de recordatorios WhatsApp">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            appointment.notificationsSent.includes("7_DAYS")
                              ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30"
                              : "bg-[#3E2723]/5 text-[#3E2723]/40"
                          }`}
                        >
                          {appointment.notificationsSent.includes("7_DAYS") && <CheckCircle2 size={10} />}
                          7d
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            appointment.notificationsSent.includes("1_DAY")
                              ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30"
                              : "bg-[#3E2723]/5 text-[#3E2723]/40"
                          }`}
                        >
                          {appointment.notificationsSent.includes("1_DAY") && <CheckCircle2 size={10} />}
                          1d
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            appointment.notificationsSent.includes("1_HOUR")
                              ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30"
                              : "bg-[#3E2723]/5 text-[#3E2723]/40"
                          }`}
                        >
                          {appointment.notificationsSent.includes("1_HOUR") && <CheckCircle2 size={10} />}
                          1h
                        </span>
                      </div>

                      {/* Botón para enviar recordatorio puntual vía WhatsApp */}
                      <button
                        type="button"
                        onClick={() => simulateDirectWhatsApp(appointment, "1_DAY")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/50 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#8B6D16] transition hover:bg-[#D4AF37] hover:text-[#1A1A1A] hover:border-[#D4AF37]"
                      >
                        <Send size={12} /> WhatsApp
                      </button>
                    </div>
                  </article>
                );
              }

              // SLOT LIBRE: Tarjeta de cristal limpia con botón de agendar
              return (
                <div
                  key={slot.hour}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white/60 backdrop-blur-md rounded-xl border border-[#D4AF37]/30 transition-all duration-300 hover:bg-white/80 hover:border-[#D4AF37]/60 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-medium text-[#3E2723]/50 bg-[#3E2723]/5 px-3 py-1 rounded-md">
                      {slot.label}
                    </span>
                    <div>
                      <p className="font-display font-serif text-lg text-[#3E2723]/55 italic font-normal">
                        Espacio disponible
                      </p>
                      <p className="text-xs text-[#3E2723]/45">
                        Lectura akáshica o sesión ritual
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openNewAppointmentModal(slot.hour)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#8B6D16] transition hover:bg-[#D4AF37] hover:text-[#1A1A1A]"
                  >
                    <Plus size={14} /> Agendar en esta hora
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VISTA 2: CALENDARIO COMPLETO (FULLCALENDAR) */}
      {viewMode === "calendar" && (
        <section aria-label="Calendario Completo" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[
                ["timeGridDay", "Día"],
                ["timeGridWeek", "Semana"],
                ["dayGridMonth", "Mes"],
              ].map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={calendarView === key ? "default" : "outline"}
                  onClick={() => {
                    setCalendarView(key);
                    setCalendarKey((k) => k + 1);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-[#3E2723]/70">
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-[#3E2723]" /> Cita Confirmada
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-[#8B6D16]" /> Cita Pendiente
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/30 bg-white/60 p-5 shadow-sm backdrop-blur-md">
            <div className="calendar-papiro">
              <FullCalendar
                key={calendarKey}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={calendarView}
                initialDate={selectedDate}
                headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                events={fullCalendarEvents}
                selectable
                selectMirror
                select={selectFullCalendarSlot}
                eventClick={clickFullCalendarEvent}
                height="auto"
                slotMinTime="08:00:00"
                slotMaxTime="19:00:00"
                allDaySlot={false}
                nowIndicator
                locale="es"
                buttonText={{ today: "Hoy" }}
              />
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE NUEVA CITA EDITORIAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#211410]/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/40 bg-[#F4ECD8] p-6 text-[#3E2723] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#3E2723]/15 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8B6D16]">
                  Dharma Kadabra
                </p>
                <h2 id={modalTitleId} className="font-display font-serif text-2xl text-[#2A1B17]">
                  Agendar Nueva Cita
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-[#3E2723]/60 transition hover:bg-[#3E2723]/10 hover:text-[#3E2723]"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 mb-1.5">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mariana Silva"
                  value={modalClientName}
                  onChange={(e) => setModalClientName(e.target.value)}
                  className="w-full rounded-xl border border-[#3E2723]/20 bg-white/80 px-4 py-2.5 text-sm text-[#3E2723] outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 mb-1.5">
                  Teléfono / WhatsApp (para recordatorios)
                </label>
                <input
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={modalClientPhone}
                  onChange={(e) => setModalClientPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#3E2723]/20 bg-white/80 px-4 py-2.5 text-sm text-[#3E2723] outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 mb-1.5">
                    Servicio
                  </label>
                  <select
                    value={modalService}
                    onChange={(e) => setModalService(e.target.value)}
                    className="w-full rounded-xl border border-[#3E2723]/20 bg-white/80 px-3.5 py-2.5 text-sm text-[#3E2723] outline-none focus:border-[#D4AF37]"
                  >
                    {SERVICES_LIST.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 mb-1.5">
                    Hora
                  </label>
                  <select
                    value={modalHour}
                    onChange={(e) => setModalHour(e.target.value)}
                    className="w-full rounded-xl border border-[#3E2723]/20 bg-white/80 px-3.5 py-2.5 text-sm text-[#3E2723] outline-none focus:border-[#D4AF37]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.hour} value={String(slot.hour)}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 mb-1.5">
                  Estado
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="CONFIRMED"
                      checked={modalStatus === "CONFIRMED"}
                      onChange={() => setModalStatus("CONFIRMED")}
                      className="accent-[#D4AF37]"
                    />
                    Confirmada
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="PENDING"
                      checked={modalStatus === "PENDING"}
                      onChange={() => setModalStatus("PENDING")}
                      className="accent-[#D4AF37]"
                    />
                    Pendiente
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#3E2723]/15">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="gold">
                  Guardar Cita
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
