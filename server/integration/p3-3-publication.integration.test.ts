import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
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
describe.sequential(
  "P3.3 real PostgreSQL publication and revision concurrency",
  () => {
    beforeAll(async () => {
      db = await dbFor();
      await runMigrations({ connectionString: connectionString! });
    });
    beforeEach(() => clean(db));
    afterAll(() => db.close());
    it("publishes every P3.3 source through production write paths and audits each mutation", async () => {
      const p = publicationFor(db);
      await p.publishExtensionRelease(
        {
          version: "1.2.3",
          releaseChannel: "stable",
          releasedAt: now(),
          supportedContracts: ["control_plane_v1"],
          supportedBrowsers: ["chrome"],
        },
        context,
      );
      const po = await policy(db);
      await p.createFeatureDefinition({ featureKey: "feature-one" }, context);
      const a = await rule(db, "feature-one", false),
        b = await rule(db, "feature-one", true);
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
          percentageBps: 10000,
          baselineFeatureRuleRevisionId: a.id,
          candidateFeatureRuleRevisionId: b.id,
          publishedAt: now(),
        },
        context,
      );
      const key = await addKey(db);
      const config = await p.publishConfigRelease(
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
      expect(config.configVersion).toBe(1);
      expect(await count(db, "config_release_compatibility_policies")).toBe(1);
      expect(await count(db, "config_release_feature_rules")).toBe(1);
      expect(await count(db, "config_release_rollout_revisions")).toBe(1);
      expect(await count(db, "audit_events")).toBe(8);
    });
    it("serializes concurrent policy revisions with distinct server revisions and audits", async () => {
      const [a, b] = await Promise.all([
        policy(db, "policy-same"),
        policy(db, "policy-same"),
      ]);
      expect([a.revision, b.revision].sort()).toEqual([1, 2]);
      expect(await count(db, "audit_events")).toBe(2);
    });
    it("serializes concurrent feature revisions with distinct ordered revisions and audits", async () => {
      const p = publicationFor(db);
      await p.createFeatureDefinition({ featureKey: "feature-same" }, context);
      const [a, b] = await Promise.all([
        p.publishFeatureRuleRevision(
          {
            featureKey: "feature-same",
            contractVersion: "control_plane_v1",
            enabled: false,
            browserFamily: null,
            minimumExtensionVersion: null,
            publishedAt: now(),
          },
          context,
        ),
        p.publishFeatureRuleRevision(
          {
            featureKey: "feature-same",
            contractVersion: "control_plane_v1",
            enabled: true,
            browserFamily: null,
            minimumExtensionVersion: null,
            publishedAt: now(),
          },
          context,
        ),
      ]);
      expect([a.revision, b.revision].sort()).toEqual([1, 2]);
      expect(await count(db, "audit_events")).toBe(3);
    });
    it("serializes concurrent rollout revisions with distinct ordered revisions and audits", async () => {
      const a = await rule(db),
        b = await rule(db, "feature-one", true);
      const p = publicationFor(db);
      await p.createRollout(
        {
          rolloutKey: "feature-same.rollout",
          targetKind: "FEATURE_RULE",
          subjectKind: "ACCOUNT",
        },
        context,
        Buffer.alloc(32, 2),
      );
      const cmd = {
        rolloutKey: "feature-same.rollout",
        state: "ACTIVE" as const,
        percentageBps: 0,
        baselineFeatureRuleRevisionId: a.id,
        candidateFeatureRuleRevisionId: b.id,
        publishedAt: now(),
      };
      const [x, y] = await Promise.all([
        p.publishRolloutRevision(cmd, context),
        p.publishRolloutRevision(cmd, context),
      ]);
      expect([x.revision, y.revision].sort()).toEqual([1, 2]);
      expect(await count(db, "audit_events")).toBe(6);
    });
  },
);
