import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { rootContent, withSeo } from "@/components/solodoor/content/site-content";
import { ReviewsPage } from "@/components/solodoor/reviews/ReviewsPage";
import { isoDate, reviewCount, reviewItems } from "@/components/solodoor/reviews/reviews-data";

const SITE = "https://solodoor.co.il";
const TITLE = "ביקורות לקוחות על סולודור | חוות דעת על ציפוי דלתות ומטבחים";
const DESCRIPTION = "כל הביקורות על סולודור מגוגל במקום אחד: לקוחות שחידשו דלתות, מטבחים ומקררים בציפוי פולימרי מספרים על ההתקנה, המחיר והתוצאה.";

// All the reviews on one page. The reviews markup lives here only (once per review), attached to the Organization
// of the home page by @id, so Google does not see the same review in two places.
export const Route = createFileRoute("/ביקורות")({
  head: ({ matches }) => {
    const content = rootContent(matches);
    const items = reviewItems(content);
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE}/#organization`,
          name: "סולודור",
          url: `${SITE}/`,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: 5,
            bestRating: 5,
            worstRating: 1,
            reviewCount: reviewCount(content),
          },
          review: items.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            ...(isoDate(r.date) ? { datePublished: isoDate(r.date) } : {}),
            reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5, worstRating: 1 },
            reviewBody: r.text,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "ביקורות", item: `${SITE}/ביקורות` },
          ],
        },
      ],
    };
    return withSeo(content, "/ביקורות", {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${SITE}/ביקורות` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(schema) }],
    });
  },
  component: ReviewsRoute,
});

function ReviewsRoute() {
  return (
    <PageShell>
      <ReviewsPage />
    </PageShell>
  );
}
