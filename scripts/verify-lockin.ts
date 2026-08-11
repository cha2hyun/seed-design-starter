import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import ts from "typescript";

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
  "max-w-form",
  "min-w-0",
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

/**
 * ── Source scan ─────────────────────────────────────────────────────────────
 * The two lists above prove the *theme* is intact. They cannot prove the app uses it:
 * a `max-w-md` or `min-w-x0` in a component is not an error, it is a silent no-op that
 * leaves the element unstyled, and ESLint only covers prefixes that carry a token.
 * So compile every class the source actually ships and fail on the ones emitting nothing.
 *
 * Finding the classes is the hard half. Reading only `className={…}` misses the shapes this
 * repo actually uses — a variant map (`TONE_CLASS` in shared/ui/tag.tsx), a class passed as
 * an object property (`activeProps`), a `*ClassName` const assembled by interpolation. So
 * every string literal in `src` is read instead, and the question becomes how to tell a class
 * list apart from an i18n key, an import specifier or a Korean sentence.
 *
 * Strong syntactic context answers the unambiguous cases: a literal assigned to `className`,
 * stored in a `*ClassName`/`*_CLASS` declaration, or passed to `cn` is a class list even when
 * every token is dead. This is what makes a lone `className="max-w-md"` fail the scan. A small
 * amount of expression-aware traversal keeps lookup keys and function arguments such as
 * `TONE["brand"]` and `t("wizard:title")` out of that strong context.
 *
 * Co-occurrence remains the fallback for anonymous variant maps and other indirect shapes.
 * Tokenise each literal; if most of its tokens compile to CSS, the literal is a class list and
 * the remainder are expected to compile too. `"bg-bg-warning-week text-fg-warning"` is caught
 * because its neighbour is real. `"wizard:title"`, `"zustand/middleware"` and
 * `"제목을 입력하세요"` contain nothing that compiles, so they are not class lists and are left
 * alone.
 *
 * A majority rather than a single hit, because English prose lands on a real utility by
 * accident more often than you would think — `visible`, `grid`, `table`, `fixed` and `block`
 * are all words and all utilities, so "a visible caption" would otherwise read as a class list
 * with three broken classes in it.
 *
 * The remaining residue is a literal whose every token is dead and whose syntax provides no
 * class signal. That is unknowable from the string alone, so it is counted and reported rather
 * than treated as a failure.
 */
const SCAN_ROOT = join(ROOT, "src");
/** Tests never reach a browser, and their prose trips the class-list heuristic below. */
const SCAN_SKIP = ["routeTree.gen.ts", ".test.", "test-router"];

/**
 * Markers styled by other selectors, which correctly emit nothing alone. Matched on the
 * part before `/` so Tailwind's named variants (`group/row`, `peer/email`) are covered too.
 */
const MARKER_CLASSES = new Set(["group", "peer", "dark", "light"]);

/**
 * Tailwind candidates have no whitespace, but arbitrary utilities and variants intentionally
 * carry punctuation (`data-[state=open]:…`, `[&>*]:…`, `content-['']`). Require an ASCII
 * candidate-like start and at least one alphanumeric instead of trying to duplicate Tailwind's
 * grammar here; the compiler below remains the source of truth for whether it emits CSS.
 */
const UTILITY_SHAPE = /^(?=.*[a-z0-9])[-!@*[a-z0-9]\S*$/i;
const CLASS_COMPOSERS = new Set(["cn", "clsx", "classnames", "twmerge"]);
const CLASS_COMPOSER_MODULES = ["clsx", "classnames", "tailwind-merge"];

async function* sourceFiles(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (SCAN_SKIP.some((skip) => full.includes(skip))) continue;
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.tsx?$/.test(entry.name)) yield full;
  }
}

function isMarker(candidate: string): boolean {
  return MARKER_CLASSES.has(candidate.split("/")[0]!);
}

interface Literal {
  tokens: string[];
  file: string;
  strongClassContext: boolean;
}

