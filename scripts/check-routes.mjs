import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROUTE_TREE = join(ROOT, "src/app/routeTree.gen.ts");

function spawnPnpm(args) {
  if (process.platform === "win32") {
    return spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "pnpm.cmd", ...args], {
      cwd: ROOT,
      stdio: "inherit",
    });
  }

  return spawnSync("pnpm", args, { cwd: ROOT, stdio: "inherit" });
}

const before = readFileSync(ROUTE_TREE, "utf8");
const result = spawnPnpm(["routes:gen"]);

if (result.status !== 0) process.exit(result.status ?? 1);

const after = readFileSync(ROUTE_TREE, "utf8");
if (before !== after) {
  console.error(
    "The generated route tree was stale. Review src/app/routeTree.gen.ts, then run pnpm routes:check again.",
  );
  process.exit(1);
}

console.log("The generated route tree is current.");
