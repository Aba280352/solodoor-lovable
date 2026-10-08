import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { GOOGLE_MARK, REVIEW_COUNT } from "../data";
import { Container, CoverImage, Pill } from "../primitives";
import { DOORS_PHONE, DOORS_PHONE_HREF } from "../doors/data";
import { ArticleCard } from "./ArticleCard";
import { AUTHOR, articleImage, articleUrl, formatDate, prepareContent, readingMinutes, type Article, type ArticleSummary, type TocItem } from "./articles";
import { whatsappHref } from "../whatsapp";

interface BlogPostProps {
  article: Article;
  related: ArticleSummary[];
}

/** Collapsible table of contents built from the article's headings. */
function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(true);
  if (items.length < 2) return null;
  return (
    <nav aria-label="תוכן עניינים" className="rounded-lg border border-border bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-right lg:px-6"
      >
        <span className="fs-18 font-bold text-foreground lg:fs-20">תוכן עניינים</span>
        <span className={cn("inline-flex text-foreground transition-transform duration-240 ease-standard", open && "rotate-180")}>
          <Icon name="AngleDown" size={16} />
        </span>
      </button>
      <ol hidden={!open} className="flex flex-col gap-1 border-t border-border px-5 pt-3 pb-4 lg:px-6">
        {items.map((item) => (
          <li key={item.id} className={cn(item.level === 3 && "ps-5")}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block py-1 fs-16 leading-[1.5] text-foreground transition-colors duration-160 ease-standard hover:text-clay",
                item.level === 2 && "font-medium",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Lead form in the sidebar. Not wired to a backend yet; submitting shows the thank-you state. */
function LeadCard() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <div className="rounded-lg bg-foreground px-5 py-6 text-right text-background lg:px-6 lg:py-7">
      <span className="block fs-22 leading-[1.2] font-bold lg:fs-24">צריכים הצעת מחיר?</span>
      <span className="mt-2 block fs-16 leading-[1.6] font-light">השאירו שם וטלפון ונחזור אליכם עם ייעוץ חינם.</span>
      {sent ? (
        <div className="mt-5 flex items-center gap-3 rounded-md bg-background/10 px-4 py-3.5">
          <span className="inline-flex text-clay">
            <Icon name="CheckCircle" size={22} />
          </span>
          <span className="fs-16 font-medium">קיבלנו, נחזור אליכם בהקדם.</span>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <Input type="text" name="name" required placeholder="שם מלא" autoComplete="name" className="border-background/30 bg-background text-foreground fs-16" />
          <Input type="tel" name="phone" required placeholder="טלפון" autoComplete="tel" className="border-background/30 bg-background text-foreground fs-16" />
          <Button type="submit" className="w-full py-3.5">
            <span>שלחו לי הצעה</span>
            <Icon name="ArrowLeft" size={16} />
          </Button>
        </form>
      )}
      <a href={DOORS_PHONE_HREF} className="mt-4 flex items-center justify-center gap-2 fs-16 font-medium">
        <Icon name="Phone" size={16} />
        <span dir="ltr">{DOORS_PHONE}</span>
      </a>
    </div>
  );
}

function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const item = "inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-4 fs-15 font-medium text-foreground transition-colors duration-160 ease-standard hover:border-foreground";
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="fs-16 font-semibold text-foreground">שיתוף:</span>
      <a className={item} href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener">
        <Icon name="ChatDots" size={16} />
        ווצאפ
      </a>
      <a className={item} href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener">
        פייסבוק
      </a>
      <button
        type="button"
        className={item}
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          });
        }}
      >
        <Icon name={copied ? "Check" : "Bookmark"} size={16} />
        {copied ? "הקישור הועתק" : "העתקת קישור"}
      </button>
    </div>
  );
}

