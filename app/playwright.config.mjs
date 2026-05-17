import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(configDir, "../api");
const tmpDir = path.join(apiDir, ".tmp", "playwright");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: "./test-results",
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4273",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: [
    {
      name: "API",
      cwd: apiDir,
      command: "npm run start",
      url: "http://127.0.0.1:4310/api/healthz",
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        PORT: "4310",
        LOG_LEVEL: "silent",
        CORS_ORIGIN: "http://127.0.0.1:4273",
        AUTH_DEV_MODE: "false",
        AUTH_JWT_SECRET: "playwright-test-secret-with-32-plus-characters",
        DB_DRIVER: "sqlite",
        DB_SQLITE_PATH: path.join(tmpDir, "tongzhou.e2e.db"),
        CACHE_DRIVER: "memory",
        STORAGE_DRIVER: "local",
        STORAGE_LOCAL_DIR: path.join(tmpDir, "uploads"),
        STORAGE_PUBLIC_BASE: "http://127.0.0.1:4310/files",
        VIDEO_DRIVER: "local",
      },
    },
    {
      name: "App",
      cwd: configDir,
      command: "npm run dev",
      url: "http://127.0.0.1:4273/login",
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        PORT: "4273",
        API_BASE: "http://127.0.0.1:4310",
        TENANT_SLUG: "playwright-space",
      },
    },
  ],
});
