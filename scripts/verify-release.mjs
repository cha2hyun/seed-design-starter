import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");

function fail(message) {
  console.error(`Release verification failed: ${message}`);
  process.exit(1);
}

function git(...args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) fail(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function parseVersion(value) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value);
  if (!match) return null;
  return match.slice(1).map(Number);
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

const version = packageJson.version;
const parsedVersion = parseVersion(version);
if (!parsedVersion) fail(`package.json version "${version}" must be a stable X.Y.Z version`);

const tag = `v${version}`;
if (git("tag", "--list", tag) === tag) fail(`${tag} already exists`);

const latestTag = git("tag", "--list", "v[0-9]*", "--sort=-version:refname")
  .split("\n")
  .find((candidate) => parseVersion(candidate.replace(/^v/, "")));

if (latestTag) {
  const latestVersion = parseVersion(latestTag.replace(/^v/, ""));
  if (compareVersions(parsedVersion, latestVersion) <= 0) {
    fail(`${version} must be greater than the latest release ${latestTag}`);
  }
}

const heading = new RegExp(
  `^## \\[${version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`,
  "m",
);
const headingMatch = heading.exec(changelog);
if (!headingMatch) fail(`CHANGELOG.md needs an exact "## [${version}] - YYYY-MM-DD" section`);

const notesStart = headingMatch.index + headingMatch[0].length;
const nextHeading = changelog.slice(notesStart).search(/^## \[/m);
const notes = changelog
  .slice(notesStart, nextHeading === -1 ? undefined : notesStart + nextHeading)
  .trim();
if (!notes) fail(`CHANGELOG.md section ${version} is empty`);

console.log(`Release ${tag} is valid and has CHANGELOG notes.`);
