/**
 * The headings of the archive pages: the shop, the wallpaper style hub and each style page, the FAQ page and the
 * articles archive. The defaults are exactly the texts the pages show today.
 *
 * SEO: filtered views of the shop and the FAQ (?cat=…) keep their own computed headings, because each of them is
 * a separate page in Google with its own title. These headings apply to the main view only.
 */
import { STYLE_HUB, STYLE_PAGES } from "../shop/styles";
import type { FieldDef, SectionDef } from "./sections";

const T = (name: string, label: string): FieldDef => ({ name, label, type: "text" });
const A = (name: string, label: string): FieldDef => ({ name, label, type: "textarea" });
const H1 = (hint: string): FieldDef => ({ name: "title", label: "כותרת ראשית (H1)", type: "text", hint });
const H1_HINT = "הכותרת שגוגל קורא ראשונה בדף. את הכותרת שמופיעה בתוצאות החיפוש משנים בלשונית 'קידום בגוגל'.";

type Part = { def: SectionDef; defaults: Record<string, string> };

const header = (key: string, title: string, page: string, defaults: { pill: string; title: string; intro: string }): Part => ({
  def: { key, title, page, fields: [T("pill", "תגית"), H1(H1_HINT), A("intro", "פסקת פתיחה")] },
  defaults,
});

export const SHOP_HEADER = header("shop.header", "כותרת החנות", "/חנות", {
  pill: "החנות",
  title: "החנות של סולודור",
  intro: "טפטים בהדבקה עצמית, טפטים מעוצבים לדלת ושטיחי PVC. בוחרים עיצוב, מזמינים באתר ומקבלים עד הבית.",
});

export const STYLES_HEADER = header("styles.header", "כותרת 'טפט לפי סגנון'", "/טפט-לפי-סגנון", {
  pill: "טפט לפי סגנון",
  title: STYLE_HUB.title,
  intro: STYLE_HUB.intro,
});

/** One heading per style page, keyed by the page's address part (which never changes). */
export const styleHeaderKey = (slug: string) => `style.${slug}.header`;
export const STYLE_HEADERS: Part[] = STYLE_PAGES.map((p) =>
  header(styleHeaderKey(p.slug), `כותרת: ${p.name}`, `/טפט-לפי-סגנון/${p.slug}`, { pill: "טפט לפי סגנון", title: p.title, intro: p.intro }),
);

export const FAQ_PAGE: Part = {
  def: {
    key: "faq.page",
    title: "דף השאלות הנפוצות",
    page: "/שאלות-נפוצות",
    fields: [
      T("pill", "תגית"),
      H1(H1_HINT),
      A("intro", "פסקת פתיחה"),
      T("filterLabel", "השורה לפני הסינון"),
      T("ctaTitle", "כותרת התיבה למטה"),
      A("ctaText", "טקסט התיבה למטה"),
      T("whatsappLabel", "כפתור וואטסאפ"),
    ],
  },
  defaults: {
    pill: "שאלות ותשובות",
    title: "שאלות נפוצות",
    intro: "תשובות לשאלות שחוזרות הכי הרבה על טפט לדלת, למטבח, למקרר, לשיש, לקיר ולארון חשמל: מדידה, התקנה עצמית, תחזוקה, משלוח והחזרות. בחרו מה אתם רוצים לחדש, ותראו רק את מה שרלוונטי אליכם.",
    filterLabel: "מה מעניין אתכם?",
    ctaTitle: "לא מצאתם את התשובה?",
    ctaText: "שלחו לנו הודעה או תמונה בווצאפ, ונחזור אליכם עם תשובה אישית ועם המלצה למשטח שלכם.",
    whatsappLabel: "לשיחה בווצאפ",
  },
};

export const ARTICLES_HEADER = header("articles.header", "כותרת המאמרים", "/מאמרים", {
  pill: "הבלוג",
  title: "מדריכים ומאמרים",
  intro: "כל מה שכדאי לדעת לפני שמחדשים דלת, מטבח, מקרר או ארון: מדריכים, השוואות ותשובות מהניסיון שלנו בשטח.",
});

/** In the admin's order. */
export const ARCHIVE_SECTIONS: Part[] = [SHOP_HEADER, STYLES_HEADER, ...STYLE_HEADERS, FAQ_PAGE, ARTICLES_HEADER];
