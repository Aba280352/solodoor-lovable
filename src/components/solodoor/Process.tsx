import { useEffect, useRef } from "react";

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "./Icon";
import { Container, CoverImage } from "./primitives";
import { processSteps } from "./data";

/** Three copies of the steps, so the track can loop endlessly in both directions. */
const loop = [...processSteps, ...processSteps, ...processSteps];

/** Auto-scroll speed, in design pixels per second. */
const SPEED = 30;

export function Process() {
  const trackRef = useRef<HTMLDivElement>(null);
  const hover = useRef(false);
  const jumping = useRef(false);
  const jumpRaf = useRef(0);

  /** Width of one step (card + gap) and of one full set, in real pixels. */
  const measure = () => {
    const cards = trackRef.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!cards || cards.length < 2) return { step: 0, set: 0 };
    const step = Math.abs(cards[1].offsetLeft - cards[0].offsetLeft);
    return { step, set: step * processSteps.length };
  };

  // The track scrolls right-to-left, so scrollLeft runs from 0 down to negative
  // values. Keep it inside the middle copy by jumping one set whenever it drifts out.
  const normalize = () => {
    const track = trackRef.current;
    const { set } = measure();
    if (!track || !set) return;
    if (track.scrollLeft > -set * 0.5) track.scrollLeft -= set;
    else if (track.scrollLeft < -set * 1.5) track.scrollLeft += set;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = -measure().set;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let last: number | null = null;
    let pos = track.scrollLeft;
    let raf = 0;
    const tick = (now: number) => {
      if (last !== null && !hover.current && !jumping.current) {
        const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
        pos -= SPEED * scale * ((now - last) / 1000);
        track.scrollLeft = pos;
        const before = track.scrollLeft;
        normalize();
        if (track.scrollLeft !== before) pos += track.scrollLeft - before;
      } else {
        pos = track.scrollLeft;
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(jumpRaf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollSteps = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    normalize();
    const from = track.scrollLeft;
    const to = from + dir * measure().step;
    cancelAnimationFrame(jumpRaf.current);
    jumping.current = true;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 420);
      const eased = 1 - Math.pow(1 - p, 3);
      track.scrollLeft = from + (to - from) * eased;
      if (p < 1) jumpRaf.current = requestAnimationFrame(step);
      else {
        normalize();
        jumping.current = false;
      }
    };
    jumpRaf.current = requestAnimationFrame(step);
  };

  const arrowClass =
    "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-secondary bg-secondary p-0 text-secondary-foreground hover:scale-106";

  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
          <div className="order-2 flex flex-col items-center gap-6 rounded-lg border border-border bg-background px-6 py-6 lg:flex-row-reverse lg:gap-8 lg:px-10 lg:py-8">
            <div className="relative flex size-41 flex-none flex-col items-center justify-center gap-[0.3125rem] rounded-full border border-foreground">
              <span className="absolute inset-[0.4375rem] rounded-full border border-primary" />
              <span className="inline-flex text-clay">
                <Icon name="Award" size={38} />
              </span>
              <span className="fs-30 leading-none font-bold text-foreground">200+</span>
              <span className="fs-15 font-bold whitespace-nowrap text-foreground">עיצובים ייחודיים</span>
            </div>
            <div className="flex flex-col gap-2.5 text-center lg:text-right">
              <span className="fs-15 font-bold tracking-[0.16em] text-clay">תקן העבודה של סולודור</span>
              <span className="max-w-[34ch] fs-18 leading-[1.7] font-medium text-foreground">
                התקנה מקצועית בפריסה רחבה · ייעוץ ללא התחייבות · ליווי עד לתוצאה בבית.
              </span>
            </div>
          </div>

          <div className="order-1 flex flex-col items-start text-right">
            <h2 className="fs-36 leading-[1.05] font-bold tracking-[-0.02em] text-foreground lg:fs-62">איך זה עובד?</h2>
            <p className="mt-3 fs-20 font-medium text-foreground lg:fs-22">מהבחירה הראשונה ועד החידוש בבית</p>
            <p className="mt-3.5 max-w-[60ch] fs-18 leading-[1.7] text-foreground lg:h-[3.1875rem] lg:w-98">
              תהליך פשוט, ברור ומדויק לחידוש דלתות ומשטחים בעזרת חיפוי דקורטיבי בהדבקה עצמית.
            </p>
          </div>
        </div>
      </Container>

      <div
        ref={trackRef}
        onMouseEnter={() => (hover.current = true)}
        onMouseLeave={() => (hover.current = false)}
        className="scrollbar-none mt-10 overflow-x-auto overflow-y-hidden lg:mt-14"
      >
        <div className="relative flex w-max items-start gap-6 px-5 lg:px-27">
          {/* The rule threads through the centre of the step numbers. */}
          <div className="absolute inset-x-5 top-[16.8125rem] h-px bg-primary opacity-45 lg:inset-x-27 lg:top-[21.5625rem]" />
          {loop.map((step, i) => (
            <div
              key={i}
              data-step
              className="relative z-1 flex w-64 flex-none flex-col items-center text-center lg:w-86"
            >
              <div className="relative h-56 w-64 overflow-hidden rounded-lg bg-muted lg:h-75 lg:w-86">
                <CoverImage src={step.img} alt={step.name} />
              </div>
              <span className="mt-6.5 inline-flex size-9.5 items-center justify-center rounded-full bg-primary fs-16 font-bold tracking-[0.04em] text-primary-foreground">
                {step.num}
              </span>
              <span className="mt-5.5 fs-20 font-medium text-foreground">{step.name}</span>
              <span className="mt-2.5 fs-16 leading-[1.6] text-foreground">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <Container>
        <div className="mt-10 flex items-center justify-between gap-6 lg:mt-14">
          <div className="order-3 flex items-center gap-2.5">
            <button type="button" onClick={() => scrollSteps(1)} aria-label="שלב קודם" className={arrowClass}>
              <Icon name="AngleRight" size={18} />
            </button>
            <button type="button" onClick={() => scrollSteps(-1)} aria-label="שלב הבא" className={arrowClass}>
              <Icon name="AngleLeft" size={18} />
            </button>
          </div>
          <Button asChild className="order-1 px-6 py-4.5 lg:px-17">
            <Link to="/שאלות-נפוצות">
              <span>לשאלות ותשובות על התהליך</span>
              <Icon name="ArrowLeft" size={16} />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
