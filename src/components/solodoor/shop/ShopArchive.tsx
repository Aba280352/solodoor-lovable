import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Icon } from "../Icon";
import { Container, Pill } from "../primitives";
import { ShopCard } from "./ShopCard";
import { ShopFilters } from "./ShopFilters";
import { type ShopData } from "./catalog";
import { activeFilters, filterItems, shopHeading, type ShopSearch } from "./filters";

/** The shop archive: heading, the filters beside the grid (in a sheet on mobile), and the products. */
export function ShopArchive({ data, search }: { data: ShopData; search: ShopSearch }) {
  const filters = activeFilters(search, data);
  const items = filterItems(data, filters);
  const { title, intro } = shopHeading(filters, data);
  // The surface whose photo and price the cards show.
  const application = data.applications.find((a) => a.slug === filters.uses[0]);
  const activeCount = filters.cats.length + filters.styles.length + filters.colors.length;
  const [sheetOpen, setSheetOpen] = useState(false);
  const isRoot = title === "החנות של סולודור";

  return (
    <>
      <section className="border-b border-border">
        <Container className="pt-6 pb-9 text-right lg:pt-8 lg:pb-12">
          <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            {isRoot ? (
              <span aria-current="page" className="font-medium">
                חנות
              </span>
            ) : (
              <>
                <Link to="/חנות" className="transition-colors duration-160 ease-standard hover:text-clay">
                  חנות
                </Link>
                <Icon name="AngleLeft" size={11} />
                <span aria-current="page" className="font-medium">
                  {title}
                </span>
              </>
            )}
          </nav>

          <Pill className="mt-5 tracking-[0.16em]">החנות</Pill>
          <h1 className="mt-4 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-62">{title}</h1>
          <p className="mt-4 max-w-[62ch] fs-18 leading-[1.7] text-foreground lg:fs-20">{intro}</p>
        </Container>
      </section>

      <section className="pt-6 pb-16 lg:pt-10 lg:pb-26">
        <Container className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-10">
          {/* Desktop: the filters stay beside the grid while it scrolls. */}
          <aside aria-label="סינון" className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto lg:rounded-lg lg:border lg:border-border lg:bg-card lg:p-6 lg:[scrollbar-width:thin]">
            <ShopFilters data={data} filters={filters} />
          </aside>

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="fs-16 font-medium text-foreground">{items.length} מוצרים</p>

              {/* Mobile: the same filters in a sheet. */}
              <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-2 lg:hidden">
                    <Icon name="Filter" size={15} />
                    <span>סינון{activeCount ? ` (${activeCount})` : ""}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="m-0 me-auto flex min-h-dvh w-full max-w-90 flex-col px-6 pt-5 pb-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <DialogTitle className="fs-22 font-bold text-foreground">סינון</DialogTitle>
                    <DialogClose aria-label="סגירה" className="inline-flex cursor-pointer items-center text-foreground">
                      <Icon name="Times" size={24} />
                    </DialogClose>
                  </div>
                  <div className="flex-auto overflow-y-auto py-5">
                    <ShopFilters data={data} filters={filters} />
                  </div>
                  <DialogClose asChild>
                    <Button type="button" className="w-full py-4">
                      הצגת {items.length} מוצרים
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>

            {items.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-5 lg:grid-cols-3 lg:gap-6">
                {items.map((item) => (
                  <ShopCard key={item.handle} item={item} application={application} rugFromPrice={data.rugFromPrice} />
                ))}
              </div>
            ) : (
              <p className="mt-8 fs-18 text-foreground">לא נמצאו מוצרים בסינון הזה. נסו להסיר חלק מהסינונים.</p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