/** A single article: hero, the article with its sidebar, then more articles. */
export function BlogPost({ article, related }: BlogPostProps) {
  const image = articleImage(article.featured_image);
  const { html, toc } = prepareContent(article.content_html);
  const minutes = readingMinutes(article.content_html);
  const url = articleUrl(article.slug);
  const updated = article.updated_at.slice(0, 10) !== article.published_at.slice(0, 10);

  return (
    <>
      {/* Hero: the featured photo under an ink scrim, with breadcrumbs, title and meta. */}
      <section className="relative overflow-hidden bg-foreground text-background">
        {image && <CoverImage src={image} alt="" fetchPriority="high" className="opacity-45" />}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/55 to-foreground/20" />
        <Container className="relative pt-8 pb-10 text-right lg:pt-14 lg:pb-16">
          <nav aria-label="פירורי לחם" className="flex flex-wrap items-center gap-2 fs-14 lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <Link to="/מאמרים" className="transition-colors duration-160 ease-standard hover:text-clay">
              מאמרים
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              {article.title}
            </span>
          </nav>
          <h1 className="mt-6 max-w-[24ch] fs-32 leading-[1.12] font-bold tracking-[-0.02em] lg:mt-8 lg:fs-54">{article.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 fs-15 font-medium lg:fs-16">
            <span className="inline-flex items-center gap-2">
              <Icon name="User" size={15} />
              {AUTHOR}
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="Calendar" size={15} />
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="Clock" size={15} />
              {minutes} דקות קריאה
            </span>
          </div>
        </Container>
      </section>

      <section className="pt-8 pb-14 lg:pt-12 lg:pb-20">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <article className="min-w-0 text-right">
            {article.excerpt && (
              <p className="border-s-4 border-primary ps-5 fs-19 leading-[1.7] font-medium text-pretty text-foreground lg:fs-21">
                {article.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-5 py-3.5">
              <img src={GOOGLE_MARK} alt="Google" className="size-6" />
              <span className="fs-18 leading-none text-star" aria-hidden="true">
                ★★★★★
              </span>
              <span className="fs-15 font-medium text-foreground lg:fs-16">עסק מדורג 5 כוכבים בגוגל, על סמך {REVIEW_COUNT} ביקורות</span>
            </div>

            {image && (
              <figure className="relative mt-7 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                <CoverImage src={image} alt={article.featured_alt ?? article.title} />
              </figure>
            )}

            <div className="mt-7">
              <TableOfContents items={toc} />
            </div>

            {updated && (
              <p className="mt-5 fs-14 text-foreground/70">
                עודכן לאחרונה: <time dateTime={article.updated_at}>{formatDate(article.updated_at)}</time>
              </p>
            )}

            {/* The article body, exactly as published on the old site. */}
            <div className="article-prose mt-7" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="mt-10 flex items-start gap-4 rounded-lg border border-border bg-card p-5 lg:items-center lg:p-6">
              <span className="inline-flex size-14 flex-none items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Icon name="DoorClosed" size={24} />
              </span>
              <span className="flex flex-col gap-1">
                <span className="fs-18 font-bold text-foreground">{AUTHOR}</span>
                <span className="fs-15 leading-[1.6] text-foreground lg:fs-16">
                  מחדשים דלתות, מטבחים, מקררים וארונות בציפוי פולימרי עבה ועמיד, בבתים מצפון ועד דרום. המאמרים נכתבים מתוך העבודה היומיומית בשטח.
                </span>
              </span>
            </div>

            <div className="mt-6">
              <ShareButtons url={url} title={article.title} />
            </div>

            <div className="mt-10 overflow-hidden rounded-lg bg-secondary px-6 py-8 text-secondary-foreground lg:px-10 lg:py-10">
              <Pill className="bg-background px-5 py-2 fs-15 text-foreground">ייעוץ חינם וללא התחייבות</Pill>
              <h2 className="mt-4 max-w-[22ch] fs-26 leading-[1.15] font-bold tracking-[-0.02em] lg:fs-36">רוצים לראות איך זה ייראה אצלכם בבית?</h2>
              <p className="mt-3 max-w-[48ch] fs-17 leading-[1.7] lg:fs-18">
                שלחו לנו תמונה של הדלת, המטבח או הארון בווצאפ, ונחזור אליכם עם המלצה והצעת מחיר.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="px-8 py-4">
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                    <span>לשיחה בווצאפ</span>
                    <Icon name="ChatDots" size={17} />
                  </a>
                </Button>
                <Button asChild variant="light" className="px-8 py-4">
                  <Link to="/חנות">
                    <span>לכל העיצובים בחנות</span>
                    <Icon name="ArrowLeft" size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <LeadCard />
            <div className="rounded-lg border border-border bg-card px-5 py-5 text-right lg:px-6">
              <span className="block fs-18 font-bold text-foreground">מה אפשר לחדש?</span>
              <ul className="mt-3 flex flex-col">
                {[
                  { label: "ציפוי דלתות", to: "/ציפוי-דלתות" as const },
                  { label: "ציפוי מטבחים", to: "/ציפוי-מטבחים" as const },
                  { label: "החנות: טפטים לכל משטח", to: "/חנות" as const },
                  { label: "כל המאמרים", to: "/מאמרים" as const },
                ].map((link) => (
                  <li key={link.to} className="border-t border-border first:border-t-0">
                    <Link
                      to={link.to}
                      className="flex items-center justify-between gap-3 py-3 fs-16 font-medium text-foreground transition-colors duration-160 ease-standard hover:text-clay"
                    >
                      <span>{link.label}</span>
                      <Icon name="AngleLeft" size={12} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </section>

      {related.length > 0 && (
        <section data-reveal className="border-t border-border pt-12 pb-16 lg:pt-18 lg:pb-26">
          <Container>
            <div className="flex flex-col items-center text-center">
              <h2 className="fs-30 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-46">מאמרים נוספים שיעניינו אתכם</h2>
              <span className="mt-4 block h-0.5 w-14 bg-primary" />
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
            <div className="mt-8 flex justify-center lg:mt-10">
              <Button asChild variant="secondary" className="w-full px-12 lg:w-auto">
                <Link to="/מאמרים">
                  <span>לכל המאמרים</span>
                  <Icon name="ArrowLeft" size={16} />
                </Link>
              </Button>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
