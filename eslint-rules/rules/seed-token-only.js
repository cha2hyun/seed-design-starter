import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import("../../.seed/tokens.json")} */
const catalog = require("../../.seed/tokens.json");

const SIDES = ["t", "r", "b", "l", "x", "y", "s", "e"];
const CORNERS = ["tl", "tr", "br", "bl", "ss", "se", "es", "ee"];

/** Bare numbers are line widths, never spacing: only stroke-like prefixes accept them. */
const LINE_WIDTHS = ["0", "1", "2", "4", "8"];

/**
 * Utility prefixes that carry a design token, mapped to the SEED namespaces whose
 * values they accept. Prefixes absent from this table are never checked — the
 * deleted Tailwind theme in `src/app/styles/global.css` is the actual enforcement,
 * so this rule optimises for precision over coverage.
 */
const TOKEN_PREFIXES = {
  bg: { namespaces: ["color"], keywords: ["cover", "contain", "fixed", "local", "scroll"] },
  text: { namespaces: ["color"], keywords: [] },
  border: { namespaces: ["color"], keywords: [...SIDES, ...LINE_WIDTHS] },
  // `border-b-2` and friends: the side is part of the prefix, the width is the value.
  ...Object.fromEntries(
    SIDES.map((side) => [`border-${side}`, { namespaces: ["color"], keywords: LINE_WIDTHS }]),
  ),
  fill: { namespaces: ["color"], keywords: [] },
  stroke: { namespaces: ["color"], keywords: LINE_WIDTHS },
  ring: { namespaces: ["color"], keywords: LINE_WIDTHS },
  outline: { namespaces: ["color"], keywords: LINE_WIDTHS },
  decoration: { namespaces: ["color"], keywords: ["line-through", "underline"] },
  accent: { namespaces: ["color"], keywords: [] },
  caret: { namespaces: ["color"], keywords: [] },
  from: { namespaces: ["color"], keywords: [] },
  via: { namespaces: ["color"], keywords: [] },
  to: { namespaces: ["color"], keywords: [] },
  shadow: { namespaces: ["shadow", "color"], keywords: [] },
  "text-size": { namespaces: ["font-size"], keywords: [] },
  font: { namespaces: ["font-weight"], keywords: ["sans", "mono", "serif"] },
  leading: { namespaces: ["line-height"], keywords: [] },
  rounded: { namespaces: ["radius"], keywords: [...SIDES, ...CORNERS] },
  ...Object.fromEntries(
    [...SIDES, ...CORNERS].map((corner) => [
      `rounded-${corner}`,
      { namespaces: ["radius"], keywords: [] },
    ]),
  ),
  duration: { namespaces: ["duration"], keywords: [] },
  easing: { namespaces: ["timing-function"], keywords: [] },
  ease: { namespaces: ["timing-function"], keywords: [] },
  ...Object.fromEntries(
    [
      "p",
      "px",
      "py",
      "pt",
      "pr",
      "pb",
      "pl",
      "m",
      "mx",
      "my",
      "mt",
      "mr",
      "mb",
      "ml",
      "w",
      "h",
      "size",
      "gap",
      "gap-x",
      "gap-y",
      "top",
      "right",
      "bottom",
      "left",
      "inset",
      "inset-x",
      "inset-y",
      "space-x",
      "space-y",
      "translate-x",
      "translate-y",
    ].map((prefix) => [prefix, { namespaces: ["dimension"], keywords: [] }]),
  ),
};

/** CSS keywords and structural values that are not design tokens. */
const KEYWORDS = new Set([
  "auto",
  "none",
  "full",
  "px",
  "0",
  "inherit",
  "initial",
  "unset",
  "current",
  "transparent",
  "screen",
  "fit",
  "min",
  "max",
  "dvw",
  "dvh",
  "svw",
  "svh",
  "lvw",
  "lvh",
  "reverse",
  "hidden",
  "solid",
  "dashed",
  "dotted",
  "double",
  "center",
  "offset",
  "left",
  "right",
  "justify",
  "start",
  "end",
  "wrap",
  "nowrap",
  "balance",
  "pretty",
  "ellipsis",
  "clip",
  "collapse",
  "separate",
  "inset",
]);

const FRACTION = /^\d+\/\d+$/;
const STATIC_UTILITIES = new Set(catalog.staticUtilities);
const PREFIXES_BY_LENGTH = Object.keys(TOKEN_PREFIXES).sort((a, b) => b.length - a.length);

/** Strips `hover:`, `md:`, `group-data-[x]:` and friends, leaving the utility itself. */
function stripVariants(className) {
  let depth = 0;
  let lastBoundary = -1;

  for (let index = 0; index < className.length; index += 1) {
    const character = className[index];
    if (character === "[" || character === "(") depth += 1;
    else if (character === "]" || character === ")") depth -= 1;
    else if (character === ":" && depth === 0) lastBoundary = index;
  }

  return className.slice(lastBoundary + 1);
}

function suggestionsFor(namespaces, value) {
  const stem = value.split("-")[0];
  const candidates = namespaces.flatMap((namespace) => catalog.namespaces[namespace] ?? []);
  const matches = candidates.filter((token) => token.includes(stem)).slice(0, 4);
  return matches.length > 0 ? matches : candidates.slice(0, 4);
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Allow only SEED design tokens inside Tailwind utility classes.",
    },
    schema: [],
    messages: {
      unknownToken:
        "`{{className}}` is outside the SEED {{namespace}} scale, so it is dropped at build time or silently escapes the design system. Try: {{suggestions}}.",
      arbitraryValue:
        "`{{className}}` hardcodes a value. Use a SEED token instead, or move the value into src/app/styles/global.css if the design system genuinely lacks it.",
    },
  },

  create(context) {
    function checkClassName(node, source) {
      for (const raw of source.split(/\s+/)) {
        if (raw.length === 0) continue;

        const className = stripVariants(raw).replace(/^!/, "").replace(/^-/, "");
        if (className.length === 0 || STATIC_UTILITIES.has(className)) continue;

        const prefix = PREFIXES_BY_LENGTH.find((candidate) =>
          className.startsWith(`${candidate}-`),
        );
        if (!prefix) continue;

        const value = className.slice(prefix.length + 1);

        if (/[[(]/.test(value)) {
          context.report({ node, messageId: "arbitraryValue", data: { className: raw } });
          continue;
        }

        const { namespaces, keywords } = TOKEN_PREFIXES[prefix];
        if (KEYWORDS.has(value) || keywords.includes(value) || FRACTION.test(value)) continue;

        const known = namespaces.some((namespace) =>
          (catalog.namespaces[namespace] ?? []).includes(value),
        );
        if (known) continue;

        context.report({
          node,
          messageId: "unknownToken",
          data: {
            className: raw,
            value,
            namespace: namespaces.join(" or "),
            suggestions: suggestionsFor(namespaces, value)
              .map((token) => `${prefix}-${token}`)
              .join(", "),
          },
        });
      }
    }

    function isClassNameContext(node) {
      let current = node.parent;
      while (current) {
        if (current.type === "JSXAttribute") {
          return current.name.name === "className";
        }
        if (
          current.type === "CallExpression" &&
          current.callee.type === "Identifier" &&
          current.callee.name === "cn"
        ) {
          return true;
        }
        if (current.type === "JSXExpressionContainer" || current.type === "JSXElement") {
          return false;
        }
        current = current.parent;
      }
      return false;
    }

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        if (!isClassNameContext(node)) return;
        checkClassName(node, node.value);
      },
      TemplateElement(node) {
        if (!isClassNameContext(node)) return;
        checkClassName(node, node.value.raw);
      },
    };
  },
};
