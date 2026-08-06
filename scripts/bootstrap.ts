import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIN_NODE_MAJOR = 22;

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
  const major = Number(process.versions.node.split(".")[0]);
  if (major < MIN_NODE_MAJOR) {
    console.error(
      `Node ${MIN_NODE_MAJOR} or newer is required, found ${process.versions.node}.\n` +
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

  if (!existsSync(join(ROOT, ".env"))) {
    console.log(
      "\nOptional: copy .env.example to .env and add a Figma token to enable the seed-figma MCP server.",
    );
  }

  console.log(
    "\nWorking with an AI agent? Open this repository in Cursor and run `/start`.\n" +
      "It reads .cursor/rules, connects the seed-docs MCP server and states the ground rules.",
  );
}

main();
