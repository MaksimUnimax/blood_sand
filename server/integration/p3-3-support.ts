import { createHash, generateKeyPairSync, randomUUID } from "node:crypto";
import {
  createDatabaseRuntime,
  createP3BootstrapPolicyCatalogRepository,
  createP3PolicyPublicationRepository,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";

export const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");
export const context = {
  actorType: "SYSTEM" as const,
  correlationId: "p3-3-integration",
};
export const now = () => new Date("2026-09-04T00:00:00.000Z");
export const dbFor = async () => {
  const db = createDatabaseRuntime(connectionString!);
  await db.ready();
  return db;
};
export const publicationFor = (db: DatabaseRuntime) =>
  createP3PolicyPublicationRepository(db);
export const catalogFor = (db: DatabaseRuntime) =>
  createP3BootstrapPolicyCatalogRepository(db);
export async function clean(db: DatabaseRuntime) {
  await db.query(
    "TRUNCATE audit_events,config_release_rollout_revisions,config_release_feature_rules,rollout_revisions,rollouts,feature_rule_revisions,feature_definitions,config_release_compatibility_policies,config_releases,signing_key_events,signing_keys,compatibility_policy_blocked_versions,compatibility_policy_revisions,extension_release_browsers,extension_release_contracts,extension_releases RESTART IDENTITY",
  );
}
export async function addKey(db: DatabaseRuntime, id = "p3-config-key") {
  const publicKey = generateKeyPairSync("ed25519").publicKey.export({
    format: "der",
    type: "spki",
  });
  await db.query(
    "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES($1,'Ed25519',$2,$3)",
    [id, publicKey, createHash("sha256").update(publicKey).digest("hex")],
  );
  await db.query(
    "INSERT INTO signing_key_events(key_id,event_type,occurred_at) VALUES($1,'REGISTERED',$2),($1,'ACTIVATED',$3)",
    [id, now(), new Date(now().getTime() + 1)],
  );
  return id;
}
export async function policy(
  db: DatabaseRuntime,
  key = "policy-global",
  browser: "chrome" | "yandex_chromium" | null = null,
) {
  return publicationFor(db).publishCompatibilityPolicyRevision(
    {
      policyKey: key,
      contractVersion: "control_plane_v1",
      browserFamily: browser,
      minimumExtensionVersion: "1.0.0",
      recommendedExtensionVersion: "1.1.0",
      minimumBrowserVersion: browser ? "100" : null,
      maintenanceMode: false,
      maintenanceCode: null,
      blockedVersions: [],
      publishedAt: now(),
    },
    context,
  );
}
export async function rule(
  db: DatabaseRuntime,
  feature = "feature-one",
  enabled = false,
) {
  const p = publicationFor(db);
  await p
    .createFeatureDefinition({ featureKey: feature }, context)
    .catch(() => undefined);
  return p.publishFeatureRuleRevision(
    {
      featureKey: feature,
      contractVersion: "control_plane_v1",
      enabled,
      browserFamily: null,
      minimumExtensionVersion: "1.0.0",
      publishedAt: now(),
    },
    context,
  );
}
export async function featureRollout(
  db: DatabaseRuntime,
  key = "feature-one.rollout",
  baseline?: string,
  candidate?: string,
  state: "ACTIVE" | "PAUSED" | "RETIRED" = "ACTIVE",
  percentageBps = 0,
) {
  const p = publicationFor(db);
  await p.createRollout(
    { rolloutKey: key, targetKind: "FEATURE_RULE", subjectKind: "ACCOUNT" },
    context,
    Buffer.alloc(32, 7),
  );
  return p.publishRolloutRevision(
    {
      rolloutKey: key,
      state,
      percentageBps,
      baselineFeatureRuleRevisionId: baseline!,
      candidateFeatureRuleRevisionId: candidate!,
      publishedAt: now(),
    },
    context,
  );
}
export const count = async (db: DatabaseRuntime, table: string) =>
  Number(
    (
      await db.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM ${table}`,
      )
    ).rows[0]!.count,
  );
export const uuid = () => randomUUID();
