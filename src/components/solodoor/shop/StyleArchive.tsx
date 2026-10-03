import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { DragRow } from "../DragRow";
import { Icon } from "../Icon";
import { Container, Pill } from "../primitives";
import { StyleCard } from "./StyleCard";
import type { StyleItem } from "./catalog";
import { STYLE_HUB, STYLE_PAGES, colorOptionsFor, itemsForStyle, styleImage, type StylePage } from "./styles";

const chipClass =
  "inline-flex flex-none cursor-pointer items-center gap-2 rounded-full border px-4 py-2 fs-15 font-medium whitespace-nowrap transition-colors duration-160 ease-standard lg:px-5 lg:fs-16";
const chipOn = "border-secondary bg-secondary text-secondary-foreground";
const chipOff = "border-input bg-card text-foreground hover:border-foreground";

/** Links between the hub and the four style archives. */
function StyleNav({ current }: { current: StylePage | null }) {
  return (
    <DragRow className="-mx-5 flex gap-2 overflow-x-auto px-5 scrollbar-none lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
      <Link to="/טפט-לפי-סגנון" aria-current={current ? undefined : "page"} className={cn(chipClass, current ? chipOff : chipOn)}>
        כל הסגנונות
      </Link>
      {STYLE_PAGES.map((page) => (
        <Link
          key={page.slug}
          to="/טפט-לפי-סגנון/$style"
          params={{ style: page.slug }}
          aria-current={current?.slug === page.slug ? "page" : undefined}
          className={cn(chipClass, current?.slug === page.slug ? chipOn : chipOff)}
        >
          {page.name}
        </Link>
      ))}
    </DragRow>
  );
}

/** Colour circles that narrow the wallpapers on the page. */
function ColorRow({
  items,
  selected,
  onToggle,
  onClear,
}: {
  items: StyleItem[];
  selected: string[];
  onToggle: (key: string) => void;
  onClear: () => void;
}) {
  const options = colorOptionsFor(items);
  if (options.length < 2) return null;
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
      <span className="flex-none fs-15 font-semibold text-foreground lg:fs-16">צבע</span>
      <DragRow className="-mx-5 flex flex-auto gap-2 overflow-x-auto px-5 scrollbar-none lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        <button type="button" aria-pressed={selected.length === 0} onClick={onClear} className={cn(chipClass, selected.length === 0 ? chipOn : chipOff)}>
          הכל
        </button>
        {options.map(({ family, count }) => {
          const on = selected.includes(family.key);
          return (
            <button key={family.key} type="button" aria-pressed={on} onClick={() => onToggle(family.key)} className={cn(chipClass, on ? chipOn : chipOff)}>
              <span aria-hidden="true" className="block size-4 flex-none rounded-full border border-foreground/25" style={{ background: family.fill }} />
              {family.label}
              <span className="fs-13 opacity-70" dir="ltr">
                {count}
              </span>
            </button>
          );
        })}
      </DragRow>
    </div>
  );
}

/** The hub (page === null) shows four style tiles over every wallpaper. A style page shows only its own. */
export function StyleArchive({ items, page }: { items: StyleItem[]; page: StylePage | null }) {
  const [colors, setColors] = useState<string[]>([]);
  const inPage = page ? itemsForStyle(items, page) : items;
  const shown = colors.length ? inPage.filter((i) => colors.some((c) => i.colors.includes(c))) : inPage;
  const heading = page ? { title: page.title, intro: page.intro } : STYLE_HUB;
  const toggle = (key: string) => setColors((cur) => (cur.includes(key) ? cur.filter((c) => c !== key) : [...cur, key]));

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

      <section className="pt-8 pb-16 lg:pt-12 lg:pb-26">
        <Container>
          <div className="flex flex-col gap-4 lg:gap-5">
            {page && <StyleNav current={page} />}
            <ColorRow items={inPage} selected={colors} onToggle={toggle} onClear={() => setColors([])} />
          </div>
          <p className="mt-6 fs-16 font-medium text-foreground" aria-live="polite">
            {shown.length} {page ? "טפטים" : "טפטים בכל הסגנונות"}
          </p>
          {shown.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-5 lg:grid-cols-4 lg:gap-6">
              {shown.map((item) => (
                <StyleCard key={item.handle} item={item} />
              ))}
            </div>
          ) : (
            <p className="mt-8 fs-18 text-foreground">לא נמצאו טפטים בצבע הזה. נסו צבע אחר.</p>
          )}
        </Container>
      </section>
    </>
  );
}
