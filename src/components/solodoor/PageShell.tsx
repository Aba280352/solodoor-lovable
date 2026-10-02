import { useRef, type ReactNode } from "react";

import { useSectionReveal } from "@/hooks/use-section-reveal";
import { useSmoothWheel } from "@/hooks/use-smooth-wheel";
import { useViewportScale } from "@/hooks/use-viewport-scale";

import { PromoStrip } from "./PromoStrip";
import { QuizDialog } from "./QuizDialog";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { QuizProvider } from "./quiz-context";

/** Everything every page shares: promo strip, header, footer, the quiz and the motion hooks. */
export function PageShell({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);
  useViewportScale();
  useSectionReveal(pageRef);
  useSmoothWheel();

  return (
    <QuizProvider>
      <div ref={pageRef} dir="rtl" className="min-h-dvh w-full overflow-x-clip bg-page-texture font-sans text-foreground">
        <PromoStrip />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
      <QuizDialog />
    </QuizProvider>
  );
}