function tokenise(raw: string): string[] {
  return raw
    .trim()
    .split(/\s+/)
    .filter((token) => token && !isMarker(token) && UTILITY_SHAPE.test(token));
}

function nameText(node: ts.Node | undefined): string | undefined {
  if (node && (ts.isIdentifier(node) || ts.isPrivateIdentifier(node))) return node.text;
  if (node && ts.isStringLiteralLike(node)) return node.text;
  return undefined;
}

function signalsClassText(text: string): boolean {
  return classNameWords(text).some(
    (word) =>
      word === "class" || word === "classes" || word === "classname" || word === "classnames",
  );
}

function classNameWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

/** `className`, `TONE_CLASS`, `buttonClasses`, `slotClassMap`, and similar declarations. */
function signalsClassName(node: ts.Node | undefined): boolean {
  const text = nameText(node);
  return text ? signalsClassText(text) : false;
}

function expressionName(node: ts.Expression): string | undefined {
  return ts.isIdentifier(node) || ts.isPrivateIdentifier(node)
    ? node.text
    : ts.isPropertyAccessExpression(node)
      ? node.name.text
      : undefined;
}

interface ComposerContext {
  bindings: Set<ts.Identifier>;
}

function bindingIdentifiers(name: ts.BindingName): ts.Identifier[] {
  if (ts.isIdentifier(name)) return [name];
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingIdentifiers(element.name),
  );
}

