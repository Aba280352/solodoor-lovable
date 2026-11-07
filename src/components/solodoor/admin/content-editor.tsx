import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { discardDraft, loadEntry, loadHistory, publishEntry, resetEntry, restoreVersion, saveDraft, type ContentEntry, type ContentVersion } from "./content-db";

const dateFormat = new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" });

/* ───────────── The draft / publish frame shared by every section ───────────── */

interface EditorProps<T> {
  contentKey: string;
  title: string;
  intro?: string;
  /** Turns the edited value into what is stored (empty fields dropped), or returns an error message. */
  prepare: (value: T) => { data: T } | { error: string };
  children: (value: T, set: (patch: Partial<T>) => void) => ReactNode;
  onPublished?: () => void;
  /** A page of the site to open in preview mode (with the drafts) after saving, e.g. "/". */
  previewPath?: string;
  /** Called with the prepared value on every change (the visual editor shows it on the page at once). */
  onLiveChange?: (data: T) => void;
}

/**
 * Loads a key, lets the form edit it, and offers: save as draft, publish, discard the draft, back to the code
 * default, and the publish history with "restore to draft". Nothing reaches visitors before "פרסום".
 */
export function ContentEditor<T extends object>({ contentKey, title, intro, prepare, children, onPublished, previewPath, onLiveChange }: EditorProps<T>) {
  const [entry, setEntry] = useState<ContentEntry<T> | null>(null);
  const [value, setValue] = useState<T>({} as T);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ContentVersion[] | null>(null);

  const load = async () => {
    try {
      const e = await loadEntry<T>(contentKey);
      setEntry(e);
      setValue((e.draft?.data ?? e.published ?? {}) as T);
      setDirty(false);
      setHistory(null);
    } catch (err) {
      setMessage(`הטעינה נכשלה: ${(err as Error).message}`);
    }
  };
  // The visual editor mirrors every edit on the page, before anything is saved.
  useEffect(() => {
    if (!onLiveChange || !entry) return;
    const prepared = prepare(value);
    if ("data" in prepared) onLiveChange(prepared.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, entry]);

  useEffect(() => {
    setEntry(null);
    setMessage(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  if (!entry) return <p className="fs-16 text-foreground">{message ?? "טוען…"}</p>;

  const set = (patch: Partial<T>) => {
    setValue((v) => ({ ...v, ...patch }));
    setDirty(true);
  };

  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      await load();
      setMessage(done);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** Saves the form as the draft when it changed; returns the revision to publish. */
  const save = async (): Promise<number> => {
    const prepared = prepare(value);
    if ("error" in prepared) throw new Error(prepared.error);
    if (!dirty && entry.draft) return entry.draft.revision;
    return saveDraft(contentKey, prepared.data, entry.draft?.revision ?? 0);
  };

  const status = entry.draft
    ? `יש טיוטה שלא פורסמה (נשמרה ${dateFormat.format(new Date(entry.draft.updated_at))}${entry.draft.updated_by ? ` על ידי ${entry.draft.updated_by}` : ""})`
    : entry.published
      ? "מפורסם באתר"
      : "באתר מוצג התוכן המקורי (ברירת מחדל)";

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="fs-22 font-bold text-foreground">{title}</h2>
          {intro && <p className="mt-1 fs-15 text-foreground/70">{intro}</p>}
        </div>
        <span className={cn("rounded-full px-3 py-1 fs-13 font-semibold", entry.draft ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>{status}</span>
      </div>

      {children(value, set)}

      {message && <p className="rounded-md border border-border bg-muted px-4 py-3 fs-15 font-semibold text-foreground">{message}</p>}

      <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap items-center gap-2 rounded-b-lg border-t border-border bg-card px-5 py-3">
        <Button type="button" size="sm" variant="outline" disabled={busy || !dirty} onClick={() => run(async () => void (await save()), "נשמר כטיוטה. באתר עוד לא השתנה כלום.")}>
          שמירת טיוטה
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={busy || (!dirty && !entry.draft)}
          onClick={() =>
            run(async () => {
              const revision = await save();
              await publishEntry(contentKey, revision);
              onPublished?.();
            }, "פורסם. השינוי מופיע באתר ברענון הדף.")
          }
        >
          פרסום
        </Button>
        {previewPath && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              // Open the tab now (a popup opened after an await is blocked), then point it at the page once the draft is saved.
              const tab = window.open("about:blank", "_blank");
              void run(async () => {
                if (dirty) await save();
                if (tab) tab.location.href = `${previewPath}${previewPath.includes("?") ? "&" : "?"}preview=1`;
              }, "הטיוטה נשמרה ונפתחה בתצוגה מקדימה בלשונית חדשה.");
            }}
          >
            תצוגה מקדימה
          </Button>
        )}
        {entry.draft && (
          <button type="button" disabled={busy} onClick={() => run(() => discardDraft(contentKey), "הטיוטה בוטלה.")} className="cursor-pointer px-2 fs-14 font-medium text-foreground hover:text-clay">
            ביטול הטיוטה
          </button>
        )}
        <span className="ms-auto flex items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={async () => setHistory(history ? null : await loadHistory(contentKey).catch(() => []))}
            className="cursor-pointer fs-14 font-medium text-foreground hover:text-clay"
          >
            היסטוריה
          </button>
          {(entry.published || entry.draft) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm("להחזיר את האזור הזה לתוכן המקורי? הגרסה הנוכחית תישמר בהיסטוריה.") && run(async () => { await resetEntry(contentKey); onPublished?.(); }, "הוחזר לתוכן המקורי.")}
              className="cursor-pointer fs-14 font-medium text-foreground/70 hover:text-clay"
            >
              איפוס לברירת מחדל
            </button>
          )}
        </span>
      </div>

      {history && (
        <div className="rounded-md border border-border">
          {!history.length && <p className="px-4 py-3 fs-14 text-foreground/70">עוד לא היו פרסומים.</p>}
          {history.map((h) => (
            <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 last:border-b-0">
              <span className="fs-14 text-foreground">
                {dateFormat.format(new Date(h.published_at))} · {h.data === null ? "איפוס לברירת מחדל" : "פרסום"}
                {h.published_by ? ` · ${h.published_by}` : ""}
              </span>
              {h.data !== null && (
                <button type="button" disabled={busy} onClick={() => run(() => restoreVersion(h.id), "הגרסה הוחזרה כטיוטה. בדקו ולחצו פרסום.")} className="cursor-pointer fs-14 font-medium text-foreground hover:text-clay">
                  שחזור לטיוטה
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ───────────── Fields ───────────── */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="fs-15 font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="fs-13 text-foreground/60">{hint}</span>}
    </label>
  );
}

export function Counter({ value, max }: { value: string; max: number }) {
  return <span className={cn("fs-13", value.length > max ? "font-semibold text-clay" : "text-foreground/60")}>{value.length} / {max}</span>;
}

/** Drops empty strings, so an empty field means "keep the original". */
export const compact = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== "" && v !== undefined && v !== null && v !== false)) as T;

