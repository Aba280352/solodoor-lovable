/**
 * What the visual editor can open: the pages, their sections in their original order, and for each section the
 * content it shows (one or more keys; some are shared between pages, e.g. the reviews list and the FAQ).
 */
import { DOORS_SECTIONS } from "../content/doors";
import { HOME_FAQ, HOME_FAQ_DEFAULTS, HOME_SECTIONS } from "../content/home";
import { KITCHEN_SECTIONS } from "../content/kitchen";
import { REVIEWS_HEADINGS, REVIEWS_LIST, REVIEWS_LIST_DEFAULTS, type ReviewsKey } from "../content/reviews";
import type { SectionDef } from "../content/sections";

export interface PanelPart {
  def: SectionDef;
  defaults: Record<string, unknown>;
  /** Said above the fields when the content is shared with other pages. */
  note?: string;
}

export const EDITOR_PAGES = [
  {
    path: "/",
    label: "דף הבית",
    order: ["home.hero", "home.categories", "home.styles", "home.diy", "home.about", "home.process", "home.beforeAfter", "home.bestSellers", "home.reviews", "home.faq", "home.articles"],
  },
  {
    path: "/ציפוי-דלתות",
    label: "ציפוי דלתות",
    order: ["doors.hero", "doors.quote", "doors.process", "doors.beforeAfter", "doors.reviews", "doors.shop", "doors.about", "doors.faq"],
  },
  {
    path: "/ציפוי-מטבחים",
    label: "ציפוי מטבחים",
    order: ["kitchen.hero", "kitchen.intro", "kitchen.values", "kitchen.catalog", "kitchen.reviews", "kitchen.beforeAfter"],
  },
];

const FAQ_NOTE = "השאלות האלה מופיעות גם בדף הבית וגם בדף הדלתות. שינוי כאן משנה בשניהם.";
const REVIEWS_NOTE = "רשימת הביקורות משותפת לכל הדפים. שינוי כאן משנה בכולם.";

const BY_KEY = new Map<string, PanelPart>([...HOME_SECTIONS, ...DOORS_SECTIONS, ...KITCHEN_SECTIONS].map((s) => [s.def.key, s]));

/** The parts of the panel for one section of a page, or null when the section has no fields yet. */
export function panelParts(section: string): PanelPart[] | null {
  if (section in REVIEWS_HEADINGS) {
    const heading = REVIEWS_HEADINGS[section as ReviewsKey];
    return [heading, { def: REVIEWS_LIST, defaults: REVIEWS_LIST_DEFAULTS, note: REVIEWS_NOTE }];
  }
  if (section === "home.faq" || section === "doors.faq") return [{ def: HOME_FAQ, defaults: HOME_FAQ_DEFAULTS, note: FAQ_NOTE }];
  const part = BY_KEY.get(section);
  return part ? [part] : null;
}

/** The part a field path belongs to (its first name is one of the part's fields). */
export const ownerOf = (parts: PanelPart[], field: string) => parts.find((p) => p.def.fields.some((f) => f.name === field.split(".")[0]));
