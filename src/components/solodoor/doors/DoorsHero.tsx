import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import { Pill } from "../primitives";
import { REVIEW_COUNT } from "../data";
import { DoorViewer } from "./DoorViewer";
import { doorsTrust } from "./data";

/**
 * Opening screen of the door-coating landing page. Built for paid traffic and
 * sized to fit one desktop screen: the offer and two CTAs on one side, the
 * interactive door on the other.
 */
export function DoorsHero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-330 grid-cols-1 items-center gap-8 px-5 pt-6 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16 lg:px-12 lg:pt-8 lg:pb-10">
        <div className="flex flex-col items-start text-right">
          <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              ציפוי דלתות
            </span>
          </nav>

          <Pill className="mt-4 tracking-[0.16em] whitespace-nowrap">ציפוי דלתות</Pill>

          <h1 className="mt-4 fs-38 leading-[1.06] font-bold tracking-[-0.02em] text-balance text-foreground lg:mt-5 lg:fs-64">
            מחדשים את הדלת, משדרגים את כל הכניסה
          </h1>

          <p className="mt-4 max-w-[46ch] fs-18 leading-[1.7] text-pretty text-foreground lg:mt-5 lg:fs-20">
            ציפוי דלתות פולימרי, עבה ועמיד, בתוספת שכבת הגנה מפני שריטות ודהיית צבע. מעל 200 עיצובים ייחודיים,
            בהתקנה מדויקת ומקצועית אצלכם בבית.
          </p>

          <div className="mt-4 flex items-center gap-2.5 lg:mt-5">
            <span className="fs-20 leading-none text-star" aria-hidden="true">
              ★★★★★
            </span>
            <span className="fs-15 font-medium text-foreground lg:fs-16">מבוסס על {REVIEW_COUNT} ביקורות בגוגל</span>
          </div>

          <div className="mt-6 grid w-full grid-cols-2 gap-2.5 lg:mt-8 lg:flex lg:w-auto lg:gap-3">
            <Button asChild className="px-3 py-3.5 fs-15 lg:px-9 lg:py-[1.0625rem] lg:fs-18">
              <a href="#quote">
                <span>קבלו הצעת מחיר</span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
            <Button asChild variant="secondary" className="px-3 py-3.5 fs-15 lg:px-9 lg:py-[1.0625rem] lg:fs-18">
              <a href="#">
                <span>להתייעצות בווצאפ</span>
                <Icon name="ChatDots" size={17} />
              </a>
            </Button>
          </div>

          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 lg:mt-7">
            {doorsTrust.map((label) => (
              <li key={label} className="flex items-center gap-2 fs-15 font-medium text-foreground lg:fs-16">
                <span className="inline-flex text-clay">
                  <Icon name="CheckCircle" size={18} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <DoorViewer />
      </div>
    </section>
  );
}
