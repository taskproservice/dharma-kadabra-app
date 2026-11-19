"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

type Collaborator = { id: number; name: string; specialty: string; email: string; initials: string };
const seed: Collaborator[] = [
  { id: 1, name: "Lucía Moreno", specialty: "Terapeuta holística", email: "lucia@dharmakadabra.mx", initials: "LM" },
  { id: 2, name: "Mateo Sánchez", specialty: "Lector de runas", email: "mateo@dharmakadabra.mx", initials: "MS" },
  { id: 3, name: "Isabel Vega", specialty: "Guía de meditación", email: "isabel@dharmakadabra.mx", initials: "IV" },
];
export default function ColaboradoresPage() {
  const [people, setPeople] = useState(seed); const [editing, setEditing] = useState<Collaborator | null>(null);
  const editor = (person?: Collaborator) => <Dialog trigger={<Button variant={person ? "outline" : "default"} size={person ? "sm" : "default"}>{person ? <><Pencil size={14}/>Editar</> : <><Plus size={16}/>Agregar colaborador</>}</Button>} title={person ? "Editar colaborador" : "Nuevo colaborador"}>{(close) => <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get("name")); const specialty = String(data.get("specialty")); const email = String(data.get("email")); const initials = name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase(); if (person) setPeople((list) => list.map((p) => p.id === person.id ? { ...p, name, specialty, email, initials } : p)); else setPeople((list) => [...list, { id: Date.now(), name, specialty, email, initials }]); close(); }}>
    <label className="block space-y-1.5 text-sm font-medium">Nombre<Input name="name" required defaultValue={person?.name}/></label><label className="block space-y-1.5 text-sm font-medium">Especialidad<Input name="specialty" required defaultValue={person?.specialty}/></label><label className="block space-y-1.5 text-sm font-medium">Correo<Input name="email" type="email" required defaultValue={person?.email}/></label><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={close}>Cancelar</Button><Button type="submit">Guardar</Button></div>
  </form>}</Dialog>;
  return <div className="mx-auto max-w-7xl space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold">Colaboradores</h1><p className="mt-2 text-[#3E2723]/60">Administra el equipo y sus especialidades.</p></div>{editor()}</div>
    <Card><CardHeader><CardTitle>Equipo <span className="ml-2 text-sm font-normal text-[#3E2723]/50">{people.length} personas</span></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Especialidad</TableHead><TableHead>Correo</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader><TableBody>{people.map((p) => <TableRow key={p.id}><TableCell><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#E8DCC0] text-xs font-semibold text-[#8B6D16]">{p.initials || <UserRound size={18}/>}</span><span className="font-medium">{p.name}</span></div></TableCell><TableCell>{p.specialty}</TableCell><TableCell>{p.email}</TableCell><TableCell><div className="flex justify-end gap-2">{editor(p)}<Button size="sm" variant="ghost" aria-label={`Eliminar ${p.name}`} onClick={() => setPeople((list) => list.filter((x) => x.id !== p.id))}><Trash2 size={16} className="text-red-700"/></Button></div></TableCell></TableRow>)}</TableBody></Table>{people.length === 0 && <p className="py-8 text-center text-sm text-[#3E2723]/55">Aún no hay colaboradores.</p>}</CardContent></Card></div>;
}
