"use client";

import { useEffect } from "react";
import { StoreErrorPanel } from "../../modules/holistic-store/components/StoreErrorPanel";

/**
 * Frontera de error de `/tienda`: si un fallo inesperado ocurre al renderizar
 * la página, el visitante ve la misma pantalla elegante de la tienda en lugar
 * del error genérico de Next.js.
 */
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
    <main className="grid min-h-screen place-items-center bg-[#121212] px-5 py-24 text-[#F7F3EA]">
      <StoreErrorPanel
        title="No pudimos abrir la tienda"
        message="Algo interrumpió la carga del catálogo. Puedes intentarlo de nuevo o regresar al inicio."
        onRetry={reset}
      />
    </main>
  );
}
