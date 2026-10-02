/** Content for the "ציפוי דלתות" landing page (built for paid search traffic). */

const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;

export const doorsSeo = {
  title: "ציפוי דלתות | סולודור",
  description:
    "ציפוי דלתות בציפוי פולימרי עבה ועמיד, עם שכבת הגנה מפני שריטות ודהיית צבע. מעל 200 עיצובים ייחודיים, התקנה מדויקת ומקצועית בבית הלקוח, שירות מצפון ועד דרום.",
};

/** The same entrance door in each coating. `swatch` is where the door surface sits in the photo. */
export const doorFinishes = [
  { name: "אבן בהירה", img: img("use-door-durable") },
  { name: "טיח אפור פחם", img: img("var-door-charcoal") },
  { name: "ירוק פיסטוק", img: img("var-door-green") },
  { name: "כחול מעושן", img: img("var-door-blue") },
  { name: "דמוי נירוסטה", img: img("var-door-steel") },
];

/**
 * Hotspots on the door photo. `x` and `y` are percentages of the image, measured
 * from its left and top edges; all five finishes share the same framing.
 */
export const doorHotspots = [
  {
    x: 56,
    y: 24,
    title: "ציפוי פולימרי עבה ועמיד",
    text: "ציפוי איכותי בתוספת שכבת הגנה מפני שריטות ודהיית צבע, שמחזיק בשימוש יומיומי.",
  },
  {
    x: 38,
    y: 53,
    title: "הידית והעינית חוזרות למקום",
    text: "מפרקים את הידית והעינית לפני ההדבקה ומחזירים אותן בסיום, כך שהציפוי יוצא חלק ורציף.",
  },
  {
    x: 64,
    y: 87,
    title: "פינות וקצוות מדויקים",
    text: "חיתוך מדויק בפינות הדלת וגימור נקי בקצוות. התקנה מדויקת ומקצועית בבית שלכם.",
  },
];

export const doorsTrust = ["מעל 200 עיצובים ייחודיים", "התקנה בבית הלקוח", "שירות מצפון ועד דרום"];
