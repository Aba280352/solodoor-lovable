/**
 * Where Solodoor installs doors, and how long it takes. Nowhere else: an order outside these areas cannot be installed.
 * The areas are described here for the terms; which locality is inside one is decided by `localities.json`
 * (every locality in Israel, built by scripts/build-localities.cjs).
 */
export interface InstallArea {
  name: string;
  /** The places as the terms print them. */
  places: string;
}

export const INSTALL_AREAS: InstallArea[] = [
  { name: "הגליל המערבי", places: "נהריה, עכו והסביבה" },
  { name: "אזור חיפה והקריות", places: "חיפה, הקריות, נשר וטירת כרמל" },
  { name: "מישור החוף הצפוני", places: "עתלית, זכרון יעקב, חדרה ואור עקיבא" },
  { name: "השרון", places: "נתניה, כפר סבא, רעננה, הרצליה והסביבה" },
  { name: "גוש דן והמרכז", places: "תל אביב, רמת גן, גבעתיים, פתח תקווה, בני ברק" },
  { name: "השפלה", places: "ראשון לציון, רחובות, נס ציונה, יבנה והסביבה" },
  { name: "אזור מודיעין", places: "מודיעין, מכבים־רעות, שוהם והסביבה" },
];

export const INSTALL_DAYS = 14;

export const INSTALL_CITY_BAD = "צוות סולודור לא מתקין באזור זה, אבל ניתן להזמין את הטפט ללא התקנה.";
export const INSTALL_CITY_EMPTY = "יש לבחור עיר או יישוב להתקנה מהרשימה, או להסיר את ההתקנה מההזמנה.";
export const INSTALL_CITY_UNKNOWN = "לא מצאנו את היישוב. התחילו להקליד ובחרו אותו מהרשימה.";

/** One locality: its name, and 1 when Solodoor installs there. */
export type LocalityRow = [name: string, inArea: 0 | 1];

/** Spelling that does not matter: quotes, hyphens, niqqud, extra spaces and the two common spellings of "קרית". */
export function placeKey(text: string): string {
  return text
    .replace(/[֑-ׇ]/g, "")
    .replace(/["'`׳״]/g, "")
    .replace(/[־\-–_.,()/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^| )קריית/g, "$1קרית")
    .replace(/זיכרון/g, "זכרון")
    .replace(/פתח תקוה/g, "פתח תקווה");
}

const withoutBrackets = (name: string) => name.replace(/\s*\(.*?\)\s*/g, " ");

/** Names people use that are not the official one. Keys and values are already `placeKey`s. */
const ALIASES: Record<string, string> = {
  "תל אביב": "תל אביב יפו",
  יפו: "תל אביב יפו",
  "ת א": "תל אביב יפו",
  תא: "תל אביב יפו",
  "פ ת": "פתח תקווה",
  ראשלצ: "ראשון לציון",
  "ראשל צ": "ראשון לציון",
  ראשון: "ראשון לציון",
  מודיעין: "מודיעין מכבים רעות",
  "מכבים רעות": "מודיעין מכבים רעות",
  "פרדס חנה": "פרדס חנה כרכור",
  כרכור: "פרדס חנה כרכור",
  בנימינה: "בנימינה גבעת עדה",
  "גבעת עדה": "בנימינה גבעת עדה",
  מעלות: "מעלות תרשיחא",
  תרשיחא: "מעלות תרשיחא",
  קדימה: "קדימה צורן",
  צורן: "קדימה צורן",
  "כוכב יאיר": "כוכב יאיר צור יגאל",
  "צור יגאל": "כוכב יאיר צור יגאל",
  יהוד: "יהוד מונוסון",
  מונוסון: "יהוד מונוסון",
};

const FLAGS = new WeakMap<LocalityRow[], Map<string, number>>();

/** Spelling key to 1 when installed there, built once per list. */
function flagsFor(rows: LocalityRow[]): Map<string, number> {
  let flags = FLAGS.get(rows);
  if (!flags) {
    flags = new Map();
    for (const [name, inArea] of rows) {
      for (const k of new Set([placeKey(name), placeKey(withoutBrackets(name))])) flags.set(k, (flags.get(k) ?? 0) | inArea);
    }
    FLAGS.set(rows, flags);
  }
  return flags;
}

export type InstallCityStatus = "loading" | "empty" | "ok" | "bad" | "unknown";

/** Whether the typed place is a known locality, and if so whether Solodoor installs there. */
export function checkInstallCity(rows: LocalityRow[] | null, text: string): InstallCityStatus {
  const key = placeKey(text);
  if (!key) return "empty";
  if (!rows) return "loading";
  const flags = flagsFor(rows);
  const flag = flags.get(key) ?? flags.get(ALIASES[key] ?? "");
  if (flag === undefined) return "unknown";
  return flag ? "ok" : "bad";
}

/** The localities to offer while typing: those starting with what was typed first, then those containing it. */
export function suggestLocalities(rows: LocalityRow[], text: string, limit = 8): string[] {
  const key = placeKey(text);
  if (!key) return [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const [name] of rows) {
    const full = placeKey(name);
    if (full.startsWith(key)) starts.push(name);
    else if (full.includes(` ${key}`) || full.includes(key)) contains.push(name);
  }
  return [...starts, ...contains].slice(0, limit);
}
