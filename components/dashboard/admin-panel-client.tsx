"use client";

import {
  BadgeDollarSign,
  CalendarDays,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { UserManagement, type StaffUser } from "./user-management";

export type { StaffUser };

export interface AdminKpis {
  monthRevenue: number;
  weekAppointments: number;
  lowStockCount: number;
  lowStock: { id: string; name: string; stock: number }[];
}

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

/** Panel Admin · KPIs globales y gestión de usuarios (solo ADMIN). */
export function AdminPanelClient({ initialUsers, initialKpis }: { initialUsers: StaffUser[]; initialKpis: AdminKpis }) {
  const kpis = initialKpis;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Encabezado */}
      <header>
        <p className="text-sm font-medium text-[#d8bc7f]">Panel Admin · Solo Paola</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-[#f7f2e7]">Centro de control del negocio</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e9e2d2]/55">
          Ingresos, agenda y inventario en una sola mirada. Aquí también administras las cuentas del equipo.
        </p>
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

      {/* Gestión de usuarios (solo ADMIN e Ingeniería) */}
      <UserManagement initialUsers={initialUsers} />
    </div>
  );
}
