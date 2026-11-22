"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { akashicContent, akashicImages } from "../../data/akashic-content";
import { formatSessionPrice, services } from "../../lib/data/services";
import { akashicServiceId } from "../../data/akashic-content";
import { AkashicBookingCTA } from "./akashic-booking-cta";
import { Eyebrow } from "./akashic-shared";

/** Sección 08 · Reserva — «Reservar mi lectura» sobre Papiro con texto oscuro. */
export function AkashicBooking() {
  const booking = akashicContent.booking;
  const service = services.find((item) => item.id === akashicServiceId);

  return (
    <section id="reserva" className="relative scroll-mt-20 overflow-hidden border-t border-[#C5A059]/30 bg-[#FCFAF5] px-5 py-14 text-center sm:px-8 lg:py-16">
      <Image
        src={akashicImages.booking}
        alt=""
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-14"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,250,245,.88),rgba(244,239,230,.96))]" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.22),transparent_70%)] blur-3xl" />
      <span aria-hidden="true" className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rotate-45 bg-[#D96538] shadow-[0_0_12px_rgba(217,101,56,.6)]" />

      <div className="relative mx-auto max-w-4xl">
        <div className="flex justify-center">
          <Eyebrow>{booking.eyebrow}</Eyebrow>
        </div>
        <h2 className="akashic-display mt-4 text-4xl font-light leading-[1.04] text-[#1A1A1A] sm:text-5xl">
          {booking.titleLead}
          <br />
          <em className="italic text-[#9E7B2F]">{booking.titleAccent}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#2C2C2C]/80">
          {booking.text}
        </p>
        <div className="mt-6 flex justify-center">
          <AkashicBookingCTA
            className="group inline-flex items-center gap-3 rounded-full bg-[#C5A059] px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-[#1A1A1A] shadow-[0_18px_45px_-18px_rgba(92,72,48,.4)] transition hover:bg-[#b58e45]"
            label="Reservar mi lectura de Registros Akáshicos"
          >
            {booking.cta}
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </AkashicBookingCTA>
        </div>
        {service && (
          <p className="mt-4 text-[10px] uppercase tracking-[.24em] text-[#2C2C2C]/70">
            {service.duration} · {formatSessionPrice(service.price)} · Reserva con anticipo del 20 %
          </p>
        )}
        <p className="mt-2 text-[11px] text-[#2C2C2C]/75">
          ¿Ya tienes cuenta?{" "}
          <Link href="/mi-cuenta" className="font-semibold text-[#8B6914] underline underline-offset-4 hover:text-[#1A1A1A]">
            Accede a Mi Cuenta
          </Link>{" "}
          para ver tus lecturas agendadas.
        </p>
      </div>
    </section>
  );
}
