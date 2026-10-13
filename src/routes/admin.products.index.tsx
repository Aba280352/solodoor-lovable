import { createFileRoute } from "@tanstack/react-router";

import { ProductList } from "@/components/solodoor/admin/ProductList";

export const Route = createFileRoute("/admin/products/")({
  component: ProductList,
});
