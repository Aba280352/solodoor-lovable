/**
 * Phone-size copies of the site's pictures. For a picture that has copies, `srcSetFor` lists them so the browser
 * downloads the smallest one that is still sharp at the size it is shown; the picture itself is the same.
 *
 * Which pictures have copies (<name>-480w.webp and <name>-828w.webp next to the original):
 *  - the site's own pictures in /images and /articles listed in image-variants.ts;
 *  - every .webp product picture in /catalog-images (copies made for all of them by scripts-make-variants.cjs);
 *  - pictures uploaded from the admin whose name ends with "@r.webp" (the admin uploads the copies with them).
 * Anything else (older uploads, .jpg/.png) is left as it is.
 */
import { IMAGE_WIDTHS } from "./image-variants";

/** The width the srcset states for a catalogue or uploaded original (they are at most this wide). */
const LARGE = 1600;
const CATALOG = /^\/catalog-images\/.+\.webp$/;
const UPLOADED = /^https:\/\/[^\s]+@r\.webp$/;

export function srcSetFor(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const width = IMAGE_WIDTHS[src] ?? (CATALOG.test(src) && !/-\d+w\.webp$/.test(src) ? LARGE : UPLOADED.test(src) ? LARGE : 0);
  if (!width) return undefined;
  const base = src.replace(/\.webp$/, "");
  return `${base}-480w.webp 480w, ${base}-828w.webp 828w, ${src} ${width}w`;
}

/** `src`, plus `srcSet` and `sizes` when the picture has copies. `sizes` says how wide it is shown. */
export function responsive(src: string | undefined, sizes: string): { src?: string; srcSet?: string; sizes?: string } {
  const srcSet = srcSetFor(src);
  return srcSet ? { src, srcSet, sizes } : { src };
}

/** Common display widths. */
export const SIZES = {
  full: "100vw",
  half: "(min-width: 1024px) 50vw, 100vw",
  third: "(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw",
} as const;
