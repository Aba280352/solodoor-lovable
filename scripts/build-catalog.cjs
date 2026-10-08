/**
 * Builds the product catalogue CSVs (data/catalog/*.csv) from the client's
 * materials folder. Run from the repo root:
 *
 *   node scripts/build-catalog.cjs
 *
 * The CSVs are imported into Supabase (see data/catalog/schema.sql) in the
 * order of their numeric prefix.
 *
 * Supplier model numbers must never reach the site: products are identified by
 * name only. The original file names (which contain those numbers) are written
 * to data/private/, which is not committed.
 */
const fs = require("fs");
const { execFileSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const parent = path.resolve(ROOT, "..");
const outer = fs.readdirSync(parent).find((d) => d.startsWith("תיקיית קבצים עידו סולודור"));
if (!outer) throw new Error("materials folder not found next to the repo");
const SRC = path.join(parent, outer, "תיקיית קבצים עידו סולודור");
const OUT = path.join(ROOT, "data", "catalog");
const PRIVATE = path.join(ROOT, "data", "private");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PRIVATE, { recursive: true });

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

function writeCsv(dir, name, columns, rows) {
  const cell = (v) => {
    if (v === null || v === undefined) return "";
    const s = Array.isArray(v) ? `{${v.join(",")}}` : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))];
  // BOM so Excel opens the Hebrew correctly.
  fs.writeFileSync(path.join(dir, name), "﻿" + lines.join("\r\n") + "\r\n");
  console.log(`${name}: ${rows.length} rows`);
}

/** image_path → original file. Kept private: the file names carry supplier model numbers. */
const imageSources = [];
const image = (imagePath, source) => {
  imageSources.push({ image_path: imagePath, source_file: source });
  return imagePath;
};

/* ───────────── Prices ───────────── */

// From "מחירון מסודר.txt".
const PRICE_PER_METER = 119;
const PRICE_PER_METER_DOOR = 125;
const PRICE_DOOR_SIDE = 250;
const PRICE_DESIGNED_DOOR_SIDE = 305;
// Decided with the client in chat.
const PRICE_INSTALLATION = 490; // per order, doors only (see applies_to below)
const PRICE_DOOR_NUMBER = 19.9; // per digit
// A designed door with strips costs 305 a side against 250 for a plain one.
const PRICE_STRIPS = PRICE_DESIGNED_DOOR_SIDE - PRICE_DOOR_SIDE;
// Same as the main competitor's shop, as the client asked.
const PRICE_SQUEEGEE = 25;
const PRICE_KNIFE = 20;
const PRICE_SILICONE = 35;
const PRICE_BLADES = 15; // ASSUMPTION: the competitor does not sell these
const PRICE_SAMPLE = 0; // the competitor sends samples free of charge
// ASSUMPTION: same roll width as the homepage calculator.
const ROLL_WIDTH_CM = 122;
const DOOR_UNIT_LENGTH_CM = 200;
const MIN_METERS = 2;
// ASSUMPTION: typical thickness of self-adhesive interior film; to be confirmed with the supplier.
const THICKNESS_MM = 0.2;
// Same as the main competitor, as the client asked.
const SHIPPING_PRICE = 55;
const SHIPPING_DAYS = 7;

const VIDEO_POSTER = "placeholders/video-poster.webp";

/* ───────────── 01 applications (the tabs on the product page) ───────────── */

const applications = [
  {
    slug: "door",
    label: "דלת",
    file_prefix: "דלת",
    sell_unit: "side",
    unit_price: PRICE_DOOR_SIDE,
    price_per_meter: PRICE_PER_METER_DOOR,
    unit_length_cm: DOOR_UNIT_LENGTH_CM,
    min_quantity: 1,
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
  unit_length_cm: 100,
  min_quantity: MIN_METERS,
  quantity_step: 1,
  roll_width_cm: ROLL_WIDTH_CM,
  install_video_url: "",
  measure_video_url: "",
  video_poster_path: VIDEO_POSTER,
  ...a,
  sort_order: i + 1,
}));

