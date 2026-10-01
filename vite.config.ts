// Local preview harness. In Lovable this file is replaced by the project's own
// vite.config.ts (@lovable.dev/vite-tanstack-config), which already bundles the
// router, React, Tailwind and the "@/" alias.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// BASE_PATH is only set by the GitHub Pages workflow (see .github/workflows/pages.yml).
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: false }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: { port: 5173 },
});
