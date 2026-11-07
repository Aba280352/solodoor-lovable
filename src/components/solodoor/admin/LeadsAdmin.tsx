import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { db } from "./db";

type Status = "new" | "in_progress" | "done" | "trash";

interface Lead {
  id: string;
  created_at: string;
  source: "door_quote" | "quiz" | "article" | "footer";
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  message: string | null;
  details: Record<string, string>;
  page_url: string | null;
  status: Status;
  notes: string | null;
  email_sent: boolean;
}

const SOURCE_LABELS: Record<Lead["source"], string> = {
  door_quote: "הצעת מחיר לדלת",
  quiz: "שאלון התאמה",
  article: "טופס במאמר",
  footer: "טופס בתחתית האתר",
};

const STATUS_LABELS: Record<Status, string> = { new: "חדשה", in_progress: "בטיפול", done: "טופלה", trash: "בסל המיחזור" };

const DETAIL_LABELS: Record<string, string> = {
  door_type: "סוג הדלת",
  area: "מה לחדש",
  style: "סגנון",
  width: "רוחב",
  height: "גובה",
  quantity: "כמות",
  image_note: "תמונה",
  article: "מאמר",
};

const FILTERS: { key: "open" | Status | "all"; label: string }[] = [
  { key: "open", label: "פתוחות" },
  { key: "new", label: "חדשות" },
  { key: "in_progress", label: "בטיפול" },
  { key: "done", label: "טופלו" },
  { key: "trash", label: "סל המיחזור" },
];

const dateFormat = new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" });

/** An Israeli phone as an international number for a WhatsApp link, or null. */
/** A page address for display; a malformed one (anyone can send one through the public form) is shown as it is. */
function safeDecode(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

function whatsappNumber(phone: string | null): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0") && digits.length >= 9) return `972${digits.slice(1)}`;
  return null;
}

