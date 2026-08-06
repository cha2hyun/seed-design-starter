import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig, type Plugin } from "vite";

import { seedDesignPlugin } from "@seed-design/vite-plugin";

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
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "src/app/routes",
      generatedRouteTree: "src/app/routeTree.gen.ts",
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
