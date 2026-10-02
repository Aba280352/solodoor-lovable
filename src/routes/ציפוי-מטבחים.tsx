import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { Reviews } from "@/components/solodoor/Reviews";
import { KitchenBeforeAfter } from "@/components/solodoor/kitchen/KitchenBeforeAfter";
import { KitchenCatalog } from "@/components/solodoor/kitchen/KitchenCatalog";
import { KitchenHero } from "@/components/solodoor/kitchen/KitchenHero";
import { KitchenIntro } from "@/components/solodoor/kitchen/KitchenIntro";
import { KitchenValues } from "@/components/solodoor/kitchen/KitchenValues";
import { kitchenSeo } from "@/components/solodoor/kitchen/data";

const CANONICAL = "https://solodoor.co.il/ציפוי-מטבחים/";

// The file name is the URL. It matches the old site's slug on purpose: that page
// ranks first for "ציפוי מטבחים", so the address must not change.
export const Route = createFileRoute("/ציפוי-מטבחים")({
  head: () => ({
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

function KitchenPage() {
  return (
    <PageShell>
      <KitchenHero />
      <KitchenIntro />
      <KitchenValues />
      <KitchenCatalog />
      <Reviews pill="אם עד עכשיו לא התקשרתם, תראו מה רושמים עלינו החברים!" />
      <KitchenBeforeAfter />
    </PageShell>
  );
}
