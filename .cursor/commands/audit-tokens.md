# audit-tokens

Find every place the codebase has drifted outside SEED.

1. Run `pnpm lint` and collect the `seed-lockin/*` findings.
2. Run `pnpm verify:lockin` to confirm the theme reset in `src/app/styles/global.css` still holds.
3. Search `src/` (excluding `src/shared/seed/`) for things the linter cannot see:
   - inline `style` attributes, and whether each has a `// seed-escape:` justification
   - arbitrary values: `[#`, `[1`, `px]`, `rem]`
   - hex colours and raw `px` values anywhere in `.tsx`
   - any `.css` file besides `src/app/styles/global.css`
   - imports of `@seed-design/react` outside `src/shared/seed/` and `src/shared/ui/`
4. Check the project `@theme` block in `src/app/styles/global.css`. Every token there is a token
   SEED does not provide; confirm that is still true by looking it up with `get_rootage`.
5. Report a table of findings: file, line, what escaped, and the SEED token that should replace it.
   Do not fix anything yet — wait for the user to choose.
