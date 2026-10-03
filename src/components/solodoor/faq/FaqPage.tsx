import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { DragRow } from "../DragRow";
import { Container, Pill } from "../primitives";
import { DOORS_PHONE, DOORS_PHONE_HREF } from "../doors/data";
import { FAQ_CATEGORIES, categoryLabel, filterFaq, selectedCategories, type FaqEntry, type FaqSearch } from "./faq-items";

/** Heading and intro for the current filter; also used for the page title and description. */
export function faqHeading(selected: string[]) {
  if (selected.length === 1) {
    const label = categoryLabel(selected[0]);
    return {
      title: `שאלות נפוצות: ${label}`,
      intro: `כל מה שחשוב לדעת על ${label}: מדידה, התקנה, תחזוקה, משלוח ועוד.`,
    };
  }
  return {
    title: "שאלות נפוצות",
    intro: "תשובות לשאלות שחוזרות הכי הרבה על טפט לדלת, למטבח, למקרר, לשיש, לקיר ולארון חשמל: מדידה, התקנה עצמית, תחזוקה, משלוח והחזרות. בחרו מה אתם רוצים לחדש, ותראו רק את מה שרלוונטי אליכם.",
  };
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex flex-none cursor-pointer items-center gap-2 rounded-full border px-4 py-2 fs-15 font-medium whitespace-nowrap transition-colors duration-160 ease-standard lg:px-5 lg:fs-16",
        active ? "border-secondary bg-secondary text-secondary-foreground" : "border-input bg-card text-foreground hover:border-foreground",
      )}
    >
      {active && <Icon name="Check" size={13} />}
      {children}
    </button>
  );
}

function Question({ entry, open, onToggle, showTags }: { entry: FaqEntry; open: boolean; onToggle: () => void; showTags: boolean }) {
  return (
    <div className="overflow-hidden rounded-[0.75rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-right lg:px-7 lg:py-6"
        >
          <span className="flex-auto fs-18 leading-[1.4] font-semibold text-foreground lg:fs-19">{entry.question}</span>
          <span className="inline-flex size-9 flex-none items-center justify-center rounded-full border border-foreground text-foreground">
            <Icon name={open ? "Minus" : "Plus"} size={16} />
          </span>
        </button>
      </h3>
      {/* The answer stays in the page for search engines; it is only hidden while closed. */}
      <div hidden={!open} className="px-5 pb-6 text-right lg:px-7 lg:pb-7">
        <p className="fs-18 leading-[1.8] text-foreground">{entry.answer}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5">
          {entry.article_slug && (
            <Link
              to="/$slug"
              params={{ slug: entry.article_slug }}
              className="inline-flex items-center gap-2 fs-16 font-medium text-clay transition-[gap,color] duration-240 ease-standard hover:gap-3.5 hover:text-foreground"
            >
              <span>לקריאת המאמר המלא</span>
              <Icon name="AngleLeft" size={13} />
            </Link>
          )}
          {/* Tags only for questions that matter to a few categories; the general ones need none. */}
          {showTags && entry.categories.length < 7 && (
            <span className="flex flex-wrap gap-1.5">
              {entry.categories.map((key) => (
                <span key={key} className="rounded-full bg-muted px-3 py-1 fs-13 font-medium text-foreground">
                  {categoryLabel(key)}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** The FAQ page: heading, a sticky filter bar by what the visitor wants to wallpaper, and the questions. */
export function FaqPage({ entries, search }: { entries: FaqEntry[]; search: FaqSearch }) {
  const navigate = useNavigate();
  const selected = selectedCategories(search);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const q = query.trim();
  const byCategory = filterFaq(entries, selected);
  const shown = q ? byCategory.filter((e) => e.question.includes(q) || e.answer.includes(q)) : byCategory;
  const { title, intro } = faqHeading(selected);
  const count = (key: string) => entries.filter((e) => e.categories.includes(key)).length;

  const setSelected = (next: string[]) => {
    setOpen(null);
    navigate({ to: "/שאלות-נפוצות", search: next.length ? { cat: next.join(",") } : {}, resetScroll: false });
  };
  const toggle = (key: string) => setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);

  return (
    <>
      <section className="border-b border-border">
        <Container className="pt-6 pb-9 text-right lg:pt-8 lg:pb-12">
          <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              שאלות נפוצות
            </span>
          </nav>
          <Pill className="mt-5 tracking-[0.16em]">שאלות ותשובות</Pill>
          <h1 className="mt-4 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-62">{title}</h1>
          <p className="mt-4 max-w-[64ch] fs-18 leading-[1.7] text-foreground lg:fs-20">{intro}</p>
        </Container>
      </section>

      {/* Filter bar: stays under the header while the questions scroll. */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur lg:top-20">
        <Container className="py-3 lg:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <span className="flex-none fs-15 font-semibold text-foreground lg:fs-16">מה מעניין אתכם?</span>
            <DragRow className="-mx-5 flex flex-auto gap-2 overflow-x-auto px-5 scrollbar-none lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              <Chip active={selected.length === 0} onClick={() => setSelected([])}>
                הכל
              </Chip>
              {FAQ_CATEGORIES.map((c) => (
                <Chip key={c.key} active={selected.includes(c.key)} onClick={() => toggle(c.key)}>
                  {c.label}
                  <span className="fs-13 opacity-70" dir="ltr">
                    {count(c.key)}
                  </span>
                </Chip>
              ))}
            </DragRow>
            <div className="relative w-full flex-none lg:w-72">
              <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-foreground">
                <Icon name="Search" size={17} />
              </span>
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש בשאלות"
                aria-label="חיפוש בשאלות"
                className="ps-11 fs-15"
              />
            </div>
          </div>
        </Container>
      </div>

      <section className="pt-7 pb-14 lg:pt-10 lg:pb-20">
        <Container>
          <p className="fs-16 font-medium text-foreground" aria-live="polite">
            {shown.length} שאלות
          </p>
          {shown.length ? (
            <div className="mt-4 flex max-w-250 flex-col gap-3 lg:mt-5 lg:gap-4">
              {shown.map((entry) => (
                <Question
                  key={entry.id}
                  entry={entry}
                  open={open === entry.id}
                  onToggle={() => setOpen(open === entry.id ? null : entry.id)}
                  showTags={selected.length !== 1}
                />
              ))}
            </div>
          ) : (
            <p className="mt-8 fs-18 text-foreground">לא נמצאו שאלות עבור "{q}". נסו מילה אחרת, או שאלו אותנו ישירות למטה.</p>
          )}
        </Container>
      </section>

      <section data-reveal className="pb-16 lg:pb-26">
        <Container>
          <div className="overflow-hidden rounded-lg bg-foreground px-6 py-9 text-background lg:px-14 lg:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-right">
                <h2 className="max-w-[20ch] fs-28 leading-[1.12] font-bold tracking-[-0.02em] lg:fs-44">לא מצאתם את התשובה?</h2>
                <p className="mt-3 max-w-[46ch] fs-17 leading-[1.7] font-light lg:fs-19">
                  שלחו לנו הודעה או תמונה בווצאפ, ונחזור אליכם עם תשובה אישית ועם המלצה למשטח שלכם.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-none">
                <Button asChild className="px-8 py-4">
                  <a href="#">
                    <span>לשיחה בווצאפ</span>
                    <Icon name="ChatDots" size={17} />
                  </a>
                </Button>
                <Button asChild variant="light" className="px-8 py-4">
                  <a href={DOORS_PHONE_HREF}>
                    <span dir="ltr">{DOORS_PHONE}</span>
                    <Icon name="Phone" size={16} />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
