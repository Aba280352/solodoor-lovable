import type { IconName } from "./icon-data";
import { whatsappHref } from "./whatsapp";

/** BASE_URL is "/" everywhere except the GitHub Pages preview, which lives under /solodoor-lovable/. */
const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;

export const LOGO_SRC = `${import.meta.env.BASE_URL}images/logo.svg`;

export const promoItems: { icon: IconName; label: string }[] = [
  { icon: "Truck", label: "שירות מצפון ועד דרום" },
  { icon: "Palette", label: "מעל 200 עיצובים ייחודיים" },
  { icon: "ChatDots", label: "ייעוץ חינם וללא התחייבות" },
  { icon: "Brush", label: "התקנה מקצועית ומדויקת" },
];

/** The PVC rugs are their own menu entry (they are not wallpaper); it opens the rugs archive. */
export const RUGS_LABEL = "שטיחי PVC";

/** The desktop menu row. "אודות" is left out so the row stays on one line; it is in the mobile menu and the footer. */
export const navLinks = [
  "בית",
  "מאמרים",
  "ציפוי מטבחים",
  "ציפוי דלתות",
  RUGS_LABEL,
  "שאלות נפוצות",
  "צור קשר",
];

export interface MenuItem {
  name: string;
  img: string;
}

export const styleMenu: MenuItem[] = [
  { name: "עצים", img: img("style-wood") },
  { name: "מומלצים", img: img("style-black") },
  { name: "חלקים", img: img("style-plain") },
  { name: "דמויי אבן ובטון", img: img("style-stone") },
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
  { tag: "ציפוי דלתות", cta: "לקולקציית ציפוי דלתות", l1: "מחדשים את הדלת,", l2: "משדרגים את כל הכניסה", img: img("hero-door") },
  { tag: "ציפוי מטבחים", cta: "לקולקציית ציפוי מטבחים", l1: "אותו מטבח.", l2: "יום עבודה אחד.", img: img("hero-kitchen") },
  { tag: "ציפוי שיש", cta: "לקולקציית טפט לשיש", l1: "משטח חדש.", l2: "בלי לפרק כלום.", img: img("hero-counter-2") },
  { tag: "ציפוי מקררים", cta: "לקולקציית ציפוי מקררים", l1: "המקרר נשאר.", l2: "המראה מתחדש.", img: img("hero-fridge") },
  { tag: "ציפוי ארונות חשמל", cta: "לקולקציית ציפוי ארונות חשמל", l1: "ארון החשמל", l2: "נעלם בתוך העיצוב.", img: img("hero-electric") },
  { tag: "ציפוי קירות", cta: "לקולקציית ציפוי קירות", l1: "קיר אחד משנה", l2: "את כל החדר.", img: img("hero-wall") },
  { tag: "שטיחי PVC", cta: "לקולקציית שטיחי PVC", l1: "שטיח שמחזיק", l2: "את קצב המטבח.", img: img("hero-rug") },
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
    swatches: [img("style-plain"), img("plain-white-stripes"), img("plain-powder-white"), img("style-black")],
  },
  {
    name: "עצים",
    desc: "חום טבעי שמכניס אופי לבית",
    swatches: [img("style-wood"), img("wood-antique"), img("wood-cherry"), img("wood-mahogany")],
  },
  {
    name: "דמויי אבן ובטון",
    desc: "טקסטורות טבעיות ועכשוויות",
    swatches: [img("style-stone"), img("stone-light-concrete"), img("stone-cloudy-grey"), img("stone-light-plaster")],
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
  { name: "להבים להחלפה", img: img("diy-tool-blades") },
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
  /** The product page the card opens; the shop when missing. */
  link?: { slug: string; search: { tab?: string; variant?: string } };
}

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
    title: "פורניר מול פולימר, מה נכון לדלת שלכם?",
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
    title: "חידוש ארון מול החלפה, מה באמת משתלם לבית?",
    img: img("use-kitchen"),
    excerpt: "חידוש ארון מול החלפה: מתי ציפוי איכותי חוסך כסף וזמן, מתי הארון דורש החלפה, ואיך בוחרים גימור עמיד ומדויק לאורך שנים.",
  },
];

/* ───────────── Guidance quiz ───────────── */

export const quizAreas = [
  { label: "דלתות", key: "door", img: img("use-door-durable") },
  { label: "מטבח", key: "kitchen", img: img("use-kitchen") },
  { label: "מקרר", key: "fridge", img: img("use-fridge") },
  { label: "ארון חשמל", key: "electric", img: img("use-electric") },
  { label: "קיר", key: "wall", img: img("use-wall") },
  { label: "שיש", key: "counter", img: img("use-counter") },
] as const;

export const quizStyles = ["חלק ונקי", "מראה עץ", "אבן / שיש / בטון", "מעוצב ודקורטיבי"] as const;

export type QuizArea = (typeof quizAreas)[number]["label"];
export type QuizStyle = (typeof quizStyles)[number];

/* ───────────── Footer ───────────── */

export const FOOTER_BANNER = img("footer-door");
export const PAYMENTS_SRC = img("payments");
export const TEXTURE_SRC = img("texture-seamless");

/** The social pages of the business, the same ones the old site links to. */
export const INSTAGRAM_URL = "https://www.instagram.com/sollodoor/";
export const FACEBOOK_URL = "https://www.facebook.com/solodoors/";
export const YOUTUBE_URL = "https://youtube.com/@Solodoor1";

export const footerSocial: { label: string; icon: IconName; href?: string }[] = [
  { label: "אינסטגרם", icon: "ImageGallery", href: INSTAGRAM_URL },
  { label: "וואטסאפ", icon: "ChatDots", href: whatsappHref() },
  { label: "פייסבוק", icon: "CommentDots", href: FACEBOOK_URL },
  { label: "יוטיוב", icon: "Headphones", href: YOUTUBE_URL },
];

export const footerContact: { icon: IconName; value: string; dir: "ltr" | "rtl" }[] = [
  { icon: "Phone", value: "054-8999-961", dir: "ltr" },
  { icon: "Envelope", value: "soloodoor@gmail.com", dir: "ltr" },
  { icon: "MapPin", value: "מצפון ועד דרום", dir: "rtl" },
  { icon: "Clock", value: "א' עד ה' 09:00 עד 19:00 | ו' 09:00 עד 13:00", dir: "rtl" },
];

export const footerColumns = [
  { title: "מפת אתר", links: ["דף הבית", "אודות", "ציפוי דלתות", "גלריה", "מאמרים", "שאלות נפוצות", "צור קשר"] },
  {
    title: "קטגוריות",
    links: ["טפטים לדלת", "טפטים מעוצבים לדלת", "טפט לקיר", "טפט לארון חשמל", "טפט למקרר", "טפט למטבח", "טפט לשיש", "שטיח PVC מעוצב"],
  },
];

export const footerLegal: { label: string; to: "/accessibility" | "/privacy-policy" | "/terms" }[] = [
  { label: "הצהרת נגישות", to: "/accessibility" },
  { label: "מדיניות פרטיות", to: "/privacy-policy" },
  { label: "תנאי שימוש", to: "/terms" },
];

/* ───────────── Quantity calculator ───────────── */

/**
 * ASSUMPTION — replace with the real roll width of the product.
 * The calculator cuts the covered width into vertical strips of this width.
 */
export const ROLL_WIDTH_CM = 122;

/** Extra material added for cuts and mistakes when the user keeps the option on. */
export const WASTE_RATE = 0.1;
