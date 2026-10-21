# Dependency security patches

## `braces@3.0.3`

The development tools resolve `braces` through `micromatch`. Version 3.0.3 is affected by
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): deeply nested patterns
within the existing 10,000-character limit can exhaust the JavaScript call stack. As of
2026-10-21, the package has no published upstream fix.

This local patch rejects structural nesting beyond 256 levels with a `SyntaxError`:

- The parser checks both brace and parenthesis groups before adding them to the tree.
- Compilation, expansion, and stringification also check depth when called with an AST directly.
- Expansion bounds parent traversal so cyclic parent links cannot hang the process.

Quoted, escaped, and bracketed delimiters remain literal. The existing input length and expansion
range limits still apply. The depth limit cannot be disabled through options. This patch addresses
the nested-pattern stack exhaustion; it does not impose a general limit on expansion output or
regular-expression execution time.

The approach follows the depth-limit discussion in
[upstream issue #70](https://github.com/micromatch/braces/issues/70) and
[PR #79](https://github.com/micromatch/braces/pull/79), with controlled rejection and guards for
direct AST callers. The original package name, version, and MIT license are retained.

### Verification and maintenance

`pnpm install --frozen-lockfile` applies the exact-version patch through `patchedDependencies`.
`pnpm test scripts/braces-security.test.ts` checks the installed dependency through all current
consumer paths, including normal glob behavior and adversarial inputs in bounded child processes.
These tests also run in `pnpm verify` and CI.

`pnpm audit` reports package versions, not the patched source or its hash, so it continues to list
this advisory for version 3.0.3. No advisory ignore is configured. Review the patch and regression
results alongside the audit result; do not describe the raw audit as clean.

When an upstream fixed release becomes available, update the dependency, remove its
`patchedDependencies` entry and patch file, regenerate the lockfile, and rerun the regression suite
and `pnpm verify`. Retain the security tests to detect regressions in future upgrades.
