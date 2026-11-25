import { NextResponse } from "next/server";
import { authorize } from "../../../../lib/rbac";
import { storeUpload } from "../../../../lib/storage";

export const dynamic = "force-dynamic";

/**
 * Subida del video del Tour de marca (ADMIN / ENGINEER).
 * Acepta MP4/WebM/OGG/MOV y devuelve su URL pública (Vercel Blob en
 * producción, `/uploads/tour/...` en desarrollo) para que el gestor la use
 * como `videoUrl`.
 */

const ALLOWED_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "video/quicktime": ".mov",
  "video/x-m4v": ".m4v",
};

const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

export async function POST(request: Request) {
  try {
    const auth = await authorize("tour", "POST");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la subida del video del tour:", error);
    return NextResponse.json(
      { error: "No fue posible verificar tu sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envía un archivo de video." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Formato no soportado. Usa MP4, WebM, OGG o MOV." },
      { status: 415 },
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "El video supera el máximo permitido de 200 MB." },
      { status: 413 },
    );
  }

  const safeName = `tour-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  try {
    const stored = await storeUpload(file, "tour", safeName);
    return NextResponse.json({ url: stored.url });
  } catch (error) {
    console.error("Error al guardar el video del tour:", error);
    return NextResponse.json(
      { error: "No fue posible guardar el archivo en el servidor." },
      { status: 500 },
    );
  }
}
