import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabaseRuntime, type DatabaseRuntime } from './index.js';
import { runMigrations } from './migrations.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for pnpm test:integration (real PostgreSQL is not optional).');
}

let runtime: DatabaseRuntime;

async function migrationMetadataExists(): Promise<boolean> {
  const result = await runtime.db.execute<{ exists: boolean }>(
    sql`SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS "exists"`
  );
  return result.rows[0]?.exists === true;
}

async function migrationRecordCount(): Promise<number> {
  const result = await runtime.db.execute<{ count: string }>(
    sql`SELECT count(*)::text AS "count" FROM drizzle."__drizzle_migrations"`
  );
  return Number(result.rows[0]?.count ?? '0');
}

describe('PostgreSQL Drizzle migration integration', () => {
  beforeAll(async () => {
    runtime = createDatabaseRuntime(connectionString);
    await runtime.ready();
  });

  afterAll(async () => {
    await runtime.close();
  });

  it('connects, migrates exactly once, leaves no probe table, and executes a real query', async () => {
    const metadataBefore = await migrationMetadataExists() ? await migrationRecordCount() : 0;
    expect(metadataBefore).toBeLessThanOrEqual(1);

    await runMigrations({ connectionString });

    expect(await migrationMetadataExists()).toBe(true);
    const recordsAfterFirstRun = await migrationRecordCount();
    expect(recordsAfterFirstRun).toBe(1);

    const probeResult = await runtime.db.execute<{ probe: string | null }>(
      sql`SELECT to_regclass('__p1_migration_probe') AS "probe"`
    );
    expect(probeResult.rows[0]?.probe ?? null).toBeNull();

    const queryResult = await runtime.db.execute<{ value: number }>(sql`SELECT 1 AS "value"`);
    expect(queryResult.rows[0]?.value).toBe(1);

    await runMigrations({ connectionString });
    const recordsAfterSecondRun = await migrationRecordCount();
    expect(recordsAfterSecondRun).toBe(recordsAfterFirstRun);
  });
});
