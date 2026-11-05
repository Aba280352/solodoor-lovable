import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { BUSINESS_DEFAULTS, cleanBusiness, type Business } from "../content/business";
import { SITE_PAGES, type SitePage } from "../content/pages";
import { BUSINESS_KEY, SETTINGS_KEY, seoKey, type SeoOverride } from "../content/site-content";
import { discardDraft, loadEntry, loadHistory, loadStatus, publishEntry, resetEntry, restoreVersion, saveDraft, type ContentEntry, type ContentVersion } from "./content-db";
import { uploadCatalogImage } from "./db";

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
}

/**
 * Loads a key, lets the form edit it, and offers: save as draft, publish, discard the draft, back to the code
 * default, and the publish history with "restore to draft". Nothing reaches visitors before "פרסום".
 */
function ContentEditor<T extends object>({ contentKey, title, intro, prepare, children, onPublished }: EditorProps<T>) {
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

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="fs-15 font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="fs-13 text-foreground/60">{hint}</span>}
    </label>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={cn("fs-13", value.length > max ? "font-semibold text-clay" : "text-foreground/60")}>{value.length} / {max}</span>;
}

/** Drops empty strings, so an empty field means "keep the original". */
const compact = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== "" && v !== undefined && v !== null && v !== false)) as T;

/* ───────────── Business details ───────────── */

type BusinessForm = Partial<Record<keyof Business, string>>;

const BUSINESS_FIELDS: { key: keyof Business; label: string; hint?: string; ltr?: boolean }[] = [
  { key: "phone", label: "טלפון (כפי שמוצג באתר)", ltr: true },
  { key: "whatsapp", label: "מספר וואטסאפ", hint: "בפורמט בינלאומי בלי +, למשל 972548999961", ltr: true },
  { key: "whatsappMessage", label: "הודעת הפתיחה בוואטסאפ", hint: "השורה הראשונה שנכתבת לבד כשלוחצים על כפתור וואטסאפ באתר" },
  { key: "email", label: "אימייל", ltr: true },
  { key: "area", label: "אזור שירות" },
  { key: "hours", label: "שעות פעילות", hint: 'מפרידים בין חלקים עם " | "' },
  { key: "reviewCount", label: "מספר הביקורות בגוגל", ltr: true },
];

function BusinessSection() {
  return (
    <ContentEditor<BusinessForm>
      contentKey={BUSINESS_KEY}
      title="פרטי העסק"
      intro="מופיעים בכל האתר: תחתית האתר, כפתורי וואטסאפ וטלפון, דף הדלתות, המאמרים והביקורות. שדה ריק משאיר את הערך המקורי (מוצג באפור)."
      prepare={(value) => {
        const data = compact(value);
        const kept = cleanBusiness(data);
        const bad = BUSINESS_FIELDS.filter((f) => data[f.key] !== undefined && kept[f.key] === undefined).map((f) => f.label);
        return bad.length ? { error: `השדות האלה לא תקינים: ${bad.join(", ")}` } : { data };
      }}
    >
      {(value, set) => (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {BUSINESS_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint}>
              <Input
                dir={f.ltr ? "ltr" : "rtl"}
                value={value[f.key] ?? ""}
                placeholder={String(BUSINESS_DEFAULTS[f.key])}
                onChange={(e) => set({ [f.key]: e.target.value } as BusinessForm)}
                className={cn("fs-16", f.ltr && "text-left")}
              />
            </Field>
          ))}
        </div>
      )}
    </ContentEditor>
  );
}

/* ───────────── SEO of the fixed pages ───────────── */

/** The title and description the page shows right now, read from the live page itself. */
function useLiveSeo(path: string) {
  const [live, setLive] = useState<{ title: string; description: string } | null>(null);
  useEffect(() => {
    let alive = true;
    setLive(null);
    fetch(path, { cache: "no-store" })
      .then((r) => r.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        if (alive) setLive({ title: doc.title, description: doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "" });
      })
      .catch(() => alive && setLive({ title: "", description: "" }));
    return () => {
      alive = false;
    };
  }, [path]);
  return live;
}

