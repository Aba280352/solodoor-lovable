/** Reads the product catalogue from the database. Used by the shop and product routes' loaders. */
import { supabase } from "@/integrations/supabase/client";

export type ProductType = "wallpaper" | "designed_door" | "pvc_rug";

export interface Product {
  handle: string;
  slug: string;
  title: string;
  product_type: ProductType;
  style_family: string | null;
  finish: string | null;
  material: string | null;
  base_price: number;
  price_unit: "meter" | "side" | "size";
  short_description: string | null;
  long_description: string | null;
  roll_width_cm: number | null;
  thickness_mm: number | null;
  sample_available: boolean;
  installation_available: boolean;
  /** Colour families (see colors.ts); empty when not set yet. */
  colors: string[];
  sort_order: number;
}

export interface Application {
  slug: string;
  label: string;
  sort_order: number;
  sell_unit: "meter" | "side";
  unit_price: number;
  price_per_meter: number;
  unit_length_cm: number;
  roll_width_cm: number | null;
  min_quantity: number;
  quantity_step: number;
  short_description: string | null;
  long_description: string | null;
  measuring_tip: string | null;
  recommended_addons: string[];
  install_video_url: string | null;
  measure_video_url: string | null;
  video_poster_path: string | null;
}

export interface ProductApplication {
  product_handle: string;
  application_slug: string;
  image_path: string | null;
  image_alt: string | null;
  price_override: number | null;
}

export interface ProductImage {
  product_handle: string;
  kind: "swatch" | "roll" | "main" | "gallery";
  sort_order: number;
  image_path: string | null;
  alt: string | null;
}

export interface ProductVariant {
  product_handle: string;
  variant_key: string;
  title: string;
  price: number;
  image_path: string | null;
  sort_order: number;
}

export interface Addon {
  slug: string;
  title: string;
  addon_type: "diy_tool" | "door_strips" | "door_number" | "service" | "sample";
  price: number;
  applies_to: string[];
  description: string | null;
  image_path: string | null;
  sort_order: number;
}

export interface RugSize {
  size_key: string;
  width_cm: number;
  length_cm: number;
  price: number;
  sort_order: number;
}

export interface Benefit {
  icon: string;
  title: string;
  text: string | null;
  product_types: string[];
  sort_order: number;
}

export interface InfoTab {
  slug: string;
  title: string;
  body: string;
  product_types: string[];
  sort_order: number;
}

export interface FaqItem {
  scope: string;
  sort_order: number;
  question: string;
  answer: string;
}

/** A product as the shop grid needs it: the photo to show for each tab, and a default one. */
export interface ShopItem {
  handle: string;
  slug: string;
  title: string;
  product_type: ProductType;
  style_family: string | null;
  base_price: number;
  colors: string[];
  /** application slug → image path (wallpapers only). */
  images: Record<string, string>;
  cover: string | null;
}

/** Where the catalogue images are served from: the site's own /catalog-images folder. */
export const catalogImage = (path: string | null | undefined) =>
  path ? `${import.meta.env.BASE_URL}catalog-images/${path}` : null;

export const formatPrice = (value: number) => `₪${Number.isInteger(Number(value)) ? Number(value) : Number(value).toFixed(2)}`;

/** URL keys of the wallpaper style families (the database stores the Hebrew label). */
export const STYLE_FAMILIES = [
  { key: "plain", label: "חלק ונקי" },
  { key: "wood", label: "מראה עץ" },
  { key: "stone", label: "אבן / שיש / בטון" },
] as const;

export const DEFAULT_APPLICATION = "door";

// The generated client is typed per project; rows are cast to the interfaces above.
async function rows<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

