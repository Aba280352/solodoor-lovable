// Brings one product in Shopify up to date with the catalogue in the database, creating it there when it is new.
//
// Called by the admin (POST { handle }) after a product is saved. Only the site owner may call it:
// the caller's session is checked first. It then reads the product with the service role, works out
// what Shopify should hold (name, description, status, every variant with its SKU and price, the cover
// photo and the sample) and writes the differences through the Admin GraphQL API. A product Shopify does
// not know yet is created with all its variants and published to the online store; variants that are
// missing (a new door colour, a surface switched on) are added. The variant ids are kept in the table
// shopify_variants, which the checkout reads.
//
// Shopify access: the app "Solodoor Admin" of the store's own organisation (Dev Dashboard), installed
// on the store with write_products, write_publications and write_shipping. Such an app gets a day-long
// token with the client credentials grant from its client id and the secret SHOPIFY_CLIENT_SECRET; the
// token is kept here until it expires.
import { createClient } from "npm:@supabase/supabase-js@2";

const SHOP = "1ass3z-be.myshopify.com";
const API_VERSION = "2026-01";
/** The public id of the Solodoor Admin app; the secret next to it in the Dev Dashboard is SHOPIFY_CLIENT_SECRET. */
const CLIENT_ID = "e1869ac27259c4bf320524dde16a63ce";
const OWNER_EMAIL = "barido101@gmail.com";
const SAMPLE_HANDLE = "wallpaper-sample";
const SAMPLE_OPTION = "טפט";
const SAMPLE_KIND_OPTION = "סוג";
const SAMPLE_EXTRA_PRICE = "5.00";
/** The online store sales channel: a new product is published there, or the checkout cannot sell it. */
const ONLINE_STORE_PUBLICATION = "gid://shopify/Publication/232500068510";
/** Installed variants ship for free: the installer brings the material. */
const INSTALL_DELIVERY_PROFILE = "gid://shopify/DeliveryProfile/110825963678";
const VENDOR = "סולודור";
const SITE = "https://solodoor-il.lovable.app";

let cachedToken: { value: string; expiresAt: number } | null = null;

/** A Shopify Admin API token for the store, fetched with the client credentials grant and reused while valid. */
async function shopifyToken(clientSecret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: Deno.env.get("SHOPIFY_CLIENT_ID") || CLIENT_ID, client_secret: clientSecret }),
  });
  const body = (await res.json()) as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(`Shopify לא נתן גישה (${res.status}): ${body.error_description ?? body.error ?? "בדקו שהאפליקציה Solodoor Admin מותקנת בחנות ושהסוד נכון"}`);
  }
  cachedToken = { value: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 86399) * 1000 };
  return cachedToken.value;
}

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
  style_family: string | null;
  long_description: string | null;
  short_description: string | null;
  colors: string[] | null;
  is_active: boolean;
}
interface Application {
  slug: string;
  label: string;
  sort_order: number;
  sell_unit: "meter" | "side";
  unit_price: number;
}
interface ProductApplication {
  application_slug: string;
  image_path: string | null;
  price_override: number | null;
  is_active: boolean;
}
interface Variant {
  variant_key: string;
  title: string;
  price: number;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
}
interface RugSize {
  size_key: string;
  width_cm: number;
  length_cm: number;
  price: number;
  sort_order: number;
}
interface ProductImage {
  kind: string;
  image_path: string | null;
  sort_order: number;
}

/** One variant as Shopify should hold it. */
interface Desired {
  sku: string;
  price: string;
  /** The option values that name it, e.g. the surface, or the wallpaper and the kind of a sample. */
  options: { optionName: string; name: string }[];
}

