import { createFileRoute } from "@tanstack/react-router";

import { VisualEditor } from "@/components/solodoor/admin/VisualEditor";

export const Route = createFileRoute("/admin/editor")({
  component: VisualEditor,
});
