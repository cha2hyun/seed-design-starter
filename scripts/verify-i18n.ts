/**
 * Rule 6 says every user-facing string is translated into Korean and English. Nothing enforced
 * it. The key *types* come from Korean alone (`AppResources = typeof resources["ko"]`), so a
 * key missing from English is not a type error — it silently falls back to the Korean string
 * and an English user reads Korean.
 *
 * This checks the ways the two trees drift apart: a key or namespace on one side only, a runtime
 * namespace wired to the wrong locale file, and matching keys whose interpolation differs.
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { resources } from "../src/shared/i18n/resources.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = join(ROOT, "src/shared/i18n/locales");
const LANGUAGES = ["ko", "en"] as const;
const SOURCE_OF_TRUTH = "ko" as const;
const TARGET = "en" as const;

type Tree = Record<string, unknown>;
type Language = (typeof LANGUAGES)[number];

function flatten(value: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      for (const [k, v] of flatten(child as Tree, path)) out.set(k, v);
    } else {
      out.set(path, String(child));
    }
  }
  return out;
}

/** `{{count}}` and friends; order is irrelevant, presence is not. */
function placeholders(value: string): string[] {
  return [...value.matchAll(/\{\{\s*([\w.]+)[^}]*\}\}/g)].map((m) => m[1]!).sort();
}

async function readNamespaces(language: Language): Promise<string[]> {
  const files = await readdir(join(LOCALES, language));
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
}

async function readTree(language: Language, namespace: string): Promise<Tree> {
  return JSON.parse(await readFile(join(LOCALES, language, `${namespace}.json`), "utf8")) as Tree;
}

async function main(): Promise<void> {
  const problems: string[] = [];

  const namespacesByLanguage: Record<Language, string[]> = {
    ko: await readNamespaces("ko"),
    en: await readNamespaces("en"),
  };
  const source = namespacesByLanguage[SOURCE_OF_TRUTH];
  const target = namespacesByLanguage[TARGET];

  for (const namespace of source) {
    if (!target.includes(namespace)) problems.push(`${TARGET}/${namespace}.json is missing`);
  }
  for (const namespace of target) {
    if (!source.includes(namespace)) {
      problems.push(`${TARGET}/${namespace}.json has no ${SOURCE_OF_TRUTH} counterpart`);
    }
  }

  // Check the object i18next actually receives. Looking for `namespace:` in resources.ts is not
  // enough: one occurrence under Korean can hide a missing English registration, and an English
  // namespace can accidentally point at the Korean JSON import.
  for (const language of LANGUAGES) {
    const onDisk = namespacesByLanguage[language];
    const registered = resources[language] as unknown as Record<string, Tree>;

    for (const namespace of onDisk) {
      if (!Object.hasOwn(registered, namespace)) {
        problems.push(
          `${language}/${namespace}.json exists on disk but resources.${language}.${namespace} is missing`,
        );
        continue;
      }

      const diskTree = await readTree(language, namespace);
      if (!isDeepStrictEqual(registered[namespace], diskTree)) {
        problems.push(
          `resources.${language}.${namespace} does not match ${language}/${namespace}.json`,
        );
      }
    }

    for (const namespace of Object.keys(registered).sort()) {
      if (!onDisk.includes(namespace)) {
        problems.push(
          `resources.${language}.${namespace} is registered but ${language}/${namespace}.json is missing`,
        );
      }
    }
  }

  let keyCount = 0;
  for (const namespace of source.filter((ns) => target.includes(ns))) {
    const ko = flatten(await readTree(SOURCE_OF_TRUTH, namespace));
    const en = flatten(await readTree(TARGET, namespace));
    keyCount += ko.size;

    for (const key of ko.keys()) {
      if (!en.has(key)) problems.push(`${namespace}:${key} — missing in ${TARGET}`);
    }
    for (const key of en.keys()) {
      if (!ko.has(key)) problems.push(`${namespace}:${key} — missing in ${SOURCE_OF_TRUTH}`);
    }
    for (const [key, korean] of ko) {
      const english = en.get(key);
      if (english === undefined) continue;
      const a = placeholders(korean);
      const b = placeholders(english);
      if (a.join() !== b.join()) {
        problems.push(
          `${namespace}:${key} — interpolation differs (${SOURCE_OF_TRUTH}: ${a.join(", ") || "none"} / ${TARGET}: ${b.join(", ") || "none"})`,
        );
      }
    }
  }

  if (problems.length > 0) {
    console.error(
      `Korean is the source of truth and English has to match it key for key.\n${problems.map((p) => `  ${p}`).join("\n")}`,
    );
    process.exit(1);
  }

  console.log(
    `i18n holds: ${source.length} namespaces, ${keyCount} keys, ` +
      `${SOURCE_OF_TRUTH} and ${TARGET} runtime resources match their locale files, ` +
      `with key parity and matching interpolation.`,
  );
}

await main();
