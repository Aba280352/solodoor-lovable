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

export const Route = createFileRoute("/")({
  // The articles section shows the three latest posts; the rest of the page is static.
  loader: () => fetchLatestArticles(3).catch(() => []),
  head: () => ({
    meta: [
      { title: "SOLODOOR | ציפוי דלתות, מטבחים ומשטחים" },
      {
        name: "description",
        content:
          "סולודור: ציפויים דקורטיביים לדלתות, מטבחים, מקררים, ארונות חשמל, קירות ושיש. מעל 200 עיצובים, ייעוץ חינם והתקנה מקצועית מצפון ועד דרום.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const articles = Route.useLoaderData();
  return (
    <PageShell>
      <Hero />
      <Categories />
      <StyleFamilies />
      <Diy />
      <About />
      <Process />
      <BeforeAfter />
      <BestSellers />
      <Reviews />
      <Faq />
      <Articles articles={articles} />
    </PageShell>
  );
}
