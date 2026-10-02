/** Content for the "ציפוי מטבחים" page. Source copy: docs/old-site/kitchen-coating.md */

import type { Product } from "../data";
import type { IconName } from "../icon-data";

const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;

/** Route path. Must stay identical to the old site's URL — the page ranks #1 on it. */
export const KITCHEN_PATH = "/ציפוי-מטבחים";

/** The same kitchen in each coating, in slideshow order. */
export const kitchenModels = [
  { name: "אבן בהירה", img: img("use-kitchen") },
  { name: "טיח אפור פחם", img: img("var-kitchen-charcoal") },
  { name: "ירוק פיסטוק", img: img("var-kitchen-green") },
  { name: "כחול מעושן", img: img("var-kitchen-blue") },
  { name: "דמוי נירוסטה", img: img("var-kitchen-steel") },
];

export const kitchenSeo = {
  title: "ציפוי מטבחים",
  description:
    "ציפוי מטבחים בהדבקת טפט איכותי: חידוש המטבח ביום עבודה אחד, בלי לכלוך, בלי אבק ובלי שיפוץ. עמיד לחום, אדים ולחות. סולודור, שירות בפריסה רחבה, מצפון ועד דרום.",
};

/* ───────────── "רוצים טפט חדש למטבח?" ───────────── */

export const KITCHEN_INTRO_IMG = img("use-kitchen");

export const kitchenBenefits = [
  "מראה חדש ומרגש למטבח",
  "תחושה חמה ומשפחתית יותר",
  "שדרוג מהיר בלי להפוך את הבית לאתר בנייה",
  "חיסכון של עשרות אלפי שקלים",
  "יחס אישי ושירות מכל הלב",
];

export const kitchenAudiences: { icon: IconName; label: string }[] = [
  { icon: "Sofa", label: "משפחות עם ילדים" },
  { icon: "Heart", label: "זוגות צעירים" },
  { icon: "Home", label: "בתים פרטיים ודירות" },
  { icon: "DoorOpen", label: "דירות שכורות" },
  { icon: "Tag", label: "נכסים לפני מכירה או השכרה" },
  { icon: "Building", label: "משרדים ומוסדות" },
];

export const kitchenQuality: { icon: IconName; label: string }[] = [
  { icon: "ShieldCheck", label: "עמידות גבוהה לחום, אדים ולחות" },
  { icon: "Brush", label: "ניקוי קל עם מטלית" },
  { icon: "LayerGroup", label: "חומר איכותי שלא מתקלף" },
  { icon: "BadgeCheck", label: "הדבקה מקצועית וגימור מושלם" },
  { icon: "Palette", label: "מגוון רחב של עיצובים" },
];

/* ───────────── "מה תקבלו מאיתנו?" ───────────── */

/** Photos are real SOLODOOR kitchen jobs taken from the old site. */
export const kitchenValues = [
  {
    title: "שירות",
    img: img("kitchen-work-01"),
    alt: "ציפוי מטבחים בגוון אפור כהה, עבודה של סולודור",
    text: [
      "שירות אישי, חם ואנושי הוא עבורנו מעל לכל ערך, וזה גם מה שמאפשר לנו לתת לך את הטיפול המקצועי הטוב ביותר. אנחנו מאמינים שקשר אנושי ישיר וטוב הוא המפתח לכל הצלחה.",
      "לכן אנחנו לא מתפשרים בשום צורה על השירות שאנו מספקים ללקוחותינו, לא היום ולא אף פעם.",
    ],
  },
  {
    title: "ניסיון",
    img: img("kitchen-work-10"),
    alt: "ציפוי מטבחים בגוון ירוק, עבודה של סולודור",
    text: [
      "ניסיוננו העשיר בתחום לימד אותנו כי הדבר החשוב ביותר הוא להתאים את השירות שאנו מספקים באופן פרטני עבור כל לקוח.",
      "כבר בשיחת ההיכרות ניתן תשומת לב עליונה למה שבאמת מעניין אותך, נבין את הייחודיות שלך ושל המקום שלך, ורק אז נפעל, כי אנחנו מאמינים שרק הקשבה אמיתית לצרכי הלקוח מביאה לתוצאה הרצויה.",
    ],
  },
  {
    title: "חדשנות",
    img: img("kitchen-work-07"),
    alt: "ציפוי מטבחים בגוון כחול כהה, עבודה של סולודור",
    text: [
      "אנו מעודכנים תמיד בטרנדים הלוהטים ביותר, ועובדים בשיתוף מלא ורציף עם אנשים מובילים בתחום העיצוב.",
      "אצלנו תמצאו ציפוי בגדר אומנות, כזה שירענן לכם את התחושה של הבית, וכל זה במחירים הוגנים ומפתיעים שמתאימים לכל כיס.",
    ],
  },
];

/* ───────────── Catalogue ───────────── */

/** The kitchen catalogue PDF, carried over from the old site. */
export const KITCHEN_CATALOG_PDF = `${import.meta.env.BASE_URL}catalog/kitchen-catalog.pdf`;

/**
 * PLACEHOLDERS. Names, prices and the missing photos are stand-ins until the
 * products come from the shop database.
 */
export const kitchenProducts: Product[] = [
  { name: "מטבח אבן בהירה", price: "₪319", img: img("use-kitchen") },
  { name: "מטבח טיח אפור פחם", price: "₪329", img: img("var-kitchen-charcoal") },
  { name: "מטבח ירוק פיסטוק", price: "₪319", img: img("var-kitchen-green") },
  { name: "מטבח כחול מעושן", price: "₪319", img: img("var-kitchen-blue") },
  { name: "מטבח דמוי נירוסטה", price: "₪339", img: img("var-kitchen-steel") },
  { name: "מטבח אלון טבעי", price: "₪329", img: null },
  { name: "מטבח לבן פודרה", price: "₪299", img: null },
  { name: "מטבח שחור מט", price: "₪329", img: null },
];

/* ───────────── Before / after ───────────── */

/**
 * Real SOLODOOR kitchen jobs. Each "after" is the customer's photo. Each "before"
 * is that same photo with the cabinet fronts recoloured to the original finish
 * (generated, guided by the real before-photo), so the two frames line up
 * exactly under the slider.
 */
export const kitchenBeforeAfter = [1, 2, 3, 4, 5].map((n, i) => ({
  ...[
    { name: "מטבח אפור כהה", desc: "מכתום וירוק לאפור כהה במראה מט" },
    { name: "מטבח כחול כהה", desc: "מגוון שמנת לכחול כהה ועמוק" },
    { name: "מטבח ירוק מרווה", desc: "מלבן ישן לירוק מרווה רגוע" },
    { name: "מטבח לבן", desc: "מעץ צהבהב ללבן נקי ובהיר" },
    { name: "מטבח בגוון אבן", desc: "מחום כהה לגוון אבן בהיר" },
  ][i],
  before: img(`kitchen-ba-${n}-before`),
  after: img(`kitchen-ba-${n}-after`),
}));
