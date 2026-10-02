import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Container, CoverImage } from "./primitives";
import { beforeAfterFigures, beforeAfterPairs } from "./data";

export interface BeforeAfterPair {
  name: string;
  desc: string;
  before: string;
  after: string;
}

/** Auto-scroll speed in design pixels per second. */
const SPEED = 35;
/** Pause after a finger lifts, so a swipe's momentum can finish; mouse drags resume at once. */
const TOUCH_RESUME_MS = 350;
const WHEEL_RESUME_MS = 600;

/** Counts 0 -> 1 with an ease-out curve, once the element scrolls into view. */
function useCountUp<T extends HTMLElement>(duration = 1600) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setProgress(1 - Math.pow(1 - p, 3));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) {
      run();
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration]);

  return { ref, progress };
}

function CompareCard({ pair }: { pair: BeforeAfterPair }) {
  // Share of the frame (measured from the right edge) that shows the "before" photo.
  const [pct, setPct] = useState(50);

  return (
    <div data-card className="me-4 w-72 flex-none overflow-hidden rounded-[0.5rem] border border-border bg-background lg:me-6 lg:w-105">
      <div
        className="relative h-72 overflow-hidden bg-muted select-none lg:h-105"
      >
        <CoverImage src={pair.after} alt={`${pair.name}, אחרי`} />
        <span className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: `${pct}%` }}>
          <img
            src={pair.before}
            alt={`${pair.name}, לפני`}
            draggable={false}
            className="pointer-events-none absolute top-0 right-0 block h-full w-72 max-w-none object-cover select-none lg:w-105"
          />
        </span>
        {/* Only this strip moves the slider, so a swipe anywhere else scrolls the carousel. */}
        <span
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            const rect = e.currentTarget.parentElement!.getBoundingClientRect();
            setPct(Math.max(4, Math.min(96, ((rect.right - e.clientX) / rect.width) * 100)));
          }}
          className="absolute inset-y-0 z-1 flex w-12 translate-x-1/2 cursor-ew-resize touch-none items-center justify-center"
          style={{ right: `${pct}%` }}
        >
          <span className="absolute inset-y-0 w-0.5 bg-background" />
          <span className="relative flex size-10 items-center justify-center gap-0.5 rounded-full bg-background text-foreground shadow-handle">
            <Icon name="AngleRight" size={13} />
            <Icon name="AngleLeft" size={13} />
          </span>
        </span>
        <span className="absolute top-4 right-4 rounded-full bg-foreground px-3.5 py-[0.4375rem] fs-15 font-semibold tracking-[0.1em] text-background">
          לפני
        </span>
        <span className="absolute top-4 left-4 rounded-full bg-primary px-3.5 py-[0.4375rem] fs-15 font-semibold tracking-[0.1em] text-primary-foreground">
          אחרי
        </span>
      </div>
      <div className="px-6 pt-5.5 pb-6.5 text-center">
        <span className="block fs-20 font-medium text-foreground lg:fs-22">{pair.name}</span>
        <span className="mt-2 block fs-16 leading-[1.6] text-foreground">{pair.desc}</span>
      </div>
    </div>
  );
}

/** Looping carousel: scrolls by itself, and can be swiped (touch) or dragged (mouse) at any time. */
export function BeforeAfterCarousel({ pairs }: { pairs: BeforeAfterPair[] }) {
  // Three copies of the pairs, so the track can loop endlessly in both directions.
  const items = [...pairs, ...pairs, ...pairs];
  const ref = useRef<HTMLDivElement>(null);
  const hover = useRef(false);
  const resumeAt = useRef(0);
  const touching = useRef(false);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const measure = () => {
    const cards = ref.current?.querySelectorAll<HTMLElement>("[data-card]");
    if (!cards || cards.length < pairs.length + 1) return 0;
    return Math.abs(cards[pairs.length].offsetLeft - cards[0].offsetLeft);
  };

  // The page is RTL, so scrollLeft runs from 0 down to negative values. Keep it
  // inside the middle copy by jumping one set whenever it drifts out.
  const normalize = () => {
    const track = ref.current;
    const set = measure();
    if (!track || !set) return;
    if (track.scrollLeft > -set * 0.5) track.scrollLeft -= set;
    else if (track.scrollLeft < -set * 1.5) track.scrollLeft += set;
  };

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    track.scrollLeft = -measure();
    const onScroll = () => normalize();
    track.addEventListener("scroll", onScroll, { passive: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => track.removeEventListener("scroll", onScroll);
    }

    let last: number | null = null;
    let pos = track.scrollLeft;
    let raf = 0;
    const tick = (now: number) => {
      const idle = !touching.current && now >= resumeAt.current && !hover.current && !drag.current;
      if (last !== null && idle) {
        const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
        pos -= SPEED * scale * ((now - last) / 1000);
        track.scrollLeft = pos;
        pos = track.scrollLeft;
      } else {
        pos = track.scrollLeft;
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pauseFor = (ms: number) => {
    resumeAt.current = performance.now() + ms;
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => (hover.current = false)}
      onTouchStart={() => (touching.current = true)}
      onTouchEnd={() => {
        touching.current = false;
        pauseFor(TOUCH_RESUME_MS);
      }}
      onTouchCancel={() => {
        touching.current = false;
        pauseFor(TOUCH_RESUME_MS);
      }}
      onWheel={() => pauseFor(WHEEL_RESUME_MS)}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
        e.currentTarget.setPointerCapture(e.pointerId);
        setGrabbing(true);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
      }}
      onPointerUp={() => {
        if (!drag.current) return;
        drag.current = null;
        // The cursor is still over the track; ignore it until it leaves and comes back.
        hover.current = false;
        setGrabbing(false);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setGrabbing(false);
      }}
      className={cn(
        "scrollbar-none mt-10 w-full touch-pan-x overflow-x-auto overflow-y-hidden select-none lg:mt-14",
        grabbing ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      <div className="flex w-max items-stretch">
        {items.map((pair, i) => (
          <CompareCard key={i} pair={pair} />
        ))}
      </div>
    </div>
  );
}

export function BeforeAfter() {

  const { ref: statsRef, progress } = useCountUp<HTMLDivElement>();

  return (
    <section data-reveal className="overflow-hidden pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <span className="fs-18 font-medium tracking-[0.02em] text-clay lg:fs-22">מה שהיה בעבר כבר לא יחזור...</span>
          <h2 className="mt-4.5 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">
            עבודות סולודור לפני ואחרי
          </h2>
          <p className="mt-4 max-w-[66ch] fs-18 leading-[1.7] font-medium text-foreground">
            פרויקטים אמיתיים של חידוש דלתות, מטבחים ומשטחים, לפני ואחרי תהליך הציפוי וההתקנה.
          </p>
        </div>
      </Container>

      <BeforeAfterCarousel pairs={beforeAfterPairs} />

      <Container>
        <div
          ref={statsRef}
          className="-mx-5 mt-12 grid grid-cols-2 border-y border-border bg-background lg:-mx-27 lg:mt-16 lg:grid-cols-4"
        >
          {beforeAfterFigures.map((figure) => (
            <div key={figure.label} className="flex flex-col items-center gap-2 px-4.5 py-6 text-center lg:py-8.5">
              <span className="fs-34 leading-none font-bold text-foreground lg:fs-44">
                {Math.round(figure.to * progress)}
                {figure.suffix}
              </span>
              <span className="fs-16 font-medium text-foreground">{figure.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Button asChild className="w-full px-11 py-4.5 lg:w-auto">
            <a href="#">
              <span>לצפייה בפרויקטים נוספים</span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
