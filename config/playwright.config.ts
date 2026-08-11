import { defineConfig } from "@playwright/test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isCI = Boolean(process.env.CI);

const viewports = [
  { name: "base-320", width: 320, height: 800 },
  { name: "sm-480", width: 480, height: 900 },
  { name: "md-768", width: 768, height: 900 },
  { name: "lg-1280", width: 1280, height: 900 },
  { name: "xl-1440", width: 1440, height: 1000 },
];

export default defineConfig({
  testDir: resolve(ROOT, "e2e"),
  outputDir: resolve(ROOT, "test-results"),
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ["line"],
    ["html", { open: "never", outputFolder: resolve(ROOT, "playwright-report") }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    locale: "ko-KR",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm preview --host 127.0.0.1",
    cwd: ROOT,
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: viewports.map(({ name, width, height }) => ({
    name,
    use: { viewport: { width, height } },
  })),
});
