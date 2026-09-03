import { fileURLToPath } from "node:url";
import { migrate as drizzleMigrate } from "drizzle-orm/node-postgres/migrator";
import type { MigrationConfig } from "drizzle-orm/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createDatabaseRuntime, type DatabaseRuntime } from "./index.js";

export const migrationsFolder = fileURLToPath(
  new URL("../drizzle", import.meta.url),
);

export type DatabaseMigrator = (
  database: NodePgDatabase,
  config: MigrationConfig,
) => Promise<void>;

export interface RunMigrationsOptions {
  connectionString: string;
  createRuntime?: (connectionString: string) => DatabaseRuntime;
  migrator?: DatabaseMigrator;
  migrationsDirectory?: string;
}

export async function runMigrations({
  connectionString,
  createRuntime = createDatabaseRuntime,
  migrator = drizzleMigrate,
  migrationsDirectory = migrationsFolder,
}: RunMigrationsOptions): Promise<void> {
  const runtime = createRuntime(connectionString);
  let migrationFailure: unknown;
  try {
    await migrator(runtime.db, { migrationsFolder: migrationsDirectory });
  } catch (error) {
    migrationFailure = error;
  }

  try {
    await runtime.close();
  } catch (closeError) {
    if (migrationFailure === undefined) throw closeError;
  }

  if (migrationFailure !== undefined) throw migrationFailure;
}
