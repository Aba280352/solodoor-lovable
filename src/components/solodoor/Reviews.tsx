import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Container, Pill } from "./primitives";
import { GOOGLE_MARK, GOOGLE_WORDMARK } from "./data";
import { business } from "./content/business";
import { EF } from "./content/layout";
import { REVIEWS_HEADINGS, REVIEWS_LIST, REVIEWS_LIST_DEFAULTS, REVIEW_COLORS, type ReviewsKey } from "./content/reviews";
import { useSection } from "./content/sections";
import { ReviewsDialog } from "./reviews/ReviewsDialog";

/** A review and its place in the admin's list (the editor's mark). */
type Review = { name: string; date: string; text: string; color?: string; i: number };

export function Stars({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center leading-none text-star", className)} aria-label="5 מתוך 5 כוכבים">
      {"★★★★★".split("").map((star, i) => (
        <span key={i} aria-hidden="true">
          {star}
        </span>
      ))}
    </div>
  );
}

/** Collapsed height of a review's text in the carousel: exactly six lines (1.8 line height), so every card is exactly as tall as the next. */
const CLAMP = "10.8em";

export function ReviewCard({ review, className, collapsible = false, flat = false }: { review: Review; className?: string; collapsible?: boolean; flat?: boolean }) {
  const f = (name: string) => `items.${review.i}.${name}`;
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  const [full, setFull] = useState(0);
  const text = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!collapsible) return;
    const measure = () => {
      const el = text.current;
      if (!el) return;
      setFull(el.scrollHeight);
      setLong(el.scrollHeight > el.clientHeight + 2 || open);
    };
    measure();
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [collapsible, review.text, open]);
  return (
    <div
      dir="rtl"
      className={cn("flex min-h-72.5 w-72 flex-none flex-col gap-4 rounded-[0.75rem] border border-border bg-card px-6 pt-7 pb-8 lg:w-95 lg:px-7.5", !(collapsible || flat) && "shadow-review", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="inline-flex size-12 flex-none items-center justify-center rounded-full fs-19 font-bold text-card"
            style={{ backgroundColor: review.color ?? REVIEW_COLORS[review.i % REVIEW_COLORS.length] }}
          >
            {review.name.charAt(0)}
          </span>
          <span className={cn("flex flex-col gap-0.5 text-right", collapsible && "min-w-0")}>
            <span className={cn("fs-16 font-semibold text-foreground", collapsible && "truncate")} title={collapsible ? review.name : undefined}><EF f={f("name")}>{review.name}</EF></span>
            <span dir="ltr" className="text-right fs-15 text-foreground">
              <EF f={f("date")}>{review.date}</EF>
            </span>
          </span>
        </div>
        <img src={GOOGLE_MARK} alt="Google" loading="lazy" className="block size-5.5" />
      </div>
      <Stars className="gap-0.5 fs-20" />
      {collapsible ? (
        <div className="flex flex-col">
          <div
            ref={text}
            className="relative overflow-hidden fs-18 leading-[1.8]"
            style={{ height: open ? full : CLAMP, transition: "height 400ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
          >
            <p className="text-right fs-18 leading-[1.8] text-foreground"><EF f={f("text")}>{review.text}</EF></p>
            {long && !open ? (
              <div className="absolute inset-x-0 bottom-0 flex h-20 items-end justify-center bg-gradient-to-t from-card via-card/90 to-transparent">
                <button
                  type="button"
                  aria-expanded={false}
                  onClick={() => setOpen(true)}
                  className="cursor-pointer border-0 bg-transparent p-0 fs-15 font-semibold text-foreground underline underline-offset-4"
                >
                  קרא עוד
                </button>
              </div>
            ) : null}
          </div>
          {long && open ? (
            <button
              type="button"
              aria-expanded
              onClick={() => setOpen(false)}
              className="mt-3 cursor-pointer self-center border-0 bg-transparent p-0 fs-15 font-semibold text-foreground underline underline-offset-4"
            >
              הצג פחות
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-right fs-18 leading-[1.8] text-foreground"><EF f={f("text")}>{review.text}</EF></p>
      )}
    </div>
  );
}

/** One marquee row: the same set twice, sliding by exactly half its width. */
function ReviewRow({ items, className }: { items: Review[]; className: string }) {
  return (
    <div className={cn("flex w-max hover:[animation-play-state:paused]", className)}>
      {[0, 1].map((copy) => (
        <div key={copy} className="flex gap-5 pe-5" aria-hidden={copy === 1}>
          {items.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** The reviews block. `page` picks the heading; the reviews themselves are the same on every page. */
export function Reviews({ page = "home.reviews" }: { page?: ReviewsKey }) {
  const heading = REVIEWS_HEADINGS[page];
  const h = useSection(heading.def, heading.defaults);
  const list = useSection(REVIEWS_LIST, REVIEWS_LIST_DEFAULTS).items.map((r, i) => ({ ...(r as Omit<Review, "i">), i }));
  // The moving rows show the newest dozen; every review is on the reviews page and in the carousel.
  const shown = list.slice(0, 12);
  const rowA = [...shown, ...shown];
  const rowB = [...shown].reverse().concat([...shown].reverse());
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="px-5 py-2 fs-14 tracking-[0.04em] lg:fs-16 lg:whitespace-nowrap">
            <EF f="pill">{h.pill}</EF>
          </Pill>
          <h2 className="mt-5 fs-40 leading-[1.05] font-bold tracking-[-0.03em] text-foreground lg:fs-76">
            <EF f="title">{h.title}</EF>
          </h2>
        </div>

        <div className="mt-5 flex flex-col items-center gap-5 text-center">
          <Stars className="gap-1 fs-38" />
          <span className="fs-18 font-semibold text-foreground">מבוסס על {business.reviewCount} ביקורות</span>
          <img src={GOOGLE_WORDMARK} alt="Google" loading="lazy" className="block h-10 w-auto" />
        </div>
      </Container>

      <div dir="ltr" className="relative mt-10 flex flex-col gap-5 overflow-hidden lg:mt-14">
        <ReviewRow items={rowA} className="animate-reviews-left" />
        <ReviewRow items={rowB} className="animate-reviews-right" />
      </div>

      <Container>
        <div className="mt-9 flex justify-center lg:mt-12">
          <ReviewsDialog />
        </div>
      </Container>
    </section>
  );
}
