/** The FAQ page's questions, read from the database and filtered by what the visitor wants to wallpaper. */
import { supabase } from "@/integrations/supabase/client";

export interface FaqEntry {
  id: number;
  question: string;
  answer: string;
  /** Application slugs, "designed_door" or "pvc_rug". */
  categories: string[];
  /** Slug of the article that explains it in full. */
  article_slug: string | null;
  sort_order: number;
}

export interface FaqCategory {
  key: string;
  label: string;
}

/** The filter chips, in the order the shop lists them. */
export const FAQ_CATEGORIES: FaqCategory[] = [
  { key: "door", label: "טפט לדלת" },
  { key: "kitchen", label: "טפט למטבח" },
  { key: "fridge", label: "טפט למקרר" },
  { key: "countertop", label: "טפט לשיש" },
  { key: "wall", label: "טפט לקיר" },
  { key: "electric-cabinet", label: "טפט לארון חשמל" },
  { key: "designed_door", label: "טפט מעוצב לדלת" },
  { key: "pvc_rug", label: "שטיחי PVC" },
];

export interface FaqSearch {
  cat?: string;
}

export async function fetchFaqEntries(): Promise<FaqEntry[]> {
  const { data, error } = await supabase.from("faq_items").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as FaqEntry[];
}

export const selectedCategories = (search: FaqSearch) =>
  (search.cat ?? "")
    .split(",")
    .filter((key) => FAQ_CATEGORIES.some((c) => c.key === key));

/** Questions that matter for at least one of the chosen categories; all of them when none is chosen. */
export const filterFaq = (entries: FaqEntry[], selected: string[]) =>
  selected.length ? entries.filter((e) => e.categories.some((c) => selected.includes(c))) : entries;

export const categoryLabel = (key: string) => FAQ_CATEGORIES.find((c) => c.key === key)?.label ?? key;
