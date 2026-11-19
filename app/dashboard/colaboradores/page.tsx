"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import {
  getCollaborators,
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
} from "../../../lib/actions/collaborators";
import { getInitials } from "../../../lib/data/collaborators";
import type { CollaboratorRecord } from "../../../lib/prisma";

export default function ColaboradoresPage() {
  const [people, setPeople] = useState<CollaboratorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Carga inicial desde la base de datos real
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getCollaborators();
      setPeople(data);
    } catch (error) {
      console.error("Error al cargar colaboradores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>,
    person?: CollaboratorRecord,
    closeDialog?: () => void
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const specialty = String(form.get("specialty") ?? "").trim();
    const bio = String(form.get("bio") ?? "").trim();
    const imageUrl = String(form.get("photoUrl") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim() || "+52 55 1234 5678";

    if (!name || !specialty || !bio || !email) return;

    startTransition(async () => {
      try {
        if (person) {
          const updated = await updateCollaborator(person.id, {
            name,
            specialty,
            bio,
            imageUrl,
            email,
            phone,
          });
          setPeople((prev) => prev.map((p) => (p.id === person.id ? updated : p)));
        } else {
          const created = await createCollaborator({
            name,
            specialty,
            bio,
            imageUrl,
            email,
            phone,
          });
          setPeople((prev) => [...prev, created]);
        }
        closeDialog?.();
      } catch (err) {
        console.error("Error al guardar colaborador:", err);
        alert("Ocurrió un error al guardar en la base de datos.");
      }
    });
  };

  const handleDelete = (person: CollaboratorRecord) => {
    if (!window.confirm(`¿Eliminar a ${person.name} de la base de datos de Dharma Kadabra?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteCollaborator(person.id);
        setPeople((prev) => prev.filter((p) => p.id !== person.id));
      } catch (err) {
        console.error("Error al eliminar colaborador:", err);
        alert("Ocurrió un error al eliminar de la base de datos.");
      }
    });
  };

  const editor = (person?: CollaboratorRecord) => (
    <Dialog
      trigger={
        <Button variant={person ? "outline" : "default"} size={person ? "sm" : "default"}>
          {person ? (
            <>
              <Pencil size={14} /> Editar
            </>
          ) : (
            <>
              <Plus size={16} /> Nuevo Colaborador
            </>
          )}
        </Button>
      }
      title={person ? "Editar colaborador" : "Nuevo colaborador"}
    >
      {(close) => (
        <form className="space-y-4" onSubmit={(e) => handleSave(e, person, close)}>
          <label className="block space-y-1.5 text-sm font-medium">
            Nombre
            <Input name="name" required maxLength={100} defaultValue={person?.name} autoComplete="name" />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            Especialidad
            <Input name="specialty" required maxLength={120} defaultValue={person?.specialty} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            Bio
            <textarea
              name="bio"
              required
              maxLength={1200}
              rows={4}
              defaultValue={person?.bio}
              className="w-full rounded-xl border border-[#3E2723]/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            Foto (ruta pública o URL)
            <Input
              name="photoUrl"
              type="text"
              placeholder="/images/equipo/nombre.jpg"
              defaultValue={person?.imageUrl}
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            Correo electrónico
            <Input
              name="email"
              type="email"
              required
              maxLength={160}
              defaultValue={person?.email}
              autoComplete="email"
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            Teléfono de contacto
            <Input
              name="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              defaultValue={person?.phone}
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={close} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando en DB..." : "Guardar colaborador"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Colaboradores (Base de Datos Real)</h1>
          <p className="mt-2 text-[#3E2723]/60">
            Administra perfiles de colaboradores sincronizados con la base de datos de Dharma Kadabra.
          </p>
        </div>
        {editor()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Equipo</span>
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-[#8B6D16]" />
            ) : (
              <span className="text-sm font-normal text-[#3E2723]/50">
                {people.length} {people.length === 1 ? "persona" : "personas"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-[#3E2723]/60 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
              <span>Consultando colaboradores en la base de datos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Biografía</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="flex min-w-48 items-center gap-3">
                        {person.imageUrl ? (
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-[#E8DCC0]">
                            <Image
                              src={person.imageUrl}
                              alt={`Retrato de ${person.name}`}
                              fill
                              sizes="44px"
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E8DCC0] text-xs font-semibold text-[#8B6D16]">
                            {getInitials(person.name) || <UserRound size={18} />}
                          </span>
                        )}
                        <span className="font-medium">{person.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-40">{person.specialty}</TableCell>
                    <TableCell className="min-w-64 max-w-sm text-xs leading-5 text-[#3E2723]/65">
                      {person.bio}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{person.email}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {editor(person)}
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Eliminar ${person.name}`}
                          disabled={isPending}
                          onClick={() => handleDelete(person)}
                        >
                          <Trash2 size={16} className="text-red-700" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && people.length === 0 && (
            <p className="py-8 text-center text-sm text-[#3E2723]/55">
              Aún no hay colaboradores en la base de datos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
