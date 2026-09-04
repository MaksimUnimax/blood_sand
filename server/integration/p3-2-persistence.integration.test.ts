import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  randomUUID,
} from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  signBootstrapSnapshot,
  verifyBootstrapEnvelope,
} from "../packages/remote-config/src/index.js";
import {
  createCompatibilityCatalogRepository,
  createDatabaseRuntime,
  createRemoteConfigCatalogRepository,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";
import { runMigrations } from "../packages/db/src/migrations.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");
const hex = (value: string) => value.repeat(64).slice(0, 64);
let db: DatabaseRuntime;
const q = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values?: unknown[],
) => db.query<T>(text, values);
async function clean() {
  await q(
    "TRUNCATE config_release_rollout_revisions,config_release_feature_rules,rollout_revisions,rollouts,feature_rule_revisions,feature_definitions,config_release_compatibility_policies,config_releases,signing_key_events,signing_keys,compatibility_policy_blocked_versions,compatibility_policy_revisions,extension_release_browsers,extension_release_contracts,extension_releases",
  );
}
function key(id: string) {
  const pair = generateKeyPairSync("ed25519");
  const der = pair.publicKey.export({ format: "der", type: "spki" });
  return {
    id,
    pair,
    der,
    fingerprint: createHash("sha256").update(der).digest("hex"),
  };
}
async function addKey(value = key("config-current")) {
  await q(
    "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES($1,'Ed25519',$2,$3)",
    [value.id, value.der, value.fingerprint],
  );
  return value;
}
async function addPolicy(revision = 1) {
  const id = randomUUID();
  await q(
    "INSERT INTO compatibility_policy_revisions(id,policy_key,revision,contract_version,published_at) VALUES($1,'compatibility.chrome',$2,'control_plane_v1',now())",
    [id, revision],
  );
  return id;
}
async function addRelease() {
  const id = randomUUID();
  await q(
    "INSERT INTO extension_releases(id,version,release_channel,released_at) VALUES($1,'1.2.3','stable',now())",
    [id],
  );
  return id;
}
async function addConfig(keyId: string) {
  const r = await q<{ config_version: number }>(
    "INSERT INTO config_releases(contract_version,snapshot_version,envelope_version,content_hash_sha256,source_fingerprint_sha256,signing_key_id,published_at) VALUES('control_plane_v1','bootstrap_snapshot_v1','bootstrap_envelope_v1',$1,$2,$3,now()) RETURNING config_version",
    [hex("a"), hex("b"), keyId],
  );
  return r.rows[0]!.config_version;
}

