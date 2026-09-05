import { createHash, generateKeyPairSync, randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApiApp } from "../apps/api/src/app.js";
import {
  bindConfigSigningMaterial,
  createConfigSigningService,
  loadConfigSigningMaterial,
} from "../apps/api/src/bootstrap-signing.js";
import { BootstrapService } from "../packages/bootstrap/src/index.js";
import {
  createDatabaseRuntime,
  createExtensionAuthRepository,
  createP3BootstrapPolicyCatalogRepository,
  createP3PolicyPublicationRepository,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";
import {
  ExtensionAuthService,
  createEphemeralAccessTokenSigningKey,
  deriveExtensionAuthKeys,
} from "../packages/extension-auth/src/index.js";
import {
  resolveP3BootstrapPolicy,
  verifyBootstrapEnvelope,
} from "../packages/remote-config/src/index.js";
import type { AppConfig } from "../packages/shared/src/index.js";
import { runMigrations } from "../packages/db/src/migrations.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for real PostgreSQL tests");
const config: AppConfig = {
  environment: "test",
  databaseUrl: url,
  logLevel: "silent",
  apiPort: 3000,
  workerReadyDelayMs: 0,
};
const context = {
  actorType: "SYSTEM" as const,
  correlationId: "p3-4-integration",
};
const signing = generateKeyPairSync("ed25519");
const material = loadConfigSigningMaterial({
  CONFIG_SIGNING_KEY_ID: "p34-key",
  CONFIG_SIGNING_PRIVATE_KEY_PEM_B64: Buffer.from(
    signing.privateKey.export({ format: "pem", type: "pkcs8" }),
  ).toString("base64"),
});
let db: DatabaseRuntime;
let access: ExtensionAuthService;
let app: ReturnType<typeof createApiApp>;
let principal: { accountId: string; deviceId: string; token: string };
const request = (deviceId = principal.deviceId) => ({
  contractVersion: "control_plane_v1",
  extensionVersion: "1.2.3",
  browser: { family: "chrome", version: "123" },
  deviceId,
  lastConfigVersion: null,
  detectedAi: { family: "chat", surface: "page" },
});

async function clean() {
  await db.query(
    "TRUNCATE audit_events,config_release_rollout_revisions,config_release_feature_rules,rollouts,feature_rule_revisions,feature_definitions,config_release_compatibility_policies,config_releases,signing_key_events,signing_keys,compatibility_policy_blocked_versions,compatibility_policy_revisions,extension_release_browsers,extension_release_contracts,extension_releases,refresh_tokens,sessions,devices,device_authorizations,portal_sessions,user_identities,account_memberships,accounts,users,auth_rate_limit_buckets RESTART IDENTITY CASCADE",
  );
}
async function authenticated() {
  const userId = randomUUID(),
    accountId = randomUUID(),
    deviceId = randomUUID(),
    sessionId = randomUUID();
  await db.query("INSERT INTO users(id) VALUES($1)", [userId]);
  await db.query("INSERT INTO accounts(id) VALUES($1)", [accountId]);
  await db.query(
    "INSERT INTO devices(id,account_id,created_by_user_id,browser_family) VALUES($1,$2,$3,'chrome')",
    [deviceId, accountId, userId],
  );
  await db.query(
    "INSERT INTO sessions(id,device_id,account_id,token_family_id) VALUES($1,$2,$3,$4)",
    [sessionId, deviceId, accountId, randomUUID()],
  );
  const issued = await access.issue(sessionId);
  if (!issued.ok) throw new Error(issued.code);
  return { accountId, deviceId, token: issued.value.accessToken };
}
async function graph(
  options: {
    minimumExtensionVersion?: string;
    minimumBrowserVersion?: string | null;
    keyId?: string;
  } = {},
) {
  const p = createP3PolicyPublicationRepository(db);
  const now = new Date("2026-09-04T00:00:00.000Z");
  const keyId = options.keyId ?? material.keyId;
  const keyMetadata =
    keyId === material.keyId
      ? {
          spki: material.publicKeySpkiDer,
          sha256: material.publicKeySha256,
        }
      : (() => {
          const spki = generateKeyPairSync("ed25519").publicKey.export({
            format: "der",
            type: "spki",
          });
          return {
            spki,
            sha256: createHash("sha256").update(spki).digest("hex"),
          };
        })();
  await db.query(
    "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES($1,'Ed25519',$2,$3) ON CONFLICT (key_id) DO NOTHING",
    [keyId, keyMetadata.spki, keyMetadata.sha256],
  );
  if (keyId !== material.keyId)
    await db.query(
      "INSERT INTO signing_key_events(key_id,event_type,occurred_at) VALUES($1,'REGISTERED',$2),($1,'ACTIVATED',$3)",
      [keyId, now, new Date(now.getTime() + 1)],
    );
  const compatibility = await p.publishCompatibilityPolicyRevision(
    {
      policyKey: "p34-policy",
      contractVersion: "control_plane_v1",
      browserFamily: null,
      minimumExtensionVersion: options.minimumExtensionVersion ?? "1.0.0",
      recommendedExtensionVersion:
        options.minimumExtensionVersion === "2.0.0" ? "2.1.0" : "1.1.0",
      minimumBrowserVersion: options.minimumBrowserVersion ?? null,
      maintenanceMode: false,
      maintenanceCode: null,
      blockedVersions: [],
      publishedAt: now,
    },
    context,
  );
  await p.createFeatureDefinition({ featureKey: "feature-p34" }, context);
  const feature = await p.publishFeatureRuleRevision(
    {
      featureKey: "feature-p34",
      contractVersion: "control_plane_v1",
      enabled: true,
      browserFamily: null,
      minimumExtensionVersion: "1.0.0",
      publishedAt: now,
    },
    context,
  );
  return p.publishConfigRelease(
    {
      contractVersion: "control_plane_v1",
      snapshotVersion: "bootstrap_snapshot_v1",
      envelopeVersion: "bootstrap_envelope_v1",
      signingKeyId: keyId,
      compatibilityPolicyRevisionIds: [compatibility.id],
      featureRuleRevisionIds: [feature.id],
      featureRolloutRevisionIds: [],
      publishedAt: now,
    },
    context,
  );
}
async function post(body: unknown, token = principal.token) {
  return app.inject({
    method: "POST",
    url: "/v1/bootstrap",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: body,
  });
}

