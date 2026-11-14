import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import { Container, Pill } from "../primitives";
import { editSection } from "../content/layout";
import type { CategoryContent } from "../content/categories";

/**
 * Under the products of a category page: a short guide, a box that leads to the matching service, and the
 * category's questions. Built only from the site's existing styles (the product page's questions, the site's cards
 * and buttons), so the page keeps its look. Answers stay in the page while closed, so Google reads them.
 */
export function CategoryGuide({ slug, content, ctaHref }: { slug: string; content: CategoryContent; ctaHref: string }) {
  const [open, setOpen] = useState(0);
  const blocks = content.blocks.filter((b) => b.heading || b.text);
  const faq = content.faq.filter((f) => f.question && f.answer);

  return (
    <div {...editSection(`category.${slug}`)}>
      {blocks.length > 0 && (
        <section className="border-t border-border pt-14 pb-4 lg:pt-22">
          <Container>
            <div className="text-right">
              <Pill className="tracking-[0.04em]">מדריך קצר</Pill>
              <h2 className="mt-5 fs-36 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-52">{content.guideTitle}</h2>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-3 lg:gap-6">
              {blocks.map((b) => (
                <div key={b.heading} className="rounded-[0.75rem] border border-border bg-card px-5 py-6 text-right lg:px-7 lg:py-7">
                  <h3 className="fs-20 leading-[1.3] font-bold text-foreground lg:fs-22">{b.heading}</h3>
                  <p className="mt-3 fs-17 leading-[1.75] text-foreground lg:fs-18">{b.text}</p>
                </div>
              ))}
            </div>
            {content.ctaTitle && (
              <div className="mt-6 flex flex-col items-start gap-4 rounded-[0.75rem] bg-muted px-5 py-6 text-right lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-7">
                <div className="flex flex-col gap-1.5">
                  <span className="fs-20 leading-[1.3] font-bold text-foreground lg:fs-24">{content.ctaTitle}</span>
                  {content.ctaText && <span className="max-w-[60ch] fs-17 leading-[1.7] text-foreground">{content.ctaText}</span>}
                </div>
                <Button asChild className="flex-none gap-2 px-7 py-3.5">
                  <Link to={ctaHref as never}>
                    {content.ctaLabel}
                    <Icon name="AngleLeft" size={13} />
                  </Link>
                </Button>
              </div>
            )}
          </Container>
        </section>
      )}

      {faq.length > 0 && (
        <section className="pt-14 pb-16 lg:pt-22 lg:pb-26">
          <Container>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-18">
              <div className="text-right">
                <Pill className="tracking-[0.04em]">השאלות הנפוצות ביותר</Pill>
                <h2 className="mt-5 fs-36 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-52">שאלות נפוצות</h2>
              </div>
              <div className="flex min-w-0 flex-col gap-4">
                {faq.map((item, i) => {
                  const isOpen = open === i;
                  return (
                    <div
                      key={item.question}
                      className="overflow-hidden rounded-[0.75rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
                    >
                      <h3>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpen(isOpen ? -1 : i)}
                          className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-right lg:px-7 lg:py-6"
                        >
                          <span className="flex-auto fs-18 leading-[1.4] font-semibold text-foreground">{item.question}</span>
                          <span className="inline-flex size-9 flex-none items-center justify-center rounded-full border border-foreground text-foreground">
                            <Icon name={isOpen ? "Minus" : "Plus"} size={16} />
                          </span>
                        </button>
                      </h3>
                      <div hidden={!isOpen} className="px-5 pb-6 text-right fs-18 leading-[1.8] text-foreground lg:px-7 lg:pb-7">
                        {item.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
