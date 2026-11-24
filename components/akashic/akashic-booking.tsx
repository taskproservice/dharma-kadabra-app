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
    <section
      id="reserva"
      className="sanctuary-leaf sanctuary-leaf-deep relative scroll-mt-20 overflow-hidden border-t border-sanctuary-border px-5 py-14 text-center sm:px-8 lg:py-20"
    >
      <Image
        src={akashicImages.booking}
        alt=""
        fill
        sizes="100vw"
        quality={90}
        className="object-cover opacity-[0.14] mix-blend-multiply"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,248,235,.55),transparent_68%)] blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,42rem)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(197,160,89,.7),transparent)]"
      />

      <div className="sanctuary-card relative mx-auto max-w-4xl px-6 py-10 sm:px-12 sm:py-14">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-sanctuary-gold shadow-[0_0_12px_rgba(197,160,89,.75)]"
        />
        <div className="flex justify-center">
          <Eyebrow light>{booking.eyebrow}</Eyebrow>
        </div>
        <h2 className="akashic-display mt-4 text-4xl font-light leading-[1.06] text-sanctuary-ink sm:text-5xl">
          {booking.titleLead}
          <br />
          <em className="italic text-sanctuary-gold-leaf">{booking.titleAccent}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sanctuary-ink-soft">
          {booking.text}
        </p>
        <div className="mt-6 flex justify-center">
          <AkashicBookingCTA
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-sanctuary-gold px-8 py-4 text-[10px] font-semibold uppercase tracking-[.26em] text-sanctuary-ink shadow-[0_18px_40px_-22px_rgba(80,57,31,.6)] transition hover:bg-sanctuary-gold-light"
            label="Reservar mi lectura de Registros Akáshicos"
          >
            {booking.cta}
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </AkashicBookingCTA>
        </div>
        {service && (
          <p className="mt-4 text-[10px] uppercase tracking-[.24em] text-sanctuary-ink-muted">
            {service.duration} · {formatSessionPrice(service.price)} · Reserva con anticipo del 20 %
          </p>
        )}
        <p className="mt-2 text-[11px] text-sanctuary-ink-soft">
          ¿Ya tienes cuenta?{" "}
          <Link href="/mi-cuenta" className="font-medium text-sanctuary-gold-ink underline underline-offset-4 hover:text-sanctuary-ink">
            Accede a Mi Cuenta
          </Link>{" "}
          para ver tus lecturas agendadas.
        </p>
      </div>
    </section>
  );
}
