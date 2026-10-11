/**
 * Hands the cart over to the Shopify checkout, where the customer pays.
 *
 * Every cart line maps to one Shopify variant through its SKU, and the checkout opens from a cart link
 * (https://<shop>/cart/<variant>:<qty>,<variant>:<qty>). Shipping, tax and payment are Shopify's from there on.
 * The SKU to variant list is `shopify-variants.json`, written by scripts/pull-shopify-variants.cjs.
 */
import type { CartLine } from "./cart";

/** The Shopify store that takes the payment. */
const SHOP_URL = "https://1ass3z-be.myshopify.com";

const INSTALLATION_ID = "installation";
const isSample = (line: CartLine) => line.id.startsWith("sample:");

/** The SKU of a line as it is delivered by post. Samples are priced by their place in the order, see `resolve`. */
function baseSku(line: CartLine): string {
  const [first, ...rest] = line.id.split(":");
  if (!rest.length) return `addon__${first}`; // installation, a door digit, a tool
  if (rest[0].startsWith("strips-")) return `addon__${rest[0]}`;
  return [first, ...rest].join("__"); // wallpaper + surface, designed door + colour, rug + size
}

/** What the installer brings along when installation is ordered: door coverings and door digits. */
const comesWithInstaller = (sku: string) => sku.endsWith("__door") || sku.startsWith("door-") || sku.startsWith("addon__door-number-");

/** Each line as { sku, qty }. */
function resolve(lines: CartLine[]): { sku: string; qty: number; title: string }[] {
  // With installation nothing is posted: the installed variants need no shipping, so the checkout charges none.
  const installed = lines.some((line) => line.id === INSTALLATION_ID);
  let samples = 0;
  return lines.map((line) => {
    if (isSample(line)) {
      // The first sample of an order is free, every further one is paid.
      const kind = samples++ === 0 ? "first" : "extra";
      return { sku: `sample-${kind}__${line.id.slice("sample:".length)}`, qty: 1, title: line.title };
    }
    const sku = baseSku(line);
    return { sku: installed && comesWithInstaller(sku) ? `${sku}__install` : sku, qty: line.qty, title: line.title };
  });
}

export class CheckoutError extends Error {}

/**
 * The address of the Shopify checkout holding exactly this cart. Throws when a line has no Shopify variant.
 * `termsVersion` is the date of the terms the customer ticked; it is kept on the order as proof of consent.
 */
export async function checkoutUrl(lines: CartLine[], termsVersion?: string): Promise<string> {
  if (!lines.length) throw new CheckoutError("הסל ריק");
  // Loaded only when the customer goes to pay, so the list is not part of every page.
  const variants = (await import("./shopify-variants.json")).default as Record<string, number>;
  const quantities = new Map<number, number>();
  const missing: string[] = [];
  for (const { sku, qty, title } of resolve(lines)) {
    const id = variants[sku];
    if (!id) missing.push(title);
    else quantities.set(id, (quantities.get(id) ?? 0) + qty);
  }
  if (missing.length) throw new CheckoutError(`אין אפשרות לשלם על: ${missing.join(", ")}`);
  const url = `${SHOP_URL}/cart/${[...quantities].map(([id, qty]) => `${id}:${qty}`).join(",")}`;
  const attributes = new URLSearchParams();
  if (termsVersion) attributes.set("attributes[אישור תקנון]", `אושר, נוסח ${termsVersion}`);
  // Installation is only possible inside the service areas; the city typed with it is kept on the order.
  const installCity = lines.find((line) => line.id === INSTALLATION_ID)?.city;
  if (installCity) attributes.set("attributes[עיר ההתקנה]", installCity);
  const query = attributes.toString();
  return query ? `${url}?${query}` : url;
}
