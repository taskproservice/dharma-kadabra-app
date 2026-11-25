"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Flower2,
  Moon,
  MoonStar,
  Sparkles,
} from "lucide-react";
import { getLunarInfo, getMonthlyLunarEvents, type MonthlyLunarEvent } from "../../lib/lunar-utils";
import {
  WEEKDAYS,
  dateFromKey,
  findFirstAvailableDate,
  formatTime,
  getCalendarDates,
  getAvailableSlotsForDate,
  isDateAvailable,
  shiftMonth,
  toLocalDateKey,
} from "../../lib/agenda-availability";
import { formatSessionPrice, services, type Service } from "../../lib/data/services";
import type { PublicCollaborator } from "../../lib/therapists";
import { BookingDialog } from "./booking-dialog";
import { TherapistAvatar, TherapistSelector } from "../agenda/therapist-selector";
import { useCollaborators } from "../agenda/use-collaborators";
import { Dialog } from "../ui/dialog";

function formatDate(dateKey: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", { ...options, timeZone: "UTC" }).format(dateFromKey(dateKey));
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("es-MX") + value.slice(1);
}

function phaseGuidance(phase: string) {
  if (phase === "Luna llena") return "Un momento simbólico para agradecer, soltar y limpiar.";
  if (phase === "Luna nueva") return "Ideal para sembrar intenciones y comenzar un nuevo ciclo.";
  return "Una pausa para escuchar tu intuición y elegir con calma.";
}

function LunarMarker({ phase }: { phase: string }) {
  if (phase === "Luna llena") {
    return <Circle size={13} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />;
  }
  if (phase === "Luna nueva") {
    return <MoonStar size={14} strokeWidth={1.5} aria-hidden="true" />;
  }
  return null;
}

function LunarEventIcon({ phase }: { phase: MonthlyLunarEvent["phase"] }) {
  if (phase === "Luna nueva" || phase === "Luna llena") {
    return <LunarMarker phase={phase} />;
  }
  return <Moon size={16} strokeWidth={1.5} className={phase === "Cuarto menguante" ? "rotate-180" : ""} aria-hidden="true" />;
}

