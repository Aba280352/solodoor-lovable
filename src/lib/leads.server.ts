// Receives a contact form from the site, stores it in the table leads, and emails the business.
// Served by the server route /api/public/submit-lead (src/routes/api/public/submit-lead.ts).
//
// Public endpoint: anyone on the site can send a form. Safeguards: a hidden "website" field that only bots
// fill (the request is then accepted and dropped), length limits on every field, a phone or an email is
// required, and at most 8 forms per visitor (hashed IP) in 10 minutes.
//
// The email goes through Resend when the secret RESEND_API_KEY is set; without it the lead is still saved
// and shows in the admin. Optional secrets: LEADS_NOTIFY_EMAIL (default soloodoor@gmail.com) and
// LEADS_FROM_EMAIL (default "סולודור <onboarding@resend.dev>", which Resend only delivers to the address
// the Resend account was opened with, until the domain solodoor.co.il is verified there).
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const NOTIFY_EMAIL = "soloodoor@gmail.com";
const FROM_EMAIL = "סולודור <onboarding@resend.dev>";
const SITE = "https://solodoor.co.il";
const SOURCES = { door_quote: "הצעת מחיר, דף ציפוי דלתות", quiz: "שאלון התאמה", article: "טופס במאמר", footer: "טופס בתחתית האתר" } as const;
type Source = keyof typeof SOURCES;

/** Hebrew names of the extra fields some forms send. */
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

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

/** A trimmed string of at most `max` characters, or null when empty. */
const text = (value: unknown, max: number): string | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const s = String(value).replace(/\u0000/g, "").trim().slice(0, max);
  return s || null;
};

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const env = (name: string): string | undefined => (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];

export async function handleLead(request: Request): Promise<Response> {
  const raw = await request.text();
  if (raw.length > 20_000) return json(413, { ok: false, message: "הטופס ארוך מדי." });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, message: "בקשה לא תקינה." });
  }

  // Bots fill every field, people never see this one: answer as if all went well and keep nothing.
  if (text(body.website, 200)) return json(200, { ok: true });

  const source = body.source as Source;
  if (typeof source !== "string" || !(source in SOURCES)) return json(400, { ok: false, message: "בקשה לא תקינה." });

  const lead = {
    source,
    name: text(body.name, 120),
    phone: text(body.phone, 40),
    email: text(body.email, 200),
    city: text(body.city, 120),
    message: text(body.message, 4000),
    // Only a real page address is kept (the admin shows it as a link).
    page_url: /^https:\/\/[^\s"'<>]+$/.test(String(body.page_url ?? "")) ? text(body.page_url, 500) : null,
    details: {} as Record<string, string>,
  };
  if (body.details && typeof body.details === "object") {
    for (const [key, value] of Object.entries(body.details as Record<string, unknown>).slice(0, 20)) {
      const v = text(value, 500);
      if (v && /^[a-z_]{1,40}$/.test(key)) lead.details[key] = v;
    }
  }

  const digits = (lead.phone ?? "").replace(/\D/g, "");
  if (lead.phone && (digits.length < 9 || digits.length > 15)) return json(400, { ok: false, message: "מספר הטלפון לא נראה תקין." });
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return json(400, { ok: false, message: "כתובת האימייל לא נראית תקינה." });
  if (!lead.phone && !lead.email) return json(400, { ok: false, message: "צריך טלפון או אימייל כדי שנוכל לחזור אליכם." });

  const ip = (request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ipHash = ip ? await sha256(`solodoor-leads:${ip}`) : null;
  if (ipHash) {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
    if ((count ?? 0) >= 8) return json(429, { ok: false, message: "נשלחו הרבה טפסים בזמן קצר. נסו שוב בעוד כמה דקות או כתבו לנו בוואטסאפ." });
  }

  const { data: saved, error } = await supabaseAdmin.from("leads").insert({ ...lead, ip_hash: ipHash }).select("id").single();
  if (error || !saved) {
    console.error("lead insert failed", error);
    return json(500, { ok: false, message: "השליחה לא הצליחה." });
  }

  // The email is a courtesy: a failure here never loses the lead, which is already saved.
  const resendKey = env("RESEND_API_KEY");
  if (resendKey) {
    try {
      const rows: [string, string | null][] = [
        ["מקור", SOURCES[source]],
        ["שם", lead.name],
        ["טלפון", lead.phone],
        ["אימייל", lead.email],
        ["עיר / אזור", lead.city],
        ["הודעה", lead.message],
        ...Object.entries(lead.details).map(([k, v]) => [DETAIL_LABELS[k] ?? k, v] as [string, string]),
        ["נשלח מהדף", lead.page_url],
      ];
      const html =
        `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">` +
        `<h2 style="margin:0 0 12px">פנייה חדשה מהאתר</h2><table cellpadding="6" style="border-collapse:collapse">` +
        rows
          .filter(([, v]) => v)
          .map(([k, v]) => `<tr><td style="font-weight:bold;vertical-align:top">${escapeHtml(k)}</td><td>${escapeHtml(v!).replace(/\n/g, "<br>")}</td></tr>`)
          .join("") +
        `</table><p style="margin-top:16px"><a href="${SITE}/admin/leads">לכל הפניות בניהול האתר</a></p></div>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env("LEADS_FROM_EMAIL") || FROM_EMAIL,
          to: [env("LEADS_NOTIFY_EMAIL") || NOTIFY_EMAIL],
          ...(lead.email ? { reply_to: lead.email } : {}),
          subject: `פנייה חדשה מהאתר: ${lead.name ?? lead.phone ?? lead.email} (${SOURCES[source]})`,
          html,
        }),
      });
      if (res.ok) await supabaseAdmin.from("leads").update({ email_sent: true }).eq("id", saved.id);
      else console.error("resend failed", res.status, await res.text());
    } catch (e) {
      console.error("resend error", e);
    }
  }

  return json(200, { ok: true });
}
