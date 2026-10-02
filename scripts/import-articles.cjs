/**
 * Copies the articles of the current site (solodoor.co.il, WordPress) into the
 * `articles` table, one to one: same slug, title, content, excerpt and SEO meta.
 *
 *   node scripts/import-articles.cjs fetch     # saves the posts to data/articles/articles.json
 *   SUPABASE_URL=... SUPABASE_KEY=... IMPORT_TOKEN=... node scripts/import-articles.cjs load
 *
 * Loading needs the temporary token-gated insert policy (see scripts/import-catalog.cjs).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "data", "articles", "articles.json");
const OLD_SITE = "https://solodoor.co.il";

const decode = (s) =>
  s
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");

async function fetchPosts() {
  const res = await fetch(`${OLD_SITE}/wp-json/wp/v2/posts?per_page=100&_embed=1`, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`WordPress API: ${res.status}`);
  const posts = await res.json();
  const seen = new Set();
  const rows = [];
  for (const post of posts) {
    const slug = decodeURIComponent(post.slug);
    // The old site lists one article twice; keep the first (newest id).
    if (seen.has(slug) || post.status !== "publish") continue;
    seen.add(slug);
    const seo = post.aioseo_head_json ?? {};
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    rows.push({
      legacy_id: post.id,
      slug,
      title: decode(post.title.rendered),
      excerpt: decode(post.excerpt.rendered.replace(/<[^>]+>/g, "").trim()),
      // Kept exactly as published; only the old domain in internal links becomes relative.
      content_html: post.content.rendered.replace(new RegExp(`${OLD_SITE}/([^"'\\s]+?)/?(["'])`, "g"), "/$1$2").trim(),
      featured_image: media?.source_url ? `/articles/${slug}.webp` : null,
      featured_alt: media?.alt_text || decode(post.title.rendered),
      meta_title: seo.title ?? null,
      meta_description: seo.description ?? null,
      is_published: true,
      published_at: `${post.date_gmt}Z`,
      updated_at: `${post.modified_gmt}Z`,
    });
  }
  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(rows, null, 1));
  console.log(`saved ${rows.length} articles to ${path.relative(ROOT, JSON_PATH)}`);
}

async function loadRows() {
  const { SUPABASE_URL, SUPABASE_KEY, IMPORT_TOKEN } = process.env;
  if (!SUPABASE_URL || !SUPABASE_KEY || !IMPORT_TOKEN) throw new Error("SUPABASE_URL, SUPABASE_KEY and IMPORT_TOKEN are required");
  const rows = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  for (let i = 0; i < rows.length; i += 20) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?on_conflict=slug`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        "x-import-token": IMPORT_TOKEN,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows.slice(i, i + 20)),
    });
    if (!res.ok) throw new Error(`articles: ${res.status} ${await res.text()}`);
  }
  console.log(`loaded ${rows.length} articles`);
}

(process.argv[2] === "load" ? loadRows() : fetchPosts()).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
