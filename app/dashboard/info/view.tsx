"use client";
import { useState } from "react";
import { Check, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export default function InfoPage() {
  const [saved, setSaved] = useState(false);
  return <div className="mx-auto max-w-4xl space-y-7"><div><h1 className="text-3xl font-semibold text-papyrus">Información general</h1><p className="mt-2 text-papyrus/55">Los datos que representan a Dharma Kadabra.</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles size={19} className="text-gold"/>Datos del negocio</CardTitle><CardDescription>Esta información puede mostrarse a tus clientes.</CardDescription></CardHeader><CardContent><form className="space-y-5" onChange={() => setSaved(false)} onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
      <label className="block space-y-2 text-sm font-medium">Nombre comercial<Input defaultValue="Dharma Kadabra"/></label><label className="block space-y-2 text-sm font-medium">Descripción<textarea className="field-dark min-h-24 p-3" defaultValue="Un espacio de bienestar, sabiduría ancestral y crecimiento consciente."/></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Mail size={15}/>Correo de contacto</span><Input type="email" defaultValue="hola@dharmakadabra.mx"/></label><label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Phone size={15}/>Teléfono</span><Input defaultValue="+52 664 123 4567"/></label></div>
      <label className="block space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><MapPin size={15}/>Ubicación</span><Input defaultValue="Tijuana, Baja California, México"/></label><div className="flex items-center justify-end gap-3">{saved && <span role="status" className="inline-flex items-center gap-1.5 text-sm text-emerald-300"><Check size={15}/>Información guardada en esta sesión</span>}<Button type="submit">Guardar información</Button></div>
    </form></CardContent></Card></div>;
}
