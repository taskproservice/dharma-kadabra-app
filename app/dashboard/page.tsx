import { CalendarDays, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const week = [
  { day: "Lun", amount: 38 }, { day: "Mar", amount: 57 }, { day: "Mié", amount: 46 },
  { day: "Jue", amount: 76 }, { day: "Vie", amount: 61 }, { day: "Sáb", amount: 92 }, { day: "Dom", amount: 70 },
];
const points = week.map((item, i) => `${40 + i * 94},${190 - item.amount * 1.55}`).join(" ");

export default function DashboardPage() {
  return <div className="mx-auto max-w-7xl space-y-7">
    <div><p className="text-sm font-medium text-[#9A7B28]">Miércoles, 18 de noviembre</p><h1 className="mt-1 text-3xl font-semibold">Resumen</h1><p className="mt-2 text-[#3E2723]/60">Una mirada serena a la actividad de tu negocio.</p></div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Ventas del día</CardDescription><CardTitle className="mt-2 text-2xl">$18,450 <span className="text-xs font-medium text-emerald-700">+12.8%</span></CardTitle></div><span className="rounded-xl bg-[#D4AF37]/15 p-3 text-[#9A7B28]"><TrendingUp size={21}/></span></CardHeader><CardContent><p className="text-xs text-[#3E2723]/50">12 transacciones completadas</p></CardContent></Card>
      <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Ticket promedio</CardDescription><CardTitle className="mt-2 text-2xl">$1,537.50</CardTitle></div><span className="rounded-xl bg-[#D4AF37]/15 p-3 text-[#9A7B28]"><CreditCard size={21}/></span></CardHeader><CardContent><p className="text-xs text-[#3E2723]/50">En las ventas de hoy</p></CardContent></Card>
      <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Citas agendadas</CardDescription><CardTitle className="mt-2 text-2xl">8 <span className="text-sm font-medium text-[#3E2723]/50">para hoy</span></CardTitle></div><span className="rounded-xl bg-[#D4AF37]/15 p-3 text-[#9A7B28]"><CalendarDays size={21}/></span></CardHeader><CardContent><p className="text-xs text-[#3E2723]/50">Próxima cita a las 11:30</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Ventas semanales</CardTitle><CardDescription>Ingresos de los últimos siete días</CardDescription></CardHeader><CardContent>
      <div className="flex items-center gap-2 text-sm font-medium"><span className="size-2.5 rounded-full bg-[#D4AF37]"/>Ingresos</div>
      <div className="mt-5 overflow-hidden"><svg viewBox="0 0 650 230" className="h-64 w-full" role="img" aria-label="Gráfica de ventas semanales">
        {[40, 90, 140, 190].map((y) => <g key={y}><line x1="40" y1={y} x2="604" y2={y} stroke="#3E2723" strokeOpacity=".1" strokeDasharray="4 5"/><text x="6" y={y + 4} fontSize="11" fill="#3E2723" opacity=".5">${Math.round((190-y)*80)}k</text></g>)}
        <polyline points={points} fill="none" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {week.map((item, i) => <g key={item.day}><circle cx={40 + i * 94} cy={190 - item.amount * 1.55} r="5" fill="#3E2723"/><text x={40 + i * 94} y="218" textAnchor="middle" fontSize="12" fill="#3E2723" opacity=".65">{item.day}</text></g>)}
      </svg></div>
    </CardContent></Card>
  </div>;
}
