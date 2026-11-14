import { createFileRoute } from "@tanstack/react-router";

// The SEO brief form (src/routes/brief.$token.tsx) loads and saves here. Server only, like submit-lead.
export const Route = createFileRoute("/api/public/seo-brief")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { handleBriefGet } = await import("@/lib/brief.server");
        return handleBriefGet(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const { handleBriefPost } = await import("@/lib/brief.server");
        return handleBriefPost(request);
      },
    },
  },
} as never);
