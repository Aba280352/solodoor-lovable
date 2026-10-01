import type { IconName } from "./icon-data";

/** BASE_URL is "/" everywhere except the GitHub Pages preview, which lives under /solodoor-lovable/. */
const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;

export const LOGO_SRC = `${import.meta.env.BASE_URL}images/logo.svg`;

export const promoItems: { icon: IconName; label: string }[] = [
  { icon: "Truck", label: "שירות מצפון ועד דרום" },
  { icon: "Palette", label: "מעל 200 עיצובים ייחודיים" },
  { icon: "ChatDots", label: "ייעוץ חינם וללא התחייבות" },
  { icon: "Brush", label: "התקנה מקצועית ומדויקת" },
];

export const navLinks = [
  "בית",
  "מאמרים",
  "ציפוי מטבחים",
  "ציפוי דלתות",
  "אודות",
  "שאלות נפוצות",
  "יצירת קשר",
  "תהליך",
];

export interface MenuItem {
  name: string;
  img: string;
}

export const styleMenu: MenuItem[] = [
  { name: "עצים", img: img("style-wood") },
  { name: "חלקים", img: img("style-plain") },
  { name: "דמויי אבן ובטון", img: img("style-stone") },
  { name: "הנמכרים ביותר", img: img("style-black") },
];

export const useMenu: MenuItem[] = [
  { name: "טפטים מעוצבים לדלת", img: img("use-door-designed") },
  { name: "טפטים עמידים לדלת", img: img("use-door-durable") },
  { name: "טפטים לארונות חשמל", img: img("use-electric") },
  { name: "טפטים למקרר", img: img("use-fridge") },
  { name: "טפטים לקיר", img: img("use-wall") },
  { name: "טפטים לשיש", img: img("use-counter") },
  { name: "טפטים למטבח", img: img("use-kitchen") },
];

export const heroSlides = [
  { tag: "ציפוי דלתות", l1: "מחדשים את הדלת,", l2: "משדרגים את כל הכניסה", img: img("hero-door") },
  { tag: "ציפוי מטבחים", l1: "אותו מטבח.", l2: "יום עבודה אחד.", img: img("hero-kitchen") },
  { tag: "ציפוי שיש", l1: "משטח חדש.", l2: "בלי לפרק כלום.", img: img("hero-counter-2") },
  { tag: "ציפוי מקררים", l1: "המקרר נשאר.", l2: "המראה מתחדש.", img: img("hero-fridge") },
  { tag: "ציפוי ארונות חשמל", l1: "ארון החשמל", l2: "נעלם בתוך העיצוב.", img: img("hero-electric") },
  { tag: "ציפוי קירות", l1: "קיר אחד משנה", l2: "את כל החדר.", img: img("hero-wall") },
  { tag: "שטיחי PVC", l1: "שטיח שמחזיק", l2: "את קצב המטבח.", img: img("hero-rug") },
];

export const heroTrust: { icon: IconName; label: string }[] = [
  { icon: "ChatDots", label: "ייעוץ חינם וללא התחייבות" },
  { icon: "LayerGroup", label: "מעל 200 עיצובים לבחירה" },
  { icon: "MapPin", label: "התקנה מקצועית בפריסה רחבה" },
];

/** `variant` is the alternate look that fades in while the card is hovered. */
export const categories = [
  { name: "טפטים עמידים לדלת", img: img("use-door-durable"), variant: img("var-door-charcoal") },
  { name: "טפטים מעוצבים לדלת", img: img("use-door-designed"), variant: img("var-door-floral") },
  { name: "טפט לקיר", img: img("use-wall"), variant: img("var-wall-charcoal") },
  { name: "טפט לארון חשמל", img: img("use-electric"), variant: img("var-electric-charcoal") },
  { name: "טפט למקרר", img: img("use-fridge"), variant: img("var-fridge-charcoal") },
  { name: "טפט למטבח", img: img("use-kitchen"), variant: img("var-kitchen-charcoal") },
  { name: "טפט לשיש", img: img("use-counter"), variant: img("var-counter-charcoal") },
  { name: "שטיח PVC מעוצב", img: img("cat-pvc-rug"), variant: img("var-rug-fishbone") },
];

