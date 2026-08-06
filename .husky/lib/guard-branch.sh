#!/bin/sh
# Sourced by .husky/pre-commit.
#
# Two invariants that matter more than usual when an agent is driving the loop:
#   1. Every change lands through a pull request, so main is never committed to directly.
#   2. Branch names stay parseable, so a reviewer can tell what a branch is for without reading it.

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

✖ main is protected. Work happens on a branch and lands through a pull request.

  Move what you have onto a branch and commit there:

    git switch -c feat/<what-this-does>

  Already staged? The staged files come along with the switch.
  ALLOW_MAIN_COMMIT=1 exists for repository bootstrap only.

EOF
  exit 1
fi

case "$branch" in
  feat/* | fix/* | docs/* | refactor/* | perf/* | test/* | build/* | ci/* | chore/* | revert/*) ;;
  *)
    cat >&2 <<EOF

✖ Branch "$branch" does not follow <type>/<summary>.

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
