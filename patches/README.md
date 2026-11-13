# Dependency security patches

## `minimatch` security override

`pnpm-workspace.yaml` routes the installed `minimatch` versions (9.0.9 and 10.2.6) to 11.0.1 to fix
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), which can amplify
glob patterns during optimization. Upstream has not published a fixed 9.x or 10.x version.

Version 11 removes `makeRe`, the `AST` export, and regex-based internals. The installed consumers
(ESLint, `@eslint/config-array`, `@typescript-eslint/typescript-estree`, `@ts-morph/common`, and
the Prettier import sorter) use `minimatch()` or `Minimatch.match()`, including partial matches;
they do not use those removed APIs. Node 22, 24, and 26 remain supported.

`pnpm test scripts/minimatch-security.test.ts` checks the installed package through each consumer
path, normal glob behavior, partial matches, and bounded optimization of adversarial input.
CI additionally exercises lint, formatting, types, build, and browser smoke tests. Remove the
override once every consumer requests a fixed version itself; recheck consumer APIs when upgrading.

## `braces@3.0.3`

The development tools resolve `braces` through `micromatch`. Deeply nested patterns in version
3.0.3 can exhaust the JavaScript call stack within the existing 10,000-character limit.
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), which originally
reported this behavior, was withdrawn on 2026-10-23. As of 2026-11-13, 3.0.3 remains the latest
published version. The existing patch and regression checks are retained as defensive limits.

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

The withdrawn advisory no longer appears in `pnpm audit`; the full audit reports zero
vulnerabilities as of 2026-11-13. No advisory ignore is configured. An audit result does not verify
the patched source, so retain the regression checks alongside the audit.

When an upstream fixed release becomes available, update the dependency, remove its
`patchedDependencies` entry and patch file, regenerate the lockfile, and rerun the regression suite
and `pnpm verify`. Retain the security tests to detect regressions in future upgrades.
