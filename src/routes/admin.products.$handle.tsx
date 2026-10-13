import { createFileRoute } from "@tanstack/react-router";

import { ProductEditor } from "@/components/solodoor/admin/ProductEditor";

// "/admin/products/<handle>" edits one product; the handle is its id in the database and in Shopify.
export const Route = createFileRoute("/admin/products/$handle")({
  component: () => {
    const { handle } = Route.useParams();
    return <ProductEditor key={handle} handle={handle} />;
  },
});