function toShopItems(
  products: Product[],
  productApplications: ProductApplication[],
  variants: ProductVariant[],
  images: ProductImage[],
): ShopItem[] {
  return products.map((product) => {
    const byApp: Record<string, string> = {};
    for (const pa of productApplications) {
      if (pa.product_handle === product.handle && pa.image_path) byApp[pa.application_slug] = pa.image_path;
    }
    const cover =
      product.product_type === "wallpaper"
        ? (byApp[DEFAULT_APPLICATION] ?? Object.values(byApp)[0] ?? null)
        : product.product_type === "designed_door"
          ? (variants.find((v) => v.product_handle === product.handle)?.image_path ?? null)
          : (images.find((i) => i.product_handle === product.handle)?.image_path ?? null);
    return {
      handle: product.handle,
      slug: product.slug,
      title: product.title,
      product_type: product.product_type,
      style_family: product.style_family,
      base_price: product.base_price,
      colors: product.colors ?? [],
      images: byApp,
      cover,
    };
  });
}

async function shopItemsFor(products: Product[]): Promise<ShopItem[]> {
  if (!products.length) return [];
  const handles = products.map((p) => p.handle);
  const [productApplications, variants, images] = await Promise.all([
    rows<ProductApplication>(supabase.from("product_applications").select("*").in("product_handle", handles)),
    rows<ProductVariant>(
      supabase.from("product_variants").select("*").in("product_handle", handles).order("sort_order").eq("sort_order", 1),
    ),
    rows<ProductImage>(supabase.from("product_images").select("*").in("product_handle", handles).eq("kind", "main")),
  ]);
  return toShopItems(products, productApplications, variants, images);
}

export interface ShopData {
  applications: Application[];
  items: ShopItem[];
  rugFromPrice: number | null;
}

/** Everything the shop archive shows. The filters are applied in the page, so one load serves them all. */
export async function fetchShop(): Promise<ShopData> {
  const [products, applications, rugSizes] = await Promise.all([
    rows<Product>(supabase.from("products").select("*").order("sort_order")),
    rows<Application>(supabase.from("applications").select("*").order("sort_order")),
    rows<RugSize>(supabase.from("rug_sizes").select("*").order("price").limit(1)),
  ]);
  return { applications, items: await shopItemsFor(products), rugFromPrice: rugSizes[0]?.price ?? null };
}

export interface ProductData {
  product: Product;
  applications: Application[];
  productApplications: ProductApplication[];
  images: ProductImage[];
  variants: ProductVariant[];
  addons: Addon[];
  rugSizes: RugSize[];
  benefits: Benefit[];
  infoTabs: InfoTab[];
  faqs: FaqItem[];
  related: ShopItem[];
}

/** One product with everything its page shows, or null when the slug does not exist. */
export async function fetchProduct(slug: string): Promise<ProductData | null> {
  const [product] = await rows<Product>(supabase.from("products").select("*").eq("slug", slug).limit(1));
  if (!product) return null;

  const type = product.product_type;
  const [applications, productApplications, images, variants, addons, rugSizes, benefits, infoTabs, faqs, relatedProducts] =
    await Promise.all([
      rows<Application>(supabase.from("applications").select("*").order("sort_order")),
      rows<ProductApplication>(supabase.from("product_applications").select("*").eq("product_handle", product.handle)),
      rows<ProductImage>(supabase.from("product_images").select("*").eq("product_handle", product.handle).order("sort_order")),
      rows<ProductVariant>(supabase.from("product_variants").select("*").eq("product_handle", product.handle).order("sort_order")),
      rows<Addon>(supabase.from("addons").select("*").order("sort_order")),
      type === "pvc_rug" ? rows<RugSize>(supabase.from("rug_sizes").select("*").order("sort_order")) : Promise.resolve([]),
      rows<Benefit>(supabase.from("benefits").select("*").contains("product_types", [type]).order("sort_order")),
      rows<InfoTab>(supabase.from("info_tabs").select("*").contains("product_types", [type]).order("sort_order")),
      rows<FaqItem>(supabase.from("faqs").select("*").order("sort_order")),
      rows<Product>(
        supabase
          .from("products")
          .select("*")
          .eq("product_type", type)
          .eq("style_family", product.style_family ?? "")
          .neq("handle", product.handle)
          .order("sort_order")
          .limit(4),
      ),
    ]);

  return {
    product,
    applications,
    productApplications,
    images,
    variants,
    addons,
    rugSizes,
    benefits,
    infoTabs,
    faqs,
    related: await shopItemsFor(relatedProducts),
  };
}
