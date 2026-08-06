<!--
Title follows Conventional Commits — it becomes the squash commit message.
  feat(features): add a price-offer toggle to the listing form
-->

## Why

<!-- The problem or request this answers. Link the issue or conversation if there is one. -->

## What changed

<!--
Describe behaviour, not files. A reviewer should be able to picture the result without opening
the diff. Call out anything you decided against and why, if it was a close call.
-->

## How it was verified

<!--
The commands you ran and what you looked at. `pnpm verify` is the baseline, not the whole story —
say which screens you opened, which states you exercised.
-->

- [ ] `pnpm verify`

## Review notes

<!--
Anything the reviewer would otherwise have to reverse-engineer: a non-obvious trade-off, a
follow-up you deliberately left out, a file that looks worse than it is.
Delete this section if there is nothing to say.
-->

---

<!-- Tick what applies. Delete the lines that do not. -->

- [ ] Styling uses SEED tokens only — no Tailwind defaults, no arbitrary values, no new `.css` file
- [ ] Any inline `style` carries a `// seed-escape: <reason>` comment
- [ ] Imports respect the FSD direction and reach slices through `index.ts`
- [ ] New user-facing strings exist in both `ko` and `en`
- [ ] `@seed-design/*` was bumped, so `.seed/tokens.json` and the generated token rule are regenerated and committed
- [ ] Routes changed, so `src/app/routeTree.gen.ts` is regenerated and committed
