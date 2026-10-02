import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Icon } from "../Icon";
import { Pill } from "../primitives";
import { REVIEW_COUNT } from "../data";
import { DoorViewer } from "./DoorViewer";
import { doorsTrust } from "./data";

/**
 * Opening screen of the door-coating landing page. Built for paid traffic: the
 * offer and a two-field lead form on one side, the interactive door on the other.
 */
export function DoorsHero() {
  // The form is not wired to a backend yet; submitting only shows the thank-you state.
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-330 grid-cols-1 items-center gap-8 px-5 pt-6 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-12 lg:pt-10 lg:pb-16">
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

          <Pill className="mt-4 tracking-[0.16em] whitespace-nowrap lg:mt-5">ציפוי דלתות</Pill>

          <h1 className="mt-4 fs-38 leading-[1.06] font-bold tracking-[-0.02em] text-balance text-foreground lg:mt-5 lg:fs-70">
            מחדשים את הדלת, משדרגים את כל הכניסה
          </h1>

          <p className="mt-4 max-w-[46ch] fs-18 leading-[1.7] text-pretty text-foreground lg:mt-6 lg:fs-20">
            ציפוי דלתות פולימרי, עבה ועמיד, בתוספת שכבת הגנה מפני שריטות ודהיית צבע. מעל 200 עיצובים ייחודיים,
            בהתקנה מדויקת ומקצועית אצלכם בבית.
          </p>

          <div className="mt-4 flex items-center gap-2.5 lg:mt-5">
            <span className="fs-20 leading-none text-star" aria-hidden="true">
              ★★★★★
            </span>
            <span className="fs-15 font-medium text-foreground lg:fs-16">מבוסס על {REVIEW_COUNT} ביקורות בגוגל</span>
          </div>

          <form
            onSubmit={submit}
            className="mt-6 w-full rounded-lg border border-border bg-card px-5 pt-5 pb-6 lg:mt-8 lg:max-w-140 lg:px-7 lg:pt-6 lg:pb-7"
          >
            {sent ? (
              <div className="flex items-center gap-4 py-3">
                <span className="inline-flex size-11 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon name="Check" size={20} />
                </span>
                <span className="flex flex-col">
                  <span className="fs-20 font-bold text-foreground">קיבלנו את הפרטים</span>
                  <span className="fs-16 text-foreground">נחזור אליכם בהקדם עם הצעת מחיר לדלת שלכם.</span>
                </span>
              </div>
            ) : (
              <>
                <span className="block fs-20 font-bold text-foreground lg:fs-22">הצעת מחיר לדלת שלכם</span>
                <span className="mt-1 block fs-16 text-foreground">השאירו פרטים ונחזור אליכם בהקדם. ייעוץ חינם וללא התחייבות.</span>
                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <Input type="text" name="name" required placeholder="שם מלא" autoComplete="name" className="bg-background fs-16" />
                  <Input type="tel" name="phone" required placeholder="טלפון" autoComplete="tel" className="bg-background fs-16" />
                </div>
                <div className="mt-3 flex flex-col gap-3 lg:flex-row">
                  <Button type="submit" className="flex-auto px-6 py-[0.9375rem]">
                    <span>קבלו הצעת מחיר</span>
                    <Icon name="ArrowLeft" size={16} />
                  </Button>
                  <Button asChild variant="secondary" className="flex-none px-6 py-[0.9375rem]">
                    <a href="#">
                      <span>להתייעצות בווצאפ</span>
                      <Icon name="ChatDots" size={17} />
                    </a>
                  </Button>
                </div>
              </>
            )}
          </form>

          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 lg:mt-6">
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
