"use server";

import { revalidatePath } from "next/cache";
import { prisma, type CollaboratorRecord } from "../prisma";

export async function getCollaborators(): Promise<CollaboratorRecord[]> {
  try {
    return await prisma.collaborator.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error al obtener colaboradores:", error);
    return [];
  }
}

export async function createCollaborator(data: {
  name: string;
  specialty: string;
  bio: string;
  imageUrl?: string;
  email: string;
  phone?: string;
}): Promise<CollaboratorRecord> {
  const newCollab = await prisma.collaborator.create({
    data: {
      name: data.name.trim(),
      role: "Colaboradora",
      specialty: data.specialty.trim(),
      bio: data.bio.trim(),
      imageUrl: data.imageUrl?.trim() || "/images/equipo/placeholder.jpg",
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || "+52 55 1234 5678",
      active: true,
    },
  });

  revalidatePath("/dashboard/colaboradores");
  revalidatePath("/");
  return newCollab;
}

export async function updateCollaborator(
  id: string,
  data: Partial<{
    name: string;
    specialty: string;
    bio: string;
    imageUrl: string;
    email: string;
    phone: string;
    active: boolean;
  }>
): Promise<CollaboratorRecord> {
  const updated = await prisma.collaborator.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/colaboradores");
  revalidatePath("/");
  return updated;
}

export async function deleteCollaborator(id: string): Promise<CollaboratorRecord> {
  const deleted = await prisma.collaborator.delete({
    where: { id },
  });

  revalidatePath("/dashboard/colaboradores");
  revalidatePath("/");
  return deleted;
}
