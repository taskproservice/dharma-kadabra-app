"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Check,
  Database,
  ExternalLink,
  Hammer,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface HealthResponse {
  status: "healthy" | "degraded";
  timestamp: string;
  uptimeSeconds: number;
  nodeEnv: string;
  database: { ok: boolean; latencyMs: number };
  maintenance: boolean;
  env: Record<string, boolean>;
}

const ENV_LABELS: Record<string, string> = {
  DATABASE_URL: "Base de datos (pooler)",
  DATABASE_URL_UNPOOLED: "Base de datos (directa)",
  AUTH_SECRET: "Secreto de sesiones",
  CRON_SECRET: "Secreto de Cron",
  NEXT_PUBLIC_STORE_WHATSAPP: "WhatsApp de la tienda",
  OPENAI_API_KEY: "OpenAI (Cozy)",
};

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

/** Panel Ingeniería · estado del sistema, configuración y modo mantenimiento. */
export function IngenieriaClient() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/system/settings", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible consultar la salud del sistema.");
      setHealth(data as HealthResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible consultar la salud del sistema.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const toggleMaintenance = async () => {
    if (!health || busy) return;
    const next = !health.maintenance;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/system/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible guardar el modo mantenimiento.");
      setHealth((prev) => (prev ? { ...prev, maintenance: data.maintenance } : prev));
      setNotice(next ? "Modo Mantenimiento activado: la tienda pública quedó oculta." : "Modo Mantenimiento desactivado: la tienda ya es visible.");
      window.setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No fue posible guardar el modo mantenimiento.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="text-sm font-medium text-[#d8bc7f]">Panel Ingeniería · Soporte</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-[#f7f2e7]">Estado del sistema</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e9e2d2]/55">
          Salud de la base de datos, configuración de entorno y herramientas de contingencia.
        </p>
      </header>

      {/* Salud */}
      <section aria-label="Salud del sistema" className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Activity size={18} className="text-gold" /> Health check</CardTitle>
              <CardDescription>Verificación en vivo contra la base de datos.</CardDescription>
            </div>
            <Button variant="outline" onClick={loadHealth} disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Verificar
            </Button>
          </CardHeader>
          <CardContent>
            {loading && !health ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
                ))}
              </div>
            ) : error ? (
              <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
            ) : health ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#e9e2d2]/45">Estado general</p>
                  <p className={`mt-2 flex items-center gap-2 text-lg font-bold ${health.status === "healthy" ? "text-emerald-300" : "text-red-300"}`}>
                    {health.status === "healthy" ? <Check size={17} /> : <X size={17} />}
                    {health.status === "healthy" ? "Operativo" : "Degradado"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#e9e2d2]/45">Base de datos</p>
                  <p className={`mt-2 flex items-center gap-2 text-lg font-bold ${health.database.ok ? "text-emerald-300" : "text-red-300"}`}>
                    <Database size={17} />
                    {health.database.ok ? `${health.database.latencyMs} ms` : "Sin conexión"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#e9e2d2]/45">Servidor</p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#f7f2e7]">
                    <Server size={17} className="text-gold" /> {formatUptime(health.uptimeSeconds)}
                  </p>
                  <p className="mt-1 text-[11px] text-[#e9e2d2]/45">entorno: {health.nodeEnv}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Modo mantenimiento */}
        <Card className={health?.maintenance ? "border-amber-400/40" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hammer size={18} className="text-gold" /> Modo Mantenimiento</CardTitle>
            <CardDescription>Oculta la tienda pública si hay un fallo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${health?.maintenance ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
              <span className={`size-2 rounded-full ${health?.maintenance ? "bg-amber-300" : "bg-emerald-300"}`} />
              {health?.maintenance ? "Tienda oculta" : "Tienda visible"}
            </span>
            <Button
              type="button"
              variant={health?.maintenance ? "outline" : "gold"}
              onClick={toggleMaintenance}
              disabled={!health || busy}
              className="w-full"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {health?.maintenance ? "Desactivar mantenimiento" : "Activar mantenimiento"}
            </Button>
            <p className="text-[11px] leading-5 text-[#e9e2d2]/45">
              Al activarlo, <span className="font-mono text-[#e9e2d2]/65">/tienda</span> muestra un aviso y el catálogo deja de servirse.
            </p>
            {notice && (
              <p role="status" className="rounded-lg border border-[#c7a45a]/30 bg-[#c7a45a]/10 px-3 py-2 text-xs leading-5 text-[#e8d19a]">{notice}</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Variables de entorno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Server size={18} className="text-gold" /> Variables de entorno</CardTitle>
          <CardDescription>Presencia de la configuración necesaria. Nunca se muestran los valores.</CardDescription>
        </CardHeader>
        <CardContent>
          {!health ? (
            <p className="text-sm text-[#e9e2d2]/45">Cargando configuración…</p>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {Object.entries(ENV_LABELS).map(([key, label]) => {
                const configured = Boolean(health.env[key]);
                return (
                  <li key={key} className="flex items-center justify-between gap-3 rounded-xl border border-[#c7a45a]/15 bg-white/[0.03] px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#f7f2e7]">{label}</p>
                      <p className="truncate font-mono text-[11px] text-[#e9e2d2]/40">{key}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${configured ? "bg-emerald-400/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                      {configured ? <Check size={11} /> : <X size={11} />}
                      {configured ? "Lista" : "Falta"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Enlaces */}
      <Card>
        <CardHeader>
          <CardTitle>Enlaces de operación</CardTitle>
          <CardDescription>Accesos directos a las plataformas del proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] px-5 py-4 transition hover:border-[#c7a45a]/50">
            <span>
              <span className="block text-sm font-semibold text-[#f7f2e7]">Vercel · Deployments y logs</span>
              <span className="block text-xs text-[#e9e2d2]/45">Estado del despliegue, funciones serverless y cron.</span>
            </span>
            <ExternalLink size={17} className="shrink-0 text-[#d8bc7f] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] px-5 py-4 transition hover:border-[#c7a45a]/50">
            <span>
              <span className="block text-sm font-semibold text-[#f7f2e7]">Supabase · Base de datos</span>
              <span className="block text-xs text-[#e9e2d2]/45">Tablas, migraciones, roles y conexión.</span>
            </span>
            <ExternalLink size={17} className="shrink-0 text-[#d8bc7f] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
