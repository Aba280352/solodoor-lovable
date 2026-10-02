import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { kitchenModels } from "./data";

/** How long each model stays, and how many vertical panels the curtain has. */
const SLIDE_MS = 4200;
const PANELS = 8;

/**
 * Slow slideshow of the same kitchen in each coating. The next model arrives as
 * a curtain: vertical panels that drop and fade in one after the other, from
 * right to left, over the previous model.
 */
export function KitchenShowcase() {
  const [index, setIndex] = useState(0);
  const count = kitchenModels.length;
  const current = kitchenModels[index];
  const previous = kitchenModels[(index + count - 1) % count];

  // Restarts whenever the model changes, so picking one by hand gives it a full turn.
  useEffect(() => {
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, count]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-muted [container-type:inline-size]">
      <img src={previous.img} alt="" className="absolute inset-0 block size-full object-cover" />

      {/* Keyed by model so the curtain animation replays on every change. */}
      <div key={index} dir="ltr" className="absolute inset-0">
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 overflow-hidden motion-safe:animate-curtain-in"
            style={{
              left: `${(i * 100) / PANELS}%`,
              // A hair wider than its slot, so no seam shows between panels.
              width: `${100 / PANELS + 0.1}%`,
              animationDelay: `${(PANELS - 1 - i) * 85}ms`,
            }}
          >
            <img
              src={current.img}
              alt={i === 0 ? `ציפוי מטבחים – ${current.name}` : ""}
              className="absolute inset-y-0 block h-full max-w-none object-cover"
              style={{ width: "100cqw", left: `${(-i * 100) / PANELS}cqw` }}
            />
          </div>
        ))}
      </div>

      <div className="absolute start-3 top-3 flex items-center gap-2 rounded-full bg-background/92 py-1.5 ps-3 pe-3.5 lg:start-5 lg:top-5 lg:gap-2.5 lg:py-2 lg:ps-4 lg:pe-5">
        <span className="block size-2 flex-none rounded-full bg-primary" />
        <span className="fs-13 font-semibold text-foreground lg:fs-16">{current.name}</span>
      </div>

      <div className="absolute end-3 top-3 flex items-center gap-1.5 rounded-full bg-background/92 px-2.5 py-2 lg:end-5 lg:top-5 lg:gap-2 lg:px-3.5 lg:py-3">
        {kitchenModels.map((model, i) => (
          <button
            key={model.name}
            type="button"
            aria-label={`דגם ${model.name}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 cursor-pointer rounded-full p-0 transition-[width,background-color] duration-240 ease-standard lg:h-[0.4375rem]",
              i === index ? "w-5 bg-primary lg:w-[1.375rem]" : "w-1.5 bg-sand-deep lg:w-[0.4375rem]",
            )}
          />
        ))}
      </div>

      {/* Loads the other models ahead of time so the curtain never opens on a blank panel. */}
      <div hidden>
        {kitchenModels.map((model) => (
          <img key={model.img} src={model.img} alt="" />
        ))}
      </div>
    </div>
  );
}
