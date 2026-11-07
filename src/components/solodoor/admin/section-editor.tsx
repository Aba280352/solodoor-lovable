/**
 * The admin form of one page section, built from its description (content/sections.ts): texts, images, icons,
 * YouTube videos and lists. What it stores is the override; the site merges it over the code's content.
 *
 * Two ways to show it, like Elementor:
 *  - the whole section: texts first, then folded groups (pictures and videos, each list), list rows folded;
 *  - one element (a text or a picture clicked on the page): only that element, or the one list item it belongs to.
 *
 * Elements are named by a path: "title", "gallery.2.src" (item 3 of a free list), "slides.~דלתות.img" (the item of a
 * fixed list whose original key is "דלתות"), "swatches.1" (picture 2 of a pictures field).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { ICON_DATA, type IconName } from "../icon-data";
import type { FieldDef, SectionDef } from "../content/sections";
import { ContentEditor, Field } from "./content-editor";
import { ImageField, ListEditor, YouTubeField, type VideoValue } from "./fields";

type Obj = Record<string, unknown>;
type ListField = Extract<FieldDef, { type: "list" }>;

const ICONS = Object.keys(ICON_DATA) as IconName[];

function IconPicker({ value, onChange }: { value?: string; onChange: (v: IconName) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 fs-14 text-foreground hover:border-foreground">
        {value && ICONS.includes(value as IconName) ? <Icon name={value as IconName} size={18} /> : null}
        <span>{open ? "סגירה" : "בחירת אייקון"}</span>
      </button>
      {open && (
        <div className="flex max-w-120 flex-wrap gap-1.5 rounded-md border border-border bg-card p-2">
          {ICONS.map((name) => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
              className={cn("inline-flex size-9 cursor-pointer items-center justify-center rounded-md border", value === name ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-foreground")}
            >
              <Icon name={name} size={16} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** "Back to the original" under a text that was changed. */
function ResetLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer self-start fs-13 text-foreground/60 hover:text-clay">
      ↺ חזרה לטקסט המקורי
    </button>
  );
}

/**
 * One field: `value` is the edited value (undefined = the original), `original` the code's value.
 * Texts show the text in force (edited or original), so it is changed in place rather than retyped.
 */
