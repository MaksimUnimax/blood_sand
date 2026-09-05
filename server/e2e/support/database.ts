import { createDatabaseRuntime } from "@product/db";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is required for E2E tests");
  return value;
}

/** Refuses to touch a database unless the explicit disposable E2E interlock is set. */
export function assertE2eDatabase(): string {
  if (process.env.PRODUCT_CONTROL_PLANE_E2E !== "1")
    throw new Error("PRODUCT_CONTROL_PLANE_E2E=1 is required");
  const url = new URL(databaseUrl());
  const loopback = ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
  const namedE2eDatabase = /(?:e2e|test)/i.test(url.pathname);
  if (!loopback || !namedE2eDatabase)
    throw new Error(
      "E2E reset requires a loopback database explicitly named e2e or test",
    );
  return url.toString();
}

export async function migrateE2eDatabase(): Promise<void> {
  const execute = promisify(execFile);
  await execute("pnpm", ["--filter", "@product/db", "db:migrate"], {
    env: { ...process.env, DATABASE_URL: assertE2eDatabase() },
  });
}

export async function resetE2eDatabase(): Promise<void> {
  const database = createDatabaseRuntime(assertE2eDatabase());
  try {
    await database.query(`TRUNCATE TABLE
      refresh_tokens, portal_sessions, otp_email_jobs, otp_challenges,
      device_authorizations, sessions, devices, account_memberships,
      user_identities, accounts, users, audit_events, auth_rate_limit_buckets
      RESTART IDENTITY CASCADE`);
    await database.query(`TRUNCATE TABLE
      config_release_rollout_revisions, config_release_feature_rules, rollouts,
      feature_rule_revisions, feature_definitions,
      config_release_compatibility_policies, config_releases,
      signing_key_events, compatibility_policy_blocked_versions,
      compatibility_policy_revisions, extension_release_browsers,
      extension_release_contracts, extension_releases
      RESTART IDENTITY CASCADE`);
    await database.query(
      "INSERT INTO signing_key_events(key_id,event_type,occurred_at) VALUES ('e2e-config-k1','REGISTERED','2026-09-04T00:00:00.000Z'),('e2e-config-k1','ACTIVATED','2026-09-04T00:00:00.001Z'),('e2e-config-k2','REGISTERED','2026-09-04T00:00:00.002Z'),('e2e-config-k2','ACTIVATED','2026-09-04T00:00:00.003Z')",
    );
  } finally {
    await database.close();
  }
}

/** Run only before the harness binds its one fresh per-run public signing key. */
export async function resetE2eBootstrapSigningMetadata(): Promise<void> {
  const database = createDatabaseRuntime(assertE2eDatabase());
  try {
    await database.query("TRUNCATE signing_keys CASCADE");
  } finally {
    await database.close();
  }
}

export async function sql<
  T extends Record<string, unknown> = Record<string, unknown>,
>(text: string, values?: unknown[]): Promise<T[]> {
  const database = createDatabaseRuntime(assertE2eDatabase());
  try {
    return (await database.query<T>(text, values)).rows;
  } finally {
    await database.close();
  }
}
