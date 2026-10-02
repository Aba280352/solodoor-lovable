/**
 * Builds the product catalogue CSVs (data/catalog/*.csv) from the client's
 * materials folder. Run from the repo root:
 *
 *   node scripts/build-catalog.cjs
 *
 * The CSVs are imported into Supabase (see data/catalog/schema.sql) in the
 * order of their numeric prefix. Empty cells mean "not known yet", see README.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const parent = path.resolve(ROOT, "..");
const outer = fs.readdirSync(parent).find((d) => d.startsWith("תיקיית קבצים עידו סולודור"));
if (!outer) throw new Error("materials folder not found next to the repo");
const SRC = path.join(parent, outer, "תיקיית קבצים עידו סולודור");
const OUT = path.join(ROOT, "data", "catalog");
fs.mkdirSync(OUT, { recursive: true });

const files = (dir) =>
  fs
    .readdirSync(path.join(SRC, dir), { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "he"));
const dirs = (dir) =>
  fs
    .readdirSync(path.join(SRC, dir), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "he"));
const isImage = (f) => /\.(png|jpe?g|webp|heic)$/i.test(f);
const stem = (f) => f.replace(/\.[^.]+$/, "");
const clean = (s) => s.replace(/_/g, "'").replace(/\s+/g, " ").trim();
const heSlug = (s) => clean(s).replace(/'/g, "").replace(/ /g, "-");

function writeCsv(name, columns, rows) {
  const cell = (v) => {
    if (v === null || v === undefined) return "";
    const s = Array.isArray(v) ? `{${v.join(",")}}` : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))];
  // BOM so Excel opens the Hebrew correctly.
  fs.writeFileSync(path.join(OUT, name), "﻿" + lines.join("\r\n") + "\r\n");
  console.log(`${name}: ${rows.length} rows`);
}

/* ───────────── Prices (from "מחירון מסודר.txt") ───────────── */

const PRICE_PER_METER = 119;
const PRICE_PER_METER_DOOR = 125;
const PRICE_DOOR_SIDE = 250;
const PRICE_DESIGNED_DOOR_SIDE = 305;
/** Said by the client in chat ("I think"), to be confirmed. */
const PRICE_INSTALLATION = 500;

/* ───────────── 01 applications (the tabs on the product page) ───────────── */

