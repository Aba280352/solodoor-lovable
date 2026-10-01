import { Icon } from "./Icon";
import { promoItems } from "./data";

/** The four messages repeated four times, so the marquee loops without a seam. */
const loop = [...promoItems, ...promoItems, ...promoItems, ...promoItems];

export function PromoStrip() {
  return (
    <div className="flex h-9 items-center justify-center bg-primary text-primary-foreground">
      <div className="group relative h-9 w-full overflow-hidden">
        <div
          dir="ltr"
          className="absolute top-0 left-0 flex h-9 w-max animate-promo-marquee items-center gap-30 fs-14 font-medium tracking-[0.01em] whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused] lg:fs-16"
        >
          {loop.map((item, i) => (
            <div key={i} className="contents">
              <div dir="rtl" className="flex flex-none items-center gap-2.5">
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </div>
              <span className="h-3.5 w-px flex-none bg-foreground opacity-35" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
