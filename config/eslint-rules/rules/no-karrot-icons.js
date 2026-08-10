const BANNED = [
  /^@karrotmarket\/react-monochrome-icon(?:\/|$)/,
  /^@karrotmarket\/react-multicolor-icon(?:\/|$)/,
  /^@daangn\/react-monochrome-icon(?:\/|$)/,
  /^@daangn\/react-multicolor-icon(?:\/|$)/,
];

function isBanned(source) {
  return BANNED.some((pattern) => pattern.test(source));
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid Karrot/SEED icon packages; this starter uses lucide-react for icons.",
    },
    schema: [],
    messages: {
      banned:
        "Do not import `{{source}}`. Re-export the glyph from `src/shared/ui/icons.ts` as `Icon*` and import it from `@/shared/ui` (e.g. `IconChevronRight`).",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string" || !isBanned(source)) return;
        context.report({ node, messageId: "banned", data: { source } });
      },
      ExportNamedDeclaration(node) {
        if (!node.source || node.source.type !== "Literal") return;
        const source = node.source.value;
        if (typeof source !== "string" || !isBanned(source)) return;
        context.report({ node: node.source, messageId: "banned", data: { source } });
      },
      ExportAllDeclaration(node) {
        const source = node.source?.value;
        if (typeof source !== "string" || !isBanned(source)) return;
        context.report({ node: node.source, messageId: "banned", data: { source } });
      },
      CallExpression(node) {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "require" ||
          node.arguments.length === 0
        ) {
          return;
        }
        const arg = node.arguments[0];
        if (arg.type !== "Literal" || typeof arg.value !== "string") return;
        if (!isBanned(arg.value)) return;
        context.report({ node: arg, messageId: "banned", data: { source: arg.value } });
      },
    };
  },
};