const applications = [
  {
    slug: "door",
    label: "דלת",
    file_prefix: "דלת",
    sell_unit: "side",
    unit_price: PRICE_DOOR_SIDE,
    price_per_meter: PRICE_PER_METER_DOOR,
    short_description: "טפט לדלת שמחדש דלת כניסה או דלת פנים בלי להחליף אותה. יחידה אחת מספיקה לצד אחד של דלת.",
    long_description:
      "דלת ישנה, דהויה או שרוטה מקבלת מראה חדש בלי פירוק ובלי נגר. מדביקים את הטפט ישירות על הדלת הקיימת, חותכים סביב הידית והעינית ומסיימים עם קצוות נקיים. יחידה אחת מכסה צד אחד של דלת בגודל רגיל. רוצים לחדש את שני הצדדים? מזמינים שתי יחידות. אפשר להוסיף לדלת פסי ניקל ומספר דירה.",
    measuring_tip: "מודדים את גובה הדלת ואת הרוחב שלה. לדלת בגודל רגיל מספיקה יחידה אחת לכל צד.",
    recommended_addons: ["squeegee", "knife", "blades"],
  },
  {
    slug: "kitchen",
    label: "מטבח",
    file_prefix: "מטבח",
    short_description: "טפט לחזיתות מטבח שמרענן את הארונות בלי להחליף אותם ובלי לשבור כלום.",
    long_description:
      "חזיתות המטבח הן מה שרואים ראשון. טפט בהדבקה עצמית מאפשר להחליף להן צבע וסגנון ביום אחד, כשהארונות נשארים במקום. מומלץ לפרק ידיות לפני ההדבקה, לעבוד חזית אחרי חזית ולהחליק עם קלף מהמרכז החוצה. הציפוי מתאים לשימוש יומיומי במטבח.",
    measuring_tip: "מודדים גובה ורוחב של כל חזית, מחברים את האורכים ומוסיפים כ-10% רזרבה לחיתוכים.",
    recommended_addons: ["squeegee", "knife", "blades"],
  },
  {
    slug: "fridge",
    label: "מקרר",
    file_prefix: "מקרר",
    short_description: "טפט למקרר שהופך מקרר ישן, מוכתם או פשוט משעמם לחלק מהעיצוב של המטבח.",
    long_description:
      "במקום להחליף מקרר שעובד מצוין, מחליפים לו את המראה. הטפט נדבק על הדלתות והצדדים של המקרר ומכסה שריטות, כתמים וצבע שהצהיב. מנקים היטב את המשטח משומן, מפרקים ידיות אם אפשר, ומדביקים דלת אחרי דלת.",
    measuring_tip: "מודדים גובה ורוחב של כל דלת וכל צד שרוצים לכסות, ומוסיפים כ-10% רזרבה.",
    recommended_addons: ["squeegee", "knife", "blades"],
  },
  {
    slug: "countertop",
    label: "שיש",
    file_prefix: "שיש",
    short_description: "טפט למשטח השיש שמחדש משטח עבודה שחוק בלי להחליף את האבן.",
    long_description:
      "משטח שיש ישן, מוכתם או בצבע שכבר לא מתאים מקבל מראה חדש בלי פירוק ובלי אבק. מדביקים את הטפט על המשטח הנקי והיבש, מחליקים עם קלף וסוגרים את החיבור לקיר ולכיור בסיליקון, כדי שמים לא ייכנסו מתחת לציפוי.",
    measuring_tip: "מודדים אורך ועומק של המשטח כולל הקנט הקדמי, ומוסיפים כ-10% רזרבה.",
    recommended_addons: ["squeegee", "knife", "blades", "silicone"],
  },
  {
    slug: "wall",
    label: "קיר",
    file_prefix: "קיר",
    short_description: "טפט לקיר שיוצר קיר מודגש בסלון, בחדר שינה או במסדרון, בלי צבע ובלי לכלוך.",
    long_description:
      "קיר אחד בגוון או בטקסטורה אחרת משנה חלל שלם. הטפט נדבק על קיר חלק, נקי ויבש, ואפשר להדביק אותו לבד עם קלף וסכין יפנית. עובדים מלמעלה למטה, רצועה אחרי רצועה, ומחליקים בועות לכיוון הקצוות.",
    measuring_tip: "מודדים רוחב וגובה של הקיר, מחשבים כמה רצועות צריך ומוסיפים כ-10% רזרבה.",
    recommended_addons: ["squeegee", "knife", "blades"],
  },
  {
    slug: "electric-cabinet",
    label: "ארון חשמל",
    file_prefix: "ארון חשמל",
    short_description: "טפט לארון חשמל שמעלים את הארון האפור מהקיר והופך אותו לחלק מהעיצוב.",
    long_description:
      "ארון החשמל הוא בדרך כלל הדבר הכי פחות יפה בכניסה לבית. טפט בהדבקה עצמית מכסה את הדלת של הארון בגוון שמתאים לקיר או לדלת הכניסה, והארון נשאר נגיש ומתפקד כרגיל. ההדבקה קצרה ומתאימה גם למי שמדביק בפעם הראשונה.",
    measuring_tip: "מודדים גובה ורוחב של דלת הארון ומוסיפים כמה סנטימטרים לכל צד לקיפול.",
    recommended_addons: ["squeegee", "knife", "blades"],
  },
].map((a, i) => ({
  sell_unit: "meter",
  unit_price: PRICE_PER_METER,
  price_per_meter: PRICE_PER_METER,
  ...a,
  sort_order: i + 1,
}));

writeCsv(
  "01_applications.csv",
  ["slug", "label", "sort_order", "sell_unit", "unit_price", "price_per_meter", "short_description", "long_description", "measuring_tip", "recommended_addons"],
  applications,
);

/* ───────────── 02 products ───────────── */

const FAMILY = {
  plain: {
    label: "חלק ונקי",
    line: "גוון אחיד ונקי שמשתלב בקלות בכל חלל, ונותן למשטח ישן מראה חדש ומסודר.",
  },
  wood: {
    label: "מראה עץ",
    line: "הדפס עץ עם עומק וגידים טבעיים, שמכניס חמימות לבית בלי נגרות ובלי להחליף את המשטח.",
  },
  stone: {
    label: "אבן / שיש / בטון",
    line: "מראה של אבן, בטון או טיח עם תנועה עדינה בטקסטורה, שנותן למשטח נוכחות בלי המשקל והמחיר של חומר אמיתי.",
  },
};

