import { createFileRoute } from "@tanstack/react-router";

import { FaqAdmin } from "@/components/solodoor/admin/FaqAdmin";

export const Route = createFileRoute("/admin/faq")({
  component: FaqAdmin,
});
