/**
 * Pictures uploaded from the admin go on the site light, so no page slows down (Google ranks slow pages lower):
 * shrunk in the browser and saved as WebP, with phone-size copies (-480w, -828w) uploaded next to them. The main
 * file's name then ends with "@r.webp", which tells the site (responsive.ts) that the copies exist. If anything
 * about the copies fails, the picture is uploaded on its own without that mark, so it is never shown broken.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

const db = supabase as unknown as SupabaseClient;
const MAX_BYTES = 8 * 1024 * 1024;

async function toWebp(file: File, maxWidth: number, maxSide: number): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
}

/** At most `maxSide` px on the long side, as WebP. Anything that cannot be converted is returned as it is. */
export async function lighten(file: File, maxSide = 2000): Promise<File> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    if (Math.max(bitmap.width, bitmap.height) <= maxSide && file.type === "image/webp" && file.size < 400_000) return file;
    const blob = await toWebp(file, Infinity, maxSide);
    if (!blob || (blob.size >= file.size && file.type === "image/webp")) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

const cleanName = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "image";

/**
 * Uploads a picture to a public bucket and returns its public URL. With `responsive`, the picture is shrunk to
 * 1600px and uploaded with its phone-size copies (see above).
 */
export async function uploadPicture(bucket: string, folder: string, file: File, { responsive = false } = {}): Promise<string> {
  const stamp = Date.now();
  const put = async (path: string, body: Blob, type: string) => {
    const { error } = await db.storage.from(bucket).upload(path, body, { upsert: false, cacheControl: "31536000", contentType: type });
    if (error) throw new Error(error.message);
  };
  const url = (path: string) => db.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  const main = responsive ? await lighten(file, 1600) : file;
  if (main.size > MAX_BYTES) throw new Error("התמונה גדולה מ-8MB גם אחרי הקטנה. כדאי להקטין אותה קודם.");

  if (responsive && main.type === "image/webp") {
    const base = `${folder}/${stamp}-${cleanName(file.name)}@r`;
    try {
      const copies = await Promise.all([480, 828].map((w) => toWebp(main, w, Infinity)));
      if (copies.every(Boolean)) {
        await put(`${base}-480w.webp`, copies[0]!, "image/webp");
        await put(`${base}-828w.webp`, copies[1]!, "image/webp");
        await put(`${base}.webp`, main, "image/webp");
        return url(`${base}.webp`);
      }
    } catch {
      // The copies did not make it: upload the picture on its own below.
    }
  }

  const ext = main.type === "image/webp" ? "webp" : (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "jpg").toLowerCase();
  const path = `${folder}/${stamp}-${cleanName(file.name)}.${ext}`;
  await put(path, main, main.type || "application/octet-stream");
  return url(path);
}
