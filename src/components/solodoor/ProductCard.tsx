import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { CoverImage, MediaPlaceholder } from "./primitives";
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
