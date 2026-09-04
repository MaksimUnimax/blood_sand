import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resolveP3BootstrapPolicy } from "../packages/remote-config/src/index.js";
import { runMigrations } from "../packages/db/src/migrations.js";
import {
  addKey,
  catalogFor,
  clean,
  connectionString,
  context,
  dbFor,
  now,
  policy,
  publicationFor,
  rule,
} from "./p3-3-support.js";
let db: Awaited<ReturnType<typeof dbFor>>;
const input = {
  contractVersion: "control_plane_v1" as const,
  extensionVersion: "1.2.3",
  browser: { family: "chrome" as const, version: "120" },
  accountId: "account-a",
  deviceId: "device-a",
};
async function graph(
  enabled = false,
  policyKey = "policy-global",
  feature = "feature-one",
) {
  const p = publicationFor(db);
  const po = await policy(db, policyKey);
  const ru = await rule(db, feature, enabled);
  const key = await addKey(db, `key-${policyKey}`);
  return {
    po,
    ru,
    config: await p.publishConfigRelease(
      {
        contractVersion: "control_plane_v1",
        snapshotVersion: "bootstrap_snapshot_v1",
        envelopeVersion: "bootstrap_envelope_v1",
        signingKeyId: key,
        compatibilityPolicyRevisionIds: [po.id],
        featureRuleRevisionIds: [ru.id],
        featureRolloutRevisionIds: [],
        publishedAt: now(),
      },
      context,
    ),
  };
}
const resolve = () => resolveP3BootstrapPolicy(input, catalogFor(db));
describe.sequential("P3.3 real PostgreSQL exact config resolution", () => {
  beforeAll(async () => {
    db = await dbFor();
    await runMigrations({ connectionString: connectionString! });
  });
  beforeEach(() => clean(db));
  afterAll(() => db.close());
  it("returns typed NO_CONFIG_RELEASE", async () =>
    expect(await resolve()).toEqual({ failure: "NO_CONFIG_RELEASE" }));
  it("selects latest published config deterministically", async () => {
    const a = await graph(false, "policy-a"),
      b = await graph(true, "policy-b", "feature-two");
    const x = await resolve(),
      y = await resolve();
    expect(x).toEqual(y);
    expect("configVersion" in x && x.configVersion).toBe(
      b.config.configVersion,
    );
    expect(a.config.configVersion).toBeLessThan(b.config.configVersion);
  });
  it("uses config rollout baseline at zero and candidate at 10000", async () => {
    const a = await graph(false, "policy-a"),
      b = await graph(true, "policy-b", "feature-two"),
      p = publicationFor(db);
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
        percentageBps: 0,
        baselineConfigVersion: a.config.configVersion,
        candidateConfigVersion: b.config.configVersion,
        publishedAt: now(),
      },
      context,
    );
    let x = await resolve();
    expect("configVersion" in x && x.configVersion).toBe(
      a.config.configVersion,
    );
    await p.publishRolloutRevision(
      {
        rolloutKey: "bootstrap.config",
        state: "ACTIVE",
        percentageBps: 10000,
        baselineConfigVersion: a.config.configVersion,
        candidateConfigVersion: b.config.configVersion,
        publishedAt: now(),
      },
      context,
    );
    x = await resolve();
    expect("configVersion" in x && x.configVersion).toBe(
      b.config.configVersion,
    );
  });
  it("uses baseline for paused config rollout and ordinary latest for retired", async () => {
    const a = await graph(false, "policy-a"),
      b = await graph(true, "policy-b", "feature-two"),
      p = publicationFor(db);
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
        baselineConfigVersion: a.config.configVersion,
        candidateConfigVersion: b.config.configVersion,
        publishedAt: now(),
      },
      context,
    );
    let x = await resolve();
    expect("configVersion" in x && x.configVersion).toBe(
      a.config.configVersion,
    );
    await p.publishRolloutRevision(
      {
        rolloutKey: "bootstrap.config",
        state: "RETIRED",
        percentageBps: 0,
        baselineConfigVersion: a.config.configVersion,
        candidateConfigVersion: b.config.configVersion,
        publishedAt: now(),
      },
      context,
    );
    x = await resolve();
    expect("configVersion" in x && x.configVersion).toBe(
      b.config.configVersion,
    );
  });
  it("resolves directly pinned feature defaults and version mismatch", async () => {
    await graph(true);
    const x = await resolve();
    expect("features" in x && x.features["feature-one"]).toBe(true);
    const y = await resolveP3BootstrapPolicy(
      { ...input, extensionVersion: "0.9.0" },
      catalogFor(db),
    );
    expect("features" in y && y.features["feature-one"]).toBe(false);
  });
  it("resolves feature rollout baseline/candidate deterministically", async () => {
    const p = publicationFor(db),
      po = await policy(db),
      a = await rule(db, "feature-one", false),
      b = await rule(db, "feature-one", true);
    await p.createRollout(
      {
        rolloutKey: "feature-one.rollout",
        targetKind: "FEATURE_RULE",
        subjectKind: "ACCOUNT",
      },
      context,
      Buffer.alloc(32, 4),
    );
    const ro = await p.publishRolloutRevision(
      {
        rolloutKey: "feature-one.rollout",
        state: "ACTIVE",
        percentageBps: 0,
        baselineFeatureRuleRevisionId: a.id,
        candidateFeatureRuleRevisionId: b.id,
        publishedAt: now(),
      },
      context,
    );
    const key = await addKey(db);
    await p.publishConfigRelease(
      {
        contractVersion: "control_plane_v1",
        snapshotVersion: "bootstrap_snapshot_v1",
        envelopeVersion: "bootstrap_envelope_v1",
        signingKeyId: key,
        compatibilityPolicyRevisionIds: [po.id],
        featureRuleRevisionIds: [a.id],
        featureRolloutRevisionIds: [ro.id],
        publishedAt: now(),
      },
      context,
    );
    let x = await resolve();
    expect("features" in x && x.features["feature-one"]).toBe(false);
    const roCandidate = await p.publishRolloutRevision(
      {
        rolloutKey: "feature-one.rollout",
        state: "ACTIVE",
        percentageBps: 10000,
        baselineFeatureRuleRevisionId: a.id,
        candidateFeatureRuleRevisionId: b.id,
        publishedAt: now(),
      },
      context,
    );
    await p.publishConfigRelease(
      {
        contractVersion: "control_plane_v1",
        snapshotVersion: "bootstrap_snapshot_v1",
        envelopeVersion: "bootstrap_envelope_v1",
        signingKeyId: key,
        compatibilityPolicyRevisionIds: [po.id],
        featureRuleRevisionIds: [a.id],
        featureRolloutRevisionIds: [roCandidate.id],
        publishedAt: now(),
      },
      context,
    );
    x = await resolve();
    expect("features" in x && x.features["feature-one"]).toBe(true);
  });
  it("keeps historical config source graph isolated from later revisions", async () => {
    const a = await graph(false, "policy-a", "feature-a");
    await policy(db, "policy-a");
    await rule(db, "feature-a", true);
    const c = await catalogFor(db).findConfigRelease(a.config.configVersion);
    expect(c?.configVersion).toBe(a.config.configVersion);
    const x = await resolve();
    expect("features" in x && x.features["feature-a"]).toBe(false);
  });
});