/** `swatches[0]` is always the default image of the card. */
export const styleFamilies = [
  {
    name: "חלקים",
    desc: "מראה נקי ומודרני לכל חלל",
    swatches: [img("style-plain"), img("plain-sd943"), img("plain-sd873"), img("style-black")],
  },
  {
    name: "עצים",
    desc: "חום טבעי שמכניס אופי לבית",
    swatches: [img("style-wood"), img("wood-it127"), img("wood-it248"), img("wood-it616")],
  },
  {
    name: "דמויי אבן ובטון",
    desc: "טקסטורות טבעיות ועכשוויות",
    swatches: [img("style-stone"), img("stone-ipw557"), img("stone-501"), img("stone-cr200")],
  },
  {
    name: "מומלצים",
    desc: "הדגמים הכי נבחרים אצלנו",
    swatches: [img("style-black"), img("style-wood"), img("style-stone"), img("style-plain")],
  },
];

export const diySteps: { num: string; icon: IconName; label: string }[] = [
  { num: "01", icon: "Expand", label: "מודדים ובודקים" },
  { num: "02", icon: "Palette", label: "בוחרים טפט" },
  { num: "03", icon: "Brush", label: "מכינים ומדביקים" },
];

export const diyTools = [
  { name: "קלף הדבקה", img: img("diy-tool-squeegee") },
  { name: "סכין חיתוך", img: img("diy-tool-knife") },
  { name: "סיליקון לשיש", img: img("diy-tool-silicone") },
];

export const DIY_BG = img("diy-bg");
export const DIY_VIDEO = img("diy-video");

export const aboutSurfaces = ["דלתות", "מטבחים", "מקררים", "ארונות", "שיש", "קירות"];

export const aboutStats: { icon: IconName; label: string }[] = [
  { icon: "ShieldCheck", label: "הגנה מפני שריטות" },
  { icon: "Palette", label: "עמידות בפני דהיית צבע" },
  { icon: "Home", label: "חידוש בלי פירוק ובלי אבק" },
];

export const aboutGallery = [
  { src: img("hero-counter-2"), alt: "ציפוי שיש" },
  { src: img("hero-door"), alt: "ציפוי דלת" },
  { src: img("hero-electric"), alt: "ציפוי ארון חשמל" },
  { src: img("hero-wall"), alt: "ציפוי קיר" },
];

export const processSteps = [
  { num: "01", name: "בוחרים איך להתחיל", desc: "שאלון AI או כניסה ישירה לקטגוריה המתאימה.", img: img("process-1") },
  { num: "02", name: "מוצאים את הדגם", desc: "בוחרים צבע, טקסטורה וסגנון מתוך הקטלוג.", img: img("process-5") },
  { num: "03", name: "מתאימים להזמנה", desc: "בוחרים מידה, כמות ואביזרים משלימים לפי הצורך.", img: img("process-3") },
  { num: "04", name: "משלימים רכישה", desc: "מוסיפים לעגלה או משאירים פרטים לייעוץ ללא התחייבות.", img: img("process-2") },
  { num: "05", name: "מחדשים את החלל", desc: "מקבלים מראה חדש, נקי ומעוצב בלי פירוק מיותר.", img: img("process-4") },
];

export const beforeAfterPairs = [
  { name: "דלת כניסה", desc: "ציפוי דלת קיימת במראה עץ טבעי", before: img("ba-door1-before"), after: img("ba-door1-after") },
  { name: "דלת כניסה", desc: "ציפוי בגימור שחור מט עם פסי אלומיניום", before: img("ba-door2-before"), after: img("ba-door2-after") },
  { name: "חידוש מקרר", desc: "ציפוי מקרר בגוון גרפיט מט, ללא החלפה", before: img("ba-fridge-before"), after: img("ba-fridge-after") },
];

export const beforeAfterFigures = [
  { to: 200, suffix: "+", label: "עיצובים ייחודיים" },
  { to: 10, suffix: "", label: "שנות ניסיון בתחום" },
  { to: 1, suffix: "", label: "יום עבודה להתקנה" },
  { to: 100, suffix: "%", label: "פריסה רחבה" },
];

