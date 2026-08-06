const ESCAPE_HATCH = /seed-escape:\s*\S/;
const ESCAPE_LOOKBEHIND_LINES = 3;

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require a documented reason before bypassing SEED tokens with an inline style attribute.",
    },
    schema: [],
    messages: {
      inlineStyle:
        "Inline styles bypass SEED tokens. Use className, or justify it with a `// seed-escape: <reason>` comment on the line above.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "style") return;

        const line = node.loc.start.line;
        const justified = sourceCode
          .getAllComments()
          .some(
            (comment) =>
              ESCAPE_HATCH.test(comment.value) &&
              comment.loc.end.line >= line - ESCAPE_LOOKBEHIND_LINES &&
              comment.loc.end.line <= line,
          );

        if (justified) return;

        context.report({ node, messageId: "inlineStyle" });
      },
    };
  },
};
