import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { FAQ_CATEGORIES, type FaqEntry } from "../faq/faq-items";
import { db } from "./db";

type Draft = Omit<FaqEntry, "id"> & { id: number | null };

const EMPTY: Draft = { id: null, question: "", answer: "", categories: [], product_scopes: [], article_slug: null, sort_order: 0 };

/** A row of tick boxes for the surfaces and product types. */
function Scopes({ label, hint, value, onChange }: { label: string; hint: string; value: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="fs-15 font-semibold text-foreground">{label}</span>
      <span className="fs-13 leading-[1.5] text-foreground/70">{hint}</span>
      <div className="flex flex-wrap gap-2">
        {FAQ_CATEGORIES.map((c) => {
          const on = value.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((k) => k !== c.key) : [...value, c.key])}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 fs-14 font-medium transition-colors duration-160 ease-standard",
                on ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-foreground hover:border-foreground",
              )}
            >
              {c.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(value.length === FAQ_CATEGORIES.length ? [] : FAQ_CATEGORIES.map((c) => c.key))}
          className="cursor-pointer px-2 py-1 fs-14 font-medium text-clay"
        >
          {value.length === FAQ_CATEGORIES.length ? "נקה הכול" : "סמן הכול"}
        </button>
      </div>
    </div>
  );
}

/**
 * The questions and answers. Each one says where it shows: on the FAQ page (under which chips) and on
 * which product pages. A question written for one product page only has no chips and stays off the FAQ page.
 */
