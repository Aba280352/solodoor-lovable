import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/components/solodoor/About";
import { Articles } from "@/components/solodoor/Articles";
import { BeforeAfter } from "@/components/solodoor/BeforeAfter";
import { BestSellers } from "@/components/solodoor/BestSellers";
import { Categories } from "@/components/solodoor/Categories";
import { Diy } from "@/components/solodoor/Diy";
import { Faq } from "@/components/solodoor/Faq";
import { Hero } from "@/components/solodoor/Hero";
import { PageShell } from "@/components/solodoor/PageShell";
import { Process } from "@/components/solodoor/Process";
import { Reviews } from "@/components/solodoor/Reviews";
import { StyleFamilies } from "@/components/solodoor/StyleFamilies";
import { fetchLatestArticles } from "@/components/solodoor/blog/articles";
import { BUSINESS_KEY, effectiveContent, rootContent, withSeo, type SiteContent } from "@/components/solodoor/content/site-content";
import { BUSINESS_DEFAULTS, cleanBusiness } from "@/components/solodoor/content/business";
import { EditableSection, useLayout } from "@/components/solodoor/content/layout";
import { FACEBOOK_URL, INSTAGRAM_URL, YOUTUBE_URL } from "@/components/solodoor/data";

const SITE = "https://solodoor.co.il";

/**
 * Who the site belongs to, for Google and AI answer engines (the name shown in results, the logo, the phone):
 * Organization + WebSite structured data. Contact details come from the admin's "פרטי העסק", like the rest of the site.
 */
function organizationSchema(content: SiteContent | undefined) {
  const business = { ...BUSINESS_DEFAULTS, ...cleanBusiness(effectiveContent(content)[BUSINESS_KEY]) };
  const phone = business.phone.replace(/\D/g, "").replace(/^0/, "+972-");
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "סולודור",
        alternateName: "SOLODOOR",
        url: `${SITE}/`,
        logo: `${SITE}/images/logo.svg`,
        email: business.email,
        telephone: phone,
        areaServed: { "@type": "Country", name: "ישראל" },
        sameAs: [INSTAGRAM_URL, FACEBOOK_URL, YOUTUBE_URL],
        contactPoint: { "@type": "ContactPoint", telephone: phone, contactType: "customer service", availableLanguage: "Hebrew" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        name: "סולודור",
        alternateName: "SOLODOOR",
        url: `${SITE}/`,
        inLanguage: "he-IL",
        publisher: { "@id": `${SITE}/#organization` },
      },
    ],
  });
}

export const Route = createFileRoute("/")({
  // The articles section shows the three latest posts; the rest of the page is static.
  loader: () => fetchLatestArticles(3).catch(() => []),
  head: ({ matches }) =>
    withSeo(rootContent(matches), "/", {
      meta: [
        { title: "סולודור | טפט לדלת, ציפוי מטבחים ומשטחים" },
        {
          name: "description",
          content:
            "סולודור: ציפויים דקורטיביים לדלתות, מטבחים, מקררים, ארונות חשמל, קירות ושיש. מעל 200 עיצובים, ייעוץ חינם והתקנה מקצועית מצפון ועד דרום.",
        },
      ],
      links: [{ rel: "canonical", href: `${SITE}/` }],
      scripts: [{ type: "application/ld+json", children: organizationSchema(rootContent(matches)) }],
    }),
  component: HomePage,
});

/** The home page sections, in their original order. The admin can reorder them and hide them per device. */
const HOME_ORDER = ["home.hero", "home.categories", "home.styles", "home.diy", "home.about", "home.process", "home.beforeAfter", "home.bestSellers", "home.reviews", "home.faq", "home.articles"];

function HomePage() {
  const articles = Route.useLoaderData();
  const layout = useLayout("/", HOME_ORDER);
  const render: Record<string, () => ReactNode> = {
    "home.hero": () => <Hero />,
    "home.categories": () => <Categories />,
    "home.styles": () => <StyleFamilies />,
    "home.diy": () => <Diy />,
    "home.about": () => <About />,
    "home.process": () => <Process />,
    "home.beforeAfter": () => <BeforeAfter />,
    "home.bestSellers": () => <BestSellers />,
    "home.reviews": () => <Reviews />,
    "home.faq": () => <Faq />,
    "home.articles": () => <Articles articles={articles} />,
  };
  return (
    <PageShell>
      {layout.order.map((key) => (
        <EditableSection key={key} id={key} hide={layout.hide(key)}>
          {render[key]()}
        </EditableSection>
      ))}
    </PageShell>
  );
}
