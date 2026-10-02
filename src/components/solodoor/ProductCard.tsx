import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { CoverImage, MediaPlaceholder, Pill } from "./primitives";
import type { Product } from "./data";

export function ProductMedia({ product }: { product: Product }) {
  return product.img ? (
    <CoverImage src={product.img} alt={product.name} />
  ) : (
    <MediaPlaceholder label={product.name} />
  );
}

interface ProductCardProps {
  product: Product;
  /** Shows the enlarge button when given. */
  onZoom?: (product: Product) => void;
  /** Height of the photo area; defaults to the best-sellers size. */
  mediaClassName?: string;
}

/** Shop product card: photo, wishlist and enlarge buttons, name, price, details CTA. */
export function ProductCard({ product, onZoom, mediaClassName }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-[0.5rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground">
      <div className={cn("relative h-44 overflow-hidden bg-muted lg:h-75", mediaClassName)}>
        <ProductMedia product={product} />
        <span className="absolute top-3.5 right-3.5 flex size-9 items-center justify-center rounded-full bg-background text-foreground">
          <Icon name="Heart" size={16} />
        </span>
        {onZoom && (
          <button
            type="button"
            onClick={() => onZoom(product)}
            aria-label="הגדלה"
            className="absolute top-3.5 left-3.5 flex size-9 cursor-pointer items-center justify-center rounded-full bg-background p-0 text-foreground [transition:background-color_240ms_var(--ease-standard),transform_420ms_var(--ease-standard)] hover:scale-110 hover:bg-primary"
          >
            <Icon name="Expand" size={16} />
          </button>
        )}
      </div>
      <div className="flex flex-col items-center gap-2.5 px-3 pt-5 pb-6 text-center lg:px-5.5">
        <span className="fs-16 font-semibold text-foreground lg:fs-18">{product.name}</span>
        <span className="fs-22 font-bold text-foreground">{product.price}</span>
        <div className="mt-1.5 w-full">
          <Button type="button" size="card" className="w-full border border-primary leading-[normal]">
            לפרטים נוספים
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ProductZoomDialogProps {
  /** The product to show; null keeps the dialog closed. */
  product: Product | null;
  /** Category shown in the pill above the name. */
  label: string;
  onClose: () => void;
}

/** Enlarged view of a product, opened by the card's expand button. */
export function ProductZoomDialog({ product, label, onClose }: ProductZoomDialogProps) {
  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="items-center justify-center p-4 lg:p-8"
        className="grid max-h-[88vh] w-full max-w-270 grid-cols-1 overflow-hidden rounded-[1rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <DialogClose
          aria-label="סגירה"
          className="fixed top-3 left-3 flex size-11 cursor-pointer items-center justify-center p-0 text-background lg:top-6 lg:left-7"
        >
          <Icon name="Times" size={30} />
        </DialogClose>
        {product && (
          <>
            <div className="relative min-h-60 overflow-hidden bg-muted lg:min-h-130">
              <ProductMedia product={product} />
            </div>
            <div className="flex flex-col items-start justify-center gap-5 p-6 text-right lg:px-13 lg:py-14">
              <Pill className="tracking-[0.04em]">{label}</Pill>
              <DialogTitle className="fs-28 leading-[1.15] font-bold tracking-[-0.02em] text-foreground lg:fs-40">
                {product.name}
              </DialogTitle>
              <span className="fs-24 font-bold text-foreground lg:fs-30">{product.price}</span>
              <DialogDescription className="max-w-[40ch] fs-18 leading-[1.85] font-light text-foreground">
                ציפוי בהתקנה מקצועית, עם הגנה מפני שריטות ודעיכה בצבע. הדגם מותאם למידות שלכם ומותקן בפריסה רחבה.
              </DialogDescription>
              <Button asChild className="mt-2 px-11 py-4">
                <a href="#">לפרטים נוספים</a>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
