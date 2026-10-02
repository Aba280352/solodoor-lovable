/**
 * Loads data/catalog/*.csv into the Supabase catalogue tables through the REST API:
 *
 *   SUPABASE_URL=... SUPABASE_KEY=... IMPORT_TOKEN=... node scripts/import-catalog.cjs
 *
 * The catalogue tables are read-only to the public. An import needs a temporary
 * insert policy that checks the `x-import-token` request header; see README.
 * Rows are upserted, so the script can be run again after a rebuild.
 */
const fs = require("fs");
const path = require("path");

const { SUPABASE_URL, SUPABASE_KEY, IMPORT_TOKEN } = process.env;
if (!SUPABASE_URL || !SUPABASE_KEY || !IMPORT_TOKEN) throw new Error("SUPABASE_URL, SUPABASE_KEY and IMPORT_TOKEN are required");

const DIR = path.resolve(__dirname, "..", "data", "catalog");

/** RFC 4180 parser: quoted fields may hold commas, quotes and line breaks. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.length > 1 || r[0] !== "");
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// table → [file, conflict target]. Tables with a generated id are cleared by the caller before a re-import.
const TABLES = [
  ["applications", "01_applications.csv", "slug"],
  ["products", "02_products.csv", "handle"],
  ["product_applications", "03_product_applications.csv", "product_handle,application_slug"],
  ["product_images", "04_product_images.csv", null],
  ["product_variants", "05_product_variants.csv", "product_handle,variant_key"],
  ["addons", "06_addons.csv", "slug"],
  ["rug_sizes", "07_rug_sizes.csv", "size_key"],
  ["benefits", "08_benefits.csv", null],
  ["info_tabs", "09_info_tabs.csv", "slug"],
  ["faqs", "10_faqs.csv", null],
];

const ARRAY_COLUMNS = new Set(["recommended_addons", "applies_to", "product_types"]);

function toRow(record) {
  const out = {};
  for (const [key, value] of Object.entries(record)) {
    if (ARRAY_COLUMNS.has(key)) out[key] = value.replace(/^\{|\}$/g, "").split(",").filter(Boolean);
    else if (value === "") out[key] = null;
    else if (value === "true" || value === "false") out[key] = value === "true";
    else out[key] = value;
  }
  return out;
}

(async () => {
  for (const [table, file, conflict] of TABLES) {
    const rows = parseCsv(fs.readFileSync(path.join(DIR, file), "utf8").replace(/^﻿/, "")).map(toRow);
    for (let i = 0; i < rows.length; i += 100) {
      const url = `${SUPABASE_URL}/rest/v1/${table}` + (conflict ? `?on_conflict=${conflict}` : "");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
          "x-import-token": IMPORT_TOKEN,
          Prefer: conflict ? "resolution=merge-duplicates,return=minimal" : "return=minimal",
        },
        body: JSON.stringify(rows.slice(i, i + 100)),
      });
      if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    }
    console.log(`${table}: ${rows.length} rows`);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
