# start

Read this before touching anything in the repository. It is the entry point for every agent session.

## What this repository is

A Vite + React + TypeScript starter that is locked in to SEED, Danggeun's design system, and
structured with Feature-Sliced Design. Every colour, spacing, radius, shadow and text style comes
from `@seed-design/*`. Tailwind's own theme has been deleted, so a non-SEED utility such as
`bg-red-500` or `p-4` produces no CSS at all.

## Your ground rules

1. **SEED is the source of truth.** Before writing a `className` or reaching for a component,
   confirm the token or component exists by calling the `seed-docs` MCP server
   (`discover_seed_docs`, `list_docs`, `get_doc`, `get_rootage`). Do not guess
   token names from memory: they change between versions. App icons are the `Icon*` exports from
   `@/shared/ui`; never import `lucide-react` or Karrot/SEED icon packages in feature code.
2. **The installed version is the version that matters.** `.seed/tokens.json` and
   `.cursor/rules/_generated-seed-tokens.mdc` are generated from the packages actually installed
   here. When they disagree with the documentation, they win.
3. **Follow the FSD import direction.** `app → pages → widgets → features → entities → shared`.
   Slices are imported through their `index.ts`. ESLint enforces this.
4. **No stylesheets.** `src/app/styles/global.css` is the only CSS file and it holds configuration
   only. Style with SEED token utilities in `className`.
5. **Both languages, always.** Every user-facing string goes through i18next with a Korean and an
   English entry.

## Do this now

1. Report the SEED versions from `.seed/tokens.json` and whether they match `package.json`.
2. Call `discover_seed_docs` on the `seed-docs` MCP server and confirm it responds. If it does not,
   use `.seed/llms/`, `pnpm seed:docs <component>` and the installed snippet as offline sources;
   report the fallback instead of stopping unrelated work.
3. Run `pnpm verify` and report the result.
4. Summarise, in three or four sentences, what the blueprint app does and which files a new
   feature would touch.

Then wait for the user's actual task.
