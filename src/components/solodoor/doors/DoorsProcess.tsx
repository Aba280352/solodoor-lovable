import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Pill } from "../primitives";
import { PROCESS_FRAME_COUNT, processFrame, processSteps } from "./data";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * "איך זה עובד": a scroll sequence. The section is several screens tall and its
 * stage sticks under the header; scrolling scrubs through the rendered frames of
 * a door being coated, and the step beside it follows along.
 */
export function DoorsProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;

    const frames: HTMLImageElement[] = [];
    let loaded = false;
    let target = 0;
    let current = 0;
    let drawn = -1;
    let raf = 0;

    const load = () => {
      if (loaded) return;
      loaded = true;
      for (let i = 0; i < PROCESS_FRAME_COUNT; i++) {
        const image = new Image();
        image.src = processFrame(i);
        image.onload = () => {
          if (i === Math.round(current * (PROCESS_FRAME_COUNT - 1))) drawn = -1;
          schedule();
        };
        frames[i] = image;
      }
    };

    // Nearest frame that has finished loading, so fast scrolling never shows a blank stage.
    const nearest = (index: number) => {
      for (let d = 0; d < PROCESS_FRAME_COUNT; d++) {
        for (const i of [index - d, index + d]) {
          const image = frames[i];
          if (image?.complete && image.naturalWidth) return image;
        }
      }
      return null;
    };

    const draw = (index: number) => {
      const image = nearest(index);
      if (!image) return;
      const { width, height } = canvas;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    };

    const tick = () => {
      raf = 0;
      current += (target - current) * 0.18;
      if (Math.abs(target - current) < 0.0005) current = target;

      const index = Math.round(current * (PROCESS_FRAME_COUNT - 1));
      if (index !== drawn) {
        draw(index);
        drawn = index;
      }
      section.style.setProperty("--progress", current.toFixed(4));

      let step = 0;
      processSteps.forEach((s, i) => {
        if (current >= s.from) step = i;
      });
      setActive(step);

      if (current !== target) schedule();
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 2) load();
      const stage = canvas.parentElement as HTMLElement;
      const top = parseFloat(getComputedStyle(stage.parentElement as HTMLElement).top) || 0;
      target = clamp((top - rect.top) / (rect.height - stage.parentElement!.clientHeight));
      schedule();
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      drawn = -1;
      measure();
    };

    resize();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[340svh] bg-muted lg:h-[420svh]">
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden lg:top-20 lg:block lg:h-[calc(100svh-5rem)]">
        <div className="relative z-10 px-5 pt-7 text-right lg:absolute lg:inset-y-0 lg:start-12 lg:flex lg:w-120 lg:flex-col lg:items-start lg:justify-center lg:p-0">
          <Pill className="px-5 py-2 fs-16">איך זה עובד</Pill>
          <h2 className="mt-4 fs-30 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:mt-5 lg:fs-46">
            מדלת ישנה לדלת חדשה, בארבעה צעדים
          </h2>

        {/* Desktop: all four steps beside the door, the current one lit. */}
        <ol className="relative mt-10 hidden w-104 flex-col ps-7 lg:flex">
          <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1 overflow-hidden rounded-full bg-foreground/14">
            <span className="block size-full origin-top rounded-full bg-primary" style={{ scale: "1 var(--progress, 0)" }} />
          </span>
          {processSteps.map((step, i) => (
            <li
              key={step.title}
              className={cn(
                "flex gap-6 py-4 transition-opacity duration-300 ease-standard",
                active === i ? "opacity-100" : "opacity-35",
              )}
            >
              <span dir="ltr" className="w-11 flex-none fs-34 leading-none font-light text-clay">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="fs-22 leading-[1.25] font-bold text-foreground">{step.title}</span>
                <span
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-standard",
                    active === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <span className="overflow-hidden fs-17 leading-[1.65] text-foreground">{step.text}</span>
                </span>
              </span>
            </li>
          ))}
        </ol>
        </div>

        <div className="relative min-h-0 flex-1 lg:absolute lg:inset-0">
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
        </div>

        {/* Mobile: only the current step, under the door. */}
        <div className="relative z-10 h-48 px-5 pb-6 text-right lg:hidden">
          <span aria-hidden="true" className="absolute inset-x-5 top-0 h-1 overflow-hidden rounded-full bg-foreground/14">
            <span className="block size-full origin-right rounded-full bg-primary" style={{ scale: "var(--progress, 0) 1" }} />
          </span>
          {processSteps.map((step, i) => (
            <div
              key={step.title}
              aria-hidden={active !== i}
              className={cn(
                "absolute inset-x-5 top-7 flex gap-4 transition-opacity duration-300 ease-standard",
                active === i ? "opacity-100" : "opacity-0",
              )}
            >
              <span dir="ltr" className="w-9 flex-none fs-28 leading-none font-light text-clay">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="fs-20 leading-[1.25] font-bold text-foreground">{step.title}</span>
                <span className="fs-16 leading-[1.6] text-foreground">{step.text}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
