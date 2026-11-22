/**
 * Dharma Kadabra · Tour de marca (video inmersivo "Quiénes somos").
 *
 * Tipos y utilidades compartidos por la landing (`brand-tour-modal`), el panel
 * de administración (`/dashboard/tour`) y la API (`/api/tour`).
 *
 * El contenido real (video, capítulos y CTA) vive en Prisma (modelo
 * `TourVideo`). `DEFAULT_TOUR` solo se usa como degradación elegante cuando la
 * base de datos no está disponible o el administrador aún no ha configurado el
 * tour: la fuente de verdad siempre es la base de datos.
 */

export type TourChapter = {
  /** Segundos desde el inicio del video en los que aparece el capítulo. */
  time: number;
  /** Título corto superpuesto sobre el video. */
  label: string;
  /** Texto opcional de apoyo bajo el título. */
  text?: string;
};

export type TourVideoConfig = {
  title: string;
  videoUrl: string;
  chapters: TourChapter[];
  ctaText: string;
  ctaLink: string;
};

export type VideoSourceKind = "file" | "youtube" | "vimeo";

export type VideoSource = {
  kind: VideoSourceKind;
  /** Reproducción directa (MP4/WebM/…) cuando `kind === "file"`. */
  src?: string;
  /** URL embebida (YouTube/Vimeo) cuando `kind !== "file"`. */
  embedUrl?: string;
  /** Identificador del recurso embebido. */
  id?: string;
};

/**
 * Configuración de respaldo: permite ver el tour aunque la base de datos no
 * responda. El video es un clip libre de demostración (Big Buck Bunny, CC-BY).
 */
export const DEFAULT_TOUR: TourVideoConfig = {
  title: "Quiénes Somos",
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  chapters: [
    {
      time: 0,
      label: "Nuestra Historia",
      text: "Un espacio nacido para acompañar caminos con amor y sabiduría.",
    },
    {
      time: 3,
      label: "Los Talismanes",
      text: "Piezas creadas para conectar, transformar y armonizar.",
    },
    {
      time: 7,
      label: "Registros Akáshicos",
      text: "Lecturas que te ayudan a escuchar lo que tu alma ya sabe.",
    },
  ],
  ctaText: "Explorar la Colección",
  ctaLink: "#coleccion",
};

/** Normaliza el Json de `chapters` a una lista ordenada y válida. */
export function parseTourChapters(raw: unknown): TourChapter[] {
  if (!Array.isArray(raw)) return [];
  const chapters: TourChapter[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as { time?: unknown; label?: unknown; text?: unknown };
    const time = Number(candidate.time);
    const label = typeof candidate.label === "string" ? candidate.label.trim() : "";
    const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
    if (!Number.isFinite(time) || time < 0 || !label) continue;
    chapters.push(text ? { time, label, text } : { time, label });
  }
  return chapters.sort((a, b) => a.time - b.time);
}

/** Segundos → "m:ss" (ej. 65 → "1:05"). */
export function formatChapterTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** "m:ss" o segundos sueltos → segundos. Devuelve `null` si es ilegible. */
export function parseChapterTime(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;
  if (/^\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
  const match = raw.match(/^(\d+):(\d{1,2})(?:\.(\d{1,3}))?$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (seconds > 59) return null;
  return minutes * 60 + seconds + (match[3] ? Number(`0.${match[3]}`) : 0);
}

/**
 * Detecta el proveedor del video a partir de la URL administrada:
 * YouTube, Vimeo o un archivo directo (MP4/WebM/OGG/MOV u otro).
 */
export function resolveVideoSource(rawUrl: string): VideoSource {
  const url = (rawUrl ?? "").trim();
  if (!url) return { kind: "file", src: "" };

  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  if (youtube) {
    return {
      kind: "youtube",
      id: youtube[1],
      embedUrl: `https://www.youtube.com/embed/${youtube[1]}?enablejsapi=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1`,
    };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) {
    return {
      kind: "vimeo",
      id: vimeo[1],
      // `color` tiñe los controles nativos con el oro de la marca.
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?title=0&byline=0&portrait=0&autopause=0&color=c5a059&playsinline=1`,
    };
  }

  return { kind: "file", src: url };
}

/** Etiqueta amable del proveedor para el panel de administración. */
export function describeVideoSource(source: VideoSource): string {
  if (source.kind === "youtube") return "YouTube";
  if (source.kind === "vimeo") return "Vimeo";
  return "Video directo (MP4/WebM/…)";
}
