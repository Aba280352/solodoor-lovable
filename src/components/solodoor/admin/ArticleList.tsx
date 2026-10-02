import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

import { Icon } from "../Icon";
import { formatDate, type ArticleSummary } from "../blog/articles";

/** Every article, published or not, newest first. */
export function ArticleList() {
  const [articles, setArticles] = useState<ArticleSummary[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, slug, title, excerpt, featured_image, featured_alt, meta_title, meta_description, is_published, published_at, updated_at")
      .order("published_at", { ascending: false })
      .then(({ data }) => setArticles((data ?? []) as ArticleSummary[]));
  }, []);

  const q = query.trim();
  const shown = (articles ?? []).filter((a) => !q || a.title.includes(q) || a.slug.includes(q));

  return (
    <div className="text-right">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="fs-28 font-bold text-foreground">מאמרים</h1>
          {articles && (
            <p className="mt-1 fs-15 text-foreground/70">
              {articles.length} מאמרים, {articles.filter((a) => a.is_published).length} מפורסמים
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש לפי כותרת או סלאג" className="w-full fs-15 lg:w-72" />
          <Button asChild className="flex-none px-5 py-3 fs-15">
            <Link to="/admin/$id" params={{ id: "new" }}>
              <Icon name="Plus" size={14} />
              <span>מאמר חדש</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        {articles === null ? (
          <p className="px-5 py-8 fs-16 text-foreground">טוען…</p>
        ) : shown.length === 0 ? (
          <p className="px-5 py-8 fs-16 text-foreground">אין מאמרים להצגה.</p>
        ) : (
          <ul>
            {shown.map((article) => (
              <li key={article.id} className="flex items-center gap-4 border-t border-border px-4 py-3 first:border-t-0 lg:px-5">
                <span className="relative size-14 flex-none overflow-hidden rounded-md bg-muted">
                  {article.featured_image && (
                    <img
                      src={/^https?:/.test(article.featured_image) ? article.featured_image : `${import.meta.env.BASE_URL}${article.featured_image.replace(/^\//, "")}`}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  )}
                </span>
                <span className="flex min-w-0 flex-auto flex-col gap-0.5">
                  <Link to="/admin/$id" params={{ id: String(article.id) }} className="truncate fs-17 font-semibold text-foreground hover:text-clay">
                    {article.title}
                  </Link>
                  <span className="truncate fs-14 text-foreground/70" dir="ltr">
                    /{article.slug}
                  </span>
                </span>
                <span className="hidden fs-14 text-foreground/70 lg:block">{formatDate(article.published_at)}</span>
                <span
                  className={
                    "flex-none rounded-full px-3 py-1 fs-13 font-semibold " +
                    (article.is_published ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground")
                  }
                >
                  {article.is_published ? "מפורסם" : "טיוטה"}
                </span>
                <Link to="/$slug" params={{ slug: article.slug }} target="_blank" aria-label="צפייה באתר" className="hidden flex-none text-foreground hover:text-clay lg:inline-flex">
                  <Icon name="Expand" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
