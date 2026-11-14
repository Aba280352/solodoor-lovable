import { createFileRoute } from "@tanstack/react-router";

import { BriefAdmin } from "@/components/solodoor/admin/BriefAdmin";

export const Route = createFileRoute("/admin/brief")({
  component: BriefAdmin,
});
