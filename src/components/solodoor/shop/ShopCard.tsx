import { Link } from "@tanstack/react-router";

import { CoverImage, MediaPlaceholder } from "../primitives";
import { catalogImage, formatPrice, type Application, type ShopItem } from "./catalog";

interface ShopCardProps {
  item: ShopItem;
  /** The surface the visitor is browsing; picks the photo, the price and the tab the card opens. */
  application?: Application;
  rugFromPrice?: number | null;
  /** Selected colour families; a designed door then shows (and opens on) its photo in that colour. */
  colors?: string[];
}

/** What the card says under the name, e.g. "₪119 למטר". */
function priceLabel(item: ShopItem, application?: Application, rugFromPrice?: number | null) {
  if (item.product_type === "pvc_rug") return `החל מ-${formatPrice(rugFromPrice ?? item.base_price)}`;
  if (item.product_type === "designed_door") return `${formatPrice(item.base_price)} לצד`;
  if (application) return `${formatPrice(application.unit_price)} ${application.sell_unit === "side" ? "לצד" : "למטר"}`;
  return `${formatPrice(item.base_price)} למטר`;
}

/** Shop grid card. The whole card is one link to the product page. */
export function ShopCard({ item, application, rugFromPrice, colors = [] }: ShopCardProps) {
  const isWallpaper = item.product_type === "wallpaper";
  const matching = colors.length ? item.variants.find((v) => v.color && colors.includes(v.color)) : undefined;
  const path = matching?.image ?? (isWallpaper && application ? item.images[application.slug] : null) ?? item.cover;
  const src = catalogImage(path);
  const name = isWallpaper ? `טפט ${item.title}` : item.product_type === "designed_door" ? `דגם ${item.title}` : item.title;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: item.slug }}
      search={isWallpaper && application ? { tab: application.slug } : matching ? { variant: matching.key } : {}}
      className="group flex flex-col overflow-hidden rounded-[0.5rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {src ? (
          <CoverImage
            src={src}
            alt={name}
            loading="lazy"
            className="transition-transform duration-700 ease-standard group-hover:scale-105"
          />
        ) : (
          <MediaPlaceholder label={name} />
        )}
      </div>
      <div className="flex flex-auto flex-col items-center gap-2 px-3 pt-4 pb-5 text-center lg:gap-2.5 lg:px-5 lg:pt-5 lg:pb-6">
        <span className="fs-16 leading-[1.3] font-semibold text-foreground lg:fs-18">{name}</span>
        <span className="fs-18 font-bold text-foreground lg:fs-20">{priceLabel(item, application, rugFromPrice)}</span>
        <span className="mt-auto w-full rounded-md bg-primary px-2.5 py-[0.8125rem] fs-15 leading-[normal] font-medium text-primary-foreground lg:fs-16">
          לפרטים נוספים
        </span>
      </div>
    </Link>
  );
}
