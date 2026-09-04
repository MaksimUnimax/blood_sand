import { createDatabaseRuntime, createExtensionAuthRepository } from "@product/db";
import { deriveExtensionAuthKeys, ExtensionAuthService } from "@product/extension-auth";
import {
  TEST_ONLY_ACCESS_TOKEN_SIGNING_KEY,
  TEST_ONLY_AUTH_ROOT,
} from "./auth-material.js";

/**
 * Test-only access-auth boundary. It deliberately composes production domain
 * code and the E2E PostgreSQL state without exposing an HTTP endpoint.
 */
export function createAccessAuthProbe(input: { databaseUrl: string }) {
  const database = createDatabaseRuntime(input.databaseUrl);
  const auth = new ExtensionAuthService(
    createExtensionAuthRepository(database),
    deriveExtensionAuthKeys(TEST_ONLY_AUTH_ROOT),
    undefined,
    TEST_ONLY_ACCESS_TOKEN_SIGNING_KEY,
  );
  return {
    authenticate: (accessToken: string) => auth.authenticateAccess(accessToken),
    close: () => database.close(),
  };
}
