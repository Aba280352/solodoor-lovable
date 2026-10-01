import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Pill } from "./primitives";
import { QuantityCalculator } from "./QuantityCalculator";
import { DIY_BG, DIY_VIDEO, diySteps, diyTools } from "./data";

export function Diy() {
  return (
    <section
      id="diy"
      data-reveal
      className="scroll-mt-16 bg-secondary bg-cover bg-center bg-no-repeat pt-14 pb-16 lg:pt-24 lg:scroll-mt-20 lg:pb-26"
      style={{ backgroundImage: `url(${DIY_BG})` }}
    >
      <div className="mx-auto flex max-w-330 flex-col gap-6 px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-stretch lg:gap-14 lg:px-12">
        <div className="contents text-right lg:flex lg:flex-col lg:items-start lg:justify-between lg:gap-10">
          <div className="order-1 flex flex-col items-start">
            <Pill className="px-5.5 py-[0.5625rem] fs-16">DIY · טפטים להדבקה עצמית</Pill>
            <h2 className="mt-6.5 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-background lg:fs-62">
              מראה חדש לבית.
              <br />
              עם הידיים שלכם.
            </h2>
            <p className="mt-5.5 max-w-[44ch] fs-18 leading-[1.8] font-light text-background">
              טפטים להדבקה עצמית לחידוש דלתות, ארונות ורהיטים. בוחרים את הסגנון שלכם ומתחילים ליצור.
            </p>
            <div className="mt-8 hidden items-center gap-3.5 lg:flex">
              <Button asChild size="xl" className="gap-3 py-5">
                <a href="#">
                  <span>לבחירת הטפט שלכם</span>
                  <Icon name="ArrowLeft" size={18} />
                </a>
              </Button>
              <QuantityCalculator />
            </div>
          </div>

          <div className="order-5 mx-auto flex w-full justify-between border-t border-background/55 pt-7 lg:w-fit lg:justify-start">
            {diySteps.map((step, i) => (
              <div
                key={step.num}
                className={cn(
                  "flex flex-1 flex-col items-center gap-3 px-2 py-1 lg:flex-none lg:px-8",
                  i === 0 && "ps-0 lg:ps-0",
                  i === diySteps.length - 1 ? "pe-0 lg:pe-0" : "border-e border-background/45",
                )}
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-background fs-16 font-bold text-foreground">
                  {step.num}
                </span>
                <span className="mt-1 inline-flex text-background">
                  <Icon name={step.icon} size={38} />
                </span>
                <span className="text-center fs-15 font-medium text-background lg:fs-20">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          <div className="relative order-2 aspect-[878/490] overflow-hidden rounded-xl bg-muted">
            <img src={DIY_VIDEO} alt="הדבקת טפט על חזית ארון" className="absolute inset-0 block size-full object-cover" />
            <a
              href="#"
              className="absolute end-3 bottom-3 inline-flex items-center gap-3 rounded-full bg-background py-2 ps-2 pe-5.5 fs-16 font-medium text-foreground transition-transform duration-[480ms] ease-standard hover:scale-105 lg:end-5.5 lg:bottom-5.5 lg:fs-18"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full border-[1.5px] border-foreground">
                <span className="ml-[0.1875rem] block size-0 border-y-[0.4375rem] border-r-0 border-l-[0.6875rem] border-y-transparent border-l-foreground" />
              </span>
              <span>צפו איך זה עובד</span>
            </a>
          </div>

          <div className="order-3 rounded-xl bg-background px-4 pt-5.5 pb-6 lg:px-6">
            <span className="block text-right fs-18 font-bold text-foreground lg:fs-22">
              הציוד שצריך להתקנת טפטים מושלמת בבית שלכם
            </span>
            <div className="mt-3.5 flex items-start">
              {diyTools.map((tool, i) => (
                <div
                  key={tool.name}
                  className={cn(
                    "flex flex-[1_1_0] flex-col items-center gap-2.5 px-2 lg:px-4",
                    i < diyTools.length - 1 && "border-e border-border",
                  )}
                >
                  <img src={tool.img} alt={tool.name} className="block size-20 rounded-lg object-contain mix-blend-multiply lg:size-30" />
                  <span className="text-center fs-14 font-medium text-foreground lg:fs-18">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <QuantityCalculator className="order-4 w-full lg:hidden" />
        <Button asChild size="xl" className="order-6 mt-2 w-full gap-3 py-5 lg:hidden">
          <a href="#">
            <span>לבחירת הטפט שלכם</span>
            <Icon name="ArrowLeft" size={18} />
          </a>
        </Button>
      </div>
    </section>
  );
}
