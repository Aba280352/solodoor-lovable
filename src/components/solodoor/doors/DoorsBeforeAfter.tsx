import { BeforeAfterCarousel } from "../BeforeAfter";
import { Container, Pill } from "../primitives";
import { doorsBeforeAfter } from "./data";

/** "לפני ואחרי": the homepage carousel, with real door jobs. */
export function DoorsBeforeAfter() {
  return (
    <section data-reveal className="overflow-hidden pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="bg-secondary px-5 py-2 fs-16 text-secondary-foreground">מה שהיה כבר נגמר…</Pill>
          <h2 className="mt-4.5 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">
            לפני ואחרי
          </h2>
          <p className="mt-4 max-w-[60ch] fs-18 leading-[1.7] font-medium text-foreground">
            דלתות אמיתיות שחידשנו. גררו את העיגול כדי לראות את הדלת לפני ואחרי הציפוי.
          </p>
        </div>
      </Container>

      <BeforeAfterCarousel pairs={doorsBeforeAfter} />
    </section>
  );
}
