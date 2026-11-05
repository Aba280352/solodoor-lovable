import { createFileRoute } from "@tanstack/react-router";

// The sitemap, built on every request (cached for an hour): the fixed pages, every published article and every
// product on sale. A page hidden from Google in the admin ("להסתיר מגוגל") is left out.
// The options are cast because the local preview harness has no TanStack Start server types.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { buildSitemap } = await import("@/components/solodoor/content/sitemap");
        return new Response(await buildSitemap(), {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
} as never);
