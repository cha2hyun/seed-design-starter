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

Product brand colors are not free-form Tailwind colors. Edit `brand.config.json` (light/dark
carrot-scale hex values), then run `pnpm brand:sync`. That remaps `--seed-color-palette-carrot-*`
so `bg-bg-brand-solid`, `text-fg-brand`, and SEED `brandSolid` variants follow the product.
Do not invent `bg-#hex` utilities or hand-edit the generated brand block in `global.css`.

## Before you write a className or use a component

Ask the `seed-docs` MCP server. It is declared in `.cursor/mcp.json` and needs no credentials.

- `discover_seed_docs()` — the section and category map, if you are unsure where to look
- `list_docs({ section: "react", category: "components" })` — what exists, and the `path` for each
- `get_doc({ section: "react", path: "components/action-button" })` — props and usage
- `get_doc({ section: "docs", path: "components/action-button" })` — when to use it at all
- `get_rootage({ path: "/color.json" })` — exact token names

App icons use `lucide-react`, not SEED/Karrot icon packages. `seed-lockin/no-karrot-icons`
and `pnpm verify:lockin` refuse `@karrotmarket/react-*-icon` / `@daangn/react-*-icon`, including
inside vendored snippets. The MCP `search_icons` tool is SEED reference only — do not install
those packages.

SEED packages version independently and rename tokens between majors, so recalling names from
memory is unreliable. Look them up. The MCP tool surface has shifted between minor versions too, so
call `discover_seed_docs` rather than guessing a tool name if a call fails.

Offline: `.seed/llms/` holds cached docs, and `pnpm seed:docs <component>` prints the URLs.

## Rules

1. **SEED tokens only.** Escape hatches are an inline `style` with a `// seed-escape: <reason>`
   comment above it, or a new token in the project `@theme` block of `global.css` with a comment
   explaining what SEED lacks. Brand recoloring goes through `brand.config.json`, not new tokens.
2. **No new stylesheets.** `src/app/styles/global.css` is the only CSS file and holds configuration
   only, never a selector (except the generated brand CSS-variable block).
3. **Brand via config.** Change product colors only in `brand.config.json`, then `pnpm brand:sync`.
4. **FSD import direction:** `app → pages → widgets → features → entities → shared`. Import a slice
   through its `index.ts`. `shared` is segment-based and may be imported directly.
5. **Import SEED components from `seed-design/ui/*`**, not `@seed-design/react`. Missing one? Run
   `pnpm seed:add ui:<name>`. Only `src/shared/seed/**` and `src/shared/ui/**` may use the raw
   package.
6. **Every user-facing string is translated** into Korean and English under
   `src/shared/i18n/locales/`. Korean is the source of truth and types the keys.
7. **Server state is TanStack Query, client state is Zustand.** Never copy one into the other.
8. **`pnpm verify` must pass** before you consider a task finished.

## Landing a change

`main` is the release branch and rejects direct commits. `develop` is where work integrates, and
small self-contained changes may land there directly. Anything that wants review gets a
`<type>/<kebab-summary>` branch off `develop` and a pull request back into it. Full contract in
[CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
git switch develop
git switch -c feat/price-offer-toggle   # <type>/<kebab-summary>
pnpm verify                             # identical to CI, so green here is green there
git commit                              # Conventional Commits, see below
git push -u origin HEAD
gh pr create --base develop             # title is Conventional Commits too — squash merge uses it
```

Commit format:

```
<type>(<scope>): <subject, imperative, lower case, no period, 12–72 chars>

<body: why this was needed, wrapped at 100 columns>
```

Scope is optional and must be one of `app` `pages` `widgets` `features` `entities` `shared` `seed`
`i18n` `styles` `ci` `deps` `ai` `repo`. Subjects like `update`, `changes` or `wip` are rejected.
The body says why; the diff already says what. Do not mention the tooling that made the change.

When a hook rejects you it prints the command that fixes it. Read that instead of reaching for
`--no-verify`, which only moves the failure to CI. Never amend a commit a hook rejected — fix the
cause and commit again.

Reviewing a diff? The rubric is in `.cursor/commands/review.md`, and design-system violations come
first because they fail silently.

## Commands

```bash
pnpm bootstrap        # first run: install, generate routes, sync SEED, typecheck
pnpm dev
pnpm verify           # typecheck, lint, FSD lint, format, SEED drift, brand, lock-in
pnpm seed:add ui:tabs # add a SEED snippet
pnpm seed:sync        # regenerate the token catalog and cached docs
pnpm brand:sync       # apply brand.config.json into global.css
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
