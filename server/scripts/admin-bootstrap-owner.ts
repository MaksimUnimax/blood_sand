import { randomUUID } from "node:crypto";
import { createAdminAuthRepository, createDatabaseRuntime } from "@product/db";
import { AdminAuthService, deriveAdminAuthKeys } from "@product/admin-auth";
import { loadAuthRootSecret } from "@product/auth";
import { loadConfig } from "@product/shared";

const email = process.argv[2] ?? process.env.ADMIN_BOOTSTRAP_OWNER_EMAIL;
if (!email || process.argv.length > 3) {
  console.error("Usage: pnpm admin:bootstrap-owner -- <verified-user-email>");
  process.exitCode = 2;
} else {
  const config = loadConfig(process.env);
  const database = createDatabaseRuntime(config.databaseUrl);
  const root = loadAuthRootSecret(process.env);
  const service = new AdminAuthService(
    createAdminAuthRepository(database),
    deriveAdminAuthKeys(root),
  );
  try {
    const result = await service.bootstrapOwner(
      email,
      process.env.ADMIN_BOOTSTRAP_CORRELATION_ID ?? randomUUID(),
    );
    if (!result.ok) {
      console.error(result.code);
      process.exitCode = 1;
    } else {
      console.log(`ADMIN_OWNER_BOOTSTRAPPED ${result.value.principalId}`);
    }
  } finally {
    await database.close();
  }
}
