import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

import { seedLockin } from "./eslint-rules/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Feature-Sliced Design layers, ordered from the top of the import graph down. */
const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"];

/** Layers split into slices, which must be imported through their index.ts. */
const SLICED_LAYERS = ["pages", "widgets", "features", "entities"];

/** A layer may only reach the layers below it; `app` may reach everything. */
function layersBelow(layer) {
  return LAYERS.slice(LAYERS.indexOf(layer) + 1);
}

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "src/app/routeTree.gen.ts", ".seed"],
  },

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat["recommended-latest"],

  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: ROOT,
      },
    },
    settings: {
      // Lets eslint-plugin-boundaries follow the `@/*` and `seed-design/*` aliases.
      "import/resolver": {
        typescript: { project: join(ROOT, "tsconfig.app.json") },
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "pages", pattern: "src/pages/*", capture: ["slice"] },
        { type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", capture: ["slice"] },
        { type: "shared", pattern: "src/shared" },
      ],
      "boundaries/include": ["src/**/*"],
    },
  },

  // ── Feature-Sliced Design ──────────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "{{from.element.type}} may not import {{to.element.type}}. Layers only depend downwards, and slices are reached through their index.ts.",
          policies: [
            // Third-party packages and the vendored SEED snippets are always available.
            { allow: { to: { module: { origin: "external" } } } },

            // `app` wires everything together, so it may reach any layer.
            {
              from: { element: { type: "app" } },
              allow: { to: { element: { types: { anyOf: LAYERS } } } },
            },

            // Sliced layers only reach downwards, and only through a slice's public API.
            ...SLICED_LAYERS.map((layer) => ({
              from: { element: { type: layer } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: layersBelow(layer).filter((type) => type !== "shared") },
                    internalPath: "index.ts",
                  },
                },
              },
            })),

            // `shared` has no slices; any of its segments may be imported directly.
            {
              from: { element: { types: { anyOf: LAYERS } } },
              allow: { to: { element: { type: "shared" } } },
            },
          ],
        },
      ],
    },
  },

  // ── SEED lock-in ───────────────────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "seed-lockin": seedLockin },
    rules: {
      "seed-lockin/token-only": "error",
      "seed-lockin/no-stylesheets": "error",
      "seed-lockin/no-inline-style": "error",
      "seed-lockin/no-karrot-icons": "error",
      "seed-lockin/no-direct-lucide": "error",
      "seed-lockin/icon-only-icon": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@seed-design/react",
              message:
                "Import SEED components from `seed-design/ui/*` so project-wide tweaks stay in one place. Only src/shared/seed and src/shared/ui may reach for the raw package.",
            },
          ],
          patterns: [
            {
              group: ["@seed-design/css/*"],
              message:
                "Style with SEED token utilities in className instead of importing recipe stylesheets.",
            },
          ],
        },
      ],
    },
  },
  {
    // The snippet layer and the shared primitives built on top of it are the
    // designated place to touch @seed-design/react directly.
    files: ["src/shared/seed/**/*.{ts,tsx}", "src/shared/ui/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    // Vendored snippets belong to @seed-design/cli, which overwrites them on upgrade.
    // Lint them for correctness only; project style rules would fight the generator.
    // Keep seed-lockin/no-karrot-icons and no-direct-lucide on: re-added snippets must use Icon*.
    files: ["src/shared/seed/**/*.{ts,tsx}"],
    rules: {
      "seed-lockin/token-only": "off",
      "seed-lockin/no-inline-style": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },

  // ── React ──────────────────────────────────────────────────────────────────
  {
    files: ["src/**/*.tsx"],
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // Route files must export `Route`, and snippets export types beside components.
    files: ["src/app/routes/**/*.tsx", "src/shared/seed/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },

  // ── Node-side tooling ──────────────────────────────────────────────────────
  {
    files: ["scripts/**/*.ts", "config/**/*.{ts,js}", "*.config.ts", "*.config.js"],
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: false, project: false },
    },
    ...tseslint.configs.disableTypeChecked,
  },
);