/** folder → [model code, family, finish, one-line look]. Codes come from the file names in each folder. */
const WALLPAPERS = {
  "אבן בהירה חם": ["IPW560", "stone", "טקסטורת אבן", "אבן בהירה בגוון חם ורך"],
  "אבן בהירה קר": ["IPW561", "stone", "טקסטורת אבן", "אבן בהירה בגוון קריר ונקי"],
  "אבן חול": ["SIP653", "stone", "טקסטורת אבן", "אבן בגוון חול טבעי"],
  "אפור": ["SD986", "plain", "מט", "אפור בינוני ומאוזן במראה מט"],
  "אפור בהיר": ["SD920", "plain", "מט", "אפור בהיר ורגוע"],
  "אפור כהה": ["SD991", "plain", "מט", "אפור כהה ועמוק"],
  "אפור סילבר": ["SD985", "plain", "מט", "אפור בגוון כסוף"],
  "בז_ כהה טקסטורה": ["SD982", "plain", "טקסטורה", "בז' כהה עם טקסטורה עדינה"],
  "בטון": ["IPW558", "stone", "טקסטורת בטון", "בטון אפור במראה תעשייתי"],
  "בטון בהיר": ["IPW557", "stone", "טקסטורת בטון", "בטון בהיר ואוורירי"],
  "דמוי נירוסטה": ["IM912-2", "plain", "מתכתי", "גימור מתכתי במראה נירוסטה מוברשת"],
  "חול": ["SD933", "plain", "מט", "גוון חול חמים ונייטרלי"],
  "טיח אפור בהיר": ["CR200", "stone", "טקסטורת טיח", "טיח אפור בהיר במראה רך"],
  "טיח אפור בטון מעונן": ["CR502", "stone", "טקסטורת טיח", "טיח אפור בגוון בטון עם מראה מעונן"],
  "טיח אפור מעונן": ["CR501", "stone", "טקסטורת טיח", "טיח אפור עם מראה מעונן"],
  "טיח אפור פחם": ["CR300", "stone", "טקסטורת טיח", "טיח בגוון אפור פחם כהה"],
  "טיח לבן מעונן": ["CR500", "stone", "טקסטורת טיח", "טיח לבן עם מראה מעונן עדין"],
  "ירוק פיסטוק": ["SD995", "plain", "מט", "ירוק פיסטוק רך ורענן"],
  "כחול מעושן": ["PCR511", "stone", "טקסטורת טיח", "כחול מעושן עם תנועה עדינה בטקסטורה"],
  "כחול עמוק": ["SD999", "plain", "מט", "כחול כהה ועמוק"],
  "לבן וניל": ["SD887", "plain", "מט", "לבן בגוון וניל חמים"],
  "לבן חם": ["SD872", "plain", "מט", "לבן חמים ורך"],
  "לבן טקסטורה": ["SD1901", "plain", "טקסטורה", "לבן עם טקסטורה עדינה"],
  "לבן מבריק": ["IH706", "plain", "מבריק", "לבן נקי בגימור מבריק"],
  "לבן מט": ["SD901", "plain", "מט", "לבן נקי בגימור מט"],
  "לבן פודרה": ["SD873", "plain", "מט", "לבן פודרה רך"],
  "לבן פסים": ["SD943", "plain", "טקסטורת פסים", "לבן עם טקסטורת פסים עדינה"],
  "לבן שבור": ["SD840", "plain", "מט", "לבן שבור ונעים לעין"],
  "נס קפה": ["SD919", "plain", "מט", "גוון נס קפה חמים"],
  "סהרה דמוי עץ": ["SD972", "wood", "דמוי עץ", "גוון סהרה בהיר במראה עץ"],
  "עץ אגוז": ["IT236", "wood", "דמוי עץ", "עץ אגוז חם ועשיר"],
  "עץ אלון": ["IT334", "wood", "דמוי עץ", "עץ אלון טבעי ובהיר"],
  "עץ אפור": ["IT606", "wood", "דמוי עץ", "עץ בגוון אפור מודרני"],
  "עץ בוצ_ר": ["IPW837", "wood", "דמוי עץ", "עץ בוצ'ר במראה של משטח נגרים"],
  "עץ בוק": ["IT202", "wood", "דמוי עץ", "עץ בוק בהיר וחמים"],
  "עץ דובדבן": ["IT248", "wood", "דמוי עץ", "עץ דובדבן בגוון אדמדם"],
  "עץ מהגוני": ["IT616", "wood", "דמוי עץ", "עץ מהגוני כהה וקלאסי"],
  "עץ עתיק": ["IT127", "wood", "דמוי עץ", "עץ במראה עתיק עם אופי"],
  "עץ שחור": ["IT619", "wood", "דמוי עץ", "עץ שחור עם גידים נראים"],
  "פלטות עץ": ["IT232", "wood", "דמוי עץ", "פלטות עץ טבעי"],
  "קרם מעושן": ["SD876", "plain", "מט", "קרם מעושן ורך"],
  "קרם פנינה טקסטורה": ["IM915", "plain", "טקסטורה", "קרם פנינה עם טקסטורה וברק עדין"],
  "שחור מט": ["SD908", "plain", "מט", "שחור עמוק בגימור מט"],
  "שחור פסים": ["SD944", "plain", "טקסטורת פסים", "שחור עם טקסטורת פסים עדינה"],
  "שיש עם גידים": ["IP413-12", "stone", "דמוי שיש", "שיש בהיר עם גידים"],
  "שמנת": ["SD874", "plain", "מט", "גוון שמנת חמים"],
  "תכלת מעושן": ["PCR510", "stone", "טקסטורת טיח", "תכלת מעושן עם תנועה עדינה בטקסטורה"],
};

