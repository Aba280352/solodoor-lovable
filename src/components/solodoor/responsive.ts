/**
 * Phone-size copies of the site's pictures. For a picture that has copies (see image-variants.ts), `srcSetFor`
 * lists them so the browser downloads the smallest one that is still sharp at the size it is shown; the picture
 * itself is the same. Pictures without copies (uploads from the admin, products) are left as they are.
 */
import { IMAGE_WIDTHS } from "./image-variants";

export function srcSetFor(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const width = IMAGE_WIDTHS[src];
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
