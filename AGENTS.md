# AGENTS.md

Instructions for any AI agent working in this repository. Cursor additionally reads
`.cursor/rules/`, which covers the same ground in more depth.

## What this is

A Vite + React + TypeScript starter locked in to SEED, Danggeun's design system, and structured with
Feature-Sliced Design.

## The one thing to understand first

`src/app/styles/global.css` deletes Tailwind's entire built-in theme with `@theme { --*: initial; }`
and replaces it with SEED's. So `bg-red-500`, `p-4`, `text-lg`, `rounded-md` and `max-w-3xl`
**produce no CSS at all** — they are not errors, they are silent no-ops that leave the element
unstyled.

Use SEED tokens: `bg-bg-layer-default`, `p-x4`, `t4-bold`, `rounded-r4`, `shadow-s1`, `gap-x3`.
The valid set for the installed version is in `.seed/tokens.json` and
`.cursor/rules/_generated-seed-tokens.mdc`.

## Before you write a className or use a component

Ask the `seed-docs` MCP server. It is declared in `.cursor/mcp.json` and needs no credentials.

- `list_react_components` / `get_react_component({ componentName })` — what exists, what props
- `get_rootage({ path: "/color.json" })` — exact token names
- `search_icons({ query })` — icons, Korean queries work
- `get_docs_component({ componentName })` — when a component should be used

SEED packages version independently and rename tokens between majors, so recalling names from
memory is unreliable. Look them up.

Offline: `.seed/llms/` holds cached docs, and `pnpm seed:docs <component>` prints the URLs.

## Rules

1. **SEED tokens only.** Escape hatches are an inline `style` with a `// seed-escape: <reason>`
   comment above it, or a new token in the project `@theme` block of `global.css` with a comment
   explaining what SEED lacks.
2. **No new stylesheets.** `src/app/styles/global.css` is the only CSS file and holds configuration
   only, never a selector.
3. **FSD import direction:** `app → pages → widgets → features → entities → shared`. Import a slice
   through its `index.ts`. `shared` is segment-based and may be imported directly.
4. **Import SEED components from `seed-design/ui/*`**, not `@seed-design/react`. Missing one? Run
   `pnpm seed:add ui:<name>`. Only `src/shared/seed/**` and `src/shared/ui/**` may use the raw
   package.
5. **Every user-facing string is translated** into Korean and English under
   `src/shared/i18n/locales/`. Korean is the source of truth and types the keys.
6. **Server state is TanStack Query, client state is Zustand.** Never copy one into the other.
7. **`pnpm verify` must pass** before you consider a task finished.

## Commands

```bash
pnpm bootstrap        # first run: install, generate routes, sync SEED, typecheck
pnpm dev
pnpm verify           # typecheck, lint, FSD lint, format, SEED drift, lock-in
pnpm seed:add ui:tabs # add a SEED snippet
pnpm seed:sync        # regenerate the token catalog and cached docs
pnpm seed:compat      # check snippets against installed SEED versions
```

## Where things live

```
src/
├── app/         providers, routes, router, the single stylesheet
├── pages/       one screen per slice
├── widgets/     composite blocks
├── features/    one user action per slice
├── entities/    business objects: types, api, presentation
└── shared/      api, config, lib, ui, i18n, seed (CLI snippets)
```

## After bumping a @seed-design/* dependency

Run `pnpm seed:sync`, then `pnpm seed:compat`, then `pnpm verify:lockin`, and commit the regenerated
files. CI fails if they are stale.