const MATERIAL = "ציפוי פולימרי בהדבקה עצמית";
const DURABILITY = "ציפוי פולימרי עבה ועמיד בהדבקה עצמית, עם שכבת הגנה מפני שריטות ודהיית צבע";

const products = [];
const productApplications = [];
const productImages = [];
const productVariants = [];
const notes = [];

const MAIN = "תיקיים קבצים ראשית";
const STRIPS_DIR = "אופציות לפסי אלומיניום";
let sort = 0;

for (const folder of dirs(MAIN)) {
  if (folder === STRIPS_DIR) continue;
  const spec = WALLPAPERS[folder];
  if (!spec) {
    notes.push(`תיקייה בלי מיפוי לדגם: ${folder}`);
    continue;
  }
  const [code, family, finish, look] = spec;
  const title = clean(folder);
  const handle = code.toLowerCase();
  const all = files(path.join(MAIN, folder)).filter(isImage);

  const used = new Set();
  for (const app of applications) {
    const file = all.find((f) => f.startsWith(app.file_prefix + " ") || stem(f) === app.file_prefix);
    if (!file) {
      notes.push(`${title} (${code}): חסרה הדמיה ללשונית "${app.label}"`);
      continue;
    }
    used.add(file);
    productApplications.push({
      product_handle: handle,
      application_slug: app.slug,
      image_source: `${MAIN}/${folder}/${file}`,
      image_path: `products/${handle}/${app.slug}.webp`,
      price_override: "",
      is_active: true,
      shopify_variant_id: "",
    });
  }

  const material = all.filter((f) => !used.has(f));
  const isRoll = (f) => /-C(-\d)?\.[a-z]+$/i.test(f) || /-\d+website\./i.test(f);
  const swatches = material.filter((f) => !isRoll(f));
  const rolls = material.filter(isRoll);
  swatches.forEach((f, i) =>
    productImages.push({
      product_handle: handle,
      kind: "swatch",
      sort_order: i + 1,
      image_source: `${MAIN}/${folder}/${f}`,
      image_path: `products/${handle}/swatch-${i + 1}.webp`,
      alt: `${title} ${code}, דוגמת הגוון`,
    }),
  );
  rolls.forEach((f, i) =>
    productImages.push({
      product_handle: handle,
      kind: "roll",
      sort_order: i + 1,
      image_source: `${MAIN}/${folder}/${f}`,
      image_path: `products/${handle}/roll-${i + 1}.webp`,
      alt: `${title} ${code}, החומר מקרוב`,
    }),
  );
  if (!swatches.length) notes.push(`${title} (${code}): אין תמונת גוון שטוחה, נדרשת לדוגמית`);

  const fam = FAMILY[family];
  products.push({
    handle,
    slug: handle,
    model_code: code,
    title,
    product_type: "wallpaper",
    style_family: fam.label,
    finish,
    material: MATERIAL,
    base_price: PRICE_PER_METER,
    price_unit: "meter",
    short_description: `${title} ${code}: ${look}. טפט בהדבקה עצמית, עבה ועמיד, עם שכבת הגנה מפני שריטות ודהיית צבע. מתאים להתקנה עצמית.`,
    long_description: [
      `${title} (${code}) הוא ${look}. ${fam.line}`,
      "הטפט מתאים לדלתות, לחזיתות מטבח, למקררים, למשטחי שיש, לקירות ולארונות חשמל. בכל לשונית בעמוד תמצאו הדמיה, מחיר והנחיות שמתאימות למשטח שבחרתם.",
      `זה ${DURABILITY}. מדביקים אותו ישירות על המשטח הקיים, בלי לפרק ובלי להחליף.`,
      "המוצר מתאים להתקנה עצמית: מודדים, מזמינים ומדביקים בבית עם קלף וסכין יפנית. מעדיפים שנעשה את זה בשבילכם? אפשר להוסיף התקנה מקצועית בהזמנה.",
    ].join("\n\n"),
    roll_width_cm: "",
    thickness_mm: "",
    sample_available: true,
    installation_available: true,
    is_active: true,
    sort_order: ++sort,
    shopify_product_id: "",
  });
}

