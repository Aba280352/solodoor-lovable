/**
 * Site search. A visitor types what they have in mind ("שחור", "דלת עץ", "אבן למקרר"), not a product name, so the words are
 * matched against the product name, its colours, its style, its type and the surfaces it suits, with Hebrew endings,
 * synonyms and one-letter typos tolerated. Pure functions, no data loading.
 */
import { STYLE_FAMILIES, variantColors, type Application, type ShopItem } from "./catalog";
import { COLOR_FAMILIES } from "./colors";

/** Word lists per concept. Several spellings of one idea all lead to the same results. */
const COLOR_WORDS: Record<string, string[]> = {
  white: ["לבן", "לבנה", "שלג", "פנינה"],
  cream: ["קרם", "שמנת", "בז", "בייג", "חול", "חאקי", "קרמי"],
  grey: ["אפור", "אפורה", "גרפיט", "פחם", "אנטרציט", "כסף", "כסוף"],
  black: ["שחור", "שחורה", "אפל", "שחורים", "שחורות"],
  brown: ["חום", "חומה", "קפה", "שוקולד", "אגוז", "ערמון", "קרמל"],
  blue: ["כחול", "כחולה", "תכלת", "נייבי"],
  green: ["ירוק", "ירוקה", "זית", "מרווה", "מנטה"],
  purple: ["סגול", "סגולה", "לילך", "בורדו"],
  multi: ["צבעוני", "צבעים", "מגוון", "צבעונית"],
};

const STYLE_WORDS: Record<string, string[]> = {
  plain: ["חלק", "נקי", "פשוט", "אחיד", "מט", "בלי דוגמה", "יחיד"],
  wood: ["עץ", "עצים", "אלון", "פרקט", "אגוז", "עציים", "דמוי עץ", "מראה עץ", "שנהב"],
  stone: ["אבן", "שיש", "בטון", "גרניט", "אבנים", "סלע", "דמוי אבן", "קוורץ", "טרצו"],
};

/** What a product type or a surface is called. The key is the product type or the application slug. */
const TYPE_WORDS: Record<string, string[]> = {
  designed_door: ["מעוצב", "מעוצבת", "מעוצבים", "דגם", "דלת מעוצבת", "הדפס", "עיצוב"],
  pvc_rug: ["שטיח", "שטיחים", "pvc", "מחצלת", "פי וי סי", "פיוויסי", "רצפה", "כניסה"],
  wallpaper: ["טפט", "טפטים", "ציפוי", "מדבקה", "סטיקר", "נדבק", "הדבקה עצמית"],
};

const APPLICATION_WORDS: Record<string, string[]> = {
  door: ["דלת", "דלתות", "כניסה", "פנים", "דלת כניסה"],
  fridge: ["מקרר", "מקררים", "קרר"],
  kitchen: ["מטבח", "מטבחים", "ארונות", "ארון מטבח", "חזית", "חזיתות"],
  countertop: ["שיש", "משטח", "משטחים", "פורמייקה", "דלפק", "מטבח"],
  wall: ["קיר", "קירות", "חדר", "סלון", "קיר מבטא"],
  "electric-cabinet": ["חשמל", "ארון חשמל", "ארונות חשמל", "לוח חשמל", "מונה"],
};

/** Words that carry no meaning of their own in a query. */
const STOP = new Set(["טפט", "טפטים", "של", "עם", "בלי", "את", "אני", "רוצה", "מחפש", "מחפשת", "ל", "ב", "ה", "מה", "איזה", "יש", "לי", "גם"]);

/** Lowercase, no quotes or punctuation, one space between words. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[֑-ׇ]/g, "")
    .replace(/["'`׳״]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A rough Hebrew stem: no leading ה/ו/ל/ב (the, and, to, in), no plural or feminine ending. "שחורים" and "שחורה" both become "שחור". */
export function stem(word: string): string {
  let w = word;
  if (w.length > 3 && /^[הולב]/.test(w)) w = w.slice(1);
  if (w.length > 4 && /(ים|ות)$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && /[הת]$/.test(w)) w = w.slice(0, -1);
  return w;
}

const tokens = (text: string) => normalize(text).split(" ").filter(Boolean);
const stems = (text: string) => tokens(text).map(stem);

