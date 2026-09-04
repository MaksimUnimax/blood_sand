import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { runMigrations } from "../packages/db/src/migrations.js";
import {
  addKey,
  clean,
  connectionString,
  context,
  count,
  dbFor,
  now,
  policy,
  publicationFor,
  rule,
} from "./p3-3-support.js";

let db: Awaited<ReturnType<typeof dbFor>>;
async function failAudit(action: string) {
  await db.query(
    "CREATE OR REPLACE FUNCTION p3_3_fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = current_setting('p3_3.audit_action',true) THEN RAISE EXCEPTION 'injected audit failure'; END IF; RETURN NEW; END $$",
  );
  await db.query(
    "CREATE TRIGGER p3_3_fail_audit_trigger BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION p3_3_fail_audit()",
  );
  await db.query("SELECT set_config('p3_3.audit_action',$1,false)", [action]);
}
async function clearFailAudit() {
  await db.query(
    "DROP TRIGGER IF EXISTS p3_3_fail_audit_trigger ON audit_events",
  );
  await db.query("DROP FUNCTION IF EXISTS p3_3_fail_audit()");
}
describe.sequential(
  "P3.3 audit failure injection rolls back publication atomically",
  () => {
    beforeAll(async () => {
      db = await dbFor();
      await runMigrations({ connectionString: connectionString! });
    });
    beforeEach(() => clean(db));
    afterEach(clearFailAudit);
    afterAll(() => db.close());
    it("rolls back policy revision, blocked versions, and audit on audit failure", async () => {
      await failAudit("COMPATIBILITY_POLICY_PUBLISHED");
      await expect(
        publicationFor(db).publishCompatibilityPolicyRevision(
          {
            policyKey: "policy-fail",
            contractVersion: "control_plane_v1",
            browserFamily: null,
            minimumExtensionVersion: "1.0.0",
            recommendedExtensionVersion: null,
            minimumBrowserVersion: null,
            maintenanceMode: false,
            maintenanceCode: null,
            blockedVersions: ["1.2.3"],
            publishedAt: now(),
          },
          context,
        ),
      ).rejects.toThrow("injected");
      expect(await count(db, "compatibility_policy_revisions")).toBe(0);
      expect(await count(db, "compatibility_policy_blocked_versions")).toBe(0);
      expect(await count(db, "audit_events")).toBe(0);
    });
    it("rolls back rollout revision and audit on audit failure", async () => {
      const a = await rule(db),
        b = await rule(db, "feature-one", true),
        p = publicationFor(db);
      await p.createRollout(
        {
          rolloutKey: "feature-fail.rollout",
          targetKind: "FEATURE_RULE",
          subjectKind: "ACCOUNT",
        },
        context,
        Buffer.alloc(32, 1),
      );
      await failAudit("ROLLOUT_REVISION_PUBLISHED");
      await expect(
        p.publishRolloutRevision(
          {
            rolloutKey: "feature-fail.rollout",
            state: "ACTIVE",
            percentageBps: 0,
            baselineFeatureRuleRevisionId: a.id,
            candidateFeatureRuleRevisionId: b.id,
            publishedAt: now(),
          },
          context,
        ),
      ).rejects.toThrow("injected");
      expect(await count(db, "rollout_revisions")).toBe(0);
      expect(await count(db, "audit_events")).toBe(4);
    });
    it("rolls back release and every source link on audit failure without orphans", async () => {
      const po = await policy(db),
        a = await rule(db),
        b = await rule(db, "feature-one", true),
        p = publicationFor(db);
      await p.createRollout(
        {
          rolloutKey: "feature-config.rollout",
          targetKind: "FEATURE_RULE",
          subjectKind: "ACCOUNT",
        },
        context,
        Buffer.alloc(32, 2),
      );
      const ro = await p.publishRolloutRevision(
        {
          rolloutKey: "feature-config.rollout",
          state: "ACTIVE",
          percentageBps: 0,
          baselineFeatureRuleRevisionId: a.id,
          candidateFeatureRuleRevisionId: b.id,
          publishedAt: now(),
        },
        context,
      );
      const key = await addKey(db);
      const prior = await count(db, "audit_events");
      await failAudit("CONFIG_RELEASE_PUBLISHED");
      await expect(
        p.publishConfigRelease(
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
        ),
      ).rejects.toThrow("injected");
      expect(await count(db, "config_releases")).toBe(0);
      expect(
        (await count(db, "config_release_compatibility_policies")) +
          (await count(db, "config_release_feature_rules")) +
          (await count(db, "config_release_rollout_revisions")),
      ).toBe(0);
      expect(await count(db, "audit_events")).toBe(prior);
    });
  },
);
