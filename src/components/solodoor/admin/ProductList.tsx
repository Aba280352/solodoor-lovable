import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { catalogImage, fetchShop, formatPrice, type ProductType, type ShopItem } from "../shop/catalog";
import { PRODUCT_TYPE_LABELS, createProduct, db, type AdminProduct, type SyncState } from "./db";
import { syncLabel } from "./shopify-sync";

const TABS: { key: ProductType | "all"; label: string }[] = [
  { key: "all", label: "הכול" },
  { key: "wallpaper", label: "טפטים" },
  { key: "designed_door", label: "טפטים מעוצבים לדלת" },
  { key: "pvc_rug", label: "שטיחי PVC" },
];

/**
 * A new product: its kind, name and English id. It starts hidden, with empty photos, and opens in the
 * editor; Shopify learns about it on the first save there.
 */
function NewProductForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [type, setType] = useState<ProductType>("wallpaper");
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!title.trim()) {
      setError("צריך שם למוצר.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createProduct(type, title, handle);
      navigate({ to: "/admin/products/$handle", params: { handle: created } });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const prefix = type === "designed_door" ? "door-" : type === "pvc_rug" ? "rug-" : "";
  return (
    <section className="mt-5 flex flex-col gap-4 rounded-lg border border-secondary bg-card p-5">
      <h2 className="fs-17 font-bold text-foreground">מוצר חדש</h2>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={type === key}
            onClick={() => setType(key)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 fs-15 font-medium transition-colors duration-160 ease-standard",
              type === key ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:border-foreground",
            )}
          >
            {PRODUCT_TYPE_LABELS[key]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="fs-15 font-semibold text-foreground">שם המוצר (בעברית)</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "wallpaper" ? "למשל: ירוק זית" : type === "designed_door" ? "למשל: ונציה" : "למשל: שלווה"} className="fs-17 font-semibold" />
          <span className="fs-13 text-foreground/70">זה גם שם הדף באתר: /product/{title.trim() || "…"}</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="fs-15 font-semibold text-foreground">מזהה באנגלית</span>
          <Input dir="ltr" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder={type === "wallpaper" ? "olive-green" : type === "designed_door" ? "venice" : "40"} className="text-left fs-15" />
          <span className="fs-13 text-foreground/70">
            אותיות קטנות, ספרות ומקפים. משמש ב-Shopify ובתמונות, ואי אפשר לשנות אחר כך{prefix ? `. יתווסף לפניו "${prefix}"` : ""}.
          </span>
        </label>
      </div>
      {error && <p className="rounded-md border border-destructive bg-destructive/8 px-3.5 py-3 fs-15 font-bold text-destructive">{error}</p>}
      <p className="fs-13 leading-[1.5] text-foreground/70">המוצר נוצר מוסתר. אחרי שתמלאו תמונות, תיאור ומחיר ותסמנו "מוצג בחנות", השמירה תיצור אותו גם ב-Shopify עם כל הווריאנטים והדוגמית.</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={create}>
          {busy ? "רגע…" : "יצירה ומעבר לעריכה"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          ביטול
        </Button>
      </div>
    </section>
  );
}

/** Every product, shown or hidden, with its cover photo, price, state and the last Shopify sync. */
export function ProductList() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [covers, setCovers] = useState<Record<string, ShopItem>>({});
  const [syncs, setSyncs] = useState<Record<string, SyncState>>({});
  const [tab, setTab] = useState<ProductType | "all">("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const [{ data, error }, shop, { data: syncRows }] = await Promise.all([
      db.from("products").select("*").order("product_type").order("sort_order"),
      fetchShop(),
      db.from("shopify_sync").select("*"),
    ]);
    if (error) {
      setError(error.message);
      return;
    }
    setProducts((data ?? []) as AdminProduct[]);
    setCovers(Object.fromEntries(shop.items.map((item) => [item.handle, item])));
    setSyncs(Object.fromEntries(((syncRows ?? []) as SyncState[]).map((s) => [s.handle, s])));
  };

  useEffect(() => {
    load();
  }, []);

  const q = query.trim();
  const shown = (products ?? []).filter(
    (p) => (tab === "all" || p.product_type === tab) && (!q || p.title.includes(q) || p.slug.includes(q) || p.handle.includes(q)),
  );

  /** Swaps the order of a product with its neighbour of the same type, so the shop shows them the other way round. */
  const move = async (product: AdminProduct, direction: -1 | 1) => {
    if (!products) return;
    const siblings = products.filter((p) => p.product_type === product.product_type);
    const i = siblings.findIndex((p) => p.handle === product.handle);
    const other = siblings[i + direction];
    if (!other) return;
    // Equal orders would not swap, so the pair is renumbered by position.
    const a = Math.min(product.sort_order, other.sort_order);
    const b = Math.max(product.sort_order, other.sort_order);
    const [first, second] = direction === -1 ? [product, other] : [other, product];
    const [firstOrder, secondOrder] = a === b ? [a, a + 1] : [a, b];
    const results = await Promise.all([
      db.from("products").update({ sort_order: firstOrder }).eq("handle", first.handle),
      db.from("products").update({ sort_order: secondOrder }).eq("handle", second.handle),
    ]);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      setError(failed.error.message);
      return;
    }
    setProducts(
      products
        .map((p) => (p.handle === first.handle ? { ...p, sort_order: firstOrder } : p.handle === second.handle ? { ...p, sort_order: secondOrder } : p))
        .sort((x, y) => x.product_type.localeCompare(y.product_type) || x.sort_order - y.sort_order),
    );
  };

  const price = (p: AdminProduct) => {
    const item = covers[p.handle];
    if (p.product_type === "pvc_rug") return "לפי מידה";
    return formatPrice(item?.base_price ?? p.base_price);
  };

  return (
    <div className="text-right">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="fs-28 font-bold text-foreground">מוצרים</h1>
          {products && (
            <p className="mt-1 fs-15 text-foreground/70">
              {products.length} מוצרים, {products.filter((p) => !p.is_active).length} מוסתרים
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש לפי שם או כתובת" className="w-full fs-15 lg:w-72" />
          <Button type="button" className="flex-none px-5 py-3 fs-15" onClick={() => setCreating(true)}>
            <Icon name="Plus" size={14} />
            <span>מוצר חדש</span>
          </Button>
        </div>
      </div>

      {creating && <NewProductForm onClose={() => setCreating(false)} />}

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 fs-15 font-medium transition-colors duration-160 ease-standard",
              tab === t.key ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:border-foreground",
            )}
          >
            {t.label}
            {products && <span className="ms-1.5 fs-13 opacity-70">{t.key === "all" ? products.length : products.filter((p) => p.product_type === t.key).length}</span>}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-md border border-destructive bg-destructive/8 px-3.5 py-3 fs-15 font-bold text-destructive">{error}</p>}

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        {products === null ? (
          <p className="px-5 py-8 fs-16 text-foreground">טוען…</p>
        ) : shown.length === 0 ? (
          <p className="px-5 py-8 fs-16 text-foreground">אין מוצרים להצגה.</p>
        ) : (
          <ul>
            {shown.map((product) => {
              const cover = catalogImage(covers[product.handle]?.cover);
              const sync = syncs[product.handle];
              return (
                <li key={product.handle} className="flex items-center gap-4 border-t border-border px-4 py-3 first:border-t-0 lg:px-5">
                  <span className="relative size-14 flex-none overflow-hidden rounded-md bg-muted">
                    {cover && <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />}
                  </span>
                  <span className="flex min-w-0 flex-auto flex-col gap-0.5">
                    <Link to="/admin/products/$handle" params={{ handle: product.handle }} className="truncate fs-17 font-semibold text-foreground hover:text-clay">
                      {product.title}
                    </Link>
                    <span className="truncate fs-14 text-foreground/70">
                      {PRODUCT_TYPE_LABELS[product.product_type]}
                      {product.style_family ? `, ${product.style_family}` : ""}
                      {" · "}
                      {price(product)}
                    </span>
                    <span className={cn("truncate fs-13", sync && !sync.ok ? "font-semibold text-destructive" : "text-foreground/60")}>
                      {syncLabel(sync?.ok, sync?.synced_at)}
                    </span>
                  </span>
                  {tab !== "all" && !q && (
                    <span className="hidden flex-none items-center gap-1 lg:flex" aria-label="סדר הצגה">
                      <button type="button" aria-label="להעלות" onClick={() => move(product, -1)} className="flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-muted">
                        <Icon name="AngleDown" size={14} style={{ transform: "rotate(180deg)" }} />
                      </button>
                      <button type="button" aria-label="להוריד" onClick={() => move(product, 1)} className="flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-muted">
                        <Icon name="AngleDown" size={14} />
                      </button>
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex-none rounded-full px-3 py-1 fs-13 font-semibold",
                      product.is_active ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {product.is_active ? "מוצג" : "מוסתר"}
                  </span>
                  <Link to="/product/$slug" params={{ slug: product.slug }} target="_blank" aria-label="צפייה באתר" className="hidden flex-none text-foreground hover:text-clay lg:inline-flex">
                    <Icon name="Expand" size={16} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {tab === "all" && <p className="mt-3 fs-14 text-foreground/70">כדי לשנות את סדר ההצגה בחנות, בחרו סוג מוצר למעלה: אז מופיעים חצים ליד כל מוצר.</p>}
    </div>
  );
}
