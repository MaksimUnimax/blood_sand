import { createHash, generateKeyPairSync } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabaseRuntime,
  type DatabaseRuntime,
  createP3PolicyPublicationRepository,
} from "../packages/db/src/index.js";
import {
  RegisterSigningKeyCommandSchema,
  resolveP3BootstrapPolicy,
  resolveSigningKeyLifecycle,
  rolloutBucketV1,
  verifyBootstrapEnvelope,
} from "../packages/remote-config/src/index.js";
import { BootstrapService } from "../packages/bootstrap/src/index.js";
import {
  bindConfigSigningRing,
  createConfigSigningService,
  loadConfigSigningMaterial,
} from "../apps/api/src/bootstrap-signing.js";
import {
  clean,
  connectionString,
  context,
  count,
  now,
  policy,
  rule,
} from "./p3-3-support.js";
import { runMigrations } from "../packages/db/src/migrations.js";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");

function key(keyId: string) {
  const pair = generateKeyPairSync("ed25519");
  const der = pair.publicKey.export({ format: "der", type: "spki" });
  return {
    keyId,
    pair,
    der,
    fingerprint: createHash("sha256").update(der).digest("hex"),
  };
}
async function addConfig(db: DatabaseRuntime, keyId: string) {
  return (
    await db.query<{ configVersion: number }>(
      'INSERT INTO config_releases(contract_version,snapshot_version,envelope_version,content_hash_sha256,source_fingerprint_sha256,signing_key_id,published_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING config_version AS "configVersion"',
      [
        "control_plane_v1",
        "bootstrap_snapshot_v1",
        "bootstrap_envelope_v1",
        "a".repeat(64),
        "b".repeat(64),
        keyId,
        now(),
      ],
    )
  ).rows[0]!.configVersion;
}
async function seedKey(db: DatabaseRuntime, value: ReturnType<typeof key>) {
  const p = createP3PolicyPublicationRepository(db, {
    clock: () => new Date("2026-09-04T00:00:00.000Z"),
  });
  await p.registerSigningKey(
    { keyId: value.keyId, publicKeySpkiDer: value.der },
    context,
  );
  await p.activateSigningKey(value.keyId, context);
}

