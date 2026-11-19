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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "בית", item: "https://solodoor.co.il/" },
              { "@type": "ListItem", position: 2, name: "ציפוי דלתות", item: "https://solodoor.co.il/ציפוי-דלתות" },
            ],
          }),
        },
        {
          type: "application/ld+json",
          // Door cladding is the one service with installation: 250 ILS per side self order, up to 990 installed both sides.
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "ציפוי דלתות",
            serviceType: "ציפוי דלת פלדלת ודלתות פנים",
            description: doorsSeo.description,
            url: "https://solodoor.co.il/ציפוי-דלתות",
            provider: { "@id": "https://solodoor.co.il/#organization" },
            areaServed: { "@type": "Country", name: "ישראל" },
            offers: { "@type": "AggregateOffer", priceCurrency: "ILS", lowPrice: 250, highPrice: 990, offerCount: 4 },
          }),
        },
      ],
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