/** A stored image path as a URL Shopify can fetch: uploads are full URLs, the rest live on the site. */
const imageUrl = (path: string | null) => (!path ? null : /^https?:\/\//.test(path) ? path : `${SITE}/catalog-images/${path}`);

const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

const TYPE_LABEL: Record<Product["product_type"], string> = { wallpaper: "טפט", designed_door: "טפט מעוצב לדלת", pvc_rug: "שטיח PVC" };
const COLOR_LABEL: Record<string, string> = { white: "לבן", cream: "קרם", grey: "אפור", black: "שחור", brown: "חום", blue: "כחול", green: "ירוק", purple: "סגול", multi: "צבעוני" };

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

/** The variants the product should have in Shopify, in the order the admin lists them. */
function desiredVariants(product: Product, apps: Application[], pas: ProductApplication[], variants: Variant[], sizes: RugSize[]): Desired[] {
  const { handle } = product;
  const one = (sku: string, price: string, optionName: string, name: string): Desired => ({ sku, price, options: [{ optionName, name }] });
  const out: Desired[] = [];
  if (product.product_type === "wallpaper") {
    const active = apps
      .filter((a) => pas.some((pa) => pa.application_slug === a.slug && pa.is_active))
      .sort((a, b) => a.sort_order - b.sort_order);
    for (const app of active) {
      const pa = pas.find((p) => p.application_slug === app.slug)!;
      const unit = Number(pa.price_override ?? app.unit_price);
      const value = `${app.label} (${app.sell_unit === "meter" ? "למטר" : "לצד אחד"})`;
      out.push(one(`${handle}__${app.slug}`, money(unit), "משטח", value));
      // Only a door covering comes with the installer.
      if (app.slug === "door") out.push(one(`${handle}__${app.slug}__install`, money(unit), "משטח", `${value} · בהתקנה`));
      if (app.sell_unit === "meter") out.push(one(`${handle}__${app.slug}__tenth`, money(unit / 10), "משטח", `${app.label} (10 ס"מ)`));
    }
  } else if (product.product_type === "designed_door") {
    for (const v of variants.filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order)) {
      out.push(one(`${handle}__${v.variant_key}`, money(Number(v.price)), "גוון", v.title));
      out.push(one(`${handle}__${v.variant_key}__install`, money(Number(v.price)), "גוון", `${v.title} · בהתקנה`));
    }
  } else {
    for (const s of [...sizes].sort((a, b) => a.sort_order - b.sort_order)) {
      out.push(one(`${handle}__${s.size_key}`, money(Number(s.price)), "מידה", `${s.width_cm}×${s.length_cm} ס"מ`));
    }
  }
  return out;
}

/** The two sample variants of a wallpaper, on the shared sample product. */
const sampleVariants = (product: Product): Desired[] => [
  { sku: `sample-first__${product.handle}`, price: "0.00", options: [{ optionName: SAMPLE_OPTION, name: product.title }, { optionName: SAMPLE_KIND_OPTION, name: "דוגמית ראשונה" }] },
  { sku: `sample-extra__${product.handle}`, price: SAMPLE_EXTRA_PRICE, options: [{ optionName: SAMPLE_OPTION, name: product.title }, { optionName: SAMPLE_KIND_OPTION, name: "דוגמית נוספת" }] },
];

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

const gidNumber = (gid: string) => Number(gid.split("/").pop());

type ShopVariant = { id: string; sku: string | null; price: string };
type ShopProduct = {
  id: string;
  title: string;
  descriptionHtml: string;
  status: string;
  media: { nodes: { id: string; alt: string | null }[] };
  variants: { nodes: ShopVariant[] };
};
const PRODUCT_FIELDS = `id title descriptionHtml status media(first: 20) { nodes { id alt } } variants(first: 100) { nodes { id sku price } }`;

const findProduct = (token: string, handle: string) =>
  shopify<{ productByIdentifier: ShopProduct | null }>(token, `query($handle: String!) { productByIdentifier(identifier: { handle: $handle }) { ${PRODUCT_FIELDS} } }`, { handle }).then(
    (r) => r.productByIdentifier,
  );

