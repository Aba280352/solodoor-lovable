/**
 * Addresses of the old WordPress site that Google still knows (seen in Search Console, Nov 2026) and that have no
 * page of their own here: each gets a permanent (301) redirect to the closest page. Truly unknown addresses stay a
 * real 404, because sending every error to the home page is treated by Google as a "soft 404".
 */

/** The page an old address moves to, or null when it is not an old-site address. `pathname` may be percent-encoded. */
export function oldSiteRedirect(pathname: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    path = pathname;
  }
  path = path.replace(/\/+$/, "") || "/";
  const lower = path.toLowerCase();

  // RSS feeds: /feed, /comments/feed, and /<anything>/feed go to the page the feed belonged to.
  if (lower === "/feed" || lower === "/comments/feed") return "/";
  if (lower.endsWith("/feed")) {
    const parent = path.slice(0, -"/feed".length) || "/";
    return oldSiteRedirect(parent) ?? parent;
  }

  // The old catalogue PDFs: the models now live in the shop (the fridge catalogue in its category).
  if (/^\/wp-content\/uploads\/.+\.pdf$/i.test(path)) return path.includes("מקרר") ? "/חנות?cat=fridge" : "/חנות";
  // Anything else of WordPress itself (theme files, images, plugins, the REST API).
  if (/^\/(wp-content|wp-includes|wp-json)(\/|$)/i.test(path)) return "/";

  // Blog archives: categories, tags, paging.
  if (/^\/(category|tag)(\/|$)/i.test(path)) return "/מאמרים";
  if (/^\/מאמרים\/(page\/)?\d+$/.test(path)) return "/מאמרים";
  if (/^\/page\/\d+$/i.test(path)) return "/";
  if (/^\/author(\/|$)/i.test(path)) return "/";

  // The old product plugin and shop pages.
  if (/^\/upcp-product-category\/טפטים-לדלתות$/.test(path)) return "/חנות?cat=door";
  if (/^\/(upcp[-_]product(-category)?|product-category|shop|cart|checkout|my-account)(\/|$)/i.test(path)) return "/חנות";

  // Old one-off pages.
  if (/^\/(thanks|thank-you|תודה|contact|צור-קשר)$/i.test(path)) return "/";

  return null;
}

/** The redirect target as an encoded href the router can send. */
export const encodeTarget = (target: string) => {
  const [p, q] = target.split("?");
  return encodeURI(p) + (q ? `?${q}` : "");
};
