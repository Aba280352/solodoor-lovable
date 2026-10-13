import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { formatPrice, type Application, type RugSize } from "../shop/catalog";
import { db } from "./db";
import { SYNC_NOT_CONFIGURED, syncProduct } from "./shopify-sync";

/**
 * The prices that are shared by many products: what a metre or a door side of any wallpaper costs on
 * each surface, and the rug sizes. A change here is followed by a sync of every product it touches.
 */
export function PricesPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [sizes, setSizes] = useState<RugSize[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: string[] } | null>(null);

  useEffect(() => {
    Promise.all([db.from("applications").select("*").order("sort_order"), db.from("rug_sizes").select("*").order("sort_order")]).then(([a, s]) => {
      setApplications((a.data ?? []) as Application[]);
      setSizes((s.data ?? []) as RugSize[]);
    });
  }, []);

  if (!applications || !sizes) return <p className="fs-16 text-foreground">טוען…</p>;

  const setApp = (slug: string, unit_price: number) => setApplications(applications.map((a) => (a.slug === slug ? { ...a, unit_price } : a)));
  const setSize = (key: string, price: number) => setSizes(sizes.map((s) => (s.size_key === key ? { ...s, price } : s)));

  /** Syncs the given products one after the other, with a progress count. */
  const syncAll = async (handles: string[]) => {
    const failed: string[] = [];
    setProgress({ done: 0, total: handles.length, failed });
    for (const [i, handle] of handles.entries()) {
      const result = await syncProduct(handle);
      if (!result.ok) {
        if (result.message === SYNC_NOT_CONFIGURED) {
          setProgress(null);
          setStatus("Shopify עדיין לא מחובר לפאנל: חסר הסוד SHOPIFY_CLIENT_SECRET בהגדרות Lovable Cloud. המחירים נשמרו באתר בלבד.");
          return;
        }
        failed.push(`${handle}: ${result.message}`);
      }
      setProgress({ done: i + 1, total: handles.length, failed: [...failed] });
    }
    setStatus(failed.length ? `הסנכרון הסתיים, ${failed.length} מוצרים נכשלו.` : "כל המוצרים סונכרנו ל-Shopify.");
  };

  const save = async (what: "applications" | "sizes") => {
    setBusy(true);
    setStatus(null);
    setProgress(null);
    if (what === "applications") {
      const results = await Promise.all(
        applications.map((a) => {
          const unit_price = Number(a.unit_price) || 0;
          // A door side is two metres of material; the per-metre figure follows the unit price.
          const price_per_meter = a.sell_unit === "meter" ? unit_price : Math.round((unit_price / (a.unit_length_cm / 100)) * 100) / 100;
          return db.from("applications").update({ unit_price, price_per_meter }).eq("slug", a.slug);
        }),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setStatus(`השמירה נכשלה: ${failed.error.message}`);
        setBusy(false);
        return;
      }
      const { data } = await db.from("products").select("handle").eq("product_type", "wallpaper").order("sort_order");
      await syncAll(((data ?? []) as { handle: string }[]).map((p) => p.handle));
    } else {
      const results = await Promise.all(sizes.map((s) => db.from("rug_sizes").update({ price: Number(s.price) || 0 }).eq("size_key", s.size_key)));
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setStatus(`השמירה נכשלה: ${failed.error.message}`);
        setBusy(false);
        return;
      }
      const { data } = await db.from("products").select("handle").eq("product_type", "pvc_rug").order("sort_order");
      await syncAll(((data ?? []) as { handle: string }[]).map((p) => p.handle));
    }
    setBusy(false);
  };

  const syncEverything = async () => {
    setBusy(true);
    setStatus(null);
    const { data } = await db.from("products").select("handle").order("product_type").order("sort_order");
    await syncAll(((data ?? []) as { handle: string }[]).map((p) => p.handle));
    setBusy(false);
  };

  return (
    <div className="text-right">
      <h1 className="fs-28 font-bold text-foreground">מחירים</h1>
      <p className="mt-1 fs-15 text-foreground/70">מחירים שחלים על הרבה מוצרים בבת אחת. כל המחירים כוללים מע"מ. אחרי שמירה הפאנל מעדכן את כל המוצרים הנוגעים ב-Shopify, וזה לוקח כמה דקות.</p>

      {status && <p className="mt-4 rounded-md border border-border bg-card px-4 py-3 fs-15 font-semibold text-foreground">{status}</p>}
      {progress && (
        <div className="mt-4 rounded-md border border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between fs-14 text-foreground">
            <span>מעדכן את Shopify…</span>
            <span dir="ltr">
              {progress.done} / {progress.total}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-track">
            <div className="h-full bg-secondary transition-[width] duration-240 ease-standard" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
          </div>
          {progress.failed.map((f) => (
            <p key={f} className="mt-2 fs-13 font-semibold text-destructive">
              {f}
            </p>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <h2 className="fs-17 font-bold text-foreground">טפטים: מחיר לפי משטח</h2>
          <p className="fs-13 leading-[1.5] text-foreground/70">המחיר של כל טפט על המשטח, אלא אם לדגם מסוים נקבע מחיר שונה בעמוד שלו. 10 ס"מ עולים עשירית מהמחיר למטר.</p>
          <ul className="flex flex-col divide-y divide-border">
            {applications.map((a) => (
              <li key={a.slug} className="flex items-center justify-between gap-4 py-3">
                <span className="flex flex-col">
                  <span className="fs-16 font-semibold text-foreground">{a.label}</span>
                  <span className="fs-13 text-foreground/70">{a.sell_unit === "meter" ? "למטר אורך" : "לצד אחד של דלת"}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="fs-15 text-foreground">₪</span>
                  <Input dir="ltr" inputMode="decimal" value={a.unit_price} onChange={(e) => setApp(a.slug, e.target.value as unknown as number)} className="w-28 text-center fs-16 font-semibold" />
                </span>
              </li>
            ))}
          </ul>
          <Button type="button" disabled={busy} className="self-start px-6 py-3 fs-15" onClick={() => save("applications")}>
            שמירה ועדכון כל הטפטים ב-Shopify
          </Button>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <h2 className="fs-17 font-bold text-foreground">שטיחי PVC: מחיר לפי מידה</h2>
          <p className="fs-13 leading-[1.5] text-foreground/70">המידות והמחירים משותפים לכל השטיחים.</p>
          <ul className="flex flex-col divide-y divide-border">
            {sizes.map((s) => (
              <li key={s.size_key} className="flex items-center justify-between gap-4 py-3">
                <span className="fs-16 font-semibold text-foreground" dir="ltr">
                  {s.width_cm}×{s.length_cm} ס"מ
                </span>
                <span className="flex items-center gap-2">
                  <span className="fs-15 text-foreground">₪</span>
                  <Input dir="ltr" inputMode="decimal" value={s.price} onChange={(e) => setSize(s.size_key, e.target.value as unknown as number)} className="w-28 text-center fs-16 font-semibold" />
                </span>
              </li>
            ))}
          </ul>
          <Button type="button" disabled={busy} className="self-start px-6 py-3 fs-15" onClick={() => save("sizes")}>
            שמירה ועדכון כל השטיחים ב-Shopify
          </Button>
        </section>
      </div>

      <section className={cn("mt-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-5")}>
        <h2 className="fs-17 font-bold text-foreground">סנכרון מלא</h2>
        <p className="fs-13 leading-[1.5] text-foreground/70">
          עובר על כל {""}המוצרים ומוודא ש-Shopify תואם לאתר: שמות, תיאורים, מחירים, תמונה ראשית והצגה. שימושי אחרי שינויים ישירים ב-Shopify. המחיר הנוכחי של דלת: {formatPrice(applications.find((a) => a.slug === "door")?.unit_price ?? 0)} לצד.
        </p>
        <Button type="button" variant="outline" disabled={busy} className="self-start px-6 py-3 fs-15" onClick={syncEverything}>
          סנכרון כל המוצרים ל-Shopify
        </Button>
      </section>
    </div>
  );
}
