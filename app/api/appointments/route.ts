import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener citas", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await prisma.appointment.create({
      data: {
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        date: new Date(body.date),
        service: body.service,
        status: body.status || "CONFIRMED",
        notificationsSent: body.notificationsSent || [],
        notes: body.notes || null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear cita", details: String(error) },
      { status: 500 }
    );
  }
}
