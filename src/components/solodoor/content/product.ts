/**
 * Texts of the product page that are not part of a product: the installation block under "התקנה".
 * The defaults are exactly the texts the page shows today. The prices and the number of days are never typed:
 * the texts hold {double}, {single} and {days}, which the page fills with the current values (prices from the
 * installation add-on, days from the installation terms), so a price change in the admin still reaches the text.
 */
import type { FieldDef, SectionDef } from "./sections";

const T = (name: string, label: string, hint?: string): FieldDef => ({ name, label, type: "text", hint });
const A = (name: string, label: string, hint?: string): FieldDef => ({ name, label, type: "textarea", hint });

/** A door product that offers installation, which the visual editor opens. */
export const PRODUCT_PAGE = "/product/אבן-בהירה-חם";

const PLACEHOLDERS = "אפשר לכתוב {double} (מחיר דלת משני הצדדים), {single} (מחיר דלת מצד אחד) ו-{days} (ימי העסקים להתקנה). האתר מחליף אותם בערך העדכני, כך ששינוי מחיר במחירון מתעדכן גם כאן.";

export const PRODUCT_INSTALL: SectionDef = {
  key: "product.install",
  title: "התקנה בדף מוצר",
  page: PRODUCT_PAGE,
  fields: [
    T("heading", "כותרת הבלוק"),
    T("checkTitle", "כותרת תיבת הסימון"),
    A("checkText", "הטקסט הארוך מתחת לכותרת", PLACEHOLDERS),
    T("splitTitle", "כותרת חלוקת ההתקנה", "מופיעה כשמזמינים שלושה צדדים ויותר עם התקנה."),
    A("splitText", "הסבר על חלוקת ההתקנה"),
    T("doubleLabel", "שורה: דלתות עם שני צדדים"),
    T("doubleNote", "תיאור המחיר שלה", "אפשר לכתוב {double}."),
    T("singleLabel", "שורה: דלתות עם צד אחד"),
    T("singleNote", "תיאור המחיר שלה", "אפשר לכתוב {single}."),
    T("totalLabel", "שורת הסיכום"),
    T("termsLink", "קישור לתנאי ההתקנה"),
    T("stripsHint", "הערה כשלא נבחרה התקנה", "מופיעה במוצרים שאפשר להוסיף להם פסים."),
  ],
};

export const PRODUCT_INSTALL_DEFAULTS = {
  heading: "התקנה",
  checkTitle: "אני רוצה התקנה מקצועית",
  checkText: "מתקין של סולודור מגיע אליכם עם החומר, בלי דמי משלוח. {double} לדלת סטנדרטית משני הצדדים, {single} לדלת מצד אחד. ההתקנה מתבצעת תוך {days} ימי עסקים.",
  splitTitle: "איך תרצו לחלק את ההתקנה?",
  splitText: "בחרו כמה דלתות יצופו משני הצדדים. יתר הצדדים יותקנו על דלתות נפרדות.",
  doubleLabel: "דלתות עם שני צדדים",
  doubleNote: "{double} להתקנת דלת",
  singleLabel: "דלתות עם צד אחד",
  singleNote: "{single} להתקנת דלת",
  totalLabel: 'סה"כ התקנה',
  termsLink: "לתנאי ההתקנה המלאים בתקנון",
  stripsHint: "בהתקנה על ידי סולודור אפשר להוסיף לדלת עיצוב פסים.",
};

/** The text with its placeholders replaced by the current values. */
export const fillInstallText = (text: string, v: { double: string; single: string; days: number }) =>
  text.replaceAll("{double}", v.double).replaceAll("{single}", v.single).replaceAll("{days}", String(v.days));

export const PRODUCT_SECTIONS: { def: SectionDef; defaults: Record<string, string> }[] = [{ def: PRODUCT_INSTALL, defaults: PRODUCT_INSTALL_DEFAULTS }];
