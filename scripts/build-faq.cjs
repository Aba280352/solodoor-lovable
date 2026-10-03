/**
 * Builds the FAQ page's questions (data/faq/faq-items.json and faq-items.sql) from what already exists:
 *
 *   node scripts/build-faq.cjs
 *
 * Sources: the FAQ sets of the catalogue (data/catalog/10_faqs.csv), the six questions of the
 * homepage, the rug FAQ of the old site (already part of the catalogue), and the articles of the
 * old site that are phrased as questions (their excerpt answers them, with a link to the article).
 * Every question carries the categories it matters for; "all" means it matters for all of them.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/^﻿/, "");

function parseCsv(text) {
  const rows = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  const [h, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}

const noDashes = (s) => s.replace(/\s*[–—]\s*/g, ", ").replace(/&#8211;/g, ",");
const items = [];
const seen = new Map();
function add({ question, answer, categories, article }) {
  const key = question.trim();
  if (seen.has(key)) {
    const existing = items[seen.get(key)];
    existing.categories = [...new Set([...existing.categories, ...categories])];
    return;
  }
  seen.set(key, items.length);
  items.push({ question: key, answer: noDashes(answer.trim()), categories: [...new Set(categories)], article: article ?? null });
}

const USES = ["door", "kitchen", "fridge", "countertop", "wall", "electric-cabinet"];
const WALLPAPER_SCOPES = [...USES, "designed_door"];

/* 1. General questions that matter for every category. */
add({ question: "אפשר להדביק לבד?", answer: "כן. הטפט מגיע בהדבקה עצמית, ומדביקים אותו על המשטח הקיים עם קלף וסכין יפנית. עובדים לאט, מהמרכז החוצה, ומחליקים בועות לכיוון הקצוות. מי שמעדיף יכול להוסיף התקנה מקצועית בהזמנה.", categories: WALLPAPER_SCOPES });
add({ question: "המחיר כולל התקנה?", answer: "לא. המחיר הוא לחומר בלבד. מי שמעדיף מתקין יכול לסמן התקנה מקצועית בהזמנה, בתוספת 500 ש\"ח להזמנה.", categories: WALLPAPER_SCOPES });
add({ question: "אפשר לראות את הגוון לפני שמזמינים?", answer: "כן. אפשר להזמין דוגמית לבית, ללא תשלום, ולראות את הצבע והטקסטורה באור של הבית שלכם.", categories: USES });
add({ question: "איך מנקים את הטפט?", answer: "ניקוי עדין במטלית לחה. כדאי להימנע מסקוטש מחוספס ומחומרים שורטים.", categories: WALLPAPER_SCOPES });
add({ question: "כמה עולה משלוח וכמה זמן לוקח לקבל?", answer: "משלוח עד הבית לכל הארץ בעלות של 55 ש\"ח. ההזמנה מגיעה תוך 7 ימי עסקים.", categories: [...WALLPAPER_SCOPES, "pvc_rug"] });
add({ question: "מה המינימום להזמנה?", answer: "טפט הנמכר לפי מטר מוזמן במינימום של 2 מטר. דלת נמכרת לפי צד: יחידה אחת מכסה צד אחד של דלת בגודל רגיל.", categories: WALLPAPER_SCOPES });
add({ question: "אפשר להחזיר או להחליף?", answer: "טפט שנחתך לפי המידה שהזמנתם מיוצר במיוחד עבורכם, ולכן אי אפשר להחזיר או להחליף אותו. לא בטוחים בגוון? הזמינו דוגמית לפני הרכישה. קיבלתם מוצר פגום או שונה ממה שהזמנתם? שלחו לנו תמונה בווצאפ ונטפל בזה.", categories: WALLPAPER_SCOPES });
add({ question: "אילו כלים צריך כדי להדביק?", answer: "קלף להחלקת הטפט וסכין יפנית לחיתוך. במשטח שיש מומלץ גם סיליקון לסגירת החיבור לקיר ולכיור. אפשר להוסיף את הכלים להזמנה.", categories: WALLPAPER_SCOPES });

/* 2. The homepage's questions. */
for (const [q, a] of [
  ["איך מתבצעת ההתקנה?", "לאחר בחירת הדגם והמידות, אפשר להדביק בעצמכם או להוסיף התקנה מקצועית בבית הלקוח, עם גימור נקי ומדויק."],
  ["איך מודדים נכון לפני הזמנה?", "אפשר להיעזר בטיפ המדידה שבדף המוצר או לשלוח תמונה ומידות משוערות בווצאפ, כדי שנוכל לכוון אתכם בצורה נכונה."],
  ["האם הציפוי עמיד לאורך זמן?", "כן. הציפויים נבחרים לשימוש יומיומי, עם עמידות טובה ושמירה על מראה אסתטי לאורך זמן."],
  ["כמה זמן לוקח התהליך?", "משך התהליך משתנה לפי סוג המשטח והיקף העבודה, אך המטרה היא לייצר תהליך נוח, מדויק ויעיל."],
  ["איך שומרים על הציפוי?", "ניקוי עדין במטלית לחה ושימוש נכון ישמרו על מראה נקי, אסתטי ועמיד לאורך זמן."],
  ["האם זה מתאים גם למטבחים ולמקררים?", "כן. יש פתרונות ייעודיים גם לדלתות, מטבחים, מקררים, משטחי שיש, קירות וארונות חשמל."],
]) add({ question: q, answer: a, categories: [...WALLPAPER_SCOPES] });

/* 3. The catalogue's per-category sets (rugs included, they come from the old site's rug page). */
const bySet = new Map();
for (const r of parseCsv(read("data/catalog/10_faqs.csv"))) {
  if (!bySet.has(r.question)) bySet.set(r.question, { answer: r.answer, scopes: [] });
  bySet.get(r.question).scopes.push(r.scope);
}
for (const [question, { answer, scopes }] of bySet) {
  if (seen.has(question)) continue; // already covered by a general question above
  if (scopes.length >= 4) continue; // repeated per category: the general version above says it
  add({ question, answer, categories: scopes });
}

/* 4. Articles of the old site that are phrased as questions; the excerpt answers, the article follows. */
const articles = JSON.parse(read("data/articles/articles.json"));
const ARTICLE_QUESTIONS = [
  ["האם-טפט-מתקלף", "האם טפט מתקלף?", WALLPAPER_SCOPES, "בתנאים מסוימים כן, אבל ברוב המקרים הקילוף הוא תוצאה של חומר לא מתאים, הכנת שטח חסרה, לחות או התקנה לא מדויקת. חיפוי איכותי שמותקן על משטח שהוכן נכון נשאר יפה ועמיד במשך שנים."],
  ["kama-zman-mahazik-tapet", "כמה זמן מחזיק טפט?", WALLPAPER_SCOPES, "זה תלוי בחומר, במשטח, בהתקנה ובתחזוקה. חומר איכותי והתקנה נכונה יכולים ללוות את הבית שנים רבות, ואילו בחירה לא מתאימה למשטח או טיפול אגרסיבי מקצרים את חייו."],
  ["pvc-mul-madbeka", "מה ההבדל בין PVC למדבקה רגילה?", WALLPAPER_SCOPES, "PVC הוא חומר פולימרי נפוץ, גמיש ועמיד. מדבקה היא הגדרה רחבה לאופן שבו חומר מודבק על משטח, ולכן גם מדבקה יכולה להיות מ-PVC, אבל לא כל מדבקה היא חיפוי PVC איכותי ועבה. ההבדל נמצא בעובי החומר, באיכות הדבק ובהתקנה."],
  ["is-pvc-coating-scratch-resistant", "האם ציפוי PVC עמיד לשריטות?", WALLPAPER_SCOPES, "כן, ציפוי PVC איכותי ועבה מתמודד היטב עם השחיקה הרגילה של החיים בבית. הוא לא חסין לחלוטין מפני כל פגיעה, בדיוק כמו צבע בתנור או משטח עץ, ולכן איכות הציפוי והתקנה קובעות הרבה."],
  ["eich-menakim-tzipui-polimeri", "איך מנקים ציפוי פולימרי בלי לפגוע בגימור?", WALLPAPER_SCOPES, "בדרך כלל לא צריך חומרים חזקים או קרצוף. ניקוי עדין ונכון במטלית לחה שומר על הצבע, הטקסטורה והגימור לאורך שנים."],
  ["is-door-wallpaper-water-resistant", "האם טפט לדלת עמיד למים?", ["door", "designed_door"], "טפט או ציפוי איכותי לדלת יכול להיות עמיד מאוד למים, ללחות ולניקוי, אבל לא כל טפט הוא אותו חומר ולא כל התקנה תיתן את אותה תוצאה. ההבדל נמצא בסוג הציפוי, במצב הדלת לפני ההדבקה ובאיכות ההתקנה."],
  ["kama-zman-machzik-tzipuy-ladelet", "כמה זמן מחזיק ציפוי לדלת?", ["door", "designed_door"], "אין מספר קסם אחד. ציפוי איכותי שמותאם נכון לדלת ומותקן במקצועיות יכול להיראות מצוין במשך שנים, בעוד שחומר דק או התקנה חפוזה מאבדים מהמראה מוקדם יותר."],
  ["tzifui-polimeri-mul-tzviat-dlatot", "מה עדיף, ציפוי פולימרי או צביעת דלת?", ["door", "designed_door"], "ההבדל האמיתי הוא לא רק במחיר הראשוני אלא בעמידות, ברמת הגימור ובכמה זמן התוצאה נשארת יפה. צביעה יכולה להתאים לדלת עץ איכותית במצב מצוין, ואילו ציפוי פולימרי עוטף את הדלת בחומר חדש ומעוצב."],
  ["veneer-vs-polymer", "מה עדיף לדלת, פורניר או פולימר?", ["door", "designed_door"], "פורניר הוא חומר טבעי עם אופי ייחודי, ופולימר הוא ציפוי עמיד שנותן שינוי גדול בלי שיפוץ יקר ומלכלך. הבחירה תלויה בשימוש היומיומי, במצב התשתית, ברמת התחזוקה שמתאימה לכם ובתקציב."],
  ["tzifuy-delet-bimkom-hachlafa", "מתי משתלם לצפות דלת במקום להחליף אותה?", ["door", "designed_door"], "כשהדלת עצמה תקינה, חזקה ונפתחת כמו שצריך, ציפוי מקצועי משנה את המראה שלה מהיסוד בלי שיפוץ ארוך ויקר. קודם בודקים את מצב הדלת, ואם יש בעיה מבנית מטפלים בה לפני הציפוי."],
  ["can-you-cover-a-scratched-door", "האם אפשר לצפות דלת שרוטה בלי להחליף אותה?", ["door", "designed_door"], "ברוב המקרים כן. ציפוי איכותי מסתיר שריטות ופגמים אסתטיים, בתנאי שהדלת עצמה יציבה. הוא אינו תחליף לתיקון של בעיה מבנית, חלודה עמוקה או מנגנון שלא עובד."],
  ["haim-efshar-letzapot-delet-peguma", "האם אפשר לצפות דלת פגומה?", ["door", "designed_door"], "ברוב המקרים כן, אחרי שבודקים מה באמת נפגע, מכינים את המשטח כמו שצריך ובוחרים ציפוי שמתאים לדלת. ציפוי אינו פתרון לבעיית בטיחות או לחלודה מתקדמת."],
  ["how-to-hide-scratches-on-home-door", "איך מסתירים שריטות בדלת הבית?", ["door", "designed_door"], "זה תלוי בעומק הפגיעה ובמצב הדלת. לשריטות נקודתיות יש פתרונות מהירים, ולדלת שחוקה אפשר לחדש את כל המראה בציפוי עמיד."],
  ["ma-osim-im-delet-mitkalefet", "מה עושים עם דלת מתקלפת?", ["door", "designed_door"], "קודם בודקים אם הדלת עצמה עדיין תקינה, נסגרת היטב ויציבה. אם כן, ברוב המקרים אפשר להחזיר לה מראה חדש ונקי בציפוי, בלי להחליף אותה."],
  ["איך-לחדש-דלת-כניסה-ישנה", "איך מחדשים דלת כניסה ישנה בלי להחליף אותה?", ["door", "designed_door"], "לא תמיד צריך להחליף דלת תקינה. חיפוי איכותי מחדש את המראה, מתאים אותה לעיצוב הבית ושומר על הדלת הקיימת, ובחומר נכון ובהתקנה מקצועית התוצאה נראית כמו שדרוג מדויק ולא כמו פתרון זמני."],
  ["mechir-tzipuy-delet-pladelet", "מה משפיע על המחיר של ציפוי לדלת פלדלת?", ["door", "designed_door"], "המחיר אינו אחיד לכל דלת. הוא מושפע ממצב הדלת, מהעיצוב שבוחרים, מסוג החומר, מהיקף העבודה ומהגימור. בחנות מופיע מחיר ברור לצד אחד של דלת, ואפשר להוסיף התקנה מקצועית."],
  ["hidush-mitbah-be-tzipui-mul-hahlafa", "מה משתלם יותר, חידוש מטבח בציפוי או החלפה?", ["kitchen"], "בהרבה בתים גוף הארונות חזק, החלוקה נוחה והמשטח תקין, ורק המראה החיצוני מיושן. במצב כזה ציפוי מאפשר להחליף צבע וסגנון בלי לפרק את המטבח. לא כל מטבח מתאים לחידוש בציפוי, וההחלטה תלויה במצב התשתית, בהרגלי השימוש ובתקציב."],
  ["madric-lehipuy-mekarerim", "מה כדאי לבדוק לפני שמחפים מקרר?", ["fridge"], "אם המקרר עובד מצוין, אפשר לחדש את הנראות שלו בציפוי במקום להחליף אותו. כדאי לבדוק את מצב המקרר, אילו חלקים רוצים לחפות ואיך מטפלים בידיות, בפינות ובדפנות גלויות."],
  ["איך-מחפים-קיר", "איך מחפים קיר בצורה נקייה ועמידה?", ["wall"], "בוחרים חומר נכון, מכינים את הקיר בצורה מדויקת ומדביקים בגימור נקי. חשוב להבין מה מצב הקיר, איזה חיפוי מתאים לו ואיך בוחרים עיצוב שמשתלב בבית."],
  ["home-electrical-cabinet-cladding", "אפשר לחפות ארון חשמל ביתי?", ["electric-cabinet"], "כן. חיפוי ארון חשמל הופך את הנקודה הטכנית הזאת לחלק מהעיצוב, בלי להחליף את הארון ובלי לפגוע בתפקיד שלו."],
];
for (const [slug, question, categories, answer] of ARTICLE_QUESTIONS) {
  const a = articles.find((x) => x.slug === slug);
  if (!a) throw new Error("article not found: " + slug);
  add({ question, answer, categories, article: a.slug });
}

/* Order: the questions that matter to everyone first, then by category. */
const rank = (it) => (it.categories.length >= WALLPAPER_SCOPES.length ? 0 : 1);
items.sort((a, b) => rank(a) - rank(b));
items.forEach((it, i) => (it.sort_order = i + 1));

const outDir = path.join(ROOT, "data", "faq");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "faq-items.json"), JSON.stringify(items, null, 1));

const dollar = (s) => `$q$${s}$q$`;
const sql =
  "delete from faq_items;\n" +
  "insert into faq_items (question, answer, categories, article_slug, sort_order) values\n" +
  items.map((it) => `(${dollar(it.question)}, ${dollar(it.answer)}, '{${it.categories.join(",")}}', ${it.article ? dollar(it.article) : "null"}, ${it.sort_order})`).join(",\n") +
  ";";
fs.writeFileSync(path.join(outDir, "faq-items.sql"), sql);

const count = {};
for (const it of items) for (const c of it.categories) count[c] = (count[c] || 0) + 1;
console.log(`${items.length} questions`, JSON.stringify(count));
console.log(items.map((it) => `${it.sort_order}. [${it.categories.length >= 7 ? "all" : it.categories.join("+")}] ${it.question}${it.article ? "  ->" + it.article : ""}`).join("\n"));
