import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { styleMenu, useMenu } from "./data";
import { cart, cartCount, cartTotal, useCart } from "./shop/cart";
import { catalogImage, formatPrice, variantColors, type ShopData } from "./shop/catalog";
import { joinList } from "./shop/filters";
import { MenuLink } from "./shop/MenuLink";
import { intentOf, normalize as normalizeText, searchItems } from "./shop/search";
import { priceLabel } from "./shop/ShopCard";
import { loadShop } from "./shop/useShop";

const iconTrigger = "inline-flex cursor-pointer items-center text-foreground";

/** The catalogue groups of the two menus: what is offered before typing, and a second kind of result while typing. */
const searchable = [...useMenu, ...styleMenu];

const MAX_PRODUCTS = 8;

export function SearchButton() {
  const [query, setQuery] = useState("");
  const [shop, setShop] = useState<ShopData | null>(null);
  const [failed, setFailed] = useState(false);
  const [opened, setOpened] = useState(false);
  const q = query.trim();

  useEffect(() => {
    if (!opened) return;
    let live = true;
    loadShop().then(
      (data) => live && setShop(data),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [opened]);

  const hits = useMemo(() => (shop && q ? searchItems(shop.items, shop.applications, q) : []), [shop, q]);
  const intent = useMemo(() => (shop && q ? intentOf(q, shop.applications) : null), [shop, q]);
  // Menu groups whose name contains the typed words ("עצים", "מקרר") are offered too.
  const groups = q ? searchable.filter((item) => normalizeText(item.name).includes(normalizeText(q))) : useMenu;
  // A link that opens the shop with the same filters as the words typed.
  const shopFilter = intent
    ? {
        cat: joinList([...(intent.application ? [intent.application] : []), ...(intent.type ? [intent.type] : [])]),
        style: joinList(intent.styles),
        color: joinList(intent.colors),
      }
    : null;
  const hasFilter = !!shopFilter && !!(shopFilter.cat || shopFilter.style || shopFilter.color);
  const nothing = q && shop && !hits.length && !groups.length;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setOpened(true);
        else setQuery("");
      }}
    >
      <DialogTrigger aria-label="חיפוש" className={iconTrigger}>
        <Icon name="Search" size={20} />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="items-start justify-center"
        className="m-0 max-h-dvh w-full max-w-170 overflow-y-auto rounded-b-lg px-5 pt-5 pb-6 lg:mt-24 lg:max-h-[calc(100dvh-8rem)] lg:rounded-lg lg:px-8 lg:pt-7 lg:pb-8"
      >
        <DialogTitle className="sr-only">חיפוש באתר</DialogTitle>
        <div className="flex items-center gap-3">
          <div className="relative flex-auto">
            <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-foreground">
              <Icon name="Search" size={20} />
            </span>
            <Input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="מה מחפשים? למשל שחור, עץ, מקרר"
              className="fs-18 ps-12 pe-4"
            />
          </div>
          <DialogClose aria-label="סגירה" className={iconTrigger}>
            <Icon name="Times" size={24} />
          </DialogClose>
        </div>

        {!q && (
          <>
            <div className="mt-5 fs-15 font-semibold tracking-[0.16em] text-muted-foreground">חיפושים נפוצים</div>
            <GroupList groups={groups} />
          </>
        )}

        {q && !shop && !failed && <p className="mt-5 fs-16 text-foreground">מחפשים...</p>}

        {q && hits.length > 0 && (
          <>
            <div className="mt-5 fs-15 font-semibold tracking-[0.16em] text-muted-foreground">מוצרים</div>
            <div className="mt-3 flex flex-col gap-2">
              {hits.slice(0, MAX_PRODUCTS).map(({ item, colors, application }) => {
                const variant = item.variants.find((v) => colors.some((c) => variantColors(v.color).includes(c)));
                const path = variant?.image ?? (application ? item.images[application] : null) ?? item.swatch ?? item.cover;
                const src = catalogImage(path);
                const app = shop?.applications.find((a) => a.slug === application);
                return (
                  <DialogClose key={item.handle} asChild>
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      search={item.product_type === "wallpaper" && app ? { tab: app.slug } : variant ? { variant: variant.key } : {}}
                      className="flex items-center gap-4"
                    >
                      <span className="relative size-16 flex-none overflow-hidden rounded-md border border-border bg-muted">
                        {src && <img src={src} alt="" className="absolute inset-0 size-full object-cover" />}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="fs-18 font-medium text-foreground">
                          {item.product_type === "wallpaper" ? `טפט ${item.title}` : variant ? variant.title : item.title}
                        </span>
                        <span className="fs-15 text-foreground">{priceLabel(item, app, shop?.rugFromPrice)}</span>
                      </span>
                    </Link>
                  </DialogClose>
                );
              })}
            </div>
          </>
        )}

        {q && groups.length > 0 && (
          <>
            <div className="mt-5 fs-15 font-semibold tracking-[0.16em] text-muted-foreground">קטגוריות</div>
            <GroupList groups={groups} />
          </>
        )}

        {q && hasFilter && hits.length > MAX_PRODUCTS && shopFilter && (
          <DialogClose asChild>
            <Link
              to="/חנות"
              search={{ ...shopFilter, all: "y" }}
              className="mt-5 inline-block border-b border-primary pb-0.5 fs-16 font-medium text-foreground"
            >
              לכל {hits.length} התוצאות בחנות
            </Link>
          </DialogClose>
        )}

        {nothing && (
          <div className="mt-5 flex flex-col gap-3">
            <p className="fs-16 text-foreground">
              לא מצאנו משהו שמתאים ל"{q}". אפשר לנסות צבע (שחור, אפור, חום), סגנון (עץ, אבן, חלק) או משטח (דלת, מקרר, מטבח).
            </p>
            <DialogClose asChild>
              <Link to="/חנות" className="self-start border-b border-primary pb-0.5 fs-16 font-medium text-foreground">
                לכל הקטלוג
              </Link>
            </DialogClose>
          </div>
        )}
        {q && failed && <p className="mt-5 fs-16 text-foreground">החיפוש לא זמין כרגע. נסו שוב בעוד רגע.</p>}
      </DialogContent>
    </Dialog>
  );
}

