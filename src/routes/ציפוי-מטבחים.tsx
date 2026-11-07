import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { Reviews } from "@/components/solodoor/Reviews";
import { KitchenBeforeAfter } from "@/components/solodoor/kitchen/KitchenBeforeAfter";
import { KitchenCatalog } from "@/components/solodoor/kitchen/KitchenCatalog";
import { KitchenHero } from "@/components/solodoor/kitchen/KitchenHero";
import { KitchenIntro } from "@/components/solodoor/kitchen/KitchenIntro";
import { KitchenValues } from "@/components/solodoor/kitchen/KitchenValues";
import { kitchenSeo } from "@/components/solodoor/kitchen/data";
import { rootContent, withSeo } from "@/components/solodoor/content/site-content";
import { EditableSection, useLayout } from "@/components/solodoor/content/layout";

const CANONICAL = "https://solodoor.co.il/ציפוי-מטבחים/";

// The file name is the URL. It matches the old site's slug on purpose: that page
// ranks first for "ציפוי מטבחים", so the address must not change.
export const Route = createFileRoute("/ציפוי-מטבחים")({
  head: ({ matches }) => withSeo(rootContent(matches), "/ציפוי-מטבחים", {
    meta: [
      { title: kitchenSeo.title },
      { name: "description", content: kitchenSeo.description },
      { property: "og:title", content: kitchenSeo.title },
      { property: "og:description", content: kitchenSeo.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "robots", content: "max-image-preview:large" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "בית", item: "https://solodoor.co.il/" },
            { "@type": "ListItem", position: 2, name: "ציפוי מטבחים", item: CANONICAL },
          ],
        }),
      },
    ],
  }),
  component: KitchenPage,
});

/** The page's sections, in their original order. The admin can reorder them and hide them per device. */
const KITCHEN_ORDER = ["kitchen.hero", "kitchen.intro", "kitchen.values", "kitchen.catalog", "kitchen.reviews", "kitchen.beforeAfter"];
const RENDER: Record<string, () => ReactNode> = {
  "kitchen.hero": () => <KitchenHero />,
  "kitchen.intro": () => <KitchenIntro />,
  "kitchen.values": () => <KitchenValues />,
  "kitchen.catalog": () => <KitchenCatalog />,
  "kitchen.reviews": () => <Reviews page="kitchen.reviews" />,
  "kitchen.beforeAfter": () => <KitchenBeforeAfter />,
};

function KitchenPage() {
  const layout = useLayout("/ציפוי-מטבחים", KITCHEN_ORDER);
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
