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
    <section id="reserva" className="relative scroll-mt-20 overflow-hidden bg-obsidian px-5 py-10 text-center sm:px-8 lg:py-12">
      <Image
        src={akashicImages.booking}
        alt=""
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,21,.84),rgba(15,17,21,.96))]" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.2),transparent_70%)] blur-3xl" />
      <span aria-hidden="true" className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rotate-45 bg-ember shadow-[0_0_14px_rgba(217,101,56,.9)]" />

      <div className="relative mx-auto max-w-4xl">
        <div className="flex justify-center">
          <Eyebrow>{booking.eyebrow}</Eyebrow>
        </div>
        <h2 className="akashic-display mt-4 text-4xl font-light leading-[1.04] text-papyrus sm:text-5xl">
          {booking.titleLead}
          <br />
          <em className="italic text-gold">{booking.titleAccent}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-papyrus/60">
          {booking.text}
        </p>
        <div className="mt-6 flex justify-center">
          <AkashicBookingCTA
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-gold px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-obsidian shadow-[0_22px_60px_-22px_rgba(197,160,89,.9)] transition hover:bg-gold-light"
            label="Reservar mi lectura de Registros Akáshicos"
          >
            {booking.cta}
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </AkashicBookingCTA>
        </div>
        {service && (
          <p className="mt-4 text-[10px] uppercase tracking-[.24em] text-papyrus/40">
            {service.duration} · {formatSessionPrice(service.price)} · Reserva con anticipo del 20 %
          </p>
        )}
        <p className="mt-2 text-[11px] text-papyrus/40">
          ¿Ya tienes cuenta?{" "}
          <Link href="/mi-cuenta" className="text-gold underline underline-offset-4">
            Accede a Mi Cuenta
          </Link>{" "}
          para ver tus lecturas agendadas.
        </p>
      </div>
    </section>
  );
}