/** Adds variants to a product. Option values that do not exist yet are created by name. */
async function createVariants(token: string, productId: string, variants: Desired[], removeStandalone: boolean): Promise<ShopVariant[]> {
  const r = await shopify<{ productVariantsBulkCreate: { productVariants: ShopVariant[]; userErrors: { message: string }[] } }>(
    token,
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
      productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) { productVariants { id sku price } userErrors { field message } }
    }`,
    {
      productId,
      strategy: removeStandalone ? "REMOVE_STANDALONE_VARIANT" : "DEFAULT",
      variants: variants.map((v) => ({
        price: v.price,
        taxable: true,
        inventoryPolicy: "CONTINUE",
        optionValues: v.options,
        inventoryItem: { sku: v.sku, tracked: false, requiresShipping: true },
      })),
    },
  );
  const err = userErrors(r.productVariantsBulkCreate);
  if (err) throw new Error(`יצירת הווריאנטים נכשלה: ${err}`);
  return r.productVariantsBulkCreate.productVariants;
}

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

  const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET");
  if (!clientSecret) {
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
    const token = await shopifyToken(clientSecret);
    const { data: products } = await admin.from("products").select("*").eq("handle", handle).limit(1);
    const product = (products ?? [])[0] as Product | undefined;
    if (!product) return json(404, { ok: false, message: "המוצר לא נמצא במסד הנתונים." });

    const [{ data: appRows }, { data: paRows }, { data: variantRows }, { data: sizeRows }, { data: imageRows }] = await Promise.all([
      admin.from("applications").select("slug, label, sort_order, sell_unit, unit_price"),
      admin.from("product_applications").select("application_slug, image_path, price_override, is_active").eq("product_handle", handle),
      admin.from("product_variants").select("variant_key, title, price, image_path, sort_order, is_active").eq("product_handle", handle).order("sort_order"),
      product.product_type === "pvc_rug" ? admin.from("rug_sizes").select("size_key, width_cm, length_cm, price, sort_order") : Promise.resolve({ data: [] }),
      admin.from("product_images").select("kind, image_path, sort_order").eq("product_handle", handle).order("sort_order"),
    ]);
    const apps = (appRows ?? []) as Application[];
    const pas = (paRows ?? []) as ProductApplication[];
    const variants = (variantRows ?? []) as Variant[];
    const sizes = (sizeRows ?? []) as RugSize[];
    const images = (imageRows ?? []) as ProductImage[];

    const desired = desiredVariants(product, apps, pas, variants, sizes);
    if (!desired.length) return await fail("למוצר אין אף וריאנט למכירה: בטפט צריך לפחות משטח אחד מוצג, בדלת מעוצבת לפחות גוון אחד.");

    const title = shopifyTitle(product);
    const html = descriptionHtml(product);
    const status = product.is_active ? "ACTIVE" : "DRAFT";

    // The product in Shopify, created now when it is not there yet.
    let shop = await findProduct(token, handle);
    let created: ShopVariant[] = [];
    if (!shop) {
      const tags = [TYPE_LABEL[product.product_type], product.style_family, ...(product.colors ?? []).map((c) => COLOR_LABEL[c] ?? c)].filter(Boolean);
      const r = await shopify<{ productCreate: { product: { id: string } | null; userErrors: { message: string }[] } }>(
        token,
        `mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
        {
          product: {
            title,
            handle,
            descriptionHtml: html,
            vendor: VENDOR,
            productType: TYPE_LABEL[product.product_type],
            tags,
            status,
            productOptions: [{ name: desired[0].options[0].optionName, values: [{ name: desired[0].options[0].name }] }],
          },
        },
      );
      const err = userErrors(r.productCreate);
      if (err || !r.productCreate.product) return await fail(`יצירת המוצר ב-Shopify נכשלה: ${err ?? "לא התקבל מזהה"}`);
      const productId = r.productCreate.product.id;
      created = await createVariants(token, productId, desired, true);
      const publish = await shopify<{ publishablePublish: { userErrors: { message: string }[] } }>(
        token,
        `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
        { id: productId, input: [{ publicationId: ONLINE_STORE_PUBLICATION }] },
      );
      const publishError = userErrors(publish.publishablePublish);
      changes.push(`המוצר נוצר ב-Shopify עם ${created.length} וריאנטים${publishError ? ` (הפרסום לחנות נכשל: ${publishError})` : ""}`);
      shop = await findProduct(token, handle);
      if (!shop) return await fail("המוצר נוצר ב-Shopify אבל לא נמצא מיד אחר כך. נסו לסנכרן שוב.");
      await admin.from("products").update({ shopify_product_id: productId }).eq("handle", handle);
    } else {
      // Name, description and whether it is on sale.
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

      // Variants the shop does not have yet: a new door colour, a surface switched on.
      const existing = shop.variants.nodes;
      const missing = desired.filter((d) => !existing.some((v) => v.sku === d.sku));
      if (missing.length) {
        created = await createVariants(token, shop.id, missing, false);
        changes.push(`וריאנטים חדשים: ${missing.map((m) => m.options[0].name).join(", ")}`);
        existing.push(...created);
      }

      // Prices, only where they differ.
      const priceUpdates = existing
        .map((v) => ({ v, d: desired.find((d) => d.sku === v.sku) }))
        .filter(({ v, d }) => d && Number(v.price) !== Number(d.price))
        .map(({ v, d }) => ({ id: v.id, price: d!.price, sku: v.sku! }));
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
    }

    // New installed variants ship for free: they join the installation delivery profile.
    const installIds = created.filter((v) => v.sku?.endsWith("__install")).map((v) => v.id);
    if (installIds.length) {
      const r = await shopify<{ deliveryProfileUpdate: { userErrors: { message: string }[] } }>(
        token,
        `mutation($id: ID!, $profile: DeliveryProfileInput!) { deliveryProfileUpdate(id: $id, profile: $profile) { userErrors { field message } } }`,
        { id: INSTALL_DELIVERY_PROFILE, profile: { variantsToAssociate: installIds } },
      );
      const err = userErrors(r.deliveryProfileUpdate);
      if (err) changes.push(`הווריאנטים בהתקנה לא צורפו למשלוח חינם: ${err}`);
    }

    // The cover photo. The imported products already carry their photos, so only a photo uploaded in the
    // admin (stored as a full URL), or a product with no photo at all, is sent; its URL is kept as the alt text.
    const cover =
      product.product_type === "wallpaper"
        ? pas.find((pa) => pa.application_slug === "door")?.image_path ?? pas.find((pa) => pa.image_path)?.image_path ?? null
        : product.product_type === "designed_door"
          ? variants.find((v) => v.image_path)?.image_path ?? null
          : images.find((i) => i.kind === "main" && i.image_path)?.image_path ?? null;
    const coverUrl = imageUrl(cover);
    const uploaded = !!cover && /^https?:\/\//.test(cover);
    if (coverUrl && (uploaded || shop.media.nodes.length === 0) && !shop.media.nodes.some((m) => m.alt === coverUrl)) {
      const r = await shopify<{ productCreateMedia: { media: { id: string }[]; mediaUserErrors: { message: string }[] } }>(
        token,
        `mutation($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
        { productId: shop.id, media: [{ originalSource: coverUrl, alt: coverUrl, mediaContentType: "IMAGE" }] },
      );
      const err = r.productCreateMedia.mediaUserErrors?.length ? r.productCreateMedia.mediaUserErrors.map((e) => e.message).join("; ") : null;
      if (err) changes.push(`התמונה לא עודכנה: ${err}`);
      else {
        const createdMedia = r.productCreateMedia.media[0]?.id;
        if (createdMedia && shop.media.nodes.length) {
          await shopify(
            token,
            `mutation($id: ID!, $moves: [MoveInput!]!) { productReorderMedia(id: $id, moves: $moves) { mediaUserErrors { field message } } }`,
            { id: shop.id, moves: [{ id: createdMedia, newPosition: "0" }] },
          );
        }
        changes.push("תמונה ראשית");
      }
    }

    // The sample of a wallpaper is a pair of variants of one shared product, named after the wallpaper.
    const samples: ShopVariant[] = [];
    if (product.product_type === "wallpaper") {
      type SampleProduct = {
        id: string;
        options: { id: string; name: string; optionValues: { id: string; name: string }[] }[];
        variants: { nodes: { id: string; sku: string | null; price: string; selectedOptions: { name: string; value: string }[] }[] };
      };
      const sample = await shopify<{ productByIdentifier: SampleProduct | null }>(
        token,
        `query($handle: String!) { productByIdentifier(identifier: { handle: $handle }) {
          id options { id name optionValues { id name } }
          variants(first: 250) { nodes { id sku price selectedOptions { name value } } }
        } }`,
        { handle: SAMPLE_HANDLE },
      );
      const sp = sample.productByIdentifier;
      if (sp) {
        const first = sp.variants.nodes.find((v) => v.sku === `sample-first__${handle}`);
        const extra = sp.variants.nodes.find((v) => v.sku === `sample-extra__${handle}`);
        if (first && extra) {
          samples.push(first, extra);
          const current = first.selectedOptions.find((o) => o.name === SAMPLE_OPTION)?.value;
          const option = sp.options.find((o) => o.name === SAMPLE_OPTION);
          const value = option?.optionValues.find((v) => v.name === current);
          if (option && value && current !== product.title) {
            const r = await shopify<{ productOptionUpdate: { userErrors: { message: string }[] } }>(
              token,
              `mutation($productId: ID!, $option: OptionUpdateInput!, $values: [OptionValueUpdateInput!]) { productOptionUpdate(productId: $productId, option: $option, optionValuesToUpdate: $values) { userErrors { field message } } }`,
              { productId: sp.id, option: { id: option.id }, values: [{ id: value.id, name: product.title }] },
            );
            const err = userErrors(r.productOptionUpdate);
            if (err) changes.push(`שם הדוגמית לא עודכן: ${err}`);
            else changes.push(`שם הדוגמית: ${product.title}`);
          }
        } else {
          samples.push(...(await createVariants(token, sp.id, sampleVariants(product), false)));
          changes.push("דוגמית נוצרה");
        }
      }
    }

    // The ids the checkout needs, by SKU.
    const rows = [...shop.variants.nodes, ...samples]
      .filter((v) => v.sku)
      .map((v) => ({ sku: v.sku!, variant_id: gidNumber(v.id), product_handle: handle }));
    if (rows.length) await admin.from("shopify_variants").upsert(rows);

    const message = changes.length
      ? "Shopify עודכן."
      : "Shopify כבר מעודכן, לא היה מה לשנות. ל-Shopify עוברים השם, התיאור המלא, המחירים, ההצגה למכירה והתמונה הראשית; השאר מופיע באתר בלבד.";
    await admin.from("shopify_sync").upsert({ handle, synced_at: new Date().toISOString(), ok: true, message: changes.join(" | ") || message });
    return json(200, { ok: true, message, changes });
  } catch (error) {
    return await fail((error as Error).message);
  }
});
