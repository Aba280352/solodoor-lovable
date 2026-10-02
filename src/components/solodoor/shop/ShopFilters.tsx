import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { STYLE_FAMILIES, formatPrice, type ShopData } from "./catalog";
import { PRICE_STEP, categoriesFor, filterItems, joinList, priceBounds, type ActiveFilters, type ShopSearch } from "./filters";

interface ShopFiltersProps {
  data: ShopData;
  filters: ActiveFilters;
  /** Called after a change when the filters live in a sheet, so it can close. */
  onNavigate?: () => void;
}

const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;
/** The small circle that stands for each style family. */
const STYLE_SWATCH: Record<string, string> = { plain: img("style-plain"), wood: img("style-wood"), stone: img("style-stone") };

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="float-right mb-3 fs-16 font-semibold text-foreground lg:fs-17">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
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

/** Two native range inputs on one track: no library, works on every browser. */
function PriceRange({ bounds, value, onCommit }: { bounds: { min: number; max: number }; value: [number, number]; onCommit: (v: [number, number]) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  const [lo, hi] = local;
  const pct = (n: number) => ((n - bounds.min) / (bounds.max - bounds.min || 1)) * 100;
  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-secondary [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow-handle [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-secondary [&::-moz-range-thumb]:bg-card";

  return (
    <div dir="ltr" className="px-1 pt-1">
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-secondary" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          type="range"
          aria-label="מחיר מינימלי"
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={lo}
          onChange={(e) => setLocal([Math.min(+e.target.value, hi - PRICE_STEP), hi])}
          onPointerUp={() => onCommit(local)}
          onKeyUp={() => onCommit(local)}
          className={thumb}
        />
        <input
          type="range"
          aria-label="מחיר מקסימלי"
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={hi}
          onChange={(e) => setLocal([lo, Math.max(+e.target.value, lo + PRICE_STEP)])}
          onPointerUp={() => onCommit(local)}
          onKeyUp={() => onCommit(local)}
          className={thumb}
        />
      </div>
      <div dir="rtl" className="mt-2.5 flex items-center justify-between fs-15 font-medium text-foreground">
        <span>{formatPrice(lo)}</span>
        <span>{formatPrice(hi)}</span>
      </div>
    </div>
  );
}

/** The filter groups: categories as tick-boxes, a price range, and style families as swatches. */
export function ShopFilters({ data, filters, onNavigate }: ShopFiltersProps) {
  const navigate = useNavigate();
  const bounds = priceBounds(data);
  const categories = categoriesFor(data.applications).filter((c) => c.kind === "type" || filters.wallpapersInScope || c.key === "door");

  const go = (next: Partial<ShopSearch>) => {
    const search: ShopSearch = {
      cat: joinList(filters.cats),
      style: joinList(filters.styles),
      min: filters.min,
      max: filters.max,
      ...next,
    };
    const clean = Object.fromEntries(Object.entries(search).filter(([, v]) => v !== undefined && v !== "")) as ShopSearch;
    navigate({ to: "/חנות", search: clean, resetScroll: false });
    onNavigate?.();
  };
  const toggle = (list: string[], key: string, on: boolean) => (on ? [...list, key] : list.filter((k) => k !== key));

  // How many products each choice would show if it were the only change.
  const countFor = (change: Partial<ActiveFilters>) => filterItems(data, { ...filters, ...change }).length;
  const hasFilters = filters.cats.length > 0 || filters.styles.length > 0 || filters.min !== undefined || filters.max !== undefined;

  return (
    <div className="flex flex-col gap-5 text-right">
      <Group title="סוג מוצר">
        <div className="flex flex-col">
          {categories.map((c) => {
            const checked = filters.cats.includes(c.key);
            const cats = toggle(filters.cats, c.key, !checked);
            const types = cats.filter((k) => k === "designed_door" || k === "pvc_rug");
            const uses = cats.filter((k) => k !== "designed_door" && k !== "pvc_rug");
            return (
              <Checkbox
                key={c.key}
                checked={checked}
                onChange={() => go({ cat: joinList(cats) })}
                label={c.label}
                count={countFor({ cats, types, uses, wallpapersInScope: cats.length === 0 || uses.length > 0 })}
              />
            );
          })}
        </div>
      </Group>

      <Group title="מחיר">
        <PriceRange
          bounds={bounds}
          value={[filters.min ?? bounds.min, filters.max ?? bounds.max]}
          onCommit={([lo, hi]) => go({ min: lo > bounds.min ? lo : undefined, max: hi < bounds.max ? hi : undefined })}
        />
      </Group>

      {filters.wallpapersInScope && (
        <Group title="סגנון">
          <div className="flex flex-wrap gap-4">
            {STYLE_FAMILIES.map((family) => {
              const checked = filters.styles.includes(family.key);
              return (
                <label key={family.key} className="flex cursor-pointer flex-col items-center gap-2 text-center">
                  <input type="checkbox" checked={checked} onChange={(e) => go({ style: joinList(toggle(filters.styles, family.key, e.target.checked)) })} className="sr-only" />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative size-11 overflow-hidden rounded-full border-2 bg-cover bg-center transition-[border-color,transform] duration-240 ease-standard",
                      checked ? "scale-110 border-foreground shadow-swatch" : "border-card hover:border-foreground",
                    )}
                    style={{ backgroundImage: `url(${STYLE_SWATCH[family.key]})` }}
                  >
                    {checked && (
                      <span className="absolute inset-0 flex items-center justify-center bg-foreground/35 text-background">
                        <Icon name="Check" size={16} />
                      </span>
                    )}
                  </span>
                  <span className="max-w-[9ch] fs-13 leading-[1.25] font-medium text-foreground">{family.label}</span>
                </label>
              );
            })}
          </div>
        </Group>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => go({ cat: undefined, style: undefined, min: undefined, max: undefined })}
          className="inline-flex cursor-pointer items-center gap-2 self-start fs-15 font-medium text-foreground"
        >
          <Icon name="Times" size={14} />
          ניקוי הסינון
        </button>
      )}
    </div>
  );
}
