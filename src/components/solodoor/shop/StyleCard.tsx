import { Link } from "@tanstack/react-router";

import { CoverImage, MediaPlaceholder } from "../primitives";
import { catalogImage, formatPrice, type StyleItem } from "./catalog";

/** A wallpaper in a style archive: the flat swatch, and the roll photo fading in on hover. */
export function StyleCard({ item }: { item: Pick<StyleItem, "slug" | "title" | "base_price" | "swatch" | "roll"> }) {
  const name = `טפט ${item.title}`;
  const swatch = catalogImage(item.swatch);
  const roll = catalogImage(item.roll);

  return (
    <Link
      to="/product/$slug"
      params={{ slug: item.slug }}
      search={{ img: "swatch" }}
      className="group flex flex-col overflow-hidden rounded-[0.5rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground focus-visible:border-foreground"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {swatch ? <CoverImage src={swatch} alt={name} loading="lazy" /> : <MediaPlaceholder label={name} />}
        {roll && (
          <CoverImage
            src={roll}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="opacity-0 transition-opacity duration-500 ease-standard group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        )}
      </div>
      <div className="flex flex-auto flex-col items-center gap-2 px-3 pt-4 pb-5 text-center lg:gap-2.5 lg:px-5 lg:pt-5 lg:pb-6">
        <span className="fs-16 leading-[1.3] font-semibold text-foreground lg:fs-18">{name}</span>
        <span className="fs-18 font-bold text-foreground lg:fs-20">{formatPrice(item.base_price)} למטר</span>
        <span className="mt-auto w-full rounded-md bg-primary px-2.5 py-[0.8125rem] fs-15 leading-[normal] font-medium text-primary-foreground lg:fs-16">
          לפרטים נוספים
        </span>
      </div>
    </Link>
  );
}
