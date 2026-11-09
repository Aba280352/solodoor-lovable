import { createFileRoute } from "@tanstack/react-router";

// The product feed Google Merchant Center fetches every day. Built from the database on request (kept for ten
// minutes), so a price or a new product reaches Google without anyone uploading a file.
// The options are cast because the local preview harness has no TanStack Start server types.
export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { buildFeed } = await import("@/components/solodoor/content/merchant-feed");
          return new Response(await buildFeed(), {
            headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600", "X-Robots-Tag": "noindex" },
          });
        } catch {
          return new Response("The feed is not available right now.", { status: 503, headers: { "Retry-After": "300" } });
        }
      },
    },
  },
} as never);
