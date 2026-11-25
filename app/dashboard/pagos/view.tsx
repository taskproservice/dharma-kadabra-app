"use client";
import { useState } from "react";
import { Check, CreditCard, Landmark } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

const methods = [
  { name: "Zelle", detail: "Pagos internacionales", icon: Landmark, account: "paola@dharmakadabra.mx" },
  { name: "BBVA", detail: "Transferencia bancaria", icon: Landmark, account: "•••• 2841" },
  { name: "Tarjeta", detail: "Débito y crédito", icon: CreditCard, account: "Visa · Mastercard" },
];
const initial = [
  { id: "PG-2081", customer: "Mariana López", method: "Tarjeta", amount: 1200, status: "CONFIRMADO", date: "18 nov 2026" },
  { id: "PG-2080", customer: "Andrés Ruiz", method: "Zelle", amount: 850, status: "PENDING", date: "18 nov 2026" },
  { id: "PG-2079", customer: "Sofía Martínez", method: "BBVA", amount: 640, status: "PENDING", date: "17 nov 2026" },
];
export default function PagosPage() {
  const [payments, setPayments] = useState(initial);
  return <div className="mx-auto max-w-7xl space-y-7"><div><h1 className="text-3xl font-semibold text-papyrus">Pasarela de pagos</h1><p className="mt-2 text-papyrus/55">Métodos disponibles y conciliación manual mientras se conecta el procesador automático.</p></div>
    <div className="grid gap-4 md:grid-cols-3">{methods.map(({ name, detail, icon: Icon, account }) => <Card key={name}><CardHeader className="flex-row items-start justify-between"><span className="rounded-xl bg-gold/12 p-3 text-gold"><Icon size={21}/></span><span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold-light">Conciliación manual</span></CardHeader><CardContent><CardTitle>{name}</CardTitle><p className="mt-1 text-sm text-papyrus/45">{detail}</p><p className="mt-4 text-sm font-medium">{account}</p><Button variant="outline" size="sm" className="mt-4" disabled title={`Próximamente: configuración automática de ${name}`}>Configurar · Próximamente</Button></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Actividad de pagos</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Referencia</TableHead><TableHead>Cliente</TableHead><TableHead>Método</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead><TableHead>Importe</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>{payments.map((p) => <TableRow key={p.id}><TableCell className="font-medium">{p.id}</TableCell><TableCell>{p.customer}</TableCell><TableCell>{p.method}</TableCell><TableCell>{p.date}</TableCell><TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.status === "CONFIRMADO" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{p.status}</span></TableCell><TableCell className="font-semibold">${p.amount.toLocaleString("es-MX")}</TableCell><TableCell className="text-right">{p.status === "PENDING" && <Button size="sm" variant="outline" onClick={() => setPayments((list) => list.map((x) => x.id === p.id ? { ...x, status: "CONFIRMADO" } : x))}><Check size={15}/>Confirmar</Button>}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </div>;
}
