/**
 * Builds /feed.xml: the product feed Google Merchant Center fetches by itself every day.
 *
 * One item per thing a visitor can land on, exactly as the product pages describe it (same title, address, picture and
 * price as their structured data, so Google's price check passes): a wallpaper per surface, a designed door per colour,
 * a PVC rug once. The ids match the Shopify SKUs. Hidden products are never listed.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { edgeCached } from "@/lib/edge-cache";

import { SITE } from "./pages";

const DEFAULT_APP = "door";
const BRAND = "SOLODOOR";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
/** Hebrew paths percent-encoded, as Google expects. */
const enc = (url: string) => url.replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c)).replace(/ /g, "%20");
const clean = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();
const image = (path: string | null | undefined) => (path ? (/^https?:\/\//.test(path) ? path : `${SITE}/catalog-images/${path}`) : null);
const money = (n: number | string) => `${Number(n).toFixed(2)} ILS`;

const COLORS: Record<string, string> = {
  white: "לבן", grey: "אפור", black: "שחור", cream: "קרם", beige: "בז'", brown: "חום", wood: "עץ", blue: "כחול", green: "ירוק",
  red: "אדום", yellow: "צהוב", orange: "כתום", pink: "ורוד", multi: "צבעוני", gold: "זהב", silver: "כסף",
};
const colorOf = (colors: string[] | null) =>
  (colors ?? [])
    .map((c) => COLORS[c])
    .filter(Boolean)
    .slice(0, 3)
    .join("/");

interface ProductRow {
  handle: string;
  slug: string;
  title: string;
  product_type: "wallpaper" | "designed_door" | "pvc_rug";
  material: string | null;
  base_price: number | string;
  short_description: string | null;
  colors: string[] | null;
  stock_status: string | null;
  sort_order: number;
}
interface AppRow { slug: string; label: string; unit_price: number | string; short_description: string | null; sort_order: number }
interface PaRow { product_handle: string; application_slug: string; image_path: string | null; price_override: number | string | null }
interface ImgRow { product_handle: string; kind: string; sort_order: number; image_path: string | null }
interface VariantRow { product_handle: string; variant_key: string; title: string; price: number | string; image_path: string | null; sort_order: number }

interface Item {
  id: string;
  group: string;
  title: string;
  description: string;
  link: string;
  image: string | null;
  price: number | string;
  availability: string;
  type: string;
  material: string | null;
  color: string;
}

async function loadItems(): Promise<Item[]> {
  const db = supabase as unknown as SupabaseClient;
  const [products, apps, pas, images, variants] = await Promise.all([
    db.from("products").select("handle, slug, title, product_type, material, base_price, short_description, colors, stock_status, sort_order").eq("is_active", true).order("sort_order").limit(5000),
    db.from("applications").select("slug, label, unit_price, short_description, sort_order").order("sort_order").limit(100),
    db.from("product_applications").select("product_handle, application_slug, image_path, price_override").eq("is_active", true).limit(10000),
    db.from("product_images").select("product_handle, kind, sort_order, image_path").order("sort_order").limit(10000),
    db.from("product_variants").select("product_handle, variant_key, title, price, image_path, sort_order").eq("is_active", true).order("sort_order").limit(10000),
  ]);
  for (const r of [products, apps, pas, images, variants]) if (r.error) throw new Error(r.error.message);

  const productRows = (products.data ?? []) as ProductRow[];
  const appRows = (apps.data ?? []) as AppRow[];
  const paRows = (pas.data ?? []) as PaRow[];
  const imageRows = (images.data ?? []) as ImgRow[];
  const variantRows = (variants.data ?? []) as VariantRow[];

  const firstImage = (handle: string) => {
    const own = imageRows.filter((i) => i.product_handle === handle && i.image_path);
    return (own.find((i) => i.kind === "main") ?? own.find((i) => i.kind === "roll") ?? own[0])?.image_path ?? null;
  };

  const items: Item[] = [];
  for (const p of productRows) {
    const common = { group: p.handle, availability: p.stock_status === "out_of_stock" ? "out_of_stock" : "in_stock", material: p.material, color: colorOf(p.colors) };
    if (p.product_type === "wallpaper") {
      for (const app of appRows) {
        const pa = paRows.find((a) => a.product_handle === p.handle && a.application_slug === app.slug);
        if (!pa) continue;
        items.push({
          ...common,
          id: `${p.handle}__${app.slug}`,
          title: `טפט ${p.title} ל${app.label}`,
          description: clean([app.short_description, p.short_description].filter(Boolean).join(" ")),
          link: `${SITE}/product/${p.slug}${app.slug !== DEFAULT_APP ? `?tab=${app.slug}` : ""}`,
          image: image(pa.image_path) ?? image(firstImage(p.handle)),
          price: pa.price_override ?? app.unit_price,
          type: `טפט > ${app.label}`,
        });
      }
    } else if (p.product_type === "designed_door") {
      for (const v of variantRows.filter((x) => x.product_handle === p.handle)) {
        items.push({
          ...common,
          id: `${p.handle}__${v.variant_key}`,
          title: `טפט מעוצב לדלת, דגם ${p.title}: ${v.title}`,
          description: clean(p.short_description),
          link: `${SITE}/product/${p.slug}?variant=${v.variant_key}`,
          image: image(v.image_path) ?? image(firstImage(p.handle)),
          price: v.price,
          type: "טפט מעוצב לדלת",
        });
      }
    } else {
      items.push({
        ...common,
        id: p.handle,
        title: p.title,
        description: clean(p.short_description),
        link: `${SITE}/product/${p.slug}`,
        image: image(firstImage(p.handle)),
        price: p.base_price,
        type: "שטיח PVC",
      });
    }
  }
  // Google rejects an item without a picture, a description or a price: leave such a row out rather than fail the feed.
  return items.filter((i) => i.image && i.description && Number(i.price) > 0);
}

const tag = (name: string, value: unknown) => (value === undefined || value === null || value === "" ? "" : `      <g:${name}>${esc(value)}</g:${name}>\n`);

export function buildFeed(): Promise<string> {
  return edgeCached("merchant-feed", 600, async () => {
    const items = await loadItems();
    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n` +
      `    <title>סולודור</title>\n    <link>${SITE}</link>\n    <description>ציפויים דקורטיביים בהדבקה עצמית: טפט לדלתות, מטבחים, מקררים, שיש וקירות, ושטיחי PVC</description>\n` +
      items
        .map(
          (i) =>
            `    <item>\n` +
            tag("id", i.id) +
            tag("title", i.title.slice(0, 150)) +
            tag("description", i.description.slice(0, 4900)) +
            tag("link", enc(i.link)) +
            tag("image_link", i.image && enc(i.image)) +
            tag("availability", i.availability) +
            tag("price", money(i.price)) +
            tag("condition", "new") +
            tag("brand", BRAND) +
            tag("identifier_exists", "no") +
            tag("item_group_id", i.group) +
            tag("product_type", i.type) +
            tag("material", i.material) +
            tag("color", i.color) +
            `    </item>\n`,
        )
        .join("") +
      `  </channel>\n</rss>\n`
    );
  });
}
