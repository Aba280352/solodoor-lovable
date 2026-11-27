/** Reads the articles from the database and prepares them for the pages. */
import { supabase } from "@/integrations/supabase/client";
import { edgeCached } from "@/lib/edge-cache";

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  featured_image: string | null;
  featured_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string;
  updated_at: string;
}

/** What the archive and the cards need; the body stays on the server. */
export type ArticleSummary = Omit<Article, "content_html">;

export interface TocItem {
  id: string;
  level: 2 | 3;
  text: string;
}

export const SITE = "https://solodoor.co.il";
export const BLOG_PATH = "/מאמרים";
export const AUTHOR = "צוות סולודור";

const SUMMARY = "id, slug, title, excerpt, featured_image, featured_alt, meta_title, meta_description, is_published, published_at, updated_at";

async function rows<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

// Published articles (a published_at in the future means "scheduled", not shown yet), kept 60s at the edge when a page is rendered on the server (see lib/edge-cache).
export const fetchArticles = () =>
  edgeCached("articles", 60, () =>
    rows<ArticleSummary>(supabase.from("articles").select(SUMMARY).eq("is_published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false })),
  );

export const fetchLatestArticles = (count: number) =>
  edgeCached(`articles_latest_${count}`, 60, () =>
    rows<ArticleSummary>(
      supabase.from("articles").select(SUMMARY).eq("is_published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }).limit(count),
    ),
  );

export function fetchArticle(slug: string): Promise<Article | null> {
  return edgeCached(`article_${slug}`, 60, async () => {
    const now = new Date().toISOString();
    const [article] = await rows<Article>(supabase.from("articles").select("*").eq("slug", slug).eq("is_published", true).lte("published_at", now).limit(1));
    if (!article) return null;
    const scheduled = await rows<{ slug: string }>(supabase.from("articles").select("slug").eq("is_published", true).gt("published_at", now));
    return { ...article, content_html: unlinkScheduled(article.content_html, new Set(scheduled.map((a) => a.slug))) };
  });
}

/** The article slug a link points to on this site ("/slug", "https://solodoor.co.il/slug/", "%D7..."), or null. */
function linkedSlug(href: string): string | null {
  const path = href.replace(/^https?:\/\/(www\.)?solodoor\.co\.il/i, "");
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  const clean = path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}

/**
 * A link to an article that is scheduled but not live yet would be a 404 for readers and Google: until that article
 * goes live, the link is shown as its plain text. The article cache is 60s, so the link comes back within a minute.
 */
function unlinkScheduled(html: string, scheduled: Set<string>): string {
  if (!scheduled.size) return html;
  return html.replace(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (match, href: string, inner: string) => {
    const target = linkedSlug(href);
    return target && scheduled.has(target) ? inner : match;
  });
}

/** Image URL for a stored path: the site's own /articles folder, or an uploaded (absolute) URL. */
export const articleImage = (path: string | null | undefined) =>
  !path ? null : /^https?:\/\//.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const articleUrl = (slug: string) => `${SITE}/${slug}`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem" }).format(new Date(iso));

const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();

export const readingMinutes = (html: string) => Math.max(1, Math.round(stripTags(html).split(/\s+/).length / 200));

export interface FaqItem {
  q: string;
  /** The answer as HTML (one or more paragraphs). */
  a: string;
}

export const FAQ_ID = "faq";
const FAQ_HEADING = /<h2[^>]*>\s*שאלות נפוצות\s*<\/h2>/;

/**
 * The article's FAQ: an h2 "שאלות נפוצות" followed by h3 questions, each with its answer paragraphs.
 * It is taken out of the body (the page shows it as an accordion, with FAQPage schema); the section ends at the next h2.
 */
export function extractFaq(html: string): { html: string; faq: FaqItem[] } {
  const start = html.search(FAQ_HEADING);
  if (start < 0) return { html, faq: [] };
  const afterHeading = html.slice(start).replace(FAQ_HEADING, "");
  const next = afterHeading.search(/<h2[\s>]/);
  const section = next < 0 ? afterHeading : afterHeading.slice(0, next);
  const rest = next < 0 ? "" : afterHeading.slice(next);
  const faq: FaqItem[] = [];
  for (const part of section.split(/(?=<h3[\s>])/)) {
    const m = part.match(/<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*)/);
    if (!m) continue;
    const q = stripTags(m[1]);
    const a = m[2].trim();
    if (q && stripTags(a)) faq.push({ q, a });
  }
  if (!faq.length) return { html, faq: [] };
  return { html: html.slice(0, start) + rest, faq };
}

export const faqAnswerText = (a: string) => stripTags(a.replace(/<\/p>\s*<p[^>]*>/g, " ")).replace(/\s+/g, " ");

/** Gives every h2/h3 an id for the table of contents, without touching anything else in the article. */
export function prepareContent(source: string): { html: string; toc: TocItem[]; faq: FaqItem[] } {
  const { html, faq } = extractFaq(source);
  const toc: TocItem[] = [];
  const prepared = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, inner) => {
    if (/\sid=/.test(attrs)) return match;
    const id = `h-${toc.length + 1}`;
    toc.push({ id, level: Number(level) as 2 | 3, text: stripTags(inner) });
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
  if (faq.length) toc.push({ id: FAQ_ID, level: 2, text: "שאלות נפוצות" });
  return { html: prepared, toc, faq };
}

/** Splits the body before each h2, so blocks (products, the lead form) can sit between its sections. */
export const splitSections = (html: string) => html.split(/(?=<h2[\s>])/).filter((s) => s.trim());

/**
 * The shop category an article's products come from, read from its title and address (first match wins, doors when
 * nothing matches). Cabinets, furniture and bathroom units get the kitchen wallpapers (photographed on cabinet fronts)
 * under their own label.
 */
export function articleSurface(article: Pick<Article, "title" | "slug">): { key: string; label?: string } {
  const text = `${article.title} ${decodeURIComponent(article.slug)}`.toLowerCase();
  if (/שטיח|(^|[-\s])rugs?([-\s]|$)/.test(text)) return { key: "pvc_rug" };
  if (/מקרר|makrer|mekarer|makarer|fridge/.test(text)) return { key: "fridge" };
  if (/שיש|countertop|shayish/.test(text)) return { key: "countertop" };
  if (/ארון חשמל|electric/.test(text)) return { key: "electric-cabinet" };
  if (/דלתות מעוצבות|designed-door/.test(text)) return { key: "designed_door" };
  if (/דלת|משקוף|door|delet|dlat|pladelet|mashkof/.test(text)) return { key: "door" };
  if (/מטבח|mitbach|mitbah|kitchen/.test(text)) return { key: "kitchen" };
  if (/רהיט|ארון|אמבטיה|רחצה|closet|furniture|rahit|aron|ambatia/.test(text)) return { key: "kitchen", label: "טפטים לארונות ורהיטים" };
  if (/קיר|kirot|salon|wall/.test(text)) return { key: "wall" };
  return { key: "door" };
}
