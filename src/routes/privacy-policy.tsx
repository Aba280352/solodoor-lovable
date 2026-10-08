import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/solodoor/PageShell";
import { LegalPage } from "@/components/solodoor/legal/LegalPage";
import { PRIVACY } from "@/components/solodoor/legal/legal-content";
import { legalHead } from "@/components/solodoor/legal/legal-head";

// Same address as the old site's privacy page, so existing links keep working.
export const Route = createFileRoute("/privacy-policy")({
  head: () => legalHead(PRIVACY),
  component: () => (
    <PageShell>
      <LegalPage doc={PRIVACY} />
    </PageShell>
  ),
});
