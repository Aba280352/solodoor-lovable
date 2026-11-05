import { createFileRoute } from "@tanstack/react-router";

import { SiteContentAdmin } from "@/components/solodoor/admin/SiteContentAdmin";

export const Route = createFileRoute("/admin/site")({
  component: SiteContentAdmin,
});
