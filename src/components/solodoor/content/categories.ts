/**
 * The shop's category pages (/חנות?cat=door and so on): each is a landing page of its own in Google, so it gets a
 * keyword title and description, a heading, and a short guide with questions under the products. The look of the
 * page does not change: the heading area and the grid stay as they are, the guide uses the site's existing styles.
 *
 * A category page is the shop with exactly one category and no other filter. Editable in the admin
 * (key `category.<slug>`); the defaults below are the texts the site shows when nothing was edited.
 * Keyword research: SEO/מחקר-מילות-מפתח-סולודור-2026-11.csv.
 */
import type { FieldDef, SectionDef } from "./sections";
import { effectiveContent, type SiteContent } from "./site-content";
import { mergeSection } from "./sections";

const T = (name: string, label: string, hint?: string, max?: number): FieldDef => ({ name, label, type: "text", hint, max });
const A = (name: string, label: string, hint?: string, max?: number): FieldDef => ({ name, label, type: "textarea", hint, max });

const FIELDS: FieldDef[] = [
  T("metaTitle", "כותרת בגוגל", "עד כ-60 תווים. מופיעה בתוצאות החיפוש ובלשונית הדפדפן.", 90),
  A("metaDescription", "תיאור בגוגל", "עד כ-155 תווים. התיאור שמופיע מתחת לכותרת בגוגל.", 300),
  T("title", "כותרת ראשית (H1)", "הכותרת הגדולה בראש הדף. כדאי שתכלול את הביטוי שמחפשים."),
  A("intro", "פסקת פתיחה", "מופיעה מתחת לכותרת, מעל המוצרים."),
  T("guideTitle", "כותרת המדריך מתחת למוצרים"),
  { name: "blocks", label: "פסקאות המדריך", type: "list", max: 6, itemLabel: "פסקה", fields: [T("heading", "כותרת"), A("text", "טקסט")] },
  T("ctaTitle", "כותרת התיבה המודגשת"),
  A("ctaText", "טקסט התיבה המודגשת"),
  T("ctaLabel", "טקסט הכפתור"),
  { name: "faq", label: "שאלות נפוצות", type: "list", max: 10, itemLabel: "שאלה", fields: [T("question", "שאלה"), A("answer", "תשובה")] },
];

export interface CategoryContent extends Record<string, unknown> {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  guideTitle: string;
  blocks: { heading: string; text: string }[];
  ctaTitle: string;
  ctaText: string;
  ctaLabel: string;
  faq: { question: string; answer: string }[];
}

interface CategoryPage {
  slug: string;
  label: string;
  /** Where the box under the guide sends the visitor (fixed in code, so a link can never break). */
  ctaHref: string;
  defaults: CategoryContent;
}

