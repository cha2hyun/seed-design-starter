/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      ["app", "pages", "widgets", "features", "entities", "shared", "seed", "ai", "deps", "ci"],
    ],
  },
};
