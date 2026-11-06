import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { BUSINESS_DEFAULTS, cleanBusiness, type Business } from "../content/business";
import { SITE_PAGES, type SitePage } from "../content/pages";
import { BUSINESS_KEY, SETTINGS_KEY, seoKey, type SeoOverride } from "../content/site-content";
import { loadStatus } from "./content-db";
import { ContentEditor, Counter, Field, compact } from "./content-editor";
import { FooterSection, NavSection, PromoSection } from "./content-sections";
import { PageSections } from "./section-editor";
import { HOME_SECTIONS } from "../content/home";
import { uploadCatalogImage } from "./db";

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
  { key: "promo", label: "פס מבצעים" },
  { key: "nav", label: "תפריטים וקישורים" },
  { key: "footer", label: "פוטר" },
  { key: "home", label: "דף הבית" },
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
        {tab === "promo" && <PromoSection />}
        {tab === "nav" && <NavSection />}
        {tab === "footer" && <FooterSection />}
        {tab === "home" && <PageSections sections={HOME_SECTIONS} />}
        {tab === "seo" && <SeoSection />}
        {tab === "settings" && <SettingsSection />}
      </div>
    </div>
  );
}
