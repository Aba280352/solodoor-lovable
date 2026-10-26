import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { STOCK_LABELS, STYLE_FAMILIES, catalogImage, formatPrice, type StockStatus } from "../shop/catalog";
import { COLOR_FAMILIES } from "../shop/colors";
import {
  PRODUCT_TYPE_LABELS,
  db,
  fetchAdminProduct,
  shopifyTitle,
  uploadCatalogImage,
  type AdminProductApplication,
  type AdminProductData,
  type AdminProductImage,
  type AdminProductVariant,
} from "./db";
import { SYNC_NOT_CONFIGURED, syncLabel, syncProduct, type SyncResult } from "./shopify-sync";

const DESIGNED_STYLE = "מעוצב ודקורטיבי";

function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="fs-15 font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="fs-13 text-foreground/70">{hint}</span>}
    </label>
  );
}

function Card({ title, children, hint }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="fs-17 font-bold text-foreground">{title}</h2>
        {hint && <p className="fs-13 leading-[1.5] text-foreground/70">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** One photo with an upload button; the caller keeps the path. */
function ImageSlot({
  path,
  label,
  busy,
  onPick,
  onClear,
  wide,
}: {
  path: string | null;
  label: string;
  busy: boolean;
  onPick: (file: File) => void;
  onClear?: () => void;
  wide?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const src = catalogImage(path);
  return (
    <div className="flex flex-col gap-2">
      <span className="fs-14 font-semibold text-foreground">{label}</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className={cn("relative block cursor-pointer overflow-hidden rounded-md border border-border bg-muted", wide ? "aspect-[4/3]" : "aspect-square")}
        aria-label={`החלפת התמונה: ${label}`}
      >
        {src ? <img src={src} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="absolute inset-0 flex items-center justify-center fs-14 text-foreground/60">אין תמונה</span>}
        <span className="absolute inset-x-0 bottom-0 bg-foreground/70 py-1.5 text-center fs-13 font-medium text-background">{src ? "החלפה" : "העלאה"}</span>
      </button>
      {onClear && src && (
        <button type="button" onClick={onClear} className="self-start fs-13 font-medium text-clay">
          הסרה
        </button>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
    </div>
  );
}

/** Edits one product: its words, prices, photos and whether it is shown; then brings Shopify up to date. */
export function ProductEditor({ handle }: { handle: string }) {
  const [data, setData] = useState<AdminProductData | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [newGallery, setNewGallery] = useState<AdminProductImage[]>([]);
  // Door colours added in this visit: inserted on save, the rest are updated.
  const [newVariantKeys, setNewVariantKeys] = useState<string[]>([]);
  const galleryInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdminProduct(handle)
      .then((d) => (d ? setData(d) : setStatus("המוצר לא נמצא.")))
      .catch((e: Error) => setStatus(e.message));
  }, [handle]);

  if (!data) return <p className="fs-16 text-foreground">{status ?? "טוען…"}</p>;
  const { product, applications, productApplications, images, variants, rugSizes } = data;
  const isWallpaper = product.product_type === "wallpaper";
  const isDoor = product.product_type === "designed_door";
  const isRug = product.product_type === "pvc_rug";

  const setProduct = (patch: Partial<AdminProductData["product"]>) => setData({ ...data, product: { ...product, ...patch } });
  const setPa = (slug: string, patch: Partial<AdminProductApplication>) =>
    setData({ ...data, productApplications: productApplications.map((pa) => (pa.application_slug === slug ? { ...pa, ...patch } : pa)) });
  const setImage = (id: number, patch: Partial<AdminProductImage>) => setData({ ...data, images: images.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const setVariant = (key: string, patch: Partial<AdminProductVariant>) =>
    setData({ ...data, variants: variants.map((v) => (v.variant_key === key ? { ...v, ...patch } : v)) });

  const upload = async (file: File, apply: (url: string) => void) => {
    setBusy(true);
    setStatus(null);
    try {
      apply(await uploadCatalogImage(file, product.handle));
    } catch (e) {
      setStatus(`ההעלאה נכשלה: ${(e as Error).message}`);
    }
    setBusy(false);
  };

  const imageOf = (kind: AdminProductImage["kind"]) => images.find((i) => i.kind === kind);
  /** Keeps a swatch, roll or main photo: updates its row, or remembers a new one to insert on save. */
  const setKindImage = (kind: AdminProductImage["kind"], url: string | null) => {
    const existing = imageOf(kind);
    if (existing) setImage(existing.id, { image_path: url });
    else if (url) setData({ ...data, images: [...images, { id: -Date.now(), product_handle: product.handle, kind, sort_order: 0, image_path: url, alt: null }] });
  };

  const save = async () => {
    if (!product.title.trim() || !product.slug.trim()) {
      setStatus("צריך שם וכתובת.");
      return;
    }
    setBusy(true);
    setStatus(null);
    setSync(null);
    const row = {
      title: product.title.trim(),
      slug: product.slug.trim(),
      style_family: product.style_family || null,
      finish: product.finish?.trim() || null,
      material: product.material?.trim() || null,
      base_price: Number(product.base_price) || 0,
      short_description: product.short_description?.trim() || null,
      long_description: product.long_description?.trim() || null,
      roll_width_cm: product.roll_width_cm ? Number(product.roll_width_cm) : null,
      thickness_mm: product.thickness_mm ? Number(product.thickness_mm) : null,
      sample_available: product.sample_available,
      installation_available: product.installation_available,
      colors: product.colors,
      is_active: product.is_active,
      stock_status: product.stock_status ?? "in_stock",
      sort_order: Number(product.sort_order) || 0,
    };
    const results = [
      await db.from("products").update(row).eq("handle", product.handle),
      ...(await Promise.all(
        productApplications.map((pa) =>
          db
            .from("product_applications")
            .update({ image_path: pa.image_path, image_alt: pa.image_alt?.trim() || null, price_override: pa.price_override === null || pa.price_override === ("" as unknown) ? null : Number(pa.price_override), is_active: pa.is_active })
            .eq("product_handle", product.handle)
            .eq("application_slug", pa.application_slug),
        ),
      )),
      ...(await Promise.all(
        images
          .filter((i) => i.id > 0)
          .map((i) => db.from("product_images").update({ image_path: i.image_path, alt: i.alt?.trim() || null, sort_order: i.sort_order }).eq("id", i.id)),
      )),
      ...(await Promise.all(
        variants
          .filter((v) => !newVariantKeys.includes(v.variant_key))
          .map((v) =>
            db
              .from("product_variants")
              .update({ title: v.title.trim(), price: Number(v.price) || 0, color: v.color || null, image_path: v.image_path, sort_order: v.sort_order, is_active: v.is_active })
              .eq("product_handle", product.handle)
              .eq("variant_key", v.variant_key),
          ),
      )),
    ];
    const newVariants = variants.filter((v) => newVariantKeys.includes(v.variant_key));
    if (newVariants.some((v) => !v.title.trim())) {
      setBusy(false);
      setStatus("לכל גוון חדש צריך שם.");
      return;
    }
    if (newVariants.length) {
      results.push(
        await db.from("product_variants").insert(
          newVariants.map((v) => ({
            product_handle: product.handle,
            variant_key: v.variant_key,
            title: v.title.trim(),
            price: Number(v.price) || 0,
            color: v.color || null,
            image_path: v.image_path,
            sort_order: v.sort_order,
            is_active: v.is_active,
          })),
        ),
      );
    }
    const inserts = [...images.filter((i) => i.id < 0), ...newGallery].map(({ id: _id, ...rest }) => rest);
    if (inserts.length) results.push(await db.from("product_images").insert(inserts));
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      setBusy(false);
      setStatus(failed.error.message.includes("duplicate") ? "הכתובת הזו כבר שייכת למוצר אחר." : `השמירה נכשלה: ${failed.error.message}`);
      return;
    }
    setNewGallery([]);
    setNewVariantKeys([]);
    setStatus("נשמר באתר. מעדכן את Shopify…");
    const result = await syncProduct(product.handle);
    setSync(result);
    setStatus(result.ok ? "נשמר באתר ו-Shopify עודכן." : result.message === SYNC_NOT_CONFIGURED ? "נשמר באתר." : "נשמר באתר, אבל Shopify לא עודכן.");
    const fresh = await fetchAdminProduct(product.handle);
    if (fresh) setData(fresh);
    setBusy(false);
  };

  /** A new colour, numbered after the last one; it reaches Shopify on save. */
  const addVariant = () => {
    const next = Math.max(0, ...variants.map((v) => Number(v.variant_key.replace(/\D/g, "")) || 0)) + 1;
    const key = `v${next}`;
    setNewVariantKeys([...newVariantKeys, key]);
    setData({
      ...data,
      variants: [...variants, { product_handle: product.handle, variant_key: key, title: "", price: product.base_price, color: null, image_path: null, sort_order: next, is_active: true }],
    });
  };

  const removeNewVariant = (key: string) => {
    setNewVariantKeys(newVariantKeys.filter((k) => k !== key));
    setData({ ...data, variants: variants.filter((v) => v.variant_key !== key) });
  };

  const resync = async () => {
    setBusy(true);
    const result = await syncProduct(product.handle);
    setSync(result);
    const fresh = await fetchAdminProduct(product.handle);
    if (fresh) setData(fresh);
    setBusy(false);
  };

  const basePriceLabel = isWallpaper ? "מחיר בסיס (לא בשימוש בטפטים, המחיר נקבע לפי המשטח)" : isDoor ? "מחיר לצד אחד של דלת" : "מחיר (לא בשימוש בשטיחים, המחיר לפי מידה)";

  return (
    <div className="text-right">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="inline-flex items-center gap-1.5 fs-15 font-medium text-foreground hover:text-clay">
            <Icon name="AngleRight" size={12} />
            כל המוצרים
          </Link>
          <h1 className="fs-24 font-bold text-foreground">
            {PRODUCT_TYPE_LABELS[product.product_type]}: {product.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status && <span className="fs-14 text-foreground">{status}</span>}
          <Button asChild variant="outline" size="sm">
            <Link to="/product/$slug" params={{ slug: product.slug }} target="_blank">
              צפייה באתר
            </Link>
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={save}>
            {busy ? "רגע…" : "שמירה ועדכון Shopify"}
          </Button>
        </div>
      </div>

      {sync && (
        <div
          className={cn(
            "mt-4 flex flex-col gap-1 rounded-md border px-4 py-3 fs-14 leading-[1.5]",
            sync.ok ? "border-secondary bg-secondary/10 text-foreground" : "border-destructive bg-destructive/8 font-semibold text-destructive",
          )}
        >
          {sync.message === SYNC_NOT_CONFIGURED ? (
            <span>
              Shopify עדיין לא מחובר לפאנל: חסר הסוד SHOPIFY_CLIENT_SECRET בהגדרות Lovable Cloud. עד שהוא יתווסף, שינויים במחיר, בשם ובהצגה צריכים להיעשות גם ב-Shopify.
            </span>
          ) : (
            <>
              <span>{sync.message}</span>
              {sync.changes?.map((c) => (
                <span key={c} className="font-normal">
                  • {c}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-5">
          <Card title="שם ותיאור">
            <Field label="שם המוצר" hint={`ב-Shopify ובקופה המוצר ייקרא: ${shopifyTitle(product)}`}>
              <Input value={product.title} onChange={(e) => setProduct({ title: e.target.value })} className="fs-20 font-semibold" />
            </Field>
            <Field label="תיאור קצר" hint="משפט או שניים, מופיעים בראש דף המוצר ובכרטיס. באתר בלבד, לא נשלח ל-Shopify.">
              <Textarea rows={2} value={product.short_description ?? ""} onChange={(e) => setProduct({ short_description: e.target.value })} className="fs-16" />
            </Field>
            <Field label="תיאור מלא" hint="שורה ריקה בין פסקאות. התיאור הזה נשלח גם ל-Shopify.">
              <Textarea rows={8} value={product.long_description ?? ""} onChange={(e) => setProduct({ long_description: e.target.value })} className="fs-16" />
            </Field>
          </Card>

          {isWallpaper && (
            <Card title="משטחים: תמונה ומחיר לכל לשונית" hint="המחיר הרגיל של כל משטח נקבע בעמוד המחירים. כאן אפשר לתת לדגם הזה מחיר שונה במשטח מסוים, להחליף את ההדמיה או להסתיר לשונית.">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {applications.map((app) => {
                  const pa = productApplications.find((p) => p.application_slug === app.slug);
                  if (!pa) return null;
                  return (
                    <div key={app.slug} className={cn("flex flex-col gap-3 rounded-md border border-border p-3", !pa.is_active && "opacity-60")}>
                      <ImageSlot path={pa.image_path} label={app.label} busy={busy} wide onPick={(file) => upload(file, (url) => setPa(app.slug, { image_path: url }))} />
                      <Field label={`מחיר ${app.sell_unit === "meter" ? "למטר" : "לצד"}`} hint={`רגיל: ${formatPrice(app.unit_price)}`}>
                        <Input
                          dir="ltr"
                          inputMode="decimal"
                          value={pa.price_override ?? ""}
                          placeholder={String(app.unit_price)}
                          onChange={(e) => setPa(app.slug, { price_override: e.target.value === "" ? null : (e.target.value as unknown as number) })}
                          className="text-center fs-15"
                        />
                      </Field>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={pa.is_active} onChange={(e) => setPa(app.slug, { is_active: e.target.checked })} className="size-4 accent-[var(--color-secondary)]" />
                        <span className="fs-14 font-medium text-foreground">מוצג בלשונית</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {isDoor && (
            <Card title="גוונים" hint="כל גוון הוא תמונה ומחיר לצד אחד של דלת. גוון חדש נוצר ב-Shopify בשמירה.">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {variants.map((v) => (
                  <div key={v.variant_key} className={cn("flex flex-col gap-3 rounded-md border p-3", newVariantKeys.includes(v.variant_key) ? "border-secondary" : "border-border", !v.is_active && "opacity-60")}>
                    <ImageSlot path={v.image_path} label={v.title || "גוון חדש"} busy={busy} onPick={(file) => upload(file, (url) => setVariant(v.variant_key, { image_path: url }))} />
                    <Field label="שם הגוון">
                      <Input value={v.title} onChange={(e) => setVariant(v.variant_key, { title: e.target.value })} className="fs-15" />
                    </Field>
                    <Field label="מחיר לצד">
                      <Input dir="ltr" inputMode="decimal" value={v.price} onChange={(e) => setVariant(v.variant_key, { price: e.target.value as unknown as number })} className="text-center fs-15" />
                    </Field>
                    <div className="flex flex-col gap-1.5">
                      <span className="fs-14 font-semibold text-foreground">צבעים (לסינון)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_FAMILIES.map((family) => {
                          const picked = (v.color ?? "").split(",").filter(Boolean);
                          const on = picked.includes(family.key);
                          return (
                            <button
                              key={family.key}
                              type="button"
                              aria-pressed={on}
                              title={family.label}
                              onClick={() => setVariant(v.variant_key, { color: (on ? picked.filter((c) => c !== family.key) : [...picked, family.key]).join(",") || null })}
                              className={cn("size-6 cursor-pointer rounded-full border-2", on ? "border-foreground" : "border-border")}
                              style={{ background: family.fill }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={v.is_active} onChange={(e) => setVariant(v.variant_key, { is_active: e.target.checked })} className="size-4 accent-[var(--color-secondary)]" />
                      <span className="fs-14 font-medium text-foreground">מוצג</span>
                    </label>
                    {newVariantKeys.includes(v.variant_key) && (
                      <button type="button" onClick={() => removeNewVariant(v.variant_key)} className="self-start fs-13 font-medium text-clay">
                        ביטול הגוון החדש
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" disabled={busy} className="self-start" onClick={addVariant}>
                <Icon name="Plus" size={13} />
                <span>הוספת גוון</span>
              </Button>
            </Card>
          )}

          {isRug && (
            <Card title="תמונות" hint="התמונה הראשית מופיעה בחנות ובקופה; תמונות הגלריה בדף המוצר.">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <ImageSlot path={imageOf("main")?.image_path ?? null} label="תמונה ראשית" busy={busy} onPick={(file) => upload(file, (url) => setKindImage("main", url))} />
                {[...images.filter((i) => i.kind === "gallery"), ...newGallery].map((i) => (
                  <ImageSlot
                    key={i.id}
                    path={i.image_path}
                    label="גלריה"
                    busy={busy}
                    onPick={(file) => upload(file, (url) => (i.id > 0 ? setImage(i.id, { image_path: url }) : setNewGallery(newGallery.map((g) => (g.id === i.id ? { ...g, image_path: url } : g)))))}
                    onClear={() => (i.id > 0 ? setImage(i.id, { image_path: null }) : setNewGallery(newGallery.filter((g) => g.id !== i.id)))}
                  />
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" disabled={busy} className="self-start" onClick={() => galleryInput.current?.click()}>
                הוספת תמונה לגלריה
              </Button>
              <input
                ref={galleryInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  upload(file, (url) =>
                    setNewGallery((g) => [...g, { id: -Date.now(), product_handle: product.handle, kind: "gallery", sort_order: images.length + g.length + 1, image_path: url, alt: null }]),
                  );
                  e.target.value = "";
                }}
              />
              <p className="fs-14 text-foreground/70">
                מחירי השטיחים לפי מידה: {rugSizes.map((s) => `${s.width_cm}×${s.length_cm} ${formatPrice(s.price)}`).join(", ")}. עורכים אותם בעמוד המחירים, והם חלים על כל השטיחים.
              </p>
            </Card>
          )}

          {isWallpaper && (
            <Card title="דוגמת גוון וגליל" hint="דוגמת הגוון השטוחה משמשת בעמודי הסגנון ובדוגמית; תמונת הגליל מופיעה במעבר עכבר.">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <ImageSlot path={imageOf("swatch")?.image_path ?? null} label="דוגמת גוון" busy={busy} onPick={(file) => upload(file, (url) => setKindImage("swatch", url))} />
                <ImageSlot path={imageOf("roll")?.image_path ?? null} label="גליל" busy={busy} onPick={(file) => upload(file, (url) => setKindImage("roll", url))} />
              </div>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          <Card title="הצגה באתר">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={product.is_active} onChange={(e) => setProduct({ is_active: e.target.checked })} className="size-4 accent-[var(--color-secondary)]" />
              <span className="fs-15 font-semibold text-foreground">מוצג בחנות</span>
            </label>
            <p className="fs-13 leading-[1.5] text-foreground/70">מוצר מוסתר נעלם מהחנות ומהחיפוש, ובשופיפיי עובר לטיוטה, כך שאי אפשר לשלם עליו.</p>
            {isWallpaper && (
              <div className="flex flex-col gap-2">
                <span className="fs-15 font-semibold text-foreground">מלאי</span>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="מלאי">
                  {(Object.keys(STOCK_LABELS) as StockStatus[]).map((value) => {
                    const on = (product.stock_status ?? "in_stock") === value;
                    const option = { value, label: STOCK_LABELS[value] };
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setProduct({ stock_status: option.value })}
                        className={cn(
                          "cursor-pointer rounded-md border px-3 py-2.5 fs-14 font-semibold",
                          on ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="fs-13 leading-[1.5] text-foreground/70">מופיע בדף המוצר. במלאי מוגבל אפשר להזמין, עם הערה שזמן האספקה עשוי להתארך. כשאין במלאי אי אפשר להוסיף לסל, ובמקום זה מופיע כפתור לבירור זמינות בווצאפ. דוגמית אפשר להזמין תמיד.</p>
              </div>
            )}
            <Field label="סדר הצגה" hint="מספר נמוך מופיע ראשון. אפשר גם לסדר בחצים ברשימת המוצרים.">
              <Input dir="ltr" inputMode="numeric" value={product.sort_order} onChange={(e) => setProduct({ sort_order: e.target.value as unknown as number })} className="text-center fs-15" />
            </Field>
            <Field label="כתובת הדף" hint="שינוי הכתובת שובר קישורים קיימים ופוגע בקידום. לשנות רק אם חייבים.">
              <Input value={product.slug} onChange={(e) => setProduct({ slug: e.target.value })} className="fs-15" />
            </Field>
          </Card>

          <Card title="סגנון וצבעים" hint="לפי אלה החנות מסננת.">
            {isWallpaper ? (
              <Field label="סגנון">
                <select value={product.style_family ?? ""} onChange={(e) => setProduct({ style_family: e.target.value || null })} className="w-full rounded-md border border-input bg-card p-3 fs-15 text-foreground">
                  <option value="">בלי סגנון</option>
                  {STYLE_FAMILIES.map((s) => (
                    <option key={s.key} value={s.label}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            ) : isDoor ? (
              <p className="fs-14 text-foreground/70">סגנון: {DESIGNED_STYLE}</p>
            ) : null}
            {!isRug && (
              <div className="flex flex-col gap-2">
                <span className="fs-15 font-semibold text-foreground">משפחות צבע</span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_FAMILIES.map((family) => {
                    const on = product.colors.includes(family.key);
                    return (
                      <button
                        key={family.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setProduct({ colors: on ? product.colors.filter((c) => c !== family.key) : [...product.colors, family.key] })}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-full border py-1 ps-1.5 pe-3 fs-14 font-medium",
                          on ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground",
                        )}
                      >
                        <span className="size-5 rounded-full border border-border" style={{ background: family.fill }} />
                        {family.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <Field label="גימור">
              <Input value={product.finish ?? ""} onChange={(e) => setProduct({ finish: e.target.value })} className="fs-15" />
            </Field>
            <Field label="חומר">
              <Input value={product.material ?? ""} onChange={(e) => setProduct({ material: e.target.value })} className="fs-15" />
            </Field>
          </Card>

          <Card title="מחיר ואפשרויות">
            <Field label={basePriceLabel}>
              <Input dir="ltr" inputMode="decimal" value={product.base_price} onChange={(e) => setProduct({ base_price: e.target.value as unknown as number })} className="text-center fs-15" />
            </Field>
            {!isRug && (
              <>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={product.sample_available} onChange={(e) => setProduct({ sample_available: e.target.checked })} className="size-4 accent-[var(--color-secondary)]" />
                  <span className="fs-15 font-medium text-foreground">אפשר להזמין דוגמית</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={product.installation_available} onChange={(e) => setProduct({ installation_available: e.target.checked })} className="size-4 accent-[var(--color-secondary)]" />
                  <span className="fs-15 font-medium text-foreground">אפשר להזמין התקנה (לדלתות)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Field label='רוחב גליל (ס"מ)'>
                    <Input dir="ltr" inputMode="decimal" value={product.roll_width_cm ?? ""} onChange={(e) => setProduct({ roll_width_cm: e.target.value as unknown as number })} className="text-center fs-15" />
                  </Field>
                  <Field label='עובי (מ"מ)'>
                    <Input dir="ltr" inputMode="decimal" value={product.thickness_mm ?? ""} onChange={(e) => setProduct({ thickness_mm: e.target.value as unknown as number })} className="text-center fs-15" />
                  </Field>
                </div>
              </>
            )}
          </Card>

          <Card title="Shopify" hint="הקופה והתשלום עוברים דרך Shopify. כל שמירה מעדכנת שם את השם, התיאור, המחירים, התמונה הראשית והאם המוצר למכירה.">
            <p className={cn("fs-14", data.sync && !data.sync.ok ? "font-semibold text-destructive" : "text-foreground")}>{syncLabel(data.sync?.ok, data.sync?.synced_at)}</p>
            {data.sync?.message && data.sync.message !== SYNC_NOT_CONFIGURED && <p className="fs-13 leading-[1.5] text-foreground/70">{data.sync.message}</p>}
            <Button type="button" variant="outline" size="sm" disabled={busy} className="self-start" onClick={resync}>
              סנכרון עכשיו
            </Button>
            <p className="fs-13 leading-[1.5] text-foreground/70">מזהה המוצר ב-Shopify: {product.handle}</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
