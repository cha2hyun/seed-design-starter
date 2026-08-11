# pr

Open a pull request for the current branch.

## Feature / fix PR (default)

Base is `develop`. Head is a `<type>/<kebab-summary>` branch.

1. Gather the full picture, not just the last commit. In parallel: `git status`,
   `git log develop..HEAD --oneline`, `git diff develop...HEAD --stat` and the diff itself. A pull
   request describes every commit on the branch.
2. Confirm you are on a `<type>/<kebab-summary>` branch off `develop`, not on `develop` or `main`.
3. Run `pnpm verify`. CI runs the same core job before its browser smoke matrix; opening a pull
   request with a known core failure wastes a review cycle.
4. Review your own diff first with the rubric in `.cursor/commands/review.md`. Fix what you find
   before anyone else reads it.
5. Push: `git push -u origin HEAD`.
6. Create the pull request with `gh pr create --base develop`, filling
   `.github/PULL_REQUEST_TEMPLATE.md`:

   - **Title** — Conventional Commits, because squash merge turns it into a single commit. It
     describes the branch as a whole, not the last commit.
   - **Why** — the problem this answers.
   - **What changed** — behaviour, not a file listing.
   - **How it was verified** — the commands you ran and the screens you actually opened.
   - **Review notes** — the trade-off or follow-up a reviewer would otherwise have to infer.
   - Tick only the checklist lines that apply and delete the rest.

   Pass the body through a HEREDOC.

7. Return the pull request URL.

If the diff turns out to cover several unrelated concerns, say so and offer to split it rather than
opening one pull request nobody can review in a sitting.

## Release PR (`develop` → `main`)

Follow [CONTRIBUTING.md § 릴리스](../../CONTRIBUTING.md#릴리스) before opening the PR.

1. On `develop`, bump `package.json` and update `CHANGELOG.md`, then commit
   `chore(repo): release vX.Y.Z`.
2. `pnpm verify`, push `develop`.
3. `gh pr create --base main --head develop` with the same Conventional Commits title.
4. In the body: state the SemVer bump rationale, summarise the CHANGELOG section, note that the
   merge must be a **merge commit** (not squash), and that the `release` workflow will tag
   `vX.Y.Z` on `main`.
5. Return the pull request URL. Do not merge unless the user asked you to.
