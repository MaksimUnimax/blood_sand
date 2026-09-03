import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabaseRuntime, type DatabaseRuntime } from "./index.js";
import { migrationsFolder, runMigrations } from "./migrations.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required for pnpm test:integration (real PostgreSQL is not optional).",
  );
}

let runtime: DatabaseRuntime;
let p1Directory: string | undefined;

async function resetDatabase(): Promise<void> {
  await runtime.db.execute(sql`DROP SCHEMA public CASCADE`);
  await runtime.db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
  await runtime.db.execute(sql`CREATE SCHEMA public`);
}

async function rejects(statement: ReturnType<typeof sql>): Promise<void> {
  await expect(runtime.db.execute(statement)).rejects.toBeInstanceOf(Error);
}

async function tables(): Promise<string[]> {
  const result = await runtime.db.execute<{ table_name: string }>(sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  return result.rows.map((row) => row.table_name);
}

describe.sequential("P2.1 PostgreSQL persistence integration", () => {
  beforeAll(async () => {
    runtime = createDatabaseRuntime(connectionString);
    await runtime.ready();
    p1Directory = await mkdtemp(join(tmpdir(), "p2-1-p1-"));
    await cp(
      join(migrationsFolder, "0000_p1_migration_probe.sql"),
      join(p1Directory, "0000_p1_migration_probe.sql"),
    );
    await mkdir(join(p1Directory, "meta"));
    await writeFile(
      join(p1Directory, "meta", "_journal.json"),
      JSON.stringify({
        version: "7",
        dialect: "postgresql",
        entries: [
          {
            idx: 0,
            version: "7",
            when: 1770000000000,
            tag: "0000_p1_migration_probe",
            breakpoints: true,
          },
        ],
      }),
    );
  });

  afterAll(async () => {
    await runtime.close();
    if (p1Directory) await rm(p1Directory, { recursive: true });
  });

  it("migrates empty through P2.5, leaves no P1 probe, and is idempotent", async () => {
    await resetDatabase();
    await runMigrations({ connectionString });
    await runMigrations({ connectionString });
    expect(await tables()).toEqual([
      "account_memberships",
      "accounts",
      "audit_events",
      "auth_rate_limit_buckets",
      "device_authorizations",
      "devices",
      "otp_challenges",
      "otp_email_jobs",
      "portal_sessions",
      "refresh_tokens",
      "sessions",
      "user_identities",
      "users",
    ]);
    const count = await runtime.db.execute<{ count: string }>(sql`
      SELECT count(*)::text AS "count" FROM drizzle."__drizzle_migrations"
    `);
    expect(count.rows[0]?.count).toBe("6");
    const probe = await runtime.db.execute<{ probe: string | null }>(sql`
      SELECT to_regclass('__p1_migration_probe') AS "probe"
    `);
    expect(probe.rows[0]?.probe).toBeNull();
  });

  it("enforces unique hashes, lifecycle checks, foreign keys, and no plaintext secret columns", async () => {
    await runtime.db.execute(
      sql`INSERT INTO users (id) VALUES ('00000000-0000-0000-0000-000000000001')`,
    );
    await runtime.db.execute(
      sql`INSERT INTO accounts (id) VALUES ('00000000-0000-0000-0000-000000000002')`,
    );
    await runtime.db.execute(
      sql`INSERT INTO user_identities (id, user_id, provider, normalized_identifier) VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'EMAIL', 'person@example.test')`,
    );
    await rejects(
      sql`INSERT INTO user_identities (user_id, provider, normalized_identifier) VALUES ('00000000-0000-0000-0000-000000000001', 'EMAIL', 'person@example.test')`,
    );
    await runtime.db.execute(
      sql`INSERT INTO portal_sessions (id, user_id, session_token_hash, expires_at) VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'portal-hash-a', now() + interval '1 day')`,
    );
    await rejects(
      sql`INSERT INTO portal_sessions (user_id, session_token_hash, expires_at) VALUES ('00000000-0000-0000-0000-000000000001', 'portal-hash-a', now() + interval '1 day')`,
    );
    await runtime.db.execute(
      sql`INSERT INTO device_authorizations (id, device_code_hash, user_code_hash, requested_client_type, browser_family, expires_at) VALUES ('00000000-0000-0000-0000-000000000005', 'device-hash-a', 'user-hash-a', 'browser_extension', 'chrome', now() + interval '1 day')`,
    );
    await rejects(
      sql`INSERT INTO device_authorizations (device_code_hash, user_code_hash, requested_client_type, browser_family, expires_at) VALUES ('device-hash-a', 'user-hash-b', 'browser_extension', 'chrome', now() + interval '1 day')`,
    );
    await rejects(
      sql`INSERT INTO otp_challenges (purpose, normalized_identity_target, verification_hash, attempt_count, max_attempts, expires_at) VALUES ('LOGIN', 'person@example.test', 'otp-hash-a', 2, 1, now() + interval '1 day')`,
    );
    await runtime.db.execute(
      sql`INSERT INTO devices (id, account_id, created_by_user_id, browser_family) VALUES ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'chrome')`,
    );
    await runtime.db.execute(
      sql`INSERT INTO sessions (id, device_id, account_id, token_family_id) VALUES ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008')`,
    );
    await rejects(
      sql`INSERT INTO sessions (device_id, account_id, token_family_id) VALUES ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008')`,
    );
    await runtime.db.execute(
      sql`INSERT INTO refresh_tokens (id, session_id, token_hash, generation, expires_at) VALUES ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000007', 'refresh-hash-a', 0, now() + interval '1 day')`,
    );
    await rejects(
      sql`INSERT INTO refresh_tokens (session_id, token_hash, generation, expires_at) VALUES ('00000000-0000-0000-0000-000000000007', 'refresh-hash-a', 1, now() + interval '1 day')`,
    );
    await rejects(
      sql`INSERT INTO refresh_tokens (session_id, token_hash, generation, expires_at) VALUES ('00000000-0000-0000-0000-000000000007', 'refresh-hash-b', -1, now() + interval '1 day')`,
    );
    await rejects(
      sql`INSERT INTO devices (account_id, created_by_user_id, browser_family) VALUES ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000001', 'chrome')`,
    );
    await rejects(
      sql`INSERT INTO refresh_tokens (session_id, token_hash, generation, expires_at) VALUES ('00000000-0000-0000-0000-000000000099', 'refresh-hash-c', 1, now() + interval '1 day')`,
    );
    const secretColumns = await runtime.db.execute<{ column_name: string }>(sql`
      SELECT column_name FROM information_schema.columns WHERE table_schema = 'public'
      AND column_name IN ('otp', 'otp_code', 'device_code', 'user_code', 'refresh_token', 'session_token', 'access_token', 'password')
    `);
    expect(secretColumns.rows).toEqual([]);
  });

  it("migrates the accepted P1 state forward to P2.1", async () => {
    await resetDatabase();
    await runMigrations({ connectionString, migrationsDirectory: p1Directory });
    await runMigrations({ connectionString });
    expect(await tables()).toContain("refresh_tokens");
  });
});
