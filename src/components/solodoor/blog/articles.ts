/** Reads the articles from the database and prepares them for the pages. */
import { supabase } from "@/integrations/supabase/client";

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

export const fetchArticles = () =>
  rows<ArticleSummary>(supabase.from("articles").select(SUMMARY).eq("is_published", true).order("published_at", { ascending: false }));

export const fetchLatestArticles = (count: number) =>
  rows<ArticleSummary>(
    supabase.from("articles").select(SUMMARY).eq("is_published", true).order("published_at", { ascending: false }).limit(count),
  );

export async function fetchArticle(slug: string): Promise<Article | null> {
  const [article] = await rows<Article>(supabase.from("articles").select("*").eq("slug", slug).eq("is_published", true).limit(1));
  return article ?? null;
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

/** Gives every h2/h3 an id for the table of contents, without touching anything else in the article. */
export function prepareContent(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const prepared = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, inner) => {
    if (/\sid=/.test(attrs)) return match;
    const id = `h-${toc.length + 1}`;
    toc.push({ id, level: Number(level) as 2 | 3, text: stripTags(inner) });
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
  return { html: prepared, toc };
}
