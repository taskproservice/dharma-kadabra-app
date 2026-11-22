import { Film } from "lucide-react";
import { TourEditor } from "../../../components/dashboard/tour-editor";
import { prisma } from "../../../lib/prisma";
import { DEFAULT_TOUR, parseTourChapters, type TourVideoConfig } from "../../../lib/tour";

export const dynamic = "force-dynamic";

/**
 * Gestor del Tour de marca: video inmersivo de la landing ("Quiénes somos"),
 * capítulos sincronizados por tiempo y CTA final.
 */
export default async function TourDashboardPage() {
  const record = await prisma.tourVideo
    .findFirst({ orderBy: { updatedAt: "desc" } })
    .catch(() => null);

  const config: TourVideoConfig = record
    ? {
        title: record.title,
        videoUrl: record.videoUrl,
        chapters: parseTourChapters(record.chapters),
        ctaText: record.ctaText,
        ctaLink: record.ctaLink,
      }
    : DEFAULT_TOUR;

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header>
        <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.28em] text-[#8B6914]">
          <Film size={13} />
          Contenido · Landing inmersiva
        </p>
        <h1 className="font-display text-4xl text-[#1A1A1A]">Tour de marca</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#2C2C2C]/70">
          Administra el video que abre el botón <span className="text-[#8B6914]">Quiénes somos</span> del
          Hero: fuente del video (Vimeo, YouTube o MP4), capítulos que aparecen por tiempo y el botón
          dorado final. Los cambios se publican al instante en la landing.
        </p>
      </header>
      <TourEditor initial={config} />
    </div>
  );
}
