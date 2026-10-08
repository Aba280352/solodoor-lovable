import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Container, CoverImage, Pill } from "./primitives";
import { faqImages, faqItems } from "./data";
import { whatsappHref } from "./whatsapp";

export function Faq() {
  // One question open at a time; the side image follows the last one touched.
  const [open, setOpen] = useState(0);
  const [image, setImage] = useState(0);

  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-18">
          <div className="flex min-w-0 flex-col items-start text-right">
            <Pill className="tracking-[0.04em]">השאלות הנפוצות ביותר</Pill>
            <h2 className="mt-5 fs-36 leading-[1.1] font-bold tracking-[-0.02em] whitespace-nowrap text-foreground lg:fs-52">
              שאלות נפוצות
            </h2>
            <p className="mt-5 max-w-[40ch] fs-18 leading-[1.75] font-medium text-foreground">
              ריכזנו עבורכם תשובות ברורות לשאלות שחוזרות הכי הרבה על ציפוי, התאמה, התקנה ותחזוקה.
            </p>
            <div className="relative mt-8 min-h-56 w-full flex-auto overflow-hidden rounded-[0.75rem] bg-muted lg:min-h-105">
              {faqImages.map((src, i) => (
                <CoverImage
                  key={src}
                  src={src}
                  className={cn("transition-opacity duration-700 ease-grow", i === image ? "opacity-100" : "opacity-0")}
                />
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {faqItems.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-[0.75rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => {
                      setOpen(isOpen ? -1 : i);
                      setImage(i);
                    }}
                    className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-right lg:px-7 lg:py-6"
                  >
                    <span className="flex-auto fs-18 leading-[1.4] font-semibold text-foreground">{item.q}</span>
                    <span className="inline-flex size-9 flex-none items-center justify-center rounded-full border border-foreground text-foreground">
                      <Icon name={isOpen ? "Minus" : "Plus"} size={16} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="flex items-center gap-4 px-5 pb-6 text-right lg:px-7 lg:pb-7">
                      <span className="block flex-auto fs-18 leading-[1.8] text-foreground">{item.a}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/שאלות-נפוצות"
            className="inline-flex items-center gap-2 border-b border-primary pb-0.5 fs-17 font-medium text-foreground transition-[gap] duration-240 ease-standard hover:gap-3.5"
          >
            <span>לכל השאלות והתשובות, לפי סוג הטפט</span>
            <Icon name="AngleLeft" size={13} />
          </Link>
        </div>

        <div className="mt-13 flex flex-col items-center gap-5.5">
          <span className="text-center fs-28 leading-[1.15] font-medium tracking-[-0.02em] text-foreground lg:fs-44">
            יש לכם שאלה נוספת? אנחנו כאן לעזור
          </span>
          <div className="flex w-full flex-col items-stretch justify-center gap-3.5 lg:w-auto lg:flex-row lg:items-center">
            <Button asChild className="border border-primary py-4.5">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                <span>לשיחה בווצאפ</span>
                <Icon name="ChatDots" size={17} />
              </a>
            </Button>
            <Button asChild variant="secondary" className="py-4.5">
              <Link to="/חנות">
                <span>לצפייה בכל החנות</span>
                <Icon name="ArrowLeft" size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
