/**
 * Almacenamiento de subidas (imágenes de producto, video del Tour).
 *
 * - En producción (Vercel) usa **Vercel Blob**: `put()` con acceso público.
 *   El token `BLOB_READ_WRITE_TOKEN` lo inyecta Vercel automáticamente
 *   cuando el Blob Store está conectado al proyecto.
 * - En desarrollo local sin token, guarda en el disco (`public/uploads/…`)
 *   para que el flujo funcione sin configuración.
 *
 * Devuelve siempre una URL pública lista para `next/image` y para guardarse
 * en la base de datos (`Product.imageUrl`, `TourVideo.videoUrl`).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

export interface StoredUpload {
  url: string;
  /** "blob" en producción · "local" en desarrollo sin token. */
  backend: "blob" | "local";
}

function hasBlobToken(): boolean {
  return Boolean((process.env.BLOB_READ_WRITE_TOKEN ?? "").trim());
}

/**
 * Guarda un archivo subido y devuelve su URL pública.
 *
 * @param file Archivo recibido por el route handler (ya validado).
 * @param folder Carpeta lógica dentro del store (`productos`, `tour`).
 * @param filename Nombre seguro ya generado por el handler.
 */
export async function storeUpload(file: File, folder: string, filename: string): Promise<StoredUpload> {
  if (hasBlobToken()) {
    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
      contentType: file.type || undefined,
    });
    return { url: blob.url, backend: "blob" };
  }

  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${folder}/${filename}`, backend: "local" };
}