function GroupList({ groups }: { groups: typeof searchable }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {groups.map((item) => (
        <DialogClose key={item.name} asChild>
          <MenuLink name={item.name} className="flex items-center gap-4">
            <div className="size-16 flex-none overflow-hidden rounded-md border border-border bg-muted">
              <img src={item.img} alt={item.name} className="block size-full object-cover" />
            </div>
            <span className="fs-18 font-medium text-foreground">{item.name}</span>
          </MenuLink>
        </DialogClose>
      ))}
    </div>
  );
}

/** Cart drawer, opening from the left edge. Checkout is not connected yet, so it ends at the total. */
export function CartButton() {
  const { lines, open } = useCart();
  const count = cartCount(lines);

  return (
    <Dialog open={open} onOpenChange={cart.setOpen}>
      <DialogTrigger aria-label={count ? `סל קניות, ${count} פריטים` : "סל קניות"} className={cn(iconTrigger, "relative")}>
        <Icon name="ShoppingCart" size={20} />
        {count > 0 && (
          <span className="absolute -top-2 -left-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 fs-12 leading-none font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="m-0 ms-auto flex min-h-dvh w-full max-w-100 flex-col px-6 pt-5 pb-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <DialogTitle className="fs-24 font-bold text-foreground">סל הקניות</DialogTitle>
          <DialogClose aria-label="סגירה" className={iconTrigger}>
            <Icon name="Times" size={24} />
          </DialogClose>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-auto flex-col items-center justify-center gap-4 text-center">
            <span className="inline-flex text-clay">
              <Icon name="ShoppingCart" size={48} />
            </span>
            <span className="fs-22 font-semibold text-foreground">הסל שלכם ריק</span>
            <span className="max-w-[28ch] fs-16 leading-[1.6] text-foreground">
              בחרו דגם מהקטלוג והוא יופיע כאן.
            </span>
            <DialogClose asChild>
              <Button asChild className="mt-2 px-10">
                <Link to="/חנות">לקטלוג המוצרים</Link>
              </Button>
            </DialogClose>
          </div>
        ) : (
          <>
            <ul className="flex flex-auto flex-col">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3.5 border-b border-border py-4 text-right">
                  <span className="relative size-18 flex-none overflow-hidden rounded-md border border-border bg-muted">
                    {line.image && <img src={line.image} alt="" className="absolute inset-0 size-full object-cover" />}
                  </span>
                  <span className="flex min-w-0 flex-auto flex-col gap-1">
                    <span className="fs-16 leading-[1.3] font-semibold text-foreground">{line.title}</span>
                    {line.note && <span className="fs-14 leading-[1.4] text-foreground">{line.note}</span>}
                    <span className="mt-auto flex items-center justify-between gap-3 pt-1">
                      {line.single ? (
                        <span />
                      ) : (
                        <span className="inline-flex items-center rounded-md border border-input">
                          <button
                            type="button"
                            aria-label="פחות"
                            disabled={line.qty <= 1}
                            onClick={() => cart.setQty(line.id, line.qty - 1)}
                            className="flex size-8 cursor-pointer items-center justify-center text-foreground disabled:cursor-default disabled:opacity-35"
                          >
                            <Icon name="Minus" size={12} />
                          </button>
                          <span dir="ltr" className="w-7 text-center fs-15 font-semibold text-foreground">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="עוד"
                            onClick={() => cart.setQty(line.id, line.qty + 1)}
                            className="flex size-8 cursor-pointer items-center justify-center text-foreground"
                          >
                            <Icon name="Plus" size={12} />
                          </button>
                        </span>
                      )}
                      <span className="fs-16 font-bold text-foreground">
                        {line.price ? formatPrice(line.price * line.qty) : "חינם"}
                      </span>
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`הסרת ${line.title}`}
                    onClick={() => cart.remove(line.id)}
                    className="flex size-8 flex-none cursor-pointer items-center justify-center text-foreground"
                  >
                    <Icon name="Trash" size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="fs-18 font-semibold text-foreground">סה"כ</span>
                <span className="fs-26 leading-none font-bold text-foreground">{formatPrice(cartTotal(lines))}</span>
              </div>
              <span className="fs-14 leading-[1.5] text-foreground">לא כולל משלוח. התשלום המאובטח יחובר בקרוב.</span>
              <Button type="button" disabled className="w-full py-4">
                לתשלום
              </Button>
              <DialogClose asChild>
                <Button asChild variant="outline" className="w-full py-3.5 fs-16">
                  <Link to="/חנות">להמשך קנייה</Link>
                </Button>
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
