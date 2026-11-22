"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Film, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  describeVideoSource,
  formatChapterTime,
  parseChapterTime,
  resolveVideoSource,
  type TourChapter,
  type TourVideoConfig,
} from "../../lib/tour";

type ChapterRow = {
  key: string;
  time: string;
  label: string;
  text: string;
};

function toRows(chapters: TourChapter[]): ChapterRow[] {
  return chapters.map((chapter, index) => ({
    key: `${index}-${chapter.time}-${chapter.label}`,
    time: formatChapterTime(chapter.time),
    label: chapter.label,
    text: chapter.text ?? "",
  }));
}

type StatusMessage = { kind: "ok" | "error"; text: string } | null;

/**
 * Editor del Tour de marca. Guarda en la base de datos real vía `PUT /api/tour`
 * (modelo `TourVideo` de Prisma) y permite subir un MP4/WebM/MOV al servidor.
 */
export function TourEditor({ initial }: { initial: TourVideoConfig }) {
  const [title, setTitle] = useState(initial.title);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [rows, setRows] = useState<ChapterRow[]>(() => toRows(initial.chapters));
  const [ctaText, setCtaText] = useState(initial.ctaText);
  const [ctaLink, setCtaLink] = useState(initial.ctaLink);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<StatusMessage>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const source = useMemo(() => resolveVideoSource(videoUrl), [videoUrl]);

  function updateRow(key: string, patch: Partial<ChapterRow>) {
    setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((list) => [...list, { key: `nueva-${Date.now()}`, time: "0:00", label: "", text: "" }]);
  }

  function removeRow(key: string) {
    setRows((list) => list.filter((row) => row.key !== key));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/tour/upload", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "No fue posible subir el archivo.");
      }
      setVideoUrl(data.url);
      setMessage({ kind: "ok", text: "Video subido. Ya quedó como fuente del tour." });
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "No fue posible subir el archivo.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    if (!videoUrl.trim()) {
      setMessage({ kind: "error", text: "Pega la URL del video o sube un archivo." });
      return;
    }

    const chapters: TourChapter[] = [];
    for (const row of rows) {
      const label = row.label.trim();
      const time = parseChapterTime(row.time);
      if (!label) {
        setMessage({ kind: "error", text: "Cada capítulo necesita un texto visible." });
        return;
      }
      if (time === null) {
        setMessage({
          kind: "error",
          text: `Tiempo inválido "${row.time}". Usa mm:ss (ej. 0:05) o segundos (ej. 5).`,
        });
        return;
      }
      const detail = row.text.trim();
      chapters.push(detail ? { time, label, text: detail } : { time, label });
    }
    chapters.sort((a, b) => a.time - b.time);

    setSaving(true);
    try {
      const response = await fetch("/api/tour", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Quiénes Somos",
          videoUrl: videoUrl.trim(),
          chapters,
          ctaText: ctaText.trim() || "Explorar la Colección",
          ctaLink: ctaLink.trim() || "#coleccion",
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "No fue posible guardar los cambios.");
      setMessage({ kind: "ok", text: "Tour actualizado. Los cambios ya están vivos en la landing." });
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "No fue posible guardar los cambios.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-7" onSubmit={handleSave}>
      {/* Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film size={19} className="text-[#d8bc7f]" />
            Video del tour
          </CardTitle>
          <CardDescription>
            Pega una URL de Vimeo, YouTube o un archivo MP4/WebM directo, o sube el video al servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block space-y-2 text-sm font-medium">
            Título del tour
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Quiénes Somos" />
          </label>

          <div className="space-y-2">
            <label className="block space-y-2 text-sm font-medium">
              URL del video
              <Input
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="https://vimeo.com/… · https://youtube.com/watch?v=… · /uploads/tour/…"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? "Subiendo…" : "Subir archivo"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogv,.mov"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void handleUpload(file);
                }}
              />
              <span className="rounded-full border border-[#c7a45a]/30 bg-white/[0.03] px-3 py-1 text-[11px] text-[#e9e2d2]/60">
                Detectado: {describeVideoSource(source)}
              </span>
            </div>
          </div>

          {videoUrl.trim() ? (
            <div className="overflow-hidden rounded-2xl border border-[#c7a45a]/20 bg-black">
              {source.kind === "file" ? (
                <video key={videoUrl} src={source.src} controls preload="metadata" className="aspect-video w-full" />
              ) : (
                <iframe
                  key={videoUrl}
                  src={source.embedUrl}
                  title="Vista previa del tour"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full border-0"
                />
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Capítulos */}
      <Card>
        <CardHeader>
          <CardTitle>Capítulos superpuestos</CardTitle>
          <CardDescription>
            Aparecen sobre el video cuando el reproductor alcanza su tiempo. Ej. &ldquo;Minuto 0:00 —
            Introducción&rdquo;. Se ordenan automáticamente de menor a mayor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#c7a45a]/25 px-4 py-6 text-center text-sm text-[#e9e2d2]/50">
              Sin capítulos todavía: el video se reproducirá sin textos superpuestos.
            </p>
          )}
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="grid gap-3 rounded-2xl border border-[#c7a45a]/15 bg-white/[0.02] p-4 sm:grid-cols-[7rem_1fr_1fr_auto] sm:items-end"
            >
              <label className="block space-y-1.5 text-xs font-medium text-[#e9e2d2]/70">
                Tiempo
                <Input
                  value={row.time}
                  onChange={(event) => updateRow(row.key, { time: event.target.value })}
                  placeholder="0:05"
                  aria-label={`Tiempo del capítulo ${index + 1}`}
                />
              </label>
              <label className="block space-y-1.5 text-xs font-medium text-[#e9e2d2]/70">
                Texto del capítulo
                <Input
                  value={row.label}
                  onChange={(event) => updateRow(row.key, { label: event.target.value })}
                  placeholder="Nuestra Historia"
                  aria-label={`Texto del capítulo ${index + 1}`}
                />
              </label>
              <label className="block space-y-1.5 text-xs font-medium text-[#e9e2d2]/70">
                Descripción (opcional)
                <Input
                  value={row.text}
                  onChange={(event) => updateRow(row.key, { text: event.target.value })}
                  placeholder="Una línea de apoyo bajo el título"
                  aria-label={`Descripción del capítulo ${index + 1}`}
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeRow(row.key)}
                aria-label={`Eliminar capítulo ${index + 1}`}
                className="text-[#e9e2d2]/50 hover:text-[#D96538]"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addRow}>
            <Plus size={16} />
            Agregar capítulo
          </Button>
        </CardContent>
      </Card>

      {/* CTA final */}
      <Card>
        <CardHeader>
          <CardTitle>Llamada a la acción final</CardTitle>
          <CardDescription>
            Botón dorado que aparece al terminar el video. Al pulsarlo se cierra el tour y se hace
            scroll hacia la sección indicada.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium">
            Texto del botón
            <Input value={ctaText} onChange={(event) => setCtaText(event.target.value)} placeholder="Explorar la Colección" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Destino
            <Input value={ctaLink} onChange={(event) => setCtaLink(event.target.value)} placeholder="#coleccion" />
          </label>
        </CardContent>
      </Card>

      {/* Guardar */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        {message && (
          <p
            role="status"
            className={`inline-flex items-center gap-2 text-sm ${message.kind === "ok" ? "text-[#a8d5a2]" : "text-[#e0825f]"}`}
          >
            {message.kind === "ok" ? <Check size={15} /> : null}
            {message.text}
          </p>
        )}
        <Button type="submit" variant="gold" disabled={saving || uploading}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
