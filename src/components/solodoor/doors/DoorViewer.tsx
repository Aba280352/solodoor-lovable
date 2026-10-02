import { useRef, useState, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { doorFinishes, doorHotspots } from "./data";

/**
 * Interactive door: pick a coating and the door changes, tap a hotspot to read
 * what happens at that spot. With a mouse the whole frame tilts in 3D towards
 * the cursor and the hotspots float above the photo.
 */
export function DoorViewer() {
  const [finish, setFinish] = useState(0);
  const [spot, setSpot] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const active = spot === null ? null : doorHotspots[spot];

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    frame.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
    frame.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
  };

  const settle = () => {
    frameRef.current?.style.setProperty("--tilt-x", "0deg");
    frameRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div className="w-full">
      <div onPointerMove={tilt} onPointerLeave={settle} className="[perspective:75rem]">
        <div
          ref={frameRef}
          className="relative aspect-square [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] transition-transform duration-240 ease-out [transform-style:preserve-3d] motion-reduce:[transform:none]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl bg-muted shadow-menu">
            {doorFinishes.map((item, i) => (
              <img
                key={item.img}
                src={item.img}
                alt={i === finish ? `ציפוי דלתות, דלת כניסה בגוון ${item.name}` : ""}
                className={cn(
                  "absolute inset-0 block size-full object-cover transition-opacity duration-700 ease-standard",
                  i === finish ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </div>

          {doorHotspots.map((hotspot, i) => (
            <button
              key={hotspot.title}
              type="button"
              aria-label={hotspot.title}
              aria-pressed={spot === i}
              onClick={() => setSpot(spot === i ? null : i)}
              onMouseEnter={() => setSpot(i)}
              className={cn(
                "absolute flex size-9 cursor-pointer items-center justify-center rounded-full p-0 shadow-handle transition-colors duration-240 ease-standard lg:size-10",
                spot === i ? "bg-primary text-primary-foreground" : "bg-background text-foreground",
              )}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: "translate(-50%, -50%) translateZ(2.5rem)",
              }}
            >
              {spot !== i && (
                <span className="absolute inset-0 rounded-full bg-background/80 motion-safe:animate-ping" />
              )}
              <span className="relative inline-flex">
                <Icon name={spot === i ? "Minus" : "Plus"} size={15} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Docked onto the frame: the hotspot explanation, or the current coating. */}
      <div
        aria-live="polite"
        className="relative mx-3 -mt-6 min-h-24 rounded-lg border border-border bg-card px-5 py-4 text-right shadow-menu lg:mx-8 lg:-mt-10 lg:min-h-27 lg:px-7 lg:py-5"
      >
        {active ? (
          <>
            <span className="block fs-18 leading-[1.3] font-bold text-foreground lg:fs-20">{active.title}</span>
            <span className="mt-1 block fs-15 leading-[1.6] text-foreground lg:fs-16">{active.text}</span>
          </>
        ) : (
          <>
            <span className="block fs-14 font-semibold tracking-[0.12em] text-clay">הגוון שעל הדלת</span>
            <span className="mt-0.5 block fs-18 leading-[1.3] font-bold text-foreground lg:fs-20">
              {doorFinishes[finish].name}
            </span>
            <span className="mt-1 block fs-15 leading-[1.6] text-foreground lg:fs-16">
              לחצו על הנקודות שעל הדלת כדי לראות איך זה נעשה.
            </span>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2.5 lg:mt-5 lg:gap-3">
        {doorFinishes.map((item, i) => (
          <button
            key={item.name}
            type="button"
            aria-label={`גוון ${item.name}`}
            aria-pressed={i === finish}
            onClick={() => {
              setFinish(i);
              setSpot(null);
            }}
            className={cn(
              "size-11 cursor-pointer rounded-full border border-border bg-cover p-0 transition-shadow duration-160 ease-standard lg:size-12",
              i === finish && "shadow-swatch",
            )}
            // A close-up of the door surface from the same photo.
            style={{ backgroundImage: `url(${item.img})`, backgroundSize: "520%", backgroundPosition: "50% 62%" }}
          />
        ))}
      </div>
    </div>
  );
}
