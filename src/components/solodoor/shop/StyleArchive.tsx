import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { Container, Pill } from "../primitives";
import { Group, Swatch } from "./ShopFilters";
import { StyleCard } from "./StyleCard";
import { variantColors, type StyleItem } from "./catalog";
import { splitList } from "./filters";
import { STYLE_HUB, STYLE_PAGES, colorOptionsFor, itemsForStyle, styleImage, type StylePage } from "./styles";

/** Wallpapers of a list that have at least one of the chosen colours (all of them when none is chosen). */
const withColors = (items: StyleItem[], colors: string[]) =>
  colors.length ? items.filter((i) => colors.some((c) => i.colors.includes(c))) : items;

/** A row that looks like a ticked box and opens a style page, so the style list reads like the shop's categories. */
function StyleRow({ page, active, count, label }: { page: StylePage | null; active: boolean; count: number; label: string }) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 flex-none items-center justify-center rounded-[0.25rem] border transition-colors duration-160 ease-standard",
          active ? "border-secondary bg-secondary text-secondary-foreground" : "border-input bg-card text-transparent",
        )}
      >
        <Icon name="Check" size={12} />
      </span>
      <span className="flex-auto fs-16 text-foreground">{label}</span>
      <span className="fs-14 text-foreground/60" dir="ltr">
        {count}
      </span>
    </>
  );
  const className = "flex items-center gap-3 py-1.5";
  return page ? (
    <Link to="/טפט-לפי-סגנון/$style" params={{ style: page.slug }} aria-current={active ? "page" : undefined} className={className}>
      {inner}
    </Link>
  ) : (
    <Link to="/טפט-לפי-סגנון" aria-current={active ? "page" : undefined} className={className}>
      {inner}
    </Link>
  );
}

/** The sidebar: the styles as a list, the colours as swatches. Same blocks as the shop's filters. */
function StyleFilters({
  items,
  page,
  colors,
  onColors,
  onNavigate,
}: {
  items: StyleItem[];
  page: StylePage | null;
  colors: string[];
  onColors: (next: string[]) => void;
  onNavigate?: () => void;
}) {
  const inPage = page ? itemsForStyle(items, page) : items;
  const options = colorOptionsFor(inPage);
  const toggle = (key: string, on: boolean) => {
    onColors(on ? [...colors, key] : colors.filter((c) => c !== key));
    onNavigate?.();
  };

  return (
    <div className="flex flex-col gap-4 text-right">
      <Group title="סגנון">
        <div className="flex flex-col" onClick={onNavigate}>
          <StyleRow page={null} active={!page} count={withColors(items, colors).length} label="כל הסגנונות" />
          {STYLE_PAGES.map((p) => (
            <StyleRow key={p.slug} page={p} active={page?.slug === p.slug} count={withColors(itemsForStyle(items, p), colors).length} label={p.name} />
          ))}
        </div>
      </Group>

      {options.length > 1 && (
        <Group title="צבע">
          <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
            {options.map(({ family, count }) => (
              <Swatch
                key={family.key}
                checked={colors.includes(family.key)}
                onChange={(on) => toggle(family.key, on)}
                label={family.label}
                count={count}
                style={{ background: family.fill }}
                checkTone={family.key === "white" || family.key === "cream" ? "dark" : "light"}
              />
            ))}
          </div>
        </Group>
      )}

      {colors.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onColors([]);
            onNavigate?.();
          }}
          className="inline-flex cursor-pointer items-center gap-2 self-start fs-15 font-medium text-foreground"
        >
          <Icon name="Times" size={14} />
          ניקוי הסינון
        </button>
      )}
    </div>
  );
}

/**
 * The style pages, laid out like the shop archive: heading, filters beside the grid (in a sheet on mobile) and the
 * wallpapers. The hub (page === null) adds four style tiles above the grid and shows every wallpaper.
 */
