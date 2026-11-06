/**
 * The home page sections: what can be edited in each, and the content they show when nothing was edited
 * (exactly the site's original texts and images).
 */
import {
  DIY_BG,
  DIY_VIDEO,
  KITCHEN_DOOR_VIDEO,
  aboutGallery,
  aboutStats,
  aboutSurfaces,
  beforeAfterFigures,
  beforeAfterPairs,
  categories,
  diySteps,
  diyTools,
  faqImages,
  faqItems,
  heroSlides,
  heroTrust,
  processSteps,
  styleFamilies,
} from "../data";
import type { SectionDef } from "./sections";

const T = (name: string, label: string, max?: number) => ({ name, label, type: "text" as const, max });
const A = (name: string, label: string, max?: number) => ({ name, label, type: "textarea" as const, max });
const I = (name: string, label: string) => ({ name, label, type: "image" as const });

export const HOME_HERO: SectionDef = {
  key: "home.hero",
  title: "באנר ראשי",
  page: "/",
  fields: [
    {
      name: "slides",
      label: "שקפים מתחלפים",
      type: "list",
      keyField: "tag",
      itemLabel: "שקף",
      hint: "כל שקף מוביל לקטגוריה שלו בחנות. אפשר לשנות טקסטים ותמונה, להסתיר ולשנות סדר.",
      fields: [T("tag", "תגית"), T("l1", "שורה ראשונה"), T("l2", "שורה שנייה"), T("cta", "כפתור"), I("img", "תמונה")],
    },
    T("quizPrompt", "שאלה מעל הכפתורים"),
    T("quizLink", "קישור לשאלון"),
    T("whatsappLabel", "כפתור וואטסאפ"),
    {
      name: "trust",
      label: "שלוש ההבטחות מתחת לכפתורים",
      type: "list",
      max: 4,
      itemLabel: "הבטחה",
      fields: [{ name: "icon", label: "אייקון", type: "icon" }, T("label", "טקסט")],
    },
    T("barEnglish", "שורה באנגלית בפס התחתון"),
    T("barHebrew", "שורה בעברית בפס התחתון"),
  ],
};
export const HOME_HERO_DEFAULTS = {
  slides: heroSlides.map((s) => ({ ...s })),
  quizPrompt: "לא בטוח מה לבחור?",
  quizLink: "לשאלון הכוונה",
  whatsappLabel: "להתייעצות בווצאפ",
  trust: heroTrust.map((t) => ({ ...t })),
  barEnglish: "MORE THAN A DOOR",
  barHebrew: "ציפוי חדש. התחלה יפה יותר.",
};

export const HOME_CATEGORIES: SectionDef = {
  key: "home.categories",
  title: "הקטגוריות שלנו",
  page: "/",
  fields: [
    T("title", "כותרת"),
    T("subtitle", "שורת משנה"),
    {
      name: "items",
      label: "קטגוריות",
      type: "list",
      keyField: "name",
      itemLabel: "קטגוריה",
      hint: "כל כרטיס מוביל לקטגוריה שלו בחנות. 'תמונה בריחוף' מתחלפת כשמעבירים עכבר.",
      fields: [T("name", "שם"), I("img", "תמונה"), I("variant", "תמונה בריחוף")],
    },
  ],
};
export const HOME_CATEGORIES_DEFAULTS = {
  title: "הקטגוריות שלנו",
  subtitle: "פתרונות עיצוב מדביקים לכל חלל בבית",
  items: categories.map((c) => ({ ...c })),
};

