// Local preview root. In Lovable, keep the template's own __root.tsx (html shell,
// QueryClient, error boundaries) and only make sure <html lang="he" dir="rtl">.
import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
});