describe.sequential("P3.4 real PostgreSQL authenticated bootstrap", () => {
  beforeAll(async () => {
    db = createDatabaseRuntime(url!);
    await db.ready();
    await runMigrations({ connectionString: url! });
    access = new ExtensionAuthService(
      createExtensionAuthRepository(db),
      deriveExtensionAuthKeys(Buffer.alloc(32, 34)),
      undefined,
      createEphemeralAccessTokenSigningKey("p34-access"),
    );
  });
  beforeEach(async () => {
    await clean();
    principal = await authenticated();
    const catalog = createP3BootstrapPolicyCatalogRepository(db);
    await db.query(
      "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES($1,'Ed25519',$2,$3)",
      [material.keyId, material.publicKeySpkiDer, material.publicKeySha256],
    );
    await db.query(
      "INSERT INTO signing_key_events(key_id,event_type,occurred_at) VALUES($1,'REGISTERED',$2),($1,'ACTIVATED',$3)",
      [
        material.keyId,
        new Date("2026-09-04T00:00:00.000Z"),
        new Date("2026-09-04T00:00:00.001Z"),
      ],
    );
    bindConfigSigningMaterial(
      material,
      await catalog.findSigningKey(material.keyId),
    );
    app = createApiApp({
      config,
      isInfrastructureReady: async () => true,
      extensionAuthService: access,
      bootstrapService: new BootstrapService(
        { resolve: (input) => resolveP3BootstrapPolicy(input, catalog) },
        createConfigSigningService(material, catalog),
        { now: () => new Date("2026-09-04T00:00:00.000Z") },
      ),
    });
  });
  afterAll(async () => {
    await app.close();
    await db.close();
  });
  it("returns a verified complete signed snapshot", async () => {
    const release = await graph();
    const response = await post(request());
    expect(response.statusCode).toBe(200);
    const verified = verifyBootstrapEnvelope(
      response.json(),
      new Map([[material.keyId, material.publicKey]]),
    );
    expect(verified).toMatchObject({ ok: true });
    if (verified.ok)
      expect(verified.payload).toMatchObject({
        configVersion: release.configVersion,
        devicePolicy: { status: "ACTIVE" },
        features: { "feature-p34": true },
        entitlements: {},
      });
  });
  it("returns existing 401 without a bearer", async () =>
    expect((await post(request(), "")).statusCode).toBe(401));
  it("returns INVALID_REQUEST for malformed input", async () =>
    expect(
      (await post({ ...request(), browser: { family: "bad", version: "1" } }))
        .statusCode,
    ).toBe(400));
  it("rejects mismatched device before resolution", async () =>
    expect((await post(request(randomUUID()))).statusCode).toBe(403));
  it("fails closed when no release exists", async () =>
    expect((await post(request())).statusCode).toBe(503));
  it("fails closed when config key differs from signer", async () => {
    await graph({ keyId: "other-key" });
    expect((await post(request())).statusCode).toBe(503);
  });
  it("rejects mismatched public signing metadata", () => {
    const other = generateKeyPairSync("ed25519").publicKey.export({
      format: "der",
      type: "spki",
    });
    expect(() =>
      bindConfigSigningMaterial(material, {
        keyId: material.keyId,
        algorithm: "Ed25519",
        publicKeySpkiDer: other,
        publicKeySha256: createHash("sha256").update(other).digest("hex"),
        createdAt: new Date(),
      }),
    ).toThrow();
  });
  it("signs UPDATE_REQUIRED instead of turning it into HTTP failure", async () => {
    await graph({ minimumExtensionVersion: "2.0.0" });
    const response = await post(request());
    const verified = verifyBootstrapEnvelope(
      response.json(),
      new Map([[material.keyId, material.publicKey]]),
    );
    expect(response.statusCode).toBe(200);
    expect(verified.ok && verified.payload.compatibility.extension.status).toBe(
      "UPDATE_REQUIRED",
    );
  });
  it("always returns a full snapshot when lastConfigVersion is current", async () => {
    const release = await graph();
    const response = await post({
      ...request(),
      lastConfigVersion: release.configVersion,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().payload).toBeDefined();
  });
});
