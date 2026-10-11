/**
 * Builds the Shopify product import file from the catalogue CSVs.
 *
 *   node scripts/build-shopify-csv.cjs
 *
 * Output: data/shopify/products.csv, in Shopify's product CSV format (Admin > Products > Import).
 * Every variant gets a SKU the site can map back: "<handle>__<application | variant key | size>".
 * Photos are read by Shopify from the live site, so they must already be published there.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IN = path.join(ROOT, "data", "catalog");
const OUT = path.join(ROOT, "data", "shopify");
const IMAGES = "https://solodoor-il.lovable.app/catalog-images/";
const VENDOR = "סולודור";

/* ───────────── CSV ───────────── */

function parseCsv(text) {
  const rows = [];
  let row = [], cur = "", quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); if (row.some((v) => v !== "")) rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}
const read = (name) => parseCsv(fs.readFileSync(path.join(IN, name), "utf8"));
const cell = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.split('"').join('""')}"` : s; };

const COLUMNS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
  "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
  "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
  "Variant Barcode", "Image Src", "Image Position", "Image Alt Text", "Gift Card", "SEO Title", "SEO Description",
  "Variant Image", "Variant Weight Unit", "Variant Tax Code", "Cost per item", "Status",
];

/* ───────────── Catalogue ───────────── */

const active = (r) => r.is_active !== "false";
const products = read("02_products.csv").filter(active);
const applications = read("01_applications.csv");
const productApplications = read("03_product_applications.csv").filter(active);
const productImages = read("04_product_images.csv");
const productVariants = read("05_product_variants.csv").filter(active);
const addons = read("06_addons.csv").filter(active);
const rugSizes = read("07_rug_sizes.csv");

