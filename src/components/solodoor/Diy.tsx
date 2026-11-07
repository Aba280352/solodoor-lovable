import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Pill } from "./primitives";
import { QuantityCalculator } from "./QuantityCalculator";
import { YouTubePlayer } from "./shop/YouTubePlayer";
import { HOME_DIY, HOME_DIY_DEFAULTS } from "./content/home";
import { useSection } from "./content/sections";
import { EF, useEditMark } from "./content/layout";
import { responsive } from "./responsive";

/** A pill on the section's photo that opens a video in a pop-up. */
function VideoButton({ label, id, title }: { label: string; id: string; title: string }) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`${title}, פתיחת הסרטון`}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-background py-1.5 ps-1.5 pe-4 fs-14 font-medium text-foreground transition-transform duration-[480ms] ease-standard hover:scale-105 lg:gap-3 lg:py-2 lg:ps-2 lg:pe-5.5 lg:fs-18"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full border-[1.5px] border-foreground lg:size-10">
          <span className="ml-[0.1875rem] block size-0 border-y-[0.4375rem] border-r-0 border-l-[0.6875rem] border-y-transparent border-l-foreground" />
        </span>
        <span>{label}</span>
      </DialogTrigger>
      <DialogContent
        overlayClassName="items-center justify-center p-2 lg:p-8"
        className="flex max-h-[98dvh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-[1rem] px-4 pt-4 pb-4 lg:px-6"
      >
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className="pt-1.5 fs-20 leading-[1.3] font-bold text-foreground lg:fs-24">{title}</DialogTitle>
          <DialogClose
            aria-label="סגירה"
            className="flex size-[46px] flex-none cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors duration-160 ease-standard hover:bg-primary active:bg-primary"
          >
            <Icon name="Times" size={22} />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">נגן הסרטון. הסרטון מתחיל מעצמו, ואפשר לכוון את עוצמת הקול מתחתיו.</DialogDescription>
        <YouTubePlayer id={id} title={title} />
      </DialogContent>
    </Dialog>
  );
}

export function Diy() {
  const c = useSection(HOME_DIY, HOME_DIY_DEFAULTS);
  const diySteps = c.steps;
  const diyTools = c.tools;
  const mark = useEditMark();
  return (
    <section
      id="diy"
      data-reveal
      className="scroll-mt-16 bg-secondary bg-cover bg-center bg-no-repeat pt-14 pb-16 lg:pt-24 lg:scroll-mt-20 lg:pb-26"
      style={{ backgroundImage: `url(${c.background})` }}
    >
      <div className="mx-auto flex max-w-330 flex-col gap-6 px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-stretch lg:gap-14 lg:px-12">
        <div className="contents text-right lg:flex lg:flex-col lg:items-start lg:justify-between lg:gap-10">
          <div className="order-1 flex flex-col items-start">
            <Pill className="px-5.5 py-[0.5625rem] fs-16"><EF f="pill">{c.pill}</EF></Pill>
            <h2 className="mt-6.5 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-background lg:fs-62">
              <EF f="title1">{c.title1}</EF>
              <br />
              <EF f="title2">{c.title2}</EF>
            </h2>
            <p className="mt-5.5 max-w-[44ch] fs-18 leading-[1.8] font-light text-background">
              <EF f="text">{c.text}</EF>
            </p>
            <div className="mt-8 hidden items-center gap-3.5 lg:flex">
              <Button asChild size="xl" className="gap-3 py-5">
                <Link to="/חנות">
                  <span><EF f="cta">{c.cta}</EF></span>
                  <Icon name="ArrowLeft" size={18} />
                </Link>
              </Button>
              <QuantityCalculator />
            </div>
          </div>

          <div className="order-5 mx-auto flex w-full justify-between border-t border-background/55 pt-7 lg:w-fit lg:justify-start">
            {diySteps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-1 flex-col items-center gap-3 px-2 py-1 lg:flex-none lg:px-8",
                  i === 0 && "ps-0 lg:ps-0",
                  i === diySteps.length - 1 ? "pe-0 lg:pe-0" : "border-e border-background/45",
                )}
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-background fs-16 font-bold text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 inline-flex text-background">
                  <Icon name={step.icon} size={38} />
                </span>
                <span className="text-center fs-15 font-medium text-background lg:fs-20"><EF f={`steps.${i}.label`}>{step.label}</EF></span>
              </div>
            ))}
          </div>
        </div>

        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          <div className="relative order-2 aspect-[878/490] overflow-hidden rounded-xl bg-muted">
            <img {...mark("videoImage")} {...responsive(c.videoImage, "(min-width: 1024px) 55vw, 100vw")} loading="lazy" alt="הדבקת טפט על חזית ארון" className="absolute inset-0 block size-full object-cover" />
            <div className="absolute inset-x-2 bottom-2 flex flex-wrap justify-end gap-1.5 lg:inset-x-5.5 lg:bottom-5.5 lg:gap-3">
              <VideoButton label={c.video1Label} id={c.video1.id} title={c.video1.title} />
              <VideoButton label={c.video2Label} id={c.video2.id} title={c.video2.title} />
            </div>
          </div>

          <div className="order-3 rounded-xl bg-background px-4 pt-5.5 pb-6 lg:px-6">
            <span className="block text-right fs-18 font-bold text-foreground lg:fs-22">
              <EF f="toolsTitle">{c.toolsTitle}</EF>
            </span>
            <div className="mt-3.5 flex items-start">
              {diyTools.map((tool, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-[1_1_0] flex-col items-center gap-2.5 px-2 lg:px-4",
                    i < diyTools.length - 1 && "border-e border-border",
                  )}
                >
                  <img {...mark(`tools.${i}.img`)} {...responsive(tool.img, "120px")} loading="lazy" alt={tool.name} className="block size-20 rounded-lg object-contain mix-blend-multiply lg:size-30" />
                  <span className="text-center fs-14 font-medium text-foreground lg:fs-18"><EF f={`tools.${i}.name`}>{tool.name}</EF></span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <QuantityCalculator className="order-4 w-full lg:hidden" />
        <Button asChild size="xl" className="order-6 mt-2 w-full gap-3 py-5 lg:hidden">
          <Link to="/חנות">
            <span><EF f="cta">{c.cta}</EF></span>
            <Icon name="ArrowLeft" size={18} />
          </Link>
        </Button>
      </div>
    </section>
  );
}