function SeoEditor({ page, onPublished }: { page: SitePage; onPublished: () => void }) {
  const live = useLiveSeo(page.path);
  const [uploading, setUploading] = useState(false);
  return (
    <ContentEditor<SeoOverride>
      contentKey={seoKey(page.path)}
      title={`קידום בגוגל: ${page.label}`}
      intro="שדה ריק משאיר את מה שמופיע היום (באפור). הכתובת הקנונית והנתונים המובנים לא משתנים."
      onPublished={onPublished}
      prepare={(value) => {
        const data = compact({ ...value, title: value.title?.trim(), description: value.description?.trim(), image: value.image?.trim() });
        if (data.image && !/^https:\/\//.test(data.image)) return { error: "כתובת התמונה צריכה להתחיל ב-https://" };
        return { data };
      }}
    >
      {(value, set) => {
        const title = value.title || live?.title || "";
        const description = value.description || live?.description || "";
        return (
          <div className="flex flex-col gap-4">
            <Field label="כותרת בגוגל">
              <Input value={value.title ?? ""} placeholder={live?.title ?? "טוען…"} onChange={(e) => set({ title: e.target.value })} className="fs-16" />
              <Counter value={title} max={60} />
            </Field>
            <Field label="תיאור בגוגל">
              <Textarea rows={3} value={value.description ?? ""} placeholder={live?.description ?? "טוען…"} onChange={(e) => set({ description: e.target.value })} className="fs-16" />
              <Counter value={description} max={155} />
            </Field>
            <Field label="תמונת שיתוף (כשמשתפים את הדף בוואטסאפ ובפייסבוק)" hint="אופציונלי. מומלץ 1200 על 630.">
              <div className="flex flex-wrap items-center gap-3">
                <Input dir="ltr" value={value.image ?? ""} placeholder="https://…" onChange={(e) => set({ image: e.target.value })} className="max-w-120 text-left fs-15" />
                <label className="cursor-pointer rounded-md border border-border px-3 py-2 fs-14 font-medium text-foreground hover:border-foreground">
                  {uploading ? "מעלה…" : "העלאת תמונה"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        set({ image: await uploadCatalogImage(file, "site-seo") });
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
                {value.image && <img src={value.image} alt="" className="h-14 rounded border border-border object-cover" />}
              </div>
            </Field>
            <label className="flex cursor-pointer items-center gap-2.5 fs-15 text-foreground">
              <input type="checkbox" checked={value.noindex === true} onChange={(e) => set({ noindex: e.target.checked })} className="size-4 accent-primary" />
              <span>
                <b>להסתיר מגוגל</b>: הדף לא יופיע בתוצאות החיפוש ויוצא מה-sitemap. לשימוש רק לדפים שלא רוצים שיימצאו.
              </span>
            </label>
            <div className="rounded-md border border-border bg-background px-4 py-3" dir="rtl">
              <span className="block fs-13 text-foreground/60">כך זה ייראה בגוגל (בערך)</span>
              <span className="mt-1 block truncate fs-13 text-[#1a0dab]/80" dir="ltr">{decodeURI(page.url)}</span>
              <span className="block truncate fs-18 text-[#1a0dab]">{title || "—"}</span>
              <span className="line-clamp-2 fs-14 text-foreground/80">{description || "—"}</span>
            </div>
          </div>
        );
      }}
    </ContentEditor>
  );
}

function SeoSection() {
  const [path, setPath] = useState(SITE_PAGES[0].path);
  const [status, setStatus] = useState<{ published: Set<string>; drafts: Set<string> } | null>(null);
  const refresh = () => loadStatus("seo:").then(setStatus).catch(() => setStatus(null));
  useEffect(() => {
    void refresh();
  }, []);
  const page = SITE_PAGES.find((p) => p.path === path) ?? SITE_PAGES[0];
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="דפים" className="flex flex-col gap-1 self-start rounded-lg border border-border bg-card p-2">
        {SITE_PAGES.map((p) => {
          const key = seoKey(p.path);
          return (
            <button
              key={p.path}
              type="button"
              onClick={() => setPath(p.path)}
              className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-right fs-15", p.path === path ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")}
            >
              <span>{p.label}</span>
              {status?.drafts.has(key) ? <span className="fs-12">טיוטה</span> : status?.published.has(key) ? <span className="fs-12">✓</span> : null}
            </button>
          );
        })}
      </nav>
      <SeoEditor key={page.path} page={page} onPublished={refresh} />
    </div>
  );
}

/* ───────────── Main switch ───────────── */

function SettingsSection() {
  return (
    <ContentEditor<{ overrides_enabled?: boolean | string }>
      contentKey={SETTINGS_KEY}
      title="מתג ראשי"
      intro="כשהמתג כבוי, האתר מציג את התוכן המקורי מהקוד ומתעלם מכל מה שנערך כאן (פרטי העסק, קידום בגוגל וכל אזור עתידי). לשימוש במקרה חירום."
      prepare={(value) => ({ data: { overrides_enabled: value.overrides_enabled !== false } })}
    >
      {(value, set) => (
        <label className="flex cursor-pointer items-center gap-2.5 fs-16 text-foreground">
          <input type="checkbox" checked={value.overrides_enabled !== false} onChange={(e) => set({ overrides_enabled: e.target.checked })} className="size-4.5 accent-primary" />
          <span>להשתמש בתוכן שנערך בפאנל</span>
        </label>
      )}
    </ContentEditor>
  );
}

/* ───────────── The screen ───────────── */

const TABS = [
  { key: "business", label: "פרטי העסק" },
  { key: "seo", label: "קידום בגוגל (SEO)" },
  { key: "settings", label: "מתג ראשי" },
] as const;

/** "תוכן האתר": what visitors read, edited as drafts and published on demand. More areas join in the next stage. */
export function SiteContentAdmin() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("business");
  return (
    <div className="text-right">
      <h1 className="fs-28 font-bold text-foreground">תוכן האתר</h1>
      <p className="mt-1 fs-15 text-foreground/70">כל שינוי נשמר כטיוטה, ומגיע לגולשים רק אחרי "פרסום". כל פרסום נשמר בהיסטוריה ואפשר לשחזר.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 fs-14 font-semibold transition-colors duration-160 ease-standard",
              tab === t.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === "business" && <BusinessSection />}
        {tab === "seo" && <SeoSection />}
        {tab === "settings" && <SettingsSection />}
      </div>
    </div>
  );
}