export const HOME_STYLES: SectionDef = {
  key: "home.styles",
  title: "בחרו את הסגנון",
  page: "/",
  fields: [
    T("title", "כותרת"),
    A("subtitle", "פסקה"),
    {
      name: "families",
      label: "סגנונות",
      type: "list",
      keyField: "name",
      itemLabel: "סגנון",
      hint: "כל סגנון מוביל לדף הסגנון שלו. ארבע הדוגמיות מתחלפות בתמונה בריחוף.",
      fields: [T("name", "שם"), T("desc", "תיאור"), { name: "swatches", label: "דוגמיות (הראשונה היא התמונה הראשית)", type: "images", count: 4 }],
    },
    T("cardCta", "קישור בכל כרטיס"),
    T("cta", "כפתור למטה"),
  ],
};
export const HOME_STYLES_DEFAULTS = {
  title: "בחרו את הסגנון שמתאים לכם",
  subtitle: "מגוון רחב של טקסטורות, צבעים ודוגמאות לעיצוב בכל חלל בבית.",
  families: styleFamilies.map((f) => ({ ...f, swatches: [...f.swatches] })),
  cardCta: "לצפייה בדגמים",
  cta: "לכל הדגמים",
};

export const HOME_DIY: SectionDef = {
  key: "home.diy",
  title: "עשה זאת בעצמך",
  page: "/#diy",
  fields: [
    T("pill", "תגית"),
    T("title1", "כותרת, שורה ראשונה"),
    T("title2", "כותרת, שורה שנייה"),
    A("text", "פסקה"),
    T("cta", "כפתור"),
    I("background", "תמונת רקע"),
    I("videoImage", "התמונה עם כפתורי הסרטונים"),
    T("video1Label", "כפתור סרטון 1"),
    { name: "video1", label: "סרטון 1", type: "video", hint: "מדביקים קישור מיוטיוב; הכיסוי והכותרת נמשכים לבד" },
    T("video2Label", "כפתור סרטון 2"),
    { name: "video2", label: "סרטון 2", type: "video" },
    {
      name: "steps",
      label: "שלבים",
      type: "list",
      max: 4,
      itemLabel: "שלב",
      fields: [{ name: "icon", label: "אייקון", type: "icon" }, T("label", "טקסט")],
    },
    T("toolsTitle", "כותרת הציוד"),
    { name: "tools", label: "ציוד", type: "list", max: 4, itemLabel: "פריט", fields: [T("name", "שם"), I("img", "תמונה")] },
  ],
};
export const HOME_DIY_DEFAULTS = {
  pill: "DIY · טפטים להדבקה עצמית",
  title1: "מראה חדש לבית.",
  title2: "עם הידיים שלכם.",
  text: "טפטים להדבקה עצמית לחידוש דלתות, ארונות ורהיטים. בוחרים את הסגנון שלכם ומתחילים ליצור.",
  cta: "לבחירת הטפט שלכם",
  background: DIY_BG,
  videoImage: DIY_VIDEO,
  video1Label: "צפו איך זה עובד",
  video1: { id: "HfiHdxP-eRI", title: "איך להדביק טפט על מטבח", poster: "https://i.ytimg.com/vi/HfiHdxP-eRI/hqdefault.jpg" },
  video2Label: "השיטה הארוכה",
  video2: { id: KITCHEN_DOOR_VIDEO.id, title: KITCHEN_DOOR_VIDEO.title, poster: KITCHEN_DOOR_VIDEO.poster },
  steps: diySteps.map((s) => ({ icon: s.icon, label: s.label })),
  toolsTitle: "הציוד שצריך להתקנת טפטים מושלמת בבית שלכם",
  tools: diyTools.map((t) => ({ ...t })),
};

