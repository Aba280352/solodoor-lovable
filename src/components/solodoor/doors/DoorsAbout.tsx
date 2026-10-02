import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import { Container, CoverImage, Pill } from "../primitives";
import { DOORS_PHONE, DOORS_PHONE_HREF, aboutFigures, aboutImages, aboutServices } from "./data";

/**
 * "קצת עלינו": the company story from the current site, set as an editorial
 * spread. A two-photo collage with an experience badge, the statement and the
 * founder's promise, then four figures across the full width.
 */
export function DoorsAbout() {
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container className="flex flex-col gap-12 lg:gap-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
          <div className="text-right">
            <Pill className="bg-secondary px-5 py-2 fs-16 text-secondary-foreground">קצת עלינו</Pill>
            <h2 className="mt-5 fs-34 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:mt-6 lg:fs-62">
              <span className="block">לא מתפשרים על איכות.</span>
              <span className="block text-clay">לא מתפשרים על שירות.</span>
            </h2>

            <p className="mt-6 max-w-[50ch] fs-20 leading-[1.6] font-medium text-pretty text-foreground lg:mt-8 lg:fs-22">
              סולודור הוקמה לפני 6 שנים על ידי שלמה, הבעלים, שמגיע עם ניסיון של כ-10 שנים בתחום המנעולנות
              והטפטים.
            </p>
            <p className="mt-4 max-w-[54ch] fs-18 leading-[1.85] text-pretty text-foreground">
              אנחנו מתמחים בציפויים פולימריים בעיצוב בלעדי, בתוספת שכבת הגנה מפני שריטות ודהיית צבע. ציפוי
              איכותי, עבה ועמיד, שיהפוך את הדלת שלכם מפשוטה לדלת שלא תוכלו להפסיק להסתכל עליה.
            </p>

            <blockquote className="mt-7 max-w-[50ch] border-s-2 border-primary ps-5 lg:mt-8">
              <p className="fs-20 leading-[1.55] font-medium text-pretty text-foreground lg:fs-22">
                הקמנו את סולודור כדי לתת שירות ללקוחות גם אחרי שהסתיימה העסקה. שביעות הרצון של הלקוחות היא
                מאבני היסוד שלנו.
              </p>
              <footer className="mt-3 fs-16 font-medium text-foreground">שלמה, הבעלים של סולודור</footer>
            </blockquote>

            <div className="mt-8 grid grid-cols-2 gap-2.5 lg:mt-10 lg:flex lg:gap-3">
              <Button asChild className="px-3 py-3.5 fs-15 lg:px-9 lg:py-[1.0625rem] lg:fs-18">
                <a href="#quote">
                  <span>קבלו הצעת מחיר</span>
                  <Icon name="ArrowLeft" size={16} />
                </a>
              </Button>
              <Button asChild variant="outline" className="px-3 py-3.5 fs-15 lg:px-9 lg:py-[1.0625rem] lg:fs-18">
                <a href={DOORS_PHONE_HREF}>
                  <span dir="ltr">{DOORS_PHONE}</span>
                  <Icon name="Phone" size={16} />
                </a>
              </Button>
            </div>
          </div>

          {/* Collage: tall photo, a smaller one stepping out of its corner, and the badge. */}
          <div className="relative mx-auto w-full max-w-120 pb-14 ps-10 lg:max-w-none lg:pb-20 lg:ps-20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
              <CoverImage src={aboutImages.main} alt="דלת כניסה לאחר ציפוי של סולודור" loading="lazy" />
            </div>
            <div className="absolute start-0 bottom-0 aspect-square w-[46%] overflow-hidden rounded-lg border-4 border-background bg-muted lg:border-[0.5rem]">
              <CoverImage src={aboutImages.detail} alt="ציפוי דלת במראה עץ טבעי" loading="lazy" />
            </div>
            <div className="absolute end-3 top-3 flex flex-col items-center rounded-lg bg-secondary px-4 py-3 text-center text-secondary-foreground lg:-end-6 lg:top-10 lg:px-7 lg:py-6">
              <span dir="ltr" className="fs-40 leading-none font-bold lg:fs-70">
                10
              </span>
              <span className="mt-1 max-w-[9ch] fs-13 leading-[1.3] font-medium lg:mt-2 lg:fs-16">שנות ניסיון בתחום</span>
            </div>
          </div>
        </div>

        <div>
          <ul className="grid grid-cols-2 border-y border-foreground/14 lg:grid-cols-4">
            {aboutFigures.map((figure, i) => (
              <li
                key={figure.label}
                className={
                  "flex flex-col gap-1.5 px-2 py-6 text-center lg:gap-3 lg:px-6 lg:py-10" +
                  (i % 2 === 1 ? " border-s border-foreground/14" : "") +
                  (i >= 2 ? " border-t border-foreground/14 lg:border-t-0" : "") +
                  (i === 2 ? " lg:border-s" : "")
                }
              >
                <span dir="ltr" className="fs-44 leading-none font-bold tracking-[-0.02em] text-foreground lg:fs-76">
                  {figure.value}
                </span>
                <span className="fs-15 font-medium text-foreground lg:fs-18">{figure.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-center fs-16 leading-[1.7] text-foreground lg:mt-7 lg:fs-18">
            <span className="font-bold">לא רק דלתות.</span> גם {aboutServices}.
          </p>
        </div>
      </Container>
    </section>
  );
}
