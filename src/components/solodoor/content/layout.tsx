/**
 * Page layout from the admin: the order of a page's sections and which are hidden on mobile or desktop
 * (key "layout:<path>"), plus the wrapper that marks a section for the visual editor.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useContentValue, useEditMode } from "./site-content";

export const layoutKey = (path: string) => `layout:${path}`;

export interface LayoutOverride {
  order?: string[];
  hide?: Record<string, { mobile?: boolean; desktop?: boolean }>;
}

/** The sections of a page in the admin's order (sections it does not know keep their place at the end). */
export function useLayout(path: string, defaults: string[]) {
  const o = useContentValue<LayoutOverride>(layoutKey(path));
  const known = new Set(defaults);
  const order = Array.isArray(o?.order) ? o.order.filter((k, i, a) => known.has(k) && a.indexOf(k) === i) : [];
  const full = [...order, ...defaults.filter((k) => !order.includes(k))];
  const hide = o?.hide && typeof o.hide === "object" ? o.hide : {};
  return { order: full, hide: (key: string) => ({ mobile: hide[key]?.mobile === true, desktop: hide[key]?.desktop === true }) };
}

/** Names of the editable parts, as the visual editor shows them. */
export const SECTION_LABELS: Record<string, string> = {
  promo: "פס מבצעים",
  nav: "תפריט עליון",
  footer: "פוטר",
  "home.hero": "באנר ראשי",
  "home.categories": "הקטגוריות שלנו",
  "home.styles": "בחרו את הסגנון",
  "home.diy": "עשה זאת בעצמך",
  "home.about": "אודות",
  "home.process": "איך זה עובד",
  "home.beforeAfter": "לפני ואחרי",
  "home.bestSellers": "הנמכרים ביותר",
  "home.reviews": "ביקורות",
  "home.faq": "שאלות נפוצות",
  "home.articles": "מדריכים ומאמרים",
};

/**
 * One section of a page. Hidden per device by the layout; in the visual editor hidden sections stay visible,
 * faded, so they can be shown again, and the wrapper carries the marks the editor selects by.
 */
export function EditableSection({ id, hide, children }: { id: string; hide?: { mobile: boolean; desktop: boolean }; children: ReactNode }) {
  const editing = useEditMode();
  const hidden = hide ?? { mobile: false, desktop: false };
  return (
    <div
      data-edit-section={id}
      data-edit-label={SECTION_LABELS[id] ?? id}
      className={cn(
        !editing && hidden.mobile && "max-lg:hidden",
        !editing && hidden.desktop && "lg:hidden",
        editing && (hidden.mobile || hidden.desktop) && "opacity-40",
      )}
    >
      {children}
    </div>
  );
}
