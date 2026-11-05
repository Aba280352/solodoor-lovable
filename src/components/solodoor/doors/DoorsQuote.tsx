import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { Pill } from "../primitives";
import { doorTypes, quoteSteps } from "./data";
import { business, phoneHref } from "../content/business";
import { whatsappHref } from "../whatsapp";
import { formValues, submitLead } from "../leads";

/**
 * The page's conversion block, on the single black band: how it works in three
 * steps, and next to it the lead form with phone and WhatsApp as alternatives.
 * Every "קבלו הצעת מחיר" button on the page scrolls here (#quote).
 */
export function DoorsQuote() {
  const [doorType, setDoorType] = useState(doorTypes[0]);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await submitLead({ source: "door_quote", name: v.name, phone: v.phone, website: v.website, details: { door_type: doorType } });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="quote" data-reveal className="scroll-mt-16 bg-foreground text-background lg:scroll-mt-20">
      <div className="mx-auto grid max-w-330 grid-cols-1 items-center gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20 lg:px-12 lg:py-24">
        <div className="text-right">
          <Pill className="px-5 py-2 fs-16">ייעוץ חינם וללא התחייבות</Pill>
          <h2 className="mt-5 fs-34 leading-[1.08] font-bold tracking-[-0.02em] text-balance lg:fs-58">
            הצעת מחיר לדלת שלכם, בשלושה צעדים
          </h2>

          <ol className="mt-8 lg:mt-12">
            {quoteSteps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-5 border-t border-background/20 py-5 first:border-t-0 first:pt-0 lg:gap-8 lg:py-7"
              >
                <span dir="ltr" className="w-10 flex-none fs-30 leading-none font-light text-clay lg:w-14 lg:fs-44">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="fs-20 leading-[1.3] font-bold lg:fs-24">{step.title}</span>
                  <span className="max-w-[44ch] fs-16 leading-[1.7] font-light lg:fs-18">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl bg-card px-5 pt-7 pb-7 text-right text-foreground lg:px-10 lg:pt-10 lg:pb-10">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon name="Check" size={26} />
              </span>
              <span className="fs-28 leading-[1.2] font-bold">קיבלנו את הפרטים</span>
              <span className="max-w-[32ch] fs-18 leading-[1.6]">נחזור אליכם בהקדם עם הצעת מחיר לדלת שלכם.</span>
            </div>
          ) : (
            <form onSubmit={submit}>
              <span className="block fs-26 leading-[1.2] font-bold lg:fs-32">קבלו הצעת מחיר</span>
              <span className="mt-2 block fs-16 leading-[1.6] lg:fs-18">השאירו פרטים ונחזור אליכם בהקדם.</span>

              <div className="mt-6 flex flex-col gap-3">
                <Input type="text" name="name" required placeholder="שם מלא" autoComplete="name" className="bg-background fs-16 lg:fs-18" />
                <Input type="tel" name="phone" required placeholder="טלפון" autoComplete="tel" className="bg-background fs-16 lg:fs-18" />
              </div>

              <fieldset className="mt-5">
                <legend className="fs-16 font-medium">איזו דלת מחדשים?</legend>
                <div className="mt-2.5 flex flex-col gap-2 lg:flex-row lg:flex-wrap">
                  {doorTypes.map((type) => (
                    <label
                      key={type}
                      className={cn(
                        "cursor-pointer rounded-[5px] border px-4 py-2.5 lg:rounded-full text-center fs-15 font-medium transition-colors duration-160 ease-standard lg:fs-16",
                        doorType === type
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-input bg-background text-foreground hover:border-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name="door-type"
                        value={type}
                        checked={doorType === type}
                        onChange={() => setDoorType(type)}
                        className="sr-only"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </fieldset>

              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              {error && <p role="alert" className="mt-4 fs-15 font-medium text-clay">{error}</p>}

              <Button type="submit" disabled={busy} className="mt-6 w-full py-4">
                <span>{busy ? "שולחים…" : "קבלו הצעת מחיר"}</span>
                <Icon name="ArrowLeft" size={16} />
              </Button>
            </form>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <span className="block text-center fs-15 font-medium lg:fs-16">מעדיפים לדבר איתנו ישירות?</span>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Button asChild variant="secondary" className="px-3 py-3.5 fs-15 lg:fs-17">
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                  <span>ווצאפ</span>
                  <Icon name="ChatDots" size={17} />
                </a>
              </Button>
              <Button asChild variant="outline" className="px-3 py-3.5 fs-15 lg:fs-17">
                <a href={phoneHref()}>
                  <span dir="ltr">{business.phone}</span>
                  <Icon name="Phone" size={16} />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
