/** The shop's filter model: what is in the URL, and how it narrows the product list. */
import { STYLE_FAMILIES, type Application, type ShopData, type ShopItem } from "./catalog";

/** Search params of /חנות. Lists are comma separated in the URL (?cat=door,kitchen). */
export interface ShopSearch {
  cat?: string;
  style?: string;
  min?: number;
  max?: number;
}

/** A category tick-box: either a product type, or a surface a wallpaper is used on. */
export interface Category {
  key: string;
  label: string;
  kind: "type" | "use";
}

export const FIXED_CATEGORIES: Category[] = [
  { key: "designed_door", label: "טפטים מעוצבים לדלת", kind: "type" },
  { key: "pvc_rug", label: "שטיחי PVC", kind: "type" },
];

export const PRICE_STEP = 10;

export const splitList = (value: string | undefined) => (value ? value.split(",").filter(Boolean) : []);
export const joinList = (values: string[]) => (values.length ? values.join(",") : undefined);

/** Categories in the order they are shown: the two fixed types, then one per surface. */
export function categoriesFor(applications: Application[]): Category[] {
  return [
    ...FIXED_CATEGORIES,
    ...applications.map((a) => ({
      key: a.slug,
      label: a.slug === "door" ? "טפטים עמידים לדלת" : a.label,
      kind: "use" as const,
    })),
  ];
}

/** The price a card shows, used for the price filter. */
export function itemPrice(item: ShopItem, data: ShopData, uses: string[]): number {
  if (item.product_type === "pvc_rug") return data.rugFromPrice ?? item.base_price;
  if (item.product_type === "designed_door") return item.base_price;
  // With no surface chosen the card shows the per-metre price.
  const use = uses.find((u) => item.images[u]);
  return use ? (data.applications.find((a) => a.slug === use)?.unit_price ?? item.base_price) : item.base_price;
}

export function priceBounds(data: ShopData) {
  const prices = data.items.map((item) => itemPrice(item, data, []));
  const floor = (n: number) => Math.floor(n / PRICE_STEP) * PRICE_STEP;
  const ceil = (n: number) => Math.ceil(n / PRICE_STEP) * PRICE_STEP;
  return { min: floor(Math.min(...prices)), max: ceil(Math.max(...prices)) };
}

export interface ActiveFilters {
  cats: string[];
  types: string[];
  uses: string[];
  styles: string[];
  min: number | undefined;
  max: number | undefined;
  /** False when only designed doors or rugs are selected: surfaces and styles then do not apply. */
  wallpapersInScope: boolean;
}

export function activeFilters(search: ShopSearch, data: ShopData): ActiveFilters {
  const valid = categoriesFor(data.applications);
  const cats = splitList(search.cat).filter((c) => valid.some((v) => v.key === c));
  const types = cats.filter((c) => valid.find((v) => v.key === c)?.kind === "type");
  const uses = cats.filter((c) => valid.find((v) => v.key === c)?.kind === "use");
  const styles = splitList(search.style).filter((s) => STYLE_FAMILIES.some((f) => f.key === s));
  return {
    cats,
    types,
    uses,
    styles,
    min: search.min,
    max: search.max,
    wallpapersInScope: cats.length === 0 || uses.length > 0,
  };
}

export function filterItems(data: ShopData, filters: ActiveFilters): ShopItem[] {
  const { cats, types, uses, styles, min, max } = filters;
  const styleLabels: (string | undefined)[] = styles.map((s) => STYLE_FAMILIES.find((f) => f.key === s)?.label);
  return data.items.filter((item) => {
    if (cats.length) {
      const inType = types.includes(item.product_type);
      const inUse = item.product_type === "wallpaper" && uses.some((u) => item.images[u]);
      if (!inType && !inUse) return false;
    }
    if (styles.length && (item.product_type !== "wallpaper" || !styleLabels.includes(item.style_family ?? undefined))) return false;
    const price = itemPrice(item, data, uses);
    if (min !== undefined && price < min) return false;
    if (max !== undefined && price > max) return false;
    return true;
  });
}

/** Heading and intro for the current filter. Also used for the page title and description. */
export function shopHeading(filters: ActiveFilters, data: ShopData) {
  const { cats, uses, types, styles } = filters;
  const style = styles.length === 1 ? STYLE_FAMILIES.find((s) => s.key === styles[0]) : undefined;
  const suffix = style ? `, ${style.label}` : "";
  if (cats.length === 1 && uses.length === 1) {
    const application = data.applications.find((a) => a.slug === uses[0]);
    return {
      title: `טפטים ל${application?.label ?? ""}${suffix}`,
      intro: application?.short_description ?? "",
    };
  }
  if (cats.length === 1 && types[0] === "designed_door") {
    return {
      title: "טפטים מעוצבים לדלת",
      intro: "טפטים מודפסים לדלת עם דוגמאות, מסגרות ופסים ואפקט עומק תלת ממדי. המחיר לצד אחד של דלת.",
    };
  }
  if (cats.length === 1 && types[0] === "pvc_rug") {
    return {
      title: "שטיחי PVC מעוצבים",
      intro: "שטיחים דקים ועמידים שאינם סופגים נוזלים וקלים לניקוי, למטבח, לכניסה ולחדרי ילדים.",
    };
  }
  if (!cats.length && style) {
    return {
      title: `טפטים${suffix}`,
      intro: "טפטים בהדבקה עצמית לדלתות, למטבחים, למקררים, לשיש, לקירות ולארונות חשמל.",
    };
  }
  return {
    title: "החנות של סולודור",
    intro: "טפטים בהדבקה עצמית, טפטים מעוצבים לדלת ושטיחי PVC. בוחרים עיצוב, מזמינים באתר ומקבלים עד הבית.",
  };
}
