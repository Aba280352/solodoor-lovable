/**
 * The reviews block: one list of reviews shared by every page (key "reviews"), and each page's own heading
 * (keys "home.reviews", "doors.reviews", "kitchen.reviews").
 */
import { reviews } from "../data";
import type { SectionDef } from "./sections";

export const REVIEWS_LIST: SectionDef = {
  key: "reviews",
  title: "הביקורות (בכל הדפים)",
  page: "/",
  fields: [
    {
      name: "items",
      label: "ביקורות",
      type: "list",
      max: 30,
      itemLabel: "ביקורת",
      hint: "מעתיקים מגוגל: שם, תאריך וטקסט. האות בעיגול והצבע נקבעים לבד.",
      fields: [
        { name: "name", label: "שם", type: "text", max: 60 },
        { name: "date", label: "תאריך", type: "text", max: 30 },
        { name: "text", label: "הביקורת", type: "textarea", max: 800 },
      ],
    },
  ],
};
export const REVIEWS_LIST_DEFAULTS = { items: reviews.map((r) => ({ ...r })) };

/** Avatar colours (Google's) for reviews added in the admin. */
export const REVIEW_COLORS = ["#C5221F", "#A142F4", "#1A73E8", "#188038", "#E37400", "#D01884", "#12B5CB"];

const heading = (key: string, page: string, pill: string): { def: SectionDef; defaults: { pill: string; title: string } } => ({
  def: {
    key,
    title: "כותרת הביקורות",
    page,
    fields: [
      { name: "pill", label: "תגית", type: "text" },
      { name: "title", label: "כותרת", type: "text" },
    ],
  },
  defaults: { pill, title: "מספרים עלינו" },
});

export const REVIEWS_HEADINGS = {
  "home.reviews": heading("home.reviews", "/", "אם עוד לא קניתם, בואו תראו מה רושמים עלינו!"),
  "doors.reviews": heading("doors.reviews", "/ציפוי-דלתות", "אם עד עכשיו לא התקשרתם, תראו מה רושמים עלינו החברים!"),
  "kitchen.reviews": heading("kitchen.reviews", "/ציפוי-מטבחים", "אם עד עכשיו לא התקשרתם, תראו מה רושמים עלינו החברים!"),
};
export type ReviewsKey = keyof typeof REVIEWS_HEADINGS;
