/**
 * The "ציפוי מטבחים" page sections: what can be edited in each, and the content they show when nothing was edited
 * (exactly the page's original texts and images).
 */
import { KITCHEN_INTRO_IMG, kitchenAudiences, kitchenBeforeAfter, kitchenBenefits, kitchenModels, kitchenQuality, kitchenValues } from "../kitchen/data";
import type { FieldDef, SectionDef } from "./sections";

const T = (name: string, label: string, max?: number): FieldDef => ({ name, label, type: "text", max });
const A = (name: string, label: string, max?: number): FieldDef => ({ name, label, type: "textarea", max });
const I = (name: string, label: string): FieldDef => ({ name, label, type: "image" });
const ICON: FieldDef = { name: "icon", label: "אייקון", type: "icon" };
const PAGE = "/ציפוי-מטבחים";

export const KITCHEN_HERO: SectionDef = {
  key: "kitchen.hero",
  title: "באנר ראשי (מטבחים)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    { name: "title", label: "כותרת ראשית (H1)", type: "text", hint: "הדף הזה מדורג ראשון בגוגל על 'ציפוי מטבחים'. מומלץ לא לשנות את הכותרת הזו." },
    T("subtitle", "כותרת משנה"),
    T("whatsappLabel", "כפתור וואטסאפ"),
    T("catalogCta", "כפתור לקטלוג"),
    { name: "models", label: "המטבח בגוונים (המצגת)", type: "list", max: 8, itemLabel: "גוון", fields: [T("name", "שם הגוון"), I("img", "תמונה")] },
    { name: "trust", label: "שלוש ההבטחות", type: "list", max: 3, itemLabel: "הבטחה", fields: [ICON, T("label", "טקסט")] },
  ],
};
export const KITCHEN_HERO_DEFAULTS = {
  pill: "סולודור · חידוש מטבחים",
  title: "ציפוי מטבחים",
  subtitle: "הדבקת טפט על מטבחים בפריסה רחבה",
  whatsappLabel: "להתייעצות בווצאפ",
  catalogCta: "לקטלוג ציפויי המטבח",
  models: kitchenModels.map((m) => ({ ...m })),
  trust: [
    { icon: "Clock", label: "ביום עבודה אחד בלבד" },
    { icon: "Home", label: "בלי לכלוך, בלי אבק, בלי רעש" },
    { icon: "ShieldCheck", label: "עמידות גבוהה לחום, אדים ולחות" },
  ],
};

export const KITCHEN_INTRO: SectionDef = {
  key: "kitchen.intro",
  title: "רוצים טפט חדש למטבח?",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת"),
    A("lead", "פסקה מודגשת"),
    A("p1", "פסקה"),
    A("p2", "פסקה נוספת"),
    A("quote", "משפט מודגש בצד"),
    I("image", "תמונה"),
    T("priceLabel", "כותרת הכרטיס על התמונה"),
    T("price", "המחיר המחוק"),
    T("altTitle", "שאלה בכרטיס"),
    { name: "alternatives", label: "מה אפשר לעשות עם הכסף", type: "list", max: 4, itemLabel: "שורה", fields: [T("label", "טקסט")] },
    T("benefitsTitle", "כותרת 'מה תקבל'"),
    { name: "benefits", label: "מה תקבל מאיתנו", type: "list", max: 8, itemLabel: "שורה", fields: [T("label", "טקסט")] },
    T("audiencesTitle", "כותרת 'למי זה מתאים'"),
    T("audiencesText", "שורה מתחת"),
    { name: "audiences", label: "למי זה מתאים", type: "list", max: 9, itemLabel: "קהל", fields: [ICON, T("label", "טקסט")] },
    { name: "promisePhrases", label: "הפס השחור: שורה עליונה", type: "list", max: 4, itemLabel: "מילים", fields: [T("label", "טקסט")] },
    T("promiseBefore", "הפס השחור: לפני המילה המודגשת"),
    T("promiseHighlight", "הפס השחור: המילה המודגשת"),
    T("promiseAfter", "הפס השחור: אחרי המילה המודגשת"),
    T("qualityTitle", "כותרת איכות החומר"),
    { name: "quality", label: "איכות החומר", type: "list", max: 5, itemLabel: "תכונה", fields: [ICON, T("label", "טקסט")] },
  ],
};
export const KITCHEN_INTRO_DEFAULTS = {
  pill: "סולודור מגשימים חלומות…",
  title: "רוצים טפט חדש למטבח?",
  lead: "הוצאות של מטבח חדש הן גבוהות, אנחנו מבינים את זה. אבל מי אמר שחייבים לקחת הלוואות או למשוך חסכונות כדי לתת למטבח את השינוי שתמיד רצית?",
  p1: "אחרי שנסיים את העבודה, המטבח שלך ייראה מחודש, נקי ומעוצב, בדיוק בגוון ובסגנון שמתאים לך.",
  p2: "נכון, מטבח חדש מחברת מטבחים נראה אחרת לגמרי (ובעלות של 120,000 ₪ הוא גם חייב להיראות טוב), אבל חופשה משפחתית, עזרה לילדים או אפילו השארת הכסף בצד נשמעים הרבה יותר טוב.",
  quote: "אנחנו לא נגיד לך שעדיף חידוש בטפט במקום מטבח חדש. אבל אנחנו כן מאמינים שחשוב לחשוב על כל האפשרויות ולקבל החלטה בצורה חכמה ושקולה.",
  image: KITCHEN_INTRO_IMG,
  priceLabel: "מטבח חדש מחברת מטבחים",
  price: "₪120,000",
  altTitle: "ומה אפשר לעשות עם הכסף במקום?",
  alternatives: ["חופשה משפחתית", "עזרה לילדים", "להשאיר את הכסף בצד"].map((label) => ({ label })),
  benefitsTitle: "מה תקבל מאיתנו?",
  benefits: kitchenBenefits.map((label) => ({ label })),
  audiencesTitle: "למי זה מתאים?",
  audiencesText: "הטפטים שלנו מתאימים ל:",
  audiences: kitchenAudiences.map((a) => ({ ...a })),
  promisePhrases: ["בלי לכלוך", "בלי אבק", "בלי רעש"].map((label) => ({ label })),
  promiseBefore: "ביום עבודה",
  promiseHighlight: "אחד",
  promiseAfter: "בלבד",
  qualityTitle: "איכות החומר",
  quality: kitchenQuality.map((q) => ({ ...q })),
};

