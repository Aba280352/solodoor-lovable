/**
 * The SEO brief Solodoor fills once, at a private link (/brief/<token>). Only what the site cannot tell us is asked:
 * the business details, products, prices, installation areas and shipping are already known.
 * Shared by the form, the server (which keeps only these answers) and the admin view.
 */
export type QuestionType = "text" | "textarea" | "single" | "multi";

export interface Question {
  id: string;
  label: string;
  help?: string;
  type: QuestionType;
  options?: string[];
  /** Adds an "אחר" choice with a free text box. */
  other?: boolean;
  required?: boolean;
  placeholder?: string;
}

export interface BriefSection {
  id: string;
  title: string;
  intro: string;
  questions: Question[];
}

export const BRIEF_SECTIONS: BriefSection[] = [
  {
    id: "business",
    title: "מה מוכר הכי טוב",
    intro: "כדי שנשקיע את המאמצים במה שמכניס הכי הרבה כסף.",
    questions: [
      {
        id: "top_revenue",
        label: "מה מכניס לכם הכי הרבה כסף היום?",
        help: "אפשר לסמן כמה.",
        type: "multi",
        required: true,
        other: true,
        options: [
          "ציפוי דלתות עם התקנה",
          "ציפוי מטבחים עם התקנה",
          "טפט לדלת בחנות (מדביקים לבד)",
          "טפט למטבח, מקרר או שיש בחנות",
          "טפטים מעוצבים לדלת",
          "שטיחי PVC",
          "ארונות חשמל",
          "קירות",
        ],
      },
      {
        id: "push_next",
        label: "מה הכי חשוב לכם למכור יותר בחצי השנה הקרובה, ולמה?",
        help: "למשל: יותר התקנות באזור המרכז, כי שם הרווח הכי גבוה.",
        type: "textarea",
        required: true,
      },
      {
        id: "sales_split",
        label: "איך מתחלקות המכירות היום?",
        type: "single",
        options: ["בעיקר התקנות", "בערך חצי התקנות וחצי חנות", "בעיקר מכירות בחנות (מדביקים לבד)"],
      },
      {
        id: "order_value",
        label: "כמה שווה בממוצע עבודת התקנה אחת? והזמנה ממוצעת בחנות?",
        type: "text",
        placeholder: "למשל: התקנה כ-1,500 ש\"ח, הזמנה בחנות כ-350 ש\"ח",
      },
      {
        id: "capacity",
        label: "כמה התקנות בשבוע אתם יכולים לקחת? ויש אזור שבו תרצו יותר עבודה, או אזור שלא משתלם לכם?",
        type: "textarea",
      },
      {
        id: "season",
        label: "יש חודשים חזקים או חלשים במיוחד?",
        help: "למשל: לפני החגים, הקיץ, עונת המעברים.",
        type: "text",
      },
    ],
  },
  {
    id: "customers",
    title: "הלקוחות שלכם",
    intro: "כמה שנבין טוב יותר מי קונה ולמה, נכתוב תוכן שמביא בדיוק אותם.",
    questions: [
      {
        id: "customer_types",
        label: "מי הלקוחות העיקריים?",
        help: "אפשר לסמן כמה.",
        type: "multi",
        other: true,
        options: [
          "בעלי דירות שמחדשים בלי שיפוץ",
          "שוכרים",
          "משקיעים ומשפצי דירות להשכרה או למכירה",
          "מעצבי פנים ואדריכלים",
          "קבלנים",
          "ועדי בתים",
          "עסקים ומשרדים",
        ],
      },
      {
        id: "customer_questions",
        label: "אילו שאלות לקוחות שואלים הכי הרבה לפני שהם קונים?",
        help: "כתבו כמו שהם שואלים בוואטסאפ, במילים שלהם. כל שאלה בשורה.",
        type: "textarea",
        required: true,
      },
      {
        id: "objections",
        label: "מה הכי עוצר אנשים מלקנות?",
        help: "אפשר לסמן כמה.",
        type: "multi",
        other: true,
        options: [
          "המחיר",
          "חשש שזה לא יחזיק או יתקלף",
          "לא בטוחים איך זה ייראה אצלם",
          "מעדיפים להחליף דלת או מטבח",
          "מפחדים להדביק לבד",
          "זמן ההמתנה להתקנה",
          "לא מכירים את המוצר בכלל",
        ],
      },
      {
        id: "customer_words",
        label: "איך הלקוחות קוראים למוצר?",
        help: "למשל: ציפוי, טפט, מדבקה, פורמייקה, חידוש דלת. גם שמות לא נכונים, הם מה שמחפשים בגוגל.",
        type: "text",
      },
      {
        id: "lead_sources",
        label: "מאיפה מגיעים אליכם לקוחות היום?",
        help: "אפשר לסמן כמה.",
        type: "multi",
        other: true,
        options: [
          "חיפוש בגוגל",
          "מודעות בגוגל",
          "פייסבוק ואינסטגרם",
          "טיקטוק",
          "המלצות מפה לאוזן",
          "מעצבים וקבלנים",
          "קבוצות וואטסאפ ופייסבוק",
        ],
      },
      {
        id: "closing_channel",
        label: "איפה רוב העסקאות נסגרות?",
        type: "single",
        options: ["בוואטסאפ", "בטלפון", "ישירות באתר, בלי לדבר איתנו", "בביקור או מדידה אצל הלקוח"],
      },
    ],
  },
  {
    id: "competition",
    title: "מתחרים ויתרון",
    intro: "מי מתחרה בכם בגוגל, ומה הסיבה האמיתית שבוחרים דווקא בכם.",
    questions: [
      {
        id: "competitors",
        label: "מי 3 עד 5 המתחרים העיקריים שלכם?",
        help: "שם ואתר, אם יש. גם מתחרים שאתם רואים מעליכם בגוגל.",
        type: "textarea",
        required: true,
      },
      {
        id: "why_us",
        label: "למה לקוח בוחר בכם ולא בהם?",
        help: "הסיבה האמיתית, כמו שלקוחות אומרים לכם.",
        type: "textarea",
        required: true,
      },
      {
        id: "proof",
        label: "מספרים ועובדות שמותר לנו לפרסם",
        help: "למשל: כמה שנים בתחום, כמה דלתות ומטבחים התקנתם, אחריות, מאיפה החומר, כמה שנים הוא מחזיק.",
        type: "textarea",
      },
    ],
  },
  {
    id: "goals",
    title: "יעדים",
    intro: "מה ייחשב הצלחה מבחינתכם, ומה אסור לנו להבטיח.",
    questions: [
      {
        id: "current_numbers",
        label: "בערך כמה הזמנות ופניות מגיעות היום מהאתר בחודש? ולכמה תרצו להגיע?",
        type: "text",
        placeholder: "למשל: היום כ-20 פניות ו-10 הזמנות, היעד 50 ו-25",
      },
      {
        id: "dream_searches",
        label: "על אילו חיפושים בגוגל הכי חשוב לכם להופיע ראשונים?",
        help: "כתבו כמו לקוח שמחפש. כל חיפוש בשורה.",
        type: "textarea",
      },
      {
        id: "avoid",
        label: "יש דברים שאסור לנו לכתוב או להבטיח?",
        help: "למשל: עמיד במים, מתאים לחוץ, מחירים מסוימים, מתחרים שלא רוצים להזכיר.",
        type: "textarea",
      },
    ],
  },
  {
    id: "assets",
    title: "חומרים ועבודה שוטפת",
    intro: "מה כבר יש לכם ביד, ואיך הכי נוח לעבוד יחד.",
    questions: [
      {
        id: "materials",
        label: "מה יש לכם שנוכל להשתמש בו?",
        help: "אפשר לסמן כמה.",
        type: "multi",
        other: true,
        options: [
          "תמונות לפני ואחרי מעבודות",
          "סרטוני התקנה",
          "ביקורות של לקוחות",
          "תמונות מהמחסן או מהעבודה",
          "מתקין או בעל מקצוע שאפשר לשאול שאלות מקצועיות",
        ],
      },
      {
        id: "materials_link",
        label: "איפה החומרים נמצאים?",
        help: "קישור לתיקייה בגוגל דרייב, לאינסטגרם, או פשוט \"אשלח בוואטסאפ\".",
        type: "text",
      },
      {
        id: "google_business",
        label: "יש לכם פרופיל עסק בגוגל (גוגל מפות)?",
        type: "single",
        options: ["כן, ואפשר לצרף אותנו כמנהלים", "כן, אבל לא בטוחים מי מנהל אותו", "לא", "לא יודעים"],
      },
      {
        id: "approvals",
        label: "מי מאשר את כותרות המאמרים, ואיך הכי נוח לכם לקבל אותן?",
        type: "single",
        other: true,
        options: ["אני, בוואטסאפ", "אני, במייל", "מישהו אחר בצוות (כתבו מי באחר)"],
      },
      {
        id: "anything_else",
        label: "עוד משהו שחשוב שנדע?",
        type: "textarea",
      },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = BRIEF_SECTIONS.flatMap((s) => s.questions);

/** The free text of an "אחר" choice is kept under this key. */
export const otherKey = (id: string) => `${id}__other`;

export type BriefAnswers = Record<string, string | string[]>;

/** Whether a question has an answer (an "אחר" text alone counts). */
export function isAnswered(q: Question, answers: BriefAnswers): boolean {
  const v = answers[q.id];
  const other = answers[otherKey(q.id)];
  if (typeof other === "string" && other.trim()) return true;
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}

/** Keeps only known answers, trimmed to safe lengths. Used by the server before saving. */
export function cleanAnswers(input: unknown): BriefAnswers {
  const out: BriefAnswers = {};
  if (!input || typeof input !== "object") return out;
  const src = input as Record<string, unknown>;
  for (const q of ALL_QUESTIONS) {
    const v = src[q.id];
    if (q.type === "multi") {
      if (Array.isArray(v)) {
        const picked = v.filter((x): x is string => typeof x === "string" && (q.options ?? []).includes(x));
        if (picked.length) out[q.id] = [...new Set(picked)];
      }
    } else if (q.type === "single") {
      if (typeof v === "string" && (q.options ?? []).includes(v)) out[q.id] = v;
    } else if (typeof v === "string" && v.trim()) {
      out[q.id] = v.replace(/\u0000/g, "").slice(0, 4000);
    }
    const o = src[otherKey(q.id)];
    if (q.other && typeof o === "string" && o.trim()) out[otherKey(q.id)] = o.replace(/\u0000/g, "").slice(0, 1000);
  }
  return out;
}
