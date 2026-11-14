import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { LOGO_SRC } from "../data";
import { BRIEF_SECTIONS, isAnswered, otherKey, type BriefAnswers, type Question } from "./questions";

type Load = { state: "loading" } | { state: "bad" } | { state: "ready"; status: "draft" | "submitted"; answers: BriefAnswers; submittedAt: string | null };
type Save = "idle" | "saving" | "saved" | "error";

const API = "/api/public/seo-brief";
/** Local preview only: the address /brief/dev works without the server, in this browser. */
const DEV_TOKEN = "dev-preview-token-0000000";
const isDev = (token: string) => import.meta.env.DEV && token === DEV_TOKEN;

async function fetchBrief(token: string): Promise<Load> {
  if (isDev(token)) {
    const saved = JSON.parse(localStorage.getItem("brief-dev") ?? "{}") as { answers?: BriefAnswers; status?: "draft" | "submitted" };
    return { state: "ready", status: saved.status ?? "draft", answers: saved.answers ?? {}, submittedAt: null };
  }
  const res = await fetch(`${API}?t=${encodeURIComponent(token)}`, { cache: "no-store" });
  if (!res.ok) return { state: "bad" };
  const data = (await res.json()) as { status: "draft" | "submitted"; answers: BriefAnswers; submitted_at: string | null };
  return { state: "ready", status: data.status, answers: data.answers ?? {}, submittedAt: data.submitted_at };
}

async function saveBrief(token: string, answers: BriefAnswers, submit: boolean): Promise<{ ok: boolean; message?: string }> {
  if (isDev(token)) {
    localStorage.setItem("brief-dev", JSON.stringify({ answers, status: submit ? "submitted" : "draft" }));
    return { ok: true };
  }
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, answers, submit }) });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  return { ok: res.ok && data.ok === true, message: data.message };
}

const dateFormat = new Intl.DateTimeFormat("he-IL", { dateStyle: "long", timeZone: "Asia/Jerusalem" });

/** What we already know, so the brief does not ask it. */
const KNOWN = ["פרטי העסק ודרכי הקשר", "המוצרים, הגוונים והמחירים", "אזורי ההתקנה והמשלוחים", "הגישה לאתר, לגוגל אנליטיקס ול-Search Console"];

function Shell({ children, progress }: { children: ReactNode; progress?: number }) {
  return (
    <div dir="rtl" className="min-h-dvh bg-muted font-sans text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex max-w-180 items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <img src={LOGO_SRC} alt="SOLODOOR" className="h-7 sm:h-8" />
          <span className="fs-14 font-semibold text-foreground sm:fs-15">שאלון אפיון לקידום בגוגל</span>
        </div>
        {progress !== undefined && (
          <div className="h-1 bg-muted" aria-hidden="true">
            <div className="h-full bg-secondary transition-[width] duration-300 ease-standard" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
      </header>
      <main className="mx-auto max-w-180 px-4 pt-6 pb-32 sm:px-6 sm:pt-10">{children}</main>
    </div>
  );
}

function Choice({ checked, multi, label, onClick }: { checked: boolean; multi: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-md border bg-card px-3.5 py-3 text-right transition-colors duration-160 ease-standard",
        checked ? "border-secondary" : "border-input hover:border-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5.5 flex-none items-center justify-center border",
          multi ? "rounded-[0.3125rem]" : "rounded-full",
          checked ? "border-secondary bg-secondary text-secondary-foreground" : "border-input bg-card text-transparent",
        )}
      >
        <Icon name="Check" size={12} />
      </span>
      <span className="fs-16 leading-[1.4] text-foreground">{label}</span>
    </button>
  );
}

type Patch = BriefAnswers | ((prev: BriefAnswers) => BriefAnswers);

