import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_JSON = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const SUPPORTED_NODE_RANGE = PACKAGE_JSON.engines.node;
const EXPECTED_PNPM_VERSION = PACKAGE_JSON.packageManager.replace(/^pnpm@/, "");

function spawnPnpm(args, options = {}) {
  if (process.platform === "win32") {
    return spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "pnpm.cmd", ...args], {
      cwd: ROOT,
      ...options,
    });
  }

  return spawnSync("pnpm", args, { cwd: ROOT, ...options });
}

const STEPS = [
  { name: "Install dependencies", args: ["install"] },
  { name: "Generate the route tree", args: ["routes:gen"] },
  { name: "Refresh the SEED token catalog and docs", args: ["seed:sync"] },
  { name: "Apply config/brand.config.json to global.css", args: ["brand:sync"] },
  { name: "Check SEED snippets against the installed packages", args: ["seed:compat"] },
  { name: "Verify the design system lock-in", args: ["verify:lockin"] },
  { name: "Typecheck", args: ["typecheck"] },
];

function checkNodeVersion() {
  const [major = 0, minor = 0, patch = 0] = process.versions.node
    .split(".")
    .map((part) => Number(part));
  const supported =
    (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) ||
    (major === 24 && minor >= 15) ||
    major >= 26;

  if (supported) return;

  console.error(
    `Node ${SUPPORTED_NODE_RANGE} is required, found ${process.versions.node}.\n` +
      "Run `nvm use` to pick up the version in .nvmrc.",
  );
  process.exit(1);
}

function checkPnpmVersion() {
  const result = spawnPnpm(["--version"], { encoding: "utf8" });
  const actual = result.stdout?.trim();

  if (result.status === 0 && actual === EXPECTED_PNPM_VERSION) return;

  const found = actual || "not found";
  console.error(
    `pnpm ${EXPECTED_PNPM_VERSION} is required, found ${found}.\n` +
      `Install the pinned version with \`corepack prepare pnpm@${EXPECTED_PNPM_VERSION} --activate\` ` +
      "or your preferred pnpm installer.",
  );
  process.exit(1);
}

function run({ name, args }) {
  console.log(`\n▸ ${name}`);
  const result = spawnPnpm(args, { stdio: "inherit" });

  if (result.status === 0) return true;

  console.error(`  ${name} failed.`);
  return false;
}

function main() {
  checkNodeVersion();
  checkPnpmVersion();

  for (const step of STEPS) {
    if (!run(step)) process.exit(1);
  }

  console.log("\nReady.\n");
  console.log("  pnpm dev            start the app on http://localhost:5173");
  console.log("  pnpm verify         run the core checks enforced before browser smoke");
  console.log("  pnpm seed:add       add a SEED component snippet");
  console.log("  pnpm brand:sync     apply config/brand.config.json to global.css");

  console.log(
    "\nWorking with an AI agent? Open this repository in Cursor and run `/start`.\n" +
      "It reads .cursor/rules, connects the seed-docs MCP server and states the ground rules.",
  );
}

main();
