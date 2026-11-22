"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Moon,
  MoonStar,
  Sparkles,
} from "lucide-react";
import { getLunarInfo, getMonthlyLunarEvents, type MonthlyLunarEvent } from "../../lib/lunar-utils";
import { formatSessionPrice, services, type Service } from "../../lib/data/services";
import { BookingDialog } from "./booking-dialog";
import { Dialog } from "../ui/dialog";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Horarios de demostración hasta conectar disponibilidad en tiempo real. */
const MOCK_SLOTS_BY_WEEKDAY: Record<number, readonly string[]> = {
  0: [],
  1: ["10:00", "14:00"],
  2: ["10:00", "14:00", "16:00"],
  3: [],
  4: ["10:00", "14:00", "16:00"],
  5: ["10:00", "14:00"],
  6: ["10:00", "16:00"],
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  // Mediodía UTC evita desfases al representar una fecha de calendario.
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function keyFromDate(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

function shiftMonth(monthKey: string, amount: number) {
  const [year, month] = monthKey.split("-").map(Number);
  return getMonthKey(new Date(Date.UTC(year, month - 1 + amount, 1, 12)));
}

function getDaysInMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
}

function getCalendarDates(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1, 12)).getUTCDay();
  const mondayOffset = (firstWeekday + 6) % 7;
  const dayCount = getDaysInMonth(monthKey);
  const cellCount = Math.ceil((mondayOffset + dayCount) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) =>
    keyFromDate(new Date(Date.UTC(year, month - 1, 1 - mondayOffset + index, 12))),
  );
}

function getMockAvailability(dateKey: string, todayKey: string) {
  if (dateKey <= todayKey) return [];

  const date = dateFromKey(dateKey);
  // Algunos días se reservan como no disponibles para que el mock se sienta realista.
  if (date.getUTCDate() % 9 === 0) return [];

  return [...(MOCK_SLOTS_BY_WEEKDAY[date.getUTCDay()] ?? [])];
}

function findFirstAvailableDate(monthKey: string, todayKey: string) {
  const dayCount = getDaysInMonth(monthKey);
  for (let day = 1; day <= dayCount; day += 1) {
    const dateKey = `${monthKey}-${pad(day)}`;
    if (getMockAvailability(dateKey, todayKey).length > 0) return dateKey;
  }
  return null;
}

function formatDate(dateKey: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", { ...options, timeZone: "UTC" }).format(dateFromKey(dateKey));
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("es-MX") + value.slice(1);
}

