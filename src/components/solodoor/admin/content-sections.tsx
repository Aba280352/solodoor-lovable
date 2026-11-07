/** Content screens for the parts every page shares: the promo strip, the menus and the footer. */
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FOOTER_KEY, NAV_KEY, PROMO_ICONS, PROMO_KEY, type FooterOverride, type NavOverride, type PromoOverride } from "../content/nav";
import { FOOTER_BANNER, footerColumns, footerLegal, navLinks, promoItems, styleMenu, useMenu } from "../data";
import { Icon } from "../Icon";
import { ContentEditor, Field } from "./content-editor";
import { ImageField, ListEditor } from "./fields";

/* ───────────── Promo strip ───────────── */

export function PromoSection({ onLiveChange }: { onLiveChange?: (data: unknown) => void } = {}) {
  return (
    <ContentEditor<PromoOverride>
      contentKey={PROMO_KEY}
      onLiveChange={onLiveChange}
      title="פס המבצעים העליון"
      intro="ההודעות שרצות בפס הצבעוני בראש כל דף. עד 8 הודעות."
      previewPath="/"
      prepare={(value) => {
        const items = (value.items ?? []).map((i) => ({ icon: i.icon, label: i.label?.trim() })).filter((i) => i.label);
        return { data: items.length ? { items } : {} };
      }}
    >
      {(value, set) => {
        const items = value.items ?? promoItems.map((i) => ({ icon: i.icon as string, label: i.label }));
        return (
          <ListEditor items={items} onChange={(next) => set({ items: next })} newItem={() => ({ icon: "CheckCircle", label: "" })} max={8} addLabel="הודעה">
            {(item, setItem) => (
              <div className="flex flex-col gap-2">
                <Input value={item.label ?? ""} onChange={(e) => setItem({ label: e.target.value })} placeholder="טקסט ההודעה" className="fs-16" />
                <div className="flex flex-wrap gap-1.5">
                  {PROMO_ICONS.map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      title={ic.label}
                      aria-pressed={item.icon === ic.name}
                      onClick={() => setItem({ icon: ic.name })}
                      className={cn("inline-flex size-9 cursor-pointer items-center justify-center rounded-md border", item.icon === ic.name ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-foreground")}
                    >
                      <Icon name={ic.name} size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ListEditor>
        );
      }}
    </ContentEditor>
  );
}

/* ───────────── Menus ───────────── */

/** Every menu entry, grouped as the admin shows them. The key is the original label; it decides the link. */
const NAV_GROUPS: { title: string; keys: string[]; images?: { name: string; img: string }[] }[] = [
  { title: "תפריט עליון", keys: [...navLinks, "עשה זאת בעצמך", "טפט לפי סגנון", "טפט לפי שימוש", "צפייה בכל החנות", "אודות"] },
  { title: "תפריט: טפט לפי סגנון", keys: ["בחרו טפט לפי סגנון", "לכל הסגנונות", ...styleMenu.map((i) => i.name)], images: styleMenu },
  { title: "תפריט: טפט לפי שימוש", keys: ["בחרו טפט לפי שימוש", ...useMenu.map((i) => i.name)], images: useMenu },
  { title: "פוטר: עמודות", keys: [...new Set(footerColumns.flatMap((c) => [c.title, ...c.links]))] },
  { title: "פוטר: קישורים משפטיים", keys: footerLegal.map((l) => l.label) },
];

/** Titles and archive links that cannot be hidden (hiding them would leave a menu without a heading). */
const NOT_HIDEABLE = new Set(["בחרו טפט לפי סגנון", "בחרו טפט לפי שימוש", "מפת אתר", "קטגוריות", "לכל הסגנונות"]);

export function NavSection({ onLiveChange }: { onLiveChange?: (data: unknown) => void } = {}) {
  return (
    <ContentEditor<NavOverride>
      contentKey={NAV_KEY}
      onLiveChange={onLiveChange}
      title="תפריטים וקישורים"
      intro="שינוי שם משנה רק את הטקסט שמוצג. הקישור נשאר לאותו מקום, כך שאי אפשר לשבור אותו. אותו שם מתעדכן בכל מקום שהוא מופיע (תפריט עליון, תפריט טלפון ופוטר)."
      previewPath="/"
      prepare={(value) => {
        const labels = Object.fromEntries(Object.entries(value.labels ?? {}).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
        const hidden = [...new Set(value.hidden ?? [])];
        const images = Object.fromEntries(Object.entries(value.images ?? {}).filter(([, v]) => v));
        return { data: { ...(Object.keys(labels).length ? { labels } : {}), ...(hidden.length ? { hidden } : {}), ...(Object.keys(images).length ? { images } : {}) } };
      }}
    >
      {(value, set) => (
        <div className="flex flex-col gap-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h3 className="fs-17 font-bold text-foreground">{group.title}</h3>
              {group.keys.map((key) => {
                const hidden = (value.hidden ?? []).includes(key);
                const image = group.images?.find((i) => i.name === key);
                return (
                  <div key={key} className={cn("flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2", hidden && "opacity-50")}>
                    <span className="w-44 flex-none fs-14 text-foreground/70">{key}</span>
                    <Input
                      value={value.labels?.[key] ?? ""}
                      placeholder={key}
                      onChange={(e) => set({ labels: { ...(value.labels ?? {}), [key]: e.target.value } })}
                      className="max-w-72 fs-15"
                    />
                    {!NOT_HIDEABLE.has(key) && (
                      <label className="flex cursor-pointer items-center gap-1.5 fs-14 text-foreground">
                        <input
                          type="checkbox"
                          checked={hidden}
                          onChange={(e) => set({ hidden: e.target.checked ? [...(value.hidden ?? []), key] : (value.hidden ?? []).filter((k) => k !== key) })}
                          className="size-4 accent-primary"
                        />
                        הסתרה
                      </label>
                    )}
                    {image && (
                      <ImageField
                        value={value.images?.[key]}
                        original={image.img}
                        folder="site-menu"
                        onChange={(url) => set({ images: { ...(value.images ?? {}), [key]: url ?? "" } })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </ContentEditor>
  );
}

/* ───────────── Footer ───────────── */

const BANNER_LINES = ["דלת חדשה,", "אותו בית,", "הרגשה אחרת"];
const BANNER_ENGLISH = ["Small Change", "Big Difference"];

export function FooterSection({ onLiveChange }: { onLiveChange?: (data: unknown) => void } = {}) {
  return (
    <ContentEditor<FooterOverride>
      contentKey={FOOTER_KEY}
      onLiveChange={onLiveChange}
      title="פוטר (תחתית האתר)"
      intro="התמונה והמשפטים מעל הפוטר, השורה מתחת ללוגו, טופס יצירת הקשר וזכויות היוצרים. שדה ריק משאיר את המקור. הקישורים עצמם נערכים ב'תפריטים וקישורים'."
      previewPath="/"
      prepare={(value) => {
        const clean = (arr: string[] | undefined, n: number) => {
          const a = Array.from({ length: n }, (_, i) => arr?.[i]?.trim() ?? "");
          return a.some(Boolean) ? a : undefined;
        };
        const data: FooterOverride = {
          bannerImage: value.bannerImage || undefined,
          bannerLines: clean(value.bannerLines, 3),
          bannerEnglish: clean(value.bannerEnglish, 2),
          tagline: value.tagline?.trim() || undefined,
          formTitle: value.formTitle?.trim() || undefined,
          formSubtitle: value.formSubtitle?.trim() || undefined,
          copyright: value.copyright?.trim() || undefined,
        };
        return { data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as FooterOverride };
      }}
    >
      {(value, set) => {
        const line = (arr: "bannerLines" | "bannerEnglish", i: number, original: string, ltr = false) => (
          <Input
            key={i}
            dir={ltr ? "ltr" : "rtl"}
            value={value[arr]?.[i] ?? ""}
            placeholder={original}
            onChange={(e) => {
              const next = [...(value[arr] ?? [])];
              next[i] = e.target.value;
              set({ [arr]: next } as FooterOverride);
            }}
            className="fs-16"
          />
        );
        return (
          <div className="flex flex-col gap-4">
            <Field label="תמונת הבאנר">
              <ImageField value={value.bannerImage} original={FOOTER_BANNER} folder="site-footer" onChange={(url) => set({ bannerImage: url })} />
            </Field>
            <Field label="שלוש השורות על התמונה">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">{BANNER_LINES.map((l, i) => line("bannerLines", i, l))}</div>
            </Field>
            <Field label="שתי השורות באנגלית">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">{BANNER_ENGLISH.map((l, i) => line("bannerEnglish", i, l, true))}</div>
            </Field>
            <Field label="השורה מתחת ללוגו">
              <Input value={value.tagline ?? ""} placeholder="ציפוי דלתות. בדיוק הסגנון שלכם." onChange={(e) => set({ tagline: e.target.value })} className="fs-16" />
            </Field>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Field label="כותרת הטופס">
                <Input value={value.formTitle ?? ""} placeholder="השאירו פרטים" onChange={(e) => set({ formTitle: e.target.value })} className="fs-16" />
              </Field>
              <Field label="שורה מתחת לכותרת הטופס">
                <Input value={value.formSubtitle ?? ""} placeholder="ואנחנו נחזור אליכם בהקדם" onChange={(e) => set({ formSubtitle: e.target.value })} className="fs-16" />
              </Field>
            </div>
            <Field label="זכויות יוצרים">
              <Input value={value.copyright ?? ""} placeholder="© 2026 כל הזכויות שמורות לסולודור" onChange={(e) => set({ copyright: e.target.value })} className="fs-16" />
            </Field>
          </div>
        );
      }}
    </ContentEditor>
  );
}
