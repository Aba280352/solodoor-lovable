import { createFileRoute } from "@tanstack/react-router";

import { ArticleEditor } from "@/components/solodoor/admin/ArticleEditor";

// "/admin/new" creates an article; "/admin/<id>" edits one.
export const Route = createFileRoute("/admin/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <ArticleEditor key={id} id={id} />;
  },
});
