import { createFileRoute } from "@tanstack/react-router";

import { ArticleList } from "@/components/solodoor/admin/ArticleList";

export const Route = createFileRoute("/admin/")({
  component: ArticleList,
});
