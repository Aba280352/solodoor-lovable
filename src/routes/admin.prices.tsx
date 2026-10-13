import { createFileRoute } from "@tanstack/react-router";

import { PricesPage } from "@/components/solodoor/admin/PricesPage";

export const Route = createFileRoute("/admin/prices")({
  component: PricesPage,
});
