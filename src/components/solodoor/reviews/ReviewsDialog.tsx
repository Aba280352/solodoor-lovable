import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Icon } from "../Icon";
import { ReviewCard, Stars } from "../Reviews";
import { business } from "../content/business";
import { REVIEWS_LIST, REVIEWS_LIST_DEFAULTS } from "../content/reviews";
import { useSection } from "../content/sections";

/**
 * The "all reviews" button and the pop-up it opens: every review in one list to read, closed with the round X.
 * Plain markup only: the reviews structured data lives on /ביקורות alone.
 */
export function ReviewsDialog({ className }: { className?: string }) {
  const items = useSection(REVIEWS_LIST, REVIEWS_LIST_DEFAULTS).items as { name: string; date: string; text: string; color?: string }[];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-[5px] border-0 bg-secondary px-9 py-3.5 fs-16 font-bold text-secondary-foreground shadow-review transition-transform duration-240 ease-standard hover:scale-103 lg:fs-17",
            className,
          )}
        >
          <span>לכל הביקורות</span>
          <Icon name="AngleLeft" size={13} />
        </button>
      </DialogTrigger>
      <DialogContent
        overlayClassName="items-center justify-center p-3 lg:p-8"
        className="flex max-h-[90dvh] w-full max-w-170 flex-col overflow-hidden rounded-[1rem] bg-background text-right"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 lg:px-8 lg:py-5">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="fs-20 leading-[1.2] font-bold text-foreground lg:fs-24">ביקורות לקוחות על סולודור</DialogTitle>
            <DialogDescription className="flex items-center gap-2 fs-15 text-foreground">
              <Stars className="gap-0.5 fs-16" />
              <span>על סמך {business.reviewCount} ביקורות בגוגל</span>
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="סגירה"
            className="inline-flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border border-foreground bg-transparent p-0 text-foreground transition-colors duration-240 ease-standard hover:bg-foreground hover:text-background"
          >
            <Icon name="Times" size={18} />
          </DialogClose>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-5 lg:px-8 lg:py-6">
          {items.map((review, i) => (
            <ReviewCard key={i} review={{ ...review, i }} className="min-h-0 w-full lg:w-full" />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
