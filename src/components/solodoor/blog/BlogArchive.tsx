import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";

import { Icon } from "../Icon";
import { Container, Pill } from "../primitives";
import { ArticleCard } from "./ArticleCard";
import type { ArticleSummary } from "./articles";

/** The articles archive: heading, a search box and every published article. */
export function BlogArchive({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const shown = q ? articles.filter((a) => `${a.title} ${a.excerpt ?? ""}`.includes(q)) : articles;

  return (
    <>
      <section className="border-b border-border">
        <Container className="pt-6 pb-9 text-right lg:pt-8 lg:pb-12">
          <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              מאמרים
            </span>
          </nav>
          <Pill className="mt-5 tracking-[0.16em]">הבלוג</Pill>
          <h1 className="mt-4 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-62">מדריכים ומאמרים</h1>
          <p className="mt-4 max-w-[62ch] fs-18 leading-[1.7] text-foreground lg:fs-20">
            כל מה שכדאי לדעת לפני שמחדשים דלת, מטבח, מקרר או ארון: מדריכים, השוואות ותשובות מהניסיון שלנו בשטח.
          </p>
        </Container>
      </section>

      <section className="pt-7 pb-16 lg:pt-10 lg:pb-26">
        <Container>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="fs-16 font-medium text-foreground">{shown.length} מאמרים</p>
            <div className="relative w-full lg:w-90">
              <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-foreground">
                <Icon name="Search" size={18} />
              </span>
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="על מה בא לכם לקרוא?"
                aria-label="חיפוש במאמרים"
                className="ps-11 fs-16"
              />
            </div>
          </div>

          {shown.length ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-6">
              {shown.map((article, i) => (
                <ArticleCard key={article.id} article={article} priority={i < 3} />
              ))}
            </div>
          ) : (
            <p className="mt-8 fs-18 text-foreground">לא נמצאו מאמרים עבור "{q}". נסו מילה אחרת.</p>
          )}
        </Container>
      </section>
    </>
  );
}
