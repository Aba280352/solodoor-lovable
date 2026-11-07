import { cn } from "@/lib/utils";

import { Container, Pill } from "./primitives";
import { GOOGLE_MARK, GOOGLE_WORDMARK } from "./data";
import { business } from "./content/business";
import { EF } from "./content/layout";
import { REVIEWS_HEADINGS, REVIEWS_LIST, REVIEWS_LIST_DEFAULTS, REVIEW_COLORS, type ReviewsKey } from "./content/reviews";
import { useSection } from "./content/sections";

/** A review and its place in the admin's list (the editor's mark). */
type Review = { name: string; date: string; text: string; color?: string; i: number };

function Stars({ className }: { className?: string }) {
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

function ReviewCard({ review }: { review: Review }) {
  const f = (name: string) => `items.${review.i}.${name}`;
  return (
    <div
      dir="rtl"
      className="flex min-h-72.5 w-72 flex-none flex-col gap-4 rounded-[0.75rem] border border-border bg-card px-6 pt-7 pb-8 shadow-review lg:w-95 lg:px-7.5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex size-12 flex-none items-center justify-center rounded-full fs-19 font-bold text-card"
            style={{ backgroundColor: review.color ?? REVIEW_COLORS[review.i % REVIEW_COLORS.length] }}
          >
            {review.name.charAt(0)}
          </span>
          <span className="flex flex-col gap-0.5 text-right">
            <span className="fs-16 font-semibold text-foreground"><EF f={f("name")}>{review.name}</EF></span>
            <span dir="ltr" className="text-right fs-15 text-foreground">
              <EF f={f("date")}>{review.date}</EF>
            </span>
          </span>
        </div>
        <img src={GOOGLE_MARK} alt="Google" className="block size-5.5" />
      </div>
      <Stars className="gap-0.5 fs-20" />
      <p className="text-right fs-18 leading-[1.8] text-foreground"><EF f={f("text")}>{review.text}</EF></p>
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
  const rowA = [...list, ...list];
  const rowB = [...list].reverse().concat([...list].reverse());
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
          <img src={GOOGLE_WORDMARK} alt="Google" className="block h-10 w-auto" />
        </div>
      </Container>

      <div dir="ltr" className="relative mt-10 flex flex-col gap-5 overflow-hidden lg:mt-14">
        <ReviewRow items={rowA} className="animate-reviews-left" />
        <ReviewRow items={rowB} className="animate-reviews-right" />
      </div>
    </section>
  );
}
