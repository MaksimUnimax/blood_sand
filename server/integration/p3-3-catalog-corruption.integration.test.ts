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
  accountId: "a",
  deviceId: "d",
};
async function release(po: string, ru: string) {
  const key = await addKey(db);
  return publicationFor(db).publishConfigRelease(
    {
      contractVersion: "control_plane_v1",
      snapshotVersion: "bootstrap_snapshot_v1",
      envelopeVersion: "bootstrap_envelope_v1",
      signingKeyId: key,
      compatibilityPolicyRevisionIds: [po],
      featureRuleRevisionIds: [ru],
      featureRolloutRevisionIds: [],
      publishedAt: now(),
    },
    context,
  );
}
describe.sequential("P3.3 catalog corruption fails closed", () => {
  beforeAll(async () => {
    db = await dbFor();
    await runMigrations({ connectionString: connectionString! });
  });
  beforeEach(() => clean(db));
  afterAll(() => db.close());
  it("fails closed for DB-permitted invalid compatibility SemVer", async () => {
    const po = await policy(db),
      ru = await rule(db);
    const c = await release(po.id, ru.id);
    await db.query(
      "INSERT INTO compatibility_policy_revisions(policy_key,revision,contract_version,browser_family,minimum_extension_version,recommended_extension_version,minimum_browser_version,maintenance_mode,maintenance_code,published_at) VALUES('bad-semver',1,'control_plane_v1',NULL,'not-semver','1.0.0',NULL,false,NULL,$1)",
      [now()],
    );
    const bad = (
      await db.query<{ id: string }>(
        "SELECT id FROM compatibility_policy_revisions WHERE policy_key='bad-semver'",
      )
    ).rows[0]!;
    await db.query(
      "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES($1,$2)",
      [c.configVersion, bad.id],
    );
    expect(await resolveP3BootstrapPolicy(input, catalogFor(db))).toEqual({
      failure: "CONFIG_SOURCE_INVALID",
    });
  });
  it("fails closed for a DB-permitted invalid stable policy identifier", async () => {
    const po = await policy(db),
      ru = await rule(db),
      c = await release(po.id, ru.id);
    await db.query(
      "INSERT INTO compatibility_policy_revisions(policy_key,revision,contract_version,browser_family,minimum_extension_version,recommended_extension_version,minimum_browser_version,maintenance_mode,maintenance_code,published_at) VALUES('Bad Policy Key',1,'control_plane_v1',NULL,'1.0.0','1.0.0',NULL,false,NULL,$1)",
      [now()],
    );
    const bad = (
      await db.query<{ id: string }>(
        "SELECT id FROM compatibility_policy_revisions WHERE policy_key='Bad Policy Key'",
      )
    ).rows[0]!;
    await db.query(
      "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES($1,$2)",
      [c.configVersion, bad.id],
    );
    expect(await resolveP3BootstrapPolicy(input, catalogFor(db))).toEqual({
      failure: "CONFIG_SOURCE_INVALID",
    });
  });
  it("fails closed for DB-permitted invalid feature SemVer and semantic cross-feature source", async () => {
    const po = await policy(db),
      a = await rule(db),
      b = await rule(db, "feature-two", true),
      c = await release(po.id, a.id);
    await db.query(
      "INSERT INTO feature_definitions(feature_key) VALUES('bad-semver-feature')",
    );
    await db.query(
      "INSERT INTO feature_rule_revisions(feature_key,revision,contract_version,enabled,browser_family,minimum_extension_version,published_at) VALUES('bad-semver-feature',1,'control_plane_v1',true,NULL,'invalid',$1)",
      [now()],
    );
    const bad = (
      await db.query<{ id: string }>(
        "SELECT id FROM feature_rule_revisions WHERE feature_key='bad-semver-feature'",
      )
    ).rows[0]!;
    await db.query(
      "INSERT INTO config_release_feature_rules(config_version,feature_rule_revision_id) VALUES($1,$2)",
      [c.configVersion, bad.id],
    );
    expect(await resolveP3BootstrapPolicy(input, catalogFor(db))).toEqual({
      failure: "CONFIG_SOURCE_INVALID",
    });
    await expect(
      db.query(
        "INSERT INTO rollouts(rollout_key,target_kind,subject_kind,cohort_seed) VALUES('Bad Key','FEATURE_RULE','ACCOUNT',$1)",
        [Buffer.alloc(32)],
      ),
    ).rejects.toThrow();
    expect(b.id).toBeTruthy();
  });
  it("proves database constraints reject malformed seed, percentage, target shape, and unknown FK", async () => {
    await expect(
      db.query(
        "INSERT INTO rollouts(rollout_key,target_kind,subject_kind,cohort_seed) VALUES('seed.bad','FEATURE_RULE','ACCOUNT',$1)",
        [Buffer.alloc(31)],
      ),
    ).rejects.toThrow();
    await expect(
      db.query(
        "INSERT INTO rollout_revisions(rollout_id,target_kind,revision,state,percentage_bps,published_at) VALUES(gen_random_uuid(),'FEATURE_RULE',1,'ACTIVE',10001,$1)",
        [now()],
      ),
    ).rejects.toThrow();
    await expect(
      db.query(
        "INSERT INTO config_release_feature_rules(config_version,feature_rule_revision_id) VALUES(999999,gen_random_uuid())",
      ),
    ).rejects.toThrow();
  });
});
