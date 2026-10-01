import { cn } from "@/lib/utils";

import { Container, Pill } from "./primitives";
import { GOOGLE_MARK, GOOGLE_WORDMARK, REVIEW_COUNT, reviews } from "./data";

type Review = (typeof reviews)[number];

const rowA = [...reviews, ...reviews];
const rowB = [...reviews].reverse().concat([...reviews].reverse());

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
  return (
    <div
      dir="rtl"
      className="flex min-h-72.5 w-72 flex-none flex-col gap-4 rounded-[0.75rem] border border-border bg-card px-6 pt-7 pb-8 shadow-review lg:w-95 lg:px-7.5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex size-12 flex-none items-center justify-center rounded-full fs-19 font-bold text-card"
            style={{ backgroundColor: review.color }}
          >
            {review.name.charAt(0)}
          </span>
          <span className="flex flex-col gap-0.5 text-right">
            <span className="fs-16 font-semibold text-foreground">{review.name}</span>
            <span dir="ltr" className="text-right fs-15 text-foreground">
              {review.date}
            </span>
          </span>
        </div>
        <img src={GOOGLE_MARK} alt="Google" className="block size-5.5" />
      </div>
      <Stars className="gap-0.5 fs-20" />
      <p className="text-right fs-18 leading-[1.8] text-foreground">{review.text}</p>
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

export function Reviews() {
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="px-5 py-2 fs-14 tracking-[0.04em] lg:fs-16 lg:whitespace-nowrap">
            אם עוד לא קניתם, בואו תראו מה רושמים עלינו!
          </Pill>
          <h2 className="mt-5 fs-40 leading-[1.05] font-bold tracking-[-0.03em] text-foreground lg:fs-76">
            מספרים עלינו
          </h2>
        </div>

        <div className="mt-5 flex flex-col items-center gap-5 text-center">
          <Stars className="gap-1 fs-38" />
          <span className="fs-18 font-semibold text-foreground">מבוסס על {REVIEW_COUNT} ביקורות</span>
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
