import { createFileRoute, redirect } from "@tanstack/react-router";

// The old site had a landing page for the PVC rugs (solodoor.co.il/שטיחי-pvc-מעוצבים/); the rugs now live in the shop.
export const Route = createFileRoute("/שטיחי-pvc-מעוצבים")({
  beforeLoad: () => {
    throw redirect({ to: "/חנות", search: { cat: "pvc_rug" }, statusCode: 301 });
  },
});
