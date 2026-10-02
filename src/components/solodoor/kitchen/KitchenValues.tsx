import { cn } from "@/lib/utils";

import { Container } from "../primitives";
import { kitchenValues } from "./data";

/**
 * "מה תקבלו מאיתנו?" — service, experience, innovation. Three tall photos of real
 * jobs in a staggered row; each title sits on a tab that overlaps its photo.
 */
export function KitchenValues() {
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-30">
      <Container>
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-3 fs-16 font-medium text-clay lg:fs-18">
            <span className="block h-px w-10 bg-primary" />
            סולודור מגשימים חלומות…
            <span className="block h-px w-10 bg-primary" />
          </span>
          <h2 className="mt-4 fs-34 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:mt-5 lg:fs-62">
            מה תקבלו מאיתנו?
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {kitchenValues.map((value, i) => (
            <article key={value.title} className={cn("group text-right", i === 1 && "lg:mt-20")}>
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted lg:aspect-[4/5]">
                  <img
                    src={value.img}
                    alt={value.alt}
                    loading="lazy"
                    className="absolute inset-0 block size-full object-cover transition-transform duration-700 ease-standard group-hover:scale-103"
                  />
                </div>
                <div className="absolute start-0 -bottom-7 flex items-center gap-4 rounded-e-lg bg-background py-3 ps-0 pe-6 lg:-bottom-9 lg:gap-5 lg:py-4 lg:pe-8">
                  <span dir="ltr" className="fs-34 leading-none font-light text-clay lg:fs-52">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="fs-28 leading-none font-bold tracking-[-0.02em] text-foreground lg:fs-40">
                    {value.title}
                  </h3>
                </div>
              </div>
              <div className="mt-12 flex flex-col gap-4 border-t border-foreground/14 pt-5 lg:mt-14 lg:pt-6">
                {value.text.map((paragraph) => (
                  <p key={paragraph} className="fs-17 leading-[1.8] text-pretty text-foreground lg:fs-18">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
