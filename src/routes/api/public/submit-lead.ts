import { createFileRoute } from "@tanstack/react-router";

// The site's contact forms post here (see src/components/solodoor/leads.ts). Server only: the handler
// is loaded inside the request so the service-role client never reaches the browser bundle.
// The options are cast because the local preview harness has no TanStack Start server types.
export const Route = createFileRoute("/api/public/submit-lead")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { handleLead } = await import("@/lib/leads.server");
        return handleLead(request);
      },
    },
  },
} as never);
