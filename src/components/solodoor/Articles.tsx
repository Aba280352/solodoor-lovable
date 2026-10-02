import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "./Icon";
import { ArticleCard } from "./blog/ArticleCard";
import type { ArticleSummary } from "./blog/articles";
import { Container } from "./primitives";

/** "מדריכים ומאמרים": the latest articles from the database. */
export function Articles({ articles }: { articles: ArticleSummary[] }) {
  if (!articles.length) return null;
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">מדריכים ומאמרים</h2>
          <span className="mt-5 block h-0.5 w-14 bg-primary" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-13 lg:grid-cols-3 lg:gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="mt-10 flex justify-center lg:mt-13">
          <Button asChild className="w-full px-17 py-4.5 lg:w-auto">
            <Link to="/מאמרים">
              <span>לכל המאמרים</span>
              <Icon name="ArrowLeft" size={16} />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
