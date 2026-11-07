// Local preview root. In Lovable, keep the template's own __root.tsx (html shell,
// QueryClient, error boundaries) and only make sure <html lang="he" dir="rtl">.
// Both load the content published in the admin and hand it to <SiteContentProvider>.
import { HeadContent, Outlet, createRootRoute, redirect } from "@tanstack/react-router";

import { NotFoundPage } from "@/components/solodoor/NotFoundPage";
import { slashRedirect } from "@/components/solodoor/content/old-site";
import { SiteContentProvider, fetchSiteContent } from "@/components/solodoor/content/site-content";

export const Route = createRootRoute({
  // An address with a trailing slash moves permanently (301), in one step, to its final page. The router is set to
  // trailingSlash: "preserve" so this runs instead of its own temporary (307) redirect.
  beforeLoad: ({ location }) => {
    const target = slashRedirect(location.pathname, location.searchStr);
    if (target) throw redirect({ href: target, statusCode: 301 });
  },
  loader: () => fetchSiteContent(),
  staleTime: 60_000,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
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
