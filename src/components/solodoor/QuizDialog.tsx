import { useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { CoverImage, MediaPlaceholder } from "./primitives";
import { pickQuizModels, quizAreas, quizStyles, type QuizArea, type QuizStyle } from "./data";
import { useQuiz } from "./quiz-context";

/** 1 area -> 2 style -> 3 matching models -> 4 contact form (reached only on request). */
type Step = 1 | 2 | 3 | 4;

const STEP_COUNT = 4;

const pills: Record<Step, string> = {
  1: "01 · מה תרצו לחדש?",
  2: "02 · הסגנון שלכם",
  3: "03 · הדגמים שלכם",
  4: "04 · השארת פרטים",
};

const emptyForm = { name: "", phone: "", mail: "", city: "", msg: "", w: "", h: "", qty: "" };

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("flex flex-col gap-2 text-right", className)}>
      <span className="fs-16 font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function QuizDialog() {
  const { open, setOpen } = useQuiz();
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [area, setArea] = useState<QuizArea>();
  const [style, setStyle] = useState<QuizStyle>();
  const [form, setForm] = useState(emptyForm);
  const [fileName, setFileName] = useState("");

  // The bar fills over the three choice steps; the optional contact step keeps it full.
  const pct = step === 4 ? 100 : Math.round(((step - 1) / 2) * 100);

  const title =
    step === 1
      ? "מה תרצו לחדש?"
      : step === 2
        ? "איזה מראה אתם אוהבים?"
        : step === 3
          ? `הדגמים שמתאימים ל${area ?? "החלל"}`
          : "השאירו פרטים ונחזור אליכם";

  const note =
    step === 3
      ? "בחרו דגם כדי לעבור לדף המוצר ולרכישה. לא בטוחים? אפשר להשאיר פרטים ונחזור אליכם."
      : step === 4
        ? "תמלאו את הפרטים ונדאג שהצוות שלנו יחזור אליכם בהקדם האפשרי ונעזור לכם לבחור את הטפט המתאים לכם."
        : "";

  const setField = (key: keyof typeof emptyForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const next = () => {
    if (step === STEP_COUNT) setDone(true);
    else setStep((s) => (s + 1) as Step);
  };

  /** "סגירה" on the thank-you screen: close and start over next time. */
  const restart = () => {
    setOpen(false);
    setStep(1);
    setDone(false);
    setArea(undefined);
    setStyle(undefined);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        overlayClassName="items-start justify-center px-3 py-4 lg:px-6 lg:py-10"
        className="w-full max-w-280 rounded-[1rem] px-4 pt-16 pb-5 lg:px-12 lg:pt-14 lg:pb-12"
      >
        <DialogClose
          aria-label="סגירה"
          className="absolute top-3 left-3 flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background p-0 text-foreground transition-colors duration-240 ease-standard hover:bg-primary lg:top-5 lg:left-5"
        >
          <Icon name="Times" size={20} />
        </DialogClose>

        <div className="flex flex-col items-center text-center">
          <DialogTitle className="max-w-[26ch] fs-28 leading-[1.12] font-bold tracking-[-0.02em] text-foreground lg:fs-44">
            בואו נמצא את הציפוי שמתאים בדיוק לבית שלכם
          </DialogTitle>
          <DialogDescription className="mt-5 max-w-[72ch] fs-16 leading-[1.8] font-medium text-foreground lg:fs-18">
            כמה שאלות קצרות יעזרו לנו להבין מה אתם רוצים לחדש, איזה סגנון אתם אוהבים ומה מתאים לחלל שלכם. בסיום
            נוכל להציג לכם את הכיוונים והדגמים הרלוונטיים ביותר לציפוי ולהתקנה.
          </DialogDescription>
        </div>

        <div className="mt-9 rounded-[0.5rem] border border-border bg-background px-4 pt-6 pb-7 lg:px-12 lg:pt-10 lg:pb-11">
          {!done ? (
            <div>
              <div className="relative h-5.5 overflow-hidden rounded-full bg-track">
                <div
                  className="absolute inset-y-0 start-0 min-w-12 rounded-full bg-primary transition-[width] duration-[520ms] ease-standard"
                  style={{ width: `${pct}%` }}
                />
                <span
                  dir="ltr"
                  className="absolute inset-0 flex items-center justify-center fs-13 font-bold tracking-[0.02em] text-foreground"
                >
                  {pct}%
                </span>
              </div>

              <div className="mt-8 flex flex-col items-center text-center lg:mt-10">
                <span className="inline-flex items-center rounded-full border border-primary px-5 py-2 fs-15 font-semibold tracking-[0.14em] whitespace-nowrap text-foreground">
                  {pills[step]}
                </span>
                <h3 className="mt-6 fs-26 leading-[1.2] font-bold tracking-[-0.01em] text-foreground lg:fs-36">
                  {title}
                </h3>
                {note && <p className="mt-3.5 max-w-[56ch] fs-16 leading-[1.7] text-foreground">{note}</p>}
              </div>

              {step === 1 && (
                <div className="mx-auto mt-9 flex max-w-266 flex-wrap items-stretch justify-center gap-3 lg:gap-5">
                  {quizAreas.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setArea(option.label)}
                      className="relative w-[calc(50%-0.375rem)] cursor-pointer overflow-hidden rounded-[0.5rem] border border-border bg-card p-0 text-center transition-colors duration-240 ease-standard hover:border-secondary lg:w-62"
                    >
                      <span className="relative block h-32 overflow-hidden bg-muted lg:h-56">
                        <CoverImage src={option.img} alt={option.label} />
                      </span>
                      <span className="block px-3 py-4 fs-18 font-medium text-foreground">{option.label}</span>
                      {area === option.label && (
                        <span className="pointer-events-none absolute inset-0 rounded-[0.5rem] ring-2 ring-primary ring-inset" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="mx-auto mt-9 flex max-w-130 flex-col gap-3">
                  {quizStyles.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setStyle(label)}
                      className="relative w-full cursor-pointer rounded-md border border-input bg-background px-4.5 py-[0.9375rem] text-right fs-18 font-medium text-foreground transition-colors duration-240 ease-standard hover:border-foreground"
                    >
                      <span>{label}</span>
                      {style === label && (
                        <span className="pointer-events-none absolute -inset-px rounded-md ring-2 ring-primary ring-inset" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <>
                  <div className="mt-9 grid w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
                    {pickQuizModels(area, style).map((model) => (
                      <a
                        key={model.name}
                        href="#"
                        className="block overflow-hidden rounded-[0.5rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
                      >
                        <div className="relative h-52 overflow-hidden bg-muted lg:h-75">
                          {model.img ? (
                            <CoverImage src={model.img} alt={model.name} />
                          ) : (
                            <MediaPlaceholder label={model.name} />
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-2.5 px-5.5 pt-5 pb-6 text-center">
                          <span className="fs-18 font-semibold text-foreground">{model.name}</span>
                          <span className="fs-22 font-bold text-foreground">{model.price}</span>
                          <span className="mt-1.5 w-full rounded-md bg-primary px-2.5 py-[0.8125rem] fs-16 font-medium text-primary-foreground">
                            לפרטים נוספים
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-col items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="inline-flex cursor-pointer items-center gap-2 border-b border-foreground px-1 py-2 fs-16 font-medium text-foreground transition-colors duration-240 ease-standard hover:border-primary hover:text-clay"
                    >
                      <span>לא סגור מה לבחור? השאר פרטים להתייעצות</span>
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="mx-auto mt-9 grid max-w-190 grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                  <Field label="שם מלא">
                    <Input type="text" value={form.name} onChange={setField("name")} className="fs-18" />
                  </Field>
                  <Field label="טלפון">
                    <Input type="tel" dir="ltr" value={form.phone} onChange={setField("phone")} className="fs-18" />
                  </Field>
                  <Field label="אימייל">
                    <Input type="email" dir="ltr" value={form.mail} onChange={setField("mail")} className="fs-18" />
                  </Field>
                  <Field label="מיקום / אזור התקנה">
                    <Input type="text" value={form.city} onChange={setField("city")} className="fs-18" />
                  </Field>
                  <Field label="הודעה" className="col-span-full">
                    <Textarea rows={3} value={form.msg} onChange={setField("msg")} className="fs-18" />
                  </Field>
                  <div className="col-span-full grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
                    <Field label="רוחב (אופציונלי)">
                      <Input type="text" value={form.w} onChange={setField("w")} className="fs-18" />
                    </Field>
                    <Field label="גובה (אופציונלי)">
                      <Input type="text" value={form.h} onChange={setField("h")} className="fs-18" />
                    </Field>
                    <Field label="כמות (אופציונלי)">
                      <Input type="text" value={form.qty} onChange={setField("qty")} className="fs-18" />
                    </Field>
                  </div>
                  <label className="col-span-full flex min-h-19 cursor-pointer flex-col items-center justify-center gap-3.5 rounded-[0.5rem] border border-dashed border-primary bg-card p-4 text-foreground">
                    <span className="inline-flex items-center gap-3">
                      <Icon name="Image" size={24} />
                      <span className="fs-18 font-medium">{fileName || "העלאת תמונה מהמכשיר"}</span>
                      <span className="fs-15">(אופציונלי)</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                    />
                  </label>
                </div>
              )}

              <div className="mt-11 flex items-center justify-center gap-3">
                {step !== 3 && (
                  <Button type="button" onClick={next} className="px-10 leading-[normal] lg:px-16">
                    <span>{step === STEP_COUNT ? "שליחת הפרטים" : "לשלב הבא"}</span>
                    <Icon name="ArrowLeft" size={16} />
                  </Button>
                )}
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
                    className="cursor-pointer px-5 py-[1.0625rem] fs-16 text-foreground"
                  >
                    חזרה
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <span className="fs-15 font-semibold tracking-[0.16em] text-clay">הושלמו 100%</span>
              <h3 className="mt-4.5 fs-30 leading-[1.15] font-bold tracking-[-0.02em] text-foreground lg:fs-44">
                קיבלנו את הפרטים
              </h3>
              <p className="mt-4.5 max-w-[46ch] fs-18 leading-[1.7] text-foreground">
                נחזור אליכם בהקדם עם התאמה אישית של הציפוי והצעה להתקנה מקצועית.
              </p>
              <div className="mt-11 flex flex-col items-center gap-3 lg:flex-row">
                <Button asChild className="px-11 py-4.5">
                  <Link to="/חנות">
                    <span>לצפייה בכל החנות</span>
                    <Icon name="ArrowLeft" size={16} />
                  </Link>
                </Button>
                <button type="button" onClick={restart} className="cursor-pointer px-5 py-4.5 fs-16 text-foreground">
                  סגירה
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