/* Designed doors: one product per series folder, one variant per photo. */

const DESIGNED = "תמונות סולודור";
const SERIES_HANDLE = {
  "אלכסונים": "diagonals",
  "ארבעה פסי ניקל": "four-nickel-strips",
  "בארי": "bari",
  "דמוי שקע עדין": "soft-recess",
  "הוואי": "hawaii",
  "מאוייר": "illustrated",
  "מונקו": "monaco",
  "מילאנו": "milano",
  "מסגרות בז_": "beige-frames",
  "מסגרות שקוע": "recessed-frames",
  "מסגרות תלת מימד": "3d-frames",
  "מעוצבים בלבן": "white-designs",
  "נאפולי": "napoli",
  "נועם": "noam",
  "עץ גאומטרי": "geometric-wood",
  "עץ מודרני": "modern-wood",
  "פירנצה": "firenze",
  "פסים לאורך": "vertical-strips",
  "פסים צמודים": "close-strips",
  "פרחוני": "floral",
  "רומא": "roma",
  "שלושה פסים  מדורג": "three-stepped-strips",
};
const LOOSE_HANDLE = {
  "אפור מדורג שרשראות": "grey-stepped-chains",
  "אפור קר מסגרות": "cool-grey-frames",
  "בז_ 2 פסים שחורים": "beige-two-black-strips",
  "הוואנה שמנת": "havana-cream",
  "לונדון אפור כהה": "london-dark-grey",
  "סגול חברים": "purple-friends",
  "עץ פרחים": "wood-flowers",
  "שחור 2 פסי ניקל": "black-two-nickel-strips",
};

const designedShort = (name) =>
  `טפט מעוצב לדלת בדגם ${name}. הדפסה חדה עם אפקט עומק תלת ממדי, שהופכת דלת קיימת לאלמנט עיצובי. המחיר לצד אחד של דלת.`;
const designedLong = (name, variants) =>
  [
    `דגם ${name} הוא טפט מעוצב לדלת, למי שרוצה יותר מצבע אחיד. הדלת הקיימת נשארת במקום ומקבלת אופי, עומק ונוכחות.`,
    "הטפט מיוצר בהדפסה איכותית ומדויקת, שנותנת לדוגמה חדות ואפקט תלת ממדי." +
      (variants > 1 ? ` הדגם זמין ב-${variants} גוונים, כך שאפשר להתאים אותו לצבעי הקירות והחלל.` : ""),
    "יחידה אחת מכסה צד אחד של דלת. אפשר להדביק לבד עם קלף וסכין יפנית, או להוסיף התקנה מקצועית בהזמנה.",
  ].join("\n\n");

