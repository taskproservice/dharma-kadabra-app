import { NextResponse } from "next/server";
import { authorize } from "../../../../lib/rbac";
import { storeUpload } from "../../../../lib/storage";

export const dynamic = "force-dynamic";

/**
 * Subida de imagen de producto · Panel de Marketing.
 * Acepta imágenes JPEG/PNG/WebP de hasta 5 MB y devuelve su URL pública
 * (Vercel Blob en producción, `/uploads/productos/...` en desarrollo),
 * lista para guardarse con `next/image` y en `Product.imageUrl`.
 */

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const auth = await authorize("products", "POST");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la subida de imagen:", error);
    return NextResponse.json({ error: "No fue posible verificar tu sesión. Inténtalo de nuevo." }, { status: 500 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envía un archivo de imagen." }, { status: 400 });
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Formato no soportado. Usa JPEG, PNG o WebP." }, { status: 415 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen supera el máximo permitido de 5 MB." }, { status: 413 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "El archivo está vacío." }, { status: 400 });
  }

  const safeName = `producto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  try {
    const stored = await storeUpload(file, "productos", safeName);
    return NextResponse.json({ url: stored.url });
  } catch (error) {
    console.error("Error al guardar la imagen del producto:", error);
    return NextResponse.json({ error: "No fue posible guardar la imagen en el servidor." }, { status: 500 });
  }
}
