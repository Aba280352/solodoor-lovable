/** Builds /sitemap.xml from the database: fixed pages, published articles, products on sale. */
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

import { SITE, SITE_PAGES } from "./pages";
import { fetchSiteContent, seoOverride } from "./site-content";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Hebrew paths percent-encoded, as Google expects in a sitemap. */
const enc = (url: string) => url.replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c));

export async function buildSitemap(): Promise<string> {
  const db = supabase as unknown as SupabaseClient;
  const [content, articles, products] = await Promise.all([
    fetchSiteContent(),
    db.from("articles").select("slug, updated_at").eq("is_published", true).limit(5000),
    db.from("products").select("slug").limit(5000),
  ]);
  const urls: { url: string; lastmod?: string }[] = SITE_PAGES.filter((p) => !seoOverride(content, p.path).noindex).map((p) => ({ url: p.url }));
  for (const a of (articles.data ?? []) as { slug: string; updated_at: string | null }[]) {
    urls.push({ url: `${SITE}/${a.slug}`, lastmod: a.updated_at?.slice(0, 10) });
  }
  for (const p of (products.data ?? []) as { slug: string | null }[]) {
    if (p.slug) urls.push({ url: `${SITE}/product/${p.slug}` });
  }
  const seen = new Set<string>();
  const unique = urls.filter((u) => (seen.has(u.url) ? false : (seen.add(u.url), true)));
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    unique.map((u) => `  <url><loc>${esc(enc(u.url))}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n") +
    `\n</urlset>\n`
  );
}
