/**
 * Refreshes the SKU to Shopify variant list the checkout uses.
 *
 *   node scripts/pull-shopify-variants.cjs
 *
 * Reads the shop's public product list and writes src/components/solodoor/shop/shopify-variants.json.
 * Run it after products or variants change in Shopify. It works once the shop is open to visitors;
 * while the shop is still password protected the public list answers 401 and the file is left as it is.
 */
const fs = require("fs");
const path = require("path");

const SHOP_URL = "https://1ass3z-be.myshopify.com";
const OUT = path.join(__dirname, "..", "src", "components", "solodoor", "shop", "shopify-variants.json");

(async () => {
  const map = {};
  for (let page = 1; page < 50; page++) {
    const res = await fetch(`${SHOP_URL}/products.json?limit=250&page=${page}`);
    if (!res.ok) throw new Error(`The shop answered ${res.status}. Is it still password protected?`);
    const { products } = await res.json();
    if (!products.length) break;
    for (const product of products) for (const variant of product.variants) if (variant.sku) map[variant.sku] = variant.id;
  }
  const sorted = Object.fromEntries(Object.keys(map).sort().map((sku) => [sku, map[sku]]));
  if (!Object.keys(sorted).length) throw new Error("No variants found; the file was not changed.");
  fs.writeFileSync(OUT, JSON.stringify(sorted) + "\n");
  console.log(`${Object.keys(sorted).length} variants written to ${path.relative(process.cwd(), OUT)}`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