export const HOME_ABOUT: SectionDef = {
  key: "home.about",
  title: "אודות",
  page: "/#about",
  fields: [
    T("pill", "תגית"),
    T("title1", "כותרת, שורה ראשונה"),
    T("title2", "כותרת, שורה שנייה"),
    A("p1", "פסקה ראשונה"),
    A("p2", "פסקה שנייה"),
    { name: "surfaces", label: "משטחים (שורת המילים)", type: "list", max: 6, itemLabel: "משטח", fields: [T("label", "משטח")] },
    { name: "stats", label: "יתרונות מתחלפים", type: "list", max: 3, itemLabel: "יתרון", fields: [{ name: "icon", label: "אייקון", type: "icon" }, T("label", "טקסט")] },
    T("whatsappLabel", "כפתור וואטסאפ"),
    T("quizPrompt", "שאלה ליד הכפתור"),
    T("quizLink", "קישור לשאלון"),
    { name: "gallery", label: "גלריה (הראשונה גדולה)", type: "list", max: 4, itemLabel: "תמונה", fields: [I("src", "תמונה"), T("alt", "תיאור התמונה")] },
  ],
};
export const HOME_ABOUT_DEFAULTS = {
  pill: "אודות סולודור",
  title1: "לא מחליפים את הבית.",
  title2: "נותנים לו להרגיש חדש.",
  p1: "סולודור נולדה מתוך ניסיון של שנים בעולם המנעולנות והציפויים. אנחנו מאמינים שלא צריך להחליף דלת, מטבח או ארון כדי לשנות את התחושה של הבית.",
  p2: "אנחנו מתמחים בציפויים פולימריים איכותיים עם הגנה מפני שריטות ודעיכה בצבע, בהתקנה מדויקת ובמבחר רחב של עיצובים למראה נקי, יוקרתי ועמיד.",
  surfaces: aboutSurfaces.map((label) => ({ label })),
  stats: aboutStats.map((s) => ({ ...s })),
  whatsappLabel: "להתייעצות בוואטסאפ",
  quizPrompt: "לא בטוח מה לבחור?",
  quizLink: "לשאלון הכוונה",
  gallery: aboutGallery.map((g) => ({ ...g })),
};

export const HOME_PROCESS: SectionDef = {
  key: "home.process",
  title: "איך זה עובד",
  page: "/",
  fields: [
    T("title", "כותרת"),
    T("subtitle", "שורת משנה"),
    A("text", "פסקה"),
    T("badgeNumber", "מספר בעיגול"),
    T("badgeLabel", "טקסט בעיגול"),
    T("standardTitle", "כותרת התקן"),
    A("standardText", "טקסט התקן"),
    { name: "steps", label: "שלבים", type: "list", max: 8, itemLabel: "שלב", fields: [T("name", "שם"), A("desc", "תיאור"), I("img", "תמונה")] },
    T("cta", "כפתור"),
  ],
};
export const HOME_PROCESS_DEFAULTS = {
  title: "איך זה עובד?",
  subtitle: "מהבחירה הראשונה ועד החידוש בבית",
  text: "תהליך פשוט, ברור ומדויק לחידוש דלתות ומשטחים בעזרת חיפוי דקורטיבי בהדבקה עצמית.",
  badgeNumber: "200+",
  badgeLabel: "עיצובים ייחודיים",
  standardTitle: "תקן העבודה של סולודור",
  standardText: "התקנה מקצועית בפריסה רחבה · ייעוץ ללא התחייבות · ליווי עד לתוצאה בבית.",
  steps: processSteps.map((s) => ({ name: s.name, desc: s.desc, img: s.img })),
  cta: "לשאלות ותשובות על התהליך",
};

export const HOME_BEFORE_AFTER: SectionDef = {
  key: "home.beforeAfter",
  title: "לפני ואחרי",
  page: "/",
  fields: [
    T("kicker", "שורה מעל הכותרת"),
    T("title", "כותרת"),
    A("text", "פסקה"),
    { name: "pairs", label: "עבודות", type: "list", max: 12, itemLabel: "עבודה", fields: [T("name", "שם"), T("desc", "תיאור"), I("before", "לפני"), I("after", "אחרי")] },
    { name: "figures", label: "מספרים", type: "list", max: 4, itemLabel: "מספר", fields: [T("to", "מספר"), T("suffix", "סימן אחרי המספר (+ או %)"), T("label", "טקסט")] },
    T("cta", "כפתור"),
  ],
};
export const HOME_BEFORE_AFTER_DEFAULTS = {
  kicker: "מה שהיה בעבר כבר לא יחזור...",
  title: "עבודות סולודור לפני ואחרי",
  text: "פרויקטים אמיתיים של חידוש דלתות, מטבחים ומשטחים, לפני ואחרי תהליך הציפוי וההתקנה.",
  pairs: beforeAfterPairs.map((p) => ({ ...p })),
  figures: beforeAfterFigures.map((f) => ({ to: String(f.to), suffix: f.suffix, label: f.label })),
  cta: "לצפייה בטפטים המומלצים שלנו",
};