export interface Product {
  name: string;
  price: string;
  /** null = no photo supplied yet; the card shows a labelled placeholder. */
  img: string | null;
}

export const bestSellers: { tab: string; items: Product[] }[] = [
  {
    tab: "טפטים עמידים לדלת",
    items: [
      { name: "שחור מט אלגנטי", price: "₪249", img: img("style-black") },
      { name: "אלון טבעי", price: "₪269", img: img("style-wood") },
      { name: "בטון בהיר", price: "₪249", img: img("stone-ipw557") },
      { name: "אבן בהירה חמה", price: "₪259", img: img("style-stone") },
    ],
  },
  {
    tab: "טפטים מעוצבים לדלת",
    items: [
      { name: "מונקו שמנת", price: "₪289", img: img("use-door-designed") },
      { name: "אבן דקורטיבית 501", price: "₪279", img: img("stone-501") },
      { name: "לבן פסים SD943", price: "₪259", img: img("plain-sd943") },
      { name: "דגם מעוצב חדש", price: "₪299", img: null },
    ],
  },
  {
    tab: "טפט לקיר",
    items: [
      { name: "קיר אבן בהירה", price: "₪199", img: img("use-wall") },
      { name: "טיח מעונן CR200", price: "₪189", img: img("stone-cr200") },
      { name: "קיר בטון אפור", price: "₪199", img: null },
      { name: "קיר עץ אנכי", price: "₪219", img: null },
    ],
  },
  {
    tab: "טפט לארון חשמל",
    items: [
      { name: "ארון אבן בהירה", price: "₪149", img: img("use-electric") },
      { name: "ארון לבן חם", price: "₪139", img: null },
      { name: "ארון שחור מט", price: "₪149", img: null },
      { name: "ארון דמוי עץ", price: "₪159", img: null },
    ],
  },
  {
    tab: "טפט למקרר",
    items: [
      { name: "מקרר אבן בהירה", price: "₪229", img: img("use-fridge") },
      { name: "מקרר גרפיט מט", price: "₪239", img: img("ba-fridge-after") },
      { name: "מקרר לבן וניל", price: "₪219", img: null },
      { name: "מקרר דמוי נירוסטה", price: "₪249", img: null },
    ],
  },
  {
    tab: "טפט למטבח",
    items: [
      { name: "מטבח אבן בהירה", price: "₪319", img: img("use-kitchen") },
      { name: "מטבח אלון IT127", price: "₪329", img: img("wood-it127") },
      { name: "מטבח לבן פודרה", price: "₪299", img: null },
      { name: "מטבח שחור מט", price: "₪329", img: null },
    ],
  },
  {
    tab: "טפט לשיש",
    items: [
      { name: "שיש אבן בהירה", price: "₪269", img: img("use-counter") },
      { name: "שיש לבן עדין", price: "₪279", img: img("stone-501") },
      { name: "שיש שחור עם גידים", price: "₪289", img: null },
      { name: "שיש בז׳ טבעי", price: "₪269", img: null },
    ],
  },
  {
    tab: "שטיחי PVC",
    items: [
      { name: "שטיח PVC מעוצב", price: "₪199", img: img("cat-pvc-rug") },
      { name: "שטיח PVC אדרה", price: "₪219", img: img("var-rug-fishbone") },
      { name: "שטיח PVC גאומטרי", price: "₪209", img: null },
      { name: "שטיח PVC טבעי", price: "₪199", img: null },
    ],
  },
];

/** `color` is the reviewer's Google avatar colour — data, not a brand token. */
export const reviews = [
  { name: "ניב אמזלג", date: "28/05/2026", color: "#C5221F", text: "10 מתוך 10, עבודה מדויקת." },
  {
    name: "לירוי שוורץ",
    date: "28/05/2026",
    color: "#A142F4",
    text: "לא האמנתי שאפשר להגיע לכזאת תוצאה עם ציפוי. הדלת היתה ישנה, מקולפת וחלודה בבסיס, והיום היא נראית כאילו יצאה מהיצור.",
  },
  {
    name: "מעין פלשימן",
    date: "31/05/2026",
    color: "#1A73E8",
    text: "הגיעו קצת באיחור של חצי שעה בגלל פקקים, אבל יואב ישר התנצל. הדלת יצאה מושלמת אז הכל נסלח.",
  },
];

