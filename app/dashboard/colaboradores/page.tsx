"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { collaborators as seed, getInitials, type Collaborator } from "../../../lib/data/collaborators";

/** CRUD local API-ready: reemplazar las mutaciones por llamadas al servicio al conectar backend. */
export default function ColaboradoresPage() {
  const [people, setPeople] = useState<Collaborator[]>(() => seed.map((person) => ({ ...person })));

  const editor = (person?: Collaborator) => (
    <Dialog
      trigger={<Button variant={person ? "outline" : "default"} size={person ? "sm" : "default"}>{person ? <><Pencil size={14} />Editar</> : <><Plus size={16} />Nuevo Colaborador</>}</Button>}
      title={person ? "Editar colaborador" : "Nuevo colaborador"}
    >
      {(close) => (
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("name") ?? "").trim();
          const specialty = String(data.get("specialty") ?? "").trim();
          const bio = String(data.get("bio") ?? "").trim();
          const photoUrl = String(data.get("photoUrl") ?? "").trim();
          const email = String(data.get("email") ?? "").trim();
          if (!name || !specialty || !bio || !email) return;
          const updated: Collaborator = { id: person?.id ?? `collaborator-${crypto.randomUUID()}`, name, specialty, bio, photoUrl, email };
          if (person) setPeople((current) => current.map((entry) => entry.id === person.id ? updated : entry));
          else setPeople((current) => [...current, updated]);
          close();
        }}>
          <label className="block space-y-1.5 text-sm font-medium">Nombre<Input name="name" required maxLength={100} defaultValue={person?.name} autoComplete="name" /></label>
          <label className="block space-y-1.5 text-sm font-medium">Especialidad<Input name="specialty" required maxLength={120} defaultValue={person?.specialty} /></label>
          <label className="block space-y-1.5 text-sm font-medium">Bio<textarea name="bio" required maxLength={1200} rows={4} defaultValue={person?.bio} className="w-full rounded-xl border border-[#C5A059]/35 bg-[#FCFAF5] px-3 py-2 text-sm outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#D4AF37]/20" /></label>
          <label className="block space-y-1.5 text-sm font-medium">Foto (ruta pública o URL)<Input name="photoUrl" type="text" placeholder="/images/equipo/nombre.jpg" defaultValue={person?.photoUrl} /></label>
          <label className="block space-y-1.5 text-sm font-medium">Correo electrónico<Input name="email" type="email" required maxLength={160} defaultValue={person?.email} autoComplete="email" /></label>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={close}>Cancelar</Button><Button type="submit">Guardar colaborador</Button></div>
        </form>
      )}
    </Dialog>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-semibold">Colaboradores</h1><p className="mt-2 text-[#2C2C2C]/70">Administra perfiles que se muestran en la Landing Page.</p></div>
        {editor()}
      </div>
      <Card>
        <CardHeader><CardTitle>Equipo <span className="ml-2 text-sm font-normal text-[#2C2C2C]/60">{people.length} {people.length === 1 ? "persona" : "personas"}</span></CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Especialidad</TableHead><TableHead>Biografía</TableHead><TableHead>Correo</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>{people.map((person) => (
              <TableRow key={person.id}>
                <TableCell><div className="flex min-w-48 items-center gap-3">{person.photoUrl ? <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-[#FCFAF5]"><Image src={person.photoUrl} alt={`Retrato de ${person.name}`} fill sizes="44px" unoptimized className="object-cover" /></div> : <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FCFAF5] text-xs font-semibold text-[#8B6914]">{getInitials(person.name) || <UserRound size={18} />}</span>}<span className="font-medium">{person.name}</span></div></TableCell>
                <TableCell className="min-w-40">{person.specialty}</TableCell>
                <TableCell className="min-w-64 max-w-sm text-xs leading-5 text-[#2C2C2C]/70">{person.bio}</TableCell>
                <TableCell className="whitespace-nowrap">{person.email}</TableCell>
                <TableCell><div className="flex justify-end gap-2">{editor(person)}<Button size="sm" variant="ghost" aria-label={`Eliminar ${person.name}`} onClick={() => { if (window.confirm(`¿Eliminar a ${person.name} del equipo?`)) setPeople((current) => current.filter((entry) => entry.id !== person.id)); }}><Trash2 size={16} className="text-red-800" /></Button></div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          {people.length === 0 && <p className="py-8 text-center text-sm text-[#2C2C2C]/65">Aún no hay colaboradores.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