export const HOME_BEST_SELLERS: SectionDef = {
  key: "home.bestSellers",
  title: "הנמכרים ביותר",
  page: "/",
  fields: [T("pill", "תגית"), T("title", "כותרת"), A("text", "פסקה"), T("shopCta", "כפתור לחנות"), T("quizCta", "כפתור לשאלון")],
};
export const HOME_BEST_SELLERS_DEFAULTS = {
  pill: "המובחרים ביותר אצלנו",
  title: "הדגמים הכי נמכרים של שנת 2026",
  text: "עיצובים שמשדרגים כל חלל באיכות בלתי מתפשרת ומתאמים בדיוק לסגנון החיים שלכם.",
  shopCta: "צפייה בכל החנות",
  quizCta: "לשאלון הכוונה לבחירת הטפט שלכם",
};

export const HOME_FAQ: SectionDef = {
  key: "home.faq",
  title: "שאלות נפוצות (בדף הבית ובדף הדלתות)",
  page: "/",
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת"),
    A("text", "פסקה"),
    { name: "items", label: "שאלות", type: "list", max: 10, itemLabel: "שאלה", fields: [T("q", "שאלה", 200), A("a", "תשובה"), I("img", "תמונה שמתחלפת")] },
    T("allLink", "קישור לכל השאלות"),
    T("moreTitle", "כותרת למטה"),
    T("whatsappLabel", "כפתור וואטסאפ"),
    T("shopCta", "כפתור לחנות"),
  ],
};
export const HOME_FAQ_DEFAULTS = {
  pill: "השאלות הנפוצות ביותר",
  title: "שאלות נפוצות",
  text: "ריכזנו עבורכם תשובות ברורות לשאלות שחוזרות הכי הרבה על ציפוי, התאמה, התקנה ותחזוקה.",
  items: faqItems.map((item, i) => ({ ...item, img: faqImages[i] ?? faqImages[0] })),
  allLink: "לכל השאלות והתשובות, לפי סוג הטפט",
  moreTitle: "יש לכם שאלה נוספת? אנחנו כאן לעזור",
  whatsappLabel: "לשיחה בווצאפ",
  shopCta: "לצפייה בכל החנות",
};

export const HOME_ARTICLES: SectionDef = {
  key: "home.articles",
  title: "מדריכים ומאמרים",
  page: "/",
  fields: [T("title", "כותרת"), T("cta", "כפתור")],
};
export const HOME_ARTICLES_DEFAULTS = { title: "מדריכים ומאמרים", cta: "לכל המאמרים" };

/** In the order they appear on the page. */
export const HOME_SECTIONS: { def: SectionDef; defaults: Record<string, unknown> }[] = [
  { def: HOME_HERO, defaults: HOME_HERO_DEFAULTS },
  { def: HOME_CATEGORIES, defaults: HOME_CATEGORIES_DEFAULTS },
  { def: HOME_STYLES, defaults: HOME_STYLES_DEFAULTS },
  { def: HOME_DIY, defaults: HOME_DIY_DEFAULTS },
  { def: HOME_ABOUT, defaults: HOME_ABOUT_DEFAULTS },
  { def: HOME_PROCESS, defaults: HOME_PROCESS_DEFAULTS },
  { def: HOME_BEFORE_AFTER, defaults: HOME_BEFORE_AFTER_DEFAULTS },
  { def: HOME_BEST_SELLERS, defaults: HOME_BEST_SELLERS_DEFAULTS },
  { def: HOME_FAQ, defaults: HOME_FAQ_DEFAULTS },
  { def: HOME_ARTICLES, defaults: HOME_ARTICLES_DEFAULTS },
];