const PAGES: CategoryPage[] = [
  {
    slug: "door",
    label: "טפט לדלת",
    ctaHref: "/ציפוי-דלתות",
    defaults: {
      metaTitle: "טפט לדלת כניסה ודלת פנים: מעל 150 עיצובים | סולודור",
      metaDescription: "טפט לדלת כניסה, לפלדלת ולדלתות פנים. עשרות גוונים בהדבקה עצמית, עבה ועמיד לשריטות. מזמינים באתר, או עם התקנה של מתקין סולודור.",
      title: "טפט לדלת",
      intro: "טפט עבה ועמיד בהדבקה עצמית לדלת כניסה, לפלדלת ולדלתות פנים. בוחרים גוון, מדביקים לבד או מזמינים התקנה, ומקבלים דלת שנראית חדשה בלי להחליף אותה.",
      guideTitle: "איך בוחרים טפט לדלת",
      blocks: [
        {
          heading: "מתאים לדלת כניסה, לפלדלת ולדלתות פנים",
          text: "הטפט נדבק על כל דלת עם משטח חלק, נקי ויבש: פלדלת, דלת רב בריח, דלת עץ ודלתות פנים. הוא מכסה שריטות, כתמים וצבע שדהה, ומשאיר את הדלת והמשקוף במקום.",
        },
        {
          heading: "כמה טפט צריך לדלת",
          text: "יחידה אחת מכסה צד אחד של דלת בגודל רגיל. כדי לחדש את שני הצדדים מזמינים שתי יחידות. לפני ההדבקה מפרקים את הידית ואת העינית, ומחזירים אותן בסוף.",
        },
        {
          heading: "להדביק לבד או עם מתקין",
          text: "הטפט מגיע בהדבקה עצמית, ומדביקים אותו עם קלף וסכין יפנית. מעדיפים שלא להתעסק? אפשר לסמן בהזמנה התקנה מקצועית, והמתקין של סולודור מגיע עם החומר.",
        },
      ],
      ctaTitle: "רוצים שנחדש לכם את הדלת?",
      ctaText: "מתקין של סולודור מגיע אליכם עם הטפט ומחדש את הדלת במקום, בלי להחליף אותה.",
      ctaLabel: "לציפוי דלתות בהתקנה",
      faq: [
        { question: "הטפט מתאים לדלת פלדלת?", answer: "כן. הטפט נדבק על פלדלת, על דלת רב בריח ועל דלתות עץ ופנים, בתנאי שהמשטח חלק, נקי ויבש." },
        { question: "כמה זמן מחזיק טפט לדלת?", answer: "הטפט עבה ויש לו שכבת הגנה מפני שריטות ודהייה, ולכן הוא מתאים לשימוש יומיומי לאורך זמן. כדי לשמור עליו מנקים במטלית לחה, בלי חומרים שורטים." },
        { question: "אפשר להדביק לבד?", answer: "כן. מדביקים עם קלף וסכין יפנית, לאט ומהמרכז החוצה, ומחליקים בועות לכיוון הקצוות. מי שמעדיף יכול להזמין התקנה מקצועית." },
        { question: "אפשר לראות את הגוון לפני שמזמינים?", answer: "כן. הדוגמית הראשונה בחינם, ומשלמים רק על המשלוח. כך רואים את הצבע והטקסטורה באור של הבית." },
        { question: "תוך כמה זמן ההזמנה מגיעה?", answer: "משלוח עד הבית לכל הארץ מגיע תוך 7 ימי עסקים. הטפט נשלח מגולגל באריזה קשיחה, כדי שיגיע בלי קפלים." },
      ],
    },
  },
  {
    slug: "kitchen",
    label: "טפט למטבח",
    ctaHref: "/ציפוי-מטבחים",
    defaults: {
      metaTitle: "טפט למטבח בהדבקה עצמית | טפט לארונות מטבח | סולודור",
      metaDescription: "טפט לארונות ולחזיתות מטבח שמחדש את המטבח בלי להחליף אותו. טפט עבה ועמיד בהדבקה עצמית, עשרות גוונים, נמכר לפי מטר ומגיע עד הבית.",
      title: "טפט למטבח",
      intro: "טפט עבה בהדבקה עצמית לארונות ולחזיתות המטבח. מחדשים את כל המטבח בלי לפרק, בלי לשבור ובלי לקנות מטבח חדש.",
      guideTitle: "איך מחדשים מטבח עם טפט",
      blocks: [
        {
          heading: "חידוש מטבח בלי שיפוץ",
          text: "מדביקים את הטפט על החזיתות הקיימות, ומקבלים מראה של מטבח חדש בעלות קטנה בהרבה מהחלפה. אין אבק, אין רעש, ואפשר להשתמש במטבח כבר באותו יום.",
        },
        {
          heading: "כמה טפט צריך למטבח",
          text: "מודדים גובה ורוחב של כל חזית, מחברים את הכול ומוסיפים כ-10% רזרבה. רוחב הגליל 122 ס\"מ, והטפט נמכר לפי מטר, כך שמזמינים בדיוק את האורך שצריך.",
        },
        {
          heading: "מתאים לתנאים של מטבח",
          text: "הציפוי מיועד לשימוש יומיומי, כולל חום ורטיבות, ומנקים אותו במטלית לחה. לא חובה לפרק את הדלתות: מספיק לפרק את הידיות ולהדביק חזית אחרי חזית.",
        },
      ],
      ctaTitle: "מעדיפים שנחדש לכם את המטבח?",
      ctaText: "הצוות של סולודור מצפה את המטבח כולו בתוך יום עבודה אחד, בלי לכלוך ובלי לפרק את הארונות.",
      ctaLabel: "לציפוי מטבחים בהתקנה",
      faq: [
        { question: "הטפט מחזיק במטבח עם חום ואדים?", answer: "כן. הציפוי מיועד לשימוש יומיומי במטבח, כולל חום ורטיבות." },
        { question: "צריך לפרק את דלתות הארונות?", answer: "לא חובה. מספיק לפרק את הידיות, ולהדביק חזית אחרי חזית." },
        { question: "איך מחשבים כמה מטרים להזמין?", answer: "מודדים כל חזית, מחברים ומוסיפים כ-10% רזרבה. רוחב הגליל 122 ס\"מ. בדף המוצר יש מחשבון שעוזר לחשב את הכמות." },
        { question: "איך מנקים טפט על ארונות מטבח?", answer: "ניקוי עדין במטלית לחה. כדאי להימנע מסקוטש מחוספס ומחומרים שורטים." },
        { question: "אפשר לראות את הגוון לפני שמזמינים?", answer: "כן. הדוגמית הראשונה בחינם, ומשלמים רק על המשלוח." },
      ],
    },
  },
  {
    slug: "fridge",
    label: "טפט למקרר",
    ctaHref: "/חנות?cat=kitchen",
    defaults: {
      metaTitle: "טפט למקרר בהדבקה עצמית | ציפוי מקרר בלי להחליף | סולודור",
      metaDescription: "טפט למקרר שמחדש מקרר ישן או משנה את הצבע שלו להתאים למטבח. טפט עבה בהדבקה עצמית, עמיד לשימוש יומיומי, נמכר לפי מטר ומגיע עד הבית.",
      title: "טפט למקרר",
      intro: "טפט בהדבקה עצמית שמחדש מקרר ישן או מתאים אותו לצבעים של המטבח. מדביקים על הדלתות ועל הצדדים הגלויים, והמקרר נראה חדש.",
      guideTitle: "איך מצפים מקרר עם טפט",
      blocks: [
        {
          heading: "מקרר חדש בלי לקנות מקרר",
          text: "מקרר שעובד מצוין אבל נראה ישן, שרוט או לא בצבע של המטבח לא צריך להחליף. מדביקים את הטפט על החזית, ואפשר גם על הצדדים הגלויים.",
        },
        {
          heading: "כמה טפט צריך למקרר",
          text: "מודדים גובה ורוחב של כל דלת ושל כל צד שרוצים לכסות, ומוסיפים כ-10% רזרבה. רוחב הגליל 122 ס\"מ, ומזמינים לפי מטר.",
        },
        {
          heading: "הכנה נכונה להדבקה",
          text: "מנקים היטב את המשטח משומן ומאבק ומייבשים. אם אפשר, מפרקים את הידיות לפני ההדבקה, ומדביקים מהמרכז החוצה עם קלף.",
        },
      ],
      ctaTitle: "מחדשים גם את המטבח?",
      ctaText: "אותם גוונים קיימים גם לארונות המטבח, כך שהמקרר והחזיתות נראים כמו סט אחד.",
      ctaLabel: "לטפטים למטבח",
      faq: [
        { question: "אפשר לכסות רק את הדלתות של המקרר?", answer: "כן. אפשר לכסות רק את החזית, או גם את הצדדים הגלויים של המקרר." },
        { question: "איך מכינים את המקרר להדבקה?", answer: "מנקים היטב משומן ומאבק ומייבשים. אם אפשר, מפרקים את הידיות לפני ההדבקה." },
        { question: "אפשר להדביק לבד?", answer: "כן. הטפט בהדבקה עצמית, ומדביקים אותו עם קלף וסכין יפנית, לאט ומהמרכז החוצה." },
        { question: "אפשר לראות את הגוון לפני שמזמינים?", answer: "כן. הדוגמית הראשונה בחינם, ומשלמים רק על המשלוח." },
      ],
    },
  },
  {
    slug: "countertop",
    label: "טפט לשיש",
    ctaHref: "/חנות?cat=kitchen",
    defaults: {
      metaTitle: "טפט לשיש מטבח בהדבקה עצמית | ציפוי שיש בלי להחליף | סולודור",
      metaDescription: "טפט לשיש ולמשטח העבודה במטבח, במראה שיש, אבן ובטון. טפט עבה בהדבקה עצמית שמחדש משטח ישן בלי להחליף אותו. נמכר לפי מטר ומגיע עד הבית.",
      title: "טפט לשיש",
      intro: "טפט עבה בהדבקה עצמית לשיש ולמשטח העבודה במטבח, במראה שיש, אבן ובטון. מחדשים משטח ישן או כתום בלי לפרק ובלי להחליף.",
      guideTitle: "איך מצפים שיש עם טפט",
      blocks: [
        {
          heading: "משטח חדש בלי להחליף שיש",
          text: "החלפת שיש היא עבודה יקרה ומלכלכת. טפט לשיש נדבק על המשטח הקיים, מכסה כתמים וגוון שנמאס, ומשנה את כל המראה של המטבח.",
        },
        {
          heading: "כמה טפט צריך לשיש",
          text: "מודדים אורך ועומק של המשטח, כולל הקנט הקדמי, ומוסיפים כ-10% רזרבה. רוחב הגליל 122 ס\"מ, ומזמינים לפי מטר.",
        },
        {
          heading: "סוגרים את החיבורים בסיליקון",
          text: "בסיום ההדבקה סוגרים את החיבור בין הטפט לקיר ולכיור בסיליקון, כדי שמים לא ייכנסו מתחת לציפוי. כמו בכל משטח עבודה, כדאי להשתמש בתחתית לסירים ובקרש חיתוך.",
        },
      ],
      ctaTitle: "מחדשים גם את הארונות?",
      ctaText: "אפשר להתאים לשיש גם את חזיתות המטבח, ולקבל מטבח שנראה חדש מקצה לקצה.",
      ctaLabel: "לטפטים למטבח",
      faq: [
        { question: "אפשר להניח סיר חם על השיש המצופה?", answer: "מומלץ להשתמש בתחתית לסירים ובקרש חיתוך, כמו בכל משטח עבודה, כדי לשמור על הציפוי לאורך זמן." },
        { question: "למה צריך סיליקון?", answer: "הסיליקון סוגר את החיבור בין הטפט לקיר ולכיור, כדי שמים לא ייכנסו מתחת לציפוי." },
        { question: "איך מחשבים כמה טפט להזמין לשיש?", answer: "מודדים אורך ועומק של המשטח כולל הקנט הקדמי, ומוסיפים כ-10% רזרבה. רוחב הגליל 122 ס\"מ." },
        { question: "אפשר לראות את הגוון לפני שמזמינים?", answer: "כן. הדוגמית הראשונה בחינם, ומשלמים רק על המשלוח." },
      ],
    },
  },
  {
    slug: "electric-cabinet",
    label: "חיפוי לארון חשמל",
    ctaHref: "/חנות?cat=door",
    defaults: {
      metaTitle: "חיפוי ארון חשמל ביתי | כיסוי מעוצב לארון חשמל | סולודור",
      metaDescription: "חיפוי וכיסוי לארון חשמל ביתי ולארון תקשורת בטפט בהדבקה עצמית. הופכים את הארון האפור לחלק מהעיצוב של הבית, והוא נשאר נגיש ונפתח כרגיל.",
      title: "חיפוי לארון חשמל",
      intro: "טפט בהדבקה עצמית שהופך את ארון החשמל או ארון התקשורת לחלק מהעיצוב של הבית. מדביקים על הדלת בלבד, והארון ממשיך להיפתח כרגיל.",
      guideTitle: "איך מחפים ארון חשמל ביתי",
      blocks: [
        {
          heading: "הארון נעלם לתוך הקיר",
          text: "ארון חשמל אפור בכניסה או במסדרון שובר את העיצוב. טפט בגוון של הקיר, של הדלת או במראה עץ הופך אותו לחלק מהבית, בלי בנייה ובלי נגר.",
        },
        {
          heading: "נשאר נגיש לחשמלאי",
          text: "מדביקים רק על דלת הארון, והיא נפתחת ונסגרת כרגיל. אין צורך בכיסוי קבוע או במסגרת שמסתירה את הלוח.",
        },
        {
          heading: "כמה טפט צריך",
          text: "מודדים גובה ורוחב של דלת הארון, ומוסיפים כמה סנטימטרים לכל צד לקיפול. מתאים גם לארון תקשורת.",
        },
      ],
      ctaTitle: "רוצים כניסה אחידה?",
      ctaText: "אפשר להזמין את אותו גוון לדלת הכניסה ולארון החשמל, כדי שכל הכניסה תיראה כמו יחידה אחת.",
      ctaLabel: "לטפטים לדלת",
      faq: [
        { question: "הארון נשאר נגיש אחרי החיפוי?", answer: "כן. מדביקים על הדלת של הארון בלבד, והיא נפתחת ונסגרת כרגיל." },
        { question: "זה מתאים גם לארון תקשורת?", answer: "כן. הטפט נדבק על כל דלת ארון עם משטח חלק ונקי, כולל ארון תקשורת." },
        { question: "אפשר להתאים את הארון לדלת הכניסה?", answer: "כן. אפשר להזמין את אותו גוון לדלת ולארון החשמל, כדי שהכניסה תיראה אחידה." },
        { question: "כמה חומר צריך לארון חשמל?", answer: "מודדים גובה ורוחב של דלת הארון ומוסיפים כמה סנטימטרים לכל צד לקיפול." },
      ],
    },
  },
  {
    slug: "pvc_rug",
    label: "שטיחי PVC",
    ctaHref: "/חנות?cat=kitchen",
    defaults: {
      metaTitle: "שטיח PVC למטבח | שטיחי פי וי סי מעוצבים | סולודור",
      metaDescription: "שטיחי PVC (פי וי סי) למטבח, לסלון ולחדרי ילדים. דקים, לא סופגים נוזלים ומתנקים במטלית לחה. מגוון עיצובים ומידות, משלוח עד הבית.",
      title: "שטיחי PVC למטבח ולבית",
      intro: "שטיחי פי וי סי דקים ועמידים שלא סופגים נוזלים ומתנקים במטלית לחה. מושלמים למטבח, לכניסה, לסלון ולחדרי ילדים.",
      guideTitle: "למה שטיח PVC מתאים למטבח",
      blocks: [
        {
          heading: "לא סופג ומתנקה בשנייה",
          text: "משטח ה-PVC לא סופג נוזלים, אז כתם של קפה או רוטב יורד במטלית לחה. זה בדיוק מה שצריך במטבח, ליד הכיור והכיריים, ובבית עם ילדים וחיות מחמד.",
        },
        {
          heading: "דק ושטוח",
          text: "עובי השטיח 2.5 מ\"מ, כך שהוא נשאר שטוח על הרצפה ולא מתקפל בפינות. כדאי להניח אותו על משטח ישר, נקי ויבש.",
        },
        {
          heading: "עיצובים ומידות",
          text: "יש מגוון עיצובים, מפרקט ופישבון ועד טרוורטין ועיצובים קלאסיים, בכמה מידות קבועות. צריכים מידה אחרת? אפשר לבדוק איתנו ייצור במידה אישית.",
        },
      ],
      ctaTitle: "מחדשים גם את המטבח?",
      ctaText: "לצד השטיח אפשר לחדש את חזיתות המטבח בטפט בהדבקה עצמית, בלי שיפוץ.",
      ctaLabel: "לטפטים למטבח",
      faq: [
        { question: "איך מנקים שטיח PVC?", answer: "לניקוי שוטף מספיק לנגב במטלית לחה ובמים. אין להשתמש באקונומיקה, בחומרים עם אלכוהול, במסירי שומנים חריפים או בסקוטש מחוספס." },
        { question: "השטיח מתאים למטבח?", answer: "כן. משטח ה-PVC לא סופג נוזלים וקל לניקוי, ולכן הוא מתאים במיוחד למטבח ולאזורים עם לכלוך והתזות." },
        { question: "השטיח מחליק?", answer: "רמת האחיזה תלויה בסוג הרצפה ובמצבה. מומלץ להניח את השטיח על משטח ישר, נקי ויבש." },
        { question: "אפשר להזמין מידה אישית?", answer: "בנוסף למידות הקבועות, אפשר לבדוק אפשרות לייצור במידה אישית בהתאם למגבלות הייצור." },
        { question: "מה העובי של השטיח?", answer: "2.5 מ\"מ, כך שהוא דק ונשאר שטוח על הרצפה." },
      ],
    },
  },
];

