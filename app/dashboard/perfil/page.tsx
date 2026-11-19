"use client";
import { Camera, Instagram, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export default function PerfilPage() {
  return <div className="mx-auto max-w-4xl space-y-7"><div><h1 className="text-3xl font-semibold">Mi perfil</h1><p className="mt-2 text-[#3E2723]/60">Administra tu información pública y de contacto.</p></div>
    <Card><CardHeader><CardTitle>Información personal</CardTitle><CardDescription>Los datos que compartes con tu comunidad.</CardDescription></CardHeader><CardContent><form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Perfil guardado"); }}>
      <div className="flex items-center gap-4"><div className="grid size-20 place-items-center rounded-full bg-[#E8DCC0] text-2xl font-semibold text-[#8B6D16]">PH</div><Button type="button" variant="outline"><Camera size={16}/>Cambiar foto</Button></div>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Nombre completo<Input defaultValue="Paola Hernández" /></label><label className="space-y-2 text-sm font-medium">Correo electrónico<Input type="email" defaultValue="paola@dharmakadabra.mx" /></label></div>
      <label className="block space-y-2 text-sm font-medium">Biografía<textarea className="min-h-28 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 p-3 text-sm outline-none focus:border-[#D4AF37]" defaultValue="Acompaño procesos de bienestar y crecimiento personal a través de prácticas ancestrales." /></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Instagram size={15}/>Instagram</span><Input defaultValue="@paola.consciente" /></label><label className="space-y-2 text-sm font-medium">Sitio web<Input placeholder="https://" /></label></div>
      <div className="flex justify-end"><Button type="submit"><Save size={16}/>Guardar cambios</Button></div>
    </form></CardContent></Card>
  </div>;
}
