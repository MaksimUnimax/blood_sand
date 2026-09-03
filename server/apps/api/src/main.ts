import {
  createAuthRepository,
  createDatabaseRuntime,
  createDeviceAuthorizationRepository,
  createExtensionAuthRepository,
} from "@product/db";
import { AuthService, deriveAuthKeys, loadAuthRootSecret } from "@product/auth";
import {
  DeviceAuthorizationService,
  deriveDeviceAuthKeys,
} from "@product/device-auth";
import {
  ExtensionAuthService,
  deriveExtensionAuthKeys,
  loadAccessTokenSigningKey,
} from "@product/extension-auth";
import { loadConfig } from "@product/shared";
import { createApiApp } from "./app.js";
import { createInfrastructureReadiness } from "./infrastructure.js";

const config = loadConfig(process.env);
const database = createDatabaseRuntime(config.databaseUrl);
const rootSecret = loadAuthRootSecret(process.env);
const app = createApiApp({
  config,
  isInfrastructureReady: createInfrastructureReadiness(database),
  authService: new AuthService(
    createAuthRepository(database),
    deriveAuthKeys(rootSecret),
  ),
  deviceAuthorizationService: new DeviceAuthorizationService(
    createDeviceAuthorizationRepository(database),
    deriveDeviceAuthKeys(rootSecret),
  ),
  extensionAuthService: new ExtensionAuthService(
    createExtensionAuthRepository(database),
    deriveExtensionAuthKeys(rootSecret),
    undefined,
    loadAccessTokenSigningKey(process.env),
  ),
});
let closing = false;
async function shutdown(signal: string): Promise<void> {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, "API shutdown requested");
  await app.close();
  await database.close();
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
try {
  await app.listen({ host: "127.0.0.1", port: config.apiPort });
} catch (error) {
  closing = true;
  try {
    await app.close();
  } catch {
    // Preserve the original startup failure after bounded cleanup.
  }
  try {
    await database.close();
  } catch {
    // Preserve the original startup failure after bounded cleanup.
  }
  throw error;
}