export const REVIEW_COUNT = 52;
export const GOOGLE_WORDMARK = img("google-wordmark");
export const GOOGLE_MARK = img("google-mark");

export const faqItems = [
  { q: "איך מתבצעת ההתקנה?", a: "לאחר בחירת הדגם והמידות, הציפוי מותקן בצורה מקצועית בבית הלקוח, עם גימור נקי ומדויק." },
  { q: "איך מודדים נכון לפני הזמנה?", a: "אפשר להיעזר במדריך המדידה או לשלוח תמונה ומידות משוערות כדי שנוכל לכוון אתכם בצורה נכונה." },
  { q: "האם הציפוי עמיד לאורך זמן?", a: "כן. הציפויים נבחרים לשימוש יומיומי, עם עמידות טובה ושמירה על מראה אסתטי לאורך זמן." },
  { q: "כמה זמן לוקח התהליך?", a: "משך התהליך משתנה לפי סוג המשטח והיקף העבודה, אך המטרה היא לייצר תהליך נוח, מדויק ויעיל." },
  { q: "איך שומרים על הציפוי?", a: "ניקוי עדין במטלית לחה ושימוש נכון ישמרו על מראה נקי, אסתטי ועמיד לאורך זמן." },
  { q: "האם זה מתאים גם למטבחים ולמקררים?", a: "כן. יש פתרונות ייעודיים גם לדלתות, מטבחים, מקררים ומשטחים נוספים בבית." },
];

/** One image per FAQ item; it cross-fades to match the last question opened. */
export const faqImages = [
  img("use-door-designed"),
  img("use-kitchen"),
  img("use-fridge"),
  img("use-electric"),
  img("use-wall"),
  img("use-door-durable"),
];

export const articles = [
  {
    title: "פתרונות לשדרוג רהיטים ללא שיפוץ שמחזירים לבית מראה חדש",
    img: img("use-counter"),
    excerpt: "פתרונות לשדרוג רהיטים ללא שיפוץ מאפשרים לחדש ארונות, שולחנות ודלתות בבית, בעלות נמוכה, בלי אבק, פירוק והוצאות מיותרות.",
  },
  {
    title: "פורניר מול פולימר – מה נכון לדלת שלכם?",
    img: img("process-5"),
    excerpt: "פורניר מול פולימר: השוואה פשוטה בין מראה, עמידות, תחזוקה ועלות, כדי לבחור חיפוי לדלתות שמתאים לבית, לתקציב ולאופן השימוש.",
  },
  {
    title: "PVC מול מדבקה: איזה חיפוי באמת מחזיק בבית?",
    img: img("process-3"),
    excerpt: "PVC מול מדבקה: כך בוחרים חיפוי עמיד לדלתות, ארונות וקירות בבית. הכירו את ההבדלים בחומר, בעמידות, במראה ובהתקנה.",
  },
  {
    title: "מדריך לבחירת גימור לדלת כניסה שנראה נכון",
    img: img("ba-door1-after"),
    excerpt: "מדריך לבחירת גימור לדלת כניסה: כך מתאימים צבע, מרקם וחומר עמיד לבית ולאווירה שלכם, בלי להחליף את הדלת ובלי שיפוץ יקר.",
  },
  {
    title: "כמה זמן מחזיק טפט? כך שומרים על חיפוי יפה",
    img: img("use-wall"),
    excerpt: "כמה זמן מחזיק טפט בבית? התשובה תלויה בחומר, בשטח, בהתקנה ובתחזוקה. כך תבחרו חיפוי עמיד ותשמרו על מראה חדש לאורך זמן.",
  },
  {
    title: "חידוש ארון מול החלפה – מה באמת משתלם לבית?",
    img: img("use-kitchen"),
    excerpt: "חידוש ארון מול החלפה: מתי ציפוי איכותי חוסך כסף וזמן, מתי הארון דורש החלפה, ואיך בוחרים גימור עמיד ומדויק לאורך שנים.",
  },
];

/* ───────────── Guidance quiz ───────────── */