function addDesigned(name, handleSuffix, photos, dirPath) {
  const handle = `door-${handleSuffix}`;
  const title = clean(name);
  products.push({
    handle,
    slug: heSlug(name),
    model_code: "",
    title,
    product_type: "designed_door",
    style_family: "מעוצב ודקורטיבי",
    finish: "הדפסה עם אפקט עומק",
    material: MATERIAL,
    base_price: PRICE_DESIGNED_DOOR_SIDE,
    price_unit: "side",
    short_description: designedShort(title),
    long_description: designedLong(title, photos.length),
    roll_width_cm: "",
    thickness_mm: "",
    sample_available: false,
    installation_available: true,
    is_active: true,
    sort_order: ++sort,
    shopify_product_id: "",
  });
  photos.forEach((f, i) =>
    productVariants.push({
      product_handle: handle,
      variant_key: `v${i + 1}`,
      title: clean(stem(f)),
      price: PRICE_DESIGNED_DOOR_SIDE,
      image_source: `${dirPath}/${f}`,
      image_path: `products/${handle}/v${i + 1}.webp`,
      sort_order: i + 1,
      is_active: true,
      shopify_variant_id: "",
    }),
  );
}

for (const folder of dirs(DESIGNED)) {
  const suffix = SERIES_HANDLE[folder];
  if (!suffix) {
    notes.push(`סדרת דלתות מעוצבות בלי מיפוי: ${folder}`);
    continue;
  }
  addDesigned(folder, suffix, files(path.join(DESIGNED, folder)).filter(isImage), `${DESIGNED}/${folder}`);
}
for (const f of files(DESIGNED).filter(isImage)) {
  const suffix = LOOSE_HANDLE[stem(f)];
  if (!suffix) {
    notes.push(`קובץ בתיקיית הדלתות המעוצבות שלא נכנס לקטלוג: ${f}`);
    continue;
  }
  addDesigned(stem(f), suffix, [f], DESIGNED);
}

/* PVC rugs: one product per design; the sizes and prices are shared (07_rug_sizes.csv). */

const RUGS = "שטיח pvc";
const rugLong = [
  "שטיחי PVC מעוצבים SoloFloor משלבים מראה של שטיח מעוצב עם הפרקטיות של PVC: משטח דק, עמיד ונוח לתחזוקה, שתוכנן לשימוש יומיומי בבית.",
  "השטיח אינו סופג נוזלים, קל ומהיר לניקוי, ועוביו 2.5 מ\"מ. הוא מתאים למטבח, לסלון ולחדרי ילדים, ונוח במיוחד לבתים עם ילדים וחיות מחמד.",
  "מגוון המידות מאפשר להוסיף צבע ואופי לחלל, בלי התחזוקה המורכבת של שטיח בד.",
].join("\n\n");
let rugN = 0;
for (const f of files(RUGS).filter((x) => isImage(x) && x.startsWith("שטיח פיויסי"))) {
  const name = stem(f).replace("שטיח פיויסי", "").trim();
  const room = name.startsWith("לכניסה") ? "כניסה" : name.startsWith("למטבח") ? "מטבח" : "כללי";
  const handle = `rug-${String(++rugN).padStart(2, "0")}`;
  const title = `שטיח PVC ${name}`;
  products.push({
    handle,
    slug: heSlug(title),
    model_code: "",
    title,
    product_type: "pvc_rug",
    style_family: `שטיחי PVC, ${room}`,
    finish: "",
    material: "PVC",
    base_price: 190,
    price_unit: "size",
    short_description: `${title}. שטיח דק ועמיד שאינו סופג נוזלים וקל לניקוי, במגוון מידות.`,
    long_description: rugLong,
    roll_width_cm: "",
    thickness_mm: 2.5,
    sample_available: false,
    installation_available: false,
    is_active: true,
    sort_order: ++sort,
    shopify_product_id: "",
  });
  productImages.push({
    product_handle: handle,
    kind: "main",
    sort_order: 1,
    image_source: `${RUGS}/${f}`,
    image_path: `products/${handle}/main.webp`,
    alt: title,
  });
}

