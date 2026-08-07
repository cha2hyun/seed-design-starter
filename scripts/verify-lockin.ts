import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = join(ROOT, "src/app/styles/global.css");

/**
 * Utilities that must emit nothing, because the token they read no longer exists.
 *
 * A handful of Tailwind utilities accept bare values without consulting the theme —
 * `duration-300` and `opacity-50` are the notable ones — so deleting the theme cannot
 * stop them. Those are owned by the `seed-lockin/token-only` ESLint rule instead.
 */
const MUST_BE_DEAD = [
  "bg-red-500",
  "bg-blue-100",
  "text-lg",
  "text-2xl",
  "text-gray-700",
  "p-4",
  "px-6",
  "m-2",
  "gap-2",
  "w-10",
  "h-8",
  "size-12",
  "top-4",
  "inset-2",
  "space-x-4",
  "translate-x-2",
  "rounded-md",
  "rounded-xl",
  "shadow-md",
  "shadow-lg",
  "tracking-wide",
  "leading-relaxed",
  "ease-in-out",
  "max-w-3xl",
  "font-semibold",
  "blur-sm",
  "animate-spin",
];

/** Utilities that must keep working, covering every SEED namespace we depend on. */
const MUST_BE_ALIVE = [
  "bg-bg-layer-default",
  "text-fg-neutral",
  "border-stroke-neutral-muted",
  "bg-palette-carrot-500",
  "p-x4",
  "px-x5",
  "gap-x3",
  "w-x10",
  "size-x6",
  "top-x2",
  "space-y-x2",
  "translate-x-x1",
  "rounded-r4",
  "rounded-full",
  "shadow-s2",
  "t4-bold",
  "t7-regular",
  "screen-title",
  "article-body",
  "font-bold",
  "leading-t4",
  "text-size-t4",
  "duration-d3",
  "max-w-content",
  "md:gap-x4",
];

async function loadStylesheet(id: string, base: string) {
  const path = await resolveStylesheet(id, base);
  return { path, base: dirname(path), content: await readFile(path, "utf8") };
}

async function resolveStylesheet(id: string, base: string): Promise<string> {
  if (id.startsWith(".") || isAbsolute(id)) {
    return resolve(base, id);
  }
  if (id === "tailwindcss") {
    return require.resolve("tailwindcss/index.css");
  }
  return require.resolve(id, { paths: [base, ROOT] });
}

/**
 * A compiler accumulates every candidate it has ever seen, so a candidate can only
 * be judged by whether it grows the output relative to the previous build.
 */
async function newCompiler() {
  return compile(await readFile(ENTRY, "utf8"), {
    base: dirname(ENTRY),
    loadStylesheet,
    loadModule: () => {
      throw new Error("global.css must not load JS plugins");
    },
  });
}

async function partition(candidates: string[]): Promise<{ emitting: string[]; silent: string[] }> {
  const compiler = await newCompiler();
  const emitting: string[] = [];
  const silent: string[] = [];
  let previous = compiler.build([]).length;

  for (const candidate of candidates) {
    const current = compiler.build([candidate]).length;
    (current > previous ? emitting : silent).push(candidate);
    previous = current;
  }

  return { emitting, silent };
}

/** Icon packages this starter refuses; app icons come from lucide-react. */
const BANNED_ICON_PACKAGES = [
  "@karrotmarket/react-monochrome-icon",
  "@karrotmarket/react-multicolor-icon",
  "@daangn/react-monochrome-icon",
  "@daangn/react-multicolor-icon",
];

async function assertNoBannedIconDeps(): Promise<void> {
  const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declared = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
  const found = BANNED_ICON_PACKAGES.filter((name) => declared.has(name));
  if (found.length === 0) return;

  console.error(
    "Karrot/SEED icon packages are banned; use lucide-react instead.\n" +
      `Remove from package.json: ${found.join(", ")}`,
  );
  process.exit(1);
}

async function main(): Promise<void> {
  await assertNoBannedIconDeps();

  const [dead, alive] = await Promise.all([partition(MUST_BE_DEAD), partition(MUST_BE_ALIVE)]);
  const leaked = dead.emitting;
  const missing = alive.silent;

  if (leaked.length === 0 && missing.length === 0) {
    console.log(
      `Lock-in holds: ${MUST_BE_DEAD.length} non-SEED utilities emit nothing, ` +
        `${MUST_BE_ALIVE.length} SEED utilities still compile. Karrot icon packages absent.`,
    );
    return;
  }

  if (leaked.length > 0) {
    console.error(
      `These non-SEED utilities still produce CSS, so the theme reset in ${relative(ENTRY)} regressed:\n  ${leaked.join(", ")}`,
    );
  }
  if (missing.length > 0) {
    console.error(
      `These SEED utilities stopped producing CSS, so the theme import in ${relative(ENTRY)} regressed:\n  ${missing.join(", ")}`,
    );
  }
  process.exit(1);
}

function relative(path: string): string {
  return path.slice(ROOT.length + 1);
}

await main();
