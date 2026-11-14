import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { BRIEF_SECTIONS, isAnswered, otherKey, type BriefAnswers, type Question } from "../brief/questions";
import { db } from "./db";

interface Brief {
  answers: BriefAnswers;
  status: "draft" | "submitted";
  submitted_at: string | null;
  updated_at: string;
}

const dateFormat = new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" });

function answerText(q: Question, answers: BriefAnswers): string {
  const v = answers[q.id];
  const other = answers[otherKey(q.id)];
  return [Array.isArray(v) ? v.join(", ") : v, typeof other === "string" && other.trim() ? `אחר: ${other}` : ""].filter(Boolean).join("\n");
}

/** The whole brief as plain text, to paste into a chat or a document. */
const asText = (answers: BriefAnswers) =>
  BRIEF_SECTIONS.map((s) => `## ${s.title}\n` + s.questions.map((q) => `${q.label}\n${answerText(q, answers) || "(לא נענה)"}`).join("\n\n")).join("\n\n");

/**
 * The SEO brief as the client sent it. Read only: the database has no write policy for it, so a change is made
 * by the site owner directly in the database.
 */
export function BriefAdmin() {
  const [brief, setBrief] = useState<Brief | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    db.from("seo_briefs")
      .select("answers, status, submitted_at, updated_at")
      .eq("id", "solodoor")
      .maybeSingle()
      .then(({ data }) => setBrief((data as Brief | null) ?? null));
  }, []);

  if (brief === undefined) return <div className="h-40" />;
  if (brief === null) return <p className="fs-16">עדיין אין שאלון אפיון.</p>;

  const all = BRIEF_SECTIONS.flatMap((s) => s.questions);
  const answered = all.filter((q) => isAnswered(q, brief.answers)).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="fs-26 font-bold">שאלון אפיון SEO</h1>
          <p className="fs-15 leading-[1.6]">
            {brief.status === "submitted"
              ? `נשלח ב-${dateFormat.format(new Date(brief.submitted_at ?? brief.updated_at))}. נעול לעריכה.`
              : `עדיין לא נשלח. נענו ${answered} מתוך ${all.length} שאלות, עדכון אחרון ${dateFormat.format(new Date(brief.updated_at))}.`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(asText(brief.answers)).then(() => setCopied(true));
          }}
        >
          {copied ? "הועתק" : "העתקה כטקסט"}
        </Button>
      </div>
      {BRIEF_SECTIONS.map((s) => (
        <section key={s.id} className="rounded-lg border border-border bg-card p-5 lg:p-6">
          <h2 className="fs-20 font-bold">{s.title}</h2>
          <dl className="mt-4 flex flex-col gap-4">
            {s.questions.map((q) => {
              const text = answerText(q, brief.answers);
              return (
                <div key={q.id} className="flex flex-col gap-1 border-t border-border pt-4 first:border-t-0 first:pt-0">
                  <dt className="fs-15 font-semibold">{q.label}</dt>
                  <dd className={text ? "fs-16 leading-[1.6] whitespace-pre-line" : "fs-15 text-foreground/60"}>{text || "לא נענה"}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
