import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

import { Icon } from "../Icon";
import { articleImage, type Article } from "../blog/articles";

type Draft = Omit<Article, "id"> & { id?: number };

const EMPTY: Draft = {
  slug: "",
  title: "",
  excerpt: "",
  content_html: "",
  featured_image: null,
  featured_alt: "",
  meta_title: "",
  meta_description: "",
  is_published: false,
  published_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/["'’“”]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

/** Stores a picked file in the "articles" bucket and returns its public URL. */
async function uploadImage(file: File, folder: string) {
  const name = `${folder || "images"}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
  const { error } = await supabase.storage.from("articles").upload(name, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("articles").getPublicUrl(name).data.publicUrl;
}

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="fs-15 font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="fs-13 text-foreground/70">{hint}</span>}
    </label>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor | null; onImage: () => void }) {
  if (!editor) return null;
  const item = (active: boolean) =>
    cn(
      "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md px-2.5 fs-14 font-semibold transition-colors duration-160 ease-standard",
      active ? "bg-foreground text-background" : "text-foreground hover:bg-muted",
    );
  const setLink = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("כתובת הקישור", current ?? "https://");
    if (url === null) return;
    if (!url || url === "https://") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/60 px-2 py-1.5">
      <button type="button" className={item(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </button>
      <button type="button" className={item(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </button>
      <button type="button" className={item(editor.isActive("paragraph"))} onClick={() => editor.chain().focus().setParagraph().run()}>
        פסקה
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={item(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </button>
      <button type="button" className={item(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </button>
      <button type="button" className={item(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        רשימה
      </button>
      <button type="button" className={item(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. 2. 3.
      </button>
      <button type="button" className={item(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ציטוט
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={item(editor.isActive("link"))} onClick={setLink}>
        קישור
      </button>
      <button type="button" className={item(false)} onClick={onImage}>
        <Icon name="Image" size={15} />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={item(false)} onClick={() => editor.chain().focus().undo().run()} aria-label="בטל">
        ↶
      </button>
      <button type="button" className={item(false)} onClick={() => editor.chain().focus().redo().run()} aria-label="בצע שוב">
        ↷
      </button>
    </div>
  );
}

/** Create or edit one article. `id` is "new" or the article id. */
export function ArticleEditor({ id }: { id: string }) {
  const navigate = useNavigate();
  const isNew = id === "new";
  const [draft, setDraft] = useState<Draft | null>(isNew ? EMPTY : null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const bodyImageInput = useRef<HTMLInputElement>(null);
  const coverImageInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image],
    content: "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "article-prose min-h-120 px-5 py-4 focus:outline-none", dir: "rtl" } },
  });

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("articles")
      .select("*")
      .eq("id", Number(id))
      .limit(1)
      .then(({ data }) => {
        const article = (data ?? [])[0] as Article | undefined;
        if (!article) {
          setStatus("המאמר לא נמצא.");
          return;
        }
        setDraft(article);
        editor?.commands.setContent(article.content_html);
      });
    // The editor instance is created once; the content is set when the article arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, editor]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async (publish?: boolean) => {
    if (!draft || !editor) return;
    const slug = slugify(draft.slug || draft.title);
    if (!draft.title.trim() || !slug) {
      setStatus("צריך כותרת וסלאג.");
      return;
    }
    setBusy(true);
    setStatus(null);
    const row = {
      slug,
      title: draft.title.trim(),
      excerpt: draft.excerpt?.trim() || null,
      content_html: editor.getHTML(),
      featured_image: draft.featured_image || null,
      featured_alt: draft.featured_alt?.trim() || null,
      meta_title: draft.meta_title?.trim() || null,
      meta_description: draft.meta_description?.trim() || null,
      is_published: publish ?? draft.is_published,
      published_at: draft.published_at,
      updated_at: new Date().toISOString(),
    };
    const query = draft.id ? supabase.from("articles").update(row).eq("id", draft.id).select("id") : supabase.from("articles").insert(row).select("id");
    const { data, error } = await query;
    setBusy(false);
    if (error) {
      setStatus(error.message.includes("duplicate") ? "הסלאג הזה כבר קיים במאמר אחר." : `השמירה נכשלה: ${error.message}`);
      return;
    }
    const savedId = (data as { id: number }[])[0]?.id ?? draft.id;
    setDraft({ ...draft, ...row, id: savedId });
    setStatus(row.is_published ? "נשמר ופורסם." : "נשמר כטיוטה.");
    if (!draft.id && savedId) navigate({ to: "/admin/$id", params: { id: String(savedId) }, replace: true });
  };

  const remove = async () => {
    if (!draft?.id || !window.confirm("למחוק את המאמר לצמיתות?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", draft.id);
    if (error) setStatus(`המחיקה נכשלה: ${error.message}`);
    else navigate({ to: "/admin" });
  };

  const pickImage = async (file: File | undefined, target: "cover" | "body") => {
    if (!file || !draft) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, slugify(draft.slug || draft.title));
      if (target === "cover") set("featured_image", url);
      else editor?.chain().focus().setImage({ src: url, alt: "" }).run();
    } catch (e) {
      setStatus(`ההעלאה נכשלה: ${(e as Error).message}`);
    }
    setBusy(false);
  };

  if (!draft) return <p className="fs-16 text-foreground">{status ?? "טוען…"}</p>;
  const cover = articleImage(draft.featured_image);

  return (
    <div className="text-right">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="inline-flex items-center gap-1.5 fs-15 font-medium text-foreground hover:text-clay">
            <Icon name="AngleRight" size={12} />
            כל המאמרים
          </Link>
          <h1 className="fs-24 font-bold text-foreground">{isNew ? "מאמר חדש" : "עריכת מאמר"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status && <span className="fs-14 text-foreground">{status}</span>}
          {draft.id && draft.is_published && (
            <Button asChild variant="outline" size="sm">
              <Link to="/$slug" params={{ slug: draft.slug }} target="_blank">
                צפייה באתר
              </Link>
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => save(false)}>
            שמירה כטיוטה
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={() => save(true)}>
            {draft.is_published ? "שמירה ועדכון באתר" : "פרסום"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-5">
          <Field label="כותרת">
            <Input
              value={draft.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className="fs-20 font-semibold"
            />
          </Field>
          <Field label="תקציר" hint="מופיע בכרטיס המאמר ובראש הדף.">
            <Textarea rows={3} value={draft.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} className="fs-16" />
          </Field>
          <div className="overflow-hidden rounded-md border border-input bg-card">
            <Toolbar editor={editor} onImage={() => bodyImageInput.current?.click()} />
            <EditorContent editor={editor} />
            <input ref={bodyImageInput} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0], "body")} />
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            <Field label="כתובת (סלאג)" hint={draft.id ? "שינוי הסלאג משנה את כתובת המאמר ופוגע בקידום. לשנות רק אם חייבים." : "נוצר מהכותרת; אפשר לשנות."}>
              <Input
                dir="ltr"
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
                className="text-left fs-15"
              />
            </Field>
            <Field label="תאריך פרסום">
              <Input type="datetime-local" dir="ltr" value={toLocalInput(draft.published_at)} onChange={(e) => e.target.value && set("published_at", new Date(e.target.value).toISOString())} className="text-left fs-15" />
            </Field>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={draft.is_published} onChange={(e) => set("is_published", e.target.checked)} className="size-4 accent-[var(--color-secondary)]" />
              <span className="fs-15 font-semibold text-foreground">מפורסם באתר</span>
            </label>
            {draft.id && (
              <button type="button" onClick={remove} className="inline-flex cursor-pointer items-center gap-2 self-start fs-14 font-medium text-clay">
                <Icon name="Trash" size={14} />
                מחיקת המאמר
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            <span className="fs-15 font-semibold text-foreground">תמונה ראשית</span>
            <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted">
              {cover && <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => coverImageInput.current?.click()}>
                העלאת תמונה
              </Button>
              {draft.featured_image && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set("featured_image", null)}>
                  הסרה
                </Button>
              )}
            </div>
            <input ref={coverImageInput} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0], "cover")} />
            <Field label="טקסט חלופי (alt)">
              <Input value={draft.featured_alt ?? ""} onChange={(e) => set("featured_alt", e.target.value)} className="fs-15" />
            </Field>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            <span className="fs-15 font-semibold text-foreground">SEO</span>
            <Field label="כותרת לגוגל (title)" hint={`${(draft.meta_title ?? "").length} תווים`}>
              <Input value={draft.meta_title ?? ""} onChange={(e) => set("meta_title", e.target.value)} className="fs-15" />
            </Field>
            <Field label="תיאור לגוגל (description)" hint={`${(draft.meta_description ?? "").length} תווים`}>
              <Textarea rows={4} value={draft.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} className="fs-15" />
            </Field>
          </div>
        </aside>
      </div>
    </div>
  );
}
