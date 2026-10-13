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