function scopeBindings(scope: ts.Node, name: string): ts.Identifier[] {
  const bindings: ts.Identifier[] = [];
  const add = (binding: ts.BindingName): void => {
    bindings.push(...bindingIdentifiers(binding).filter((identifier) => identifier.text === name));
  };
  const visit = (node: ts.Node): void => {
    if (node !== scope) {
      if (
        ts.isBlock(node) ||
        ts.isFunctionLike(node) ||
        ts.isClassLike(node) ||
        ts.isModuleBlock(node) ||
        ts.isCatchClause(node)
      ) {
        if (
          (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
          node.name?.text === name
        ) {
          bindings.push(node.name);
        }
        return;
      }
    }
    if (ts.isVariableDeclaration(node)) {
      add(node.name);
      return;
    }
    if (ts.isImportClause(node) && node.name?.text === name) bindings.push(node.name);
    if (ts.isImportSpecifier(node) && node.name.text === name) bindings.push(node.name);
    ts.forEachChild(node, visit);
  };
  visit(scope);
  return bindings;
}

function nearestBinding(reference: ts.Identifier): ts.Identifier | undefined {
  const name = reference.text;
  for (let node = reference.parent; node; node = node.parent) {
    if (ts.isFunctionLike(node)) {
      const parameter = node.parameters
        .flatMap((item) => bindingIdentifiers(item.name))
        .find((identifier) => identifier.text === name);
      if (parameter) return parameter;
      if (ts.isFunctionExpression(node) && node.name?.text === name) return node.name;
    }
    if (ts.isCatchClause(node) && node.variableDeclaration) {
      const caught = bindingIdentifiers(node.variableDeclaration.name).find(
        (identifier) => identifier.text === name,
      );
      if (caught) return caught;
    }
    if (ts.isBlock(node) || ts.isSourceFile(node) || ts.isModuleBlock(node)) {
      const binding = scopeBindings(node, name)[0];
      if (binding) return binding;
    }
  }
  return undefined;
}

function isClassComposer(node: ts.Expression, context: ComposerContext): boolean {
  if (ts.isIdentifier(node)) {
    const binding = nearestBinding(node);
    return binding ? context.bindings.has(binding) : CLASS_COMPOSERS.has(node.text.toLowerCase());
  }
  const target = expressionName(node);
  return target ? CLASS_COMPOSERS.has(target.toLowerCase()) : false;
}

function isExplicitClassMapWrapper(node: ts.Expression): boolean {
  const target = expressionName(node);
  if (!target) return false;
  const words = classNameWords(target);
  const factory = words.some((word) => ["build", "create", "define", "make"].includes(word));
  const classWord = words.findIndex((word) => word === "class" || word === "classes");
  const collection =
    words.includes("classes") ||
    words.includes("classmap") ||
    words.includes("classnames") ||
    (classWord >= 0 && ["map", "maps", "name", "names"].includes(words[classWord + 1] ?? ""));
  return factory && classWord >= 0 && collection;
}

function isTransparentClassMapWrapper(node: ts.Expression): boolean {
  return (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "Object" &&
    node.name.text === "freeze"
  );
}

function isComposerModule(specifier: string): boolean {
  const normalized = specifier.toLowerCase();
  if (
    CLASS_COMPOSER_MODULES.some(
      (module) => normalized === module || normalized.startsWith(`${module}/`),
    )
  ) {
    return true;
  }
  const basename =
    normalized
      .split("/")
      .at(-1)
      ?.replace(/\.[cm]?[jt]sx?$/, "") ?? "";
  return CLASS_COMPOSERS.has(basename.replaceAll("-", ""));
}

/** Imported aliases and simple `const cx = clsx` aliases used in this source file. */
function collectComposerContext(sourceFile: ts.SourceFile): ComposerContext {
  const context: ComposerContext = { bindings: new Set() };

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }
    const clause = statement.importClause;
    if (!clause) continue;
    const fromComposerModule = isComposerModule(statement.moduleSpecifier.text);
    if (clause.name && fromComposerModule) context.bindings.add(clause.name);
    if (!clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
    for (const element of clause.namedBindings.elements) {
      const imported = (element.propertyName ?? element.name).text.toLowerCase();
      if (CLASS_COMPOSERS.has(imported) || (fromComposerModule && imported === "default")) {
        context.bindings.add(element.name);
      }
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    const visit = (node: ts.Node): void => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        isClassComposer(node.initializer, context)
      ) {
        if (!context.bindings.has(node.name)) {
          context.bindings.add(node.name);
          changed = true;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  return context;
}

function isAggregateExpression(node: ts.Node): boolean {
  return ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node);
}

function isClassDeclaration(node: ts.Node, child: ts.Node): boolean {
  if (
    (ts.isVariableDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isPropertyDeclaration(node) ||
      ts.isBindingElement(node)) &&
    node.initializer &&
    child !== node.name
  ) {
    return signalsClassName(node.name);
  }
  if (ts.isPropertyAssignment(node) && child !== node.name) {
    return signalsClassName(node.name);
  }
  return false;
}

/**
 * Whether this literal is definitely used as a class list.
 *
 * An ordinary call argument and an element-access key are barriers: in
 * `className={variant({ tone: "brand" })}` and `className={TONE["brand"]}`, `"brand"` is not a
 * utility. Conditions are barriers too, while their result branches may still be class lists.
 */
function hasStrongClassContext(node: ts.Node, composerContext: ComposerContext): boolean {
  let child = node;
  let inPropertyName = false;
  let crossedPropertyInitializer = false;

  for (let parent = node.parent; parent; child = parent, parent = parent.parent) {
    if (
      (ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent)) &&
      child === parent.name
    ) {
      inPropertyName = true;
    }
    if (ts.isPropertyAssignment(parent) && child === parent.initializer) {
      crossedPropertyInitializer = true;
    }

    if (ts.isElementAccessExpression(parent) && child === parent.argumentExpression) return false;
    if (ts.isConditionalExpression(parent) && child === parent.condition) return false;
    if (ts.isBinaryExpression(parent)) {
      const operator = parent.operatorToken.kind;
      const preservesAClassValue =
        operator === ts.SyntaxKind.PlusToken ||
        operator === ts.SyntaxKind.AmpersandAmpersandToken ||
        operator === ts.SyntaxKind.BarBarToken ||
        operator === ts.SyntaxKind.QuestionQuestionToken;
      if (
        !preservesAClassValue ||
        (operator === ts.SyntaxKind.AmpersandAmpersandToken && child === parent.left)
      ) {
        return false;
      }
    }

    if (ts.isCallExpression(parent) && parent.arguments.includes(child as ts.Expression)) {
      if (isClassComposer(parent.expression, composerContext)) {
        // clsx treats direct object keys as classes, but does not recursively consume values:
        // `clsx({ variants: { "max-w-md": true } })` outputs only `variants`.
        return !crossedPropertyInitializer;
      }
      if (isAggregateExpression(child) && isExplicitClassMapWrapper(parent.expression)) {
        return !inPropertyName;
      }
      // Object.freeze is transparent only so an outer `*_CLASS` declaration can establish the
      // class-map context. Generic recipe/variant calls remain barriers for their option values.
      if (isAggregateExpression(child) && isTransparentClassMapWrapper(parent.expression)) {
        continue;
      }
      return false;
    }
    if (ts.isNewExpression(parent) && parent.arguments?.includes(child as ts.Expression)) {
      return false;
    }
    if (ts.isTaggedTemplateExpression(parent)) {
      return isClassComposer(parent.tag, composerContext);
    }

    if (ts.isJsxAttribute(parent) && signalsClassName(parent.name) && !inPropertyName) {
      return true;
    }
    if (isClassDeclaration(parent, child) && !inPropertyName) return true;
  }

  return false;
}

function collectSourceLiterals(source: string, file: string): Literal[] {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const composerContext = collectComposerContext(sourceFile);
  const literals: Literal[] = [];

  function add(raw: string, node: ts.Node): void {
    const tokens = tokenise(raw);
    if (tokens.length > 0) {
      literals.push({
        tokens,
        file,
        strongClassContext: hasStrongClassContext(node, composerContext),
      });
    }
  }

  function visit(node: ts.Node): void {
    if (ts.isStringLiteralLike(node)) {
      add(node.text, node);
    } else if (ts.isTemplateExpression(node)) {
      add(node.head.text, node.head);
      for (const span of node.templateSpans) add(span.literal.text, span.literal);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return literals;
}

/** Every tokenised string literal in `src`, with its file and syntactic class context. */
async function collectLiterals(): Promise<Literal[]> {
  const literals: Literal[] = [];

  for await (const file of sourceFiles(SCAN_ROOT)) {
    const where = relative(file);
    literals.push(...collectSourceLiterals(await readFile(file, "utf8"), where));
  }

  return literals;
}

/** Executed by the gate itself so its dead-only guarantee cannot regress unnoticed. */
function assertSourceScannerContract(): void {
  const fixture = collectSourceLiterals(
    `
      import cx from "clsx";
      import { default as alternateCx } from "clsx";
      import { cn as compose } from "./cn";
      import { twMerge as merge } from "tailwind-merge";

      const prose = "max-w-prose-only";
      const TONE_CLASS = { neutral: "max-w-map-only" };
      const WRAPPED_CLASS = defineClassMap({ neutral: "max-w-wrapper-only" });
      const FROZEN_CLASS = Object.freeze({ neutral: "max-w-frozen-wrapper" });
      const translatedClassName = t("max-w-translation-key");
      const lookup = <div className={TONE["max-w-lookup-key"]} />;
      const variantLookup = <div className={variant({ tone: "max-w-variant-option" })} />;
      const recipeClassName = recipe({ tone: "max-w-recipe-option" });
      const semanticLookup = <div className={getClassName("max-w-semantic-lookup")} />;
      const direct = <div className="data-[state=open]:max-w-arbitrary-only" />;
      const localAlias = cx;
      cx("max-w-default-alias");
      alternateCx("max-w-default-named-alias");
      compose("max-w-named-alias");
      merge("max-w-merge-alias");
      localAlias("max-w-const-alias");
      function shadowed(cx: (value: string) => string) {
        cx("max-w-shadowed-parameter");
      }
      {
        const cx = lookupClass;
        cx("max-w-shadowed-local");
      }
      const composed = cn(
        "min-w-composed-only",
        { "max-w-object-key": ready },
        state === "max-w-condition-key" && "max-w-logical-value",
      );
      cn({ variants: { "max-w-nested-object-key": true } });
    `,
    "verify-lockin-scanner-fixture.tsx",
  );
  const contexts = new Map(
    fixture.flatMap(({ tokens, strongClassContext }) =>
      tokens.map((token) => [token, strongClassContext] as const),
    ),
  );
  const expected = new Map<string, boolean>([
    ["max-w-prose-only", false],
    ["max-w-map-only", true],
    ["max-w-wrapper-only", true],
    ["max-w-frozen-wrapper", true],
    ["max-w-translation-key", false],
    ["max-w-lookup-key", false],
    ["max-w-variant-option", false],
    ["max-w-recipe-option", false],
    ["max-w-semantic-lookup", false],
    ["data-[state=open]:max-w-arbitrary-only", true],
    ["max-w-default-alias", true],
    ["max-w-default-named-alias", true],
    ["max-w-named-alias", true],
    ["max-w-merge-alias", true],
    ["max-w-const-alias", true],
    ["max-w-shadowed-parameter", false],
    ["max-w-shadowed-local", false],
    ["min-w-composed-only", true],
    ["max-w-object-key", true],
    ["max-w-condition-key", false],
    ["max-w-logical-value", true],
    ["max-w-nested-object-key", false],
  ]);
  const mismatch = [...expected].filter(([token, strong]) => contexts.get(token) !== strong);
  if (mismatch.length > 0) {
    throw new Error(
      `Lock-in source scanner contract regressed: ${mismatch.map(([token]) => token).join(", ")}`,
    );
  }
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
  assertSourceScannerContract();
  await assertNoBannedIconDeps();

  const literals = await collectLiterals();
  const tokens = [...new Set(literals.flatMap((literal) => literal.tokens))].sort();

  const [dead, alive, scanned] = await Promise.all([
    partition(MUST_BE_DEAD),
    partition(MUST_BE_ALIVE),
    partition(tokens),
  ]);
  const leaked = dead.emitting;
  const missing = alive.silent;
  const emits = new Set(scanned.emitting);

  // Most tokens compiling means the literal is a class list, so the rest are bugs. A literal
  // where few or none do is an i18n key, an import specifier or prose — not our business.
  const noOps = new Map<string, Set<string>>();
  let classLists = 0;
  let ignored = 0;
  for (const { tokens: candidates, file, strongClassContext } of literals) {
    const live = candidates.filter((token) => emits.has(token)).length;
    // At least half, not a strict majority: `"bg-bg-warning-week text-fg-warning-contrast"`
    // is two tokens with one survivor, and that pair is the exact shape of a variant map.
    if (!strongClassContext && (live === 0 || live * 2 < candidates.length)) {
      ignored += 1;
      continue;
    }
    classLists += 1;
    for (const token of candidates) {
      if (emits.has(token)) continue;
      if (!noOps.has(token)) noOps.set(token, new Set());
      noOps.get(token)!.add(file);
    }
  }

  if (leaked.length === 0 && missing.length === 0 && noOps.size === 0) {
    console.log(
      `Lock-in holds: ${MUST_BE_DEAD.length} non-SEED utilities emit nothing, ` +
        `${MUST_BE_ALIVE.length} SEED utilities still compile, ` +
        `every class in ${classLists} class lists across src produces CSS ` +
        `(${ignored} literals were read as non-class strings). ` +
        `Karrot icon packages absent.`,
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
  if (noOps.size > 0) {
    console.error(
      "These appear in a class context, but emit no CSS themselves,\n" +
        "so they style nothing at all. Replace each with a SEED token, or add the missing\n" +
        "token to the project @theme block in " +
        `${relative(ENTRY)}:\n` +
        [...noOps]
          .map(([cls, files]) => `  ${cls}\n      ${[...files].join("\n      ")}`)
          .join("\n"),
    );
  }
  process.exit(1);
}

function relative(path: string): string {
  return path.slice(ROOT.length + 1);
}

await main();
