/**
 * Editable page sections. A section is described once (its fields), and that description drives both sides:
 * the site merges the published override over the code's defaults with `useSection`, and the admin builds its form
 * from the same fields. Anything missing or invalid in an override falls back to the code's content, so a bad
 * value can never blank or break a page.
 */
import { ICON_DATA, type IconName } from "../icon-data";
import { useContentValue } from "./site-content";

export type FieldDef =
  | { name: string; label: string; type: "text"; max?: number; hint?: string }
  | { name: string; label: string; type: "textarea"; max?: number; hint?: string }
  | { name: string; label: string; type: "image"; hint?: string }
  | { name: string; label: string; type: "images"; count: number; hint?: string }
  | { name: string; label: string; type: "icon" }
  | { name: string; label: string; type: "video"; hint?: string }
  | {
      name: string;
      label: string;
      type: "list";
      fields: FieldDef[];
      /** Fixed lists keep the code's items (matched by `keyField`, which also decides their link): edit, hide, reorder. */
      keyField?: string;
      max?: number;
      itemLabel?: string;
      hint?: string;
    };

export interface SectionDef {
  /** The content key, e.g. "home.hero". */
  key: string;
  title: string;
  /** The page the preview opens. */
  page: string;
  fields: FieldDef[];
}

export interface Video {
  id: string;
  title: string;
  poster: string;
}

const ICON_NAMES = new Set(Object.keys(ICON_DATA));

const cleanText = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
/** An https address, or one of the site's own files ("/images/…"), which a list item keeps when it moves. */
const cleanUrl = (v: unknown) => (typeof v === "string" && /^(?:https:\/\/|\/(?!\/))[^\s"'<>]+$/.test(v.trim()) ? v.trim() : undefined);
const cleanIcon = (v: unknown) => (typeof v === "string" && ICON_NAMES.has(v) ? (v as IconName) : undefined);
function cleanVideo(v: unknown): Video | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const id = typeof o.id === "string" && /^[\w-]{11}$/.test(o.id) ? o.id : undefined;
  if (!id) return undefined;
  return { id, title: cleanText(o.title, 160) ?? "", poster: cleanUrl(o.poster) ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
}

type Obj = Record<string, unknown>;

/** One field: the override when valid, else the default. */
function mergeField(field: FieldDef, def: unknown, over: unknown): unknown {
  switch (field.type) {
    case "text":
    case "textarea":
      return cleanText(over, field.max ?? (field.type === "text" ? 200 : 2000)) ?? def;
    case "image":
      return cleanUrl(over) ?? def;
    case "images": {
      const defs = Array.isArray(def) ? def : [];
      const overs = Array.isArray(over) ? over : [];
      return Array.from({ length: Math.max(defs.length, field.count) }, (_, i) => cleanUrl(overs[i]) ?? defs[i]).filter(Boolean);
    }
    case "icon":
      return cleanIcon(over) ?? def;
    case "video":
      return cleanVideo(over) ?? def;
    case "list":
      return mergeList(field, Array.isArray(def) ? (def as Obj[]) : [], over);
  }
}

function mergeItem(fields: FieldDef[], def: Obj | undefined, over: Obj): Obj {
  const out: Obj = { ...(def ?? {}) };
  for (const f of fields) out[f.name] = mergeField(f, def?.[f.name] ?? emptyOf(f), over[f.name]);
  return out;
}

/** What an item field holds when a new item leaves it empty. */
const emptyOf = (f: FieldDef): unknown => (f.type === "list" || f.type === "images" ? [] : f.type === "icon" ? "CheckCircle" : f.type === "video" ? undefined : "");

function mergeList(field: Extract<FieldDef, { type: "list" }>, defs: Obj[], over: unknown): Obj[] {
  if (!Array.isArray(over) || !over.length) return defs;
  const items = over.filter((o): o is Obj => !!o && typeof o === "object").slice(0, field.max ?? 40);
  if (field.keyField) {
    // Fixed list: the code's items, in the admin's order, hidden ones dropped; items the admin does not know yet stay at the end.
    const key = field.keyField;
    const byKey = new Map(defs.map((d) => [String(d[key]), d]));
    const seen = new Set<string>();
    const out: Obj[] = [];
    for (const o of items) {
      const k = String(o._key ?? "");
      const d = byKey.get(k);
      if (!d || seen.has(k)) continue;
      seen.add(k);
      if (o._hidden === true) continue;
      out.push({ ...mergeItem(field.fields, d, o), [key]: d[key], _label: cleanText(o[key], 120) ?? d[key] });
    }
    for (const d of defs) if (!seen.has(String(d[key]))) out.push(d);
    return out;
  }
  // Free list: the admin's items replace the code's; an empty image falls back to the code's item in the same place.
  return items.map((o, i) => mergeItem(field.fields, defs[i], o));
}

/** Merges a section's published override over its defaults. */
export function mergeSection<T extends Obj>(def: SectionDef, defaults: T, override: unknown): T {
  if (!override || typeof override !== "object") return defaults;
  const o = override as Obj;
  const out: Obj = { ...defaults };
  for (const f of def.fields) out[f.name] = mergeField(f, defaults[f.name], o[f.name]);
  return out as T;
}

/** The section's content in force: the code's defaults with the published (or previewed) override applied. */
export function useSection<T extends Obj>(def: SectionDef, defaults: T): T {
  return mergeSection(def, defaults, useContentValue(def.key));
}

/**
 * The label shown for an item of a fixed list: the admin's rename when there is one. The original value stays in
 * the key field, because it decides where the item links to.
 */
export const shownLabel = (item: Obj, keyField: string): string => String(item._label ?? item[keyField] ?? "");
