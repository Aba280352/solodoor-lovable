import { BeforeAfterCarousel } from "../BeforeAfter";
import { Container, Pill } from "../primitives";
import { KITCHEN_BEFORE_AFTER, KITCHEN_BEFORE_AFTER_DEFAULTS } from "../content/kitchen";
import { useSection } from "../content/sections";
import { EF, useEditMark } from "../content/layout";

/** "לפני ואחרי": the homepage carousel, with real kitchen jobs. */
export function KitchenBeforeAfter() {
  const c = useSection(KITCHEN_BEFORE_AFTER, KITCHEN_BEFORE_AFTER_DEFAULTS);
  return (
    <section data-reveal className="overflow-hidden pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="bg-secondary text-secondary-foreground px-5 py-2 fs-16"><EF f="pill">{c.pill}</EF></Pill>
          <h2 className="mt-4.5 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">
            <EF f="title">{c.title}</EF>
          </h2>
          <p className="mt-4 max-w-[60ch] fs-18 leading-[1.7] font-medium text-foreground">
            <EF f="text">{c.text}</EF>
          </p>
        </div>
      </Container>

      <BeforeAfterCarousel pairs={c.pairs} field="pairs" />
    </section>
  );
}
