"use client";
import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export default function InfoPage() {
  return <div className="mx-auto max-w-4xl space-y-7"><div><h1 className="text-3xl font-semibold">Información general</h1><p className="mt-2 text-[#3E2723]/60">Los datos que representan a Dharma Kadabra.</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles size={19} className="text-[#9A7B28]"/>Datos del negocio</CardTitle><CardDescription>Esta información puede mostrarse a tus clientes.</CardDescription></CardHeader><CardContent><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Información guardada"); }}>
      <label className="block space-y-2 text-sm font-medium">Nombre comercial<Input defaultValue="Dharma Kadabra"/></label><label className="block space-y-2 text-sm font-medium">Descripción<textarea className="min-h-24 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 p-3 text-sm outline-none focus:border-[#D4AF37]" defaultValue="Un espacio de bienestar, sabiduría ancestral y crecimiento consciente."/></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Mail size={15}/>Correo de contacto</span><Input type="email" defaultValue="hola@dharmakadabra.mx"/></label><label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Phone size={15}/>Teléfono</span><Input defaultValue="+52 664 123 4567"/></label></div>
      <label className="block space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><MapPin size={15}/>Ubicación</span><Input defaultValue="Tijuana, Baja California, México"/></label><div className="flex justify-end"><Button type="submit">Guardar información</Button></div>
    </form></CardContent></Card></div>;
}
