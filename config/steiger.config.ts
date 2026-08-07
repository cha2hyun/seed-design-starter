import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ["./src/shared/seed/**", "./src/app/routeTree.gen.ts"],
  },
  {
    rules: {
      // This repository is a blueprint: every slice exists to demonstrate its layer,
      // so a slice with a single consumer is the intended shape, not a smell.
      "fsd/insignificant-slice": "off",
    },
  },
  {
    files: ["./src/app/**"],
    rules: {
      // `providers` and `routes` are the conventional app-layer segments.
      "fsd/segments-by-purpose": "off",
    },
  },
  {
    files: ["./src/shared/**"],
    rules: {
      // `shared` is segment-based (api, config, lib, ui, i18n, seed), not sliced.
      "fsd/insignificant-slice": "off",
    },
  },
]);
