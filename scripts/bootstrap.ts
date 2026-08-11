import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SUPPORTED_NODE_RANGE = "^22.22.2 || ^24.15.0 || >=26.0.0";

interface Step {
  name: string;
  command: string;
  args: string[];
  /** A failure here is informational rather than fatal. */
  advisory?: boolean;
}

const STEPS: Step[] = [
  { name: "Install dependencies", command: "pnpm", args: ["install"] },
  { name: "Generate the route tree", command: "pnpm", args: ["routes:gen"] },
  { name: "Refresh the SEED token catalog and docs", command: "pnpm", args: ["seed:sync"] },
  { name: "Apply config/brand.config.json to global.css", command: "pnpm", args: ["brand:sync"] },
  {
    name: "Check SEED snippets against the installed packages",
    command: "pnpm",
    args: ["seed:compat"],
    advisory: true,
  },
  { name: "Verify the design system lock-in", command: "pnpm", args: ["verify:lockin"] },
  { name: "Typecheck", command: "pnpm", args: ["typecheck"] },
];

function checkNodeVersion(): void {
  const [major = 0, minor = 0, patch = 0] = process.versions.node
    .split(".")
    .map((part) => Number(part));
  const supported =
    (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) ||
    (major === 24 && minor >= 15) ||
    major >= 26;

  if (!supported) {
    console.error(
      `Node ${SUPPORTED_NODE_RANGE} is required, found ${process.versions.node}.\n` +
        `Run \`nvm use\` to pick up the version in .nvmrc.`,
    );
    process.exit(1);
  }
}

function run({ name, command, args, advisory }: Step): boolean {
  console.log(`\n▸ ${name}`);
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit", shell: true });

  if (result.status === 0) return true;

  if (advisory) {
    console.warn(`  ${name} reported problems. Review them, then continue.`);
    return true;
  }

  console.error(`  ${name} failed.`);
  return false;
}

function main(): void {
  checkNodeVersion();

  for (const step of STEPS) {
    if (!run(step)) process.exit(1);
  }

  console.log("\nReady.\n");
  console.log("  pnpm dev            start the app on http://localhost:5173");
  console.log("  pnpm verify         run every check this repository enforces");
  console.log("  pnpm seed:add       add a SEED component snippet");
  console.log("  pnpm brand:sync     apply config/brand.config.json to global.css");

  console.log(
    "\nWorking with an AI agent? Open this repository in Cursor and run `/start`.\n" +
      "It reads .cursor/rules, connects the seed-docs MCP server and states the ground rules.",
  );
}

main();