export const quizAreas = [
  { label: "דלתות", key: "door", img: img("use-door-durable"), price: "₪259" },
  { label: "מטבח", key: "kitchen", img: img("use-kitchen"), price: "₪319" },
  { label: "מקרר", key: "fridge", img: img("use-fridge"), price: "₪229" },
  { label: "ארון חשמל", key: "electric", img: img("use-electric"), price: "₪149" },
  { label: "קיר", key: "wall", img: img("use-wall"), price: "₪199" },
  { label: "שיש", key: "counter", img: img("use-counter"), price: "₪269" },
] as const;

export const quizStyles = ["חלק ונקי", "מראה עץ", "אבן / שיש / בטון", "מעוצב ודקורטיבי"] as const;

export type QuizArea = (typeof quizAreas)[number]["label"];
export type QuizStyle = (typeof quizStyles)[number];

export interface QuizModel {
  name: string;
  price: string;
  img: string | null;
}

/** The three models offered for an area + style pair (step 3 of the quiz). */
export function pickQuizModels(areaLabel: QuizArea | undefined, style: QuizStyle | undefined): QuizModel[] {
  const area = quizAreas.find((a) => a.label === areaLabel) ?? quizAreas[0];
  const variant = (color: string) => img(`var-${area.key}-${color}`);
  const byStyle: Record<QuizStyle, [string, string | null][]> = {
    "חלק ונקי": [
      ["לבן חם SD872", area.img],
      ["דמוי נירוסטה", variant("steel")],
      ["לבן פודרה SD873", null],
    ],
    "מראה עץ": [
      ["אלון טבעי IT232", null],
      ["אגוז כהה IT127", null],
      ["עץ מעושן IT616", null],
    ],
    "אבן / שיש / בטון": [
      ["טיח אפור פחם", variant("charcoal")],
      ["אבן בהירה IPW557", area.img],
      ["בטון אפור IPW558", null],
    ],
    "מעוצב ודקורטיבי": [
      ["ירוק פיסטוק", variant("green")],
      ["כחול מעושן", variant("blue")],
      ["דגם דקורטיבי 501", null],
    ],
  };
  return byStyle[style ?? "חלק ונקי"].map(([name, src]) => ({
    name: `${name} · ${area.label}`,
    img: src,
    price: area.price,
  }));
}

/* ───────────── Footer ───────────── */

export const FOOTER_BANNER = img("footer-door");
export const PAYMENTS_SRC = img("payments");
export const TEXTURE_SRC = img("texture-seamless");

export const footerSocial: { label: string; icon: IconName }[] = [
  { label: "אינסטגרם", icon: "ImageGallery" },
  { label: "וואטסאפ", icon: "ChatDots" },
  { label: "פייסבוק", icon: "CommentDots" },
  { label: "יוטיוב", icon: "Headphones" },
];

export const footerContact: { icon: IconName; value: string; dir: "ltr" | "rtl" }[] = [
  { icon: "Phone", value: "054-8999-961", dir: "ltr" },
  { icon: "Envelope", value: "soloodoor@gmail.com", dir: "ltr" },
  { icon: "MapPin", value: "מצפון ועד דרום", dir: "rtl" },
  { icon: "Clock", value: "א'–ה' 09:00–19:00 | ו' 09:00–13:00", dir: "ltr" },
];

export const footerColumns = [
  { title: "מפת אתר", links: ["דף הבית", "אודות", "ציפוי דלתות", "גלריה", "מאמרים", "צור קשר"] },
  {
    title: "קטגוריות",
    links: ["טפטים לדלת", "טפטים מעוצבים לדלת", "טפט לקיר", "טפט לארון חשמל", "טפט למקרר", "טפט למטבח", "טפט לשיש", "שטיח PVC מעוצב"],
  },
];

export const footerLegal = ["הצהרת נגישות", "מדיניות פרטיות", "תנאי שימוש"];

/* ───────────── Quantity calculator ───────────── */

/**
 * ASSUMPTION — replace with the real roll width of the product.
 * The calculator cuts the covered width into vertical strips of this width.
 */
export const ROLL_WIDTH_CM = 122;

/** Extra material added for cuts and mistakes when the user keeps the option on. */
export const WASTE_RATE = 0.1;
