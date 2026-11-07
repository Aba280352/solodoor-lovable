/**
 * The "ציפוי דלתות" page sections: what can be edited in each, and the content they show when nothing was edited
 * (exactly the page's original texts and images).
 */
import { aboutFigures, aboutImages, aboutServices, doorFinishes, doorHotspots, doorTypes, doorsBeforeAfter, doorsTrust, processSteps, quoteSteps } from "../doors/data";
import type { FieldDef, SectionDef } from "./sections";

const T = (name: string, label: string, max?: number): FieldDef => ({ name, label, type: "text", max });
const A = (name: string, label: string, max?: number): FieldDef => ({ name, label, type: "textarea", max });
const I = (name: string, label: string): FieldDef => ({ name, label, type: "image" });
const PAGE = "/ציפוי-דלתות";

export const DOORS_HERO: SectionDef = {
  key: "doors.hero",
  title: "באנר ראשי (דלתות)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת ראשית (H1)"),
    A("text", "פסקה"),
    T("quoteCta", "כפתור הצעת מחיר"),
    T("whatsappLabel", "כפתור וואטסאפ"),
    { name: "trust", label: "שורת ההבטחות", type: "list", max: 4, itemLabel: "הבטחה", fields: [T("label", "טקסט")] },
    { name: "finishes", label: "הדלת בגוונים (התמונה המתחלפת)", type: "list", max: 8, itemLabel: "גוון", fields: [T("name", "שם הגוון"), I("img", "תמונה")] },
    { name: "hotspots", label: "הנקודות על הדלת", type: "list", max: 3, itemLabel: "נקודה", hint: "המיקום של כל נקודה על התמונה קבוע.", fields: [T("title", "כותרת"), A("text", "טקסט")] },
  ],
};
export const DOORS_HERO_DEFAULTS = {
  pill: "ציפוי דלתות",
  title: "מחדשים את הדלת, משדרגים את כל הכניסה",
  text: "ציפוי דלתות פולימרי, עבה ועמיד, בתוספת שכבת הגנה מפני שריטות ודהיית צבע. מעל 200 עיצובים ייחודיים, בהתקנה מדויקת ומקצועית אצלכם בבית.",
  quoteCta: "קבלו הצעת מחיר",
  whatsappLabel: "להתייעצות בווצאפ",
  trust: doorsTrust.map((label) => ({ label })),
  finishes: doorFinishes.map((f) => ({ ...f })),
  hotspots: doorHotspots.map((h) => ({ ...h })),
};

export const DOORS_QUOTE: SectionDef = {
  key: "doors.quote",
  title: "הצעת מחיר (דלתות)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת"),
    { name: "steps", label: "שלושת הצעדים", type: "list", max: 4, itemLabel: "צעד", fields: [T("title", "כותרת"), A("text", "טקסט")] },
    T("formTitle", "כותרת הטופס"),
    T("formText", "שורה מתחת לכותרת הטופס"),
    { name: "doorTypes", label: "סוגי הדלת לבחירה בטופס", type: "list", max: 5, itemLabel: "סוג", fields: [T("label", "סוג")] },
    T("cta", "כפתור השליחה"),
    T("sentTitle", "כותרת אחרי שליחה"),
    T("sentText", "טקסט אחרי שליחה"),
    T("directTitle", "שורה מעל וואטסאפ וטלפון"),
    T("whatsappLabel", "כפתור וואטסאפ"),
  ],
};
export const DOORS_QUOTE_DEFAULTS = {
  pill: "ייעוץ חינם וללא התחייבות",
  title: "הצעת מחיר לדלת שלכם, בשלושה צעדים",
  steps: quoteSteps.map((s) => ({ ...s })),
  formTitle: "קבלו הצעת מחיר",
  formText: "השאירו פרטים ונחזור אליכם בהקדם.",
  doorTypes: doorTypes.map((label) => ({ label })),
  cta: "קבלו הצעת מחיר",
  sentTitle: "קיבלנו את הפרטים",
  sentText: "נחזור אליכם בהקדם עם הצעת מחיר לדלת שלכם.",
  directTitle: "מעדיפים לדבר איתנו ישירות?",
  whatsappLabel: "ווצאפ",
};

export const DOORS_PROCESS: SectionDef = {
  key: "doors.process",
  title: "איך זה עובד (דלתות)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת"),
    { name: "steps", label: "ארבעת הצעדים", type: "list", max: 4, itemLabel: "צעד", hint: "הצעדים מתחלפים לפי הגלילה באנימציה, ולכן יש בדיוק ארבעה.", fields: [T("title", "כותרת"), A("text", "טקסט")] },
  ],
};
export const DOORS_PROCESS_DEFAULTS = {
  pill: "איך זה עובד",
  title: "מדלת ישנה לדלת חדשה, בארבעה צעדים",
  steps: processSteps.map((s) => ({ ...s })),
};

