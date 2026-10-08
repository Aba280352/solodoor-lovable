import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { STYLE_FAMILIES, type ShopData } from "./catalog";
import { COLOR_FAMILIES } from "./colors";
import { categoriesFor, colorOptions, joinList, shopCards, type ActiveFilters, type ShopSearch } from "./filters";

interface ShopFiltersProps {
  data: ShopData;
  filters: ActiveFilters;
  /** Called after a change when the filters live in a sheet, so it can close. */
  onNavigate?: () => void;
}

const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;
/** The small circle that stands for each style family. */
const STYLE_SWATCH: Record<string, string> = { plain: img("style-plain"), wood: img("style-wood"), stone: img("style-stone") };

/** A filter group that can be folded, so a long sidebar never hides the group below it. */
function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 text-right"
        >
          <span className="fs-16 font-semibold text-foreground lg:fs-17">{title}</span>
          <span className={cn("inline-flex text-foreground transition-transform duration-240 ease-standard", open && "rotate-180")}>
            <Icon name="AngleDown" size={14} />
          </span>
        </button>
      </h3>
      <div hidden={!open} className="pt-3">
        {children}
      </div>
    </section>
  );
}

function Checkbox({ checked, onChange, label, count }: { checked: boolean; onChange: (v: boolean) => void; label: string; count: number }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 py-1.5", count === 0 && !checked && "opacity-45")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 flex-none items-center justify-center rounded-[0.25rem] border transition-colors duration-160 ease-standard",
          checked ? "border-secondary bg-secondary text-secondary-foreground" : "border-input bg-card text-transparent",
        )}
      >
        <Icon name="Check" size={12} />
      </span>
      <span className="flex-auto fs-16 text-foreground">{label}</span>
      <span className="fs-14 text-foreground/60" dir="ltr">
        {count}
      </span>
    </label>
  );
}

/** A small round swatch with a label under it, used for colours and style families. */
function Swatch({
  checked,
  onChange,
  label,
  count,
  style,
  checkTone = "light",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  count?: number;
  style: React.CSSProperties;
  checkTone?: "light" | "dark";
}) {
  return (
    <label className={cn("flex cursor-pointer flex-col items-center gap-1.5 text-center", count === 0 && !checked && "opacity-40")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "relative size-9 overflow-hidden rounded-full border-2 bg-cover bg-center shadow-[inset_0_0_0_1px_rgb(0_0_0/10%)] transition-[border-color,transform] duration-240 ease-standard lg:size-10",
          checked ? "scale-110 border-foreground shadow-swatch" : "border-card hover:border-foreground",
        )}
        style={style}
      >
        {checked && (
          <span className={cn("absolute inset-0 flex items-center justify-center", checkTone === "light" ? "bg-foreground/30 text-background" : "text-foreground")}>
            <Icon name="Check" size={15} />
          </span>
        )}
      </span>
      <span className="max-w-[9ch] fs-13 leading-[1.25] font-medium text-foreground">{label}</span>
    </label>
  );
}

/** Categories as tick-boxes, colours and style families as swatches. */
export function ShopFilters({ data, filters, onNavigate }: ShopFiltersProps) {
  const navigate = useNavigate();
  const allCategories = categoriesFor(data.applications);
  // Inside an archive only its own category is shown; the whole shop lists every category.
  const categories = filters.archive ? allCategories.filter((c) => c.key === filters.cats[0]) : allCategories;
  const colors = colorOptions(data, filters);

  const go = (next: Partial<ShopSearch>) => {
    const cat = "cat" in next ? next.cat : joinList(filters.cats);
    const search: ShopSearch = {
      cat,
      style: joinList(filters.styles),
      color: joinList(filters.colors),
      // Ticking categories in the whole shop keeps the full sidebar; an archive stays an archive.
      all: !filters.archive && cat ? "y" : undefined,
      ...next,
    };
    const clean = Object.fromEntries(Object.entries(search).filter(([, v]) => v !== undefined && v !== "")) as ShopSearch;
    navigate({ to: "/חנות", search: clean, resetScroll: false });
    onNavigate?.();
  };
  const toggle = (list: string[], key: string, on: boolean) => (on ? [...list, key] : list.filter((k) => k !== key));

  // How many products a category holds on its own, under the current style and colour filters.
  const countFor = (change: Partial<ActiveFilters>) => shopCards(data, { ...filters, ...change }).length;
  // Inside an archive its own category is not a filter that can be cleared.
  const hasFilters = (!filters.archive && filters.cats.length > 0) || filters.styles.length > 0 || filters.colors.length > 0;

  return (
    <div className="flex flex-col gap-4 text-right">
      <Group title="סוג מוצר">
        <div className="flex flex-col">
          {categories.map((c) => {
            const checked = filters.cats.includes(c.key);
            const cats = toggle(filters.cats, c.key, !checked);
            const isType = c.kind === "type";
            return (
              <Checkbox
                key={c.key}
                checked={checked}
                onChange={() => go({ cat: joinList(cats) })}
                label={c.label}
                // Products of this category alone, with the style and colour filters applied.
                count={countFor({ cats: [c.key], types: isType ? [c.key] : [], uses: isType ? [] : [c.key], wallpapersInScope: !isType })}
              />
            );
          })}
        </div>
      </Group>

      {colors.length > 0 && (
        <Group title="צבע">
          <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
            {colors.map((option) => {
              const family = COLOR_FAMILIES.find((f) => f.key === option.key)!;
              return (
                <Swatch
                  key={option.key}
                  checked={filters.colors.includes(option.key)}
                  onChange={(on) => go({ color: joinList(toggle(filters.colors, option.key, on)) })}
                  label={family.label}
                  count={option.count}
                  style={{ background: family.fill }}
                  checkTone={option.key === "white" || option.key === "cream" ? "dark" : "light"}
                />
              );
            })}
          </div>
        </Group>
      )}

      {filters.wallpapersInScope && (
        <Group title="סגנון">
          <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
            {STYLE_FAMILIES.map((family) => (
              <Swatch
                key={family.key}
                checked={filters.styles.includes(family.key)}
                onChange={(on) => go({ style: joinList(toggle(filters.styles, family.key, on)) })}
                label={family.label}
                style={{ backgroundImage: `url(${STYLE_SWATCH[family.key]})` }}
              />
            ))}
          </div>
        </Group>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => go({ cat: filters.archive ? joinList(filters.cats) : undefined, style: undefined, color: undefined })}
          className="inline-flex cursor-pointer items-center gap-2 self-start fs-15 font-medium text-foreground"
        >
          <Icon name="Times" size={14} />
          ניקוי הסינון
        </button>
      )}
    </div>
  );
}
