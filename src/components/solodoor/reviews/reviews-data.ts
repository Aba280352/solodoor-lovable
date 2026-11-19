import { BUSINESS_KEY, effectiveContent, type SiteContent } from "../content/site-content";
import { BUSINESS_DEFAULTS, cleanBusiness } from "../content/business";
import { mergeSection } from "../content/sections";
import { REVIEWS_LIST, REVIEWS_LIST_DEFAULTS } from "../content/reviews";

export type ReviewItem = { name: string; date: string; text: string; color?: string };

/** "28/05/2026" -> "2026-05-28" (schema.org wants ISO dates); undefined when the date is not in that shape. */
export function isoDate(date: string): string | undefined {
  const m = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/.exec(date.trim());
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : undefined;
}

/** The reviews in force (code defaults with the admin's published list), each one once. */
export function reviewItems(content: SiteContent | undefined): ReviewItem[] {
  const merged = mergeSection(REVIEWS_LIST, REVIEWS_LIST_DEFAULTS, effectiveContent(content)[REVIEWS_LIST.key]);
  const seen = new Set<string>();
  const out: ReviewItem[] = [];
  for (const r of merged.items as ReviewItem[]) {
    const key = `${r.name}|${r.date}|${r.text}`.trim();
    if (!r.name || !r.text || seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

/** The review count shown on the site ("מבוסס על N ביקורות"), from the admin's business details. */
export function reviewCount(content: SiteContent | undefined): number {
  return { ...BUSINESS_DEFAULTS, ...cleanBusiness(effectiveContent(content)[BUSINESS_KEY]) }.reviewCount;
}
