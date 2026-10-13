import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { InfoTab } from "../shop/catalog";
import { PRODUCT_TYPE_LABELS, db } from "./db";

const TYPES = Object.entries(PRODUCT_TYPE_LABELS) as [keyof typeof PRODUCT_TYPE_LABELS, string][];

/** The information tabs of the product pages (shipping, returns and so on): a title, a text, and which products show them. */
export function InfoTabsAdmin() {
  const [tabs, setTabs] = useState<InfoTab[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    db.from("info_tabs")
      .select("*")
      .order("sort_order")
      .then(({ data, error }) => (error ? setStatus(error.message) : setTabs((data ?? []) as InfoTab[])));
  }, []);

  if (!tabs) return <p className="fs-16 text-foreground">{status ?? "טוען…"}</p>;

  const set = (slug: string, patch: Partial<InfoTab>) => setTabs(tabs.map((t) => (t.slug === slug ? { ...t, ...patch } : t)));

  const save = async (tab: InfoTab) => {
    setBusy(tab.slug);
    setStatus(null);
    const { error } = await db
      .from("info_tabs")
      .update({ title: tab.title.trim(), body: tab.body.trim(), product_types: tab.product_types, sort_order: Number(tab.sort_order) || 0 })
      .eq("slug", tab.slug);
    setBusy(null);
    setStatus(error ? `השמירה נכשלה: ${error.message}` : `"${tab.title}" נשמר. השינוי מופיע באתר מיד.`);
  };

  return (
    <div className="text-right">
      <h1 className="fs-28 font-bold text-foreground">לשוניות מידע</h1>
      <p className="mt-1 fs-15 text-foreground/70">הטקסטים שמופיעים בדף המוצר ליד התיאור: משלוחים, החזרות וכדומה. שורה ריקה בין פסקאות.</p>
      {status && <p className="mt-4 rounded-md border border-border bg-card px-4 py-3 fs-15 font-semibold text-foreground">{status}</p>}

      <div className="mt-5 flex flex-col gap-5">
        {tabs.map((tab) => (
          <section key={tab.slug} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_8rem]">
              <label className="flex flex-col gap-1.5">
                <span className="fs-15 font-semibold text-foreground">כותרת הלשונית</span>
                <Input value={tab.title} onChange={(e) => set(tab.slug, { title: e.target.value })} className="fs-17 font-semibold" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="fs-15 font-semibold text-foreground">סדר</span>
                <Input dir="ltr" inputMode="numeric" value={tab.sort_order} onChange={(e) => set(tab.slug, { sort_order: e.target.value as unknown as number })} className="text-center fs-15" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="fs-15 font-semibold text-foreground">הטקסט</span>
              <Textarea rows={8} value={tab.body} onChange={(e) => set(tab.slug, { body: e.target.value })} className="fs-16" />
            </label>
            <div className="flex flex-col gap-2">
              <span className="fs-15 font-semibold text-foreground">מופיע בדפי</span>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(([key, label]) => {
                  const on = tab.product_types.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set(tab.slug, { product_types: on ? tab.product_types.filter((t) => t !== key) : [...tab.product_types, key] })}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1 fs-14 font-medium transition-colors duration-160 ease-standard",
                        on ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-foreground hover:border-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="button" size="sm" disabled={busy === tab.slug} className="self-start" onClick={() => save(tab)}>
              {busy === tab.slug ? "רגע…" : "שמירה"}
            </Button>
          </section>
        ))}
      </div>
    </div>
  );
}
