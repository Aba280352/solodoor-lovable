// Brings one product in Shopify up to date with the catalogue in the database.
//
// Called by the admin (POST { handle }) after a product is saved. Only the site owner may call it:
// the caller's session is checked first. It then reads the product with the service role, works out
// what Shopify should hold (name, description, status, the price of every variant by SKU, the cover
// photo and the name of the sample) and writes the differences through the Admin GraphQL API.
// The Shopify token is the secret SHOPIFY_ADMIN_TOKEN (a custom app with write_products).
import { createClient } from "npm:@supabase/supabase-js@2";

const SHOP = "1ass3z-be.myshopify.com";
const API_VERSION = "2026-01";
const OWNER_EMAIL = "barido101@gmail.com";
const SAMPLE_HANDLE = "wallpaper-sample";
const SAMPLE_OPTION = "טפט";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

interface Product {
  handle: string;
  title: string;
  product_type: "wallpaper" | "designed_door" | "pvc_rug";
  long_description: string | null;
  short_description: string | null;
  is_active: boolean;
}
interface Application {
  slug: string;
  sell_unit: "meter" | "side";
  unit_price: number;
}
interface ProductApplication {
  application_slug: string;
  image_path: string | null;
  price_override: number | null;
}
interface Variant {
  variant_key: string;
  price: number;
  image_path: string | null;
  sort_order: number;
}
interface RugSize {
  size_key: string;
  price: number;
}
interface ProductImage {
  kind: string;
  image_path: string | null;
  sort_order: number;
}

const SITE = "https://solodoor-il.lovable.app";
/** A stored image path as a URL Shopify can fetch: uploads are full URLs, the rest live on the site. */
const imageUrl = (path: string | null) => (!path ? null : /^https?:\/\//.test(path) ? path : `${SITE}/catalog-images/${path}`);

const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

const shopifyTitle = (p: Product) =>
  p.product_type === "wallpaper" ? `טפט ${p.title}` : p.product_type === "designed_door" ? `טפט מעוצב לדלת, דגם ${p.title}` : `שטיח PVC ${p.title}`;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const descriptionHtml = (p: Product) =>
  (p.long_description || p.short_description || "")
    .split(/\n\s*\n|\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `<p>${escapeHtml(t)}</p>`)
    .join("");

async function shopify<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`Shopify: ${res.status} ${JSON.stringify(body.errors ?? body).slice(0, 300)}`);
  return body.data as T;
}

