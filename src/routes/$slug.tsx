import { createFileRoute, notFound } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { BlogPost } from "@/components/solodoor/blog/BlogPost";
import { AUTHOR, SITE, articleImage, articleUrl, fetchArticle, fetchLatestArticles } from "@/components/solodoor/blog/articles";

// Articles live at the site root, exactly like on the old site (solodoor.co.il/<slug>).
// Fixed pages are matched first; anything else that is not an article is a 404.
export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const article = await fetchArticle(params.slug);
    if (!article) throw notFound();
    const latest = await fetchLatestArticles(4);
    return { article, related: latest.filter((a) => a.id !== article.id).slice(0, 3) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { article } = loaderData;
    const title = article.meta_title ?? article.title;
    const description = article.meta_description ?? article.excerpt ?? "";
    const url = articleUrl(article.slug);
    const image = article.featured_image ? `${SITE}${articleImage(article.featured_image)}` : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { property: "article:published_time", content: article.published_at },
        { property: "article:modified_time", content: article.updated_at },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BlogPosting",
                "@id": `${url}#blogposting`,
                headline: article.title,
                name: title,
                description,
                image,
                datePublished: article.published_at,
                dateModified: article.updated_at,
                inLanguage: "he-IL",
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
                author: { "@type": "Organization", name: AUTHOR, url: `${SITE}/` },
                publisher: { "@type": "Organization", name: "סולודור", url: `${SITE}/`, logo: { "@type": "ImageObject", url: `${SITE}/images/logo.svg` } },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
                  { "@type": "ListItem", position: 2, name: "מאמרים", item: `${SITE}/מאמרים` },
                  { "@type": "ListItem", position: 3, name: article.title, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: ArticleRoute,
});

function ArticleRoute() {
  const { article, related } = Route.useLoaderData();
  return (
    <PageShell>
      <BlogPost key={article.id} article={article} related={related} />
    </PageShell>
  );
}
