import type { ShopSearch } from "./ShopArchive";

/** Shop filter for a menu or category name used around the site, e.g. "טפטים למקרר" → { use: "fridge" }. */
export function shopSearchFor(name: string): ShopSearch {
  if (name.includes("PVC") || name.includes("שטיח")) return { type: "pvc_rug" };
  if (name.includes("מעוצב")) return { type: "designed_door" };
  if (name.includes("חשמל")) return { use: "electric-cabinet" };
  if (name.includes("מקרר")) return { use: "fridge" };
  if (name.includes("קיר")) return { use: "wall" };
  if (name.includes("שיש")) return { use: "countertop" };
  if (name.includes("מטבח")) return { use: "kitchen" };
  if (name.includes("דלת")) return { use: "door" };
  if (name.includes("עצים") || name.includes("עץ")) return { style: "wood" };
  if (name.includes("חלק")) return { style: "plain" };
  if (name.includes("אבן") || name.includes("בטון")) return { style: "stone" };
  return {};
}
