"use client";

import type { ReactNode } from "react";
import { BookingDialog } from "../landing/booking-dialog";
import { Dialog } from "../ui/dialog";
import { services } from "../../lib/data/services";

/** Servicio real de la casa; el modal de reserva es el mismo que usa la landing. */
const runeReading = services.find((service) => service.id === "lectura-de-runas");

export function RuneBookingCTA({
  children,
  className,
  label = "Agendar mi Lectura de Runas",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <Dialog
      trigger={
        <button type="button" aria-label={label} className={className}>
          {children}
        </button>
      }
      title={`Agendar · ${runeReading?.name ?? "Lectura de Runas"}`}
      appearance="papyrus"
    >
      {(close) =>
        runeReading ? (
          <BookingDialog service={runeReading} close={close} appearance="papyrus" />
        ) : (
          <p className="text-sm text-sanctuary-ink-soft">Servicio no disponible temporalmente.</p>
        )
      }
    </Dialog>
  );
}
