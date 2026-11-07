import { Fragment } from "react";

import { Icon } from "../Icon";
import { Container, CoverImage, Pill } from "../primitives";
import type { IconName } from "../icon-data";
import { KITCHEN_INTRO, KITCHEN_INTRO_DEFAULTS } from "../content/kitchen";
import { useSection } from "../content/sections";
import { EF, useEditMark } from "../content/layout";

/**
 * "רוצים טפט חדש למטבח?" — the old page's long opening text, kept word for word
 * and laid out as an editorial spread: the pitch, what you get, who it suits,
 * the one-day promise and the material spec.
 */
export function KitchenIntro() {
  const c = useSection(KITCHEN_INTRO, KITCHEN_INTRO_DEFAULTS);
  const mark = useEditMark();
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container className="flex flex-col gap-10 lg:gap-16">
        {/* The pitch, next to the price it saves. */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-18">
          <div className="text-right">
            <Pill className="px-5 py-2 fs-16"><EF f="pill">{c.pill}</EF></Pill>
            <h2 className="mt-4 fs-34 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:mt-5 lg:fs-62">
              <EF f="title">{c.title}</EF>
            </h2>
            <p className="mt-6 max-w-[46ch] fs-20 leading-[1.6] font-medium text-pretty text-foreground lg:mt-8 lg:fs-22">
              <EF f="lead">{c.lead}</EF>
            </p>
            <p className="mt-5 max-w-[56ch] fs-18 leading-[1.85] text-pretty text-foreground">
              <EF f="p1">{c.p1}</EF>
            </p>
            <p className="mt-4 max-w-[56ch] fs-18 leading-[1.85] text-pretty text-foreground">
              <EF f="p2">{c.p2}</EF>
            </p>
            <p className="mt-7 max-w-[52ch] border-s-2 border-primary ps-5 fs-18 leading-[1.75] font-medium text-pretty text-foreground">
              <EF f="quote">{c.quote}</EF>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-120 lg:max-w-none lg:ps-12 lg:pb-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <CoverImage {...mark("image")} src={c.image} sizes="(min-width: 1024px) 45vw, 100vw" loading="lazy" alt="מטבח לאחר ציפוי בטפט של סולודור" />
            </div>
            {/* Illustrates the paragraph beside it; the words themselves are in the text. */}
            <div
              aria-hidden="true"
              className="relative mx-4 -mt-14 rounded-lg border border-border bg-card px-6 pt-5 pb-6 text-right shadow-menu lg:absolute lg:start-0 lg:bottom-0 lg:mx-0 lg:mt-0 lg:w-96"
            >
              <span className="block fs-14 font-semibold tracking-[0.12em] text-foreground"><EF f="priceLabel">{c.priceLabel}</EF></span>
              <span dir="ltr" className="relative mt-2 inline-block fs-44 leading-none font-bold text-foreground lg:fs-52">
                <EF f="price">{c.price}</EF>
                <span className="absolute -inset-x-2 top-1/2 block h-[0.1875rem] -rotate-6 rounded-full bg-primary" />
              </span>
              <div className="mt-5 border-t border-border pt-4">
                <span className="block fs-16 font-semibold text-foreground"><EF f="altTitle">{c.altTitle}</EF></span>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {c.alternatives.map(({ label }, i) => (
                    <li key={i} className="flex items-center gap-3 fs-16 font-medium text-foreground">
                      <span className="inline-flex size-6 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Icon name="Check" size={13} />
                      </span>
                      <EF f={`alternatives.${i}.label`}>{label}</EF>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* What you get + who it suits. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
          <div className="rounded-lg border border-border bg-card px-6 pt-7 pb-4 text-right lg:px-10 lg:pt-10 lg:pb-6">
            <h3 className="fs-28 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-40"><EF f="benefitsTitle">{c.benefitsTitle}</EF></h3>
            <ol className="mt-4 lg:mt-6">
              {c.benefits.map(({ label: benefit }, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-5 border-t border-border py-4 first:border-t-0 lg:gap-7 lg:py-5"
                >
                  <span dir="ltr" className="w-8 flex-none fs-22 font-light text-clay lg:fs-26">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="fs-18 leading-[1.4] font-medium text-foreground lg:fs-20"><EF f={`benefits.${i}.label`}>{benefit}</EF></span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col rounded-lg bg-secondary px-6 pt-7 pb-7 text-right text-secondary-foreground lg:px-10 lg:pt-10 lg:pb-10">
            <h3 className="fs-28 leading-[1.1] font-bold tracking-[-0.02em] lg:fs-40"><EF f="audiencesTitle">{c.audiencesTitle}</EF></h3>
            <p className="mt-2 fs-18 font-light lg:mt-3 lg:fs-20"><EF f="audiencesText">{c.audiencesText}</EF></p>
            <ul className="mt-6 grid flex-auto grid-cols-2 border-t border-s border-background/35 lg:mt-8 lg:grid-cols-3">
              {c.audiences.map((audience, i) => (
                <li
                  key={i}
                  className="flex flex-col items-start justify-between gap-4 border-e border-b border-background/35 p-4 lg:gap-6 lg:p-6"
                >
                  <Icon name={audience.icon as IconName} size={30} />
                  <span className="fs-16 leading-[1.35] font-medium lg:fs-20"><EF f={`audiences.${i}.label`}>{audience.label}</EF></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The one-day promise. */}
        <div className="rounded-xl bg-foreground px-5 py-10 text-center text-background lg:px-12 lg:py-18">
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 fs-20 font-medium lg:gap-x-7 lg:fs-34">
            {c.promisePhrases.map(({ label: phrase }, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="block size-1.5 flex-none rounded-full bg-primary lg:size-2" />}
                <span><EF f={`promisePhrases.${i}.label`}>{phrase}</EF></span>
              </Fragment>
            ))}
          </p>
          <p className="mt-4 fs-44 leading-[1.05] font-bold tracking-[-0.02em] text-balance lg:mt-6 lg:fs-108">
            <EF f="promiseBefore">{c.promiseBefore}</EF> <span className="text-clay"><EF f="promiseHighlight">{c.promiseHighlight}</EF></span> <EF f="promiseAfter">{c.promiseAfter}</EF>
          </p>
        </div>

        {/* Material spec sheet. */}
        <div className="grid grid-cols-1 gap-5 rounded-lg border border-border bg-card px-6 py-7 text-right lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-10 lg:py-10">
          <h3 className="fs-28 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-40"><EF f="qualityTitle">{c.qualityTitle}</EF></h3>
          <ul className="grid grid-cols-1 lg:grid-cols-5">
            {c.quality.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-4 border-t border-border py-4 first:border-t-0 lg:flex-col lg:items-start lg:gap-5 lg:border-t-0 lg:border-s lg:px-5 lg:py-1 lg:first:border-s-0 lg:first:ps-0"
              >
                <span className="inline-flex size-12 flex-none items-center justify-center rounded-full border border-primary text-clay">
                  <Icon name={item.icon as IconName} size={22} />
                </span>
                <span className="fs-18 leading-[1.4] font-medium text-balance text-foreground"><EF f={`quality.${i}.label`}>{item.label}</EF></span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
