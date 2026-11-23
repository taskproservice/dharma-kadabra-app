"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeDollarSign,
  CalendarDays,
  Check,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { ROLES, type Role } from "../../lib/rbac-config";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface AdminKpis {
  monthRevenue: number;
  weekAppointments: number;
  lowStockCount: number;
  lowStock: { id: string; name: string; stock: number }[];
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administradora",
  ENGINEER: "Ingeniería",
  COLLABORATOR: "Colaboradora",
  MARKETING: "Marketing",
};

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

/** Panel Admin · KPIs globales y gestión de usuarios (solo Paola). */
export function AdminPanelClient({ initialUsers, initialKpis }: { initialUsers: StaffUser[]; initialKpis: AdminKpis }) {
  const [users, setUsers] = useState<StaffUser[]>(initialUsers);
  const [kpis] = useState<AdminKpis>(initialKpis);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Formulario de alta
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "COLLABORATOR" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible cargar el equipo.");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      notify(error instanceof Error ? error.message : "No fue posible cargar el equipo.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (form.name.trim().length < 2) return setFormError("Escribe el nombre completo.");
    if (form.password.length < 8) return setFormError("La contraseña debe tener al menos 8 caracteres.");
    setSaving(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible crear la cuenta.");
      notify(`Cuenta creada para ${data.user.name}`);
      setForm({ name: "", email: "", password: "", role: "COLLABORATOR" });
      setIsCreating(false);
      await loadUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible crear la cuenta.");
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (user: StaffUser, role: Role) => {
    if (role === user.role) return;
    setBusyId(user.id);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible actualizar el rol.");
      notify(`${user.name} ahora es ${ROLE_LABELS[role] ?? role}`);
      await loadUsers();
    } catch (error) {
      notify(error instanceof Error ? error.message : "No fue posible actualizar el rol.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (user: StaffUser) => {
    setBusyId(user.id);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No fue posible actualizar la cuenta.");
      notify(user.active ? `${user.name} dejó de tener acceso` : `${user.name} volvió a tener acceso`);
      await loadUsers();
    } catch (error) {
      notify(error instanceof Error ? error.message : "No fue posible actualizar la cuenta.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Encabezado */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#d8bc7f]">Panel Admin · Solo Paola</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#f7f2e7]">Centro de control del negocio</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e9e2d2]/55">
            Ingresos, agenda y inventario en una sola mirada. Aquí también administras las cuentas del equipo.
          </p>
        </div>
        <Button variant="gold" onClick={() => setIsCreating((v) => !v)}>
          <Plus size={16} /> Nuevo colaborador
        </Button>
      </header>

      {/* KPIs */}
      <section aria-label="Indicadores del negocio" className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Ingresos del mes</CardDescription>
              <CardTitle className="mt-2 font-display text-3xl">{money(kpis.monthRevenue)}</CardTitle>
            </div>
            <span className="grid size-11 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
              <BadgeDollarSign size={20} />
            </span>
          </CardHeader>
          <CardContent><p className="text-xs text-[#e9e2d2]/45">Ventas registradas en los últimos 30 días.</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Citas de la semana</CardDescription>
              <CardTitle className="mt-2 font-display text-3xl">{kpis.weekAppointments}</CardTitle>
            </div>
            <span className="grid size-11 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
              <CalendarDays size={20} />
            </span>
          </CardHeader>
          <CardContent><p className="text-xs text-[#e9e2d2]/45">Sesiones programadas en los próximos 7 días.</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Productos con bajo stock</CardDescription>
              <CardTitle className="mt-2 font-display text-3xl">{kpis.lowStockCount}</CardTitle>
            </div>
            <span className={`grid size-11 place-items-center rounded-xl border ${kpis.lowStockCount > 0 ? "border-amber-400/35 bg-amber-400/10 text-amber-300" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>
              <TriangleAlert size={20} />
            </span>
          </CardHeader>
          <CardContent>
            {kpis.lowStock.length > 0 ? (
              <ul className="space-y-1 text-xs text-[#e9e2d2]/55">
                {kpis.lowStock.slice(0, 3).map((item) => (
                  <li key={item.id} className="truncate">· {item.name} — {item.stock} pzs.</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#e9e2d2]/45">Inventario saludable (más de 5 piezas por producto).</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Alta de colaborador */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck size={18} className="text-gold" /> Crear colaborador</CardTitle>
            <CardDescription>La persona recibirá acceso al dashboard con el rol que elijas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Nombre completo
                  <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Ej. Mariana López" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Correo
                  <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="colaboradora@dharmakadabra.mx" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Contraseña
                  <Input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Mínimo 8 caracteres" />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#e9e2d2]/60">Rol
                  <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} className="field-dark h-10 w-full rounded-xl px-3 text-sm">
                    {ROLES.filter((role) => role !== "CLIENT").map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role] ?? role}</option>
                    ))}
                  </select>
                </label>
              </div>
              {formError && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setFormError(null); }}>Cancelar</Button>
                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? "Creando…" : "Crear cuenta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Usuarios */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users size={18} className="text-gold" /> Gestión de usuarios</CardTitle>
            <CardDescription>{users.length} {users.length === 1 ? "cuenta activa en el sistema" : "cuentas en el sistema"}.</CardDescription>
          </div>
          <Button variant="outline" onClick={loadUsers} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Recargar
          </Button>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-[#c7a45a]/10">
              {users.map((user) => (
                <li key={user.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
                      <UserRound size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#f7f2e7]">{user.name}</p>
                      <p className="truncate text-xs text-[#e9e2d2]/50">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={user.role}
                      onChange={(event) => changeRole(user, event.target.value as Role)}
                      disabled={busyId === user.id}
                      aria-label={`Rol de ${user.name}`}
                      className="field-dark h-9 rounded-lg px-2.5 text-xs"
                    >
                      {ROLES.filter((role) => role !== "CLIENT").map((role) => (
                        <option key={role} value={role}>{ROLE_LABELS[role] ?? role}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleActive(user)}
                      disabled={busyId === user.id}
                      role="switch"
                      aria-checked={user.active}
                      className={`inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${user.active ? "bg-gold/80" : "bg-white/10"}`}
                      title={user.active ? "Desactivar acceso" : "Activar acceso"}
                    >
                      <span className={`ml-0.5 size-5 rounded-full bg-[#0b1020] shadow transition-transform ${user.active ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <span className={`text-[10px] font-semibold uppercase tracking-[.14em] ${user.active ? "text-emerald-300" : "text-red-300"}`}>
                      {user.active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {toast && (
        <p role="status" className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#c7a45a]/40 bg-[#0b1020]/95 px-5 py-3 text-sm text-[#f7f2e7] shadow-2xl backdrop-blur-xl">
          <Check size={15} className="text-emerald-300" /> {toast}
        </p>
      )}
    </div>
  );
}
