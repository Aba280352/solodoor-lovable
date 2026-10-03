import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { StyleArchive } from "@/components/solodoor/shop/StyleArchive";
import { fetchStyleItems } from "@/components/solodoor/shop/catalog";
import { STYLE_HUB } from "@/components/solodoor/shop/styles";

const SITE = "https://solodoor.co.il";

// The main archive of wallpaper styles: every wallpaper, with a way into each style.
export const Route = createFileRoute("/טפט-לפי-סגנון/")({
  loader: () => fetchStyleItems(),
  head: () => ({
    meta: [
      { title: `${STYLE_HUB.title} | סולודור` },
      { name: "description", content: STYLE_HUB.intro },
      { property: "og:title", content: `${STYLE_HUB.title} | סולודור` },
      { property: "og:description", content: STYLE_HUB.intro },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/טפט-לפי-סגנון` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "טפט לפי סגנון", item: `${SITE}/טפט-לפי-סגנון` },
          ],
        }),
      },
    ],
  }),
  component: StyleHubRoute,
});

function StyleHubRoute() {
  const items = Route.useLoaderData();
  return (
    <PageShell>
      <StyleArchive items={items} page={null} />
    </PageShell>
  );
}
