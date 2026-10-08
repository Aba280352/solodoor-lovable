import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { LegalPage } from "@/components/solodoor/legal/LegalPage";
import { ACCESSIBILITY } from "@/components/solodoor/legal/legal-content";
import { legalHead } from "@/components/solodoor/legal/legal-head";

// Same address as the old site's accessibility statement, so existing links keep working.
export const Route = createFileRoute("/accessibility")({
  head: () => legalHead(ACCESSIBILITY),
  component: () => (
    <PageShell>
      <LegalPage doc={ACCESSIBILITY} />
    </PageShell>
  ),
});