export const DOORS_BEFORE_AFTER: SectionDef = {
  key: "doors.beforeAfter",
  title: "לפני ואחרי (דלתות)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת"),
    A("text", "פסקה"),
    { name: "pairs", label: "עבודות", type: "list", max: 12, itemLabel: "עבודה", fields: [T("name", "שם"), T("desc", "תיאור"), I("before", "לפני"), I("after", "אחרי")] },
  ],
};
export const DOORS_BEFORE_AFTER_DEFAULTS = {
  pill: "מה שהיה כבר נגמר…",
  title: "לפני ואחרי",
  text: "דלתות אמיתיות שחידשנו. גררו את העיגול כדי לראות את הדלת לפני ואחרי הציפוי.",
  pairs: doorsBeforeAfter.map((p) => ({ ...p })),
};

export const DOORS_SHOP: SectionDef = {
  key: "doors.shop",
  title: "ציפויים לקנייה (דלתות)",
  page: PAGE,
  fields: [T("pill", "תגית"), T("title", "כותרת"), A("text", "פסקה"), T("allCta", "כפתור לכל הציפויים"), T("quoteCta", "כפתור הצעת מחיר")],
};
export const DOORS_SHOP_DEFAULTS = {
  pill: "מעדיפים לעשות את זה בעצמכם?",
  title: "ציפויים לדלת, לקנייה באתר",
  text: "בוחרים עיצוב, מזמינים באתר ומקבלים את הציפוי עד הבית. רוצים שנתקין בשבילכם? השאירו פרטים ונחזור אליכם.",
  allCta: "לכל ציפויי הדלתות",
  quoteCta: "קבלו הצעת מחיר להתקנה",
};

export const DOORS_ABOUT: SectionDef = {
  key: "doors.about",
  title: "קצת עלינו (דלתות)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title1", "כותרת, שורה ראשונה"),
    T("title2", "כותרת, שורה שנייה (בצבע)"),
    A("lead", "פסקה מודגשת"),
    A("text", "פסקה"),
    A("quote", "ציטוט"),
    T("quoteBy", "מי אמר"),
    T("cta", "כפתור"),
    I("mainImage", "תמונה גדולה"),
    I("detailImage", "תמונה קטנה"),
    T("badgeNumber", "מספר בתגית"),
    T("badgeLabel", "טקסט בתגית"),
    { name: "figures", label: "מספרים", type: "list", max: 4, itemLabel: "מספר", hint: "המספר של 'ביקורות בגוגל' נלקח מפרטי העסק.", fields: [T("value", "מספר"), T("label", "טקסט")] },
    T("servicesLead", "תחילת השורה האחרונה (מודגש)"),
    T("services", "המשך השורה"),
  ],
};
export const DOORS_ABOUT_DEFAULTS = {
  pill: "קצת עלינו",
  title1: "לא מתפשרים על איכות.",
  title2: "לא מתפשרים על שירות.",
  lead: "סולודור הוקמה לפני 6 שנים על ידי שלמה, הבעלים, שמגיע עם ניסיון של כ-10 שנים בתחום המנעולנות והטפטים.",
  text: "אנחנו מתמחים בציפויים פולימריים בעיצוב בלעדי, בתוספת שכבת הגנה מפני שריטות ודהיית צבע. ציפוי איכותי, עבה ועמיד, שיהפוך את הדלת שלכם מפשוטה לדלת שלא תוכלו להפסיק להסתכל עליה.",
  quote: "הקמנו את סולודור כדי לתת שירות ללקוחות גם אחרי שהסתיימה העסקה. שביעות הרצון של הלקוחות היא מאבני היסוד שלנו.",
  quoteBy: "שלמה, הבעלים של סולודור",
  cta: "קבלו הצעת מחיר",
  mainImage: aboutImages.main,
  detailImage: aboutImages.detail,
  badgeNumber: "10",
  badgeLabel: "שנות ניסיון בתחום",
  figures: aboutFigures.map((f) => ({ ...f })),
  servicesLead: "לא רק דלתות.",
  services: `גם ${aboutServices}.`,
};

/** In the order they appear on the page. */
export const DOORS_SECTIONS: { def: SectionDef; defaults: Record<string, unknown> }[] = [
  { def: DOORS_HERO, defaults: DOORS_HERO_DEFAULTS },
  { def: DOORS_QUOTE, defaults: DOORS_QUOTE_DEFAULTS },
  { def: DOORS_PROCESS, defaults: DOORS_PROCESS_DEFAULTS },
  { def: DOORS_BEFORE_AFTER, defaults: DOORS_BEFORE_AFTER_DEFAULTS },
  { def: DOORS_SHOP, defaults: DOORS_SHOP_DEFAULTS },
  { def: DOORS_ABOUT, defaults: DOORS_ABOUT_DEFAULTS },
];
