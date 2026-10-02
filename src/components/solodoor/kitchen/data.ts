/** Content for the "ציפוי מטבחים" page. Source copy: docs/old-site/kitchen-coating.md */

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
