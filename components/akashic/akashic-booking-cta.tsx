"use client";

import type { ReactNode } from "react";
import { BookingDialog } from "../landing/booking-dialog";
import { Dialog } from "../ui/dialog";
import { services } from "../../lib/data/services";
import { akashicServiceId } from "../../data/akashic-content";

/**
 * Botón de reserva de Registros Akáshicos.
 *
 * Abre el `BookingDialog` real (React Hook Form + Prisma vía
 * `/api/appointments`), el mismo que usa la landing y la página de Runas,
 * con el servicio `registros-akashicos`: la API valida ese `serviceId`
 * contra `lib/data/services.ts` y crea la cita PENDIENTE con su anticipo
 * del 20 %. No hay reserva simulada.
 */
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
          <p className="text-sm text-[#e9e2d2]/70">Servicio no disponible temporalmente.</p>
        )
      }
    </Dialog>
  );
}