export const categoryKey = (slug: string) => `category.${slug}`;
export const CATEGORY_SLUGS = PAGES.map((p) => p.slug);
export const categoryHref = (slug: string) => `/חנות?cat=${slug}`;

const defFor = (p: CategoryPage): SectionDef => ({ key: categoryKey(p.slug), title: `עמוד קטגוריה: ${p.label}`, page: categoryHref(p.slug), fields: FIELDS });

/** For the admin: one editable section per category page. */
export const CATEGORY_SECTIONS = PAGES.map((p) => ({ def: defFor(p), defaults: p.defaults }));

/** The page of a category slug, or undefined for a category without a landing page of its own. */
export const categoryPage = (slug: string | undefined) => PAGES.find((p) => p.slug === slug);

/** The category's content in force: the admin's published edit over the defaults. Usable in head() and in render. */
export function categoryContent(slug: string, content: SiteContent | undefined): CategoryContent | undefined {
  const page = categoryPage(slug);
  if (!page) return undefined;
  return mergeSection(defFor(page), page.defaults, effectiveContent(content)[categoryKey(slug)]);
}

/**
 * The category page the shop is showing, if any: exactly one category with a landing page, opened as an archive,
 * and no style, colour or "recommended" filter on top (those views keep their computed headings).
 */
export function landingSlug(filters: { archive: boolean; cats: string[]; styles: string[]; colors: string[]; recommended: boolean }) {
  if (!filters.archive || filters.cats.length !== 1 || filters.styles.length || filters.colors.length || filters.recommended) return undefined;
  return categoryPage(filters.cats[0])?.slug;
}

export const categorySectionDef = (slug: string) => {
  const page = categoryPage(slug);
  return page ? defFor(page) : undefined;
};
