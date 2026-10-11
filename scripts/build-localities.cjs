/**
 * Builds the list of every locality in Israel for the installation field, and marks the ones inside the installation areas.
 *
 *   node scripts/build-localities.cjs
 *
 * Source: the Ministry of the Interior list of localities on data.gov.il (name, sub-district, regional council).
 * Output: src/components/solodoor/shop/localities.json, rows of [name, 1 when Solodoor installs there, else 0].
 *
 * The areas follow the sub-districts the client named (Nahariya and Acre, Haifa and the Krayot, the northern coastal plain,
 * the Sharon, Gush Dan, the Shfela, Modiin). Where a sub-district reaches far beyond the area (Wadi Ara, the Misgav, the
 * Galilee villages) only the places near the area are marked. To change an area, edit the rules below and run the script again.
 */
const fs = require("fs");
const path = require("path");

const SOURCE = "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&limit=3000";
const OUT = path.join(__dirname, "..", "src", "components", "solodoor", "shop", "localities.json");

/** Sub-districts whose every locality is inside an installation area. */
const WHOLE = new Set(["חיפה", "השרון", "פתח תקווה", "תל אביב", "רמת גן", "חולון", "רמלה", "רחובות"]);

/** Sub-districts where only some regional councils, and the listed cities, are inside an area. */
const PARTIAL = {
  עכו: {
    councils: ["מטה אשר", "מעלה יוסף"],
    places: [
      "נהריה", "עכו", "מעלות-תרשיחא", "שלומי", "כרמיאל", "כפר ורדים", "אבו סנאן", "ג'דיידה-מכר", "כפר יאסיף",
      "יאנוח-ג'ת", "ג'ולס", "ירכא", "מזרעה", "חורפיש", "פקיעין (בוקייעה)", "בית ג'ן",
    ],
  },
  חדרה: {
    councils: ["חוף הכרמל", "אלונה", "מנשה"],
    places: ["חדרה", "אור עקיבא", "בנימינה-גבעת עדה", "פרדס חנה-כרכור", "זכרון יעקב"],
  },
};

(async () => {
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`data.gov.il answered ${res.status}`);
  const records = (await res.json()).result.records;
  const rows = new Map();
  for (const record of records) {
    const name = String(record["שם_ישוב"]).trim();
    if (!name || name === "לא רשום") continue;
    const subDistrict = record["שם_נפה"];
    const council = record["שם_מועצה"];
    let inside = WHOLE.has(subDistrict);
    const partial = PARTIAL[subDistrict];
    if (partial) inside = partial.councils.includes(council) || partial.places.includes(name);
    // The same name can be listed twice (a kibbutz and a moshav): it counts as inside when one of them is.
    rows.set(name, (rows.get(name) || 0) | (inside ? 1 : 0));
  }
  const list = [...rows].sort((a, b) => a[0].localeCompare(b[0], "he")).map(([name, inside]) => [name, inside]);
  fs.writeFileSync(OUT, JSON.stringify(list) + "\n");
  console.log(`${list.length} localities written to ${path.relative(process.cwd(), OUT)}, ${list.filter((r) => r[1]).length} inside the installation areas`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