export function FaqAdmin() {
  const [entries, setEntries] = useState<FaqEntry[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await db.from("faq_items").select("*").order("sort_order").order("id");
    if (error) setStatus(error.message);
    else setEntries((data ?? []) as FaqEntry[]);
  };
  useEffect(() => {
    load();
  }, []);

  const q = query.trim();
  const shown = (entries ?? []).filter((e) => !q || e.question.includes(q) || e.answer.includes(q));

  const save = async () => {
    if (!draft) return;
    if (!draft.question.trim() || !draft.answer.trim()) {
      setStatus("צריך שאלה ותשובה.");
      return;
    }
    if (!draft.categories.length && !draft.product_scopes.length) {
      setStatus("צריך לסמן לפחות מקום אחד שבו השאלה מופיעה.");
      return;
    }
    setBusy(true);
    setStatus(null);
    const row = {
      question: draft.question.trim(),
      answer: draft.answer.trim(),
      categories: draft.categories,
      product_scopes: draft.product_scopes,
      article_slug: draft.article_slug?.trim() || null,
      sort_order: Number(draft.sort_order) || 0,
    };
    const { error } = draft.id ? await db.from("faq_items").update(row).eq("id", draft.id) : await db.from("faq_items").insert(row);
    setBusy(false);
    if (error) {
      setStatus(`השמירה נכשלה: ${error.message}`);
      return;
    }
    setDraft(null);
    setStatus("נשמר. השינוי מופיע באתר מיד.");
    load();
  };

  const remove = async (entry: FaqEntry) => {
    if (!window.confirm(`למחוק את השאלה "${entry.question}"?`)) return;
    const { error } = await db.from("faq_items").delete().eq("id", entry.id);
    if (error) setStatus(`המחיקה נכשלה: ${error.message}`);
    else {
      if (draft?.id === entry.id) setDraft(null);
      load();
    }
  };

  const label = (key: string) => FAQ_CATEGORIES.find((c) => c.key === key)?.label ?? key;

  return (
    <div className="text-right">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="fs-28 font-bold text-foreground">שאלות נפוצות</h1>
          {entries && (
            <p className="mt-1 fs-15 text-foreground/70">
              {entries.length} שאלות, {entries.filter((e) => e.categories.length).length} בדף השאלות הנפוצות, {entries.filter((e) => e.product_scopes.length).length} בדפי מוצר
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש בשאלות ובתשובות" className="w-full fs-15 lg:w-72" />
          <Button type="button" className="flex-none px-5 py-3 fs-15" onClick={() => setDraft({ ...EMPTY, sort_order: (entries?.length ?? 0) + 1 })}>
            <Icon name="Plus" size={14} />
            <span>שאלה חדשה</span>
          </Button>
        </div>
      </div>

      {status && <p className="mt-4 rounded-md border border-border bg-card px-4 py-3 fs-15 font-semibold text-foreground">{status}</p>}

      {draft && (
        <section className="mt-5 flex flex-col gap-4 rounded-lg border border-secondary bg-card p-5">
          <h2 className="fs-17 font-bold text-foreground">{draft.id ? "עריכת שאלה" : "שאלה חדשה"}</h2>
          <label className="flex flex-col gap-1.5">
            <span className="fs-15 font-semibold text-foreground">השאלה</span>
            <Input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} className="fs-17 font-semibold" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="fs-15 font-semibold text-foreground">התשובה</span>
            <Textarea rows={5} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} className="fs-16" />
          </label>
          <Scopes label="בדף השאלות הנפוצות" hint="תחת אילו כפתורי סינון השאלה מופיעה. בלי סימון היא לא מופיעה בדף השאלות הנפוצות בכלל." value={draft.categories} onChange={(categories) => setDraft({ ...draft, categories })} />
          <Scopes label="בדפי המוצר" hint="באילו דפי מוצר השאלה מופיעה למטה, לפי המשטח או סוג המוצר." value={draft.product_scopes} onChange={(product_scopes) => setDraft({ ...draft, product_scopes })} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="fs-15 font-semibold text-foreground">סדר</span>
              <Input dir="ltr" inputMode="numeric" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value as unknown as number })} className="w-28 text-center fs-15" />
              <span className="fs-13 text-foreground/70">מספר נמוך מופיע ראשון.</span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="fs-15 font-semibold text-foreground">מאמר להרחבה (לא חובה)</span>
              <Input dir="ltr" value={draft.article_slug ?? ""} onChange={(e) => setDraft({ ...draft, article_slug: e.target.value })} className="text-left fs-15" placeholder="הכתובת של המאמר, החלק אחרי /" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={busy} onClick={save}>
              {busy ? "רגע…" : "שמירה"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setDraft(null)}>
              ביטול
            </Button>
          </div>
        </section>
      )}

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        {entries === null ? (
          <p className="px-5 py-8 fs-16 text-foreground">טוען…</p>
        ) : shown.length === 0 ? (
          <p className="px-5 py-8 fs-16 text-foreground">אין שאלות להצגה.</p>
        ) : (
          <ul>
            {shown.map((entry) => (
              <li key={entry.id} className="flex items-start gap-4 border-t border-border px-4 py-3 first:border-t-0 lg:px-5">
                <span className="w-8 flex-none pt-1 text-center fs-13 text-foreground/60" dir="ltr">
                  {entry.sort_order}
                </span>
                <span className="flex min-w-0 flex-auto flex-col gap-1">
                  <button type="button" onClick={() => setDraft({ ...entry })} className="cursor-pointer text-right fs-16 font-semibold text-foreground hover:text-clay">
                    {entry.question}
                  </button>
                  <span className="line-clamp-2 fs-14 leading-[1.5] text-foreground/80">{entry.answer}</span>
                  <span className="fs-13 text-foreground/60">
                    {entry.categories.length ? `דף השאלות: ${entry.categories.length === FAQ_CATEGORIES.length ? "הכול" : entry.categories.map(label).join(", ")}` : "לא בדף השאלות"}
                    {" · "}
                    {entry.product_scopes.length ? `דפי מוצר: ${entry.product_scopes.map(label).join(", ")}` : "לא בדפי מוצר"}
                  </span>
                </span>
                <button type="button" aria-label="מחיקה" onClick={() => remove(entry)} className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-muted">
                  <Icon name="Trash" size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