/** Shopify's userErrors as one message, or null when the mutation went through. */
const userErrors = (result: { userErrors?: { field?: string[]; message: string }[] } | null | undefined) =>
  result?.userErrors?.length ? result.userErrors.map((e) => e.message).join("; ") : null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, message: "POST only" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Only the owner, signed in on the site, may sync.
  const authorization = req.headers.get("Authorization") ?? "";
  const asCaller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData } = await asCaller.auth.getUser(authorization.replace(/^Bearer\s+/i, "") || undefined);
  if (!userData?.user || userData.user.email?.toLowerCase() !== OWNER_EMAIL) {
    return json(401, { ok: false, message: "יש להתחבר כבעלי האתר כדי לסנכרן." });
  }

  const token = Deno.env.get("SHOPIFY_ADMIN_TOKEN");
  if (!token) {
    return json(503, { ok: false, message: "not_configured" });
  }

  let handle = "";
  try {
    handle = String(((await req.json()) as { handle?: string }).handle ?? "").trim();
  } catch {
    // No body: handled below.
  }
  if (!handle) return json(400, { ok: false, message: "חסר מזהה מוצר." });

  const admin = createClient(supabaseUrl, serviceKey);
  const changes: string[] = [];
  const fail = async (message: string) => {
    await admin.from("shopify_sync").upsert({ handle, synced_at: new Date().toISOString(), ok: false, message });
    return json(200, { ok: false, message, changes });
  };

  try {
    const { data: products } = await admin.from("products").select("*").eq("handle", handle).limit(1);
    const product = (products ?? [])[0] as Product | undefined;
    if (!product) return json(404, { ok: false, message: "המוצר לא נמצא במסד הנתונים." });

    const [{ data: apps }, { data: pas }, { data: variants }, { data: sizes }, { data: images }] = await Promise.all([
      admin.from("applications").select("slug, sell_unit, unit_price"),
      admin.from("product_applications").select("application_slug, image_path, price_override").eq("product_handle", handle),
      admin.from("product_variants").select("variant_key, price, image_path, sort_order").eq("product_handle", handle).order("sort_order"),
      product.product_type === "pvc_rug" ? admin.from("rug_sizes").select("size_key, price") : Promise.resolve({ data: [] }),
      admin.from("product_images").select("kind, image_path, sort_order").eq("product_handle", handle).order("sort_order"),
    ]);

    // What every SKU of the product should cost.
    const prices = new Map<string, string>();
    if (product.product_type === "wallpaper") {
      for (const pa of (pas ?? []) as ProductApplication[]) {
        const app = ((apps ?? []) as Application[]).find((a) => a.slug === pa.application_slug);
        if (!app) continue;
        const price = Number(pa.price_override ?? app.unit_price);
        prices.set(`${handle}__${app.slug}`, money(price));
        prices.set(`${handle}__${app.slug}__install`, money(price));
        if (app.sell_unit === "meter") prices.set(`${handle}__${app.slug}__tenth`, money(price / 10));
      }
    } else if (product.product_type === "designed_door") {
      for (const v of (variants ?? []) as Variant[]) {
        prices.set(`${handle}__${v.variant_key}`, money(Number(v.price)));
        prices.set(`${handle}__${v.variant_key}__install`, money(Number(v.price)));
      }
    } else {
      for (const s of (sizes ?? []) as RugSize[]) prices.set(`${handle}__${s.size_key}`, money(Number(s.price)));
    }

    // The photo the checkout shows: the door rendering, the first door colour, or the rug's main photo.
    const cover =
      product.product_type === "wallpaper"
        ? ((pas ?? []) as ProductApplication[]).find((pa) => pa.application_slug === "door")?.image_path ??
          ((pas ?? []) as ProductApplication[]).find((pa) => pa.image_path)?.image_path ??
          null
        : product.product_type === "designed_door"
          ? ((variants ?? []) as Variant[]).find((v) => v.image_path)?.image_path ?? null
          : ((images ?? []) as ProductImage[]).find((i) => i.kind === "main" && i.image_path)?.image_path ?? null;
    const coverUrl = imageUrl(cover);

    type ShopProduct = {
      id: string;
      title: string;
      descriptionHtml: string;
      status: string;
      media: { nodes: { id: string; alt: string | null }[] };
      variants: { nodes: { id: string; sku: string | null; price: string }[] };
    };
    const found = await shopify<{ productByIdentifier: ShopProduct | null }>(
      token,
      `query($handle: String!) { productByIdentifier(identifier: { handle: $handle }) {
        id title descriptionHtml status
        media(first: 20) { nodes { id alt } }
        variants(first: 100) { nodes { id sku price } }
      } }`,
      { handle },
    );
    const shop = found.productByIdentifier;
    if (!shop) return await fail("המוצר לא קיים ב-Shopify. יצירת מוצר חדש ב-Shopify עדיין לא נתמכת מהפאנל.");

    // Name, description and whether it is on sale.
    const title = shopifyTitle(product);
    const html = descriptionHtml(product);
    const status = product.is_active ? "ACTIVE" : "DRAFT";
    const productInput: Record<string, string> = { id: shop.id };
    if (shop.title !== title) productInput.title = title;
    if (html && shop.descriptionHtml.replace(/\s+/g, " ").trim() !== html.replace(/\s+/g, " ").trim()) productInput.descriptionHtml = html;
    if (shop.status !== status) productInput.status = status;
    if (Object.keys(productInput).length > 1) {
      const r = await shopify<{ productUpdate: { userErrors: { message: string }[] } }>(
        token,
        `mutation($product: ProductUpdateInput!) { productUpdate(product: $product) { userErrors { field message } } }`,
        { product: productInput },
      );
      const err = userErrors(r.productUpdate);
      if (err) return await fail(`עדכון המוצר נכשל: ${err}`);
      if (productInput.title) changes.push(`שם: ${title}`);
      if (productInput.descriptionHtml) changes.push("תיאור");
      if (productInput.status) changes.push(product.is_active ? "המוצר הוצג למכירה" : "המוצר הוסתר ממכירה");
    }

    // Prices, only where they differ.
    const priceUpdates = shop.variants.nodes
      .filter((v) => v.sku && prices.has(v.sku) && Number(v.price) !== Number(prices.get(v.sku)))
      .map((v) => ({ id: v.id, price: prices.get(v.sku!)!, sku: v.sku! }));
    if (priceUpdates.length) {
      const r = await shopify<{ productVariantsBulkUpdate: { userErrors: { message: string }[] } }>(
        token,
        `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
        { productId: shop.id, variants: priceUpdates.map(({ id, price }) => ({ id, price })) },
      );
      const err = userErrors(r.productVariantsBulkUpdate);
      if (err) return await fail(`עדכון המחירים נכשל: ${err}`);
      changes.push(`מחירים: ${priceUpdates.map((u) => `${u.sku.replace(`${handle}__`, "")} ${u.price}`).join(", ")}`);
    }
    const missing = [...prices.keys()].filter((sku) => !shop.variants.nodes.some((v) => v.sku === sku));
    if (missing.length) changes.push(`לא קיימים ב-Shopify ולכן לא עודכנו: ${missing.join(", ")}`);

    // The cover photo: added in front of the others when it is not there yet (its URL is kept as the alt text).
    if (coverUrl && !shop.media.nodes.some((m) => m.alt === coverUrl)) {
      const r = await shopify<{ productCreateMedia: { media: { id: string }[]; mediaUserErrors: { message: string }[] } }>(
        token,
        `mutation($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
        { productId: shop.id, media: [{ originalSource: coverUrl, alt: coverUrl, mediaContentType: "IMAGE" }] },
      );
      const err = r.productCreateMedia.mediaUserErrors?.length ? r.productCreateMedia.mediaUserErrors.map((e) => e.message).join("; ") : null;
      if (err) changes.push(`התמונה לא עודכנה: ${err}`);
      else {
        const created = r.productCreateMedia.media[0]?.id;
        if (created && shop.media.nodes.length) {
          await shopify(
            token,
            `mutation($id: ID!, $moves: [MoveInput!]!) { productReorderMedia(id: $id, moves: $moves) { mediaUserErrors { field message } } }`,
            { id: shop.id, moves: [{ id: created, newPosition: "0" }] },
          );
        }
        changes.push("תמונה ראשית");
      }
    }

    // The sample of a wallpaper is a variant of one shared product, named after the wallpaper.
    if (product.product_type === "wallpaper") {
      type SampleProduct = {
        id: string;
        options: { id: string; name: string; optionValues: { id: string; name: string }[] }[];
        variants: { nodes: { sku: string | null; selectedOptions: { name: string; value: string }[] }[] };
      };
      const sample = await shopify<{ productByIdentifier: SampleProduct | null }>(
        token,
        `query($handle: String!) { productByIdentifier(identifier: { handle: $handle }) {
          id options { id name optionValues { id name } }
          variants(first: 250) { nodes { sku selectedOptions { name value } } }
        } }`,
        { handle: SAMPLE_HANDLE },
      );
      const sp = sample.productByIdentifier;
      const variant = sp?.variants.nodes.find((v) => v.sku === `sample-first__${handle}`);
      const current = variant?.selectedOptions.find((o) => o.name === SAMPLE_OPTION)?.value;
      const option = sp?.options.find((o) => o.name === SAMPLE_OPTION);
      const value = option?.optionValues.find((v) => v.name === current);
      if (sp && option && value && current !== product.title) {
        const r = await shopify<{ productOptionUpdate: { userErrors: { message: string }[] } }>(
          token,
          `mutation($productId: ID!, $option: OptionUpdateInput!, $values: [OptionValueUpdateInput!]) { productOptionUpdate(productId: $productId, option: $option, optionValuesToUpdate: $values) { userErrors { field message } } }`,
          { productId: sp.id, option: { id: option.id }, values: [{ id: value.id, name: product.title }] },
        );
        const err = userErrors(r.productOptionUpdate);
        if (err) changes.push(`שם הדוגמית לא עודכן: ${err}`);
        else changes.push(`שם הדוגמית: ${product.title}`);
      }
    }

    const message = changes.length ? "Shopify עודכן." : "Shopify כבר מעודכן, לא היה מה לשנות.";
    await admin.from("shopify_sync").upsert({ handle, synced_at: new Date().toISOString(), ok: true, message: changes.join(" | ") || message });
    return json(200, { ok: true, message, changes });
  } catch (error) {
    return await fail((error as Error).message);
  }
});
