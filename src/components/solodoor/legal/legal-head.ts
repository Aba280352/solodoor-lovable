import { rootContent, withSeo } from "../content/site-content";
import type { LegalDoc } from "./legal-content";

const SITE = "https://solodoor.co.il";

/** Title, description, canonical address and breadcrumb data of one legal page, with the admin's SEO override. */
export function legalHead(doc: LegalDoc, matches?: readonly { loaderData?: unknown }[]) {
  const url = `${SITE}${doc.path}`;
  return withSeo(rootContent(matches), doc.path, {
    meta: [
      { title: `${doc.title} | סולודור` },
      { name: "description", content: doc.description },
      { property: "og:title", content: `${doc.title} | סולודור` },
      { property: "og:description", content: doc.description },
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
            { "@type": "ListItem", position: 2, name: doc.name, item: url },
          ],
        }),
      },
    ],
  });
}
