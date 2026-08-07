#!/bin/sh
# Sourced by .husky/pre-commit.
#
# Branch model:
#   main       release branch. Only ever receives a merge from develop, never a direct commit.
#   develop    integration branch. Small changes may land here directly.
#   <type>/... short-lived work branch, opened from develop and merged back through a pull request.
#
# The guard exists because an agent commits far more often than it reads this file, so the
# invariants have to be enforced where the mistake happens.

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Detached HEAD means rebase, bisect or cherry-pick. Stay out of the way.
if [ "$branch" = "HEAD" ] || [ -z "$branch" ]; then
  exit 0
fi

if [ "$branch" = "main" ]; then
  if [ "${ALLOW_MAIN_COMMIT:-0}" = "1" ]; then
    exit 0
  fi
  cat >&2 <<'EOF'

✖ main is the release branch. It only receives merges from develop.

  Commit on develop, or on a branch off it:

    git switch develop
    git switch -c feat/<what-this-does>

  Already staged? The staged files come along with the switch.
  ALLOW_MAIN_COMMIT=1 exists for repository bootstrap only.

EOF
  exit 1
fi

# develop is the integration branch and takes commits directly.
if [ "$branch" = "develop" ]; then
  exit 0
fi

case "$branch" in
  feat/* | fix/* | docs/* | refactor/* | perf/* | test/* | build/* | ci/* | chore/* | revert/*) ;;
  *)
    cat >&2 <<EOF

✖ Branch "$branch" is neither develop nor <type>/<summary>.

  The type is the same set Conventional Commits uses:
  feat fix docs refactor perf test build ci chore revert

  Rename it:

    git branch -m feat/<summary>

EOF
    exit 1
    ;;
esac

summary=${branch#*/}
case "$summary" in
  "" | *[!a-z0-9-]*)
    cat >&2 <<EOF

✖ Branch "$branch" has a malformed summary.

  The part after the slash is lower-case kebab-case with no further slashes:
  feat/price-offer-toggle, fix/switch-label, chore/seed-2-2-0

    git branch -m <type>/<kebab-summary>

EOF
    exit 1
    ;;
esac
