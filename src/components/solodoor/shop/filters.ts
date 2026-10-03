/** The shop's filter model: what is in the URL, and how it narrows the product list. */
import { STYLE_FAMILIES, type Application, type ShopData, type ShopItem } from "./catalog";
import { COLOR_FAMILIES } from "./colors";

/** Search params of /חנות. Lists are comma separated in the URL (?cat=door,kitchen). */
export interface ShopSearch {
  cat?: string;
  style?: string;
  color?: string;
  /** "y" when the visitor narrows the whole shop by ticking categories, as opposed to opening one archive. */
  all?: string;
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

export interface ActiveFilters {
  cats: string[];
  types: string[];
  uses: string[];
  styles: string[];
  colors: string[];
  /** One category opened from a menu or a link: its page offers only filters that make sense inside it. */
  archive: boolean;
  /** Only a style (and maybe colours) is chosen, no category: the shop then shows plain wallpaper swatches. */
  styleOnly: boolean;
  /** False when only designed doors or rugs are selected: surfaces and styles then do not apply. */
  wallpapersInScope: boolean;
}

export function activeFilters(search: ShopSearch, data: ShopData): ActiveFilters {
  const valid = categoriesFor(data.applications);
  const cats = splitList(search.cat).filter((c) => valid.some((v) => v.key === c));
  const types = cats.filter((c) => valid.find((v) => v.key === c)?.kind === "type");
  const uses = cats.filter((c) => valid.find((v) => v.key === c)?.kind === "use");
  const styles = splitList(search.style).filter((s) => STYLE_FAMILIES.some((f) => f.key === s));
  const colors = splitList(search.color).filter((c) => COLOR_FAMILIES.some((f) => f.key === c));
  return {
    cats,
    types,
    uses,
    styles,
    colors,
    archive: cats.length === 1 && search.all !== "y",
    styleOnly: cats.length === 0 && styles.length > 0,
    wallpapersInScope: cats.length === 0 || uses.length > 0,
  };
}

export function filterItems(data: ShopData, filters: ActiveFilters): ShopItem[] {
  const { cats, types, uses, styles, colors } = filters;
  const styleLabels: (string | undefined)[] = styles.map((s) => STYLE_FAMILIES.find((f) => f.key === s)?.label);
  return data.items.filter((item) => {
    if (cats.length) {
      const inType = types.includes(item.product_type);
      const inUse = item.product_type === "wallpaper" && uses.some((u) => item.images[u]);
      if (!inType && !inUse) return false;
    }
    if (styles.length && (item.product_type !== "wallpaper" || !styleLabels.includes(item.style_family ?? undefined))) return false;
    if (colors.length && !colors.some((c) => item.colors.includes(c))) return false;
    return true;
  });
}

export interface ColorOption {
  key: string;
  /** Products of the current category that have this colour, with the other filters applied. */
  count: number;
}

/**
 * The colours offered in the sidebar: only those that exist in the current category
 * (the whole shop, or the archive the visitor is in), each with how many products it would show.
 */
export function colorOptions(data: ShopData, filters: ActiveFilters): ColorOption[] {
  const inCategory = filterItems(data, { ...filters, styles: [], colors: [] });
  const narrowed = filterItems(data, { ...filters, colors: [] });
  return COLOR_FAMILIES.filter((family) => inCategory.some((item) => item.colors.includes(family.key))).map((family) => ({
    key: family.key,
    count: narrowed.filter((item) => item.colors.includes(family.key)).length,
  }));
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
