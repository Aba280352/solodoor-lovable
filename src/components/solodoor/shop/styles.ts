/** The wallpaper style pages: one hub with every style, and one archive per style. */
import { styleMenu } from "../data";
import { COLOR_FAMILIES } from "./colors";
import type { StyleItem } from "./catalog";

export const STYLE_HUB_PATH = "/טפט-לפי-סגנון" as const;

export interface StylePage {
  /** Last part of the URL, e.g. /טפט-לפי-סגנון/עצים. */
  slug: string;
  /** The name used in the menus and on the filter row. */
  name: string;
  title: string;
  intro: string;
  /** What the archive holds: a style family from the database, or a hand picked list. */
  family: string | null;
}

export const STYLE_PAGES: StylePage[] = [
  {
    slug: "עצים",
    name: "עצים",
    title: "טפטים דמויי עץ",
    intro: "טפטים בהדבקה עצמית במראה עץ: אלון, אגוז, מהגוני ועוד. מראה חם ומדויק שמתאים לדלתות, למטבחים ולארונות.",
    family: "מראה עץ",
  },
  {
    slug: "מומלצים",
    name: "מומלצים",
    title: "הטפטים המומלצים שלנו",
    intro: "מבחר הטפטים שהלקוחות שלנו בוחרים הכי הרבה: גוונים קלאסיים ועיצובים שמתאימים כמעט לכל בית.",
    family: null,
  },
  {
    slug: "חלקים",
    name: "חלקים",
    title: "טפטים חלקים ונקיים",
    intro: "טפטים בצבע אחיד, ממט ועד מבריק, למראה מינימליסטי וקל לשילוב עם כל עיצוב.",
    family: "חלק ונקי",
  },
  {
    slug: "אבן-ובטון",
    name: "דמויי אבן ובטון",
    title: "טפטים דמויי אבן ובטון",
    intro: "טפטים במראה אבן, שיש, בטון וטיח, עם מרקם ועומק שנראים כמו חומר אמיתי.",
    family: "אבן / שיש / בטון",
  },
];

export const STYLE_HUB = {
  title: "טפט לפי סגנון",
  intro:
    "כל סגנונות הטפטים של סולודור במקום אחד: עץ, חלקים ונקיים, ודמויי אבן ובטון. מעבירים עכבר על טפט ורואים איך הגליל נראה.",
};

/** The picks of the "מומלצים" archive, in the order they are shown. Change this list to change the archive. */
export const RECOMMENDED_HANDLES = [
  "matte-black",
  "matte-white",
  "oak-wood",
  "walnut-wood",
  "grey",
  "dark-grey",
  "concrete",
  "veined-marble",
  "warm-light-stone",
  "black-wood",
  "cloudy-grey-plaster",
  "nescafe",
];

export const stylePage = (slug: string) => STYLE_PAGES.find((p) => p.slug === slug);

/** The wallpapers of one style archive. */
export function itemsForStyle(items: StyleItem[], page: StylePage): StyleItem[] {
  if (page.family) return items.filter((i) => i.style_family === page.family);
  return RECOMMENDED_HANDLES.map((handle) => items.find((i) => i.handle === handle)).filter((i): i is StyleItem => Boolean(i));
}

/** Menu image of a style page. */
export const styleImage = (page: StylePage) => styleMenu.find((m) => m.name === page.name)?.img ?? null;

/** Colours present in a list of wallpapers, with how many wallpapers have each. */
export function colorOptionsFor(items: StyleItem[]) {
  return COLOR_FAMILIES.map((family) => ({
    family,
    count: items.filter((i) => i.colors.includes(family.key)).length,
  })).filter((o) => o.count > 0);
}

/** Style page link target for a menu name, or null when the name is not a style. */
export const stylePageForName = (name: string) => STYLE_PAGES.find((p) => p.name === name) ?? null;