export const KITCHEN_VALUES: SectionDef = {
  key: "kitchen.values",
  title: "מה תקבלו מאיתנו (מטבחים)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת"),
    { name: "values", label: "שלושת הערכים", type: "list", max: 3, itemLabel: "ערך", fields: [T("title", "כותרת"), I("img", "תמונה"), T("alt", "תיאור התמונה"), A("p1", "פסקה"), A("p2", "פסקה נוספת")] },
  ],
};
export const KITCHEN_VALUES_DEFAULTS = {
  pill: "סולודור מגשימים חלומות…",
  title: "מה תקבלו מאיתנו?",
  values: kitchenValues.map((v) => ({ title: v.title, img: v.img, alt: v.alt, p1: v.text[0] ?? "", p2: v.text[1] ?? "" })),
};

export const KITCHEN_CATALOG: SectionDef = {
  key: "kitchen.catalog",
  title: "קטלוג (מטבחים)",
  page: PAGE,
  fields: [T("pill", "תגית"), T("title", "כותרת"), T("subtitle", "כותרת משנה"), A("lead", "פסקה מודגשת"), A("p1", "פסקה"), A("p2", "פסקה נוספת"), T("cta", "כפתור לקטלוג"), T("allCta", "כפתור לכל הציפויים")],
};
export const KITCHEN_CATALOG_DEFAULTS = {
  pill: "מכניסים אתכם בדרך חדשה.",
  title: "קטלוג הציפויים של סולודור למטבח",
  subtitle: "קטלוג ציפויי מטבחים",
  lead: "ציפויי המטבח של סולודור הם הדרך הקלה, האסתטית והמהירה לרענן את מראה המטבח, מבלי לשבור קירות או להחליף ארונות.",
  p1: "הקטלוג שלנו כולל מגוון עשיר של ציפויים במגוון טקסטורות, צבעים וסגנונות: מודרני, קלאסי, תעשייתי, נקי או צבעוני. הציפויים מותאמים אישית ומיוצרים מחומרים איכותיים ועמידים במיוחד לחום, רטיבות ושימוש יומיומי.",
  p2: "בחרו את הסגנון שהכי מדבר אליכם, והתאימו את הציפוי לאווירה שאתם רוצים ליצור בבית. שדרוג המטבח שלכם מתחיל כאן.",
  cta: "צפייה בקטלוג",
  allCta: "לכל ציפויי המטבח",
};

export const KITCHEN_BEFORE_AFTER: SectionDef = {
  key: "kitchen.beforeAfter",
  title: "לפני ואחרי (מטבחים)",
  page: PAGE,
  fields: [
    T("pill", "תגית"),
    T("title", "כותרת"),
    A("text", "פסקה"),
    { name: "pairs", label: "עבודות", type: "list", max: 12, itemLabel: "עבודה", fields: [T("name", "שם"), T("desc", "תיאור"), I("before", "לפני"), I("after", "אחרי")] },
  ],
};
export const KITCHEN_BEFORE_AFTER_DEFAULTS = {
  pill: "מה שהיה כבר נגמר…",
  title: "לפני ואחרי",
  text: "מטבחים אמיתיים שחידשנו. גררו את העיגול כדי לראות את המטבח לפני ואחרי הציפוי.",
  pairs: kitchenBeforeAfter.map((p) => ({ ...p })),
};

/** In the order they appear on the page. */
export const KITCHEN_SECTIONS: { def: SectionDef; defaults: Record<string, unknown> }[] = [
  { def: KITCHEN_HERO, defaults: KITCHEN_HERO_DEFAULTS },
  { def: KITCHEN_INTRO, defaults: KITCHEN_INTRO_DEFAULTS },
  { def: KITCHEN_VALUES, defaults: KITCHEN_VALUES_DEFAULTS },
  { def: KITCHEN_CATALOG, defaults: KITCHEN_CATALOG_DEFAULTS },
  { def: KITCHEN_BEFORE_AFTER, defaults: KITCHEN_BEFORE_AFTER_DEFAULTS },
];
