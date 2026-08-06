import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export interface SeedTokenCatalog {
  /** SEED package versions the catalog was generated from. */
  versions: Record<string, string>;
  /** Theme namespaces, e.g. `color` -> ["fg-brand", "bg-layer-default", ...]. */
  namespaces: Record<string, string[]>;
  /** Static utility class names such as `t4-bold` or `screen-title`. */
  staticUtilities: string[];
  /** Functional utility prefixes such as `p`, `gap-x`, `rounded`. */
  functionalUtilities: string[];
}

/** Utilities Tailwind provides that carry no design token and stay allowed. */
export const TOKENLESS_UTILITY_PREFIXES = [
  "flex",
  "grid",
  "inline",
  "block",
  "hidden",
  "table",
  "contents",
  "items",
  "justify",
  "content",
  "self",
  "place",
  "order",
  "col",
  "row",
  "float",
  "clear",
  "object",
  "overflow",
  "overscroll",
  "static",
  "fixed",
  "absolute",
  "relative",
  "sticky",
  "visible",
  "invisible",
  "collapse",
  "z",
  "basis",
  "grow",
  "shrink",
  "box",
  "isolate",
  "isolation",
  "list",
  "appearance",
  "cursor",
  "pointer",
  "resize",
  "select",
  "outline",
  "border",
  "text",
  "align",
  "whitespace",
  "break",
  "truncate",
  "underline",
  "overline",
  "line",
  "no",
  "uppercase",
  "lowercase",
  "capitalize",
  "normal",
  "italic",
  "not",
  "antialiased",
  "subpixel",
  "sr",
  "transition",
  "transform",
  "rotate",
  "scale",
  "skew",
  "origin",
  "opacity",
  "min",
  "max",
  "size",
  "w",
  "h",
  "aspect",
  "container",
  "mx",
  "my",
  "ms",
  "me",
  "space",
  "backdrop",
  "will",
  "touch",
  "scroll",
  "snap",
  "sepia",
  "grayscale",
  "invert",
  "saturate",
  "contrast",
  "brightness",
  "blur",
  "filter",
] as const;

/** Reads the manifest directly: SEED packages do not expose `./package.json`. */
async function packageVersion(name: string): Promise<string> {
  const manifest = await readFile(join(ROOT, "node_modules", name, "package.json"), "utf8");
  return (JSON.parse(manifest) as { version: string }).version;
}

/**
 * Reads `@seed-design/tailwind4-theme`'s stylesheet and turns it into the catalog
 * of everything a `className` is allowed to contain.
 */
export async function buildSeedTokenCatalog(): Promise<SeedTokenCatalog> {
  // The package's only export ("." -> "./index.css") is the stylesheet itself.
  const themeEntry = require.resolve("@seed-design/tailwind4-theme");
  const source = await readFile(themeEntry, "utf8");

  const namespaces: Record<string, Set<string>> = {};
  const staticUtilities = new Set<string>();
  const functionalUtilities = new Set<string>();

  for (const [, variable] of source.matchAll(/^\s{2}--([a-z0-9_-]+):/gm)) {
    if (!variable) continue;
    const namespace = matchNamespace(variable);
    if (!namespace) continue;
    (namespaces[namespace.name] ??= new Set()).add(namespace.token);
  }

  for (const [, name] of source.matchAll(/^@utility\s+([a-z0-9_-]+(?:-\*)?)\s*\{/gm)) {
    if (!name) continue;
    if (name.endsWith("-*")) {
      functionalUtilities.add(name.slice(0, -2));
    } else {
      staticUtilities.add(name);
    }
  }

  const versionedPackages = [
    "@seed-design/tailwind4-theme",
    "@seed-design/css",
    "@seed-design/react",
  ];
  const versions = Object.fromEntries(
    await Promise.all(
      versionedPackages.map(async (name) => [name, await packageVersion(name)] as const),
    ),
  );

  return {
    versions,
    namespaces: Object.fromEntries(
      Object.entries(namespaces).map(([name, values]) => [name, [...values].sort()]),
    ),
    staticUtilities: [...staticUtilities].sort(),
    functionalUtilities: [...functionalUtilities].sort(),
  };
}

const KNOWN_NAMESPACES = [
  "color",
  "dimension",
  "duration",
  "font-size",
  "font-weight",
  "gradient-stops",
  "line-height",
  "radius",
  "scale",
  "shadow",
  "timing-function",
];

function matchNamespace(variable: string): { name: string; token: string } | null {
  for (const name of KNOWN_NAMESPACES) {
    if (variable.startsWith(`${name}-`)) {
      return { name, token: variable.slice(name.length + 1) };
    }
  }
  return null;
}
