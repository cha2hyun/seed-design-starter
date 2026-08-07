import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_FILE = join(ROOT, "brand.config.json");
const GLOBAL_CSS = join(ROOT, "src/app/styles/global.css");

const STEPS = ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"] as const;
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const BEGIN = "/* <brand-generated> */";
const END = "/* </brand-generated> */";

type Scale = Record<(typeof STEPS)[number], string>;

interface BrandConfig {
  name: string;
  description?: string;
  palette: { light: Scale; dark: Scale };
}

const check = process.argv.includes("--check");

async function main(): Promise<void> {
  const config = parseConfig(await readFile(CONFIG_FILE, "utf8"));
  const block = renderBrandBlock(config);
  const css = await readFile(GLOBAL_CSS, "utf8");
  const next = spliceBrandBlock(css, block);

  if (check) {
    if (next !== css) {
      console.error("Brand CSS is out of date with brand.config.json. Run `pnpm brand:sync`.");
      process.exit(1);
    }
    console.log(`Brand palette "${config.name}" is in sync.`);
    return;
  }

  if (next === css) {
    console.log(`Brand palette "${config.name}" already in sync.`);
    return;
  }

  await writeFile(GLOBAL_CSS, next);
  console.log(`Wrote brand overrides for "${config.name}" into ${relative(GLOBAL_CSS)}.`);
}

function parseConfig(raw: string): BrandConfig {
  const parsed = JSON.parse(raw) as BrandConfig;
  if (!parsed?.name || typeof parsed.name !== "string") {
    throw new Error("brand.config.json: `name` must be a non-empty string");
  }
  for (const mode of ["light", "dark"] as const) {
    const scale = parsed.palette?.[mode];
    if (!scale) throw new Error(`brand.config.json: missing palette.${mode}`);
    for (const step of STEPS) {
      const value = scale[step];
      if (typeof value !== "string" || !HEX.test(value)) {
        throw new Error(
          `brand.config.json: palette.${mode}.${step} must be a hex color, got ${JSON.stringify(value)}`,
        );
      }
    }
  }
  return parsed;
}

function renderBrandBlock(config: BrandConfig): string {
  const light = renderVars(config.palette.light);
  const dark = renderVars(config.palette.dark);

  return `${BEGIN}
/*
 * Generated from brand.config.json — do not edit by hand.
 * Run \`pnpm brand:sync\` after changing the config.
 * Remaps --seed-color-palette-carrot-* so SEED brand semantics (fg-brand,
 * bg-brand-solid, ActionButton brandSolid, …) follow the product palette.
 */
@layer base {
  :root,
  :root[data-seed-color-mode="light-only"],
  :root[data-seed-color-mode="system"][data-seed-user-color-scheme="light"] {
${light}
  }

  :root[data-seed-color-mode="dark-only"],
  :root[data-seed-color-mode="system"][data-seed-user-color-scheme="dark"] {
${dark}
  }
}
${END}`;
}

function renderVars(scale: Scale): string {
  return STEPS.map(
    (step) => `    --seed-color-palette-carrot-${step}: ${normalizeHex(scale[step])};`,
  ).join("\n");
}

/** Expand #rgb → #rrggbb so SEED's #f60 and config stay comparable. */
function normalizeHex(value: string): string {
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return value.toLowerCase();
}

function spliceBrandBlock(css: string, block: string): string {
  const begin = css.indexOf(BEGIN);
  const end = css.indexOf(END);

  if (begin === -1 && end === -1) {
    if (!css.endsWith("\n")) return `${css}\n\n${block}\n`;
    return `${css}\n${block}\n`;
  }

  if (begin === -1 || end === -1 || end < begin) {
    throw new Error(
      `${relative(GLOBAL_CSS)} has a broken brand-generated marker. Restore ${BEGIN} / ${END}.`,
    );
  }

  return `${css.slice(0, begin)}${block}${css.slice(end + END.length)}`;
}

function relative(path: string): string {
  return path.slice(ROOT.length + 1);
}

await main();
