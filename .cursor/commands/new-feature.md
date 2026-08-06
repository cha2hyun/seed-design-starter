# new-feature

Add a feature slice, following the layout the rest of the repository uses.

Ask for the feature's name and what the user does with it, if that is not already clear.

1. Decide the layer first. If it is a business object, it belongs in `entities`. If it is a screen,
   `pages`. A feature is one thing the user _does_.
2. Look up the SEED components you will need before writing any JSX: `list_react_components`, then
   `get_react_component` for the props. If a snippet is missing from `src/shared/seed/ui/`, add it
   with `pnpm seed:add ui:<name>`.
3. Create the slice:

   ```
   src/features/<slice>/
   ├── index.ts      explicit named re-exports
   ├── model/        zustand store, hooks, validation
   └── ui/           components
   ```

4. Add Korean and English strings to `src/shared/i18n/locales/{ko,en}/`. Korean first — it types the
   keys.
5. Wire it into a page. Do not let a feature import a page or another feature.
6. Style only with SEED tokens. Check `.cursor/rules/_generated-seed-tokens.mdc` when unsure.
7. Run `pnpm verify`.

Report which files you created, which SEED components you used and why, and anything you had to
look up.
