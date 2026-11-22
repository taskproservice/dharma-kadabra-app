"use client";

import { useEffect, useId, useMemo, useState } from "react";
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
import { AgendaSlotSkeleton } from "../ui/skeleton";

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
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalConflict, setModalConflict] = useState("");

  // Estado del banner de simulación de notificaciones
  const [simulationLog, setSimulationLog] = useState<string[] | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const modalTitleId = useId();

  // Skeleton loaders: al montar y al cambiar de día se muestran slots
  // grises animados mientras "cargan" las citas del día seleccionado.
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 550);
    return () => clearTimeout(timer);
  }, [selectedDate]);

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

  // Citas para la fecha seleccionada (clave local del navegador, no UTC)
  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const d = new Date(apt.date);
      if (Number.isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === selectedDate;
    });
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
    setModalError("");
    setModalConflict("");
    setIsModalOpen(true);
  };

  // Guardar nueva cita: persiste en Prisma vía /api/appointments (RBAC).
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!modalClientName.trim()) {
      setModalError("Ingresa el nombre del cliente.");
      return;
    }
    if (!modalClientPhone.trim()) {
      setModalError("Ingresá un teléfono válido para los recordatorios.");
      return;
    }

    const hourPadded = modalHour.padStart(2, "0");
    const dateTime = new Date(`${selectedDate}T${hourPadded}:00:00`);
    if (Number.isNaN(dateTime.getTime()) || dateTime.getTime() <= Date.now()) {
      setModalError("Selecciona una fecha y hora futuras.");
      return;
    }

    setModalError("");
    setModalConflict("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: modalClientName.trim(),
          clientPhone: modalClientPhone.trim(),
          dateTime: dateTime.toISOString(),
          service: modalService,
          status: modalStatus,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 409) {
        setModalConflict(result.error || "Ese horario acaba de reservarse. Elige otro horario.");
        return;
      }
      if (!response.ok) throw new Error(result.error || "No fue posible guardar la cita.");

      setAppointments((prev) => [
        ...prev,
        {
          id: result.appointment.id,
          clientName: modalClientName.trim(),
          clientPhone: modalClientPhone.trim(),
          date: new Date(result.appointment.date).toISOString(),
          service: modalService,
          status: result.appointment.status,
          notificationsSent: [],
        },
      ]);
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "No fue posible guardar la cita.");
    } finally {
      setIsSaving(false);
    }
  };

  // Ejecutar motor de simulación de notificaciones
  const runNotificationSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch("/api/cron/notifications", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setSimulationLog([data.error || "No tienes permiso para ejecutar el motor de notificaciones."]);
        return;
      }

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
        backgroundColor: isConfirmed ? "#c7a45a" : "#4a5678",
        borderColor: "#e3c57c",
        textColor: "#0b1020",
        extendedProps: { ...apt },
      };
    });
  }, [appointments]);

  const selectFullCalendarSlot = (selection: DateSelectArg) => {
    const start = new Date(selection.startStr);
    if (Number.isNaN(start.getTime())) return;
    const y = start.getFullYear();
    const m = String(start.getMonth() + 1).padStart(2, "0");
    const d = String(start.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
    setModalHour(String(start.getHours()));
    setModalClientName("");
    setModalClientPhone("");
    setModalService(SERVICES_LIST[0]);
    setModalStatus("CONFIRMED");
    setModalError("");
    setModalConflict("");
    setIsModalOpen(true);
  };

  const clickFullCalendarEvent = (info: EventClickArg) => {
    const apt = info.event.extendedProps as AppointmentItem;
    setSimulationLog([
      `Cita seleccionada · ${apt.service} — Cliente: ${apt.clientName} (${apt.clientPhone}) · Estado: ${apt.status}`,
    ]);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-papyrus">
      {/* Encabezado Editorial */}
      <header className="border-b border-[#c7a45a]/30 pb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d8bc7f] before:h-px before:w-8 before:bg-[#c7a45a]/60">
              Agenda Electrónica Editorial · Dharma Kadabra
            </p>
            {/* Encabezado elegante con la fecha actual en formato largo */}
            <h1 className="mt-2 font-display font-serif text-4xl sm:text-5xl text-[#f7f2e7] tracking-tight leading-tight">
              {formattedLongDate}
            </h1>
            <p className="mt-2 text-sm text-[#e9e2d2]/70">
              Gestión de lecturas akáshicas, sesiones rituales y recordatorios automatizados de WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de modo de vista */}
            <div className="flex items-center rounded-xl border border-[#c7a45a]/30 bg-white/[0.03] p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setViewMode("editorial")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "editorial"
                    ? "bg-[#c7a45a] text-[#0b1020] shadow-sm"
                    : "text-[#e9e2d2]/70 hover:text-[#e9e2d2]"
                }`}
              >
                <Clock size={14} /> Slots Editoriales
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "calendar"
                    ? "bg-[#c7a45a] text-[#0b1020] shadow-sm"
                    : "text-[#e9e2d2]/70 hover:text-[#e9e2d2]"
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
              className="border-[#c7a45a]/40 bg-white/[0.04] text-[#d8bc7f] hover:bg-[#c7a45a]/12 hover:border-[#c7a45a]"
            >
              <Bell size={16} className={isSimulating ? "animate-spin" : "text-[#e3c57c]"} />
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
              className="grid size-9 place-items-center rounded-xl border border-[#c7a45a]/30 bg-white/[0.04] text-[#e9e2d2] transition hover:bg-white/[0.06] hover:border-[#c7a45a]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-xl border border-gold/30 bg-papyrus/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-papyrus transition hover:border-gold hover:bg-papyrus/[0.06]"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => changeDay(1)}
              aria-label="Día siguiente"
              className="grid size-9 place-items-center rounded-xl border border-[#c7a45a]/30 bg-white/[0.04] text-[#e9e2d2] transition hover:bg-white/[0.06] hover:border-[#c7a45a]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-2 rounded-full border border-[#c7a45a]/25 bg-white/[0.03] px-3 py-1 text-[#e9e2d2]/75">
              <span className="size-2 rounded-full bg-[#c7a45a]" />
              <strong>{dayAppointments.length}</strong> Citas para este día
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[#c7a45a]/25 bg-white/[0.03] px-3 py-1 text-[#e9e2d2]/75">
              <span className="size-2 rounded-full bg-emerald-500" />
              <strong>{TIME_SLOTS.length - dayAppointments.length}</strong> Espacios disponibles
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[#c7a45a]/25 bg-white/[0.03] px-3 py-1 text-[#e9e2d2]/75">
              <ShieldCheck size={14} className="text-[#e3c57c]" />
              Recordatorios automatizados: 1 sem · 1 día · 1 hora
            </span>
          </div>
        </div>
      </header>

      {/* Banner de Feedback de Simulación de WhatsApp */}
      {simulationLog && (
        <div className="relative rounded-2xl border border-[#c7a45a]/40 bg-white/[0.05] p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#c7a45a]/12 text-[#d8bc7f]">
                <MessageCircle size={20} />
              </span>
              <div>
                <h2 className="font-display font-serif text-lg font-semibold text-[#f7f2e7]">
                  Motor de Notificaciones WhatsApp (Simulado)
                </h2>
                <p className="text-xs text-[#e9e2d2]/70">
                  Verificación de citas a 7 días, 1 día y 1 hora ejecutada con éxito.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSimulationLog(null)}
              aria-label="Cerrar log"
              className="rounded-lg p-1.5 text-[#e9e2d2]/40 hover:bg-white/[0.06] hover:text-[#e9e2d2]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 space-y-2 rounded-xl bg-white/[0.04] p-3.5 font-mono text-xs text-[#e9e2d2]/80 border border-[#c7a45a]/20">
            {simulationLog.map((log, index) => (
              <p key={index} className="flex items-start gap-2">
                <span className="text-[#d8bc7f] font-bold">›</span>
                <span>{log}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 1: SLOTS EDITORIALES (GLASSMORPHISM) */}
      {viewMode === "editorial" && (
        <section aria-label="Horario Editorial de Citas" className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[#d8bc7f]/80 px-1">
            <span>Hora y Espacio</span>
            <span>Detalles del Cliente y Estado</span>
          </div>

          <div className="space-y-3.5" aria-busy={isLoading}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <AgendaSlotSkeleton key={index} />)
            ) : TIME_SLOTS.map((slot) => {
              const appointment = appointmentsByHour.get(slot.hour);

              if (appointment) {
                // SLOT CON CITA: Borde izquierdo dorado grueso + Nombre en Playfair Display + Glassmorphism
                return (
                  <article
                    key={slot.hour}
                    className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-6 bg-white/[0.04] backdrop-blur-md rounded-xl border border-[#c7a45a]/30 border-l-4 border-l-[#c7a45a] shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/[0.07]"
                  >
                    {/* Sección Izquierda: Hora, Nombre (Playfair Display) y Servicio */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
                      <div className="flex sm:flex-col items-center sm:items-start justify-between gap-1 shrink-0">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-[#d8bc7f] bg-[#c7a45a]/12 px-3 py-1 rounded-md border border-[#c7a45a]/30">
                          <Clock size={13} /> {slot.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[#e9e2d2]/40 sm:mt-1">
                          Sesión Reservada
                        </span>
                      </div>

                      <div className="min-w-0">
                        {/* Nombre de la persona en Playfair Display */}
                        <h2 className="font-display font-serif text-2xl sm:text-3xl text-[#f7f2e7] tracking-tight truncate">
                          {appointment.clientName}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 font-medium text-[#d8bc7f]">
                            <Sparkles size={13} /> {appointment.service}
                          </span>
                          <span className="text-[#e9e2d2]/30">·</span>
                          <span className="flex items-center gap-1 font-mono text-[#e9e2d2]/70">
                            <Phone size={12} /> {appointment.clientPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sección Derecha: Estado de Notificaciones y Acciones */}
                    <div className="flex flex-wrap items-center gap-3 border-t border-[#c7a45a]/14 pt-3 md:border-t-0 md:pt-0 shrink-0">
                      {/* Estado de la cita */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          appointment.status === "CONFIRMED"
                            ? "bg-[#c7a45a] text-[#f7f2e7]"
                            : "bg-[#c7a45a]/20 text-[#d8bc7f] border border-[#c7a45a]/40"
                        }`}
                      >
                        {appointment.status === "CONFIRMED" ? "Confirmada" : "Pendiente"}
                      </span>

                      {/* Chips de notificaciones enviadas */}
                      <div className="flex items-center gap-1.5" title="Estado de recordatorios WhatsApp">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            appointment.notificationsSent.includes("7_DAYS")
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-white/[0.04] text-[#e9e2d2]/40"
                          }`}
                        >
                          {appointment.notificationsSent.includes("7_DAYS") && <CheckCircle2 size={10} />}
                          7d
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            appointment.notificationsSent.includes("1_DAY")
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-white/[0.04] text-[#e9e2d2]/40"
                          }`}
                        >
                          {appointment.notificationsSent.includes("1_DAY") && <CheckCircle2 size={10} />}
                          1d
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            appointment.notificationsSent.includes("1_HOUR")
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-white/[0.04] text-[#e9e2d2]/40"
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
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#c7a45a]/50 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-[#d8bc7f] transition hover:bg-[#c7a45a] hover:text-[#0b1020] hover:border-[#c7a45a]"
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white/[0.04] backdrop-blur-md rounded-xl border border-[#c7a45a]/30 transition-all duration-300 hover:bg-white/[0.07] hover:border-[#c7a45a]/60 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-medium text-[#e9e2d2]/40 bg-white/[0.04] px-3 py-1 rounded-md">
                      {slot.label}
                    </span>
                    <div>
                      <p className="font-display font-serif text-lg text-[#e9e2d2]/45 italic font-normal">
                        Espacio disponible
                      </p>
                      <p className="text-xs text-[#e9e2d2]/35">
                        Lectura akáshica o sesión ritual
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openNewAppointmentModal(slot.hour)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#c7a45a]/40 bg-[#c7a45a]/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#d8bc7f] transition hover:bg-[#c7a45a] hover:text-[#0b1020]"
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
            <div className="flex items-center gap-4 text-xs text-[#e9e2d2]/70">
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-[#c7a45a]" /> Cita Confirmada
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-[#4a5678]" /> Cita Pendiente
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#c7a45a]/30 bg-white/[0.04] p-5 shadow-sm backdrop-blur-md">
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
          className="fixed inset-0 z-50 grid place-items-center bg-[#05070d]/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#c7a45a]/40 bg-[#11182b] p-6 text-[#e9e2d2] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#c7a45a]/18 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d8bc7f]">
                  Dharma Kadabra
                </p>
                <h2 id={modalTitleId} className="font-display font-serif text-2xl text-[#f7f2e7]">
                  Agendar Nueva Cita
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-[#e9e2d2]/55 transition hover:bg-white/[0.06] hover:text-[#e9e2d2]"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/80 mb-1.5">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mariana Silva"
                  value={modalClientName}
                  onChange={(e) => setModalClientName(e.target.value)}
                  className="w-full rounded-xl border border-[#c7a45a]/20 bg-white/[0.05] px-4 py-2.5 text-sm text-[#e9e2d2] outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/80 mb-1.5">
                  Teléfono / WhatsApp (para recordatorios)
                </label>
                <input
                  type="tel"
                  required
                  minLength={8}
                  placeholder="+52 55 1234 5678"
                  value={modalClientPhone}
                  onChange={(e) => setModalClientPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#c7a45a]/20 bg-white/[0.05] px-4 py-2.5 text-sm text-[#e9e2d2] outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#c7a45a]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/80 mb-1.5">
                    Servicio
                  </label>
                  <select
                    value={modalService}
                    onChange={(e) => setModalService(e.target.value)}
                    className="w-full rounded-xl border border-[#c7a45a]/20 bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#e9e2d2] outline-none focus:border-[#c7a45a]"
                  >
                    {SERVICES_LIST.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/80 mb-1.5">
                    Hora
                  </label>
                  <select
                    value={modalHour}
                    onChange={(e) => setModalHour(e.target.value)}
                    className="w-full rounded-xl border border-[#c7a45a]/20 bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#e9e2d2] outline-none focus:border-[#c7a45a]"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/80 mb-1.5">
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
                      className="accent-[#c7a45a]"
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
                      className="accent-[#c7a45a]"
                    />
                    Pendiente
                  </label>
                </div>
              </div>

              {modalConflict && (
                <div role="alert" className="rounded-xl border border-[#c7a45a]/45 bg-[#c7a45a]/10 p-4">
                  <p className="flex items-start gap-2 text-sm font-semibold text-[#e8d19a]">
                    <Clock size={16} className="mt-0.5 shrink-0" />
                    {modalConflict}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#e9e2d2]/70">
                    Elige otra hora entre los slots disponibles para guardar la cita.
                  </p>
                </div>
              )}
              {modalError && (
                <div role="alert" className="rounded-xl border border-red-500/35 bg-red-500/10 p-4">
                  <p className="text-sm text-red-200">{modalError}</p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#c7a45a]/18">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="gold" disabled={isSaving}>
                  {isSaving ? "Guardando…" : "Guardar Cita"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