/** True when two words differ by at most one letter (substitution, deletion or insertion). */
function nearlyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 4) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
}

/** How well one query word matches a list of words: 0 for none, 1 for a typo, 2 for a prefix, 3 for an exact stem. */
function wordScore(queryStem: string, words: string[]): number {
  let best = 0;
  for (const phrase of words) {
    for (const w of stems(phrase)) {
      if (w === queryStem) return 3;
      if (queryStem.length >= 2 && (w.startsWith(queryStem) || (w.length >= 3 && queryStem.startsWith(w)))) best = Math.max(best, 2);
      else if (nearlyEqual(w, queryStem)) best = Math.max(best, 1);
    }
  }
  return best;
}

export interface SearchHit {
  item: ShopItem;
  score: number;
  /** The colour families the query asked for, used to open the right photo of a designed door. */
  colors: string[];
  /** The surface the query named, used to open the right tab of a wallpaper. */
  application: string | null;
}

export interface SearchIntent {
  colors: string[];
  styles: string[];
  application: string | null;
  type: string | null;
}

/** The filters a query stands for, so the search can also offer "all results in the shop". */
export function intentOf(query: string, applications: Application[]): SearchIntent {
  const words = stems(query).filter((w) => !STOP.has(w));
  const pick = <T extends string>(table: Record<T, string[]>) =>
    (Object.keys(table) as T[]).filter((key) => words.some((w) => wordScore(w, table[key]) >= 2));
  const apps = pick(APPLICATION_WORDS).filter((slug) => applications.some((a) => a.slug === slug));
  const types = pick(TYPE_WORDS).filter((t) => t !== "wallpaper");
  return { colors: pick(COLOR_WORDS), styles: pick(STYLE_WORDS), application: apps[0] ?? null, type: types[0] ?? null };
}

/** Everything a product can be found by. */
function fieldsOf(item: ShopItem, applications: Application[]) {
  const colorKeys = new Set([...item.colors, ...item.variants.flatMap((v) => variantColors(v.color))]);
  const colorWords = [...colorKeys].flatMap((key) => [COLOR_FAMILIES.find((c) => c.key === key)?.label ?? "", ...(COLOR_WORDS[key] ?? [])]);
  const styleKey = STYLE_FAMILIES.find((f) => f.label === item.style_family)?.key;
  const styleWords = styleKey ? [item.style_family ?? "", ...(STYLE_WORDS[styleKey] ?? [])] : [item.style_family ?? ""];
  const typeWords = TYPE_WORDS[item.product_type] ?? [];
  const appWords =
    item.product_type === "wallpaper"
      ? applications.filter((a) => item.images[a.slug]).flatMap((a) => [a.label, ...(APPLICATION_WORDS[a.slug] ?? [])])
      : item.product_type === "designed_door"
        ? APPLICATION_WORDS.door
        : [];
  const variantTitles = item.variants.map((v) => v.title);
  return { title: [item.title, ...variantTitles], colorWords, styleWords, typeWords, appWords };
}

/**
 * Products that match the query, best first. Every meaningful word must match something (name 3 points, colour 3,
 * style 2, type 2, surface 1, each lowered for a prefix or a typo); when no product matches all the words, those that match
 * most of them are shown instead, so a long query still finds something.
 */
export function searchItems(items: ShopItem[], applications: Application[], query: string): SearchHit[] {
  const words = stems(query).filter((w) => !STOP.has(w) && w.length > 0);
  if (!words.length) return [];
  const intent = intentOf(query, applications);
  const hits: (SearchHit & { matched: number })[] = [];
  for (const item of items) {
    const f = fieldsOf(item, applications);
    let score = 0;
    let matched = 0;
    for (const w of words) {
      const best = Math.max(
        wordScore(w, f.title) * 3,
        wordScore(w, f.colorWords) * 3,
        wordScore(w, f.styleWords) * 2,
        wordScore(w, f.typeWords) * 2,
        wordScore(w, f.appWords),
      );
      if (best > 0) {
        matched++;
        score += best;
      }
    }
    if (matched) hits.push({ item, score, matched, colors: intent.colors, application: intent.application });
  }
  const all = hits.filter((h) => h.matched === words.length);
  const pool = all.length ? all : hits.filter((h) => h.matched === Math.max(...hits.map((x) => x.matched)));
  return pool.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "he"));
}
