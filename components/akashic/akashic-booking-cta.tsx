"use client";

import type { ReactNode } from "react";
import { BookingDialog } from "../landing/booking-dialog";
import { Dialog } from "../ui/dialog";
import { services } from "../../lib/data/services";
import { akashicServiceId } from "../../data/akashic-content";

const akashicReading = services.find((service) => service.id === akashicServiceId);

export function AkashicBookingCTA({
  children,
  className,
  label = "Reservar mi lectura de Registros Akáshicos",
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
      title={`Agendar · ${akashicReading?.name ?? "Lectura de Registros Akáshicos"}`}
    >
      {(close) =>
        akashicReading ? (
          <BookingDialog service={akashicReading} close={close} />
        ) : (
          <p className="text-sm text-[#2C2C2C]/75">Servicio no disponible temporalmente.</p>
        )
      }
    </Dialog>
  );
}