function FieldInput({ field, value, original, onChange, big }: { field: FieldDef; value: unknown; original: unknown; onChange: (v: unknown) => void; big?: boolean }) {
  switch (field.type) {
    case "text":
    case "textarea": {
      const shown = typeof value === "string" ? value : typeof original === "string" ? original : "";
      const changed = typeof value === "string" && value.trim() !== "" && value !== original;
      const long = field.type === "textarea" || big;
      return (
        <div className="flex flex-col gap-1">
          {long ? (
            <Textarea rows={field.type === "textarea" ? ((field.max ?? 0) > 2000 ? 16 : big ? 6 : 4) : 2} value={shown} onChange={(e) => onChange(e.target.value)} className="fs-16" />
          ) : (
            <Input value={shown} onChange={(e) => onChange(e.target.value)} className="fs-16" />
          )}
          {changed && <ResetLink onClick={() => onChange(undefined)} />}
        </div>
      );
    }
    case "image":
      // A list item keeps its own picture's address; that is still "the original", not a replacement.
      return <ImageField value={typeof value === "string" && value && value !== original ? value : undefined} original={typeof original === "string" ? original : undefined} onChange={(url) => onChange(url ?? original)} />;
    case "images": {
      const vals = Array.isArray(value) ? (value as (string | undefined)[]) : [];
      const origs = Array.isArray(original) ? (original as string[]) : [];
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: field.count }, (_, i) => (
            <div key={i} data-item={i}>
              <ImageField
                value={vals[i] && vals[i] !== origs[i] ? vals[i] : undefined}
                original={origs[i]}
                onChange={(url) => {
                  const next = Array.from({ length: field.count }, (_, j) => vals[j] ?? "");
                  next[i] = url ?? "";
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
      );
    }
    case "icon":
      return <IconPicker value={(value as string) ?? (original as string)} onChange={onChange} />;
    case "video":
      return <YouTubeField value={value as VideoValue | undefined} original={original as VideoValue | undefined} onChange={onChange} />;
    case "list":
      return field.keyField ? (
        <FixedList field={field} value={value} original={(original as Obj[]) ?? []} onChange={onChange} />
      ) : (
        <FreeList field={field} value={value} original={(original as Obj[]) ?? []} onChange={onChange} />
      );
  }
}

function ItemFields({ fields, item, original, set }: { fields: FieldDef[]; item: Obj; original?: Obj; set: (patch: Obj) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {fields.map((f) => (
        <div key={f.name} data-field={f.name}>
          <Field label={f.label}>
            <FieldInput field={f} value={item[f.name]} original={original?.[f.name]} onChange={(v) => set({ [f.name]: v })} />
          </Field>
        </div>
      ))}
    </div>
  );
}

/** The one-line summary of a folded list row: its first text. */
function itemSummary(fields: FieldDef[], item: Obj, original?: Obj): string {
  for (const f of fields) {
    if (f.type !== "text" && f.type !== "textarea") continue;
    const v = item[f.name] ?? original?.[f.name];
    if (typeof v === "string" && v.trim()) return v.trim().slice(0, 60);
  }
  return "";
}

/** A list the admin owns: add, remove, reorder. Starts from the code's items so nothing is lost on the first edit. */
function FreeList({ field, value, original, onChange }: { field: ListField; value: unknown; original: Obj[]; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) && value.length ? (value as Obj[]) : original.map((o) => ({ ...o }));
  return (
    <ListEditor items={items} onChange={onChange} newItem={() => ({})} max={field.max ?? 30} addLabel={field.itemLabel ?? "פריט"} summary={(item, i) => itemSummary(field.fields, item, original[i])}>
      {(item, set, i) => <ItemFields fields={field.fields} item={item} original={original[i]} set={set} />}
    </ListEditor>
  );
}

/** The items of a fixed list in the admin's order (the stored ones first, then any the admin has not touched). */
function fixedItems(field: ListField, value: unknown, original: Obj[]): Obj[] {
  const key = field.keyField!;
  const stored = Array.isArray(value) ? (value as Obj[]) : [];
  const known = new Set(stored.map((o) => String(o._key)));
  return [...stored.filter((o) => original.some((d) => String(d[key]) === String(o._key))), ...original.filter((d) => !known.has(String(d[key]))).map((d) => ({ _key: d[key] }))];
}

/** A list of the code's items (they decide links): rename, change images, hide, reorder; no add or delete. */
function FixedList({ field, value, original, onChange }: { field: ListField; value: unknown; original: Obj[]; onChange: (v: unknown) => void }) {
  const key = field.keyField!;
  const items = fixedItems(field, value, original);
  const [open, setOpen] = useState<string | null>(null);
  const update = (next: Obj[]) => onChange(next);
  const btn = "inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border fs-14 text-foreground hover:border-foreground disabled:cursor-default disabled:opacity-30";
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const id = String(item._key);
        const orig = original.find((d) => String(d[key]) === id);
        const hidden = item._hidden === true;
        return (
          <div key={id} data-item-key={id} className={cn("flex gap-3 rounded-md border border-border bg-background p-3", hidden && "opacity-50")}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setOpen(open === id ? null : id)} className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-right fs-15 font-medium text-foreground">
                  <span className="min-w-0 truncate">{itemSummary(field.fields, item, orig) || id}</span>
                  <span aria-hidden="true" className="flex-none text-foreground/50">{open === id ? "▴" : "▾"}</span>
                </button>
                <label className="flex flex-none cursor-pointer items-center gap-1.5 fs-14 text-foreground">
                  <input type="checkbox" checked={hidden} onChange={(e) => update(items.map((x, j) => (j === i ? { ...x, _hidden: e.target.checked } : x)))} className="size-4 accent-primary" />
                  הסתרה
                </label>
              </div>
              {open === id && (
                <div className="mt-3">
                  <ItemFields fields={field.fields} item={item} original={orig} set={(patch) => update(items.map((x, j) => (j === i ? { ...x, ...patch } : x)))} />
                </div>
              )}
            </div>
            <div className="flex flex-none flex-col gap-1.5">
              <button type="button" aria-label="למעלה" disabled={i === 0} onClick={() => update(items.map((x, j) => (j === i - 1 ? items[i] : j === i ? items[i - 1] : x)))} className={btn}>
                ↑
              </button>
              <button type="button" aria-label="למטה" disabled={i === items.length - 1} onClick={() => update(items.map((x, j) => (j === i + 1 ? items[i] : j === i ? items[i + 1] : x)))} className={btn}>
                ↓
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────── Paths: one element of a section ───────────── */

interface Resolved {
  field: FieldDef;
  label: string;
  /** The edited value of the element (undefined = the original). */
  get: (v: Obj) => unknown;
  original: unknown;
  /** The top-level change that sets the element to `x`. */
  set: (v: Obj, x: unknown) => Obj;
}

/** The list item a path points at: how to read the list, which index, its original, and its label. */
function resolveItem(def: SectionDef, defaults: Obj, top: ListField, seg: string) {
  const originals = (Array.isArray(defaults[top.name]) ? defaults[top.name] : []) as Obj[];
  if (top.keyField) {
    const id = seg.replace(/^~/, "");
    const items = (v: Obj) => fixedItems(top, v[top.name], originals);
    const original = originals.find((d) => String(d[top.keyField!]) === id);
    return { items, index: (v: Obj) => items(v).findIndex((o) => String(o._key) === id), original, label: (original && itemSummary(top.fields, {}, original)) || id };
  }
  const i = Number(seg);
  if (!Number.isInteger(i) || i < 0) return null;
  const items = (v: Obj) => (Array.isArray(v[top.name]) && (v[top.name] as Obj[]).length ? (v[top.name] as Obj[]) : originals.map((o) => ({ ...o })));
  return { items, index: () => i, original: originals[i], label: `${top.itemLabel ?? "פריט"} ${i + 1}` };
}

export function resolvePath(def: SectionDef, defaults: Obj, path: string): Resolved | null {
  const parts = path.split(".");
  const top = def.fields.find((f) => f.name === parts[0]);
  if (!top) return null;
  if (parts.length === 1) return { field: top, label: top.label, get: (v) => v[top.name], original: defaults[top.name], set: (_v, x) => ({ [top.name]: x }) };
  if (top.type === "images") {
    const j = Number(parts[1]);
    const origs = (defaults[top.name] ?? []) as string[];
    return {
      field: { name: top.name, label: `${top.label}: ${j + 1}`, type: "image" },
      label: `${top.label} ${j + 1}`,
      get: (v) => (v[top.name] as string[] | undefined)?.[j] || undefined,
      original: origs[j],
      set: (v, x) => {
        const arr = Array.from({ length: top.count }, (_, k) => ((v[top.name] as string[] | undefined)?.[k] ?? "") as string);
        arr[j] = (x as string | undefined) ?? "";
        return { [top.name]: arr };
      },
    };
  }
  if (top.type !== "list") return null;
  const item = resolveItem(def, defaults, top, parts[1]);
  const sub = top.fields.find((f) => f.name === parts[2]);
  if (!item || !sub) return null;
  const withItem = (v: Obj, change: (o: Obj) => Obj) => {
    const list = [...item.items(v)];
    const i = item.index(v);
    if (i < 0 || i >= list.length) return {};
    list[i] = change(list[i] ?? {});
    return { [top.name]: list };
  };
  const label = `${item.label} · ${sub.label}`;
  if (parts.length === 4 && sub.type === "images") {
    const j = Number(parts[3]);
    return {
      field: { name: sub.name, label: `${sub.label}: ${j + 1}`, type: "image" },
      label: `${label} ${j + 1}`,
      get: (v) => (item.items(v)[item.index(v)]?.[sub.name] as string[] | undefined)?.[j] || undefined,
      original: ((item.original?.[sub.name] ?? []) as string[])[j],
      set: (v, x) =>
        withItem(v, (o) => {
          const arr = Array.from({ length: sub.count }, (_, k) => ((o[sub.name] as string[] | undefined)?.[k] ?? "") as string);
          arr[j] = (x as string | undefined) ?? "";
          return { ...o, [sub.name]: arr };
        }),
    };
  }
  return {
    field: sub,
    label,
    get: (v) => item.items(v)[item.index(v)]?.[sub.name],
    original: item.original?.[sub.name],
    set: (v, x) => withItem(v, (o) => ({ ...o, [sub.name]: x })),
  };
}

/** The paths of every field of the list item a path belongs to ("gallery.2.src" -> "gallery.2.src", "gallery.2.alt"). */
function siblingPaths(def: SectionDef, path: string): string[] {
  const parts = path.split(".");
  const top = def.fields.find((f) => f.name === parts[0]);
  if (!top || top.type !== "list" || parts.length < 3) return [path];
  return top.fields.map((f) => `${parts[0]}.${parts[1]}.${f.name}`);
}

/** Free-list item actions in element mode: duplicate and delete, like Elementor's widget menu. */
function itemActions(def: SectionDef, defaults: Obj, path: string) {
  const parts = path.split(".");
  const top = def.fields.find((f) => f.name === parts[0]);
  if (!top || top.type !== "list" || top.keyField || parts.length < 3) return null;
  const i = Number(parts[1]);
  const originals = (defaults[top.name] ?? []) as Obj[];
  const items = (v: Obj) => (Array.isArray(v[top.name]) && (v[top.name] as Obj[]).length ? (v[top.name] as Obj[]) : originals.map((o) => ({ ...o })));
  return {
    canAdd: (v: Obj) => items(v).length < (top.max ?? 30),
    duplicate: (v: Obj): Obj => {
      const list = [...items(v)];
      list.splice(i + 1, 0, { ...list[i] });
      return { [top.name]: list };
    },
    remove: (v: Obj): Obj => ({ [top.name]: items(v).filter((_, j) => j !== i) }),
  };
}

/* ───────────── The editor ───────────── */

/** Drops empty strings and empty arrays at the top level, so an empty field means "the original". */
function prepareOverride(def: SectionDef, value: Obj): Obj {
  const out: Obj = {};
  for (const f of def.fields) {
    const v = value[f.name];
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      if (v.trim()) out[f.name] = v.trim();
    } else if (Array.isArray(v)) {
      if (f.type === "images" ? v.some(Boolean) : v.length) out[f.name] = v;
    } else out[f.name] = v;
  }
  return out;
}

/** A folding group of the panel. */
function Group({ title, count, initiallyOpen = false, children }: { title: string; count?: number; initiallyOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <div className="rounded-md border border-border">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full cursor-pointer items-center justify-between gap-2 bg-muted/60 px-3 py-2.5 text-right fs-15 font-bold text-foreground">
        <span>
          {title}
          {count !== undefined && <span className="ms-1.5 fs-13 font-medium text-foreground/60">({count})</span>}
        </span>
        <span aria-hidden="true" className="text-foreground/60">{open ? "▴" : "▾"}</span>
      </button>
      {open && <div className="flex flex-col gap-4 border-t border-border p-3">{children}</div>}
    </div>
  );
}

export type PagePatch = { field: string; value: string; nonce: number } | null;
export type ElementFocus = { field: string; open?: boolean; nonce: number } | null;

export function SectionEditor({
  def,
  defaults,
  onLiveChange,
  patch,
  element,
  onBack,
  note,
  compact,
}: {
  def: SectionDef;
  defaults: Obj;
  onLiveChange?: (data: Obj) => void;
  /** In-place typing on the page, applied to the form. */
  patch?: PagePatch;
  /** One element clicked on the page: the panel shows only it (and, for a list item, that item). */
  element?: ElementFocus;
  /** Back from one element to the whole section. */
  onBack?: () => void;
  /** A line above the fields (e.g. "shared by every page"). */
  note?: string;
  compact?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const resolved = element ? resolvePath(def, defaults, element.field) : null;

  // A double-clicked picture opens the file picker at once; a clicked text gets the caret.
  useEffect(() => {
    if (!element || !resolved) return;
    const t = window.setTimeout(() => {
      const leaf = boxRef.current?.querySelector<HTMLElement>(`[data-leaf="${CSS.escape(element.field)}"]`);
      if (!leaf) return;
      leaf.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (element.open) leaf.querySelector<HTMLInputElement>("input[type=file]")?.click();
      else leaf.querySelector<HTMLElement>("input:not([type=checkbox]):not([type=file]),textarea")?.focus({ preventScroll: true });
    }, 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element?.nonce]);

  const pagePatch = patch && resolvePath(def, defaults, patch.field) ? { apply: (v: Obj) => resolvePath(def, defaults, patch.field)!.set(v, patch.value), nonce: patch.nonce } : null;

  return (
    <div ref={boxRef}>
      <ContentEditor<Obj>
        contentKey={def.key}
        title={def.title}
        intro="שדה ריק משאיר את התוכן המקורי. שום דבר לא משתנה באתר לפני 'פרסום'."
        previewPath={def.page}
        onLiveChange={onLiveChange}
        patch={pagePatch}
        compact={compact}
        prepare={(value) => ({ data: prepareOverride(def, value) })}
      >
        {(value, set) => {
          if (element && resolved) {
            const paths = siblingPaths(def, element.field);
            const actions = itemActions(def, defaults, element.field);
            return (
              <div className="flex flex-col gap-4">
                {onBack && (
                  <button type="button" onClick={onBack} className="inline-flex w-fit cursor-pointer items-center gap-1.5 fs-14 font-medium text-foreground/70 hover:text-clay">
                    <Icon name="AngleRight" size={12} />
                    כל השדות של "{def.title}"
                  </button>
                )}
                {note && <p className="rounded-md bg-muted px-3 py-2 fs-13 text-foreground/80">{note}</p>}
                {paths.map((p) => {
                  const r = resolvePath(def, defaults, p);
                  if (!r) return null;
                  const main = p === element.field;
                  return (
                    <div key={p} data-leaf={p} className={cn(main && paths.length > 1 && "rounded-md ring-2 ring-secondary ring-offset-4 ring-offset-card")}>
                      <Field label={paths.length > 1 ? r.field.label : r.label} hint={"hint" in r.field ? r.field.hint : undefined}>
                        <FieldInput field={r.field} value={r.get(value)} original={r.original} big={main} onChange={(x) => set(r.set(value, x))} />
                      </Field>
                    </div>
                  );
                })}
                {actions && (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    {actions.canAdd(value) && (
                      <button type="button" onClick={() => set(actions.duplicate(value))} className="cursor-pointer rounded-md border border-border px-3 py-1.5 fs-14 hover:border-foreground">
                        שכפול הפריט
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm("למחוק את הפריט הזה?")) return;
                        set(actions.remove(value));
                        onBack?.();
                      }}
                      className="cursor-pointer rounded-md border border-border px-3 py-1.5 fs-14 text-clay hover:border-clay"
                    >
                      מחיקת הפריט
                    </button>
                  </div>
                )}
              </div>
            );
          }

          const texts = def.fields.filter((f) => f.type === "text" || f.type === "textarea");
          const media = def.fields.filter((f) => f.type === "image" || f.type === "images" || f.type === "video" || f.type === "icon");
          const lists = def.fields.filter((f): f is ListField => f.type === "list");
          const row = (f: FieldDef) => (
            <div key={f.name} data-field={f.name}>
              <Field label={f.label} hint={"hint" in f ? f.hint : undefined}>
                <FieldInput field={f} value={value[f.name]} original={defaults[f.name]} onChange={(v) => set({ [f.name]: v })} />
              </Field>
            </div>
          );
          const listCount = (f: ListField) => (Array.isArray(value[f.name]) && (value[f.name] as Obj[]).length ? (value[f.name] as Obj[]) : ((defaults[f.name] ?? []) as Obj[])).filter((o) => o._hidden !== true).length;
          return (
            <div className="flex flex-col gap-3">
              {note && <p className="rounded-md bg-muted px-3 py-2 fs-13 text-foreground/80">{note}</p>}
              {texts.length > 0 && (
                <Group title="טקסטים" initiallyOpen>
                  {texts.map(row)}
                </Group>
              )}
              {media.length > 0 && <Group title="תמונות וסרטונים">{media.map(row)}</Group>}
              {lists.map((f) => (
                <Group key={f.name} title={f.label} count={listCount(f)}>
                  {f.hint && <p className="fs-13 text-foreground/60">{f.hint}</p>}
                  <FieldInput field={f} value={value[f.name]} original={defaults[f.name]} onChange={(v) => set({ [f.name]: v })} />
                </Group>
              ))}
            </div>
          );
        }}
      </ContentEditor>
    </div>
  );
}

/** A page's sections as a side list; one section open at a time. */
export function PageSections({ sections }: { sections: { def: SectionDef; defaults: Obj }[] }) {
  const [key, setKey] = useState(sections[0]?.def.key);
  const current = sections.find((s) => s.def.key === key) ?? sections[0];
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <nav aria-label="אזורים" className="flex flex-col gap-1 self-start rounded-lg border border-border bg-card p-2">
        {sections.map((s) => (
          <button
            key={s.def.key}
            type="button"
            onClick={() => setKey(s.def.key)}
            className={cn("cursor-pointer rounded-md px-3 py-2 text-right fs-15", s.def.key === current?.def.key ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")}
          >
            {s.def.title}
          </button>
        ))}
      </nav>
      {current && <SectionEditor key={current.def.key} def={current.def} defaults={current.defaults} />}
    </div>
  );
}
