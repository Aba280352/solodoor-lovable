// The SEO brief Solodoor fills at a private link (/brief/<token>). Served by /api/public/seo-brief.
//
// The link's token is the only key: the table keeps its SHA-256, never the token itself. While the brief is a
// draft every change is saved; once it is sent it is locked, and only the site owner can change it (in the
// database, there is no write policy). Sending emails the business inbox (soloodoor@gmail.com, which Ido reads) through Resend when RESEND_API_KEY is set.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { ALL_QUESTIONS, cleanAnswers, isAnswered, otherKey, type BriefAnswers } from "@/components/solodoor/brief/questions";

const BRIEF_ID = "solodoor";
const NOTIFY_EMAIL = "soloodoor@gmail.com";
const FROM_EMAIL = "סולודור <onboarding@resend.dev>";
const SITE = "https://solodoor.co.il";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

const env = (name: string): string | undefined => (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface BriefRow {
  token_hash: string;
  answers: BriefAnswers;
  status: "draft" | "submitted";
  submitted_at: string | null;
}

/** The brief the token opens, or null for a wrong token. */
async function load(token: unknown): Promise<BriefRow | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return null;
  const { data } = await supabaseAdmin.from("seo_briefs").select("token_hash, answers, status, submitted_at").eq("id", BRIEF_ID).maybeSingle();
  const row = data as BriefRow | null;
  if (!row || row.token_hash !== (await sha256(token))) return null;
  return row;
}

export async function handleBriefGet(request: Request): Promise<Response> {
  const row = await load(new URL(request.url).searchParams.get("t"));
  if (!row) return json(404, { ok: false, message: "הקישור לא תקין." });
  return json(200, { ok: true, status: row.status, answers: row.answers ?? {}, submitted_at: row.submitted_at });
}

export async function handleBriefPost(request: Request): Promise<Response> {
  const raw = await request.text();
  if (raw.length > 100_000) return json(413, { ok: false, message: "התשובות ארוכות מדי." });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, message: "בקשה לא תקינה." });
  }
  const row = await load(body.t);
  if (!row) return json(404, { ok: false, message: "הקישור לא תקין." });
  if (row.status === "submitted") return json(409, { ok: false, message: "השאלון כבר נשלח, ואי אפשר לשנות אותו." });

  const answers = cleanAnswers(body.answers);
  const submit = body.submit === true;
  if (submit) {
    const missing = ALL_QUESTIONS.filter((q) => q.required && !isAnswered(q, answers));
    if (missing.length) return json(400, { ok: false, message: "יש עוד שאלות חובה שלא נענו.", missing: missing.map((q) => q.id) });
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("seo_briefs")
    .update({ answers, updated_at: now, ...(submit ? { status: "submitted", submitted_at: now } : {}) })
    .eq("id", BRIEF_ID)
    .eq("status", "draft");
  if (error) {
    console.error("brief save failed", error);
    return json(500, { ok: false, message: "השמירה לא הצליחה." });
  }

  if (submit) await notify(answers);
  return json(200, { ok: true, status: submit ? "submitted" : "draft", saved_at: now });
}

/** A courtesy email to the owner; the brief is already saved whatever happens here. */
async function notify(answers: BriefAnswers) {
  const key = env("RESEND_API_KEY");
  if (!key) return;
  const show = (id: string) => {
    const v = answers[id];
    const other = answers[otherKey(id)];
    const parts = [Array.isArray(v) ? v.join(", ") : v, typeof other === "string" && other ? `אחר: ${other}` : ""].filter(Boolean);
    return parts.join(" · ");
  };
  const rows = ALL_QUESTIONS.map((q) => [q.label, show(q.id)] as const).filter(([, v]) => v);
  const html =
    `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">` +
    `<h2 style="margin:0 0 12px">שאלון האפיון של סולודור נשלח</h2>` +
    rows.map(([k, v]) => `<p style="margin:0 0 12px"><b>${escapeHtml(k)}</b><br>${escapeHtml(v).replace(/\n/g, "<br>")}</p>`).join("") +
    `<p style="margin-top:16px"><a href="${SITE}/admin/brief">לשאלון בניהול האתר</a></p></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env("LEADS_FROM_EMAIL") || FROM_EMAIL,
        to: [env("BRIEF_NOTIFY_EMAIL") || NOTIFY_EMAIL],
        subject: "שאלון האפיון של סולודור נשלח",
        html,
      }),
    });
    if (!res.ok) console.error("brief email failed", res.status, await res.text());
  } catch (e) {
    console.error("brief email error", e);
  }
}
