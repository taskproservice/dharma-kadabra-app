"use client";
import { useState } from "react";
import { Check, Flame } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

const initial = [
  { id: 1, name: "Mariana López", email: "mariana@email.com", runes: 8, delivered: false },
  { id: 2, name: "Andrés Ruiz", email: "andres@email.com", runes: 5, delivered: false },
  { id: 3, name: "Sofía Martínez", email: "sofia@email.com", runes: 12, delivered: true },
  { id: 4, name: "Valeria Cruz", email: "valeria@email.com", runes: 3, delivered: false },
];
export default function RunasPage() {
  const [clients, setClients] = useState(initial);
  return <div className="mx-auto max-w-7xl space-y-7"><div><h1 className="text-3xl font-semibold">Runas · Clientes VIP</h1><p className="mt-2 text-[#3E2723]/60">Recompensas y entregas de la comunidad.</p></div>
    <div className="grid gap-4 sm:grid-cols-2"><Card><CardHeader className="flex-row items-center gap-4"><span className="rounded-xl bg-[#D4AF37]/15 p-3 text-[#9A7B28]"><Flame/></span><div><p className="text-sm text-[#3E2723]/55">Runas disponibles</p><CardTitle className="mt-1 text-2xl">{clients.reduce((sum, c) => sum + c.runes, 0)}</CardTitle></div></CardHeader></Card><Card><CardHeader className="flex-row items-center gap-4"><span className="rounded-xl bg-emerald-100 p-3 text-emerald-800"><Check/></span><div><p className="text-sm text-[#3E2723]/55">Clientes VIP</p><CardTitle className="mt-1 text-2xl">{clients.length}</CardTitle></div></CardHeader></Card></div>
    <Card><CardHeader><CardTitle>Programa de recompensas</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Runas acumuladas</TableHead><TableHead>Recompensa</TableHead><TableHead>Entrega</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>{clients.map((client) => <TableRow key={client.id}><TableCell><div className="font-medium">{client.name}</div><div className="text-xs text-[#3E2723]/55">{client.email}</div></TableCell><TableCell><span className="font-semibold text-[#9A7B28]">{client.runes}</span> runas</TableCell><TableCell>{client.runes >= 8 ? "Lectura especial" : "Acumulando"}</TableCell><TableCell><span className={`rounded-full px-2.5 py-1 text-xs ${client.delivered ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{client.delivered ? "Entregada" : "Pendiente"}</span></TableCell><TableCell className="text-right"><Button size="sm" variant={client.delivered ? "outline" : "default"} disabled={client.delivered || client.runes < 8} onClick={() => setClients((list) => list.map((c) => c.id === client.id ? { ...c, delivered: true } : c))}>{client.delivered ? "Entregada" : "Entregar"}</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </div>;
}
