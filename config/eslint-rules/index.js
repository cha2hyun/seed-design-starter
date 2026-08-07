import noInlineStyle from "./rules/no-inline-style.js";
import noKarrotIcons from "./rules/no-karrot-icons.js";
import noStylesheets from "./rules/no-stylesheets.js";
import seedTokenOnly from "./rules/seed-token-only.js";

/**
 * Local ESLint plugin that keeps the project inside the SEED design system.
 *
 * These rules are fast feedback, not the enforcement mechanism: the real guarantee
 * is that `src/app/styles/global.css` deletes Tailwind's built-in theme, so a
 * non-SEED utility emits no CSS at all.
 */
export const seedLockin = {
  meta: { name: "seed-lockin", version: "1.0.0" },
  rules: {
    "token-only": seedTokenOnly,
    "no-stylesheets": noStylesheets,
    "no-inline-style": noInlineStyle,
    "no-karrot-icons": noKarrotIcons,
  },
};

export default seedLockin;
