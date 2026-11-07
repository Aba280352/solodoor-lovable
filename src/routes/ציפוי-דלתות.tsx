import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { Faq } from "@/components/solodoor/Faq";
import { Reviews } from "@/components/solodoor/Reviews";
import { DoorsAbout } from "@/components/solodoor/doors/DoorsAbout";
import { DoorsBeforeAfter } from "@/components/solodoor/doors/DoorsBeforeAfter";
import { DoorsHero } from "@/components/solodoor/doors/DoorsHero";
import { DoorsProcess } from "@/components/solodoor/doors/DoorsProcess";
import { DoorsQuote } from "@/components/solodoor/doors/DoorsQuote";
import { DoorsShop } from "@/components/solodoor/doors/DoorsShop";
import { doorsSeo } from "@/components/solodoor/doors/data";
import { rootContent, withSeo } from "@/components/solodoor/content/site-content";
import { EditableSection, useLayout } from "@/components/solodoor/content/layout";

// Landing page for paid search traffic on "ציפוי דלתות".
export const Route = createFileRoute("/ציפוי-דלתות")({
  head: ({ matches }) =>
    withSeo(rootContent(matches), "/ציפוי-דלתות", {
      meta: [
        { title: doorsSeo.title },
        { name: "description", content: doorsSeo.description },
        { property: "og:title", content: doorsSeo.title },
        { property: "og:description", content: doorsSeo.description },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: "https://solodoor.co.il/ציפוי-דלתות" }],
    }),
  component: DoorsPage,
});

/** The page's sections, in their original order. The admin can reorder them and hide them per device. */
const DOORS_ORDER = ["doors.hero", "doors.quote", "doors.process", "doors.beforeAfter", "doors.reviews", "doors.shop", "doors.about", "doors.faq"];
const RENDER: Record<string, () => ReactNode> = {
  "doors.hero": () => <DoorsHero />,
  "doors.quote": () => <DoorsQuote />,
  "doors.process": () => <DoorsProcess />,
  "doors.beforeAfter": () => <DoorsBeforeAfter />,
  "doors.reviews": () => <Reviews page="doors.reviews" />,
  "doors.shop": () => <DoorsShop />,
  "doors.about": () => <DoorsAbout />,
  "doors.faq": () => <Faq />,
};

function DoorsPage() {
  const layout = useLayout("/ציפוי-דלתות", DOORS_ORDER);
  return (
    <PageShell>
      {layout.order.map((key) => (
        <EditableSection key={key} id={key} hide={layout.hide(key)}>
          {RENDER[key]()}
        </EditableSection>
      ))}
    </PageShell>
  );
}
