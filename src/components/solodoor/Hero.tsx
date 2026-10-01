import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Pill } from "./primitives";
import { heroSlides, heroTrust } from "./data";
import { useQuiz } from "./quiz-context";

const SLIDE_MS = 3500;

const slideTransition =
  "opacity 1300ms cubic-bezier(.45,0,.2,1), filter 1300ms cubic-bezier(.45,0,.2,1), transform 1800ms cubic-bezier(.2,0,0,1)";

export function Hero() {
  const [slide, setSlide] = useState(0);
  const { openQuiz } = useQuiz();
  const count = heroSlides.length;
  const current = heroSlides[slide];

  // Auto-advance; the timer restarts whenever the slide changes (also by hand).
  useEffect(() => {
    const timer = window.setTimeout(() => setSlide((s) => (s + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [slide, count]);

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Media: full-bleed behind the copy on desktop, a banner above it on mobile. */}
      <div className="relative h-[52vw] overflow-hidden bg-muted lg:absolute lg:inset-x-0 lg:top-0 lg:h-162.5">
        {heroSlides.map((s, i) => (
          <img
            key={s.img}
            src={s.img}
            alt={`${s.l1} ${s.l2}`}
            className={cn(
              "absolute inset-0 block size-full origin-left object-cover object-left will-change-[opacity,transform,filter]",
              i === slide ? "scale-100 opacity-100 blur-0 brightness-100" : "scale-103 opacity-0 blur-[6px] brightness-104",
            )}
            style={{ transition: slideTransition }}
          />
        ))}
      </div>

      <div className="relative lg:grid lg:h-162.5 lg:grid-cols-2 lg:items-stretch">
        <div className="flex min-w-0 flex-col items-center justify-center px-5 pt-5 pb-6 text-center lg:px-22 lg:py-12">
          <Pill className="flex-none tracking-[0.16em] whitespace-nowrap">{current.tag}</Pill>

          <h1 className="mt-3 max-w-[24ch] fs-30 leading-[1.12] font-bold tracking-[-0.02em] text-foreground lg:mt-6.5 lg:fs-54">
            <span className="block">{current.l1}</span>
            <span className="block">{current.l2}</span>
          </h1>

          <p className="mt-3 max-w-[34ch] fs-16 leading-[1.6] text-foreground lg:mt-5.5 lg:fs-18">
            לא בטוח מה לבחור?{" "}
            <a href="#" onClick={openQuiz} className="border-b border-primary pb-px text-foreground">
              לשאלון הכוונה
            </a>
          </p>

          <div className="mt-4 flex w-full flex-col items-stretch gap-2 lg:mt-9 lg:w-auto lg:gap-3 lg:flex-row lg:items-center">
            <Button asChild className="flex-none px-7 py-3 lg:py-[0.9375rem]">
              <a href="#">
                <span>להתייעצות בווצאפ</span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
            <Button asChild variant="secondary" className="flex-none px-7 py-3 lg:py-[0.9375rem]">
              <a href="#">
                <span>לצפייה בקטגוריה</span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
          </div>

          <div className="mt-5 flex w-full items-start justify-center gap-3 border-t border-foreground/14 pt-4 lg:mt-14 lg:gap-6 lg:pt-8.5">
            {heroTrust.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5 lg:gap-2.5">
                <span className="inline-flex text-foreground [&_svg]:size-7 lg:[&_svg]:size-[2.125rem]!">
                  <Icon name={item.icon} size={34} />
                </span>
                <span className="fs-13 leading-[1.45] font-medium text-balance text-foreground lg:fs-15">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden min-w-0 lg:block" />
      </div>

      <button
        type="button"
        onClick={() => setSlide((s) => (s + 1) % count)}
        aria-label="באנר הבא"
        className="absolute end-2 top-[26vw] z-2 inline-flex -translate-y-1/2 cursor-pointer p-2 text-background opacity-85 transition-opacity duration-160 ease-standard hover:opacity-100 lg:end-4.5 lg:top-[46%]"
      >
        <Icon name="AngleLeft" size={34} />
      </button>
      <button
        type="button"
        onClick={() => setSlide((s) => (s + count - 1) % count)}
        aria-label="באנר קודם"
        className="absolute start-2 top-[26vw] z-2 inline-flex -translate-y-1/2 cursor-pointer p-2 text-foreground opacity-50 transition-opacity duration-160 ease-standard hover:opacity-100 lg:start-4.5 lg:top-[46%]"
      >
        <Icon name="AngleRight" size={34} />
      </button>

      <div className="w-full border-y border-border bg-background">
        <div className="mx-auto grid h-13 max-w-330 grid-cols-[1fr_auto_1fr] items-center px-5 lg:px-12">
          <div className="flex items-center justify-start gap-3 text-foreground">
            <span dir="ltr" className="hidden fs-15 font-medium tracking-[0.18em] whitespace-nowrap lg:inline">
              MORE THAN A DOOR
            </span>
          </div>
          <div className="flex items-center gap-[0.5625rem]">
            {heroSlides.map((s, i) => (
              <button
                key={s.img}
                type="button"
                aria-label={`באנר ${i + 1}`}
                onClick={() => setSlide(i)}
                className={cn(
                  "h-[0.4375rem] cursor-pointer rounded-full p-0 transition-[width,background-color] duration-240 ease-standard",
                  i === slide ? "w-[1.375rem] bg-primary" : "w-[0.4375rem] bg-sand-deep",
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-3">
            <span className="hidden fs-15 font-medium tracking-[0.18em] whitespace-nowrap text-foreground lg:inline">
              ציפוי חדש. התחלה יפה יותר.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
