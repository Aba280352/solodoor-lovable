/**
 * Hands the cart over to the Shopify checkout, where the customer pays.
 *
 * Every cart line maps to one Shopify variant through its SKU, and the checkout opens from a cart link
 * (https://<shop>/cart/<variant>:<qty>,<variant>:<qty>). Shipping, tax and payment are Shopify's from there on.
 * The SKU to variant list is `shopify-variants.json`, written by scripts/pull-shopify-variants.cjs.
 */
import { supabase } from "@/integrations/supabase/client";

import { isInstallLine, type CartLine } from "./cart";

/** The Shopify store that takes the payment. */
const SHOP_URL = "https://1ass3z-be.myshopify.com";

const isSample = (line: CartLine) => line.id.startsWith("sample:");

/** The SKU of a line as it is delivered by post. Samples are priced by their place in the order, see `resolve`. */
function baseSku(line: CartLine): string {
  if (line.sku) return line.sku; // the installation of a door, by its kind
  const [first, ...rest] = line.id.split(":");
  if (!rest.length) return `addon__${first}`; // a door digit, a tool
  if (rest[0].startsWith("strips-")) return `addon__${rest[0]}`;
  return [first, ...rest].join("__"); // wallpaper + surface, designed door + colour, rug + size
}

/** What the installer brings along when installation is ordered: door coverings and door digits. */
const comesWithInstaller = (sku: string) => sku.endsWith("__door") || sku.startsWith("door-") || sku.startsWith("addon__door-number-");

/** Each line as { sku, qty }. Ten centimetres of wallpaper are their own item in the shop (the SKU of the surface plus "__tenth"). */
function resolve(lines: CartLine[]): { sku: string; qty: number; title: string }[] {
  // With installation nothing is posted: the installed variants need no shipping, so the checkout charges none.
  const installed = lines.some(isInstallLine);
  let samples = 0;
  return lines.flatMap((line) => {
    if (isSample(line)) {
      // The first sample of an order is free, every further one is paid.
      const kind = samples++ === 0 ? "first" : "extra";
      return [{ sku: `sample-${kind}__${line.id.slice("sample:".length)}`, qty: 1, title: line.title }];
    }
    const sku = baseSku(line);
    const shopSku = installed && comesWithInstaller(sku) ? `${sku}__install` : sku;
    // Metres are sold to the ten centimetres: 2.3 metres go to the shop as 2 metres and 3 items of ten centimetres.
    const tenthsTotal = Math.round(line.qty * 10);
    const whole = Math.floor(tenthsTotal / 10);
    const tenths = tenthsTotal % 10;
    return [
      ...(whole > 0 ? [{ sku: shopSku, qty: whole, title: line.title }] : []),
      ...(tenths ? [{ sku: `${shopSku}__tenth`, qty: tenths, title: line.title }] : []),
    ];
  });
}

export class CheckoutError extends Error {}

/**
 * The address of the Shopify checkout holding exactly this cart. Throws when a line has no Shopify variant.
 * `termsVersion` is the date of the terms the customer ticked; it is kept on the order as proof of consent.
 */
export async function checkoutUrl(lines: CartLine[], termsVersion?: string): Promise<string> {
  if (!lines.length) throw new CheckoutError("הסל ריק");
  const items = resolve(lines);
  // The ids come from the database, where the admin's Shopify sync keeps them; the bundled list stands in
  // for products synced before that table existed. Both are loaded only when the customer goes to pay.
  const [bundled, { data: synced }] = await Promise.all([
    import("./shopify-variants.json").then((m) => m.default as Record<string, number>),
    supabase.from("shopify_variants").select("sku, variant_id").in("sku", items.map((i) => i.sku)),
  ]);
  const variants: Record<string, number> = { ...bundled };
  for (const row of (synced ?? []) as { sku: string; variant_id: number }[]) variants[row.sku] = Number(row.variant_id);
  const quantities = new Map<number, number>();
  const missing: string[] = [];
  for (const { sku, qty, title } of items) {
    const id = variants[sku];
    if (!id) missing.push(title);
    else quantities.set(id, (quantities.get(id) ?? 0) + qty);
  }
  if (missing.length) throw new CheckoutError(`אין אפשרות לשלם על: ${missing.join(", ")}`);
  const url = `${SHOP_URL}/cart/${[...quantities].map(([id, qty]) => `${id}:${qty}`).join(",")}`;
  const attributes = new URLSearchParams();
  if (termsVersion) attributes.set("attributes[אישור תקנון]", `אושר, נוסח ${termsVersion}`);
  // Installation is only possible inside the service areas; the city typed with it is kept on the order.
  const installs = lines.filter(isInstallLine);
  const installCity = installs.find((line) => line.city)?.city;
  if (installCity) attributes.set("attributes[עיר ההתקנה]", installCity);
  // How the installation was counted: the doors by kind, the sides they hold and what it costs.
  const doors = (kind: CartLine["install"]) => installs.filter((line) => line.install === kind).reduce((sum, line) => sum + line.qty, 0);
  const doubles = doors("double");
  const singles = doors("single");
  if (doubles + singles > 0) {
    attributes.set("attributes[התקנה, סך הצדדים]", String(doubles * 2 + singles));
    attributes.set("attributes[התקנה, דלתות עם שני צדדים]", String(doubles));
    attributes.set("attributes[התקנה, דלתות עם צד אחד]", String(singles));
    attributes.set("attributes[התקנה, מחיר כולל]", `${installs.reduce((sum, line) => sum + line.price * line.qty, 0)} ש"ח`);
  }
  const query = attributes.toString();
  return query ? `${url}?${query}` : url;
}
