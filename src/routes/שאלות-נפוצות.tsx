import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { FaqPage, faqHeading } from "@/components/solodoor/faq/FaqPage";
import { fetchFaqEntries, filterFaq, selectedCategories, type FaqSearch } from "@/components/solodoor/faq/faq-items";

const SITE = "https://solodoor.co.il";

const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);

// The FAQ page. The filter lives in the URL (?cat=fridge,wall), so each view can be linked to.
export const Route = createFileRoute("/שאלות-נפוצות")({
  validateSearch: (search: Record<string, unknown>): FaqSearch => ({ cat: text(search.cat) }),
  loader: () => fetchFaqEntries(),
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const search = match.search as FaqSearch;
    const selected = selectedCategories(search);
    const { title, intro } = faqHeading(selected);
    const url = `${SITE}/שאלות-נפוצות` + (selected.length ? `?cat=${selected.join(",")}` : "");
    const shown = filterFaq(loaderData, selected);
    return {
      meta: [
        { title: `${title} | סולודור` },
        { name: "description", content: intro },
        { property: "og:title", content: `${title} | סולודור` },
        { property: "og:description", content: intro },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                mainEntity: shown.map((e) => ({
                  "@type": "Question",
                  name: e.question,
                  acceptedAnswer: { "@type": "Answer", text: e.answer },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
                  { "@type": "ListItem", position: 2, name: "שאלות נפוצות", item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: FaqRoute,
});

function FaqRoute() {
  const entries = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <PageShell>
      <FaqPage entries={entries} search={search} />
    </PageShell>
  );
}