function QuestionField({ q, answers, onChange, disabled }: { q: Question; answers: BriefAnswers; onChange: (patch: Patch) => void; disabled: boolean }) {
  const value = answers[q.id];
  const other = typeof answers[otherKey(q.id)] === "string" ? (answers[otherKey(q.id)] as string) : "";
  const [otherOpen, setOtherOpen] = useState(other.length > 0);
  const id = `q-${q.id}`;

  let field: ReactNode;
  if (q.type === "text") {
    field = <Input id={id} disabled={disabled} value={typeof value === "string" ? value : ""} placeholder={q.placeholder} onChange={(e) => onChange({ [q.id]: e.target.value })} className="bg-card fs-16" />;
  } else if (q.type === "textarea") {
    field = <Textarea id={id} disabled={disabled} rows={4} value={typeof value === "string" ? value : ""} placeholder={q.placeholder} onChange={(e) => onChange({ [q.id]: e.target.value })} className="bg-card fs-16 leading-[1.6]" />;
  } else {
    const multi = q.type === "multi";
    const picked = multi ? (Array.isArray(value) ? value : []) : typeof value === "string" ? [value] : [];
    const toggle = (opt: string) => {
      if (disabled) return;
      // From the latest answers, so quick taps in a row never drop one.
      if (multi)
        onChange((prev) => {
          const cur = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : [];
          return { [q.id]: cur.includes(opt) ? cur.filter((p) => p !== opt) : [...cur, opt] };
        });
      else {
        setOtherOpen(false);
        onChange(q.other ? { [q.id]: opt, [otherKey(q.id)]: "" } : { [q.id]: opt });
      }
    };
    const toggleOther = () => {
      if (disabled) return;
      const next = !otherOpen;
      setOtherOpen(next);
      if (!next) onChange({ [otherKey(q.id)]: "" });
      else if (!multi) onChange({ [q.id]: "" });
    };
    field = (
      <div role={multi ? "group" : "radiogroup"} aria-labelledby={`${id}-label`} className="grid gap-2 sm:grid-cols-2">
        {(q.options ?? []).map((opt) => (
          <Choice key={opt} multi={multi} label={opt} checked={picked.includes(opt)} onClick={() => toggle(opt)} />
        ))}
        {q.other && <Choice multi={multi} label="אחר" checked={otherOpen} onClick={toggleOther} />}
        {q.other && otherOpen && (
          <Input
            autoFocus
            disabled={disabled}
            aria-label={`${q.label}: אחר`}
            value={other}
            placeholder="כתבו כאן"
            onChange={(e) => onChange({ [otherKey(q.id)]: e.target.value })}
            className="bg-card fs-16 sm:col-span-2"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:p-6" data-question={q.id}>
      <div className="flex flex-col gap-1">
        <label id={`${id}-label`} htmlFor={q.type === "text" || q.type === "textarea" ? id : undefined} className="fs-17 leading-[1.4] font-semibold text-foreground sm:fs-18">
          {q.label}
          {q.required && <span className="text-clay"> *</span>}
        </label>
        {q.help && <span className="fs-14 leading-[1.5] text-foreground/75 sm:fs-15">{q.help}</span>}
      </div>
      {field}
    </div>
  );
}

function SaveNote({ save }: { save: Save }) {
  if (save === "idle") return null;
  const text = save === "saving" ? "שומר…" : save === "saved" ? "נשמר" : "השמירה נכשלה, ננסה שוב";
  return <span className={cn("fs-14 font-medium", save === "error" ? "text-clay" : "text-foreground/70")} aria-live="polite">{text}</span>;
}

export function BriefForm({ token }: { token: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [answers, setAnswers] = useState<BriefAnswers>({});
  // 0 = welcome, 1..n = sections, n+1 = review
  const [step, setStep] = useState(0);
  const [save, setSave] = useState<Save>("idle");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<BriefAnswers>({});

  useEffect(() => {
    fetchBrief(token)
      .then((l) => {
        setLoad(l);
        if (l.state === "ready") {
          setAnswers(l.answers);
          latest.current = l.answers;
        }
      })
      .catch(() => setLoad({ state: "bad" }));
  }, [token]);

  const flush = async () => {
    if (!dirty.current) return true;
    dirty.current = false;
    setSave("saving");
    const r = await saveBrief(token, latest.current, false).catch(() => ({ ok: false }));
    setSave(r.ok ? "saved" : "error");
    if (!r.ok) dirty.current = true;
    return r.ok;
  };

  const change = (patch: Patch) => {
    const next = { ...latest.current, ...(typeof patch === "function" ? patch(latest.current) : patch) };
    latest.current = next;
    setAnswers(next);
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1200);
  };

  // Leaving the page with unsaved typing: one last save.
  useEffect(() => {
    const onHide = () => {
      if (dirty.current && !isDev(token)) navigator.sendBeacon?.(API, new Blob([JSON.stringify({ t: token, answers: latest.current, submit: false })], { type: "application/json" }));
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [token]);

  const go = (next: number) => {
    void flush();
    setStep(next);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (load.state === "loading") return <Shell><div className="h-40" /></Shell>;
  if (load.state === "bad") {
    return (
      <Shell>
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <h1 className="fs-22 font-bold">הקישור לא תקין</h1>
          <p className="mt-2 fs-16 leading-[1.6]">כדאי לבדוק שהעתקתם את כל הקישור, או לבקש מאיתנו קישור חדש.</p>
        </div>
      </Shell>
    );
  }

  const n = BRIEF_SECTIONS.length;
  const locked = load.status === "submitted";

  if (locked) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Icon name="Check" size={26} />
          </span>
          <h1 className="fs-24 font-bold">תודה, השאלון נשלח</h1>
          <p className="max-w-[40ch] fs-16 leading-[1.6]">
            קיבלנו את כל התשובות{load.submittedAt ? ` (${dateFormat.format(new Date(load.submittedAt))})` : ""}. נעבור עליהן ונחזור אליכם עם תוכנית העבודה. רוצים לשנות משהו? כתבו לנו בוואטסאפ.
          </p>
        </div>
      </Shell>
    );
  }

  const required = BRIEF_SECTIONS.flatMap((s) => s.questions).filter((q) => q.required);
  const missing = required.filter((q) => !isAnswered(q, answers));
  const answeredCount = BRIEF_SECTIONS.flatMap((s) => s.questions).filter((q) => isAnswered(q, answers)).length;
  const total = BRIEF_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);

  const submit = async () => {
    setSending(true);
    setError(null);
    if (timer.current) clearTimeout(timer.current);
    const r = await saveBrief(token, latest.current, true).catch(() => ({ ok: false, message: undefined }));
    setSending(false);
    if (!r.ok) {
      setError(r.message ?? "השליחה לא הצליחה. נסו שוב בעוד רגע.");
      return;
    }
    dirty.current = false;
    setLoad({ state: "ready", status: "submitted", answers: latest.current, submittedAt: new Date().toISOString() });
    window.scrollTo({ top: 0 });
  };

  // Welcome
  if (step === 0) {
    return (
      <Shell progress={0}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full bg-card px-3 py-1 fs-14 font-semibold text-foreground">כ-10 דקות</span>
            <h1 className="fs-28 leading-[1.2] font-bold sm:fs-36">היי שלמה, כמה שאלות לפני שמתחילים</h1>
            <p className="fs-17 leading-[1.6]">
              כדי שהקידום בגוגל יביא יותר מכירות ויותר פניות, אנחנו צריכים להבין כמה דברים שרק אתם יודעים. אין תשובות נכונות או לא נכונות, וגם משפט קצר מספיק.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <span className="fs-16 font-semibold">את זה אנחנו כבר יודעים, אז לא נשאל:</span>
            <ul className="mt-3 flex flex-col gap-2">
              {KNOWN.map((k) => (
                <li key={k} className="flex items-start gap-2.5 fs-16 leading-[1.5]">
                  <span className="mt-1 inline-flex text-secondary">
                    <Icon name="CheckCircle" size={16} />
                  </span>
                  {k}
                </li>
              ))}
            </ul>
          </div>
          <p className="fs-15 leading-[1.6] text-foreground/80">כל תשובה נשמרת לבד. אפשר לעצור באמצע ולחזור לאותו קישור מתי שנוח.</p>
          <Button type="button" className="w-full py-4 fs-17 sm:w-auto sm:self-start sm:px-10" onClick={() => go(1)}>
            בואו נתחיל
          </Button>
        </div>
      </Shell>
    );
  }

  // Review and send
  if (step === n + 1) {
    return (
      <Shell progress={1}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="fs-26 leading-[1.25] font-bold sm:fs-32">כמעט סיימנו</h1>
            <p className="fs-17 leading-[1.6]">
              עניתם על {answeredCount} מתוך {total} שאלות. אחרי השליחה השאלון ננעל ומגיע אלינו.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {BRIEF_SECTIONS.map((s, i) => {
              const done = s.questions.filter((q) => isAnswered(q, answers)).length;
              const miss = s.questions.filter((q) => q.required && !isAnswered(q, answers));
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i + 1)}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3.5 text-right hover:border-foreground"
                >
                  <span className="flex flex-col">
                    <span className="fs-16 font-semibold">{s.title}</span>
                    {miss.length > 0 && <span className="fs-14 text-clay">{miss.length === 1 ? "חסרה שאלת חובה אחת" : `חסרות ${miss.length} שאלות חובה`}</span>}
                  </span>
                  <span className="flex-none fs-15 text-foreground/75">
                    {done}/{s.questions.length}
                  </span>
                </button>
              );
            })}
          </div>
          {missing.length > 0 && <p className="fs-15 leading-[1.6] text-clay">כדי לשלוח צריך לענות על השאלות המסומנות בכוכבית. לחיצה על חלק מחזירה אליו.</p>}
          {error && <p className="fs-15 text-clay">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" className="py-3.5" onClick={() => go(n)}>
              חזרה
            </Button>
            <Button type="button" disabled={missing.length > 0 || sending} className="py-4 fs-17 sm:px-10" onClick={submit}>
              {sending ? "שולח…" : "שליחת השאלון"}
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  const section = BRIEF_SECTIONS[step - 1];
  return (
    <Shell progress={(step - 1) / n}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="fs-14 font-semibold text-foreground/75">
            חלק {step} מתוך {n}
          </span>
          <h1 className="fs-26 leading-[1.25] font-bold sm:fs-32">{section.title}</h1>
          <p className="fs-16 leading-[1.6] sm:fs-17">{section.intro}</p>
        </div>
        {section.questions.map((q) => (
          <QuestionField key={q.id} q={q} answers={answers} onChange={change} disabled={false} />
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-180 items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button type="button" variant="outline" className="py-3" onClick={() => go(step - 1)}>
            חזרה
          </Button>
          <SaveNote save={save} />
          <Button type="button" className="py-3 sm:px-8" onClick={() => go(step + 1)}>
            {step === n ? "לסיכום ושליחה" : "המשך"}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
