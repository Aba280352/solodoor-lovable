import { useRef } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { motionStopped } from "../accessibility/a11y";
import { ReviewCard } from "../Reviews";
import { ReviewsDialog } from "./ReviewsDialog";
import { REVIEWS_LIST, REVIEWS_LIST_DEFAULTS } from "../content/reviews";
import { useSection } from "../content/sections";

/**
 * All the Google reviews in one row you can page through with the arrows or by swiping. Plain markup only:
 * the reviews structured data lives on /ביקורות alone, so Google never reads the same review twice.
 */
export function ReviewsCarousel({ className }: { className?: string }) {
  const items = useSection(REVIEWS_LIST, REVIEWS_LIST_DEFAULTS).items as { name: string; date: string; text: string; color?: string }[];
  const track = useRef<HTMLDivElement>(null);
  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    // The page runs right to left: "next" is the card on the left, so scroll by the visible width in that direction.
    el.scrollBy({ left: -dir * el.clientWidth * 0.85, behavior: motionStopped() ? "auto" : "smooth" });
  };
  const arrow =
    "inline-flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border border-secondary bg-secondary p-0 text-secondary-foreground transition-transform duration-240 ease-standard hover:scale-106";
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="fs-16 font-bold text-foreground lg:fs-18">מה לקוחות כותבים עלינו בגוגל</p>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="הביקורת הקודמת" onClick={() => page(-1)} className={arrow}>
            <Icon name="AngleRight" size={14} />
          </button>
          <button type="button" aria-label="הביקורת הבאה" onClick={() => page(1)} className={arrow}>
            <Icon name="AngleLeft" size={14} />
          </button>
        </div>
      </div>
      <div ref={track} className="scrollbar-none -mx-1 flex snap-x items-start snap-mandatory gap-4 overflow-x-auto px-1 pb-2" tabIndex={0} aria-label="ביקורות מגוגל">
        {items.map((review, i) => (
          <div key={i} className="snap-start">
            <ReviewCard collapsible review={{ ...review, i }} className="min-h-0 w-[17.5rem] lg:w-[19rem]" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <ReviewsDialog />
      </div>
    </div>
  );
}
