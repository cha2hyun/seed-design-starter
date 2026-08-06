# commit

Commit the current work the way this repository expects.

1. Look before you write. Run `git status`, `git diff`, `git diff --staged` and `git log --oneline -5`
   in parallel so you know what changed and what the recent messages read like.
2. Check the branch. `git rev-parse --abbrev-ref HEAD`. If it is `main`, create one now:
   `git switch -c <type>/<kebab-summary>` — staged changes come along.
3. Decide whether this is one commit or several. If the diff mixes a refactor with a behaviour
   change, stage and commit them separately so each one can be reviewed on its own.
4. Run `pnpm verify`. Fixing a failure now costs less than fixing it after the push hook rejects it.
5. Stage deliberately. Do not `git add -A` without reading what it picks up. Never stage `.env` or
   anything that looks like a credential.
6. Write the message:

   ```
   <type>(<scope>): <subject, imperative, lower case, no period, 12–72 chars>

   <body: why, wrapped at 100 columns. Omit when the subject is self-evident.>
   ```

   Scope is optional and must come from the list in CONTRIBUTING.md. The body explains why, not
   what — the diff already covers what. Do not mention the tooling that produced the change.

7. Commit with a HEREDOC so the formatting survives.
8. If a hook rejects the commit, read its output and fix the cause. `--no-verify` is not an option.
   A rejected commit is never amended: fix and commit again.
9. Run `git status` to confirm, then report the commit line and what is left uncommitted.

Only amend when the user asks, or when a hook modified files during a commit that succeeded — and
only if that commit has not been pushed.
