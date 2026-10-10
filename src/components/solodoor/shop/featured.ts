/** Picks from the real catalogue for the home page, the door and kitchen pages and the guidance quiz. */
import type { Product } from "../data";
import { catalogImage, type Application, type ShopData, type ShopItem } from "./catalog";
import { categoriesFor } from "./filters";
import { priceLabel } from "./ShopCard";
import { RECOMMENDED_HANDLES } from "./styles";

const rank = (item: ShopItem) => {
  const i = RECOMMENDED_HANDLES.indexOf(item.handle);
  return i < 0 ? RECOMMENDED_HANDLES.length : i;
};

/** Wallpapers that have a photo for the surface, the recommended ones first (the sort is stable). */
export function wallpapersFor(shop: ShopData, applicationSlug: string): ShopItem[] {
  return shop.items.filter((i) => i.product_type === "wallpaper" && i.images[applicationSlug]).sort((a, b) => rank(a) - rank(b));
}

/** A product as a card of the home or landing pages: photo, name, price and the product page it opens. */
export function productCard(shop: ShopData, item: ShopItem, application?: Application): Product {
  const wallpaper = item.product_type === "wallpaper";
  const variant = item.product_type === "designed_door" ? item.variants[0] : undefined;
  const path = wallpaper && application ? item.images[application.slug] : (variant?.image ?? item.cover);
  return {
    name: wallpaper ? `טפט ${item.title}` : item.product_type === "designed_door" ? `דגם ${item.title}` : item.title,
    price: priceLabel(item, application, shop.rugFromPrice),
    img: catalogImage(path),
    link: { slug: item.slug, search: wallpaper && application ? { tab: application.slug } : variant ? { variant: variant.key } : {} },
  };
}

/** The categories of the best sellers section, in the order they are offered. */
const BEST_SELLER_TABS: [string, string][] = [
  ["door", "טפטים עמידים לדלת"],
  ["designed_door", "טפטים מעוצבים לדלת"],
  ["wall", "טפט לקיר"],
  ["electric-cabinet", "טפט לארון חשמל"],
  ["fridge", "טפט למקרר"],
  ["kitchen", "טפט למטבח"],
  ["countertop", "טפט לשיש"],
  ["pvc_rug", "שטיחי PVC"],
];

export function bestSellerTabs(shop: ShopData, perTab = 4): { tab: string; items: Product[] }[] {
  const categories = categoriesFor(shop.applications);
  return BEST_SELLER_TABS.flatMap(([key, label]) => {
    const category = categories.find((c) => c.key === key);
    if (!category) return [];
    const application = shop.applications.find((a) => a.slug === key);
    const items =
      category.kind === "type"
        ? shop.items.filter((i) => i.product_type === key && i.cover)
        : wallpapersFor(shop, key);
    const picked = items.slice(0, perTab).map((item) => productCard(shop, item, application));
    return picked.length ? [{ tab: label, items: picked }] : [];
  });
}

/** Wallpapers for one surface as cards, e.g. the door page's shop strip. */
export function surfaceProducts(shop: ShopData, applicationSlug: string, count = 8): Product[] {
  const application = shop.applications.find((a) => a.slug === applicationSlug);
  return wallpapersFor(shop, applicationSlug)
    .slice(0, count)
    .map((item) => productCard(shop, item, application));
}

/** The quiz areas and the surface each one means. */
const QUIZ_SURFACE: Record<string, string> = {
  door: "door",
  kitchen: "kitchen",
  fridge: "fridge",
  electric: "electric-cabinet",
  wall: "wall",
  counter: "countertop",
};

const COLORFUL = ["blue", "green", "purple", "multi", "brown"];

/** Three models for an area and a style (step 3 of the quiz), taken from the shop. */
export function quizModels(shop: ShopData, areaKey: string, style: string | undefined): Product[] {
  const slug = QUIZ_SURFACE[areaKey] ?? "door";
  const application = shop.applications.find((a) => a.slug === slug);
  const all = wallpapersFor(shop, slug);
  let chosen: ShopItem[];
  let designed: ShopItem[] = [];
  if (style === "מעוצב ודקורטיבי") {
    // On a door the designed doors fit; on other surfaces the coloured wallpapers do.
    designed = slug === "door" ? shop.items.filter((i) => i.product_type === "designed_door" && i.cover).slice(0, 3) : [];
    chosen = all.filter((i) => i.colors.some((c) => COLORFUL.includes(c)));
  } else {
    chosen = all.filter((i) => i.style_family === style);
  }
  const picked = [...designed, ...chosen, ...all.filter((i) => !chosen.includes(i))].slice(0, 3);
  return picked.map((item) => productCard(shop, item, item.product_type === "wallpaper" ? application : undefined));
}