describe.sequential("P3.5 real PostgreSQL signing-key lifecycle", () => {
  let db: DatabaseRuntime;
  beforeAll(async () => {
    db = createDatabaseRuntime(dbUrl);
    await db.ready();
    await runMigrations({ connectionString });
  });
  beforeEach(() => clean(db));
  afterAll(() => db.close());

  it("registers new metadata, REGISTERED event, and safe audit atomically", async () => {
    const value = key("p35-register");
    const p = createP3PolicyPublicationRepository(db, {
      clock: () => new Date("2026-09-04T00:00:00.000Z"),
    });
    const metadata = await p.registerSigningKey(
      { keyId: value.keyId, publicKeySpkiDer: value.der },
      context,
    );
    expect(metadata.publicKeySha256).toBe(value.fingerprint);
    expect(
      await db.query(
        'SELECT event_type AS "eventType",key_id AS "keyId" FROM signing_key_events',
      ),
    ).toMatchObject({
      rows: [{ eventType: "REGISTERED", keyId: value.keyId }],
    });
    expect(
      await db.query<{
        safe_metadata: { keyId: string; publicKeySha256: string };
      }>(
        "SELECT safe_metadata FROM audit_events WHERE action='SIGNING_KEY_REGISTERED'",
      ),
    ).toMatchObject({
      rows: [
        {
          safe_metadata: {
            keyId: value.keyId,
            publicKeySha256: value.fingerprint,
          },
        },
      ],
    });
  });

  it("adopts an exact P3.4 metadata-only row but rejects mismatch and repeat registration", async () => {
    const value = key("p35-adopt");
    await db.query(
      "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES($1,'Ed25519',$2,$3)",
      [value.keyId, value.der, value.fingerprint],
    );
    const p = createP3PolicyPublicationRepository(db);
    await expect(
      p.registerSigningKey(
        { keyId: value.keyId, publicKeySpkiDer: value.der },
        context,
      ),
    ).resolves.toMatchObject({ keyId: value.keyId });
    await expect(
      p.registerSigningKey(
        { keyId: value.keyId, publicKeySpkiDer: key("other").der },
        context,
      ),
    ).rejects.toThrow("P3_SIGNING_KEY_REGISTRATION_CONFLICT");
  });

  it("enforces transitions, terminal revocation, and strictly monotonic event time", async () => {
    const value = key("p35-transitions");
    let tick = new Date("2026-09-04T00:00:00.000Z");
    const p = createP3PolicyPublicationRepository(db, { clock: () => tick });
    await p.registerSigningKey(
      { keyId: value.keyId, publicKeySpkiDer: value.der },
      context,
    );
    tick = new Date("2026-09-04T00:00:00.000Z");
    await p.activateSigningKey(value.keyId, context);
    await expect(p.activateSigningKey(value.keyId, context)).rejects.toThrow();
    await p.revokeSigningKey(
      { keyId: value.keyId, reasonCode: "incident" },
      context,
    );
    await expect(
      p.revokeSigningKey({ keyId: value.keyId, reasonCode: "again" }, context),
    ).rejects.toThrow();
    const events = (
      await db.query<{ event_type: string; occurred_at: Date }>(
        "SELECT event_type,occurred_at FROM signing_key_events ORDER BY occurred_at,id",
      )
    ).rows;
    expect(events.map((event) => event.event_type)).toEqual([
      "REGISTERED",
      "ACTIVATED",
      "REVOKED",
    ]);
    expect(events[1]!.occurred_at.getTime()).toBeGreaterThan(
      events[0]!.occurred_at.getTime(),
    );
    expect(resolveSigningKeyLifecycle([])).toEqual({ state: "UNREGISTERED" });
  });

  it("serializes concurrent activation to one event and one audit", async () => {
    const value = key("p35-race");
    const p = createP3PolicyPublicationRepository(db);
    await p.registerSigningKey(
      { keyId: value.keyId, publicKeySpkiDer: value.der },
      context,
    );
    const result = await Promise.allSettled([
      p.activateSigningKey(value.keyId, context),
      p.activateSigningKey(value.keyId, context),
    ]);
    expect(result.filter((item) => item.status === "fulfilled")).toHaveLength(
      1,
    );
    expect(await count(db, "signing_key_events")).toBe(2);
    expect(await count(db, "audit_events")).toBe(2);
  });

  it("requires ACTIVE for config publication", async () => {
    const value = key("p35-publication");
    const p = createP3PolicyPublicationRepository(db);
    await p.registerSigningKey(
      { keyId: value.keyId, publicKeySpkiDer: value.der },
      context,
    );
    const po = await policy(db, "p35-policy");
    const feature = await rule(db, "p35-feature", true);
    const command = {
      contractVersion: "control_plane_v1" as const,
      snapshotVersion: "bootstrap_snapshot_v1" as const,
      envelopeVersion: "bootstrap_envelope_v1" as const,
      signingKeyId: value.keyId,
      compatibilityPolicyRevisionIds: [po.id],
      featureRuleRevisionIds: [feature.id],
      featureRolloutRevisionIds: [],
      publishedAt: now(),
    };
    await expect(p.publishConfigRelease(command, context)).rejects.toThrow(
      "P3_SIGNING_KEY_NOT_ACTIVE",
    );
    await p.activateSigningKey(value.keyId, context);
    await expect(
      p.publishConfigRelease(command, context),
    ).resolves.toMatchObject({ signingKeyId: value.keyId });
  });

  it("blocks retirement of a selectable key but permits emergency revoke in use", async () => {
    const value = key("p35-in-use");
    await seedKey(db, value);
    await addConfig(db, value.keyId);
    const p = createP3PolicyPublicationRepository(db);
    await expect(
      p.retireSigningKey(
        { keyId: value.keyId, reasonCode: "cutover" },
        context,
      ),
    ).rejects.toThrow("SIGNING_KEY_IN_USE");
    expect(await count(db, "signing_key_events")).toBe(2);
    await expect(
      p.revokeSigningKey(
        { keyId: value.keyId, reasonCode: "emergency" },
        context,
      ),
    ).resolves.toMatchObject({ eventType: "REVOKED" });
  });

  it("allows retirement only after selectable cutover to K2", async () => {
    const k1 = key("p35-k1"),
      k2 = key("p35-k2");
    await seedKey(db, k1);
    await seedKey(db, k2);
    const a = await addConfig(db, k1.keyId);
    const b = await addConfig(db, k2.keyId);
    const p = createP3PolicyPublicationRepository(db);
    await p.createRollout(
      {
        rolloutKey: "bootstrap.config",
        targetKind: "CONFIG_RELEASE",
        subjectKind: "ACCOUNT",
      },
      context,
      Buffer.alloc(32, 8),
    );
    await p.publishRolloutRevision(
      {
        rolloutKey: "bootstrap.config",
        state: "ACTIVE",
        percentageBps: 5000,
        baselineConfigVersion: a,
        candidateConfigVersion: b,
        publishedAt: now(),
      },
      context,
    );
    await expect(
      p.retireSigningKey({ keyId: k1.keyId, reasonCode: "cutover" }, context),
    ).rejects.toThrow("SIGNING_KEY_IN_USE");
    await expect(
      p.retireSigningKey({ keyId: k2.keyId, reasonCode: "cutover" }, context),
    ).rejects.toThrow("SIGNING_KEY_IN_USE");
    await p.publishRolloutRevision(
      {
        rolloutKey: "bootstrap.config",
        state: "RETIRED",
        percentageBps: 0,
        baselineConfigVersion: a,
        candidateConfigVersion: b,
        publishedAt: now(),
      },
      context,
    );
    // The latest ordinary release is K2, so K1 is no longer selectable.
    await expect(
      p.retireSigningKey({ keyId: k1.keyId, reasonCode: "cutover" }, context),
    ).resolves.toMatchObject({ eventType: "RETIRED" });
    await expect(
      p.retireSigningKey({ keyId: k2.keyId, reasonCode: "cutover" }, context),
    ).rejects.toThrow("SIGNING_KEY_IN_USE");
  });

  it("excludes the paused candidate from retirement safety selection", async () => {
    const k1 = key("p35-paused-k1"),
      k2 = key("p35-paused-k2");
    await seedKey(db, k1);
    await seedKey(db, k2);
    // Publish B first so A is ordinary latest; K2 is then selectable only if
    // the PAUSED rollout candidate is incorrectly counted.
    const b = await addConfig(db, k2.keyId);
    const a = await addConfig(db, k1.keyId);
    const p = createP3PolicyPublicationRepository(db);
    await p.createRollout(
      {
        rolloutKey: "bootstrap.config",
        targetKind: "CONFIG_RELEASE",
        subjectKind: "ACCOUNT",
      },
      context,
      Buffer.alloc(32, 8),
    );
    await p.publishRolloutRevision(
      {
        rolloutKey: "bootstrap.config",
        state: "PAUSED",
        percentageBps: 10000,
        baselineConfigVersion: a,
        candidateConfigVersion: b,
        publishedAt: now(),
      },
      context,
    );
    await expect(
      p.retireSigningKey({ keyId: k1.keyId, reasonCode: "paused" }, context),
    ).rejects.toThrow("SIGNING_KEY_IN_USE");
    await expect(
      p.retireSigningKey({ keyId: k2.keyId, reasonCode: "paused" }, context),
    ).resolves.toMatchObject({ eventType: "RETIRED" });
  });

  it("protects only ordinary latest without a bootstrap.config rollout", async () => {
    const k1 = key("p35-no-rollout-k1"),
      k2 = key("p35-no-rollout-k2");
    await seedKey(db, k1);
    await seedKey(db, k2);
    await addConfig(db, k1.keyId);
    await addConfig(db, k2.keyId);
    const p = createP3PolicyPublicationRepository(db);
    await expect(
      p.retireSigningKey({ keyId: k2.keyId, reasonCode: "cutover" }, context),
    ).rejects.toThrow("SIGNING_KEY_IN_USE");
    await expect(
      p.retireSigningKey({ keyId: k1.keyId, reasonCode: "cutover" }, context),
    ).resolves.toMatchObject({ eventType: "RETIRED" });
  });

  it("fails closed for a directly corrupted lifecycle and rolls back audit failures", async () => {
    const corrupt = key("p35-corrupt");
    await db.query(
      "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES($1,'Ed25519',$2,$3)",
      [corrupt.keyId, corrupt.der, corrupt.fingerprint],
    );
    await db.query(
      "INSERT INTO signing_key_events(key_id,event_type,occurred_at) VALUES($1,'ACTIVATED',$2)",
      [corrupt.keyId, now()],
    );
    const p = createP3PolicyPublicationRepository(db);
    await expect(p.activateSigningKey(corrupt.keyId, context)).rejects.toThrow(
      "P3_SIGNING_KEY_INVALID_LIFECYCLE",
    );
    const value = key("p35-rollback");
    const failing: DatabaseRuntime = {
      ...db,
      transaction: async (operation) =>
        db.transaction((q) =>
          operation({
            query: async (text, values) => {
              if (text.includes("INSERT INTO audit_events"))
                throw new Error("audit injected failure");
              return q.query(text, values);
            },
          }),
        ),
    };
    await expect(
      createP3PolicyPublicationRepository(failing).registerSigningKey(
        { keyId: value.keyId, publicKeySpkiDer: value.der },
        context,
      ),
    ).rejects.toThrow("audit injected failure");
    expect(await count(db, "signing_keys")).toBe(1);
    expect(await count(db, "signing_key_events")).toBe(1);
    const transition = key("p35-transition-rollback");
    await createP3PolicyPublicationRepository(db).registerSigningKey(
      { keyId: transition.keyId, publicKeySpkiDer: transition.der },
      context,
    );
    await expect(
      createP3PolicyPublicationRepository(failing).activateSigningKey(
        transition.keyId,
        context,
      ),
    ).rejects.toThrow("audit injected failure");
    expect(
      await db.query(
        "SELECT count(*)::int AS count FROM signing_key_events WHERE key_id=$1",
        [transition.keyId],
      ),
    ).toMatchObject({ rows: [{ count: 1 }] });
  });

  it("rejects invalid registration material before persistence", async () => {
    expect(() =>
      RegisterSigningKeyCommandSchema.parse({
        keyId: "bad",
        publicKeySpkiDer: Buffer.alloc(0),
        privateKeyPemB64: "secret",
      }),
    ).toThrow();
    const rsa = generateKeyPairSync("rsa", {
      modulusLength: 2048,
    }).publicKey.export({ format: "der", type: "spki" });
    const p = createP3PolicyPublicationRepository(db);
    await expect(
      p.registerSigningKey(
        { keyId: "p35-rsa", publicKeySpkiDer: rsa },
        context,
      ),
    ).rejects.toThrow("P3_SIGNING_KEY_INVALID");
    expect(await count(db, "signing_keys")).toBe(0);
  });

  it("signs both sides of a real PostgreSQL two-key bootstrap rollout", async () => {
    const k1 = key("p35-rollout-k1"),
      k2 = key("p35-rollout-k2");
    await seedKey(db, k1);
    await seedKey(db, k2);
    const p = createP3PolicyPublicationRepository(db);
    const aPolicy = await policy(db, "p35-rollout-policy-a");
    const bPolicy = await policy(db, "p35-rollout-policy-b");
    const aFeature = await rule(db, "p35-rollout-feature-a", true);
    const bFeature = await rule(db, "p35-rollout-feature-b", true);
    const base = {
      contractVersion: "control_plane_v1" as const,
      snapshotVersion: "bootstrap_snapshot_v1" as const,
      envelopeVersion: "bootstrap_envelope_v1" as const,
      featureRolloutRevisionIds: [],
      publishedAt: now(),
    };
    const a = await p.publishConfigRelease(
      {
        ...base,
        signingKeyId: k1.keyId,
        compatibilityPolicyRevisionIds: [aPolicy.id],
        featureRuleRevisionIds: [aFeature.id],
      },
      context,
    );
    const b = await p.publishConfigRelease(
      {
        ...base,
        signingKeyId: k2.keyId,
        compatibilityPolicyRevisionIds: [bPolicy.id],
        featureRuleRevisionIds: [bFeature.id],
      },
      context,
    );
    await p.createRollout(
      {
        rolloutKey: "bootstrap.config",
        targetKind: "CONFIG_RELEASE",
        subjectKind: "ACCOUNT",
      },
      context,
      Buffer.alloc(32, 17),
    );
    await p.publishRolloutRevision(
      {
        rolloutKey: "bootstrap.config",
        state: "ACTIVE",
        percentageBps: 5000,
        baselineConfigVersion: a.configVersion,
        candidateConfigVersion: b.configVersion,
        publishedAt: now(),
      },
      context,
    );
    let baseline = "00000000-0000-4000-8000-000000000000";
    let candidate = "00000000-0000-4000-8000-000000000001";
    for (let n = 0; n < 1000; n++) {
      const subject = `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
      if (
        rolloutBucketV1({
          rolloutKey: "bootstrap.config",
          cohortSeed: Buffer.alloc(32, 17),
          subjectKind: "ACCOUNT",
          subjectId: subject,
        }) >= 5000
      )
        baseline = subject;
      else candidate = subject;
      if (
        baseline !== "00000000-0000-4000-8000-000000000000" &&
        candidate !== "00000000-0000-4000-8000-000000000001"
      )
        break;
    }
    const ring = loadConfigSigningMaterial({
      CONFIG_SIGNING_KEY_RING_JSON: JSON.stringify({
        version: 1,
        keys: [k1, k2].map((value) => ({
          keyId: value.keyId,
          privateKeyPemB64: Buffer.from(
            value.pair.privateKey.export({ format: "pem", type: "pkcs8" }),
          ).toString("base64"),
        })),
      }),
    });
    const catalog = (
      await import("../packages/db/src/index.js")
    ).createP3BootstrapPolicyCatalogRepository(db);
    await bindConfigSigningRing(ring, (keyId) => catalog.findSigningKey(keyId));
    const service = new BootstrapService(
      { resolve: (input) => resolveP3BootstrapPolicy(input, catalog) },
      createConfigSigningService(ring, catalog),
      { now: () => new Date("2026-09-04T00:00:00.000Z") },
    );
    const request = (deviceId: string) => ({
      contractVersion: "control_plane_v1" as const,
      extensionVersion: "1.2.3",
      browser: { family: "chrome" as const, version: "123" },
      deviceId,
      lastConfigVersion: null,
    });
    const first = await service.issue(
      { accountId: baseline, deviceId: "123e4567-e89b-42d3-a456-426614174000" },
      request("123e4567-e89b-42d3-a456-426614174000"),
    );
    const second = await service.issue(
      {
        accountId: candidate,
        deviceId: "123e4567-e89b-42d3-a456-426614174001",
      },
      request("123e4567-e89b-42d3-a456-426614174001"),
    );
    expect(first.keyId).toBe(k1.keyId);
    expect(second.keyId).toBe(k2.keyId);
    const trusted = new Map([
      [
        k1.keyId,
        (await import("node:crypto")).createPublicKey({
          key: k1.der,
          format: "der",
          type: "spki",
        }),
      ],
      [
        k2.keyId,
        (await import("node:crypto")).createPublicKey({
          key: k2.der,
          format: "der",
          type: "spki",
        }),
      ],
    ]);
    expect(verifyBootstrapEnvelope(first, trusted)).toMatchObject({ ok: true });
    expect(verifyBootstrapEnvelope(second, trusted)).toMatchObject({
      ok: true,
    });
  });
});
