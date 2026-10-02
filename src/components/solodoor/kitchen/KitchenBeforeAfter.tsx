import { BeforeAfterCarousel } from "../BeforeAfter";
import { Container, Pill } from "../primitives";
import { kitchenBeforeAfter } from "./data";

/** "לפני ואחרי": the homepage carousel, with real kitchen jobs. */
export function KitchenBeforeAfter() {
  return (
    <section data-reveal className="overflow-hidden pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="bg-secondary text-secondary-foreground px-5 py-2 fs-16">מה שהיה כבר נגמר…</Pill>
          <h2 className="mt-4.5 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">
            לפני ואחרי
          </h2>
          <p className="mt-4 max-w-[60ch] fs-18 leading-[1.7] font-medium text-foreground">
            מטבחים אמיתיים שחידשנו. גררו את העיגול כדי לראות את המטבח לפני ואחרי הציפוי.
          </p>
        </div>
      </Container>

      <BeforeAfterCarousel pairs={kitchenBeforeAfter} />
    </section>
  );
}
