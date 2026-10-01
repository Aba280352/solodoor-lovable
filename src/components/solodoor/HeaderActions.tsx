import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Icon } from "./Icon";
import { styleMenu, useMenu } from "./data";

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
              <a key={item.name} href="#" className="flex items-center gap-4">
                <div className="size-16 flex-none overflow-hidden rounded-md border border-border bg-muted">
                  <img src={item.img} alt={item.name} className="block size-full object-cover" />
                </div>
                <span className="fs-18 font-medium text-foreground">{item.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-3 fs-16 text-foreground">לא נמצאו תוצאות עבור "{q}". נסו מילה אחרת.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Opens a drawer from the left edge. There is no cart data yet, so it shows the empty state. */
export function CartButton() {
  return (
    <Dialog>
      <DialogTrigger aria-label="סל קניות" className={iconTrigger}>
        <Icon name="ShoppingCart" size={20} />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="m-0 ms-auto flex min-h-dvh w-full max-w-100 flex-col px-6 pt-5 pb-8"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <DialogTitle className="fs-24 font-bold text-foreground">סל הקניות</DialogTitle>
          <DialogClose aria-label="סגירה" className={iconTrigger}>
            <Icon name="Times" size={24} />
          </DialogClose>
        </div>
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
              <a href="#">לקטלוג המוצרים</a>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
