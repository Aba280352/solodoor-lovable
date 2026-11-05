/**
 * Overrides for the menus (header, mobile menu, mega menus, footer links), the promo strip and the footer.
 * Menu items keep their original label as their key: the link target is decided by that key, so renaming an item
 * in the admin changes only the text shown and can never break where it leads.
 */
import type { IconName } from "../icon-data";
import { useContentValue } from "./site-content";

export const NAV_KEY = "nav";
export const PROMO_KEY = "promo";
export const FOOTER_KEY = "footer";

export interface NavOverride {
  /** Original label -> text to show. */
  labels?: Record<string, string>;
  /** Original labels to hide everywhere they appear (header, mobile menu, mega menus, footer). */
  hidden?: string[];
  /** Mega-menu item (original name) -> image URL. */
  images?: Record<string, string>;
}

export interface PromoOverride {
  items?: { icon?: string; label?: string }[];
}

export interface FooterOverride {
  bannerImage?: string;
  /** The three Hebrew lines over the banner photo. */
  bannerLines?: string[];
  /** The two English lines under them. */
  bannerEnglish?: string[];
  /** The line under the footer logo. */
  tagline?: string;
  formTitle?: string;
  formSubtitle?: string;
  copyright?: string;
}

/** The icons the promo strip may use. */
export const PROMO_ICONS: { name: IconName; label: string }[] = [
  { name: "Truck", label: "משאית" },
  { name: "Palette", label: "פלטה" },
  { name: "ChatDots", label: "צ'אט" },
  { name: "Brush", label: "מברשת" },
  { name: "Phone", label: "טלפון" },
  { name: "CheckCircle", label: "וי" },
  { name: "Clock", label: "שעון" },
  { name: "MapPin", label: "מיקום" },
];

/** An https URL, or undefined. */
export const safeUrl = (v: unknown): string | undefined =>
  typeof v === "string" && /^https:\/\/[^\s"'<>]+$/.test(v.trim()) ? v.trim() : undefined;

/** A trimmed, length-limited string, or undefined when empty. */
export const text = (v: unknown, max = 200): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

/** The menu overrides in force: the text to show for a label, whether it is shown, and a menu image. */
export function useNav() {
  const o = useContentValue<NavOverride>(NAV_KEY);
  const labels = o?.labels ?? {};
  const hidden = new Set(Array.isArray(o?.hidden) ? o.hidden : []);
  const images = o?.images ?? {};
  return {
    label: (key: string) => text(labels[key], 60) ?? key,
    shown: (key: string) => !hidden.has(key),
    img: (key: string, fallback: string) => safeUrl(images[key]) ?? fallback,
  };
}

/** The promo strip items in force (the code's list when there is no valid override). */
export function usePromoItems<T extends { icon: IconName; label: string }>(defaults: T[]): { icon: IconName; label: string }[] {
  const o = useContentValue<PromoOverride>(PROMO_KEY);
  const icons = new Set(PROMO_ICONS.map((i) => i.name));
  const items = (Array.isArray(o?.items) ? o.items : [])
    .map((i) => ({ icon: (icons.has(i.icon as IconName) ? i.icon : "CheckCircle") as IconName, label: text(i.label, 80) }))
    .filter((i): i is { icon: IconName; label: string } => Boolean(i.label))
    .slice(0, 8);
  return items.length ? items : defaults;
}

/** The footer texts in force; each field falls back to the code's text. */
export function useFooterContent() {
  const o = useContentValue<FooterOverride>(FOOTER_KEY) ?? {};
  const lines = (v: unknown, n: number) => (Array.isArray(v) ? v.slice(0, n).map((s) => text(s, 80)) : []);
  return {
    bannerImage: safeUrl(o.bannerImage),
    bannerLines: lines(o.bannerLines, 3),
    bannerEnglish: lines(o.bannerEnglish, 2),
    tagline: text(o.tagline, 120),
    formTitle: text(o.formTitle, 60),
    formSubtitle: text(o.formSubtitle, 120),
    copyright: text(o.copyright, 120),
  };
}