/** One CSV cell, quoted, and guarded against spreadsheet formulas. */
const csvCell = (value: string | null | undefined) => {
  let s = value ?? "";
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

function downloadCsv(leads: Lead[]) {
  const head = ["תאריך", "מקור", "סטטוס", "שם", "טלפון", "אימייל", "עיר", "הודעה", "פרטים נוספים", "הערות", "דף"];
  const lines = leads.map((l) =>
    [
      dateFormat.format(new Date(l.created_at)),
      SOURCE_LABELS[l.source],
      STATUS_LABELS[l.status],
      l.name,
      l.phone,
      l.email,
      l.city,
      l.message,
      Object.entries(l.details ?? {})
        .map(([k, v]) => `${DETAIL_LABELS[k] ?? k}: ${v}`)
        .join(" | "),
      l.notes,
      l.page_url,
    ]
      .map(csvCell)
      .join(","),
  );
  // The BOM makes Excel read the Hebrew correctly.
  const blob = new Blob(["﻿" + [head.map(csvCell).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `solodoor-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Every form sent from the site, newest first: status, an internal note, and an export to Excel. */
export function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("open");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    db.from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data, error }) => (error ? setStatus(`הטעינה נכשלה: ${error.message}`) : setLeads((data ?? []) as Lead[])));
  }, []);

  const shown = useMemo(
    () =>
      (leads ?? []).filter((l) =>
        filter === "open" ? l.status === "new" || l.status === "in_progress" : filter === "all" ? true : l.status === filter,
      ),
    [leads, filter],
  );

  if (!leads) return <p className="fs-16 text-foreground">{status ?? "טוען…"}</p>;

  const count = (key: (typeof FILTERS)[number]["key"]) =>
    leads.filter((l) => (key === "open" ? l.status === "new" || l.status === "in_progress" : l.status === key)).length;

  const update = async (lead: Lead, patch: Partial<Pick<Lead, "status" | "notes">>, done: string) => {
    setBusy(lead.id);
    setStatus(null);
    const { error } = await db
      .from("leads")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", lead.id);
    setBusy(null);
    if (error) {
      setStatus(`השמירה נכשלה: ${error.message}`);
      return;
    }
    setLeads((all) => (all ?? []).map((l) => (l.id === lead.id ? { ...l, ...patch } : l)));
    setStatus(done);
  };

  return (
    <div className="text-right">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="fs-28 font-bold text-foreground">פניות מהאתר</h1>
          <p className="mt-1 fs-15 text-foreground/70">כל טופס שנשלח מהאתר: הצעת מחיר לדלת, השאלון, הטופס במאמרים והטופס בתחתית האתר.</p>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={!shown.length} onClick={() => downloadCsv(shown)}>
          ייצוא לאקסל
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 fs-14 font-semibold transition-colors duration-160 ease-standard",
              filter === f.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-foreground",
            )}
          >
            {f.label} ({count(f.key)})
          </button>
        ))}
      </div>

      {status && <p className="mt-4 rounded-md border border-border bg-card px-4 py-3 fs-15 font-semibold text-foreground">{status}</p>}

      {!shown.length && (
        <p className="mt-6 rounded-lg border border-dashed border-border bg-card px-5 py-8 text-center fs-16 text-foreground/70">
          {leads.length ? "אין פניות בתצוגה הזו." : "עוד לא נשלחו פניות מהאתר. כשמישהו ימלא טופס, הוא יופיע כאן."}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4">
        {shown.map((lead) => {
          const wa = whatsappNumber(lead.phone);
          const note = notes[lead.id] ?? lead.notes ?? "";
          return (
            <section key={lead.id} className={cn("rounded-lg border bg-card p-5", lead.status === "new" ? "border-primary" : "border-border")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="fs-18 font-bold text-foreground">{lead.name || "ללא שם"}</span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 fs-13 font-semibold text-foreground">{SOURCE_LABELS[lead.source]}</span>
                  {lead.status === "new" && <span className="rounded-full bg-primary px-2.5 py-0.5 fs-13 font-semibold text-primary-foreground">חדשה</span>}
                </div>
                <span className="fs-14 text-foreground/70">{dateFormat.format(new Date(lead.created_at))}</span>
              </div>

              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 fs-15 text-foreground lg:grid-cols-2">
                {lead.phone && (
                  <div className="flex gap-2">
                    <dt className="font-semibold">טלפון:</dt>
                    <dd className="flex flex-wrap gap-3">
                      <a href={`tel:${lead.phone}`} dir="ltr" className="border-b border-primary">
                        {lead.phone}
                      </a>
                      {wa && (
                        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="border-b border-secondary">
                          וואטסאפ
                        </a>
                      )}
                    </dd>
                  </div>
                )}
                {lead.email && (
                  <div className="flex gap-2">
                    <dt className="font-semibold">אימייל:</dt>
                    <dd>
                      <a href={`mailto:${lead.email}`} dir="ltr" className="border-b border-primary">
                        {lead.email}
                      </a>
                    </dd>
                  </div>
                )}
                {lead.city && (
                  <div className="flex gap-2">
                    <dt className="font-semibold">עיר / אזור:</dt>
                    <dd>{lead.city}</dd>
                  </div>
                )}
                {Object.entries(lead.details ?? {}).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="font-semibold">{DETAIL_LABELS[k] ?? k}:</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {lead.message && <p className="mt-3 rounded-md bg-muted px-4 py-3 fs-15 whitespace-pre-line text-foreground">{lead.message}</p>}
              {lead.page_url && /^https:\/\//.test(lead.page_url) && (
                <a href={lead.page_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block fs-13 text-foreground/60 hover:text-clay">
                  נשלח מהדף: {safeDecode(lead.page_url.replace(/^https?:\/\/[^/]+/, "") || "/")}
                </a>
              )}

              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="fs-14 font-semibold text-foreground">סטטוס:</span>
                  {(["new", "in_progress", "done"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={busy === lead.id}
                      aria-pressed={lead.status === s}
                      onClick={() => lead.status !== s && update(lead, { status: s }, `הסטטוס עודכן ל"${STATUS_LABELS[s]}".`)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1 fs-14 font-medium transition-colors duration-160 ease-standard",
                        lead.status === s ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-foreground hover:border-foreground",
                      )}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                  {lead.status === "trash" ? (
                    <button type="button" disabled={busy === lead.id} onClick={() => update(lead, { status: "new" }, "הפנייה שוחזרה.")} className="ms-auto cursor-pointer fs-14 font-medium text-foreground hover:text-clay">
                      שחזור מהסל
                    </button>
                  ) : (
                    <button type="button" disabled={busy === lead.id} onClick={() => update(lead, { status: "trash" }, "הפנייה הועברה לסל המיחזור.")} className="ms-auto cursor-pointer fs-14 font-medium text-foreground/70 hover:text-clay">
                      העברה לסל
                    </button>
                  )}
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="fs-14 font-semibold text-foreground">הערה פנימית (רק בניהול)</span>
                  <Textarea rows={2} value={note} onChange={(e) => setNotes((n) => ({ ...n, [lead.id]: e.target.value }))} className="fs-15" />
                </label>
                {note !== (lead.notes ?? "") && (
                  <Button type="button" size="sm" disabled={busy === lead.id} className="self-start" onClick={() => update(lead, { notes: note.trim() || null }, "ההערה נשמרה.")}>
                    שמירת ההערה
                  </Button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
