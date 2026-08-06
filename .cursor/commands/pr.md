# pr

Open a pull request for the current branch.

1. Gather the full picture, not just the last commit. In parallel: `git status`,
   `git log main..HEAD --oneline`, `git diff main...HEAD --stat` and the diff itself. A pull request
   describes every commit on the branch.
2. Confirm you are not on `main`, and that the branch follows `<type>/<kebab-summary>`.
3. Run `pnpm verify`. CI runs the same command; opening a red pull request wastes a review cycle.
4. Review your own diff first with the rubric in `.cursor/commands/review.md`. Fix what you find
   before anyone else reads it.
5. Push: `git push -u origin HEAD`.
6. Create the pull request with `gh pr create`, filling `.github/PULL_REQUEST_TEMPLATE.md`:

   - **Title** — Conventional Commits, because squash merge turns it into the commit on `main`.
     It describes the branch as a whole, not the last commit.
   - **Why** — the problem this answers.
   - **What changed** — behaviour, not a file listing.
   - **How it was verified** — the commands you ran and the screens you actually opened.
   - **Review notes** — the trade-off or follow-up a reviewer would otherwise have to infer.
   - Tick only the checklist lines that apply and delete the rest.

   Pass the body through a HEREDOC.

7. Return the pull request URL.

If the diff turns out to cover several unrelated concerns, say so and offer to split it rather than
opening one pull request nobody can review in a sitting.
