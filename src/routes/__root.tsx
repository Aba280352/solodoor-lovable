// Local preview root. In Lovable, keep the template's own __root.tsx (html shell,
// QueryClient, error boundaries) and only make sure <html lang="he" dir="rtl">.
// Both load the content published in the admin and hand it to <SiteContentProvider>.
import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";

import { SiteContentProvider, fetchSiteContent } from "@/components/solodoor/content/site-content";

export const Route = createRootRoute({
  loader: () => fetchSiteContent(),
  staleTime: 60_000,
  component: RootComponent,
});

function RootComponent() {
  const content = Route.useLoaderData();
  return (
    <SiteContentProvider content={content}>
      <HeadContent />
      <Outlet />
    </SiteContentProvider>
  );
}
