import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONSUMERS = [
  ["eslint-plugin-boundaries", "micromatch"],
  ["eslint-plugin-boundaries", "@boundaries/elements", "micromatch"],
  ["steiger", "micromatch"],
  ["steiger", "globby", "micromatch"],
  ["steiger", "globby", "fast-glob", "micromatch"],
  ["@seed-design/cli", "findup-sync", "micromatch"],
];

// Isolate hostile inputs so a missing patch cannot exhaust the test runner's stack or heap.
function probe(source: string, chain = CONSUMERS[0]) {
  const setup = String.raw`
    const assert = require('node:assert/strict');
    const { createRequire } = require('node:module');
    const { realpathSync } = require('node:fs');
    const { resolve } = require('node:path');
    const chain = ${JSON.stringify(chain)};
    let consumer = createRequire(realpathSync(resolve('node_modules', chain[0], 'package.json')));
    let entry;
    for (const name of chain.slice(1)) {
      entry = consumer.resolve(name);
      consumer = createRequire(entry);
    }
    const micromatch = require(entry);
    const braces = consumer('braces');
    const reject = fn => assert.throws(fn, {
      name: 'SyntaxError', message: 'Nesting depth exceeds maximum of 256'
    });
    const nested = (depth, kind = 'brace') => {
      if (kind === 'paren') return '('.repeat(depth) + 'x' + ')'.repeat(depth);
      if (kind === 'mixed') return '{('.repeat(depth / 2) + 'x' + ')}'.repeat(depth / 2);
      return '{'.repeat(depth) + 'x' + '}'.repeat(depth);
    };
    const ast = depth => {
      const root = { type: 'root', nodes: [] };
      let parent = root;
      for (let i = 0; i < depth; i++) {
        const child = { type: 'paren', nodes: [], parent };
        parent.nodes.push(child);
        parent = child;
      }
      parent.nodes.push({ type: 'text', value: 'x' });
      return root;
    };
  `;
  const result = spawnSync(
    process.execPath,
    ["--max-old-space-size=128", "--input-type=commonjs", "-e", setup + source],
    { cwd: ROOT, encoding: "utf8", timeout: 5000, maxBuffer: 64 * 1024 },
  );
  expect(result.error, result.stderr).toBeUndefined();
  expect(result.signal, result.stderr).toBeNull();
  expect(result.status, result.stderr || result.stdout).toBe(0);
}

describe("braces stack-exhaustion regression (GHSA-vfj7-8cjw-p6xm)", () => {
  it.each(["brace", "paren", "mixed"])("rejects deeply nested %s strings", (kind) => {
    probe(`
      const input = nested(4000, ${JSON.stringify(kind)});
      for (const method of ['parse', 'compile', 'expand', 'stringify', 'create']) {
        reject(() => braces[method](input));
      }
      reject(() => braces(input));
      reject(() => braces(input, { expand: true }));
      reject(() => braces.parse(input, { maxDepth: Infinity }));
    `);
  });

  it("rejects nesting before the parser's range fallback invokes stringify", () => {
    probe(`reject(() => braces.parse('{a..' + nested(4500) + ',b}'));`);
  });

  it.each(["compile", "expand", "stringify"])("guards direct AST input to %s", (method) => {
    probe(`reject(() => braces[${JSON.stringify(method)}](ast(4000)));`);
  });

  it.each(["compile", "expand", "stringify"])("rejects a child-node cycle in %s", (method) => {
    probe(`
      const root = { type: 'root', nodes: [] };
      root.nodes.push(root);
      reject(() => braces[${JSON.stringify(method)}](root));
    `);
  });

  it("rejects cyclic parent links during expansion", () => {
    probe(`
      const node = { type: 'paren', nodes: [] };
      node.parent = node;
      reject(() => braces.expand(node));
    `);
  });

  it.each(["brace", "paren", "mixed"])("allows 256 %s groups and rejects 257", (kind) => {
    probe(`
      const input = nested(256, ${JSON.stringify(kind)});
      for (const method of ['parse', 'compile', 'expand', 'stringify']) {
        assert.doesNotThrow(() => braces[method](input));
        reject(() => braces[method]('(' + input + ')'));
      }
      assert.equal(braces.stringify(input), input);
    `);
  });

  it("applies the same boundary to direct ASTs without counting their text leaves", () => {
    probe(`
      for (const method of ['compile', 'expand', 'stringify']) {
        assert.deepEqual(braces[method](ast(256)), method === 'expand' ? ['x'] : 'x');
        reject(() => braces[method](ast(257)));
      }
    `);
  });

  it.each(CONSUMERS.map((chain) => ({ name: chain.join(" → "), chain })))(
    "protects the installed dependency through $name",
    ({ chain }) => {
      probe(
        `
          const input = nested(4000);
          for (const method of ['braces', 'braceExpand', 'parse']) {
            reject(() => micromatch[method](input));
          }
          assert.deepEqual(micromatch.braceExpand('src/{app,shared}/*.ts'), [
            'src/app/*.ts', 'src/shared/*.ts'
          ]);
          assert.deepEqual(micromatch(['src/app/a.ts', 'src/app/a.js'], '**/*.ts'), ['src/app/a.ts']);
        `,
        chain,
      );
    },
  );

  it("does not count escaped, quoted, bracketed, or sibling delimiters as nesting", () => {
    probe(String.raw`
      const literal = '{('.repeat(300);
      for (const input of ['\\{\\('.repeat(300), '"' + literal + '"', '[' + literal + ']']) {
        for (const method of ['parse', 'compile', 'expand', 'stringify']) {
          assert.doesNotThrow(() => braces[method](input));
        }
      }
      const siblings = '{}'.repeat(300);
      assert.equal(braces.stringify(siblings), siblings);
      assert.deepEqual(braces.expand(siblings), [siblings]);
    `);
  });

  it("preserves normal glob compilation, expansion, escaping, and existing limits", () => {
    probe(String.raw`
      assert.deepEqual(braces('src/{app,shared}/**/*.{ts,tsx}'), ['src/(app|shared)/**/*.(ts|tsx)']);
      assert.deepEqual(braces.expand('file-{01..03}.js'), ['file-01.js', 'file-02.js', 'file-03.js']);
      assert.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c']);
      assert.deepEqual(braces.expand('{,a,a}', { nodupes: true, noempty: true }), ['a']);
      assert.deepEqual(braces.expand('$' + '{foo,bar}'), ['$' + '{foo,bar}']);
      assert.equal(braces.compile('a/{b,c', { escapeInvalid: true }), 'a/\\{b,c');
      assert.throws(() => braces.parse('x'.repeat(10001)), { name: 'SyntaxError' });
      assert.throws(() => braces.parse('abcd', { maxLength: 3 }), { name: 'SyntaxError' });
      assert.throws(() => braces.expand('{1..1001}'), { name: 'RangeError' });
      assert.equal(braces.expand('{1..1001}', { rangeLimit: false }).length, 1001);
    `);
  });
});
