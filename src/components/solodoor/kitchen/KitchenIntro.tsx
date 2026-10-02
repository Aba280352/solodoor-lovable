import { Fragment } from "react";

import { Icon } from "../Icon";
import { Container, CoverImage } from "../primitives";
import { kitchenAudiences, kitchenBenefits, kitchenQuality, KITCHEN_INTRO_IMG } from "./data";

/**
 * "רוצים טפט חדש למטבח?" — the old page's long opening text, kept word for word
 * and laid out as an editorial spread: the pitch, what you get, who it suits,
 * the one-day promise and the material spec.
 */
export function KitchenIntro() {
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container className="flex flex-col gap-10 lg:gap-16">
        {/* The pitch, next to the price it saves. */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-18">
          <div className="text-right">
            <span className="inline-flex items-center gap-3 fs-16 font-medium text-clay lg:fs-18">
              <span className="block h-px w-10 bg-primary" />
              סולודור מגשימים חלומות…
            </span>
            <h2 className="mt-4 fs-34 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:mt-5 lg:fs-62">
              רוצים טפט חדש למטבח?
            </h2>
            <p className="mt-6 max-w-[46ch] fs-20 leading-[1.6] font-medium text-pretty text-foreground lg:mt-8 lg:fs-22">
              הוצאות של מטבח חדש הן גבוהות, אנחנו מבינים את זה. אבל מי אמר שחייבים לקחת הלוואות או למשוך
              חסכונות כדי לתת למטבח את השינוי שתמיד רצית?
            </p>
            <p className="mt-5 max-w-[56ch] fs-18 leading-[1.85] text-pretty text-foreground">
              אחרי שנסיים את העבודה, המטבח שלך ייראה מחודש, נקי ומעוצב, בדיוק בגוון ובסגנון שמתאים לך.
            </p>
            <p className="mt-4 max-w-[56ch] fs-18 leading-[1.85] text-pretty text-foreground">
              נכון, מטבח חדש מחברת מטבחים נראה אחרת לגמרי (ובעלות של 120,000 ₪ הוא גם חייב להיראות טוב), אבל חופשה
              משפחתית, עזרה לילדים או אפילו השארת הכסף בצד נשמעים הרבה יותר טוב.
            </p>
            <p className="mt-7 max-w-[52ch] border-s-2 border-primary ps-5 fs-18 leading-[1.75] font-medium text-pretty text-foreground">
              אנחנו לא נגיד לך שעדיף חידוש בטפט במקום מטבח חדש. אבל אנחנו כן מאמינים שחשוב לחשוב על כל
              האפשרויות ולקבל החלטה בצורה חכמה ושקולה.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-120 lg:max-w-none lg:ps-12 lg:pb-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <CoverImage src={KITCHEN_INTRO_IMG} alt="מטבח לאחר ציפוי בטפט של סולודור" />
            </div>
            {/* Illustrates the paragraph beside it; the words themselves are in the text. */}
            <div
              aria-hidden="true"
              className="relative mx-4 -mt-14 rounded-lg border border-border bg-card px-6 pt-5 pb-6 text-right shadow-menu lg:absolute lg:start-0 lg:bottom-0 lg:mx-0 lg:mt-0 lg:w-96"
            >
              <span className="block fs-14 font-semibold tracking-[0.12em] text-foreground">מטבח חדש מחברת מטבחים</span>
              <span dir="ltr" className="relative mt-2 inline-block fs-44 leading-none font-bold text-foreground lg:fs-52">
                ₪120,000
                <span className="absolute -inset-x-2 top-1/2 block h-[0.1875rem] -rotate-6 rounded-full bg-primary" />
              </span>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {["חופשה משפחתית", "עזרה לילדים", "הכסף נשאר בצד"].map((label) => (
                  <span key={label} className="rounded-full bg-muted px-3.5 py-1.5 fs-14 font-medium text-foreground">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What you get + who it suits. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
          <div className="rounded-lg border border-border bg-card px-6 pt-7 pb-4 text-right lg:px-10 lg:pt-10 lg:pb-6">
            <h3 className="fs-28 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-40">מה תקבל מאיתנו?</h3>
            <ol className="mt-4 lg:mt-6">
              {kitchenBenefits.map((benefit, i) => (
                <li
                  key={benefit}
                  className="flex items-baseline gap-5 border-t border-border py-4 first:border-t-0 lg:gap-7 lg:py-5"
                >
                  <span dir="ltr" className="w-8 flex-none fs-22 font-light text-clay lg:fs-26">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="fs-18 leading-[1.4] font-medium text-foreground lg:fs-20">{benefit}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col rounded-lg bg-secondary px-6 pt-7 pb-7 text-right text-secondary-foreground lg:px-10 lg:pt-10 lg:pb-10">
            <h3 className="fs-28 leading-[1.1] font-bold tracking-[-0.02em] lg:fs-40">למי זה מתאים?</h3>
            <p className="mt-2 fs-18 font-light lg:mt-3 lg:fs-20">הטפטים שלנו מתאימים ל:</p>
            <ul className="mt-6 grid flex-auto grid-cols-2 border-t border-s border-background/35 lg:mt-8 lg:grid-cols-3">
              {kitchenAudiences.map((audience) => (
                <li
                  key={audience.label}
                  className="flex flex-col items-start justify-between gap-4 border-e border-b border-background/35 p-4 lg:gap-6 lg:p-6"
                >
                  <Icon name={audience.icon} size={30} />
                  <span className="fs-16 leading-[1.35] font-medium lg:fs-20">{audience.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The one-day promise. */}
        <div className="rounded-xl bg-foreground px-5 py-10 text-center text-background lg:px-12 lg:py-18">
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 fs-20 font-medium lg:gap-x-7 lg:fs-34">
            {["בלי לכלוך", "בלי אבק", "בלי רעש"].map((phrase, i) => (
              <Fragment key={phrase}>
                {i > 0 && <span className="block size-1.5 flex-none rounded-full bg-primary lg:size-2" />}
                <span>{phrase}</span>
              </Fragment>
            ))}
          </p>
          <p className="mt-4 fs-44 leading-[1.05] font-bold tracking-[-0.02em] text-balance lg:mt-6 lg:fs-108">
            ביום עבודה <span className="text-clay">אחד</span> בלבד
          </p>
        </div>

        {/* Material spec sheet. */}
        <div className="grid grid-cols-1 gap-5 rounded-lg border border-border bg-card px-6 py-7 text-right lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-10 lg:py-10">
          <h3 className="fs-28 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-40">איכות החומר</h3>
          <ul className="grid grid-cols-1 lg:grid-cols-5">
            {kitchenQuality.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-4 border-t border-border py-4 first:border-t-0 lg:flex-col lg:items-start lg:gap-5 lg:border-t-0 lg:border-s lg:px-5 lg:py-1 lg:first:border-s-0 lg:first:ps-0"
              >
                <span className="inline-flex size-12 flex-none items-center justify-center rounded-full border border-primary text-clay">
                  <Icon name={item.icon} size={22} />
                </span>
                <span className="fs-18 leading-[1.4] font-medium text-balance text-foreground">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
