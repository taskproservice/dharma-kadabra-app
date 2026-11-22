"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { akashicContent, akashicImages } from "../../data/akashic-content";
import { formatSessionPrice, services } from "../../lib/data/services";
import { akashicServiceId } from "../../data/akashic-content";
import { AkashicBookingCTA } from "./akashic-booking-cta";
import { Eyebrow } from "./akashic-shared";

/** Sección 08 · Reserva — «Reservar mi lectura» abre el BookingDialog real. */
export function AkashicBooking() {
  const booking = akashicContent.booking;
  const service = services.find((item) => item.id === akashicServiceId);

  return (
    <section id="reserva" className="relative scroll-mt-20 overflow-hidden bg-[#121212] px-5 py-10 text-center sm:px-8 lg:py-12">
      <Image
        src={akashicImages.booking}
        alt=""
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,.82),rgba(18,18,18,.95))]" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.2),transparent_70%)] blur-3xl" />
      <span aria-hidden="true" className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rotate-45 bg-[#D96538] shadow-[0_0_14px_rgba(217,101,56,.9)]" />

      <div className="relative mx-auto max-w-4xl">
        <div className="flex justify-center">
          <Eyebrow>{booking.eyebrow}</Eyebrow>
        </div>
        <h2 className="akashic-display mt-4 text-4xl font-light leading-[1.04] text-[#F7F3EA] sm:text-5xl">
          {booking.titleLead}
          <br />
          <em className="italic text-[#C5A059]">{booking.titleAccent}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#F7F3EA]/60">
          {booking.text}
        </p>
        <div className="mt-6 flex justify-center">
          <AkashicBookingCTA
            className="group inline-flex items-center gap-3 rounded-full bg-[#C5A059] px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-[#121212] shadow-[0_22px_60px_-22px_rgba(197,160,89,.9)] transition hover:bg-[#d9b673]"
            label="Reservar mi lectura de Registros Akáshicos"
          >
            {booking.cta}
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </AkashicBookingCTA>
        </div>
        {service && (
          <p className="mt-4 text-[10px] uppercase tracking-[.24em] text-[#F7F3EA]/40">
            {service.duration} · {formatSessionPrice(service.price)} · Reserva con anticipo del 20 %
          </p>
        )}
        <p className="mt-2 text-[11px] text-[#F7F3EA]/40">
          ¿Ya tienes cuenta?{" "}
          <Link href="/mi-cuenta" className="text-[#C5A059] underline underline-offset-4">
            Accede a Mi Cuenta
          </Link>{" "}
          para ver tus lecturas agendadas.
        </p>
      </div>
    </section>
  );
}
