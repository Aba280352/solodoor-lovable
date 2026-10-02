import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { styleMenu, useMenu } from "./data";
import { cart, cartCount, cartTotal, useCart } from "./shop/cart";
import { formatPrice } from "./shop/catalog";
import { shopSearchFor } from "./shop/links";

const iconTrigger = "inline-flex cursor-pointer items-center text-foreground";

/** Everything searchable for now: the catalogue groups from the two menus. */
const searchable = [...useMenu, ...styleMenu];

export function SearchButton() {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const results = q ? searchable.filter((item) => item.name.includes(q)) : useMenu;

  return (
    <Dialog onOpenChange={(open) => !open && setQuery("")}>
      <DialogTrigger aria-label="חיפוש" className={iconTrigger}>
        <Icon name="Search" size={20} />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="items-start justify-center"
        className="m-0 w-full max-w-170 rounded-b-lg px-5 pt-5 pb-6 lg:mt-24 lg:rounded-lg lg:px-8 lg:pt-7 lg:pb-8"
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
              placeholder="מה מחפשים?"
              className="fs-18 ps-12 pe-4"
            />
          </div>
          <DialogClose aria-label="סגירה" className={iconTrigger}>
            <Icon name="Times" size={24} />
          </DialogClose>
        </div>

        <div className="mt-5 fs-15 font-semibold tracking-[0.16em] text-muted-foreground">
          {q ? "תוצאות" : "חיפושים נפוצים"}
        </div>
        {results.length ? (
          <div className="mt-3 flex flex-col gap-2">
            {results.map((item) => (
              <DialogClose key={item.name} asChild>
                <Link to="/חנות" search={shopSearchFor(item.name)} className="flex items-center gap-4">
                <div className="size-16 flex-none overflow-hidden rounded-md border border-border bg-muted">
                  <img src={item.img} alt={item.name} className="block size-full object-cover" />
                </div>
                <span className="fs-18 font-medium text-foreground">{item.name}</span>
                </Link>
              </DialogClose>
            ))}
          </div>
        ) : (
          <p className="mt-3 fs-16 text-foreground">לא נמצאו תוצאות עבור "{q}". נסו מילה אחרת.</p>
        )}
      </DialogContent>
    </Dialog>
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