const COLOR_LABELS = { white: "לבן", cream: "קרם", grey: "אפור", black: "שחור", brown: "חום", blue: "כחול", green: "ירוק", purple: "סגול", multi: "צבעוני" };
const colorsOf = (value) => String(value || "").replace(/[{}]/g, "").split(",").map((c) => c.trim()).filter(Boolean);
const html = (text) => String(text || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p}</p>`).join("");
const img = (p) => (p ? IMAGES + p : "");
const bySort = (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0);

/**
 * One product as rows. `variants`: { option, option2, sku, price, image, shipping }. `images`: { src, alt }.
 * The first row carries the product fields; variants and images share the following rows.
 */
function productRows({ handle, title, body, type, tags, optionName, option2Name, variants, images }) {
  const rows = [];
  const n = Math.max(variants.length, images.length);
  for (let i = 0; i < n; i++) {
    const v = variants[i];
    const image = images[i];
    const row = { Handle: handle };
    if (i === 0) {
      Object.assign(row, {
        Title: title, "Body (HTML)": body, Vendor: VENDOR, Type: type, Tags: tags.filter(Boolean).join(", "),
        Published: "TRUE", "Gift Card": "FALSE", Status: "active",
      });
    }
    if (v) {
      Object.assign(row, {
        "Option1 Name": i === 0 ? optionName : "", "Option1 Value": v.option,
        "Option2 Name": i === 0 && option2Name ? option2Name : "", "Option2 Value": v.option2 || "",
        "Variant SKU": v.sku, "Variant Grams": "0",
        "Variant Inventory Policy": "continue", "Variant Fulfillment Service": "manual", "Variant Price": String(v.price),
        "Variant Requires Shipping": v.shipping === false ? "FALSE" : "TRUE", "Variant Taxable": "TRUE",
        "Variant Image": v.image || "", "Variant Weight Unit": "kg",
      });
    }
    if (image) Object.assign(row, { "Image Src": image.src, "Image Position": String(i + 1), "Image Alt Text": image.alt || "" });
    rows.push(row);
  }
  return rows;
}

/**
 * With installation the installer brings the material, so nothing is shipped: every item that can be installed
 * also exists as a variant that needs no shipping. The site adds that one when installation is in the cart.
 */
const INSTALLED = " · בהתקנה";
const installed = (variants) => variants.map((v) => ({ ...v, option: v.option + INSTALLED, sku: v.sku + "__install", shipping: false }));

/** Photos without repeats, keeping the first place a photo appears in. */
const unique = (images) => images.filter((im, i) => im.src && images.findIndex((x) => x.src === im.src) === i);

const rows = [];
const summary = { wallpaper: 0, designed_door: 0, pvc_rug: 0, addons: 0, variants: 0 };

for (const p of products.sort(bySort)) {
  const tags = [p.style_family, ...colorsOf(p.colors).map((c) => COLOR_LABELS[c])];
  const gallery = productImages.filter((i) => i.product_handle === p.handle).sort(bySort).map((i) => ({ src: img(i.image_path), alt: i.alt }));

  if (p.product_type === "wallpaper") {
    const apps = applications.sort(bySort).flatMap((a) => {
      const pa = productApplications.find((x) => x.product_handle === p.handle && x.application_slug === a.slug);
      return pa ? [{ a, pa }] : [];
    });
    const variants = apps.map(({ a, pa }) => ({
      // The unit is part of the name, so an order reads "door, one side" or "kitchen, per meter".
      option: `${a.label} (${a.sell_unit === "side" ? "לצד אחד" : "למטר"})`,
      sku: `${p.handle}__${a.slug}`,
      price: pa.price_override || a.unit_price,
      image: img(pa.image_path),
    }));
    if (p.installation_available === "true") variants.push(...installed(variants.filter((v) => v.sku.endsWith("__door"))));
    const images = unique([...gallery, ...apps.map(({ pa }) => ({ src: img(pa.image_path), alt: pa.image_alt }))]);
    rows.push(...productRows({ handle: p.handle, title: `טפט ${p.title}`, body: html(p.long_description || p.short_description), type: "טפט", tags: ["טפט", ...tags], optionName: "משטח", variants, images }));
    summary.wallpaper++; summary.variants += variants.length;
  } else if (p.product_type === "designed_door") {
    const list = productVariants.filter((v) => v.product_handle === p.handle).sort(bySort);
    const variants = list.map((v) => ({ option: v.title, sku: `${p.handle}__${v.variant_key}`, price: v.price || p.base_price, image: img(v.image_path) }));
    if (p.installation_available === "true") variants.push(...installed(variants));
    const images = unique([...list.map((v) => ({ src: img(v.image_path), alt: `טפט מעוצב לדלת, ${v.title}` })), ...gallery]);
    rows.push(...productRows({ handle: p.handle, title: `טפט מעוצב לדלת, דגם ${p.title}`, body: html(p.long_description || p.short_description), type: "טפט מעוצב לדלת", tags: ["טפט מעוצב לדלת", ...tags], optionName: "גוון", variants, images }));
    summary.designed_door++; summary.variants += variants.length;
  } else if (p.product_type === "pvc_rug") {
    const variants = rugSizes.sort(bySort).map((s) => ({ option: `${s.width_cm}×${s.length_cm} ס"מ`, sku: `${p.handle}__${s.size_key}`, price: s.price, image: "" }));
    rows.push(...productRows({ handle: p.handle, title: p.title, body: html(p.long_description || p.short_description), type: "שטיח PVC", tags: ["שטיח PVC", ...tags], optionName: "מידה", variants, images: unique(gallery) }));
    summary.pvc_rug++; summary.variants += variants.length;
  }
}

/* ───────────── Add-ons ───────────── */

const addon = (slug) => addons.find((a) => a.slug === slug);
const addonRows = (spec) => { rows.push(...productRows(spec)); summary.addons++; summary.variants += spec.variants.length; };

for (const tool of addons.filter((a) => a.addon_type === "diy_tool").sort(bySort)) {
  addonRows({
    handle: `addon-${tool.slug}`, title: tool.title, body: html(tool.description), type: "כלי להדבקה", tags: ["תוספת", "כלי להדבקה"], optionName: "Title",
    variants: [{ option: "Default Title", sku: `addon__${tool.slug}`, price: tool.price, image: "" }],
    images: unique([{ src: img(tool.image_path), alt: tool.title }]),
  });
}

