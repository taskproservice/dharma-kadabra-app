"use client";
import { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export default function AdminPage() {
  const [saved, setSaved] = useState(false);
  return <div className="mx-auto max-w-4xl space-y-7"><div><h1 className="text-3xl font-semibold">Panel administrativo</h1><p className="mt-2 text-[#2C2C2C]/70">Configuración general y acceso del equipo.</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck size={19} className="text-[#8B6914]"/>Preferencias del negocio</CardTitle><CardDescription>Ajustes base para tu espacio de trabajo.</CardDescription></CardHeader><CardContent><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Nombre del negocio<Input defaultValue="Dharma Kadabra"/></label><label className="space-y-2 text-sm font-medium">Zona horaria<select className="h-10 w-full rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] px-3 text-sm"><option>America/Tijuana</option><option>America/Mexico_City</option></select></label><label className="space-y-2 text-sm font-medium">Moneda<Input defaultValue="MXN · Peso mexicano"/></label><label className="space-y-2 text-sm font-medium">Correo de soporte<Input type="email" defaultValue="hola@dharmakadabra.mx"/></label></div>
      <div className="space-y-3 rounded-xl bg-[#FCFAF5] p-4"><label className="flex items-center justify-between gap-4 text-sm"><span><b className="block">Notificaciones de ventas</b><span className="text-xs text-[#2C2C2C]/65">Recibe un aviso con cada nueva venta.</span></span><input type="checkbox" defaultChecked className="size-4 accent-[#c7a45a]"/></label><label className="flex items-center justify-between gap-4 border-t border-[#C5A059]/30 pt-3 text-sm"><span><b className="block">Acceso de colaboradores</b><span className="text-xs text-[#2C2C2C]/65">Permitir acceso a los módulos asignados.</span></span><input type="checkbox" defaultChecked className="size-4 accent-[#c7a45a]"/></label></div>
      <div className="flex items-center justify-end gap-3">{saved && <span className="text-sm text-emerald-800">Cambios guardados</span>}<Button type="submit"><Save size={16}/>Guardar configuración</Button></div>
    </form></CardContent></Card></div>;
}
