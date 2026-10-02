/** Content for the "ציפוי מטבחים" page. Source copy: docs/old-site/kitchen-coating.md */

const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;

/** Route path. Must stay identical to the old site's URL — the page ranks #1 on it. */
export const KITCHEN_PATH = "/ציפוי-מטבחים";

export const KITCHEN_HERO_IMG = img("hero-kitchen");

export const kitchenSeo = {
  title: "ציפוי מטבחים",
  description:
    "ציפוי מטבחים בהדבקת טפט איכותי: חידוש המטבח ביום עבודה אחד, בלי לכלוך, בלי אבק ובלי שיפוץ. עמיד לחום, אדים ולחות. סולודור – שירות בפריסה רחבה, מצפון ועד דרום.",
};
