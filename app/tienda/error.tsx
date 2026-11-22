"use client";

import { useEffect } from "react";
import { StoreErrorPanel } from "../../modules/holistic-store/components/StoreErrorPanel";

export default function TiendaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Holistic Store] Error de render en /tienda:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#F4EFE6] px-5 py-24 text-[#1A1A1A]">
      <StoreErrorPanel
        title="No pudimos abrir la tienda"
        message="Algo interrumpió la carga del catálogo. Puedes intentarlo de nuevo o regresar al inicio."
        onRetry={reset}
      />
    </main>
  );
}