writeCsv(
  OUT,
  "01_applications.csv",
  ["slug", "label", "sort_order", "sell_unit", "unit_price", "price_per_meter", "unit_length_cm", "roll_width_cm", "min_quantity", "quantity_step", "short_description", "long_description", "measuring_tip", "recommended_addons", "install_video_url", "measure_video_url", "video_poster_path"],
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

/** folder → [handle, family, finish, one-line look]. Names only, no supplier numbers. */
const WALLPAPERS = {
  "אבן בהירה חם": ["warm-light-stone", "stone", "טקסטורת אבן", "אבן בהירה בגוון חם ורך"],
  "אבן בהירה קר": ["cool-light-stone", "stone", "טקסטורת אבן", "אבן בהירה בגוון קריר ונקי"],
  "אבן חול": ["sand-stone", "stone", "טקסטורת אבן", "אבן בגוון חול טבעי"],
  "אפור": ["grey", "plain", "מט", "אפור בינוני ומאוזן במראה מט"],
  "אפור בהיר": ["light-grey", "plain", "מט", "אפור בהיר ורגוע"],
  "אפור כהה": ["dark-grey", "plain", "מט", "אפור כהה ועמוק"],
  "אפור סילבר": ["silver-grey", "plain", "מט", "אפור בגוון כסוף"],
  "בז_ כהה טקסטורה": ["dark-beige-texture", "plain", "טקסטורה", "בז' כהה עם טקסטורה עדינה"],
  "בטון": ["concrete", "stone", "טקסטורת בטון", "בטון אפור במראה תעשייתי"],
  "בטון בהיר": ["light-concrete", "stone", "טקסטורת בטון", "בטון בהיר ואוורירי"],
  "דמוי נירוסטה": ["stainless-steel", "plain", "מתכתי", "גימור מתכתי במראה נירוסטה מוברשת"],
  "חול": ["sand", "plain", "מט", "גוון חול חמים ונייטרלי"],
  "טיח אפור בהיר": ["light-grey-plaster", "stone", "טקסטורת טיח", "טיח אפור בהיר במראה רך"],
  "טיח אפור בטון מעונן": ["cloudy-concrete-plaster", "stone", "טקסטורת טיח", "טיח אפור בגוון בטון עם מראה מעונן"],
  "טיח אפור מעונן": ["cloudy-grey-plaster", "stone", "טקסטורת טיח", "טיח אפור עם מראה מעונן"],
  "טיח אפור פחם": ["charcoal-plaster", "stone", "טקסטורת טיח", "טיח בגוון אפור פחם כהה"],
  "טיח לבן מעונן": ["cloudy-white-plaster", "stone", "טקסטורת טיח", "טיח לבן עם מראה מעונן עדין"],
  "ירוק פיסטוק": ["pistachio-green", "plain", "מט", "ירוק פיסטוק רך ורענן"],
  "כחול מעושן": ["smoky-blue", "stone", "טקסטורת טיח", "כחול מעושן עם תנועה עדינה בטקסטורה"],
  "כחול עמוק": ["deep-blue", "plain", "מט", "כחול כהה ועמוק"],
  "לבן וניל": ["vanilla-white", "plain", "מט", "לבן בגוון וניל חמים"],
  "לבן חם": ["warm-white", "plain", "מט", "לבן חמים ורך"],
  "לבן טקסטורה": ["white-texture", "plain", "טקסטורה", "לבן עם טקסטורה עדינה"],
  "לבן מבריק": ["glossy-white", "plain", "מבריק", "לבן נקי בגימור מבריק"],
  "לבן מט": ["matte-white", "plain", "מט", "לבן נקי בגימור מט"],
  "לבן פודרה": ["powder-white", "plain", "מט", "לבן פודרה רך"],
  "לבן פסים": ["white-stripes", "plain", "טקסטורת פסים", "לבן עם טקסטורת פסים עדינה"],
  "לבן שבור": ["off-white", "plain", "מט", "לבן שבור ונעים לעין"],
  "נס קפה": ["nescafe", "plain", "מט", "גוון נס קפה חמים"],
  "סהרה דמוי עץ": ["sahara-wood", "wood", "דמוי עץ", "גוון סהרה בהיר במראה עץ"],
  "עץ אגוז": ["walnut-wood", "wood", "דמוי עץ", "עץ אגוז חם ועשיר"],
  "עץ אלון": ["oak-wood", "wood", "דמוי עץ", "עץ אלון טבעי ובהיר"],
  "עץ אפור": ["grey-wood", "wood", "דמוי עץ", "עץ בגוון אפור מודרני"],
  "עץ בוצ_ר": ["butcher-wood", "wood", "דמוי עץ", "עץ בוצ'ר במראה של משטח נגרים"],
  "עץ בוק": ["beech-wood", "wood", "דמוי עץ", "עץ בוק בהיר וחמים"],
  "עץ דובדבן": ["cherry-wood", "wood", "דמוי עץ", "עץ דובדבן בגוון אדמדם"],
  "עץ מהגוני": ["mahogany-wood", "wood", "דמוי עץ", "עץ מהגוני כהה וקלאסי"],
  "עץ עתיק": ["antique-wood", "wood", "דמוי עץ", "עץ במראה עתיק עם אופי"],
  "עץ שחור": ["black-wood", "wood", "דמוי עץ", "עץ שחור עם גידים נראים"],
  "פלטות עץ": ["wood-planks", "wood", "דמוי עץ", "פלטות עץ טבעי"],
  "קרם מעושן": ["smoky-cream", "plain", "מט", "קרם מעושן ורך"],
  "קרם פנינה טקסטורה": ["pearl-cream-texture", "plain", "טקסטורה", "קרם פנינה עם טקסטורה וברק עדין"],
  "שחור מט": ["matte-black", "plain", "מט", "שחור עמוק בגימור מט"],
  "שחור פסים": ["black-stripes", "plain", "טקסטורת פסים", "שחור עם טקסטורת פסים עדינה"],
  "שיש עם גידים": ["veined-marble", "stone", "דמוי שיש", "שיש בהיר עם גידים"],
  "שמנת": ["cream", "plain", "מט", "גוון שמנת חמים"],
  "תכלת מעושן": ["smoky-light-blue", "stone", "טקסטורת טיח", "תכלת מעושן עם תנועה עדינה בטקסטורה"],
};

/**
 * Models whose folder has no flat colour photo. Their swatch was made separately
 * and sits in data/catalog-images already (see README), so it has no source file.
 */
const MADE_SWATCHES = new Set(["charcoal-plaster", "veined-marble"]);

/**
 * Colour families for the shop's colour filter (keys match src/components/solodoor/shop/colors.ts).
 * Wallpapers are set by hand from the measured swatch colour; designed doors take the first
 * colour word of each photo's name; rugs have none for now.
 */
const WALLPAPER_COLORS = {
  "warm-light-stone": ["cream"], "cool-light-stone": ["grey"], "sand-stone": ["cream"],
  grey: ["grey"], "light-grey": ["grey"], "dark-grey": ["grey"], "silver-grey": ["grey"],
  "dark-beige-texture": ["cream"], concrete: ["grey"], "light-concrete": ["grey"], "stainless-steel": ["grey"],
  sand: ["cream"], "light-grey-plaster": ["grey"], "cloudy-concrete-plaster": ["grey"], "cloudy-grey-plaster": ["grey"],
  "charcoal-plaster": ["grey"], "cloudy-white-plaster": ["white"], "pistachio-green": ["green"],
  "smoky-blue": ["blue"], "deep-blue": ["blue"], "vanilla-white": ["white"], "warm-white": ["white"],
  "white-texture": ["white"], "glossy-white": ["white"], "matte-white": ["white"], "powder-white": ["white"],
  "white-stripes": ["white"], "off-white": ["white"], nescafe: ["cream"], "sahara-wood": ["cream"],
  "walnut-wood": ["brown"], "oak-wood": ["brown"], "grey-wood": ["grey"], "butcher-wood": ["brown"],
  "beech-wood": ["cream"], "cherry-wood": ["brown"], "mahogany-wood": ["brown"], "antique-wood": ["brown"],
  "black-wood": ["black"], "wood-planks": ["brown"], "smoky-cream": ["cream"], "pearl-cream-texture": ["cream"],
  "matte-black": ["black"], "black-stripes": ["black"], "veined-marble": ["white"], cream: ["cream"],
  "smoky-light-blue": ["blue"],
};
/** Families that look alike in a render; a name/pixel mismatch inside a group is not worth flagging. */
const NEAR = {
  white: ["cream", "grey"], cream: ["white", "grey", "brown"], grey: ["white", "cream", "black", "blue"],
  black: ["grey"], brown: ["cream", "black"], blue: ["grey"],
};
const COLOR_WORDS = [
  ["white", ["לבן", "חלבי"]], ["black", ["שחור"]], ["cream", ["בז", "שמנת", "קרם", "הוואנה"]],
  ["grey", ["אפור", "אפרפר"]], ["brown", ["חום", "עץ"]], ["blue", ["כחול", "תכלת"]],
  ["green", ["ירוק"]], ["purple", ["סגול"]],
];
/** The first colour word in a photo's name decides its family ("לבן פסים שחורים" is white). */
function colorOfName(name) {
  for (const word of clean(name).split(" ")) {
    const hit = COLOR_WORDS.find(([, stems]) => stems.some((stem) => word.includes(stem)));
    if (hit) return hit[0];
  }
  return null;
}

/**
 * Rug colours, read by eye from the photos (the rugs are staged in rooms, so pixels would mostly
 * measure the room). Index = rug number (rug-01 is 1).
 */
const RUG_COLORS = {
  1: ["multi"], 2: ["multi"], 3: ["multi"], 4: ["cream"], 5: ["brown"], 6: ["cream"], 7: ["grey", "cream"],
  8: ["cream"], 9: ["cream", "green"], 10: ["cream"], 11: ["grey"], 12: ["multi"], 13: ["black"],
  14: ["cream", "black"], 15: ["grey"], 16: ["green"], 17: ["cream"], 18: ["cream", "green"], 19: ["brown"],
  20: ["blue"], 21: ["cream"], 22: ["cream", "black"], 23: ["cream"], 24: ["white", "grey"], 25: ["brown"],
  26: ["brown"], 27: ["brown"], 28: ["cream"], 29: ["grey"], 30: ["white"], 31: ["cream", "green"],
  32: ["multi"], 33: ["white"], 34: ["cream", "green"], 35: ["brown"], 36: ["blue"], 37: ["cream"],
  38: ["multi"], 39: ["cream", "green"],
};

/** Colour family of door photos by their pixels (see scripts/color-of-image.cjs). */
function pixelFamilies(files) {
  const out = execFileSync("node", [path.join(__dirname, "color-of-image.cjs"), "--json", ...files], { encoding: "utf8", maxBuffer: 1 << 24 });
  return JSON.parse(out).map((r) => r.family);
}

const MATERIAL = "ציפוי פולימרי בהדבקה עצמית";
const DURABILITY = "ציפוי פולימרי עבה ועמיד בהדבקה עצמית, עם שכבת הגנה מפני שריטות ודהיית צבע";

const products = [];
const productApplications = [];
const productImages = [];
const productVariants = [];
const supplierFiles = [];
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
  const [handle, family, finish, look] = spec;
  const title = clean(folder);
  const all = files(path.join(MAIN, folder)).filter(isImage);

  const used = new Set();
  for (const app of applications) {
    const file = all.find((f) => f.startsWith(app.file_prefix + " ") || stem(f) === app.file_prefix);
    if (!file) {
      notes.push(`${title}: חסרה הדמיה ללשונית "${app.label}"`);
      continue;
    }
    used.add(file);
    productApplications.push({
      product_handle: handle,
      application_slug: app.slug,
      image_path: image(`products/${handle}/${app.slug}.webp`, `${MAIN}/${folder}/${file}`),
      image_alt: `טפט ${title} על ${app.label}`,
      price_override: "",
      is_active: true,
      shopify_variant_id: "",
    });
  }

  const material = all.filter((f) => !used.has(f));
  supplierFiles.push({ handle, title, material_files: material.join(" | ") });
  const isRoll = (f) => /-C(-\d)?\.[a-z]+$/i.test(f) || /-\d+website\./i.test(f);
  const swatches = material.filter((f) => !isRoll(f));
  const rolls = material.filter(isRoll);
  swatches.forEach((f, i) =>
    productImages.push({
      product_handle: handle,
      kind: "swatch",
      sort_order: i + 1,
      image_path: image(`products/${handle}/swatch-${i + 1}.webp`, `${MAIN}/${folder}/${f}`),
      alt: `${title}, דוגמת הגוון`,
    }),
  );
  rolls.forEach((f, i) =>
    productImages.push({
      product_handle: handle,
      kind: "roll",
      sort_order: i + 1,
      image_path: image(`products/${handle}/roll-${i + 1}.webp`, `${MAIN}/${folder}/${f}`),
      alt: `${title}, החומר מקרוב`,
    }),
  );
  if (!swatches.length) {
    if (MADE_SWATCHES.has(handle)) {
      productImages.push({
        product_handle: handle,
        kind: "swatch",
        sort_order: 1,
        image_path: `products/${handle}/swatch-1.webp`,
        alt: `${title}, דוגמת הגוון`,
      });
    } else {
      notes.push(`${title}: אין תמונת גוון שטוחה, נדרשת לדוגמית`);
    }
  }

  const fam = FAMILY[family];
  products.push({
    handle,
    slug: heSlug(title),
    title,
    product_type: "wallpaper",
    style_family: fam.label,
    finish,
    material: MATERIAL,
    base_price: PRICE_PER_METER,
    price_unit: "meter",
    short_description: `טפט ${title}: ${look}. טפט בהדבקה עצמית, עבה ועמיד, עם שכבת הגנה מפני שריטות ודהיית צבע. מתאים להתקנה עצמית.`,
    long_description: [
      `טפט ${title} הוא ${look}. ${fam.line}`,
      "הטפט מתאים לדלתות, לחזיתות מטבח, למקררים, למשטחי שיש, לקירות ולארונות חשמל. בכל לשונית בעמוד תמצאו הדמיה, מחיר והנחיות שמתאימות למשטח שבחרתם.",
      `זה ${DURABILITY}. מדביקים אותו ישירות על המשטח הקיים, בלי לפרק ובלי להחליף.`,
      "המוצר מתאים להתקנה עצמית: מודדים, מזמינים ומדביקים בבית עם קלף וסכין יפנית. מעדיפים שנעשה את זה בשבילכם? בדלתות אפשר להוסיף התקנה מקצועית בהזמנה.",
    ].join("\n\n"),
    roll_width_cm: ROLL_WIDTH_CM,
    thickness_mm: THICKNESS_MM,
    sample_available: true,
    installation_available: true,
    colors: WALLPAPER_COLORS[handle] ?? [],
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

/**
 * Door colours checked by eye, photo by photo (October 2026). They win over the name and the pixel reading.
 * A value with a comma lists the photo under both families: these doors are a very light grey that reads as off-white.
 * The two Bari doors are named after their window, but the door itself is light grey.
 */
const COLOR_BY_EYE = {
  "בארי חלון חלבי": "grey",
  "בארי חלון לבן": "grey",
  "אפור בהיר אלכסונים פסים שחורים": "grey,white",
  "אפור בהיר גאומטרי שחור": "grey,white",
  "אפור בטון בהיר אלכסונים": "grey,white",
  "אפור מסגרות שקוע": "grey,white",
  "מסגרת אורך אפור בהיר": "grey,white",
};

function addDesigned(name, handleSuffix, photos, dirPath) {
  const handle = `door-${handleSuffix}`;
  const title = clean(name);
  // The name decides when it carries a colour; photos without one are read from their pixels.
  const pixels = pixelFamilies(photos.map((f) => path.join(SRC, dirPath, f)));
  const photoColors = photos.map((f, i) => {
    const byEye = COLOR_BY_EYE[clean(stem(f))];
    if (byEye) return byEye;
    const byName = colorOfName(stem(f));
    if (byName && byName !== pixels[i] && !(NEAR[byName] ?? []).includes(pixels[i])) {
      notes.push(`צבע שונה בין השם לתמונה: ${clean(stem(f))} (שם: ${byName}, תמונה: ${pixels[i]})`);
    }
    return byName ?? pixels[i];
  });
  const variantColors = [...new Set(photoColors.flatMap((c) => (c ? c.split(",") : [])))];
  products.push({
    handle,
    slug: heSlug(name),
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
    colors: variantColors,
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
      color: photoColors[i],
      image_path: image(`products/${handle}/v${i + 1}.webp`, `${dirPath}/${f}`),
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
    colors: RUG_COLORS[rugN] ?? [],
    is_active: true,
    sort_order: ++sort,
    shopify_product_id: "",
  });
  productImages.push({
    product_handle: handle,
    kind: "main",
    sort_order: 1,
    image_path: image(`products/${handle}/main.webp`, `${RUGS}/${f}`),
    alt: title,
  });
}

writeCsv(
  OUT,
  "02_products.csv",
  ["handle", "slug", "title", "product_type", "style_family", "finish", "material", "base_price", "price_unit", "short_description", "long_description", "roll_width_cm", "thickness_mm", "sample_available", "installation_available", "colors", "is_active", "sort_order", "shopify_product_id"],
  products,
);
writeCsv(
  OUT,
  "03_product_applications.csv",
  ["product_handle", "application_slug", "image_path", "image_alt", "price_override", "is_active", "shopify_variant_id"],
  productApplications,
);
writeCsv(OUT, "04_product_images.csv", ["product_handle", "kind", "sort_order", "image_path", "alt"], productImages);
writeCsv(
  OUT,
  "05_product_variants.csv",
  ["product_handle", "variant_key", "title", "price", "color", "image_path", "sort_order", "is_active", "shopify_variant_id"],
  productVariants,
);

/* ───────────── 06 add-ons ───────────── */

const addons = [
  { slug: "squeegee", image_path: "addons/squeegee.webp", title: "קלף", addon_type: "diy_tool", price: PRICE_SQUEEGEE, applies_to: ["all"], description: "קלף להחלקת הטפט ולהוצאת בועות אוויר בזמן ההדבקה." },
  { slug: "knife", image_path: "addons/knife.webp", title: "סכין יפנית", addon_type: "diy_tool", price: PRICE_KNIFE, applies_to: ["all"], description: "סכין יפנית לחיתוך מדויק של הטפט בקצוות, בפינות וסביב ידיות." },
  { slug: "blades", image_path: "addons/blades.webp", title: "סכינים להחלפה", addon_type: "diy_tool", price: PRICE_BLADES, applies_to: ["all"], description: "להבים להחלפה לסכין היפנית. להב חד נותן חיתוך נקי בלי לקרוע את הטפט." },
  { slug: "silicone", image_path: "addons/silicone.webp", title: "סיליקון לחיפוי שיש", addon_type: "diy_tool", price: PRICE_SILICONE, applies_to: ["countertop"], description: "סיליקון לסגירת החיבור בין הטפט לקיר ולכיור, כדי שמים לא ייכנסו מתחת לציפוי." },
  ...files(path.join(MAIN, STRIPS_DIR))
    .filter(isImage)
    .map((f, i) => {
      const slug = `strips-${String(i + 1).padStart(2, "0")}`;
      return {
        slug,
        title: clean(stem(f)),
        addon_type: "door_strips",
        price: PRICE_STRIPS,
        applies_to: ["door"],
        description: `תוספת לדלת: ${clean(stem(f))}. המחיר לצד אחד של דלת.`,
        image_path: image(`addons/${slug}.webp`, `${MAIN}/${STRIPS_DIR}/${f}`),
      };
    }),
  ...Array.from({ length: 10 }, (_, digit) => ({
    slug: `door-number-${digit}`,
    title: `מספר לדלת ${digit}`,
    addon_type: "door_number",
    price: PRICE_DOOR_NUMBER,
    applies_to: ["door"],
    description: `הספרה ${digit} לדלת. מרכיבים את מספר הדירה מספרות בודדות.`,
    // The photos do not exist yet; they will be made from the client's reference.
    image_path: `addons/door-number-${digit}.webp`,
  })),
  { slug: "installation", title: "התקנה מקצועית", addon_type: "service", price: PRICE_INSTALLATION, applies_to: ["door", "designed_door"], description: "מתקין של סולודור מגיע אליכם ומדביק את הטפט. תוספת קבועה להזמנה, מעבר למחיר החומר." },
  { slug: "sample", title: "דוגמית לבית", addon_type: "sample", price: PRICE_SAMPLE, applies_to: ["all"], description: "דוגמית של הגוון נשלחת אליכם הביתה, כדי לראות את הצבע והטקסטורה לפני שמזמינים." },
].map((a, i) => ({ image_path: "", ...a, is_active: true, sort_order: i + 1, shopify_variant_id: "" }));

writeCsv(
  OUT,
  "06_addons.csv",
  ["slug", "title", "addon_type", "price", "applies_to", "description", "image_path", "is_active", "sort_order", "shopify_variant_id"],
  addons,
);

/* ───────────── 07 rug sizes (from "שטיח pvc/מחירון.txt") ───────────── */

const rugSizes = fs
  .readFileSync(path.join(SRC, RUGS, "מחירון.txt"), "utf8")
  .split(/\r?\n/)
  .map((line) => line.match(/(\d+)x(\d+)\s*-\s*(\d+)/))
  .filter(Boolean)
  .map((m, i) => ({ size_key: `${m[1]}x${m[2]}`, width_cm: +m[1], length_cm: +m[2], price: +m[3], sort_order: i + 1, shopify_variant_id: "" }));
writeCsv(OUT, "07_rug_sizes.csv", ["size_key", "width_cm", "length_cm", "price", "sort_order", "shopify_variant_id"], rugSizes);

/* ───────────── 08 benefits (the icon strip) ───────────── */

const COATINGS = ["wallpaper", "designed_door"];
const benefits = [
  { icon: "Scissors", title: "התקנה עצמית פשוטה", text: "מדביקים לבד עם קלף וסכין יפנית", product_types: COATINGS },
  { icon: "ShieldCheck", title: "מוגן משריטות ומדהייה", text: "שכבת הגנה ששומרת על הצבע", product_types: COATINGS },
  { icon: "LayerGroup", title: "ציפוי עבה ועמיד", text: "חומר פולימרי לשימוש יומיומי", product_types: COATINGS },
  { icon: "Home", title: "בלי לפרק ובלי להחליף", text: "נדבק על המשטח הקיים", product_types: COATINGS },
  { icon: "Truck", title: "משלוח עד הבית", text: `לכל הארץ, תוך ${SHIPPING_DAYS} ימי עסקים`, product_types: ["wallpaper", "designed_door", "pvc_rug"] },
  { icon: "ChatDots", title: "ליווי בווצאפ", text: "שאלה על מדידה או הדבקה? אנחנו זמינים", product_types: COATINGS },
  { icon: "ShieldCheck", title: "אינו סופג נוזלים", text: "משטח PVC אטום", product_types: ["pvc_rug"] },
  { icon: "Brush", title: "קל ומהיר לניקוי", text: "מטלית לחה ומים", product_types: ["pvc_rug"] },
  { icon: "LayerGroup", title: "עובי 2.5 מ\"מ", text: "דק ונשאר שטוח על הרצפה", product_types: ["pvc_rug"] },
  { icon: "Heart", title: "לילדים ולחיות מחמד", text: "נוח לשימוש יומיומי", product_types: ["pvc_rug"] },
].map((b, i) => ({ ...b, sort_order: i + 1 }));
writeCsv(OUT, "08_benefits.csv", ["icon", "title", "text", "product_types", "sort_order"], benefits);

/* ───────────── 09 info tabs (shipping and returns) ───────────── */

const infoTabs = [
  {
    slug: "shipping",
    title: "משלוחים",
    body: [
      `משלוח עד הבית לכל הארץ בעלות של ${SHIPPING_PRICE} ש"ח. ההזמנה מגיעה תוך ${SHIPPING_DAYS} ימי עסקים.`,
      "הטפט נשלח מגולגל באריזה קשיחה, כדי שיגיע בלי קפלים.",
      "הזמנתם גם התקנה לדלת? נתאם איתכם מועד בטלפון או בווצאפ אחרי ההזמנה.",
    ].join("\n\n"),
    product_types: ["wallpaper", "designed_door", "pvc_rug"],
  },
  {
    slug: "returns",
    title: "החזרות והחלפות",
    body: [
      "טפט שנחתך לפי המידה שהזמנתם מיוצר במיוחד עבורכם, ולכן אי אפשר להחזיר או להחליף אותו.",
      "לא בטוחים בגוון? הזמינו דוגמית לפני הרכישה, כדי לראות את הצבע והטקסטורה בבית.",
      "קיבלתם מוצר פגום או שונה ממה שהזמנתם? שלחו לנו תמונה בווצאפ ונטפל בזה.",
    ].join("\n\n"),
    product_types: COATINGS,
  },
  {
    slug: "returns-rugs",
    title: "החזרות והחלפות",
    body: "השטיח מיוצר בהתאם להזמנה, ולכן ביטול, החזרה או החלפה כפופים למדיניות הביטולים וההחזרות של SoloFloor.",
    product_types: ["pvc_rug"],
  },
].map((t, i) => ({ ...t, sort_order: i + 1 }));
writeCsv(OUT, "09_info_tabs.csv", ["slug", "title", "body", "product_types", "sort_order"], infoTabs);

/* ───────────── 10 FAQs: one set per category, shared by every model in it ───────────── */

const SELF_INSTALL_ANSWER = "לא. המחיר הוא לחומר בלבד, וההדבקה נעשית בעצמכם. אפשר להוסיף להזמנה את כלי העבודה הדרושים, ואם יש שאלות נשמח לעזור בוואטסאפ ובטלפון.";
const commonFaq = (surface, installOffered = false) => [
  ["אפשר להדביק לבד?", `כן. הטפט מגיע בהדבקה עצמית, ומדביקים אותו על ${surface} עם קלף וסכין יפנית. עובדים לאט, מהמרכז החוצה, ומחליקים בועות לכיוון הקצוות.`],
  ["המחיר כולל התקנה?", installOffered ? `לא. המחיר הוא לחומר בלבד. מי שמעדיף מתקין יכול לסמן התקנה מקצועית בהזמנה, בתוספת ${PRICE_INSTALLATION} ש"ח להזמנה.` : SELF_INSTALL_ANSWER],
  ["אפשר לראות את הגוון לפני שמזמינים?", "כן. אפשר להזמין דוגמית לבית ולראות את הצבע והטקסטורה באור של הבית שלכם."],
  ["איך מנקים את הטפט?", "ניקוי עדין במטלית לחה. כדאי להימנע מסקוטש מחוספס ומחומרים שורטים."],
];

const faqSets = {
  door: [
    ["כמה חומר צריך לדלת?", "יחידה אחת מכסה צד אחד של דלת בגודל רגיל. כדי לחדש את שני הצדדים מזמינים שתי יחידות."],
    ["צריך לפרק את הידית?", "מומלץ לפרק את הידית ואת העינית לפני ההדבקה ולהחזיר אותן בסיום. כך הטפט יוצא חלק ורציף."],
    ["זה מתאים גם לדלת כניסה וגם לדלת פנים?", "כן. הטפט נדבק על כל דלת עם משטח חלק, נקי ויבש."],
    ...commonFaq("הדלת", true),
  ],
  kitchen: [
    ["כמה חומר צריך למטבח?", `מודדים גובה ורוחב של כל חזית, מחברים ומוסיפים כ-10% רזרבה. רוחב הגליל הוא ${ROLL_WIDTH_CM} ס"מ.`],
    ["הטפט מחזיק בתנאים של מטבח?", "כן. הציפוי מיועד לשימוש יומיומי במטבח, כולל חום ורטיבות."],
    ["צריך לפרק את הדלתות של הארונות?", "לא חובה. מספיק לפרק את הידיות, ולהדביק חזית אחרי חזית."],
    ...commonFaq("חזיתות המטבח"),
  ],
  fridge: [
    ["כמה חומר צריך למקרר?", `מודדים גובה ורוחב של כל דלת וכל צד שרוצים לכסות, ומוסיפים כ-10% רזרבה. רוחב הגליל הוא ${ROLL_WIDTH_CM} ס"מ.`],
    ["איך מכינים את המקרר להדבקה?", "מנקים היטב את המשטח משומן ומאבק ומייבשים. אם אפשר, מפרקים את הידיות לפני ההדבקה."],
    ["אפשר לכסות רק את הדלתות?", "כן. אפשר לכסות רק את החזית, או גם את הצדדים הגלויים של המקרר."],
    ...commonFaq("המקרר"),
  ],
  countertop: [
    ["כמה חומר צריך למשטח השיש?", `מודדים אורך ועומק של המשטח כולל הקנט הקדמי, ומוסיפים כ-10% רזרבה. רוחב הגליל הוא ${ROLL_WIDTH_CM} ס"מ.`],
    ["למה צריך סיליקון?", "הסיליקון סוגר את החיבור בין הטפט לקיר ולכיור, כדי שמים לא ייכנסו מתחת לציפוי."],
    ["אפשר להניח סיר חם על המשטח?", "מומלץ להשתמש בתחתית לסירים ובקרש חיתוך, כמו בכל משטח עבודה, כדי לשמור על הציפוי לאורך זמן."],
    ...commonFaq("משטח השיש"),
  ],
  wall: [
    ["כמה חומר צריך לקיר?", `מודדים רוחב וגובה של הקיר ומחשבים כמה רצועות צריך. רוחב הגליל הוא ${ROLL_WIDTH_CM} ס"מ. מוסיפים כ-10% רזרבה.`],
    ["על איזה קיר אפשר להדביק?", "על קיר חלק, נקי ויבש. קיר מחוספס או מתקלף צריך החלקה לפני ההדבקה."],
    ["איך מחברים בין רצועות?", "מדביקים רצועה אחרי רצועה מלמעלה למטה, ומצמידים את הרצועות זו לזו בקו ישר."],
    ...commonFaq("הקיר"),
  ],
  "electric-cabinet": [
    ["כמה חומר צריך לארון חשמל?", "מודדים גובה ורוחב של דלת הארון ומוסיפים כמה סנטימטרים לכל צד לקיפול."],
    ["הארון נשאר נגיש אחרי ההדבקה?", "כן. מדביקים על הדלת של הארון בלבד, והיא נפתחת ונסגרת כרגיל."],
    ["אפשר להתאים את הארון לדלת הכניסה?", "כן. אפשר להזמין את אותו גוון לדלת ולארון החשמל, כדי שהכניסה תיראה אחידה."],
    ...commonFaq("דלת הארון"),
  ],
  designed_door: [
    ["מה ההבדל בין טפט מעוצב לטפט חלק?", "טפט מעוצב מודפס עם דוגמה, מסגרות או פסים ואפקט עומק תלת ממדי. טפט חלק הוא גוון או טקסטורה אחידים."],
    ["כמה חומר צריך לדלת?", "יחידה אחת מכסה צד אחד של דלת בגודל רגיל. כדי לחדש את שני הצדדים מזמינים שתי יחידות."],
    ["צריך לפרק את הידית?", "מומלץ לפרק את הידית ואת העינית לפני ההדבקה ולהחזיר אותן בסיום."],
    ...commonFaq("הדלת", true).filter(([q]) => !q.includes("הגוון")),
  ],
  pvc_rug: [
    ["איך מנקים את השטיח?", "לניקוי שוטף מספיק בדרך כלל לנגב במטלית לחה ובמים. אין להשתמש באקונומיקה, בחומרים המכילים אלכוהול, במסירי שומנים חריפים או בסקוטש מחוספס."],
    ["האם השטיח מתאים למטבח?", "כן. משטח ה-PVC אינו סופג נוזלים וקל לניקוי, ולכן הוא מתאים במיוחד למטבח ולאזורים שבהם יש לכלוך והתזות."],
    ["האם השטיח מחליק?", "רמת האחיזה של השטיח תלויה בסוג הרצפה ובמצבה. מומלץ להניח אותו על משטח ישר, נקי ויבש."],
    ["מה עובי השטיח?", "עובי השטיח הוא 2.5 מ\"מ, כך שהוא בעל פרופיל דק ונשאר שטוח על הרצפה."],
    ["האם הוא מתאים לילדים ולחיות מחמד?", "כן. המשטח אינו סופג נוזלים וקל לניקוי, ולכן הוא נוח במיוחד לבתים עם ילדים וחיות מחמד."],
    ["אפשר להזמין מידה אישית?", "כן. בנוסף למידות הקבועות, אפשר לבדוק אפשרות לייצור במידה אישית בהתאם למגבלות הייצור."],
    ["האם הצבע יהיה בדיוק כמו בתמונה?", "ייתכנו הבדלים קלים בגוון ובבהירות בין התצוגה במסך לבין המוצר המודפס בפועל."],
    ["אפשר להחזיר או להחליף?", "השטיח מיוצר בהתאם להזמנה, ולכן ביטול, החזרה או החלפה כפופים למדיניות הביטולים וההחזרות של SoloFloor."],
  ],
};

const faqs = Object.entries(faqSets).flatMap(([scope, items]) =>
  items.map(([question, answer], i) => ({ scope, sort_order: i + 1, question, answer })),
);
writeCsv(OUT, "10_faqs.csv", ["scope", "sort_order", "question", "answer"], faqs);

/* ───────────── private + notes ───────────── */

writeCsv(PRIVATE, "image-sources.csv", ["image_path", "source_file"], imageSources);
writeCsv(PRIVATE, "supplier-material-files.csv", ["handle", "title", "material_files"], supplierFiles);

fs.writeFileSync(path.join(OUT, "build-notes.txt"), notes.join("\n") + "\n");
console.log(`\nnotes (${notes.length}):\n` + notes.join("\n"));
