import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { DoorsAbout } from "@/components/solodoor/doors/DoorsAbout";
import { DoorsHero } from "@/components/solodoor/doors/DoorsHero";
import { DoorsProcess } from "@/components/solodoor/doors/DoorsProcess";
import { DoorsQuote } from "@/components/solodoor/doors/DoorsQuote";
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
      <DoorsAbout />
    </PageShell>
  );
}
