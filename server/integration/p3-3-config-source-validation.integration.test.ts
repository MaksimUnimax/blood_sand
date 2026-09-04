import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { runMigrations } from "../packages/db/src/migrations.js";
import {
  addKey,
  clean,
  connectionString,
  context,
  count,
  dbFor,
  featureRollout,
  now,
  policy,
  publicationFor,
  rule,
} from "./p3-3-support.js";

let db: Awaited<ReturnType<typeof dbFor>>;
const command = (
  key: string,
  policyIds: string[],
  ruleIds: string[],
  rolloutIds: string[] = [],
) => ({
  contractVersion: "control_plane_v1" as const,
  snapshotVersion: "bootstrap_snapshot_v1" as const,
  envelopeVersion: "bootstrap_envelope_v1" as const,
  signingKeyId: key,
  compatibilityPolicyRevisionIds: policyIds,
  featureRuleRevisionIds: ruleIds,
  featureRolloutRevisionIds: rolloutIds,
  publishedAt: now(),
});
async function unchanged(run: () => Promise<unknown>) {
  const before = await Promise.all(
    [
      "config_releases",
      "config_release_compatibility_policies",
      "config_release_feature_rules",
      "config_release_rollout_revisions",
    ].map((t) => count(db, t)),
  );
  const audit = await db.query<{ count: string }>(
    "SELECT count(*)::text AS count FROM audit_events WHERE action='CONFIG_RELEASE_PUBLISHED'",
  );
  await expect(run()).rejects.toThrow();
  expect(
    await Promise.all(
      [
        "config_releases",
        "config_release_compatibility_policies",
        "config_release_feature_rules",
        "config_release_rollout_revisions",
      ].map((t) => count(db, t)),
    ),
  ).toEqual(before);
  expect(
    (
      await db.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM audit_events WHERE action='CONFIG_RELEASE_PUBLISHED'",
      )
    ).rows[0]!.count,
  ).toBe(audit.rows[0]!.count);
}
describe.sequential(
  "P3.3 config publication source validation is atomic",
  () => {
    beforeAll(async () => {
      db = await dbFor();
      await runMigrations({ connectionString: connectionString! });
    });
    beforeEach(() => clean(db));
    afterAll(() => db.close());
    it("rejects duplicate source identifiers before persistence", async () => {
      const key = await addKey(db),
        po = await policy(db),
        ru = await rule(db);
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [po.id, po.id], [ru.id]),
          context,
        ),
      );
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [po.id], [ru.id, ru.id]),
          context,
        ),
      );
      const candidate = await rule(db, "feature-one", true);
      const p = publicationFor(db);
      await p.createRollout(
        {
          rolloutKey: "feature-one.rollout",
          targetKind: "FEATURE_RULE",
          subjectKind: "ACCOUNT",
        },
        context,
        Buffer.alloc(32, 1),
      );
      const ro = await p.publishRolloutRevision(
        {
          rolloutKey: "feature-one.rollout",
          state: "ACTIVE",
          percentageBps: 0,
          baselineFeatureRuleRevisionId: ru.id,
          candidateFeatureRuleRevisionId: candidate.id,
          publishedAt: now(),
        },
        context,
      );
      await unchanged(() =>
        p.publishConfigRelease(
          command(key, [po.id], [ru.id], [ro.id, ro.id]),
          context,
        ),
      );
    });
    it("rejects duplicate policy scope and global browser minimum", async () => {
      const key = await addKey(db),
        a = await policy(db, "global-a"),
        b = await policy(db, "global-b"),
        ru = await rule(db);
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [a.id, b.id], [ru.id]),
          context,
        ),
      );
      await db.query(
        "INSERT INTO compatibility_policy_revisions(policy_key,revision,contract_version,browser_family,minimum_extension_version,recommended_extension_version,minimum_browser_version,maintenance_mode,maintenance_code,published_at) VALUES('global-invalid',1,'control_plane_v1',NULL,'1.0.0','1.0.0','100',false,NULL,$1)",
        [now()],
      );
      const bad = (
        await db.query<{ id: string }>(
          "SELECT id FROM compatibility_policy_revisions WHERE policy_key='global-invalid'",
        )
      ).rows[0]!;
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [bad.id], [ru.id]),
          context,
        ),
      );
    });
    it("rejects maintenance and version invariant violations from DB-permitted source rows", async () => {
      const key = await addKey(db),
        ru = await rule(db);
      for (const [name, maintenance, code, min, recommended] of [
        ["mtrue", true, null, "1.0.0", "1.0.0"],
        ["mfalse", false, "hold", "1.0.0", "1.0.0"],
        ["versions", false, null, "2.0.0", "1.0.0"],
      ] as const) {
        await db.query(
          "INSERT INTO compatibility_policy_revisions(policy_key,revision,contract_version,browser_family,minimum_extension_version,recommended_extension_version,minimum_browser_version,maintenance_mode,maintenance_code,published_at) VALUES($1,1,'control_plane_v1',NULL,$2,$3,NULL,$4,$5,$6)",
          [name, min, recommended, maintenance, code, now()],
        );
        const po = (
          await db.query<{ id: string }>(
            "SELECT id FROM compatibility_policy_revisions WHERE policy_key=$1",
            [name],
          )
        ).rows[0]!;
        await unchanged(() =>
          publicationFor(db).publishConfigRelease(
            command(key, [po.id], [ru.id]),
            context,
          ),
        );
      }
    });
    it("rejects wrong-contract and two direct defaults", async () => {
      const key = await addKey(db),
        po = await policy(db),
        a = await rule(db),
        b = await rule(db, "feature-one", true);
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [po.id], [a.id, b.id]),
          context,
        ),
      );
      await db.query(
        "INSERT INTO feature_definitions(feature_key) VALUES('wrong-contract')",
      );
      await db.query(
        "INSERT INTO feature_rule_revisions(feature_key,revision,contract_version,enabled,browser_family,minimum_extension_version,published_at) VALUES('wrong-contract',1,'wrong_contract',true,NULL,NULL,$1)",
        [now()],
      );
      const bad = (
        await db.query<{ id: string }>(
          "SELECT id FROM feature_rule_revisions WHERE feature_key='wrong-contract'",
        )
      ).rows[0]!;
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [po.id], [bad.id]),
          context,
        ),
      );
    });
    it("rejects non-feature, duplicate-feature, unpinned-baseline, and cross-feature rollouts", async () => {
      const key = await addKey(db),
        po = await policy(db),
        a = await rule(db),
        b = await rule(db, "feature-one", true),
        other = await rule(db, "feature-two", true),
        p = publicationFor(db);
      await p.createRollout(
        {
          rolloutKey: "feature-one.rollout",
          targetKind: "FEATURE_RULE",
          subjectKind: "ACCOUNT",
        },
        context,
        Buffer.alloc(32, 2),
      );
      const one = await p.publishRolloutRevision(
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
      await unchanged(() =>
        p.publishConfigRelease(
          command(key, [po.id], [b.id], [one.id]),
          context,
        ),
      );
      await db.query(
        "INSERT INTO rollouts(rollout_key,target_kind,subject_kind,cohort_seed) VALUES('cross.rollout','FEATURE_RULE','ACCOUNT',$1)",
        [Buffer.alloc(32, 3)],
      );
      const ro = (
        await db.query<{ id: string }>(
          "SELECT id FROM rollouts WHERE rollout_key='cross.rollout'",
        )
      ).rows[0]!;
      await db.query(
        "INSERT INTO rollout_revisions(rollout_id,target_kind,revision,state,percentage_bps,baseline_feature_rule_revision_id,candidate_feature_rule_revision_id,published_at) VALUES($1,'FEATURE_RULE',1,'ACTIVE',0,$2,$3,$4)",
        [ro.id, a.id, other.id, now()],
      );
      const cross = (
        await db.query<{ id: string }>(
          "SELECT id FROM rollout_revisions WHERE rollout_id=$1",
          [ro.id],
        )
      ).rows[0]!;
      await unchanged(() =>
        p.publishConfigRelease(
          command(key, [po.id], [a.id], [cross.id]),
          context,
        ),
      );
    });
    it("rejects unknown signing metadata", async () => {
      const po = await policy(db),
        ru = await rule(db);
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command("unknown-key", [po.id], [ru.id]),
          context,
        ),
      );
    });
    it("rejects a CONFIG_RELEASE rollout supplied as a feature rollout before persistence", async () => {
      const key = await addKey(db),
        po = await policy(db),
        ru = await rule(db);
      const p = publicationFor(db);
      const config = await p.publishConfigRelease(
        command(key, [po.id], [ru.id]),
        context,
      );
      const candidate = await p.publishConfigRelease(
        command(key, [po.id], [ru.id]),
        context,
      );
      await p.createRollout(
        {
          rolloutKey: "bootstrap.config",
          targetKind: "CONFIG_RELEASE",
          subjectKind: "ACCOUNT",
        },
        context,
        Buffer.alloc(32, 9),
      );
      const rollout = await p.publishRolloutRevision(
        {
          rolloutKey: "bootstrap.config",
          state: "ACTIVE",
          percentageBps: 0,
          baselineConfigVersion: config.configVersion,
          candidateConfigVersion: candidate.configVersion,
          publishedAt: now(),
        },
        context,
      );
      await unchanged(() =>
        p.publishConfigRelease(
          command(key, [po.id], [ru.id], [rollout.id]),
          context,
        ),
      );
    });
    it("rejects two FEATURE_RULE rollouts for the same feature before persistence", async () => {
      const key = await addKey(db),
        po = await policy(db),
        baseline = await rule(db),
        candidate = await rule(db, "feature-one", true);
      const one = await featureRollout(
        db,
        "feature-one.rollout-a",
        baseline.id,
        candidate.id,
      );
      const two = await featureRollout(
        db,
        "feature-one.rollout-b",
        baseline.id,
        candidate.id,
      );
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [po.id], [baseline.id], [one.id, two.id]),
          context,
        ),
      );
    });
    it("rejects distinct compatibility policies with the same exact browser scope", async () => {
      const key = await addKey(db),
        ru = await rule(db);
      const chromeA = await policy(db, "chrome-a", "chrome");
      const chromeB = await policy(db, "chrome-b", "chrome");
      await unchanged(() =>
        publicationFor(db).publishConfigRelease(
          command(key, [chromeA.id, chromeB.id], [ru.id]),
          context,
        ),
      );
    });
    it("proves the signing_keys Ed25519 database constraint rejects another algorithm", async () => {
      const before = await count(db, "signing_keys");
      await expect(
        db.query(
          "INSERT INTO signing_keys(key_id,algorithm,public_key_spki_der,public_key_sha256) VALUES('invalid-rsa','RSA',decode('00','hex'),'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')",
        ),
      ).rejects.toThrow();
      expect(await count(db, "signing_keys")).toBe(before);
      expect(
        (
          await db.query(
            "SELECT key_id FROM signing_keys WHERE key_id='invalid-rsa'",
          )
        ).rows,
      ).toHaveLength(0);
    });
  },
);