export function StyleArchive({ items, page, color }: { items: StyleItem[]; page: StylePage | null; color?: string }) {
  const navigate = useNavigate();
  const colors = splitList(color).filter((c) => items.some((i) => i.colors.includes(c)));
  const inPage = page ? itemsForStyle(items, page) : items;
  const shown = withColors(inPage, colors);
  const heading = page ? { title: page.title, intro: page.intro } : STYLE_HUB;
  const [sheetOpen, setSheetOpen] = useState(false);

  // The colours live in the URL (?color=grey), like the shop's filters, so each view can be linked to.
  const setColors = (next: string[]) => {
    const search = next.length ? { color: next.join(",") } : {};
    if (page) navigate({ to: "/טפט-לפי-סגנון/$style", params: { style: page.slug }, search, resetScroll: false });
    else navigate({ to: "/טפט-לפי-סגנון", search, resetScroll: false });
  };
  // Colours that exist on the page only: a link to another style keeps none of them.
  const filtersProps = { items, page, colors, onColors: setColors };

  return (
    <>
      <section className="border-b border-border">
        <Container className="pt-6 pb-9 text-right lg:pt-8 lg:pb-12">
          <nav aria-label="פירורי לחם" className="flex flex-wrap items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            {page ? (
              <>
                <Link to="/טפט-לפי-סגנון" className="transition-colors duration-160 ease-standard hover:text-clay">
                  טפט לפי סגנון
                </Link>
                <Icon name="AngleLeft" size={11} />
                <span aria-current="page" className="font-medium">
                  {page.name}
                </span>
              </>
            ) : (
              <span aria-current="page" className="font-medium">
                טפט לפי סגנון
              </span>
            )}
          </nav>
          <Pill className="mt-5 tracking-[0.16em]">טפט לפי סגנון</Pill>
          <h1 className="mt-4 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-62">{heading.title}</h1>
          <p className="mt-4 max-w-[62ch] fs-18 leading-[1.7] text-foreground lg:fs-20">{heading.intro}</p>
        </Container>
      </section>

      {!page && (
        <section className="pt-8 lg:pt-12">
          <Container>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
              {STYLE_PAGES.map((p) => {
                const image = styleImage(p);
                const count = itemsForStyle(items, p).length;
                return (
                  <Link
                    key={p.slug}
                    to="/טפט-לפי-סגנון/$style"
                    params={{ style: p.slug }}
                    className="group block overflow-hidden rounded-[0.5rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {image && (
                        <img
                          src={image}
                          alt={p.title}
                          loading="lazy"
                          draggable={false}
                          className="absolute inset-0 block size-full object-cover transition-transform duration-700 ease-standard group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5 lg:py-5">
                      <span className="min-w-0">
                        <span className="block fs-18 font-semibold text-foreground lg:fs-20">{p.name}</span>
                        <span className="mt-0.5 block fs-14 text-foreground lg:fs-15">{count} טפטים</span>
                      </span>
                      <span className="inline-flex size-9 flex-none items-center justify-center rounded-full border border-foreground text-foreground transition-colors duration-240 ease-standard group-hover:bg-foreground group-hover:text-background">
                        <Icon name="AngleLeft" size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      <section className="pt-6 pb-16 lg:pt-10 lg:pb-26">
        <Container className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-10">
          {/* Desktop: the filters stay beside the grid while it scrolls. */}
          <aside aria-label="סינון" className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto lg:rounded-lg lg:border lg:border-border lg:bg-card lg:p-6 lg:[scrollbar-width:thin]">
            <StyleFilters {...filtersProps} />
          </aside>

          <div>
            <div className="sticky top-16 z-30 -mx-5 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-5 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <p className="fs-16 font-medium text-foreground" aria-live="polite">
                {shown.length === 1 ? "טפט אחד" : `${shown.length} טפטים`}
              </p>

              {/* Mobile: the same filters in a sheet. */}
              <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-2 lg:hidden">
                    <Icon name="Filter" size={15} />
                    <span>סינון{colors.length ? ` (${colors.length})` : ""}</span>
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
                    <StyleFilters {...filtersProps} onNavigate={() => setSheetOpen(false)} />
                  </div>
                  <DialogClose asChild>
                    <Button type="button" className="w-full py-4">
                      הצגת {shown.length} טפטים
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>

            {shown.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-5 lg:grid-cols-3 lg:gap-6">
                {shown.map((item) => (
                  <StyleCard key={item.handle} item={item} />
                ))}
              </div>
            ) : (
              <p className="mt-8 fs-18 text-foreground">לא נמצאו טפטים בסינון הזה. נסו להסיר חלק מהסינונים.</p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
