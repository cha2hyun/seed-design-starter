/**
 * Commit messages in this repository are written by agents far more often than by hand, so the
 * rules target the two failure modes that actually show up: a subject that says nothing, and a
 * scope invented on the spot. Both produce a `git log` nobody can navigate six months later.
 *
 * @type {import("@commitlint/types").UserConfig}
 */

/** Subjects that pass Conventional Commits while telling a reviewer nothing. */
const PLACEHOLDER_SUBJECT =
  /^(wip|update|updates|updated|change|changes|changed|fix|fixes|fixed|misc|minor|stuff|various|cleanup|refactor|improvements?|tweaks?|adjustments?|apply (review )?(comments|feedback)|address (review )?(comments|feedback))$/i;

export default {
  extends: ["@commitlint/config-conventional"],

  plugins: [
    {
      rules: {
        "subject-not-placeholder": ({ subject }) => [
          !subject || !PLACEHOLDER_SUBJECT.test(subject.trim()),
          `subject "${subject}" says nothing on its own. Name what changed and where, e.g. "add a price-offer toggle to the listing form"`,
        ],
      },
    },
  ],

  rules: {
    // Scope is optional, but when present it names an area that exists in this repository.
    "scope-enum": [
      2,
      "always",
      [
        "app",
        "pages",
        "widgets",
        "features",
        "entities",
        "shared",
        "seed",
        "i18n",
        "styles",
        "ci",
        "deps",
        "ai",
        "repo",
      ],
    ],
    "header-max-length": [2, "always", 72],
    "subject-min-length": [2, "always", 12],
    "subject-not-placeholder": [2, "always"],
    "body-max-line-length": [2, "always", 100],
  },
};
