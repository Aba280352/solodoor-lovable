import { createFileRoute } from "@tanstack/react-router";

import { LeadsAdmin } from "@/components/solodoor/admin/LeadsAdmin";

export const Route = createFileRoute("/admin/leads")({
  component: LeadsAdmin,
});
