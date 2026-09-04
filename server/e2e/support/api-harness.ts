import {
  createAuthRepository,
  createDatabaseRuntime,
  createDeviceAuthorizationRepository,
  createDeviceManagementRepository,
  createExtensionAuthRepository,
  createP3BootstrapPolicyCatalogRepository,
} from "@product/db";
import { AuthService, deriveAuthKeys } from "@product/auth";
import {
  DeviceAuthorizationService,
  deriveDeviceAuthKeys,
} from "@product/device-auth";
import {
  DeviceManagementService,
  PreEntitlementDeviceLimitResolver,
} from "@product/device-management";
import {
  ExtensionAuthService,
  deriveExtensionAuthKeys,
} from "@product/extension-auth";
import { loadConfig } from "@product/shared";
import { createApiApp } from "../../apps/api/src/app.js";
import { createInfrastructureReadiness } from "../../apps/api/src/infrastructure.js";
import { BootstrapService } from "../../packages/bootstrap/src/index.js";
import { resolveP3BootstrapPolicy } from "../../packages/remote-config/src/index.js";
import {
  bindConfigSigningMaterial,
  loadConfigSigningMaterial,
} from "../../apps/api/src/bootstrap-signing.js";
import { assertE2eDatabase } from "./database.js";
import {
  TEST_ONLY_ACCESS_TOKEN_SIGNING_KEY,
  TEST_ONLY_AUTH_ROOT,
} from "./auth-material.js";

assertE2eDatabase();
const config = loadConfig({
  ...process.env,
  NODE_ENV: "test",
  API_PORT: "3100",
});
const database = createDatabaseRuntime(config.databaseUrl);
const root = TEST_ONLY_AUTH_ROOT;
const signingKey = TEST_ONLY_ACCESS_TOKEN_SIGNING_KEY;
const auth = new AuthService(
  createAuthRepository(database),
  deriveAuthKeys(root),
  undefined,
  () => "424242",
);
let app: ReturnType<typeof createApiApp> | undefined;
let closing = false;
async function close(): Promise<void> {
  if (closing) return;
  closing = true;
  await app?.close();
  await database.close();
}
process.once("SIGINT", () => void close());
process.once("SIGTERM", () => void close());
async function main(): Promise<void> {
  try {
    const bootstrapSigningMaterial = loadConfigSigningMaterial(process.env);
    const p3Catalog = createP3BootstrapPolicyCatalogRepository(database);
    // The only key material persisted in the disposable database is the derived
    // public SPKI and fingerprint. This is the same binding production performs.
    // The guarded disposable database may contain metadata from a prior
    // Playwright process. Reset it before binding this run's new identity.
    await database.query("TRUNCATE signing_keys CASCADE");
    await database.query(
      "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES($1,'Ed25519',$2,$3)",
      [
        bootstrapSigningMaterial.keyId,
        bootstrapSigningMaterial.publicKeySpkiDer,
        bootstrapSigningMaterial.publicKeySha256,
      ],
    );
    const metadata = await p3Catalog.findSigningKey(
      bootstrapSigningMaterial.keyId,
    );
    if (!metadata)
      throw new Error("E2E bootstrap public signing metadata is absent");
    bindConfigSigningMaterial(bootstrapSigningMaterial, metadata);
    app = createApiApp({
      config,
      isInfrastructureReady: createInfrastructureReadiness(database),
      authService: auth,
      deviceAuthorizationService: new DeviceAuthorizationService(
        createDeviceAuthorizationRepository(database),
        deriveDeviceAuthKeys(root),
      ),
      extensionAuthService: new ExtensionAuthService(
        createExtensionAuthRepository(database),
        deriveExtensionAuthKeys(root),
        undefined,
        signingKey,
      ),
      deviceManagementService: new DeviceManagementService(
        createDeviceManagementRepository(database),
        root,
        signingKey,
        new PreEntitlementDeviceLimitResolver(),
      ),
      bootstrapService: new BootstrapService(
        { resolve: (input) => resolveP3BootstrapPolicy(input, p3Catalog) },
        bootstrapSigningMaterial,
      ),
    });
    await app.listen({ host: "127.0.0.1", port: 3100 });
  } catch (error) {
    await close();
    throw error;
  }
}
void main();
