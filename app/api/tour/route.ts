import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "../../../src/generated/prisma";
import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/rbac";
import { parseTourChapters, type TourChapter, type TourVideoConfig } from "../../../lib/tour";

export const dynamic = "force-dynamic";

/**
 * Tour de marca (video inmersivo "Quiénes somos").
 * - GET (público): configuración actual del tour para la landing.
 * - PUT (ADMIN / ENGINEER): guarda video, capítulos y CTA final.
 * - PATCH: alias semántico de PUT (misma validación).
 */

function serialize(record: {
  title: string;
  videoUrl: string;
  chapters: unknown;
  ctaText: string;
  ctaLink: string;
}): TourVideoConfig {
  return {
    title: record.title,
    videoUrl: record.videoUrl,
    chapters: parseTourChapters(record.chapters),
    ctaText: record.ctaText,
    ctaLink: record.ctaLink,
  };
}

export async function GET() {
  try {
    const record = await prisma.tourVideo.findFirst({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ config: record ? serialize(record) : null });
  } catch (error) {
    console.error("Error al consultar el tour de marca:", error);
    return NextResponse.json({ config: null });
  }
}

const chapterSchema = z.object({
  time: z.number().min(0).max(86_400),
  label: z.string().trim().min(1).max(120),
  text: z.string().trim().max(280).optional(),
});

const tourSchema = z.object({
  title: z.string().trim().min(1).max(120),
  videoUrl: z.string().trim().min(1).max(500),
  chapters: z.array(chapterSchema).max(24),
  ctaText: z.string().trim().min(1).max(60),
  ctaLink: z.string().trim().min(1).max(300),
});

async function upsertTour(request: Request) {
  try {
    const auth = await authorize("tour", "PUT");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar el tour de marca:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const parsed = tourSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos: revisa el video, los capítulos y la llamada a la acción." },
      { status: 400 },
    );
  }

  const chapters: TourChapter[] = parsed.data.chapters
    .map((chapter) =>
      chapter.text
        ? { time: chapter.time, label: chapter.label, text: chapter.text }
        : { time: chapter.time, label: chapter.label },
    )
    .sort((a, b) => a.time - b.time);

  try {
    const existing = await prisma.tourVideo.findFirst({ orderBy: { updatedAt: "desc" } });
    const data = {
      title: parsed.data.title,
      videoUrl: parsed.data.videoUrl,
      chapters: chapters as unknown as Prisma.InputJsonValue,
      ctaText: parsed.data.ctaText,
      ctaLink: parsed.data.ctaLink,
    };
    const record = existing
      ? await prisma.tourVideo.update({ where: { id: existing.id }, data })
      : await prisma.tourVideo.create({ data });
    return NextResponse.json({ config: serialize(record) });
  } catch (error) {
    console.error("Error al guardar el tour de marca:", error);
    return NextResponse.json(
      { error: "No fue posible guardar los cambios. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  return upsertTour(request);
}

export async function PATCH(request: Request) {
  return upsertTour(request);
}
