import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/components/solodoor/About";
import { Articles } from "@/components/solodoor/Articles";
import { BeforeAfter } from "@/components/solodoor/BeforeAfter";
import { BestSellers } from "@/components/solodoor/BestSellers";
import { Categories } from "@/components/solodoor/Categories";
import { Diy } from "@/components/solodoor/Diy";
import { Faq } from "@/components/solodoor/Faq";
import { Hero } from "@/components/solodoor/Hero";
import { Process } from "@/components/solodoor/Process";
import { PromoStrip } from "@/components/solodoor/PromoStrip";
import { QuizDialog } from "@/components/solodoor/QuizDialog";
import { Reviews } from "@/components/solodoor/Reviews";
import { SiteFooter } from "@/components/solodoor/SiteFooter";
import { SiteHeader } from "@/components/solodoor/SiteHeader";
import { StyleFamilies } from "@/components/solodoor/StyleFamilies";
import { QuizProvider } from "@/components/solodoor/quiz-context";
import { useSectionReveal } from "@/hooks/use-section-reveal";
import { useSmoothWheel } from "@/hooks/use-smooth-wheel";
import { useViewportScale } from "@/hooks/use-viewport-scale";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOLODOOR — ציפוי דלתות, מטבחים ומשטחים" },
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
  const pageRef = useRef<HTMLDivElement>(null);
  useViewportScale();
  useSectionReveal(pageRef);
  useSmoothWheel();

  return (
    <QuizProvider>
      <div ref={pageRef} dir="rtl" className="min-h-dvh w-full overflow-x-clip bg-page-texture font-sans text-foreground">
        <PromoStrip />
        <SiteHeader />
        <main>
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
        </main>
        <SiteFooter />
      </div>
      <QuizDialog />
    </QuizProvider>
  );
}
