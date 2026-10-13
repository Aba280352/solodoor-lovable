import { createFileRoute } from "@tanstack/react-router";

import { InfoTabsAdmin } from "@/components/solodoor/admin/InfoTabsAdmin";

export const Route = createFileRoute("/admin/content")({
  component: InfoTabsAdmin,
});
