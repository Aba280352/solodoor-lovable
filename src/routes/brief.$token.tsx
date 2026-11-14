import { createFileRoute } from "@tanstack/react-router";

import { BriefForm } from "@/components/solodoor/brief/BriefForm";

// The SEO brief, opened only from the private link sent to the client. Never indexed, no links to it.
export const Route = createFileRoute("/brief/$token")({
  head: () => ({
    meta: [{ title: "שאלון אפיון | SOLODOOR" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: function BriefPage() {
    const { token } = Route.useParams();
    return <BriefForm token={token} />;
  },
});