const strips = addons.filter((a) => a.addon_type === "door_strips").sort(bySort);
if (strips.length) {
  addonRows({
    handle: "addon-door-strips", title: "עיצוב פסים לדלת", body: html("עיצוב פסים לדלת, בהתקנה על ידי סולודור. המחיר לצד אחד של דלת."), type: "תוספת לדלת", tags: ["תוספת", "פסים לדלת"], optionName: "עיצוב",
    variants: strips.map((s) => ({ option: s.title, sku: `addon__${s.slug}`, price: s.price, image: img(s.image_path), shipping: false })),
    images: unique(strips.map((s) => ({ src: img(s.image_path), alt: `דלת עם ${s.title}` }))),
  });
}

const digits = addons.filter((a) => a.addon_type === "door_number").sort((a, b) => a.slug.localeCompare(b.slug));
if (digits.length) {
  const digitVariants = digits.map((d) => ({ option: d.slug.replace("door-number-", ""), sku: `addon__${d.slug}`, price: d.price, image: img(d.image_path) }));
  addonRows({
    handle: "addon-door-number", title: "ספרת מתכת לדלת", body: html("ספרות מתכת לדלת. מרכיבים את מספר הדירה מספרות בודדות, והמחיר לספרה אחת."), type: "תוספת לדלת", tags: ["תוספת", "מספר לדלת"], optionName: "ספרה",
    variants: [...digitVariants, ...installed(digitVariants)],
    images: unique(digits.map((d) => ({ src: img(d.image_path), alt: d.title }))),
  });
}

const installation = addon("installation");
if (installation) {
  addonRows({
    handle: "addon-installation", title: "התקנה מקצועית לדלת", body: html(installation.description), type: "שירות", tags: ["תוספת", "התקנה"], optionName: "Title",
    variants: [{ option: "Default Title", sku: "addon__installation", price: installation.price, image: "", shipping: false }],
    images: [],
  });
}

// A sample is a piece of one wallpaper, so it is sold per wallpaper and shows that wallpaper's swatch.
// The first sample of an order is free; every further one costs 5. The site puts each in the right variant.
const SAMPLE_KINDS = [
  { key: "first", label: "דוגמית ראשונה", price: 0 },
  { key: "extra", label: "דוגמית נוספת", price: 5 },
];
const sample = addon("sample");
const sampled = products.filter((p) => p.product_type === "wallpaper" && p.sample_available === "true").sort(bySort);
const swatchOf = (handle) => productImages.filter((i) => i.product_handle === handle && i.kind === "swatch").sort(bySort)[0];
if (sample && sampled.length) {
  addonRows({
    handle: "wallpaper-sample", title: "דוגמית טפט", body: html(sample.description), type: "דוגמית", tags: ["תוספת", "דוגמית"], optionName: "טפט", option2Name: "סוג",
    variants: sampled.flatMap((p) =>
      SAMPLE_KINDS.map((kind) => ({ option: p.title, option2: kind.label, sku: `sample-${kind.key}__${p.handle}`, price: kind.price, image: img(swatchOf(p.handle)?.image_path) })),
    ),
    images: unique(sampled.map((p) => ({ src: img(swatchOf(p.handle)?.image_path), alt: `דוגמית של טפט ${p.title}` }))),
  });
}

fs.mkdirSync(OUT, { recursive: true });
const lines = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))];
// A byte order mark, so the Hebrew opens correctly in Excel as well.
fs.writeFileSync(path.join(OUT, "products.csv"), "﻿" + lines.join("\r\n") + "\r\n");

const skus = rows.map((r) => r["Variant SKU"]).filter(Boolean);
const repeated = skus.filter((s, i) => skus.indexOf(s) !== i);
if (repeated.length) throw new Error("repeated SKUs: " + repeated.slice(0, 5).join(", "));
console.log(summary, "rows:", rows.length, "file:", path.relative(ROOT, path.join(OUT, "products.csv")));
