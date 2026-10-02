import type { ShopSearch } from "./filters";

/** Shop filter for a menu or category name used around the site, e.g. "טפטים למקרר" → { cat: "fridge" }. */
export function shopSearchFor(name: string): ShopSearch {
  if (name.includes("PVC") || name.includes("שטיח")) return { cat: "pvc_rug" };
  if (name.includes("מעוצב")) return { cat: "designed_door" };
  if (name.includes("חשמל")) return { cat: "electric-cabinet" };
  if (name.includes("מקרר")) return { cat: "fridge" };
  if (name.includes("קיר")) return { cat: "wall" };
  if (name.includes("שיש")) return { cat: "countertop" };
  if (name.includes("מטבח")) return { cat: "kitchen" };
  if (name.includes("דלת")) return { cat: "door" };
  if (name.includes("עצים") || name.includes("עץ")) return { style: "wood" };
  if (name.includes("חלק")) return { style: "plain" };
  if (name.includes("אבן") || name.includes("בטון")) return { style: "stone" };
  return {};
}
