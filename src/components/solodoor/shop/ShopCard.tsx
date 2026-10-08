import { Link } from "@tanstack/react-router";

import { CoverImage, MediaPlaceholder } from "../primitives";
import { catalogImage, formatPrice, type Application, type ShopItem, type ShopVariant } from "./catalog";

interface ShopCardProps {
  item: ShopItem;
  /** The surface the visitor is browsing; picks the photo, the price and the tab the card opens. */
  application?: Application;
  rugFromPrice?: number | null;
  /** A designed door's colour photo: the card shows it, is named after it and opens the product on it. */
  variant?: ShopVariant;
}

/** What the card says under the name, e.g. "₪119 למטר". */
function priceLabel(item: ShopItem, application?: Application, rugFromPrice?: number | null) {
  if (item.product_type === "pvc_rug") return `החל מ-${formatPrice(rugFromPrice ?? item.base_price)}`;
  if (item.product_type === "designed_door") return `${formatPrice(item.base_price)} לצד`;
  if (application) return `${formatPrice(application.unit_price)} ${application.sell_unit === "side" ? "לצד" : "למטר"}`;
  return `${formatPrice(item.base_price)} למטר`;
}

/** Shop grid card. The whole card is one link to the product page. */
export function ShopCard({ item, application, rugFromPrice, variant }: ShopCardProps) {
  const isWallpaper = item.product_type === "wallpaper";
  const path = variant?.image ?? (isWallpaper && application ? item.images[application.slug] : null) ?? item.cover;
  const src = catalogImage(path);
  const name = isWallpaper ? `טפט ${item.title}` : variant ? variant.title : item.product_type === "designed_door" ? `דגם ${item.title}` : item.title;
  // The model name, when the name of the colour photo does not already say it.
  const model = variant && !variant.title.includes(item.title) ? `דגם ${item.title}` : null;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: item.slug }}
      search={isWallpaper && application ? { tab: application.slug } : variant ? { variant: variant.key } : {}}
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
        {model && <span className="-mt-1 fs-14 text-foreground lg:fs-15">{model}</span>}
        <span className="fs-18 font-bold text-foreground lg:fs-20">{priceLabel(item, application, rugFromPrice)}</span>
        <span className="mt-auto w-full rounded-md bg-primary px-2.5 py-[0.8125rem] fs-15 leading-[normal] font-medium text-primary-foreground lg:fs-16">
          לפרטים נוספים
        </span>
      </div>
    </Link>
  );
}
