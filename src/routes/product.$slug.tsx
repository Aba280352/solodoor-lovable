import { createFileRoute, notFound } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { ProductPage, currentApplication, productFaqs, productHeading } from "@/components/solodoor/shop/ProductPage";
import { DEFAULT_APPLICATION, catalogImage, fetchProduct } from "@/components/solodoor/shop/catalog";

const SITE = "https://solodoor.co.il";

const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);

// One page per design. The surface tab is part of the URL (?tab=fridge), so a visitor
// looking for a fridge wallpaper lands on the same product, on the fridge tab.
export const Route = createFileRoute("/product/$slug")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({ tab: text(search.tab) }),
  loader: async ({ params }) => {
    const data = await fetchProduct(params.slug);
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const { product } = loaderData;
    const application = currentApplication(loaderData, (match.search as { tab?: string }).tab);
    const heading = productHeading(loaderData, application);
    const description = [application?.short_description, product.short_description].filter(Boolean).join(" ");
    const url =
      `${SITE}/product/${product.slug}` +
      (application && application.slug !== DEFAULT_APPLICATION ? `?tab=${application.slug}` : "");

    const pa = loaderData.productApplications.find((p) => p.application_slug === application?.slug);
    const imagePath = pa?.image_path ?? loaderData.variants[0]?.image_path ?? loaderData.images[0]?.image_path;
    const image = imagePath ? `${SITE}${catalogImage(imagePath)}` : undefined;
    const price =
      product.product_type === "pvc_rug"
        ? (loaderData.rugSizes[0]?.price ?? product.base_price)
        : (pa?.price_override ?? application?.unit_price ?? product.base_price);
    const faqs = productFaqs(loaderData, application);

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: heading,
        description,
        image,
        brand: { "@type": "Brand", name: "SOLODOOR" },
        offers: { "@type": "Offer", url, priceCurrency: "ILS", price: Number(price), availability: "https://schema.org/InStock" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "חנות", item: `${SITE}/חנות` },
          { "@type": "ListItem", position: 3, name: heading, item: url },
        ],
      },
      ...(faqs.length
        ? [
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
    ];

    return {
      meta: [
        { title: `${heading} | סולודור` },
        { name: "description", content: description },
        { property: "og:title", content: `${heading} | סולודור` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(image ? [{ property: "og:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: jsonLd.map((item) => ({ type: "application/ld+json", children: JSON.stringify(item) })),
    };
  },
  component: ProductRoute,
});

function ProductRoute() {
  const data = Route.useLoaderData();
  const { tab } = Route.useSearch();
  return (
    <PageShell>
      <ProductPage key={data.product.handle} data={data} tab={tab} />
    </PageShell>
  );
}
