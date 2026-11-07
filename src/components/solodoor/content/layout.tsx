/**
 * Page layout from the admin: the order of a page's sections and which are hidden on mobile or desktop
 * (key "layout:<path>"), each section's safe styling (key "style:<section>"), and the marks the visual editor
 * selects by.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useContentValue, useEditMode } from "./site-content";

export const layoutKey = (path: string) => `layout:${path}`;
export const styleKey = (section: string) => `style:${section}`;

export interface LayoutOverride {
  order?: string[];
  hide?: Record<string, { mobile?: boolean; desktop?: boolean }>;
}

/** A section's safe styling: a background from the brand palette and extra space above and below, per device. */
export interface SectionStyle {
  background?: "white" | "sand";
  spaceTop?: { desktop?: Space; mobile?: Space };
  spaceBottom?: { desktop?: Space; mobile?: Space };
}
export type Space = "s" | "m" | "l";

export const BACKGROUNDS: { value: SectionStyle["background"] | undefined; label: string }[] = [
  { value: undefined, label: "ללא (כמו היום)" },
  { value: "white", label: "לבן" },
  { value: "sand", label: "חול" },
];
export const SPACES: { value: Space | undefined; label: string }[] = [
  { value: undefined, label: "ללא" },
  { value: "s", label: "קטן" },
  { value: "m", label: "בינוני" },
  { value: "l", label: "גדול" },
];

// Full class names, so Tailwind keeps them.
const BG_CLASS = { white: "bg-card", sand: "bg-muted" } as const;
const SPACE_CLASS = {
  top: { desktop: { s: "lg:pt-6", m: "lg:pt-14", l: "lg:pt-24" }, mobile: { s: "max-lg:pt-4", m: "max-lg:pt-8", l: "max-lg:pt-14" } },
  bottom: { desktop: { s: "lg:pb-6", m: "lg:pb-14", l: "lg:pb-24" }, mobile: { s: "max-lg:pb-4", m: "max-lg:pb-8", l: "max-lg:pb-14" } },
} as const;

const isSpace = (v: unknown): v is Space => v === "s" || v === "m" || v === "l";

/** The classes of a section's style override (only known values; anything else is ignored). */
export function sectionStyleClasses(style: SectionStyle | undefined): string {
  if (!style || typeof style !== "object") return "";
  const out: string[] = [];
  if (style.background === "white" || style.background === "sand") out.push(BG_CLASS[style.background]);
  for (const [side, value] of [["top", style.spaceTop], ["bottom", style.spaceBottom]] as const) {
    for (const device of ["desktop", "mobile"] as const) {
      const v = value?.[device];
      if (isSpace(v)) out.push(SPACE_CLASS[side][device][v]);
    }
  }
  return out.join(" ");
}

/** The sections of a page in the admin's order (sections it does not know keep their place at the end). */
export function useLayout(path: string, defaults: string[]) {
  const o = useContentValue<LayoutOverride>(layoutKey(path));
  const known = new Set(defaults);
  const order = Array.isArray(o?.order) ? o.order.filter((k, i, a) => known.has(k) && a.indexOf(k) === i) : [];
  const full = [...order, ...defaults.filter((k) => !order.includes(k))];
  const hide = o?.hide && typeof o.hide === "object" ? o.hide : {};
  return { order: full, hide: (key: string) => ({ mobile: hide[key]?.mobile === true, desktop: hide[key]?.desktop === true }) };
}

/** Names of the editable parts, as the visual editor shows them. */
export const SECTION_LABELS: Record<string, string> = {
  promo: "פס מבצעים",
  nav: "תפריט עליון",
  footer: "פוטר",
  "home.hero": "באנר ראשי",
  "home.categories": "הקטגוריות שלנו",
  "home.styles": "בחרו את הסגנון",
  "home.diy": "עשה זאת בעצמך",
  "home.about": "אודות",
  "home.process": "איך זה עובד",
  "home.beforeAfter": "לפני ואחרי",
  "home.bestSellers": "הנמכרים ביותר",
  "home.reviews": "ביקורות",
  "home.faq": "שאלות נפוצות",
  "home.articles": "מדריכים ומאמרים",
  "doors.hero": "באנר ראשי",
  "doors.quote": "הצעת מחיר",
  "doors.process": "איך זה עובד",
  "doors.beforeAfter": "לפני ואחרי",
  "doors.reviews": "ביקורות",
  "doors.shop": "ציפויים לקנייה",
  "doors.about": "קצת עלינו",
  "doors.faq": "שאלות נפוצות",
  "kitchen.hero": "באנר ראשי",
  "kitchen.intro": "רוצים טפט חדש למטבח?",
  "kitchen.values": "מה תקבלו מאיתנו",
  "kitchen.catalog": "קטלוג",
  "kitchen.reviews": "ביקורות",
  "kitchen.beforeAfter": "לפני ואחרי",
};

/**
 * One section of a page. Hidden per device by the layout and styled by its style override; in the visual editor
 * hidden sections stay visible, faded, so they can be shown again, and the wrapper carries the marks the editor
 * selects by.
 */
export function EditableSection({ id, hide, children }: { id: string; hide?: { mobile: boolean; desktop: boolean }; children: ReactNode }) {
  const editing = useEditMode();
  const style = useContentValue<SectionStyle>(styleKey(id));
  const hidden = hide ?? { mobile: false, desktop: false };
  return (
    <div
      data-edit-section={id}
      data-edit-label={SECTION_LABELS[id] ?? id}
      className={cn(
        sectionStyleClasses(style),
        !editing && hidden.mobile && "max-lg:hidden",
        !editing && hidden.desktop && "lg:hidden",
        editing && (hidden.mobile || hidden.desktop) && "opacity-40",
      )}
    >
      {children}
    </div>
  );
}

/**
 * Marks a text of a section for the visual editor: a click selects the field, a double click edits it in place.
 * Outside the editor it renders the text alone (no extra element), so visitors get exactly the same page.
 */
export function EF({ f, inline = true, children }: { f: string; inline?: boolean; children: ReactNode }) {
  const editing = useEditMode();
  if (!editing) return <>{children}</>;
  return (
    <span data-edit-field={f} {...(inline ? { "data-edit-inline": "" } : {})}>
      {children}
    </span>
  );
}

/**
 * Marks for pictures and other elements that are not plain text. In the editor it returns the attributes the page
 * selects by (a click selects the picture, a double click opens its replacement); outside the editor it returns
 * nothing, so visitors get exactly the same markup.
 */
export function useEditMark() {
  const editing = useEditMode();
  return (f: string, kind: "image" | "field" = "image"): Record<string, string> =>
    !editing ? {} : kind === "image" ? { "data-edit-field": f, "data-edit-image": "", title: "לחיצה בוחרת, לחיצה כפולה מחליפה את התמונה" } : { "data-edit-field": f };
}
