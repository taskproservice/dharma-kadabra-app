"use client";
import { useState } from "react";
import { Camera, Check, Instagram, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export default function PerfilPage() {
  const [saved, setSaved] = useState(false);
  return <div className="mx-auto max-w-4xl space-y-7"><div><h1 className="text-3xl font-semibold text-papyrus">Mi perfil</h1><p className="mt-2 text-papyrus/55">Administra tu información pública y de contacto.</p></div>
    <Card><CardHeader><CardTitle>Información personal</CardTitle><CardDescription>Los datos que compartes con tu comunidad.</CardDescription></CardHeader><CardContent><form className="space-y-6" onChange={() => setSaved(false)} onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
      <div className="flex flex-wrap items-center gap-4"><div className="grid size-20 place-items-center rounded-full border border-gold/25 bg-obsidian-soft text-2xl font-semibold text-gold">PH</div><Button type="button" variant="outline" disabled title="Carga de fotografía de perfil · Próximamente"><Camera size={16}/>Cambiar foto · Próximamente</Button></div>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Nombre completo<Input defaultValue="Paola Hernández" /></label><label className="space-y-2 text-sm font-medium">Correo electrónico<Input type="email" defaultValue="paola@dharmakadabra.mx" /></label></div>
      <label className="block space-y-2 text-sm font-medium">Biografía<textarea className="field-dark min-h-28 p-3" defaultValue="Acompaño procesos de bienestar y crecimiento personal a través de prácticas ancestrales." /></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Instagram size={15}/>Instagram</span><Input defaultValue="@paola.consciente" /></label><label className="space-y-2 text-sm font-medium">Sitio web<Input placeholder="https://" /></label></div>
      <div className="flex items-center justify-end gap-3">{saved && <span role="status" className="inline-flex items-center gap-1.5 text-sm text-emerald-300"><Check size={15}/>Perfil guardado en esta sesión</span>}<Button type="submit"><Save size={16}/>Guardar cambios</Button></div>
    </form></CardContent></Card>
  </div>;
}
