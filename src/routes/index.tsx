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

export const Route = createFileRoute("/")({
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
      <Articles />
    </PageShell>
  );
}