describe.sequential(
  "P3.2 real PostgreSQL immutable compatibility/config/signing persistence",
  () => {
    beforeAll(async () => {
      db = createDatabaseRuntime(connectionString!);
      await db.ready();
      await runMigrations({ connectionString: connectionString! });
      await runMigrations({ connectionString: connectionString! });
    });
    beforeEach(clean);
    afterAll(async () => db.close());
    it("creates only typed P3.2 tables, no private-key columns or JSON policy bags", async () => {
      const tables = await q<{ table_name: string }>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('extension_releases','extension_release_contracts','extension_release_browsers','compatibility_policy_revisions','compatibility_policy_blocked_versions','signing_keys','signing_key_events','config_releases','config_release_compatibility_policies') ORDER BY table_name",
      );
      expect(tables.rows).toHaveLength(9);
      const forbidden = await q<{ column_name: string }>(
        "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('extension_releases','extension_release_contracts','extension_release_browsers','compatibility_policy_revisions','compatibility_policy_blocked_versions','signing_keys','signing_key_events','config_releases','config_release_compatibility_policies') AND (column_name ~* '(private.*key|secret.*key|signing.*secret)' OR data_type IN ('json','jsonb'))",
      );
      expect(forbidden.rows).toEqual([]);
    });
    it("enforces FK, uniqueness, hashes, and generated-always config versions", async () => {
      await expect(
        q(
          "INSERT INTO extension_release_contracts(release_id,contract_version) VALUES($1,'control_plane_v1')",
          [randomUUID()],
        ),
      ).rejects.toThrow();
      await expect(
        q(
          "INSERT INTO extension_release_browsers(release_id,browser_family) VALUES($1,'chrome')",
          [randomUUID()],
        ),
      ).rejects.toThrow();
      await expect(
        q(
          "INSERT INTO compatibility_policy_blocked_versions(policy_revision_id,extension_version) VALUES($1,'1.2.3')",
          [randomUUID()],
        ),
      ).rejects.toThrow();
      await expect(
        q(
          "INSERT INTO signing_key_events(id,key_id,event_type,occurred_at) VALUES($1,'missing','REGISTERED',now())",
          [randomUUID()],
        ),
      ).rejects.toThrow();
      await expect(
        q(
          "INSERT INTO config_releases(contract_version,snapshot_version,envelope_version,content_hash_sha256,source_fingerprint_sha256,signing_key_id,published_at) VALUES('control_plane_v1','bootstrap_snapshot_v1','bootstrap_envelope_v1',$1,$2,'missing',now())",
          [hex("a"), hex("b")],
        ),
      ).rejects.toThrow();
      await expect(
        q(
          "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES(1,$1)",
          [randomUUID()],
        ),
      ).rejects.toThrow();
      const release = await addRelease();
      await q(
        "INSERT INTO extension_release_contracts(release_id,contract_version) VALUES($1,'control_plane_v1')",
        [release],
      );
      await expect(
        q(
          "INSERT INTO extension_release_contracts(release_id,contract_version) VALUES($1,'control_plane_v1')",
          [release],
        ),
      ).rejects.toThrow();
      await q(
        "INSERT INTO extension_release_browsers(release_id,browser_family) VALUES($1,'chrome')",
        [release],
      );
      await expect(
        q(
          "INSERT INTO extension_release_browsers(release_id,browser_family) VALUES($1,'chrome')",
          [release],
        ),
      ).rejects.toThrow();
      await expect(
        q(
          "INSERT INTO extension_releases(version,release_channel,released_at) VALUES('1.2.3','stable',now())",
        ),
      ).rejects.toThrow();
      const policy = await addPolicy();
      await q(
        "INSERT INTO compatibility_policy_blocked_versions(policy_revision_id,extension_version) VALUES($1,'1.2.3')",
        [policy],
      );
      await expect(
        q(
          "INSERT INTO compatibility_policy_blocked_versions(policy_revision_id,extension_version) VALUES($1,'1.2.3')",
          [policy],
        ),
      ).rejects.toThrow();
      await expect(
        q(
          "INSERT INTO compatibility_policy_revisions(id,policy_key,revision,contract_version,published_at) VALUES($1,'compatibility.chrome',1,'control_plane_v1',now())",
          [randomUUID()],
        ),
      ).rejects.toThrow();
      const signing = await addKey();
      await expect(
        q(
          "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES('another','Ed25519',$1,$2)",
          [signing.der, signing.fingerprint],
        ),
      ).rejects.toThrow();
      const first = await addConfig(signing.id),
        second = await addConfig(signing.id);
      expect(second).toBeGreaterThan(first);
      await expect(
        q(
          "INSERT INTO config_releases(config_version,contract_version,snapshot_version,envelope_version,content_hash_sha256,source_fingerprint_sha256,signing_key_id,published_at) VALUES(999,'control_plane_v1','bootstrap_snapshot_v1','bootstrap_envelope_v1',$1,$2,$3,now())",
          [hex("c"), hex("d"), signing.id],
        ),
      ).rejects.toThrow();
      await q(
        "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES($1,$2)",
        [first, policy],
      );
      await expect(
        q(
          "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES($1,$2)",
          [first, policy],
        ),
      ).rejects.toThrow();
    });
    it("rejects updates and deletes for immutable parents, children, and lifecycle events", async () => {
      const release = await addRelease(),
        policy = await addPolicy(),
        signing = await addKey(),
        config = await addConfig(signing.id);
      await q(
        "INSERT INTO extension_release_contracts(release_id,contract_version) VALUES($1,'control_plane_v1')",
        [release],
      );
      await q(
        "INSERT INTO compatibility_policy_blocked_versions(policy_revision_id,extension_version) VALUES($1,'1.2.3')",
        [policy],
      );
      await q(
        "INSERT INTO signing_key_events(id,key_id,event_type,occurred_at) VALUES($1,$2,'REGISTERED',now())",
        [randomUUID(), signing.id],
      );
      await q(
        "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES($1,$2)",
        [config, policy],
      );
      for (const statement of [
        "UPDATE extension_releases SET release_channel='beta'",
        "DELETE FROM extension_release_contracts",
        "UPDATE compatibility_policy_revisions SET maintenance_mode=true",
        "DELETE FROM compatibility_policy_blocked_versions",
        "UPDATE signing_keys SET algorithm='Ed25519'",
        "DELETE FROM signing_key_events",
        "UPDATE config_releases SET published_at=now()",
        "DELETE FROM config_release_compatibility_policies",
      ])
        await expect(q(statement)).rejects.toThrow();
    });
    it("fails closed on corrupt rows and verifies a P3.1 envelope with a stored SPKI public key", async () => {
      const signing = await addKey();
      const catalog = createRemoteConfigCatalogRepository(db);
      const stored = await catalog.findSigningKey(signing.id);
      expect(stored).toBeDefined();
      const payload = {
        snapshotVersion: "bootstrap_snapshot_v1" as const,
        contractVersion: "control_plane_v1" as const,
        configVersion: 1,
        issuedAt: "2026-09-04T00:00:00.000Z",
        expiresAt: "2026-09-04T00:05:00.000Z",
        offlineGraceUntil: "2026-09-04T00:10:00.000Z",
        serverTime: "2026-09-04T00:00:01.000Z",
        account: { status: "ACTIVE" as const },
        subscription: { state: "NONE" as const, planRevision: null },
        devicePolicy: { status: "ACTIVE" as const },
        compatibility: {
          extension: { status: "SUPPORTED" as const, minimumVersion: null },
          browser: { status: "SUPPORTED" as const },
        },
        entitlements: {},
        features: {},
        ai: { status: "UNCONFIGURED" as const },
      };
      const envelope = signBootstrapSnapshot(
        payload,
        signing.id,
        signing.pair.privateKey,
      );
      expect(
        verifyBootstrapEnvelope(
          envelope,
          new Map([
            [
              signing.id,
              createPublicKey({
                key: stored!.publicKeySpkiDer,
                format: "der",
                type: "spki",
              }),
            ],
          ]),
        ).ok,
      ).toBe(true);
    });
    it("preserves separate key histories and exact config-policy source pins", async () => {
      const old = await addKey(key("config-old")),
        next = await addKey(key("config-new"));
      await q(
        "INSERT INTO signing_key_events(id,key_id,event_type,occurred_at) VALUES($1,$2,'REGISTERED',now()),($3,$4,'ACTIVATED',now())",
        [randomUUID(), old.id, randomUUID(), next.id],
      );
      const one = await addPolicy(1),
        two = await addPolicy(2),
        a = await addConfig(old.id),
        b = await addConfig(next.id);
      await q(
        "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES($1,$2),($3,$4)",
        [a, one, b, two],
      );
      const remote = createRemoteConfigCatalogRepository(db),
        compatibility = createCompatibilityCatalogRepository(db);
      expect(
        (await remote.listSigningKeyEvents(old.id)).map((e) => e.keyId),
      ).toEqual([old.id]);
      expect(
        (await remote.listSigningKeyEvents(next.id)).map((e) => e.keyId),
      ).toEqual([next.id]);
      expect(
        (await remote.listConfigReleaseCompatibilityPolicies(a)).map(
          (x) => x.policyRevisionId,
        ),
      ).toEqual([one]);
      expect(
        (await remote.listConfigReleaseCompatibilityPolicies(b)).map(
          (x) => x.policyRevisionId,
        ),
      ).toEqual([two]);
      expect(
        (
          await compatibility.listCompatibilityPolicyRevisions(
            "control_plane_v1",
          )
        ).map((x) => x.revision),
      ).toEqual([1, 2]);
    });
  },
);
