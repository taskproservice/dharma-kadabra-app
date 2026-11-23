"use client";

import { useEffect, useState } from "react";
import type { PublicCollaborator } from "../../lib/therapists";

export type CollaboratorsState = {
  /** Equipo agendable; `null` mientras carga. */
  collaborators: PublicCollaborator[] | null;
  error: string | null;
};

/**
 * Carga el equipo agendable desde `GET /api/collaborators` (endpoint público).
 * Se usa en la Agenda Digital para el selector "¿Con quién deseas tu sesión?".
 */
export function useCollaborators(): CollaboratorsState {
  const [collaborators, setCollaborators] = useState<PublicCollaborator[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/collaborators", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return Array.isArray(data?.collaborators) ? (data.collaborators as PublicCollaborator[]) : [];
      })
      .then((team) => {
        if (cancelled) return;
        setCollaborators(team);
      })
      .catch(() => {
        if (cancelled) return;
        // Sin equipo no se bloquea la agenda: se reserva con disponibilidad de la casa.
        setCollaborators([]);
        setError("No pudimos cargar al equipo en este momento.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { collaborators, error };
}
