import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Pill } from "./primitives";
import { HOME_ABOUT, HOME_ABOUT_DEFAULTS } from "./content/home";
import { useSection } from "./content/sections";
import { EF, useEditMark } from "./content/layout";
import { useQuiz } from "./quiz-context";
import { whatsappHref } from "./whatsapp";
import { responsive } from "./responsive";

export function About() {
  const { openQuiz } = useQuiz();
  const c = useSection(HOME_ABOUT, HOME_ABOUT_DEFAULTS);
  const aboutSurfaces = c.surfaces.map((s) => s.label);
  const aboutStats = c.stats;
  const aboutGallery = c.gallery;
  const mark = useEditMark();

  return (
    <section id="about" data-reveal className="scroll-mt-16 lg:scroll-mt-20">
      <div className="grid grid-cols-1 items-stretch gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14 lg:px-27 lg:py-24">
        <div className="flex min-w-0 flex-col items-start justify-center text-right">
          <Pill className="tracking-[0.16em]"><EF f="pill">{c.pill}</EF></Pill>
          <h2 className="mt-6 fs-32 leading-[1.12] font-bold tracking-[-0.02em] text-foreground lg:fs-52">
            <span className="block"><EF f="title1">{c.title1}</EF></span>
            <span className="block"><EF f="title2">{c.title2}</EF></span>
          </h2>
          <p className="mt-7 max-w-[48ch] fs-18 leading-[1.85] text-pretty text-foreground">
            <EF f="p1">{c.p1}</EF>
          </p>
          <p className="mt-4 max-w-[48ch] fs-18 leading-[1.85] text-pretty text-foreground">
            <EF f="p2">{c.p2}</EF>
          </p>

          {/* Two even rows of three on mobile; one row on desktop. */}
          <div className="mt-8 flex w-full flex-col gap-y-3 border-t border-foreground/14 pt-6 whitespace-nowrap lg:flex-row lg:items-center lg:justify-between lg:gap-x-3.5">
            {[aboutSurfaces.slice(0, 3), aboutSurfaces.slice(3)].map((group, g) => (
              <Fragment key={g}>
                {g > 0 && <span className="hidden h-4 w-px flex-none bg-foreground opacity-35 lg:block" />}
                <div className="flex items-center justify-between gap-3.5 lg:contents">
                  {group.map((surface, i) => (
                    <Fragment key={i}>
                      {i > 0 && <span className="h-4 w-px flex-none bg-foreground opacity-35" />}
                      <span className="fs-16 font-medium text-foreground lg:fs-18"><EF f={`surfaces.${g * 3 + i}.label`}>{surface}</EF></span>
                    </Fragment>
                  ))}
                </div>
              </Fragment>
            ))}
          </div>

          {/* Three benefits rotating in one slot, 4s each. */}
          <div className="relative mt-6 h-18.5 w-full overflow-hidden rounded-lg border border-border bg-card">
            {aboutStats.map((stat, i) => (
              <div
                key={i}
                className="absolute inset-0 flex animate-stat-cycle items-center justify-center gap-4 px-6 opacity-0"
                style={{ animationDelay: `${i * 4}s` }}
              >
                <span className="inline-flex text-clay">
                  <Icon name={stat.icon} size={32} />
                </span>
                <span className="fs-18 font-bold text-foreground lg:fs-20"><EF f={`stats.${i}.label`}>{stat.label}</EF></span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex w-full flex-col items-center gap-4 lg:flex-row lg:gap-7">
            <Button asChild className="w-full flex-auto px-9 lg:w-auto">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                <span><EF f="whatsappLabel">{c.whatsappLabel}</EF></span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
            <p className="fs-18 whitespace-nowrap text-foreground">
              <EF f="quizPrompt">{c.quizPrompt}</EF>{" "}
              <a href="#" onClick={openQuiz} className="border-b border-primary pb-0.5 font-medium text-foreground">
                <EF f="quizLink">{c.quizLink}</EF>
              </a>
            </p>
          </div>
        </div>

        <div className="grid min-h-[22rem] min-w-0 grid-cols-3 grid-rows-[1.45fr_1fr] gap-2.5 lg:min-h-160 lg:gap-3.5">
          {aboutGallery.map((shot, i) => (
            <div
              key={i}
              className={cn("relative min-h-0 overflow-hidden rounded-lg bg-muted", i === 0 && "col-span-full")}
            >
              <img
                {...mark(`gallery.${i}.src`)}
                {...responsive(shot.src, i === 0 ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 20vw, 34vw")}
                loading="lazy"
                alt={shot.alt}
                className="absolute inset-0 block size-full object-cover object-left transition-transform duration-420 ease-standard hover:scale-103"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
