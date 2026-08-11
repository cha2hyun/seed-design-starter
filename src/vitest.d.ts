/**
 * Registers jest-dom's matchers with Vitest's `expect` for TypeScript.
 *
 * `config/vitest.setup.ts` imports the same entry point at runtime, but that file is compiled
 * by tsconfig.node.json, so the type augmentation it carries never reaches the test files.
 * A `reference` rather than an `import` keeps this file a global script, so it does not shift
 * `src/vite-env.d.ts`'s ambient `ImportMeta` declaration into module scope.
 */
/// <reference types="@testing-library/jest-dom" />
