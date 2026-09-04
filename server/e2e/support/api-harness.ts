import {
  createAuthRepository,
  createDatabaseRuntime,
  createDeviceAuthorizationRepository,
  createDeviceManagementRepository,
  createExtensionAuthRepository,
} from "@product/db";
import { AuthService, deriveAuthKeys } from "@product/auth";
import { DeviceAuthorizationService, deriveDeviceAuthKeys } from "@product/device-auth";
import { DeviceManagementService, PreEntitlementDeviceLimitResolver } from "@product/device-management";
import { ExtensionAuthService, deriveExtensionAuthKeys } from "@product/extension-auth";
import { loadConfig } from "@product/shared";
import { createApiApp } from "../../apps/api/src/app.js";
import { createInfrastructureReadiness } from "../../apps/api/src/infrastructure.js";
import { assertE2eDatabase } from "./database.js";
import { TEST_ONLY_ACCESS_TOKEN_SIGNING_KEY, TEST_ONLY_AUTH_ROOT } from "./auth-material.js";

assertE2eDatabase();
const config = loadConfig({ ...process.env, NODE_ENV: "test", API_PORT: "3100" });
const database = createDatabaseRuntime(config.databaseUrl);
const root = TEST_ONLY_AUTH_ROOT;
const signingKey = TEST_ONLY_ACCESS_TOKEN_SIGNING_KEY;
const auth = new AuthService(
  createAuthRepository(database),
  deriveAuthKeys(root),
  undefined,
  () => "424242",
);
const app = createApiApp({
  config,
  isInfrastructureReady: createInfrastructureReadiness(database),
  authService: auth,
  deviceAuthorizationService: new DeviceAuthorizationService(
    createDeviceAuthorizationRepository(database), deriveDeviceAuthKeys(root),
  ),
  extensionAuthService: new ExtensionAuthService(
    createExtensionAuthRepository(database), deriveExtensionAuthKeys(root), undefined, signingKey,
  ),
  deviceManagementService: new DeviceManagementService(
    createDeviceManagementRepository(database), root, signingKey, new PreEntitlementDeviceLimitResolver(),
  ),
});
let closing = false;
async function close(): Promise<void> {
  if (closing) return;
  closing = true;
  await app.close();
  await database.close();
}
process.once("SIGINT", () => void close());
process.once("SIGTERM", () => void close());
async function main(): Promise<void> {
  try {
    await app.listen({ host: "127.0.0.1", port: 3100 });
  } catch (error) {
    await close();
    throw error;
  }
}
void main();
