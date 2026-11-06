/**
 * The admin form of one page section, built from its description (content/sections.ts): texts, images, icons,
 * YouTube videos and lists. What it stores is the override; the site merges it over the code's content.
 */
import { useState } from "react";

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

/** One field: `value` is the edited value (undefined = the original), `original` the code's value. */
function FieldInput({ field, value, original, onChange }: { field: FieldDef; value: unknown; original: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "text":
      return <Input value={typeof value === "string" ? value : ""} placeholder={typeof original === "string" ? original : ""} onChange={(e) => onChange(e.target.value)} className="fs-16" />;
    case "textarea":
      return <Textarea rows={3} value={typeof value === "string" ? value : ""} placeholder={typeof original === "string" ? original : ""} onChange={(e) => onChange(e.target.value)} className="fs-16" />;
    case "image":
      return <ImageField value={typeof value === "string" ? value : undefined} original={typeof original === "string" ? original : undefined} onChange={(url) => onChange(url)} />;
    case "images": {
      const vals = Array.isArray(value) ? (value as (string | undefined)[]) : [];
      const origs = Array.isArray(original) ? (original as string[]) : [];
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: field.count }, (_, i) => (
            <ImageField
              key={i}
              value={vals[i] || undefined}
              original={origs[i]}
              onChange={(url) => {
                const next = Array.from({ length: field.count }, (_, j) => vals[j] ?? "");
                next[i] = url ?? "";
                onChange(next);
              }}
            />
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
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={cn(f.type === "textarea" || f.type === "list" || f.type === "images" || f.type === "video" ? "lg:col-span-2" : "")}>
          <Field label={f.label}>
            <FieldInput field={f} value={item[f.name]} original={original?.[f.name]} onChange={(v) => set({ [f.name]: v })} />
          </Field>
        </div>
      ))}
    </div>
  );
}

/** A list the admin owns: add, remove, reorder. Starts from the code's items so nothing is lost on the first edit. */
function FreeList({ field, value, original, onChange }: { field: ListField; value: unknown; original: Obj[]; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) && value.length ? (value as Obj[]) : original.map((o) => ({ ...o }));
  return (
    <ListEditor items={items} onChange={onChange} newItem={() => ({})} max={field.max ?? 30} addLabel={field.itemLabel ?? "פריט"}>
      {(item, set, i) => <ItemFields fields={field.fields} item={item} original={original[i]} set={set} />}
    </ListEditor>
  );
}

/** A list of the code's items (they decide links): rename, change images, hide, reorder; no add or delete. */
function FixedList({ field, value, original, onChange }: { field: ListField; value: unknown; original: Obj[]; onChange: (v: unknown) => void }) {
  const key = field.keyField!;
  const stored = Array.isArray(value) ? (value as Obj[]) : [];
  const known = new Set(stored.map((o) => String(o._key)));
  const items: Obj[] = [...stored.filter((o) => original.some((d) => String(d[key]) === String(o._key))), ...original.filter((d) => !known.has(String(d[key]))).map((d) => ({ _key: d[key] }))];
  const update = (next: Obj[]) => onChange(next);
  const btn = "inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border fs-14 text-foreground hover:border-foreground disabled:cursor-default disabled:opacity-30";
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const orig = original.find((d) => String(d[key]) === String(item._key));
        const hidden = item._hidden === true;
        return (
          <div key={String(item._key)} className={cn("flex gap-3 rounded-md border border-border bg-background p-3", hidden && "opacity-50")}>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="fs-14 font-semibold text-foreground/70">{String(item._key)}</span>
                <label className="flex cursor-pointer items-center gap-1.5 fs-14 text-foreground">
                  <input type="checkbox" checked={hidden} onChange={(e) => update(items.map((x, j) => (j === i ? { ...x, _hidden: e.target.checked } : x)))} className="size-4 accent-primary" />
                  הסתרה
                </label>
              </div>
              <ItemFields fields={field.fields} item={item} original={orig} set={(patch) => update(items.map((x, j) => (j === i ? { ...x, ...patch } : x)))} />
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

export function SectionEditor({ def, defaults }: { def: SectionDef; defaults: Obj }) {
  return (
    <ContentEditor<Obj>
      contentKey={def.key}
      title={def.title}
      intro="שדה ריק משאיר את התוכן המקורי (מוצג באפור). שום דבר לא משתנה באתר לפני 'פרסום'."
      previewPath={def.page}
      prepare={(value) => ({ data: prepareOverride(def, value) })}
    >
      {(value, set) => (
        <div className="flex flex-col gap-5">
          {def.fields.map((f) => (
            <Field key={f.name} label={f.label} hint={"hint" in f ? f.hint : undefined}>
              <FieldInput field={f} value={value[f.name]} original={defaults[f.name]} onChange={(v) => set({ [f.name]: v })} />
            </Field>
          ))}
        </div>
      )}
    </ContentEditor>
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
