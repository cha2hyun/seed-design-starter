import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultClientConditions, defineConfig, type Plugin } from "vite";

import { seedDesignPlugin } from "@seed-design/vite-plugin";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Must match the `@layer` statement at the top of src/app/styles/global.css.
 * Inlining it as the first thing in <head> keeps the layer order stable even when
 * the bundler splits CSS into chunks that load in a different order.
 */
const SEED_LAYER_ORDER = "@layer theme, base, seed-base, components, seed-components, utilities;";

function seedLayerOrder(): Plugin {
  return {
    name: "seed-layer-order",
    transformIndexHtml() {
      return [{ tag: "style", children: SEED_LAYER_ORDER, injectTo: "head-prepend" }];
    },
  };
}

export default defineConfig({
  root: ROOT,
  // Keep secrets and mode files under env/ instead of the repository root.
  envDir: resolve(ROOT, "env"),
  plugins: [
    // Must be first — strips Devtools from production and enables source/console piping.
    devtools(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: resolve(ROOT, "src/app/routes"),
      generatedRouteTree: resolve(ROOT, "src/app/routeTree.gen.ts"),
      quoteStyle: "double",
      semicolons: true,
    }),
    react(),
    tailwindcss(),
    seedDesignPlugin({ colorMode: "system" }),
    seedLayerOrder(),
  ],
  resolve: {
    tsconfigPaths: true,
    // Makes SEED React components import their `@layer`-wrapped stylesheets so that
    // Tailwind utilities can override component styles.
    conditions: ["seed-layered", ...defaultClientConditions],
  },
  server: {
    port: 5173,
  },
});
