import { defineConfig } from "@playwright/test";
import { generateKeyPairSync } from "node:crypto";

// Per-run only: the private half is passed to the disposable API process via
// its environment and is never persisted or exposed by the test API.
const e2eConfigSigningPair = generateKeyPairSync("ed25519");
const e2eConfigSigningPrivateKeyPemB64 = Buffer.from(
  e2eConfigSigningPair.privateKey.export({ format: "pem", type: "pkcs8" }),
).toString("base64");
// Playwright workers inherit this ephemeral process environment for public-key
// verification; the private value is not written to disk or the database.
process.env.CONFIG_SIGNING_KEY_ID = "e2e-config-signing-key";
process.env.CONFIG_SIGNING_PRIVATE_KEY_PEM_B64 =
  e2eConfigSigningPrivateKeyPemB64;

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
      command:
        "pnpm db:migrate && pnpm --filter @product/api exec tsx ../../e2e/support/api-harness.ts",
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
        CONFIG_SIGNING_KEY_ID: "e2e-config-signing-key",
        CONFIG_SIGNING_PRIVATE_KEY_PEM_B64: e2eConfigSigningPrivateKeyPemB64,
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
