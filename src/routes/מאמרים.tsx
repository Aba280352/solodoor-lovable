import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { BlogArchive } from "@/components/solodoor/blog/BlogArchive";
import { SITE, fetchArticles } from "@/components/solodoor/blog/articles";

const TITLE = "מאמרים - סולודור | טפט לדלת";
const DESCRIPTION = "מדריכים ומאמרים על חידוש דלתות, מטבחים, מקררים וארונות בציפוי פולימרי: השוואות, טיפים ותשובות מהניסיון של סולודור בשטח.";

// The articles archive, at the same address as on the old site.
export const Route = createFileRoute("/מאמרים")({
  loader: () => fetchArticles(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/מאמרים` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "מאמרים", item: `${SITE}/מאמרים` },
          ],
        }),
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const articles = Route.useLoaderData();
  return (
    <PageShell>
      <BlogArchive articles={articles} />
    </PageShell>
  );
}
