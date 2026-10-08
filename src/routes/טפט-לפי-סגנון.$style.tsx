import { createFileRoute, notFound } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { StyleArchive } from "@/components/solodoor/shop/StyleArchive";
import { fetchStyleItems } from "@/components/solodoor/shop/catalog";
import { stylePage } from "@/components/solodoor/shop/styles";

const SITE = "https://solodoor.co.il";

// One archive per style: /טפט-לפי-סגנון/עצים, /מומלצים, /חלקים, /אבן-ובטון.
export const Route = createFileRoute("/טפט-לפי-סגנון/$style")({
  validateSearch: (search: Record<string, unknown>): { color?: string } => ({
    color: typeof search.color === "string" && search.color ? search.color : undefined,
  }),
  loader: async ({ params }) => {
    const page = stylePage(params.style);
    if (!page) throw notFound();
    return { page, items: await fetchStyleItems() };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { page } = loaderData;
    const url = `${SITE}/טפט-לפי-סגנון/${page.slug}`;
    return {
      meta: [
        { title: `${page.title} | סולודור` },
        { name: "description", content: page.intro },
        { property: "og:title", content: `${page.title} | סולודור` },
        { property: "og:description", content: page.intro },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "טפט לפי סגנון", item: `${SITE}/טפט-לפי-סגנון` },
              { "@type": "ListItem", position: 3, name: page.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: StyleRoute,
});

function StyleRoute() {
  const { page, items } = Route.useLoaderData();
  const { color } = Route.useSearch();
  return (
    <PageShell>
      <StyleArchive key={page.slug} items={items} page={page} color={color} />
    </PageShell>
  );
}