writeCsv(
  "02_products.csv",
  ["handle", "slug", "model_code", "title", "product_type", "style_family", "finish", "material", "base_price", "price_unit", "short_description", "long_description", "roll_width_cm", "thickness_mm", "sample_available", "installation_available", "is_active", "sort_order", "shopify_product_id"],
  products,
);
writeCsv(
  "03_product_applications.csv",
  ["product_handle", "application_slug", "image_source", "image_path", "price_override", "is_active", "shopify_variant_id"],
  productApplications,
);
writeCsv("04_product_images.csv", ["product_handle", "kind", "sort_order", "image_source", "image_path", "alt"], productImages);
writeCsv(
  "05_product_variants.csv",
  ["product_handle", "variant_key", "title", "price", "image_source", "image_path", "sort_order", "is_active", "shopify_variant_id"],
  productVariants,
);

/* ───────────── 06 add-ons ───────────── */

const addons = [
  { slug: "squeegee", title: "קלף", addon_type: "diy_tool", price: "", applies_to: ["all"], description: "קלף להחלקת הטפט ולהוצאת בועות אוויר בזמן ההדבקה.", image_source: "" },
  { slug: "knife", title: "סכין יפנית", addon_type: "diy_tool", price: "", applies_to: ["all"], description: "סכין יפנית לחיתוך מדויק של הטפט בקצוות, בפינות וסביב ידיות.", image_source: "" },
  { slug: "blades", title: "סכינים להחלפה", addon_type: "diy_tool", price: "", applies_to: ["all"], description: "להבים להחלפה לסכין היפנית. להב חד נותן חיתוך נקי בלי לקרוע את הטפט.", image_source: "" },
  { slug: "silicone", title: "סיליקון לחיפוי שיש", addon_type: "diy_tool", price: "", applies_to: ["countertop"], description: "סיליקון לסגירת החיבור בין הטפט לקיר ולכיור, כדי שמים לא ייכנסו מתחת לציפוי.", image_source: "" },
  ...files(path.join(MAIN, STRIPS_DIR))
    .filter(isImage)
    .map((f, i) => ({
      slug: `strips-${String(i + 1).padStart(2, "0")}`,
      title: clean(stem(f)),
      addon_type: "door_strips",
      price: "",
      applies_to: ["door"],
      description: `תוספת לדלת: ${clean(stem(f))}.`,
      image_source: `${MAIN}/${STRIPS_DIR}/${f}`,
      image_path: `addons/strips-${String(i + 1).padStart(2, "0")}.webp`,
    })),
  { slug: "door-number", title: "מספר לדלת", addon_type: "door_accessory", price: "", applies_to: ["door"], description: "מספר דירה לדלת, משלים את המראה החדש.", image_source: "" },
  { slug: "installation", title: "התקנה מקצועית", addon_type: "service", price: PRICE_INSTALLATION, applies_to: ["all"], description: "מתקין של סולודור מגיע אליכם ומדביק את הטפט. המחיר נוסף על מחיר החומר.", image_source: "" },
  { slug: "sample", title: "דוגמית לבית", addon_type: "sample", price: "", applies_to: ["all"], description: "דוגמית של הגוון נשלחת אליכם הביתה, כדי לראות את הצבע והטקסטורה לפני שמזמינים.", image_source: "" },
].map((a, i) => ({ image_path: "", ...a, is_active: true, sort_order: i + 1, shopify_variant_id: "" }));

writeCsv(
  "06_addons.csv",
  ["slug", "title", "addon_type", "price", "applies_to", "description", "image_source", "image_path", "is_active", "sort_order", "shopify_variant_id"],
  addons,
);

/* ───────────── 07 rug sizes (from "שטיח pvc/מחירון.txt") ───────────── */

const rugSizes = fs
  .readFileSync(path.join(SRC, RUGS, "מחירון.txt"), "utf8")
  .split(/\r?\n/)
  .map((line) => line.match(/(\d+)x(\d+)\s*-\s*(\d+)/))
  .filter(Boolean)
  .map((m, i) => ({ size_key: `${m[1]}x${m[2]}`, width_cm: +m[1], length_cm: +m[2], price: +m[3], sort_order: i + 1, shopify_variant_id: "" }));
writeCsv("07_rug_sizes.csv", ["size_key", "width_cm", "length_cm", "price", "sort_order", "shopify_variant_id"], rugSizes);

fs.writeFileSync(path.join(OUT, "build-notes.txt"), notes.join("\n") + "\n");
console.log(`\nnotes (${notes.length}):\n` + notes.join("\n"));
