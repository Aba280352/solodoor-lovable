import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { Faq } from "@/components/solodoor/Faq";
import { Reviews } from "@/components/solodoor/Reviews";
import { DoorsAbout } from "@/components/solodoor/doors/DoorsAbout";
import { DoorsBeforeAfter } from "@/components/solodoor/doors/DoorsBeforeAfter";
import { DoorsHero } from "@/components/solodoor/doors/DoorsHero";
import { DoorsProcess } from "@/components/solodoor/doors/DoorsProcess";
import { DoorsQuote } from "@/components/solodoor/doors/DoorsQuote";
import { DoorsShop } from "@/components/solodoor/doors/DoorsShop";
import { doorsSeo } from "@/components/solodoor/doors/data";

// Landing page for paid search traffic on "ציפוי דלתות".
export const Route = createFileRoute("/ציפוי-דלתות")({
  head: () => ({
    meta: [
      { title: doorsSeo.title },
      { name: "description", content: doorsSeo.description },
      { property: "og:title", content: doorsSeo.title },
      { property: "og:description", content: doorsSeo.description },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DoorsPage,
});

function DoorsPage() {
  return (
    <PageShell>
      <DoorsHero />
      <DoorsQuote />
      <DoorsProcess />
      <DoorsBeforeAfter />
      <Reviews pill="אם עד עכשיו לא התקשרתם, תראו מה רושמים עלינו החברים!" />
      <DoorsShop />
      <DoorsAbout />
      <Faq />
    </PageShell>
  );
}
