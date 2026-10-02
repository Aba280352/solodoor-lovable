import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { Icon } from "./Icon";
import { ProductCard, ProductMedia } from "./ProductCard";
import { Container, Pill } from "./primitives";
import { bestSellers, type Product } from "./data";
import { useQuiz } from "./quiz-context";

export function BestSellers() {
  const [tab, setTab] = useState(bestSellers[0].tab);
  const [zoomed, setZoomed] = useState<Product | null>(null);
  const { openQuiz } = useQuiz();
  const active = bestSellers.find((group) => group.tab === tab) ?? bestSellers[0];

  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="px-5.5 py-[0.5625rem] tracking-[0.14em] whitespace-nowrap">המובחרים ביותר אצלנו</Pill>
          <h2 className="mt-5.5 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">
            הדגמים הכי נמכרים של שנת 2026
          </h2>
          <p className="mt-4 max-w-[70ch] fs-18 leading-[1.7] font-medium text-foreground">
            עיצובים שמשדרגים כל חלל באיכות בלתי מתפשרת ומתאמים בדיוק לסגנון החיים שלכם.
          </p>
        </div>

        <div className="scrollbar-none -mx-5 mt-8 flex flex-nowrap gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:mt-11 lg:justify-center lg:overflow-visible lg:px-0">
          {bestSellers.map((group) => (
            <button
              key={group.tab}
              type="button"
              onClick={() => setTab(group.tab)}
              className="relative flex-none cursor-pointer rounded-full border border-border bg-card px-4.5 py-3 fs-16 font-medium whitespace-nowrap text-foreground transition-colors duration-240 ease-standard hover:border-secondary"
            >
              {group.tab === active.tab && <span className="absolute -inset-px rounded-full bg-primary" />}
              <span className="relative">{group.tab}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          {active.items.map((product) => (
            <ProductCard key={product.name} product={product} onZoom={setZoomed} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3.5 lg:mt-13 lg:flex-row lg:items-center">
          <Button asChild variant="secondary" className="py-4.5">
            <a href="#">
              <span>צפייה בכל החנות</span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
          <Button asChild className="px-5 py-4.5 whitespace-normal lg:px-10 lg:whitespace-nowrap">
            <a href="#" onClick={openQuiz}>
              <span>לשאלון הכוונה לבחירת הטפט שלכם</span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
        </div>
      </Container>

      <Dialog open={zoomed !== null} onOpenChange={(open) => !open && setZoomed(null)}>
        <DialogContent
          overlayClassName="items-center justify-center p-4 lg:p-8"
          className="grid max-h-[88vh] w-full max-w-270 grid-cols-1 overflow-hidden rounded-[1rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        >
          <DialogClose
            aria-label="סגירה"
            className="fixed top-3 left-3 flex size-11 cursor-pointer items-center justify-center p-0 text-background lg:top-6 lg:left-7"
          >
            <Icon name="Times" size={30} />
          </DialogClose>
          {zoomed && (
            <>
              <div className="relative min-h-60 overflow-hidden bg-muted lg:min-h-130">
                <ProductMedia product={zoomed} />
              </div>
              <div className="flex flex-col items-start justify-center gap-5 p-6 text-right lg:px-13 lg:py-14">
                <Pill className="tracking-[0.04em]">{active.tab}</Pill>
                <DialogTitle className="fs-28 leading-[1.15] font-bold tracking-[-0.02em] text-foreground lg:fs-40">
                  {zoomed.name}
                </DialogTitle>
                <span className="fs-24 font-bold text-foreground lg:fs-30">{zoomed.price}</span>
                <DialogDescription className="max-w-[40ch] fs-18 leading-[1.85] font-light text-foreground">
                  ציפוי בהתקנה מקצועית, עם הגנה מפני שריטות ודעיכה בצבע. הדגם מותאם למידות שלכם ומותקן בפריסה רחבה.
                </DialogDescription>
                <Button asChild className="mt-2 px-11 py-4">
                  <a href="#">לפרטים נוספים</a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
