import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await prisma.collaborator.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener colaboradores", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await prisma.collaborator.create({
      data: {
        name: body.name,
        role: body.role || "Colaboradora",
        specialty: body.specialty,
        bio: body.bio,
        imageUrl: body.imageUrl || body.photoUrl || "/images/equipo/placeholder.jpg",
        email: body.email,
        phone: body.phone || "+52 55 1234 5678",
        active: true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear colaborador", details: String(error) },
      { status: 500 }
    );
  }
}
