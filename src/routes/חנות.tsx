import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { ShopArchive, shopHeading, type ShopSearch } from "@/components/solodoor/shop/ShopArchive";
import { fetchShop, type ProductType } from "@/components/solodoor/shop/catalog";

const SITE = "https://solodoor.co.il";
const TYPES: ProductType[] = ["wallpaper", "designed_door", "pvc_rug"];

const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);

// The shop archive. Filters live in the URL (?type, ?use, ?style), so every view can be linked to.
export const Route = createFileRoute("/חנות")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    type: TYPES.find((t) => t === search.type),
    use: text(search.use),
    style: text(search.style),
  }),
  loader: () => fetchShop(),
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const search = match.search as ShopSearch;
    const { title, intro } = shopHeading(search, loaderData);
    const params = new URLSearchParams(
      Object.entries(search).filter((entry): entry is [string, string] => Boolean(entry[1])),
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
