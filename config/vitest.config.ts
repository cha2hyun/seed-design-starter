import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultClientConditions } from "vite";
import { defineConfig } from "vitest/config";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Deliberately not `mergeConfig(viteConfig, …)`. The app config runs the TanStack Router
 * plugin, which regenerates `routeTree.gen.ts` as a side effect, and the SEED and Tailwind
 * plugins, which exist to produce CSS. Tests assert behaviour and class *names*, never
 * computed styles, so none of that is needed and all of it is slow or has side effects.
 */
export default defineConfig({
  root: ROOT,
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    conditions: ["seed-layered", ...defaultClientConditions],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [resolve(ROOT, "config/vitest.setup.ts")],
    include: [resolve(ROOT, "src/**/*.test.{ts,tsx}")],
    restoreMocks: true,
    server: {
      // SEED components import their own `.css`. Externalised, Node tries to `require` a
      // stylesheet and throws; inlined, Vite handles the import as it does in the app.
      deps: { inline: [/@seed-design/] },
    },
  },
});
