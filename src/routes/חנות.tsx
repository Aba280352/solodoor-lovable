import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { rootContent, withSeo } from "@/components/solodoor/content/site-content";
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
    rec: search.rec === "y" ? "y" : undefined,
  }),
  loader: () => fetchShop(),
  head: ({ loaderData, match, matches }) => {
    if (!loaderData) return {};
    const search = match.search as ShopSearch;
    const filters = activeFilters(search, loaderData);
    const { title, intro } = shopHeading(filters, loaderData);
    // The canonical address keeps only real filters (a known category, style or colour), so links with other or
    // unknown parameters (?sort=, ?q=, ?cat=xyz) count as the page they show, not as pages of their own.
    const params = new URLSearchParams(
      (
        [
          ["cat", filters.cats.join(",")],
          ["style", filters.styles.join(",")],
          ["color", filters.colors.join(",")],
          ["rec", filters.recommended ? "y" : ""],
        ] as [string, string][]
      ).filter(([, v]) => v),
    ).toString();
    const head = {
      meta: [
        { title: `${title} | סולודור` },
        { name: "description", content: intro },
        { property: "og:title", content: `${title} | סולודור` },
        { property: "og:description", content: intro },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${SITE}/חנות` + (params ? `?${decodeURIComponent(params)}` : "") }],
    };
    // The admin's SEO override is for the shop itself; filtered views keep their computed titles.
    return params ? head : withSeo(rootContent(matches), "/חנות", head);
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
