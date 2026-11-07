/** Form controls of the content screens: image with upload, repeating list, YouTube link. */
import { useEffect, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";

import { uploadCatalogImage } from "./db";

/** An image: current one (or the original, greyed), upload a replacement, or paste a link; "back to original" clears it. */
export function ImageField({ value, original, onChange, folder = "site" }: { value?: string; original?: string; onChange: (url: string | undefined) => void; folder?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shown = value || original;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="size-20 flex-none overflow-hidden rounded-md border border-border bg-muted">
        {shown && <img src={shown} alt="" className={value ? "size-full object-cover" : "size-full object-cover opacity-60"} />}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 fs-14 font-medium text-foreground hover:border-foreground">
            {busy ? "מעלה…" : value ? "החלפת תמונה" : "העלאת תמונה חדשה"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setError(null);
                try {
                  // Shrunk to WebP with phone-size copies, so it never slows the page down (see image-tools).
                  onChange(await uploadCatalogImage(file, folder, { responsive: true }));
                } catch (err) {
                  setError(`ההעלאה נכשלה: ${(err as Error).message}`);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {value && (
            <button type="button" onClick={() => onChange(undefined)} className="cursor-pointer fs-14 text-foreground/70 hover:text-clay">
              חזרה לתמונה המקורית
            </button>
          )}
        </div>
        {!value && original && <span className="fs-13 text-foreground/60">מוצגת התמונה המקורית</span>}
        {error && <span className="fs-13 font-medium text-clay">{error}</span>}
      </div>
    </div>
  );
}

/** A repeating list: each row rendered by `children`, with move up/down, remove, and "add". */
export function ListEditor<T>({
  items,
  onChange,
  newItem,
  max = 30,
  addLabel = "הוספה",
  summary,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  max?: number;
  addLabel?: string;
  /** When given, rows are folded to this one line and open one at a time (like Elementor's repeater). */
  summary?: (item: T, index: number) => string;
  children: (item: T, set: (patch: Partial<T>) => void, index: number) => ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (i: number, d: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  const btn = "inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border fs-14 text-foreground hover:border-foreground disabled:cursor-default disabled:opacity-30";
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} data-item={i} className="flex gap-3 rounded-md border border-border bg-background p-3">
          <div className="min-w-0 flex-1">
            {summary && (
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full cursor-pointer items-center justify-between gap-2 text-right fs-15 font-medium text-foreground">
                <span className="min-w-0 truncate">{summary(item, i) || `${addLabel} ${i + 1}`}</span>
                <span aria-hidden="true" className="flex-none text-foreground/50">{open === i ? "▴" : "▾"}</span>
              </button>
            )}
            {(!summary || open === i) && <div className={summary ? "mt-3" : ""}>{children(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}</div>}
          </div>
          <div className="flex flex-none flex-col gap-1.5">
            <button type="button" aria-label="למעלה" disabled={i === 0} onClick={() => move(i, -1)} className={btn}>
              ↑
            </button>
            <button type="button" aria-label="למטה" disabled={i === items.length - 1} onClick={() => move(i, 1)} className={btn}>
              ↓
            </button>
            <button type="button" aria-label="מחיקה" onClick={() => window.confirm("למחוק את הפריט הזה?") && onChange(items.filter((_, j) => j !== i))} className={btn}>
              ✕
            </button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => { onChange([...items, newItem()]); setOpen(items.length); }} className="cursor-pointer self-start rounded-md border border-dashed border-primary px-4 py-2 fs-14 font-medium text-foreground hover:bg-muted">
          + {addLabel}
        </button>
      )}
    </div>
  );
}

/** The video id in any common YouTube link (watch, youtu.be, shorts, embed), or null. */
export function youtubeId(link: string): string | null {
  const s = link.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export interface VideoValue {
  id?: string;
  title?: string;
  poster?: string;
}

/** Paste a YouTube link: the id and cover are taken from it automatically, the title too when YouTube answers. */
export function YouTubeField({ value, original, onChange }: { value?: VideoValue; original?: VideoValue; onChange: (v: VideoValue | undefined) => void }) {
  const [link, setLink] = useState(value?.id ? `https://youtu.be/${value.id}` : "");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setLink(value?.id ? `https://youtu.be/${value.id}` : ""), [value?.id]);
  const shown = value?.id ? value : original;
  const apply = async (raw: string) => {
    setLink(raw);
    if (!raw.trim()) return;
    const id = youtubeId(raw);
    if (!id) {
      setError("זה לא נראה כמו קישור ליוטיוב");
      return;
    }
    setError(null);
    let title = value?.title;
    try {
      const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
      if (r.ok) title = ((await r.json()) as { title?: string }).title ?? title;
    } catch {
      // YouTube did not answer the browser; the title can be typed by hand.
    }
    onChange({ id, title, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` });
  };
  return (
    <div className="flex flex-col gap-2">
      <Input dir="ltr" value={link} placeholder={original?.id ? `https://youtu.be/${original.id}` : "הדביקו קישור מיוטיוב"} onChange={(e) => void apply(e.target.value)} className="text-left fs-15" />
      {error && <span className="fs-13 font-medium text-clay">{error}</span>}
      {shown?.id && (
        <div className="flex items-center gap-3">
          <img src={shown.poster || `https://i.ytimg.com/vi/${shown.id}/hqdefault.jpg`} alt="" className={value?.id ? "h-16 rounded border border-border" : "h-16 rounded border border-border opacity-60"} />
          <div className="flex flex-col gap-1">
            <Input value={value?.title ?? ""} placeholder={shown.title ?? "כותרת הסרטון"} disabled={!value?.id} onChange={(e) => onChange({ ...value, title: e.target.value })} className="fs-14" />
            {value?.id ? (
              <button type="button" onClick={() => onChange(undefined)} className="cursor-pointer self-start fs-13 text-foreground/70 hover:text-clay">
                חזרה לסרטון המקורי
              </button>
            ) : (
              <span className="fs-13 text-foreground/60">מוצג הסרטון המקורי</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