function formatTime(time: string) {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
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

export function DigitalAgenda({ todayKey }: { todayKey: string }) {
  const currentMonth = todayKey.slice(0, 7);
  const initialSelection = findFirstAvailableDate(currentMonth, todayKey) ?? todayKey;
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(initialSelection);

  const calendarDates = useMemo(() => getCalendarDates(activeMonth), [activeMonth]);
  const lunarEvents = useMemo(() => getMonthlyLunarEvents(activeMonth), [activeMonth]);
  const selectedSlots = useMemo(
    () => getMockAvailability(selectedDate, todayKey),
    [selectedDate, todayKey],
  );
  const selectedPhase = useMemo(
    () => getLunarInfo(dateFromKey(selectedDate)).phase,
    [selectedDate],
  );
  const monthLabel = capitalize(
    formatDate(`${activeMonth}-01`, { month: "long", year: "numeric" }),
  );
  const selectedDateLabel = capitalize(
    formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  );
  const previousMonthDisabled = activeMonth <= currentMonth;

  function changeMonth(amount: number) {
    const nextMonth = shiftMonth(activeMonth, amount);
    setActiveMonth(nextMonth);
    setSelectedDate(
      findFirstAvailableDate(nextMonth, todayKey) ?? `${nextMonth}-01`,
    );
  }

  return (
    <section aria-label="Calendario interactivo de disponibilidad" className="px-5 pb-16 sm:px-8 lg:pb-24">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.85fr)] lg:items-start">
        <div className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-[#C5A059]/20 bg-[linear-gradient(145deg,rgba(22,29,47,.88),rgba(8,12,22,.92))] p-5 shadow-[0_28px_90px_-42px_rgba(0,0,0,.95)] sm:p-7">
          <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.10),transparent_70%)] blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5 border-b border-[#C5A059]/15 pb-5 sm:pb-6">
            <div>
              <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.24em] text-[#C5A059]">
                <CalendarDays size={13} className="mr-2 inline -translate-y-px" aria-hidden="true" />
                Calendario mensual
              </p>
              <h2 className="mt-1 font-cormorant text-3xl leading-none text-[#f7f2e7] sm:text-4xl">
                {monthLabel}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Mes anterior"
                disabled={previousMonthDisabled}
                onClick={() => changeMonth(-1)}
                className="grid size-10 place-items-center rounded-full border border-[#C5A059]/20 bg-white/[0.025] text-[#e9e2d2]/75 transition hover:border-[#C5A059]/55 hover:text-[#e3c57c] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Mes siguiente"
                onClick={() => changeMonth(1)}
                className="grid size-10 place-items-center rounded-full border border-[#C5A059]/20 bg-white/[0.025] text-[#e9e2d2]/75 transition hover:border-[#C5A059]/55 hover:text-[#e3c57c]"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="relative mt-5 min-w-0">
            <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.2em] text-[#d8bc7f]">
              Fases del mes <span className="ml-1 font-normal normal-case tracking-normal text-[#e9e2d2]/50">· fechas estimadas (UTC)</span>
            </p>
            <ul aria-label={`Fases lunares de ${monthLabel}`} className="-mx-5 mt-3 flex gap-2.5 overflow-x-auto overscroll-x-contain px-5 pb-2 sm:mx-0 sm:px-0">
              {lunarEvents.map((event) => (
                <li key={`${event.date}-${event.phase}`} className="flex min-w-[150px] flex-1 items-center gap-2.5 rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/[.055] px-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 text-[#e3c57c]" aria-hidden="true">
                    <LunarEventIcon phase={event.phase} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-cormorant text-base leading-4 text-[#f7f2e7]">{event.title}</span>
                    <time dateTime={event.date} className="mt-1 block text-[10px] capitalize text-[#e9e2d2]/60">
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
                className="pb-2 text-center font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.12em] text-[#d8bc7f]/70 sm:text-[10px]"
              >
                {weekday}
              </div>
            ))}
            {calendarDates.map((dateKey) => {
              const inActiveMonth = dateKey.slice(0, 7) === activeMonth;
              const isPast = dateKey < todayKey;
              const unavailable = getMockAvailability(dateKey, todayKey).length === 0;
              const isSelected = dateKey === selectedDate;
              const phase = getLunarInfo(dateFromKey(dateKey)).phase;
              const isLunarMarker = phase === "Luna llena" || phase === "Luna nueva";
              const unavailableLabel = unavailable ? "Sin horarios disponibles" : "Horarios disponibles";

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={!inActiveMonth || isPast}
                  aria-pressed={isSelected}
                  aria-label={`${formatDate(dateKey, { day: "numeric", month: "long" })}, ${phase}, ${unavailableLabel}`}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`group relative flex min-h-[57px] flex-col items-center justify-between rounded-xl border px-1.5 py-2 text-center transition duration-200 sm:min-h-[72px] sm:rounded-2xl sm:px-2 sm:py-2.5 ${
                    !inActiveMonth
                      ? "border-transparent text-[#e9e2d2]/12"
                      : isPast
                        ? "cursor-not-allowed border-white/[0.025] bg-white/[0.01] text-[#e9e2d2]/20"
                        : isSelected && !unavailable
                          ? "border-[#C5A059] bg-[#C5A059]/[.13] text-[#f7f2e7] shadow-[0_0_22px_-12px_rgba(197,160,89,.75)]"
                          : isSelected
                            ? "border-[#C5A059]/30 bg-[#C5A059]/[.025] text-[#e9e2d2]/50"
                            : unavailable
                            ? "border-white/[0.035] bg-white/[0.012] text-[#e9e2d2]/35 hover:border-white/10 hover:text-[#e9e2d2]/55"
                            : "border-[#C5A059]/35 bg-[#C5A059]/[.035] text-[#e9e2d2]/85 hover:border-[#C5A059]/70 hover:bg-[#C5A059]/[.09]"
                  }`}
                >
                  <span className="flex w-full items-center justify-between gap-1">
                    <span className="font-[family-name:var(--font-montserrat)] text-[11px] font-medium sm:text-xs">
                      {Number(dateKey.slice(-2))}
                    </span>
                    {inActiveMonth && isLunarMarker && (
                      <span className={phase === "Luna llena" ? "text-[#e3c57c]" : "text-[#d8bc7f]/85"}>
                        <LunarMarker phase={phase} />
                      </span>
                    )}
                  </span>
                  <span className="mt-1 flex h-2 items-center justify-center" aria-hidden="true">
                    {inActiveMonth && !isPast && !unavailable && (
                      <span className={`size-1 rounded-full ${isSelected ? "bg-[#e3c57c]" : "bg-[#C5A059]/75"}`} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#C5A059]/15 pt-4 font-[family-name:var(--font-montserrat)] text-[9px] uppercase tracking-[.12em] text-[#e9e2d2]/48 sm:text-[10px]">
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full border border-[#C5A059]/65 bg-[#C5A059]/10" /> Disponible</span>
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full border border-white/10 bg-white/[0.025]" /> Sin horarios</span>
            <span className="inline-flex items-center gap-2 text-[#d8bc7f]/75"><Circle size={12} fill="currentColor" /> Luna llena</span>
            <span className="inline-flex items-center gap-2 text-[#d8bc7f]/75"><MoonStar size={13} /> Luna nueva</span>
          </div>
        </div>

        <aside aria-live="polite" className="sticky top-24 min-w-0 max-h-[85vh] overflow-y-auto custom-scrollbar rounded-[1.75rem] border border-[#C5A059]/30 bg-[#F4EFE6] p-5 text-[#1A1A1A] shadow-[0_28px_90px_-42px_rgba(0,0,0,.75)] max-lg:relative sm:p-7 lg:max-h-[min(85vh,calc(100dvh-7rem))]">
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.11),transparent_70%)] blur-2xl" />
          <div className="relative">
            <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[.24em] text-[#805F2B]">
              Tu momento
            </p>
            <h2 className="mt-2 font-cormorant text-3xl leading-tight text-[#1A1A1A] sm:text-[2.1rem]">
              {selectedDateLabel}
            </h2>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#C5A059]/25 bg-[#FCFAF5] p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#C5A059]/30 bg-[#C5A059]/[.09] text-[#805F2B]">
                <LunarMarker phase={selectedPhase} />
                {selectedPhase !== "Luna llena" && selectedPhase !== "Luna nueva" && <Sparkles size={18} aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-montserrat)] text-[8px] font-semibold uppercase tracking-[.2em] text-[#5B5143]">
                  Fase lunar estimada
                </p>
                <p className="mt-1 font-cormorant text-xl leading-none text-[#805F2B]">{selectedPhase}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#5B5143]">{phaseGuidance(selectedPhase)}</p>

            <div className="mt-6 border-t border-[#C5A059]/15 pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[.18em] text-[#1A1A1A]">
                  Horarios disponibles
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[#5B5143]">
                  <Clock3 size={13} aria-hidden="true" /> Hora local
                </span>
              </div>

              {selectedSlots.length > 0 ? (
                <div className="mt-4 space-y-2.5">
                  {selectedSlots.map((time) => (
                    <Dialog
                      key={`${selectedDate}-${time}`}
                      appearance="papyrus"
                      triggerClassName="w-full"
                      trigger={
                        <button
                          type="button"
                          aria-label={`Reservar el ${selectedDateLabel} a las ${formatTime(time)}`}
                          className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] px-4 py-3 text-left transition hover:border-[#C5A059]/70 hover:bg-[#EDE4D4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#805F2B]"
                        >
                          <span className="font-cormorant text-2xl leading-none text-[#1A1A1A]">{formatTime(time)}</span>
                          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[8px] font-bold uppercase tracking-[.15em] text-[#805F2B] sm:text-[9px]">
                            Reservar ahora
                            <ArrowRight size={13} className="transition group-hover:translate-x-1" aria-hidden="true" />
                          </span>
                        </button>
                      }
                      title="Reserva tu encuentro"
                    >
                      {(close) => <SlotBookingContent date={selectedDate} time={time} close={close} />}
                    </Dialog>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-[#C5A059]/25 bg-[#FCFAF5] p-4">
                  <p className="font-[family-name:var(--font-montserrat)] text-xs font-medium text-[#1A1A1A]">
                    No hay horarios disponibles para esta fecha.
                  </p>
                  <p className="mt-1.5 text-[11px] leading-5 text-[#5B5143]">
                    Elige otro día marcado con borde dorado para consultar opciones.
                  </p>
                </div>
              )}
            </div>
            <p className="mt-5 text-[9px] leading-4 text-[#5B5143]">
              Horarios de demostración para esta primera versión. La reserva requiere iniciar sesión y queda pendiente de confirmación.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SlotBookingContent({ date, time, close }: { date: string; time: string; close: () => void }) {
  const [serviceId, setServiceId] = useState("");
  const service = services.find((item) => item.id === serviceId);

  if (service) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[#C5A059]/25 bg-[#FCFAF5] p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[.17em] text-[#805F2B]">Horario elegido</p>
          <p className="mt-1 text-xs text-[#1A1A1A]">{capitalize(formatDate(date, { day: "numeric", month: "long", year: "numeric" }))} · {formatTime(time)}</p>
        </div>
        <BookingDialog
          key={service.id}
          service={service}
          close={close}
          initialDate={date}
          initialTime={time}
          appearance="papyrus"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-cormorant text-2xl text-[#1A1A1A]">Elige tu encuentro</p>
        <p className="mt-1 text-xs leading-5 text-[#5B5143]">
          Selecciona una lectura para continuar con la reserva de este horario.
        </p>
      </div>
      <div className="space-y-2">
        {services.map((item: Service) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setServiceId(item.id)}
            className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[#C5A059]/30 bg-[#FCFAF5] p-4 text-left transition hover:border-[#C5A059]/70 hover:bg-[#EDE4D4]"
          >
            <span className="min-w-0">
              <span className="block font-cormorant text-xl text-[#1A1A1A]">{item.name}</span>
              <span className="mt-1 block font-[family-name:var(--font-montserrat)] text-[9px] uppercase tracking-[.13em] text-[#805F2B]">
                {item.duration} · {formatSessionPrice(item.price)}
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-[#805F2B] transition group-hover:translate-x-1" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="border-t border-[#C5A059]/15 pt-3 text-[10px] leading-5 text-[#5B5143]">
        Las limpiezas y rituales especiales se anuncian en los próximos encuentros de la agenda.
      </p>
    </div>
  );
}