export function DigitalAgenda({ todayKey: serverTodayKey }: { todayKey: string }) {
  // SSR muestra la fecha del servidor; en el cliente se usa la fecha local
  // para marcar pasadas/futuras y filtrar sólo horarios vigentes.
  const [todayKey, setTodayKey] = useState(serverTodayKey);
  useEffect(() => {
    const local = toLocalDateKey(new Date());
    setTodayKey((current) => (current === local ? current : local));
    setActiveMonth((current) => {
      const localMonth = local.slice(0, 7);
      return current === localMonth ? current : localMonth;
    });
  }, []);

  const currentMonth = todayKey.slice(0, 7);
  const [activeMonth, setActiveMonth] = useState(serverTodayKey.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateAvailability, setShowDateAvailability] = useState(false);
  // Horarios bloqueados por citas reales (null = cargando). Lista de instantes ISO.
  const [blockedTimes, setBlockedTimes] = useState<string[] | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  // Incrementar para forzar un refresco de disponibilidad (p. ej. tras reservar).
  const [loadTick, setLoadTick] = useState(0);

  // FASE 1 · Terapeuta elegido (null = disponibilidad de toda la casa, solo
  // mientras carga el equipo o si no hay cuentas agendables).
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const { collaborators, error: collaboratorsError } = useCollaborators();
  const selectedTherapist = useMemo(
    () => collaborators?.find((person) => person.id === selectedTherapistId) ?? null,
    [collaborators, selectedTherapistId],
  );

  // Preselecciona la primera agenda del equipo (la dirección va primero) para
  // que el calendario nunca quede sin terapeuta asignado.
  useEffect(() => {
    if (!collaborators || collaborators.length === 0) return;
    setSelectedTherapistId((current) =>
      current && collaborators.some((person) => person.id === current) ? current : collaborators[0].id,
    );
  }, [collaborators]);

  const calendarDates = useMemo(() => getCalendarDates(activeMonth), [activeMonth]);
  const lunarEvents = useMemo(() => getMonthlyLunarEvents(activeMonth), [activeMonth]);

  // Carga la disponibilidad REAL del mes y del terapeuta elegido: solo las
  // citas PENDING/CONFIRMED de esa agenda restan horarios.
  useEffect(() => {
    let cancelled = false;
    setBlockedTimes(null);
    setAvailabilityError(null);
    const assigneeQuery = selectedTherapistId ? `&assigneeId=${encodeURIComponent(selectedTherapistId)}` : "";
    fetch(`/api/availability?month=${activeMonth}${assigneeQuery}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return Array.isArray(data?.blocked) ? data.blocked : [];
      })
      .then((blocked) => {
        if (cancelled) return;
        setBlockedTimes(blocked);
      })
      .catch(() => {
        if (cancelled) return;
        setBlockedTimes([]);
        setAvailabilityError("No pudimos cargar la disponibilidad en este momento.");
      });
    return () => {
      cancelled = true;
    };
  }, [activeMonth, selectedTherapistId, loadTick]);

  // En cada cambio de mes o de terapeuta (y al cargar/refrescar), selecciona el
  // primer día disponible. La elección del usuario se mantiene si el día aún
  // tiene horarios.
  useEffect(() => {
    if (blockedTimes === null || availabilityError) return;
    setSelectedDate((current) => {
      if (current && current.slice(0, 7) === activeMonth && isDateAvailable(current, blockedTimes, todayKey)) return current;
      return findFirstAvailableDate(activeMonth, todayKey, blockedTimes) ?? null;
    });
  }, [blockedTimes, availabilityError, activeMonth, todayKey]);

  const refreshAvailability = useCallback(() => setLoadTick((tick) => tick + 1), []);

  const selectedSlots = useMemo(
    () => (selectedDate && blockedTimes ? getAvailableSlotsForDate(selectedDate, blockedTimes) : []),
    [selectedDate, blockedTimes],
  );
  const upcomingSessions = useMemo(() => {
    if (blockedTimes === null || availabilityError) return [];
    return calendarDates
      .filter((dateKey) => dateKey.slice(0, 7) === activeMonth && dateKey >= todayKey)
      .flatMap((dateKey) => {
        const firstAvailableTime = getAvailableSlotsForDate(dateKey, blockedTimes)[0];
        return firstAvailableTime ? [{ date: dateKey, time: firstAvailableTime }] : [];
      })
      .slice(0, 3);
  }, [activeMonth, availabilityError, blockedTimes, calendarDates, todayKey]);
  const selectedPhase = useMemo(
    () => (selectedDate ? getLunarInfo(dateFromKey(selectedDate)).phase : ""),
    [selectedDate],
  );
  const monthLabel = capitalize(
    formatDate(`${activeMonth}-01`, { month: "long", year: "numeric" }),
  );
  const selectedDateLabel = capitalize(
    formatDate(selectedDate ?? `${activeMonth}-01`, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  );
  const previousMonthDisabled = activeMonth <= currentMonth;

  function changeMonth(amount: number) {
    setShowDateAvailability(false);
    setActiveMonth(shiftMonth(activeMonth, amount));
  }

  return (
    <section id="calendario" aria-label="Calendario interactivo de disponibilidad" className="scroll-mt-24 px-5 pb-16 sm:px-8 lg:pb-24">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.85fr)] lg:items-start">
        {/* Calendario mensual con superficie marfil y bordes suaves */}
        <div className="relative min-w-0 overflow-hidden rounded-3xl border border-stone-200 bg-[#FCFAF5] p-5 text-ink shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-7">
          <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.10),transparent_70%)] blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5 border-b border-stone-200 pb-5 sm:pb-6">
            <div>
              <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.24em] text-bronze">
                <CalendarDays size={13} className="mr-2 inline -translate-y-px" aria-hidden="true" />
                Calendario mensual
              </p>
              <h2 className="mt-1 font-cormorant text-3xl leading-none text-ink sm:text-4xl">
                {monthLabel}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Mes anterior"
                disabled={previousMonthDisabled}
                onClick={() => changeMonth(-1)}
                className="grid size-10 place-items-center rounded-full border border-stone-200 bg-white text-bronze transition hover:border-gold/60 hover:bg-gold/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Mes siguiente"
                onClick={() => changeMonth(1)}
                className="grid size-10 place-items-center rounded-full border border-stone-200 bg-white text-bronze transition hover:border-gold/60 hover:bg-gold/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <TherapistSelector
            collaborators={collaborators ?? []}
            value={selectedTherapistId}
            onChange={setSelectedTherapistId}
            loading={collaborators === null}
            error={collaboratorsError}
          />

          <div className="relative mt-5 min-w-0">
            <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.2em] text-[#805F2B]">
              Fases del mes <span className="ml-1 font-normal normal-case tracking-normal text-[#5B5143]">· fechas estimadas (UTC)</span>
            </p>
            <ul aria-label={`Fases lunares de ${monthLabel}`} className="-mx-5 mt-3 flex gap-2.5 overflow-x-auto overscroll-x-contain px-5 pb-2 sm:mx-0 sm:px-0">
              {lunarEvents.map((event) => (
                <li key={`${event.date}-${event.phase}`} className="flex min-w-[150px] flex-1 items-center gap-2 rounded-full border border-[#C5A059]/30 bg-white px-3 py-2 shadow-[0_8px_24px_-20px_rgba(44,36,27,.3)]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-bronze" aria-hidden="true">
                    <LunarEventIcon phase={event.phase} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-cormorant text-base leading-4 text-ink">{event.title}</span>
                    <time dateTime={event.date} className="mt-1 block text-[10px] capitalize text-ink-muted">
                      {formatDate(event.date, { day: "numeric", month: "short" })}
                    </time>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="pb-2 text-center font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.12em] text-bronze sm:text-[10px]"
              >
                {weekday}
              </div>
            ))}
            {calendarDates.map((dateKey) => {
              const inActiveMonth = dateKey.slice(0, 7) === activeMonth;
              const isPast = dateKey < todayKey;
              const isLoading = blockedTimes === null;
              const unavailable = !isLoading && !isDateAvailable(dateKey, blockedTimes ?? [], todayKey);
              const isSelected = dateKey === selectedDate;
              const phase = getLunarInfo(dateFromKey(dateKey)).phase;
              const isLunarMarker = phase === "Luna llena" || phase === "Luna nueva";
              const unavailableLabel = isLoading ? "Disponibilidad cargando" : unavailable ? "Sin horarios disponibles" : "Horarios disponibles";

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={!inActiveMonth || isPast || blockedTimes === null}
                  aria-pressed={isSelected}
                  aria-label={`${formatDate(dateKey, { day: "numeric", month: "long" })}, ${phase}, ${unavailableLabel}`}
                  onClick={() => {
                    setSelectedDate(dateKey);
                    setShowDateAvailability(true);
                  }}
                  className={`group relative flex min-h-[57px] flex-col items-center justify-between rounded-xl border px-1.5 py-2 text-center transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze sm:min-h-[72px] sm:rounded-2xl sm:px-2 sm:py-2.5 ${
                    !inActiveMonth
                      ? "border-transparent bg-transparent text-ink/20"
                      : isPast
                        ? "cursor-not-allowed border-stone-200/70 bg-[#FCFAF5] text-ink/30"
                        : isLoading
                          ? "border-stone-200 bg-[#FCFAF5] text-ink-muted/60"
                          : isSelected && !unavailable
                          ? "border-[#C5A059]/60 bg-[#C5A059]/20 text-ink shadow-[0_8px_24px_-14px_rgba(197,160,89,.7)]"
                          : isSelected
                            ? "border-[#C5A059]/50 bg-[#C5A059]/20 text-ink-muted"
                            : unavailable
                              ? "border-stone-200/80 bg-[#FCFAF5] text-ink/40 hover:border-gold/40 hover:text-ink-muted"
                              : "border-stone-200 bg-[#FCFAF5] text-ink hover:border-gold/70 hover:bg-gold/10"
                  }`}
                >
                  <span className="flex w-full items-center justify-between gap-1">
                    <span className="font-[family-name:var(--font-montserrat)] text-[11px] font-semibold sm:text-xs">
                      {Number(dateKey.slice(-2))}
                    </span>
                    {inActiveMonth && isLunarMarker && (
                      <span className={phase === "Luna llena" ? "text-bronze" : "text-gold"}>
                        <LunarMarker phase={phase} />
                      </span>
                    )}
                  </span>
                  <span className="mt-1 flex h-2 items-center justify-center" aria-hidden="true">
                    {inActiveMonth && !isPast && !unavailable && blockedTimes !== null && (
                      <span className={`size-1 rounded-full ${isSelected ? "bg-[#805F2B]" : "bg-[#C5A059]"}`} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-stone-200 pt-4 font-[family-name:var(--font-montserrat)] text-[9px] uppercase tracking-[.12em] text-ink-muted sm:text-[10px]">
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full border border-bronze/70 bg-gold/20" /> Disponible</span>
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full border border-gold/25 bg-papyrus" /> Sin horarios</span>
            <span className="inline-flex items-center gap-2 text-bronze"><Circle size={12} fill="currentColor" /> Luna llena</span>
            <span className="inline-flex items-center gap-2 text-bronze"><MoonStar size={13} /> Luna nueva</span>
          </div>
        </div>

        <aside aria-live="polite" className="relative min-w-0 rounded-3xl border border-stone-200 bg-white p-5 text-ink shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6 lg:sticky lg:top-24 lg:max-h-[min(85vh,calc(100dvh-7rem))] lg:overflow-y-auto custom-scrollbar">
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.16),transparent_70%)] blur-2xl" />
          <div className="relative">
            {showDateAvailability ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowDateAvailability(false)}
                  className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#6B4E1E] transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
                >
                  <ArrowLeft size={13} aria-hidden="true" /> Próximas sesiones
                </button>
                <p className="mt-5 font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.24em] text-bronze">
                  Tu momento
                </p>
                <h2 className="mt-1 font-cormorant text-3xl leading-tight text-ink sm:text-[2.1rem]">
                  {selectedDate ? selectedDateLabel : "Elige un día"}
                </h2>

                {selectedTherapist ? (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-stone-200 bg-[#FCFAF5] px-3.5 py-3">
                    <TherapistAvatar person={selectedTherapist} size={40} />
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-montserrat)] text-[8px] font-semibold uppercase tracking-[.2em] text-ink-muted">
                        Tu terapeuta
                      </p>
                      <p className="mt-0.5 truncate font-cormorant text-lg leading-none text-ink">{selectedTherapist.name}</p>
                    </div>
                  </div>
                ) : null}

                {selectedDate && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-stone-200 bg-[#FCFAF5] p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-bronze">
                      <LunarMarker phase={selectedPhase} />
                      {selectedPhase !== "Luna llena" && selectedPhase !== "Luna nueva" && <Sparkles size={18} aria-hidden="true" />}
                    </span>
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-montserrat)] text-[8px] font-semibold uppercase tracking-[.2em] text-ink-muted">
                        Fase lunar estimada
                      </p>
                      <p className="mt-1 font-cormorant text-xl leading-none text-bronze">{selectedPhase}</p>
                    </div>
                  </div>
                )}
                {selectedDate && <p className="mt-3 text-xs leading-5 text-ink-muted">{phaseGuidance(selectedPhase)}</p>}

                <div className="mt-6 border-t border-stone-200 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[.18em] text-ink">
                      Horarios disponibles
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-ink-muted">
                      <Clock3 size={13} aria-hidden="true" /> Hora local
                    </span>
                  </div>

                  {availabilityError ? (
                    <div role="alert" className="mt-4 rounded-xl border border-red-900/30 bg-red-900/[.06] p-4 text-center">
                      <p className="text-xs font-semibold text-ink">{availabilityError}</p>
                      <p className="mt-1 text-[11px] leading-5 text-ink-muted">Los horarios de este mes no están disponibles en este momento.</p>
                      <button
                        type="button"
                        onClick={refreshAvailability}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[.12em] text-bronze transition hover:border-gold/60 hover:bg-gold/10"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : blockedTimes === null ? (
                    <div aria-busy="true" className="mt-4 space-y-2.5">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-14 animate-pulse rounded-xl border border-stone-200 bg-[#FCFAF5]" />
                      ))}
                      <p className="pt-1 text-center text-[10px] text-ink-muted">
                        {selectedTherapist ? `Cargando la agenda de ${selectedTherapist.name}…` : "Cargando disponibilidad…"}
                      </p>
                    </div>
                  ) : selectedSlots.length > 0 && selectedDate ? (
                    <div className="mt-4 space-y-2.5">
                      {selectedSlots.map((time) => (
                        <SlotBookingDialog
                          key={`${selectedDate}-${time}-${selectedTherapistId ?? "house"}`}
                          date={selectedDate}
                          time={time}
                          therapist={selectedTherapist}
                          onBooked={refreshAvailability}
                          variant="time"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-stone-200 bg-[#FCFAF5] p-4">
                      <p className="font-[family-name:var(--font-montserrat)] text-xs font-medium text-ink">
                        {!selectedDate
                          ? "No quedan horarios disponibles en este mes."
                          : "No hay horarios disponibles para esta fecha."}
                      </p>
                      <p className="mt-1.5 text-[11px] leading-5 text-ink-muted">
                        {selectedTherapist
                          ? `${selectedTherapist.name} no tiene espacio este día. Prueba otra fecha o elige a otra persona del equipo.`
                          : "Elige otro día marcado en dorado para consultar opciones."}
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-5 text-[9px] leading-4 text-ink-muted">
                  Horarios reales de la plantilla de trabajo (09:00–18:00) restando solo las citas de{" "}
                  {selectedTherapist ? `la agenda de ${selectedTherapist.name}` : "toda la casa"}. La reserva requiere iniciar sesión y queda pendiente de confirmación.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-4">
                  <div>
                    <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.22em] text-bronze">
                      Calendario mensual
                    </p>
                    <h2 className="mt-1 font-cormorant text-3xl leading-none text-ink sm:text-[2rem]">
                      Próximas sesiones
                    </h2>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#C5A059]/35 bg-[#FCFAF5] text-bronze">
                    <CalendarDays size={17} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-ink-muted">
                  Horarios próximos disponibles · hora local
                </p>

                {blockedTimes === null ? (
                  <ul aria-busy="true" className="mt-4 space-y-2.5">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li key={index} className="h-[4.35rem] animate-pulse rounded-2xl border border-stone-200 bg-[#FCFAF5]" />
                    ))}
                  </ul>
                ) : availabilityError ? (
                  <div role="alert" className="mt-4 rounded-2xl border border-red-900/20 bg-red-900/[.04] p-4">
                    <p className="text-xs font-medium text-ink">{availabilityError}</p>
                    <button
                      type="button"
                      onClick={refreshAvailability}
                      className="mt-3 rounded-full border border-stone-300 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[.12em] text-bronze transition hover:border-gold/60"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : upcomingSessions.length > 0 ? (
                  <ul aria-label="Próximos horarios disponibles" className="mt-4 space-y-2.5">
                    {upcomingSessions.map((session, index) => {
                      const suggestedService = services[index % services.length];
                      const suggestedServiceLabel = suggestedService.id === "registros-akashicos"
                        ? "Registros Akáshicos"
                        : suggestedService.name;
                      const shortMonth = formatDate(session.date, { month: "short" }).replace(".", "").toLocaleUpperCase("es-MX");
                      return (
                        <li key={`${session.date}-${session.time}`}>
                          <article className="grid grid-cols-[2.7rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-2xl border border-stone-200 bg-[#FCFAF5] p-2.5 transition hover:border-[#C5A059]/45">
                            <div className="grid size-10 place-items-center content-center rounded-xl border border-[#C5A059]/30 bg-white leading-none">
                              <span className="font-cormorant text-xl text-ink">{formatDate(session.date, { day: "2-digit" })}</span>
                              <span className="mt-0.5 font-[family-name:var(--font-montserrat)] text-[7px] font-semibold tracking-[.12em] text-[#805F2B]">{shortMonth}</span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate font-cormorant text-[1.1rem] leading-tight text-ink">{suggestedServiceLabel}</h3>
                              <p className="mt-1 inline-flex items-center gap-1.5 font-[family-name:var(--font-montserrat)] text-[9px] text-ink-muted">
                                <Clock3 size={11} aria-hidden="true" /> {formatTime(session.time)}
                              </p>
                            </div>
                            <SlotBookingDialog
                              date={session.date}
                              time={session.time}
                              therapist={selectedTherapist}
                              onBooked={refreshAvailability}
                              variant="compact"
                            />
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-2xl border border-stone-200 bg-[#FCFAF5] p-4">
                    <p className="font-[family-name:var(--font-montserrat)] text-xs font-medium text-ink">No hay horarios próximos este mes.</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-ink-muted">Explora otra fecha con las flechas del calendario o elige un día marcado en dorado.</p>
                  </div>
                )}
              </>
            )}

            <section className="relative isolate mt-5 flex min-h-[190px] overflow-hidden rounded-3xl border border-[#C5A059]/25 text-center shadow-[0_12px_30px_-20px_rgba(44,36,27,.45)]">
              <Image
                src="/images/manifiesto/sombra-planta.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-[50%_68%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#FCFAF5]/[.92] via-[#FCFAF5]/[.84] to-[#FCFAF5]/[.68]" />
              <div className="relative z-10 flex w-full flex-col items-center justify-center px-5 py-5">
                <Flower2 size={30} strokeWidth={1.25} className="text-[#805F2B]" aria-hidden="true" />
                <h3 className="mt-2 font-cormorant text-2xl leading-none text-ink">Conecta con tu bienestar</h3>
                <p className="mt-2 max-w-[18rem] font-[family-name:var(--font-montserrat)] text-[10px] leading-4 text-ink-muted">
                  Encuentra el equilibrio que necesitas en cada etapa de tu vida.
                </p>
                <Link
                  href="/#servicios"
                  className="mt-3 inline-flex min-h-8 items-center gap-2 rounded-full bg-[#2A1F1A] px-4 py-2 font-[family-name:var(--font-montserrat)] text-[9px] font-semibold text-[#FCFAF5] transition hover:bg-[#5A4116] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
                >
                  Explorar servicios <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SlotBookingDialog({
  date,
  time,
  therapist,
  onBooked,
  variant,
}: {
  date: string;
  time: string;
  therapist: PublicCollaborator | null;
  onBooked?: () => void;
  variant: "compact" | "time";
}) {
  const dateLabel = capitalize(formatDate(date, { day: "numeric", month: "long", year: "numeric" }));
  const ariaLabel = `Reservar el ${dateLabel} a las ${formatTime(time)}${therapist ? ` con ${therapist.name}` : ""}`;
  const trigger = variant === "time" ? (
    <button
      type="button"
      aria-label={ariaLabel}
      className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition hover:border-gold/70 hover:shadow-[0_10px_28px_-18px_rgba(197,160,89,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
    >
      <span className="font-cormorant text-2xl leading-none text-ink">{formatTime(time)}</span>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 font-[family-name:var(--font-montserrat)] text-[9px] font-bold uppercase tracking-[.15em] text-ink transition group-hover:bg-gold-light sm:text-[10px]">
        Reservar
        <ArrowRight size={13} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </button>
  ) : (
    <button
      type="button"
      aria-label={ariaLabel}
      className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full bg-[#E9CE91] px-3 py-1.5 font-[family-name:var(--font-montserrat)] text-[8px] font-bold uppercase tracking-[.08em] text-[#2C241B] transition hover:bg-[#D9BC7C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze sm:text-[9px]"
    >
      Reservar
    </button>
  );

  return (
    <Dialog
      appearance="papyrus"
      triggerClassName={variant === "time" ? "w-full" : "justify-self-end"}
      trigger={trigger}
      title="Reserva tu encuentro"
    >
      {(close) => (
        <SlotBookingContent
          date={date}
          time={time}
          therapist={therapist}
          close={close}
          onBooked={onBooked}
        />
      )}
    </Dialog>
  );
}

function SlotBookingContent({
  date,
  time,
  therapist,
  close,
  onBooked,
}: {
  date: string;
  time: string;
  therapist: PublicCollaborator | null;
  close: () => void;
  onBooked?: () => void;
}) {
  const [serviceId, setServiceId] = useState("");
  const service = services.find((item) => item.id === serviceId);

  if (service) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-papyrus-light p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[.17em] text-bronze">Horario elegido</p>
          <p className="mt-1 text-xs text-ink">{capitalize(formatDate(date, { day: "numeric", month: "long", year: "numeric" }))} · {formatTime(time)}</p>
          {therapist && (
            <p className="mt-2 flex items-center gap-2 border-t border-stone-200 pt-2 text-[11px] text-ink-muted">
              <TherapistAvatar person={therapist} size={22} /> Con {therapist.name}
            </p>
          )}
        </div>
        <BookingDialog
          key={service.id}
          service={service}
          close={close}
          initialDate={date}
          initialTime={time}
          appearance="papyrus"
          assignee={therapist}
          onBooked={onBooked}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-cormorant text-2xl text-ink">Elige tu encuentro</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          Selecciona una lectura para continuar con la reserva de este horario{therapist ? ` junto a ${therapist.name}` : ""}.
        </p>
      </div>
      <div className="space-y-2">
        {services.map((item: Service) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setServiceId(item.id)}
            className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 text-left transition hover:border-gold/60 hover:bg-gold/5"
          >
            <span className="min-w-0">
              <span className="block font-cormorant text-xl text-ink">{item.name}</span>
              <span className="mt-1 block font-[family-name:var(--font-montserrat)] text-[9px] uppercase tracking-[.13em] text-bronze">
                {item.duration} · {formatSessionPrice(item.price)}
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-bronze transition group-hover:translate-x-1" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="border-t border-stone-200 pt-3 text-[10px] leading-5 text-ink-muted">
        Las limpiezas y rituales especiales se anuncian en los próximos encuentros de la agenda.
      </p>
    </div>
  );
}
