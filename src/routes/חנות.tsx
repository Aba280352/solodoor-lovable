import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { ShopArchive } from "@/components/solodoor/shop/ShopArchive";
import { fetchShop } from "@/components/solodoor/shop/catalog";
import { activeFilters, joinList, shopHeading, type ShopSearch } from "@/components/solodoor/shop/filters";

const SITE = "https://solodoor.co.il";

const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);
// The shop archive. Filters live in the URL (?cat=door,kitchen&style=wood&color=grey),
// so every view can be linked to. Older links with ?use= or ?type= still work.
export const Route = createFileRoute("/חנות")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    cat: text(search.cat) ?? joinList([text(search.type), text(search.use)].filter((v): v is string => Boolean(v))),
    style: text(search.style),
    color: text(search.color),
    all: search.all === "y" ? "y" : undefined,
  }),
  loader: () => fetchShop(),
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const search = match.search as ShopSearch;
    const { title, intro } = shopHeading(activeFilters(search, loaderData), loaderData);
    const params = new URLSearchParams(
      Object.entries(search)
        .filter((entry): entry is [string, string] => Boolean(entry[1]) && entry[0] !== "all"),
    ).toString();
    return {
      meta: [
        { title: `${title} | סולודור` },
        { name: "description", content: intro },
        { property: "og:title", content: `${title} | סולודור` },
        { property: "og:description", content: intro },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${SITE}/חנות` + (params ? `?${decodeURIComponent(params)}` : "") }],
    };
  },
  component: ShopPage,
});

function ShopPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <PageShell>
      <ShopArchive data={data} search={search} />
    </PageShell>
  );
}
