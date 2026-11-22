"use client";

import type { ReactNode } from "react";
import { BookingDialog } from "../booking-dialog";
import { Dialog } from "../../ui/dialog";
import { services } from "../../../lib/data/services";

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
    >
      {(close) =>
        runeReading ? (
          <BookingDialog service={runeReading} close={close} />
        ) : (
          <p className="text-sm text-[#2C2C2C]/75">Servicio no disponible temporalmente.</p>
        )
      }
    </Dialog>
  );
}
