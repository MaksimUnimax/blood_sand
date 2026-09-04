import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: "line",
  globalSetup: "./support/global-setup.ts",
  webServer: [
    {
      command: "pnpm --filter @product/api exec tsx ../../e2e/support/api-harness.ts",
      url: "http://127.0.0.1:3100/health/ready",
      timeout: 60_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        PRODUCT_CONTROL_PLANE_E2E: "1",
        NODE_ENV: "test",
        DATABASE_URL: process.env.DATABASE_URL ?? "",
        API_PORT: "3100",
        LOG_LEVEL: "warn",
      },
    },
    {
      command:
        "cd ../apps/portal && pnpm exec next dev --hostname 127.0.0.1 --port 3200",
      url: "http://127.0.0.1:3200/login",
      timeout: 60_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        CONTROL_PLANE_API_ORIGIN: "http://127.0.0.1:3100",
      },
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:3200",
    browserName: "chromium",
    trace: "off",
    video: "off",
    screenshot: "off",
  },
});
