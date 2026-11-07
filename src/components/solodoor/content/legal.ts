/**
 * The legal pages (terms, privacy, accessibility) as editable content. Each section keeps its id, so the anchors
 * (#returns, and the terms pop-up at checkout) never change. A section's text is edited as plain text:
 *   - a blank line starts a new paragraph;
 *   - a line starting with "## " is a sub-heading;
 *   - lines starting with "- " are a bulleted list;
 *   - "[טבלה]" marks a table, which stays as it is (its prices come from the price admin).
 */
import { ACCESSIBILITY, LEGAL_UPDATED, PRIVACY, TERMS, type LegalBlock, type LegalDoc } from "../legal/legal-content";
import { useSection, type SectionDef } from "./sections";

export const TABLE_MARK = "[טבלה]";

/** A section's blocks as the text the admin edits. */
export function blocksToText(blocks: LegalBlock[]): string {
  return blocks
    .map((b) => (b.type === "h" ? `## ${b.text}` : b.type === "p" ? b.text : b.type === "ul" ? b.items.map((i) => `- ${i}`).join("\n") : TABLE_MARK))
    .join("\n\n");
}

/** The edited text back into blocks; each table mark takes the section's next original table. */
export function textToBlocks(text: string, original: LegalBlock[]): LegalBlock[] {
  const tables = original.filter((b): b is Extract<LegalBlock, { type: "table" }> => b.type === "table");
  let t = 0;
  const out: LegalBlock[] = [];
  for (const chunk of text.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.length === 1 && lines[0] === TABLE_MARK) {
      if (tables[t]) out.push(tables[t++]);
      continue;
    }
    if (lines.length === 1 && lines[0].startsWith("## ")) {
      out.push({ type: "h", text: lines[0].slice(3).trim() });
      continue;
    }
    if (lines.every((l) => l.startsWith("- "))) {
      out.push({ type: "ul", items: lines.map((l) => l.slice(2).trim()) });
      continue;
    }
    out.push({ type: "p", text: lines.join(" ") });
  }
  return out;
}

const KEYS: Record<LegalDoc["path"], string> = { "/terms": "legal.terms", "/privacy-policy": "legal.privacy", "/accessibility": "legal.accessibility" };

function legalPart(doc: LegalDoc): { def: SectionDef; defaults: Record<string, unknown> } {
  return {
    def: {
      key: KEYS[doc.path],
      title: doc.name,
      page: doc.path,
      fields: [
        { name: "title", label: "כותרת ראשית (H1)", type: "text" },
        { name: "intro", label: "פסקת פתיחה", type: "textarea" },
        { name: "updated", label: "עודכן לאחרונה", type: "text" },
        {
          name: "sections",
          label: "סעיפים",
          type: "list",
          keyField: "id",
          itemLabel: "סעיף",
          hint: "שורה ריקה = פסקה חדשה. '## ' בתחילת שורה = כותרת משנה. '- ' בתחילת שורה = רשימה. [טבלה] = טבלת המחירים (נשארת כמו שהיא).",
          fields: [
            { name: "title", label: "כותרת הסעיף", type: "text" },
            {
              name: "body",
              label: "הטקסט",
              type: "textarea",
              max: 20000,
              hint: "שורה ריקה = פסקה חדשה · '## ' בתחילת שורה = כותרת משנה · '- ' בתחילת שורה = רשימה · [טבלה] = טבלת המחירים, לא למחוק",
            },
          ],
        },
      ],
    },
    defaults: {
      title: doc.title,
      intro: doc.intro,
      updated: LEGAL_UPDATED,
      sections: doc.sections.map((s) => ({ id: s.id, title: s.title, body: blocksToText(s.blocks) })),
    },
  };
}

export const LEGAL_PARTS = { terms: legalPart(TERMS), privacy: legalPart(PRIVACY), accessibility: legalPart(ACCESSIBILITY) };
export const LEGAL_SECTIONS = [LEGAL_PARTS.terms, LEGAL_PARTS.privacy, LEGAL_PARTS.accessibility];
export const legalKey = (doc: LegalDoc) => KEYS[doc.path];

/** The document in force: the code's text with the published (or previewed) edits applied. */
export function useLegalDoc(doc: LegalDoc): LegalDoc & { updated: string } {
  const part = LEGAL_SECTIONS.find((p) => p.def.key === KEYS[doc.path])!;
  const c = useSection(part.def, part.defaults) as { title: string; intro: string; updated: string; sections: { id: string; title: string; body: string }[] };
  return {
    ...doc,
    title: c.title,
    intro: c.intro,
    updated: c.updated,
    sections: c.sections.map((s) => {
      const original = doc.sections.find((o) => o.id === s.id);
      const blocks = original && s.body === blocksToText(original.blocks) ? original.blocks : textToBlocks(s.body, original?.blocks ?? []);
      return { id: s.id, title: s.title, blocks };
    }),
  };
}
