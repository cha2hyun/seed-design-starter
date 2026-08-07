import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `prettier-plugin-tailwindcss` must stay last: it wraps whatever plugin precedes it.
 * `tailwindStylesheet` must be absolute — the plugin resolves relative paths from the
 * file being formatted, not from this config.
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
  tailwindStylesheet: join(ROOT, "src/app/styles/global.css"),
  tailwindFunctions: ["cn", "clsx"],

  /**
   * Import groups follow the Feature-Sliced Design graph, top to bottom, so the
   * import block doubles as a readout of which layers a file depends on.
   */
  importOrder: [
    "^react(-dom)?(/.*)?$",
    "<THIRD_PARTY_MODULES>",
    "^@seed-design/(.*)$",
    "^lucide-react(/.*)?$",
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

  overrides: [
    {
      // Cursor rule files are markdown with YAML front matter; Prettier cannot infer that.
      files: "*.mdc",
      options: { parser: "markdown" },
    },
  ],
};
