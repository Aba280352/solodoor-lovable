/**
 * Database access for the admin. The site's client is typed from the generated schema; the admin
 * writes to tables and columns the generated types may lag behind (sync state, storage), so it
 * talks through the untyped client and casts the rows itself.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

import type { Application, Product, ProductApplication, ProductImage, ProductVariant, RugSize } from "../shop/catalog";

export const db = supabase as unknown as SupabaseClient;

/** The Shopify side of one product, as the last sync left it. */
export interface SyncState {
  handle: string;
  synced_at: string;
  ok: boolean;
  message: string | null;
}

export type AdminProduct = Product & { shopify_product_id: string | null };
export type AdminProductApplication = ProductApplication & { is_active: boolean };
export type AdminProductImage = ProductImage & { id: number };
export type AdminProductVariant = ProductVariant & { is_active: boolean };

export interface AdminProductData {
  product: AdminProduct;
  applications: Application[];
  productApplications: AdminProductApplication[];
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  rugSizes: RugSize[];
  sync: SyncState | null;
}

async function rows<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

/** One product with everything the editor shows, hidden rows included. */
export async function fetchAdminProduct(handle: string): Promise<AdminProductData | null> {
  const [product] = await rows<AdminProduct>(db.from("products").select("*").eq("handle", handle).limit(1));
  if (!product) return null;
  const [applications, productApplications, images, variants, rugSizes, syncRows] = await Promise.all([
    rows<Application>(db.from("applications").select("*").order("sort_order")),
    rows<AdminProductApplication>(db.from("product_applications").select("*").eq("product_handle", handle)),
    rows<AdminProductImage>(db.from("product_images").select("*").eq("product_handle", handle).order("sort_order")),
    rows<AdminProductVariant>(db.from("product_variants").select("*").eq("product_handle", handle).order("sort_order")),
    product.product_type === "pvc_rug" ? rows<RugSize>(db.from("rug_sizes").select("*").order("sort_order")) : Promise.resolve([]),
    rows<SyncState>(db.from("shopify_sync").select("*").eq("handle", handle).limit(1)),
  ]);
  return { product, applications, productApplications, images, variants, rugSizes, sync: syncRows[0] ?? null };
}

/** Stores a picked image in the "catalog" bucket, under the product, and returns its public URL. */
export async function uploadCatalogImage(file: File, handle: string): Promise<string> {
  const clean = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
  const name = `${handle}/${Date.now()}-${clean}`;
  const { error } = await db.storage.from("catalog").upload(name, file, { upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return db.storage.from("catalog").getPublicUrl(name).data.publicUrl;
}

/** A handle as Shopify and the image folders want it: lower case ascii letters, digits and hyphens. */
export const cleanHandle = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Creates a product in the database with the rows its editor expects: every surface for a wallpaper,
 * a first colour for a designed door, nothing extra for a rug. Shopify learns about it on the first save.
 */
export async function createProduct(type: Product["product_type"], title: string, handleInput: string): Promise<string> {
  const base = cleanHandle(handleInput);
  if (!base) throw new Error("צריך מזהה באנגלית: אותיות קטנות, ספרות ומקפים.");
  const handle = type === "designed_door" && !base.startsWith("door-") ? `door-${base}` : type === "pvc_rug" && !base.startsWith("rug-") ? `rug-${base}` : base;
  const { data: taken } = await db.from("products").select("handle").or(`handle.eq.${handle},slug.eq.${title.trim()}`).limit(1);
  if (taken?.length) throw new Error("כבר יש מוצר עם המזהה או השם האלה.");
  const { data: last } = await db.from("products").select("sort_order").eq("product_type", type).order("sort_order", { ascending: false }).limit(1);
  const row = {
    handle,
    slug: title.trim(),
    title: title.trim(),
    product_type: type,
    style_family: type === "designed_door" ? "מעוצב ודקורטיבי" : null,
    base_price: type === "designed_door" ? 305 : 0,
    price_unit: type === "wallpaper" ? "meter" : type === "designed_door" ? "side" : "size",
    sample_available: type !== "pvc_rug",
    installation_available: type !== "pvc_rug",
    colors: [],
    is_active: false,
    sort_order: ((last ?? [])[0]?.sort_order ?? 0) + 1,
  };
  const { error } = await db.from("products").insert(row);
  if (error) throw new Error(error.message);
  if (type === "wallpaper") {
    const { data: apps } = await db.from("applications").select("slug");
    await db.from("product_applications").insert(((apps ?? []) as { slug: string }[]).map((a) => ({ product_handle: handle, application_slug: a.slug, is_active: true })));
    await db.from("product_images").insert([
      { product_handle: handle, kind: "swatch", sort_order: 0 },
      { product_handle: handle, kind: "roll", sort_order: 1 },
    ]);
  } else if (type === "designed_door") {
    await db.from("product_variants").insert({ product_handle: handle, variant_key: "v1", title: title.trim(), price: 305, sort_order: 1, is_active: true });
  } else {
    await db.from("product_images").insert({ product_handle: handle, kind: "main", sort_order: 0 });
  }
  return handle;
}

export const PRODUCT_TYPE_LABELS: Record<Product["product_type"], string> = {
  wallpaper: "טפט",
  designed_door: "טפט מעוצב לדלת",
  pvc_rug: "שטיח PVC",
};

/** The name the product carries in Shopify (the checkout), derived the same way the import did. */
export function shopifyTitle(product: Pick<Product, "product_type" | "title">) {
  return product.product_type === "wallpaper"
    ? `טפט ${product.title}`
    : product.product_type === "designed_door"
      ? `טפט מעוצב לדלת, דגם ${product.title}`
      : `שטיח PVC ${product.title}`;
}
