const STYLESHEET = /\.(css|scss|sass|less|styl)$/;

/** The project's single allowed stylesheet, and the only file allowed to import it. */
const GLOBAL_STYLESHEET = "./styles/global.css";
const GLOBAL_STYLESHEET_IMPORTER = "src/app/main.tsx";

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Keep styling in Tailwind utilities by allowing a single global stylesheet.",
    },
    schema: [],
    messages: {
      noStylesheet:
        "This project has no stylesheets beyond src/app/styles/global.css. Express `{{source}}` with SEED token utilities in className instead.",
    },
  },

  create(context) {
    const filename = context.filename.replaceAll("\\", "/");

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string" || !STYLESHEET.test(source)) return;

        const isGlobalEntry =
          source === GLOBAL_STYLESHEET && filename.endsWith(GLOBAL_STYLESHEET_IMPORTER);
        if (isGlobalEntry) return;

        // SEED ships its own component stylesheets; those are part of the design system.
        if (source.startsWith("@seed-design/")) return;

        context.report({ node, messageId: "noStylesheet", data: { source } });
      },
    };
  },
};
