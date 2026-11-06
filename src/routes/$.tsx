import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { encodeTarget, oldSiteRedirect } from "@/components/solodoor/content/old-site";

// Every address no other route matches (several path segments, e.g. /author/eli, /wp-content/uploads/...pdf):
// old WordPress addresses move permanently to the closest page; anything else is a real 404.
export const Route = createFileRoute("/$")({
  beforeLoad: ({ location }) => {
    const target = oldSiteRedirect(location.pathname);
    if (target) throw redirect({ href: encodeTarget(target), statusCode: 301 });
    throw notFound();
  },
});
