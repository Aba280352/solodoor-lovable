import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { LegalPage } from "@/components/solodoor/legal/LegalPage";
import { TERMS } from "@/components/solodoor/legal/legal-content";
import { legalHead } from "@/components/solodoor/legal/legal-head";

// The terms of use. There was no such page on the old site, so the address is new.
export const Route = createFileRoute("/terms")({
  head: ({ matches }) => legalHead(TERMS, matches),
  component: () => (
    <PageShell>
      <LegalPage doc={TERMS} />
    </PageShell>
  ),
});
