import { Link } from "@tanstack/react-router";

import { Icon } from "../Icon";
import { CoverImage, MediaPlaceholder } from "../primitives";
import { articleImage, formatDate, type ArticleSummary } from "./articles";

/** Article card: photo, date, title, excerpt and "read more". The whole card is one link. */
export function ArticleCard({ article, priority = false }: { article: ArticleSummary; priority?: boolean }) {
  const src = articleImage(article.featured_image);
  return (
    <Link
      to="/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col overflow-hidden rounded-[0.5rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {src ? (
          <CoverImage
            src={src}
            alt={article.featured_alt ?? article.title}
            loading={priority ? "eager" : "lazy"}
            className="transition-transform duration-700 ease-standard group-hover:scale-105"
          />
        ) : (
          <MediaPlaceholder label={article.title} />
        )}
      </div>
      <div className="flex flex-auto flex-col gap-3 px-5 pt-5 pb-6 text-right lg:px-6.5 lg:pt-6">
        <time dateTime={article.published_at} className="fs-14 font-medium tracking-[0.04em] text-foreground/70">
          {formatDate(article.published_at)}
        </time>
        <h3 className="fs-18 leading-[1.4] font-semibold text-foreground lg:fs-20">{article.title}</h3>
        {article.excerpt && <p className="flex-auto fs-16 leading-[1.75] text-foreground">{article.excerpt}</p>}
        <span className="inline-flex items-center gap-2 fs-16 font-medium text-clay transition-[gap,color] duration-240 ease-standard group-hover:gap-3.5 group-hover:text-foreground">
          <span>קרא עוד</span>
          <Icon name="AngleLeft" size={13} />
        </span>
      </div>
    </Link>
  );
}
