import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONSUMERS = [
  ["eslint"],
  ["eslint", "@eslint/config-array"],
  ["typescript-eslint", "@typescript-eslint/typescript-estree"],
  ["@seed-design/cli", "ts-morph", "@ts-morph/common"],
  ["@trivago/prettier-plugin-sort-imports"],
];

describe("minimatch amplification regression (GHSA-g3hv-75wg-m249)", () => {
  it.each(CONSUMERS.map((chain) => ({ label: chain.join(" > "), chain })))(
    "bounds optimization and preserves glob matching through $label",
    ({ chain }) => {
      // A future dependency change must fail within bounded time and memory.
      const source = String.raw`
        const assert = require('node:assert/strict');
        const { createRequire } = require('node:module');
        const { readFileSync, realpathSync } = require('node:fs');
        const { resolve } = require('node:path');
        const chain = JSON.parse(readFileSync(0, 'utf8'));
        let consumer = createRequire(realpathSync(resolve('node_modules', chain[0], 'package.json')));
        for (const name of chain.slice(1)) consumer = createRequire(consumer.resolve(name));
        const { minimatch, Minimatch } = consumer('minimatch');

        assert.equal(minimatch('src/app/routes/index.tsx', 'src/**/*.{ts,tsx}'), true);
        assert.equal(minimatch('src/app/routes/index.css', 'src/**/*.{ts,tsx}'), false);
        assert.equal(minimatch('.hidden.ts', '*.ts'), false);
        assert.equal(minimatch('.hidden.ts', '*.ts', { dot: true }), true);
        assert.equal(minimatch('src/example.test.ts', '*.test.ts', { matchBase: true }), true);
        assert.equal(new Minimatch('src/**/*.tsx').match('src/app', true), true);

        const optimizationLevel = 2;
        const pattern = Array(30).fill('**/../a/b').join('/');
        const bounded = new Minimatch(pattern, { optimizationLevel, braceExpandMax: 64 });
        assert.equal(bounded.set.length, 64);
        const small = new Minimatch('**/../a/b/**/../c/d', { optimizationLevel });
        assert.equal(small.match('../a/b/../c/d'), true);
        assert.equal(small.match('x/a/b/y/c/d'), true);
        const large = new Minimatch('{x,*}/{0..999}', { optimizationLevel });
        assert.equal(large.match('x/5'), true);
        assert.equal(large.match('y/999'), true);
        assert.equal(large.match('.y/5'), false);
      `;
      const result = spawnSync(process.execPath, ["--max-old-space-size=128", "-e", source], {
        cwd: ROOT,
        encoding: "utf8",
        input: JSON.stringify(chain),
        timeout: 5000,
        maxBuffer: 64 * 1024,
      });
      expect(result.error, result.stderr).toBeUndefined();
      expect(result.signal, result.stderr).toBeNull();
      expect(result.status, result.stderr || result.stdout).toBe(0);
    },
  );
});
