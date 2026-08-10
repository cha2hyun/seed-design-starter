const ALLOWED_PATH_SUFFIXES = ["/src/shared/ui/icons.ts", "/src/shared/ui/icons.tsx"];

/**
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid direct lucide-react imports outside the shared icon catalog (`src/shared/ui/icons.ts`).",
    },
    schema: [],
    messages: {
      banned:
        "Do not import from `lucide-react` here. Add or reuse an `Icon*` export in `src/shared/ui/icons.ts` and import it from `@/shared/ui` (e.g. `IconMoon`).",
    },
  },

  create(context) {
    const filename = context.filename.replaceAll("\\", "/");
    if (ALLOWED_PATH_SUFFIXES.some((suffix) => filename.endsWith(suffix))) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== "lucide-react") return;
        context.report({ node, messageId: "banned" });
      },
      ExportNamedDeclaration(node) {
        if (!node.source || node.source.type !== "Literal") return;
        if (node.source.value !== "lucide-react") return;
        context.report({ node: node.source, messageId: "banned" });
      },
      ExportAllDeclaration(node) {
        if (node.source?.value !== "lucide-react") return;
        context.report({ node: node.source, messageId: "banned" });
      },
    };
  },
};
