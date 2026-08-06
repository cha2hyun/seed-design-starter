/**
 * `prettier-plugin-tailwindcss` must stay last: it wraps whatever plugin precedes it.
 * `tailwindStylesheet` points at the SEED-locked entry so class sorting knows about
 * SEED's custom utilities (`t4-bold`, `p-x4`, …) instead of Tailwind's defaults.
 *
 * @type {import("prettier").Config}
 */
export default {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",

  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/styles/global.css",
  tailwindFunctions: ["cn", "clsx"],

  /**
   * Import groups follow the Feature-Sliced Design graph, top to bottom, so the
   * import block doubles as a readout of which layers a file depends on.
   */
  importOrder: [
    "^react(-dom)?(/.*)?$",
    "<THIRD_PARTY_MODULES>",
    "^@seed-design/(.*)$",
    "^@karrotmarket/(.*)$",
    "^seed-design/(.*)$",
    "^@/app/(.*)$",
    "^@/pages/(.*)$",
    "^@/widgets/(.*)$",
    "^@/features/(.*)$",
    "^@/entities/(.*)$",
    "^@/shared/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};
