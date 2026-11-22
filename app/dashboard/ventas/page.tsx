"use client";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

const transactions = [
  { id: "DK-1048", date: "2026-11-18", client: "Mariana López", product: "Lectura de runas", method: "Tarjeta", amount: 1200, status: "Completado" },
  { id: "DK-1047", date: "2026-11-18", client: "Andrés Ruiz", product: "Sesión de bienestar", method: "Zelle", amount: 850, status: "Completado" },
  { id: "DK-1046", date: "2026-11-17", client: "Sofía Martínez", product: "Kit de intención", method: "BBVA", amount: 640, status: "Pendiente" },
  { id: "DK-1045", date: "2026-11-17", client: "Diego Torres", product: "Consulta personalizada", method: "Tarjeta", amount: 1500, status: "Completado" },
  { id: "DK-1044", date: "2026-11-16", client: "Valeria Cruz", product: "Audio de meditación", method: "Zelle", amount: 320, status: "Completado" },
];
export default function VentasPage() {
  const [query, setQuery] = useState(""); const [date, setDate] = useState(""); const [method, setMethod] = useState("Todos");
  const filtered = useMemo(() => transactions.filter((t) => t.client.toLowerCase().includes(query.toLowerCase()) && (!date || t.date === date) && (method === "Todos" || t.method === method)), [query, date, method]);
  return <div className="mx-auto max-w-7xl space-y-7"><div><h1 className="text-3xl font-semibold">Módulo de ventas</h1><p className="mt-2 text-[#2C2C2C]/70">Consulta y filtra las transacciones recientes.</p></div>
    <Card><CardHeader className="flex-row flex-wrap items-center justify-between gap-4"><CardTitle>Transacciones</CardTitle><Button variant="outline" onClick={() => alert("Reporte preparado") }><Download size={16}/>Exportar</Button></CardHeader><CardContent><div className="mb-5 grid gap-3 md:grid-cols-[1fr_190px_190px]"><div className="relative"><Search size={16} className="absolute left-3 top-3 text-[#2C2C2C]/60"/><Input className="pl-9" placeholder="Buscar cliente..." value={query} onChange={(e) => setQuery(e.target.value)}/></div><Input aria-label="Filtrar por fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)}/><select className="h-10 rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}><option>Todos</option><option>Tarjeta</option><option>Zelle</option><option>BBVA</option></select></div>
      <Table><TableHeader><TableRow><TableHead>Referencia</TableHead><TableHead>Fecha</TableHead><TableHead>Cliente / producto</TableHead><TableHead>Método</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Importe</TableHead></TableRow></TableHeader><TableBody>{filtered.map((t) => <TableRow key={t.id}><TableCell className="font-medium">{t.id}</TableCell><TableCell>{t.date}</TableCell><TableCell><div className="font-medium">{t.client}</div><div className="text-xs text-[#2C2C2C]/65">{t.product}</div></TableCell><TableCell>{t.method}</TableCell><TableCell><span className={`rounded-full px-2.5 py-1 text-xs ${t.status === "Completado" ? "bg-emerald-500/15 text-emerald-800" : "bg-amber-500/15 text-amber-800"}`}>{t.status}</span></TableCell><TableCell className="text-right font-semibold">${t.amount.toLocaleString("es-MX")}</TableCell></TableRow>)}</TableBody></Table>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-[#2C2C2C]/65">No hay transacciones que coincidan con los filtros.</p>}
    </CardContent></Card></div>;
}
