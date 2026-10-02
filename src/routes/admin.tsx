import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AdminGate } from "@/components/solodoor/admin/AdminGate";

// Hidden editing area. There are no links to it on the site, and search engines are told to skip it.
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "ניהול | SOLODOOR" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <AdminGate>
      <Outlet />
    </AdminGate>
  ),
});
