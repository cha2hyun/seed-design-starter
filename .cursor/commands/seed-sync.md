# seed-sync

Bring the repository up to date with the latest SEED release.

1. Check what is current. Ask npm for the latest versions of `@seed-design/react`,
   `@seed-design/css`, `@seed-design/tailwind4-theme`, `@seed-design/vite-plugin` and
   `@seed-design/cli`, and compare them with `package.json`. Do the same for
   `@seed-design/docs-mcp` against the pinned version in `.cursor/mcp.json`.
2. If nothing moved, say so and stop.
3. Read `get_react_changelog` from the `seed-docs` MCP server for every version being crossed, and
   summarise anything that renames a token, changes a component's props, or removes an export.
4. Upgrade with `pnpm add`, keeping `@seed-design/css` and `@seed-design/tailwind4-theme` on the
   same minor — they are peers.
5. Run `pnpm seed:sync` to regenerate `.seed/tokens.json`, the generated token rule and the cached
   docs.
6. Run `pnpm seed:compat`. If a snippet is out of date, re-add it with
   `pnpm seed:add ui:<name> --on-diff backup` and re-apply any local edits from the backup file.
7. Run `pnpm verify:lockin`. If a Tailwind utility leaked back in, the new theme no longer resets
   the same namespaces — fix `src/app/styles/global.css` before continuing.
8. Run `pnpm verify` and fix what breaks.
9. If `.cursor/mcp.json` moved, probe the new server before trusting it — its tool surface has
   changed between minor versions. Call `discover_seed_docs` and reconcile
   `.cursor/rules/40-seed-mcp.mdc` with what actually exists.
10. Report: versions before and after, breaking changes found, files touched, remaining risks.

Commit as `chore(seed): upgrade to <version>` with the regenerated files included.
