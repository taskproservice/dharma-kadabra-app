"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  AVAILABILITY_HOURS,
  AVAILABILITY_WEEKDAYS,
  isSlotEnabled,
  normalizeAvailability,
  type AvailabilitySlot,
} from "../../lib/availability-settings";
import type { Role } from "../../lib/rbac-config";

/**
 * Calendario semanal de disponibilidad del colaborador.
 * Activa o desactiva días y horas de trabajo; los cambios se guardan con
 * PUT /api/availability/me (una administradora puede editar a otro usuario).
 */
export function AvailabilityPlanner({ viewerRole, userId, viewerId }: { viewerRole: Role; userId: string; viewerId: string }) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isAdminEditingOther = viewerRole === "ADMIN" && userId !== viewerId;
  const query = isAdminEditingOther ? `?userId=${encodeURIComponent(userId)}` : "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/availability/me${query}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible cargar tu disponibilidad.");
      setSlots(normalizeAvailability(data.availability));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar tu disponibilidad.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (weekday: number, hour: number) => {
    setSlots((prev) => {
      const exists = isSlotEnabled(prev, weekday, hour);
      const next = exists
        ? prev.filter((slot) => !(slot.weekday === weekday && slot.hour === hour))
        : [...prev, { weekday, hour }];
      return next.sort((a, b) => a.weekday - b.weekday || a.hour - b.hour);
    });
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/availability/me${query}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: slots }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible guardar la disponibilidad.");
      setSlots(normalizeAvailability(data.availability));
      setDirty(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible guardar la disponibilidad.");
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = slots.length;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Mi disponibilidad semanal</CardTitle>
          <CardDescription>
            Activa los días y horas en los que atiendes sesiones. Los horarios inactivos no se ofrecen al público.
          </CardDescription>
        </div>
        <Button variant="gold" onClick={save} disabled={!dirty || saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-[#e9e2d2]/50">
          <span className="font-semibold text-[#e3c57c]">{enabledCount}</span>{" "}
          {enabledCount === 1 ? "bloque activo" : "bloques activos"} · 09:00–18:00
        </p>

        {loading ? (
          <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-1.5" aria-label="Cargando disponibilidad">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="col-span-8 h-9 animate-pulse rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        ) : (
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[640px]">
              {/* Encabezado de días */}
              <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-1.5">
                <span />
                {AVAILABILITY_WEEKDAYS.map((day) => (
                  <span key={day.value} className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[.14em] text-[#e9e2d2]/55">
                    {day.short}
                  </span>
                ))}
              </div>
              {/* Parrilla hora × día */}
              <div className="space-y-1.5">
                {AVAILABILITY_HOURS.map(({ value, label }) => (
                  <div key={value} className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-1.5">
                    <span className="flex items-center justify-end pr-1 font-mono text-[10px] text-[#e9e2d2]/50">{label}</span>
                    {AVAILABILITY_WEEKDAYS.map((day) => {
                      const enabled = isSlotEnabled(slots, day.value, value);
                      return (
                        <button
                          key={`${day.value}-${value}`}
                          type="button"
                          onClick={() => toggle(day.value, value)}
                          role="switch"
                          aria-checked={enabled}
                          aria-label={`${day.label} ${label}: ${enabled ? "activo" : "inactivo"}`}
                          className={`h-8 rounded-lg border transition ${
                            enabled
                              ? "border-gold/60 bg-gold/25 text-gold-bright shadow-[0_0_10px_rgba(197,160,89,.25)]"
                              : "border-white/8 bg-white/[0.02] text-[#e9e2d2]/25 hover:border-gold/30 hover:bg-white/[0.05]"
                          }`}
                        >
                          {enabled && <Check size={12} className="mx-auto" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {saved && (
          <p role="status" className="flex items-center gap-2 text-xs text-emerald-300">
            <Check size={14} /> Disponibilidad guardada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
