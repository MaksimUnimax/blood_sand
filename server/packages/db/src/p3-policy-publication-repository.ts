import { createHash, createPublicKey, randomBytes } from "node:crypto";
import {
  PublishCompatibilityPolicyRevisionCommandSchema,
  PublishExtensionReleaseCommandSchema,
  type CompatibilityPublicationPort,
  type CompatibilityPolicyRevision,
  CompatibilityPolicyRevisionSchema,
  type ExtensionRelease,
  type P3MutationContext,
} from "@product/compatibility";
import { compareSemVerV1 } from "@product/shared";
import {
  configReleaseHashes,
  ConfigReleaseSchema,
  CreateFeatureDefinitionCommandSchema,
  CreateRolloutCommandSchema,
  PublishConfigReleaseCommandSchema,
  PublishFeatureRuleRevisionCommandSchema,
  PublishRolloutRevisionCommandSchema,
  type PublishConfigReleaseCommand,
  P3FeatureRuleSchema,
  P3RolloutRevisionSchema,
  SigningKeyMetadataSchema,
  type P3PublicationPort,
} from "@product/remote-config";
import type { DatabaseRuntime } from "./index.js";

type Context = P3MutationContext;
async function audit(
  q: { query: DatabaseRuntime["query"] },
  context: Context,
  action: string,
  targetType: string,
  targetId: string | null,
  safeMetadata?: object,
) {
  await q.query(
    "INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id,reason,safe_metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb)",
    [
      context.actorType,
      context.actorId ?? null,
      action,
      targetType,
      targetId,
      context.correlationId,
      context.reason ?? null,
      safeMetadata ? JSON.stringify(safeMetadata) : null,
    ],
  );
}
async function validateConfigSources(
  q: { query: DatabaseRuntime["query"] },
  value: PublishConfigReleaseCommand,
) {
  const key = await q.query<Record<string, unknown>>(
    'SELECT key_id AS "keyId",algorithm,public_key_spki_der AS "publicKeySpkiDer",public_key_sha256 AS "publicKeySha256",created_at AS "createdAt" FROM signing_keys WHERE key_id=$1',
    [value.signingKeyId],
  );
  if (!key.rows[0]) throw new Error("P3_SIGNING_KEY_NOT_FOUND");
  const signing = SigningKeyMetadataSchema.parse(key.rows[0]);
  if (
    createHash("sha256").update(signing.publicKeySpkiDer).digest("hex") !==
      signing.publicKeySha256 ||
    createPublicKey({
      key: signing.publicKeySpkiDer,
      format: "der",
      type: "spki",
    }).asymmetricKeyType !== "ed25519"
  )
    throw new Error("P3_SIGNING_KEY_INVALID");
  const policies = await q.query<Record<string, unknown>>(
    'SELECT id,policy_key AS "policyKey",revision,contract_version AS "contractVersion",browser_family AS "browserFamily",minimum_extension_version AS "minimumExtensionVersion",recommended_extension_version AS "recommendedExtensionVersion",minimum_browser_version AS "minimumBrowserVersion",maintenance_mode AS "maintenanceMode",maintenance_code AS "maintenanceCode",published_at AS "publishedAt",created_at AS "createdAt" FROM compatibility_policy_revisions WHERE id=ANY($1::uuid[])',
    [value.compatibilityPolicyRevisionIds],
  );
  if (policies.rows.length !== value.compatibilityPolicyRevisionIds.length)
    throw new Error("P3_POLICY_SOURCE_MISSING");
  const scopes = new Set<string>();
  for (const raw of policies.rows) {
    const p = rowPolicy(raw);
    const scope = p.browserFamily ?? "global";
    if (
      p.contractVersion !== "control_plane_v1" ||
      scopes.has(scope) ||
      (p.browserFamily === null && p.minimumBrowserVersion !== null) ||
      p.maintenanceMode !== (p.maintenanceCode !== null) ||
      (p.minimumExtensionVersion &&
        p.recommendedExtensionVersion &&
        compareSemVerV1(
          p.recommendedExtensionVersion,
          p.minimumExtensionVersion,
        ) < 0)
    )
      throw new Error("P3_POLICY_SOURCE_INVALID");
    scopes.add(scope);
  }
  const rules = await q.query<Record<string, unknown>>(
    'SELECT id,feature_key AS "featureKey",revision,contract_version AS "contractVersion",enabled,browser_family AS "browserFamily",minimum_extension_version AS "minimumExtensionVersion" FROM feature_rule_revisions WHERE id=ANY($1::uuid[])',
    [value.featureRuleRevisionIds],
  );
  if (rules.rows.length !== value.featureRuleRevisionIds.length)
    throw new Error("P3_FEATURE_RULE_SOURCE_MISSING");
  const ruleById = new Map<
    string,
    ReturnType<typeof P3FeatureRuleSchema.parse>
  >();
  const features = new Set<string>();
  for (const raw of rules.rows) {
    const rule = P3FeatureRuleSchema.parse(raw);
    if (
      rule.contractVersion !== "control_plane_v1" ||
      features.has(rule.featureKey)
    )
      throw new Error("P3_FEATURE_RULE_SOURCE_INVALID");
    features.add(rule.featureKey);
    ruleById.set(rule.id, rule);
  }
  const revisions = await q.query<Record<string, unknown>>(
    'SELECT r.id,r.rollout_id AS "rolloutId",r.target_kind AS "targetKind",r.revision,r.state,r.percentage_bps AS "percentageBps",r.baseline_config_version AS "baselineConfigVersion",r.candidate_config_version AS "candidateConfigVersion",r.baseline_feature_rule_revision_id AS "baselineFeatureRuleRevisionId",r.candidate_feature_rule_revision_id AS "candidateFeatureRuleRevisionId",o.rollout_key AS "rolloutKey" FROM rollout_revisions r JOIN rollouts o ON o.id=r.rollout_id WHERE r.id=ANY($1::uuid[])',
    [value.featureRolloutRevisionIds],
  );
  if (revisions.rows.length !== value.featureRolloutRevisionIds.length)
    throw new Error("P3_ROLLOUT_SOURCE_MISSING");
  const rolloutFeatures = new Set<string>();
  for (const raw of revisions.rows) {
    const revisionRow = { ...raw };
    delete revisionRow.rolloutKey;
    const revision = P3RolloutRevisionSchema.parse(revisionRow);
    const baseline = revision.baselineFeatureRuleRevisionId
      ? await q.query<Record<string, unknown>>(
          'SELECT id,feature_key AS "featureKey",revision,contract_version AS "contractVersion",enabled,browser_family AS "browserFamily",minimum_extension_version AS "minimumExtensionVersion" FROM feature_rule_revisions WHERE id IN ($1,$2)',
          [
            revision.baselineFeatureRuleRevisionId,
            revision.candidateFeatureRuleRevisionId,
          ],
        )
      : { rows: [] };
    if (
      revision.targetKind !== "FEATURE_RULE" ||
      raw.rolloutKey === "bootstrap.config" ||
      baseline.rows.length !== 2
    )
      throw new Error("P3_ROLLOUT_SOURCE_INVALID");
    const pair = baseline.rows.map((r) => P3FeatureRuleSchema.parse(r));
    if (
      pair[0]!.featureKey !== pair[1]!.featureKey ||
      pair.some((r) => r.contractVersion !== "control_plane_v1") ||
      !ruleById.has(revision.baselineFeatureRuleRevisionId!) ||
      rolloutFeatures.has(pair[0]!.featureKey)
    )
      throw new Error("P3_ROLLOUT_SOURCE_INVALID");
    rolloutFeatures.add(pair[0]!.featureKey);
  }
}
function rowPolicy(row: Record<string, unknown>): CompatibilityPolicyRevision {
  return CompatibilityPolicyRevisionSchema.parse({
    id: String(row.id),
    policyKey: String(row.policyKey),
    revision: Number(row.revision),
    contractVersion: "control_plane_v1",
    browserFamily: row.browserFamily as "chrome" | "yandex_chromium" | null,
    minimumExtensionVersion: row.minimumExtensionVersion as string | null,
    recommendedExtensionVersion: row.recommendedExtensionVersion as
      | string
      | null,
    minimumBrowserVersion: row.minimumBrowserVersion as string | null,
    maintenanceMode: Boolean(row.maintenanceMode),
    maintenanceCode: row.maintenanceCode as string | null,
    publishedAt: row.publishedAt as Date,
    createdAt: row.createdAt as Date,
  });
}

/** The sole P3.3 mutating adapter. Every mutation and audit write share a PG transaction. */
export function createP3PolicyPublicationRepository(
  runtime: DatabaseRuntime,
): CompatibilityPublicationPort & P3PublicationPort {
  return {
    async publishExtensionRelease(command, context) {
      const value = PublishExtensionReleaseCommandSchema.parse(command);
      return runtime.transaction(async (q) => {
        const inserted = await q.query<Record<string, unknown>>(
          'INSERT INTO extension_releases(version,release_channel,artifact_sha256,released_at) VALUES($1,$2,$3,$4) RETURNING id,version,release_channel AS "releaseChannel",artifact_sha256 AS "artifactSha256",released_at AS "releasedAt",created_at AS "createdAt"',
          [
            value.version,
            value.releaseChannel,
            value.artifactSha256 ?? null,
            value.releasedAt,
          ],
        );
        const row = inserted.rows[0]!;
        for (const contract of value.supportedContracts)
          await q.query(
            "INSERT INTO extension_release_contracts(release_id,contract_version) VALUES($1,$2)",
            [row.id, contract],
          );
        for (const browser of value.supportedBrowsers)
          await q.query(
            "INSERT INTO extension_release_browsers(release_id,browser_family) VALUES($1,$2)",
            [row.id, browser],
          );
        await audit(
          q,
          context,
          "EXTENSION_RELEASE_PUBLISHED",
          "EXTENSION_RELEASE",
          String(row.id),
        );
        return {
          id: String(row.id),
          version: String(row.version),
          releaseChannel: String(row.releaseChannel),
          artifactSha256: row.artifactSha256 as string | null,
          releasedAt: row.releasedAt as Date,
          createdAt: row.createdAt as Date,
        } as ExtensionRelease;
      });
    },
    async publishCompatibilityPolicyRevision(command, context) {
      const value =
        PublishCompatibilityPolicyRevisionCommandSchema.parse(command);
      return runtime.transaction(async (q) => {
        await q.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
          `p3-policy:${value.policyKey}`,
        ]);
        const next = await q.query<{ revision: number }>(
          "SELECT COALESCE(MAX(revision),0)+1 AS revision FROM compatibility_policy_revisions WHERE policy_key=$1",
          [value.policyKey],
        );
        const r = await q.query<Record<string, unknown>>(
          'INSERT INTO compatibility_policy_revisions(policy_key,revision,contract_version,browser_family,minimum_extension_version,recommended_extension_version,minimum_browser_version,maintenance_mode,maintenance_code,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,policy_key AS "policyKey",revision,contract_version, browser_family AS "browserFamily",minimum_extension_version AS "minimumExtensionVersion",recommended_extension_version AS "recommendedExtensionVersion",minimum_browser_version AS "minimumBrowserVersion",maintenance_mode AS "maintenanceMode",maintenance_code AS "maintenanceCode",published_at AS "publishedAt",created_at AS "createdAt"',
          [
            value.policyKey,
            next.rows[0]!.revision,
            value.contractVersion,
            value.browserFamily,
            value.minimumExtensionVersion,
            value.recommendedExtensionVersion,
            value.minimumBrowserVersion,
            value.maintenanceMode,
            value.maintenanceCode,
            value.publishedAt,
          ],
        );
        for (const version of value.blockedVersions)
          await q.query(
            "INSERT INTO compatibility_policy_blocked_versions(policy_revision_id,extension_version) VALUES($1,$2)",
            [r.rows[0]!.id, version],
          );
        await audit(
          q,
          context,
          "COMPATIBILITY_POLICY_PUBLISHED",
          "COMPATIBILITY_POLICY_REVISION",
          String(r.rows[0]!.id),
        );
        return rowPolicy(r.rows[0]!);
      });
    },
    async createFeatureDefinition(command, context) {
      const value = CreateFeatureDefinitionCommandSchema.parse(command);
      return runtime.transaction(async (q) => {
        await q.query(
          "INSERT INTO feature_definitions(feature_key,description) VALUES($1,$2)",
          [value.featureKey, value.description ?? null],
        );
        await audit(
          q,
          context,
          "FEATURE_DEFINITION_CREATED",
          "FEATURE_DEFINITION",
          null,
          { featureKey: value.featureKey },
        );
        return { featureKey: value.featureKey };
      });
    },
    async publishFeatureRuleRevision(command, context) {
      const value = PublishFeatureRuleRevisionCommandSchema.parse(command);
      return runtime.transaction(async (q) => {
        await q.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
          `p3-feature:${value.featureKey}`,
        ]);
        const next = await q.query<{ revision: number }>(
          "SELECT COALESCE(MAX(revision),0)+1 AS revision FROM feature_rule_revisions WHERE feature_key=$1",
          [value.featureKey],
        );
        const r = await q.query<{ id: string; revision: number }>(
          "INSERT INTO feature_rule_revisions(feature_key,revision,contract_version,enabled,browser_family,minimum_extension_version,published_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,revision",
          [
            value.featureKey,
            next.rows[0]!.revision,
            value.contractVersion,
            value.enabled,
            value.browserFamily,
            value.minimumExtensionVersion,
            value.publishedAt,
          ],
        );
        await audit(
          q,
          context,
          "FEATURE_RULE_PUBLISHED",
          "FEATURE_RULE_REVISION",
          r.rows[0]!.id,
        );
        return r.rows[0]!;
      });
    },
    async createRollout(command, context, testCohortSeed) {
      const value = CreateRolloutCommandSchema.parse(command);
      const seed = testCohortSeed ?? randomBytes(32);
      if (seed.length !== 32)
        throw new TypeError("cohort seed must be 32 bytes");
      return runtime.transaction(async (q) => {
        const r = await q.query<{ id: string }>(
          "INSERT INTO rollouts(rollout_key,target_kind,subject_kind,cohort_seed) VALUES($1,$2,$3,$4) RETURNING id",
          [value.rolloutKey, value.targetKind, value.subjectKind, seed],
        );
        await audit(q, context, "ROLLOUT_CREATED", "ROLLOUT", r.rows[0]!.id);
        return { id: r.rows[0]!.id, rolloutKey: value.rolloutKey };
      });
    },
    async publishRolloutRevision(command, context) {
      const value = PublishRolloutRevisionCommandSchema.parse(command);
      return runtime.transaction(async (q) => {
        const rollout = await q.query<{
          id: string;
          target_kind: "CONFIG_RELEASE" | "FEATURE_RULE";
        }>("SELECT id,target_kind FROM rollouts WHERE rollout_key=$1", [
          value.rolloutKey,
        ]);
        if (!rollout.rows[0]) throw new Error("P3_ROLLOUT_NOT_FOUND");
        const identity = rollout.rows[0];
        await q.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
          `p3-rollout:${value.rolloutKey}`,
        ]);
        const next = await q.query<{ revision: number }>(
          "SELECT COALESCE(MAX(revision),0)+1 AS revision FROM rollout_revisions WHERE rollout_id=$1",
          [identity.id],
        );
        const configShape = identity.target_kind === "CONFIG_RELEASE";
        if (
          configShape !==
          (value.baselineConfigVersion !== undefined &&
            value.candidateConfigVersion !== undefined)
        )
          throw new Error("P3_ROLLOUT_TARGET_SHAPE_INVALID");
        const r = await q.query<{ id: string; revision: number }>(
          "INSERT INTO rollout_revisions(rollout_id,target_kind,revision,state,percentage_bps,baseline_config_version,candidate_config_version,baseline_feature_rule_revision_id,candidate_feature_rule_revision_id,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,revision",
          [
            identity.id,
            identity.target_kind,
            next.rows[0]!.revision,
            value.state,
            value.percentageBps,
            value.baselineConfigVersion ?? null,
            value.candidateConfigVersion ?? null,
            value.baselineFeatureRuleRevisionId ?? null,
            value.candidateFeatureRuleRevisionId ?? null,
            value.publishedAt,
          ],
        );
        await audit(
          q,
          context,
          "ROLLOUT_REVISION_PUBLISHED",
          "ROLLOUT_REVISION",
          r.rows[0]!.id,
        );
        return r.rows[0]!;
      });
    },
    async publishConfigRelease(command, context) {
      const value = PublishConfigReleaseCommandSchema.parse(command);
      const hashes = configReleaseHashes(value);
      return runtime.transaction(async (q) => {
        await validateConfigSources(q, value);
        const r = await q.query<Record<string, unknown>>(
          'INSERT INTO config_releases(contract_version,snapshot_version,envelope_version,content_hash_sha256,source_fingerprint_sha256,signing_key_id,published_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING config_version AS "configVersion",contract_version AS "contractVersion",snapshot_version AS "snapshotVersion",envelope_version AS "envelopeVersion",content_hash_sha256 AS "contentHashSha256",source_fingerprint_sha256 AS "sourceFingerprintSha256",signing_key_id AS "signingKeyId",published_at AS "publishedAt",created_at AS "createdAt"',
          [
            value.contractVersion,
            value.snapshotVersion,
            value.envelopeVersion,
            hashes.contentHashSha256,
            hashes.sourceFingerprintSha256,
            value.signingKeyId,
            value.publishedAt,
          ],
        );
        const configVersion = Number(r.rows[0]!.configVersion);
        for (const id of value.compatibilityPolicyRevisionIds)
          await q.query(
            "INSERT INTO config_release_compatibility_policies(config_version,policy_revision_id) VALUES($1,$2)",
            [configVersion, id],
          );
        for (const id of value.featureRuleRevisionIds)
          await q.query(
            "INSERT INTO config_release_feature_rules(config_version,feature_rule_revision_id) VALUES($1,$2)",
            [configVersion, id],
          );
        for (const id of value.featureRolloutRevisionIds)
          await q.query(
            "INSERT INTO config_release_rollout_revisions(config_version,rollout_revision_id,target_kind) VALUES($1,$2,'FEATURE_RULE')",
            [configVersion, id],
          );
        await audit(
          q,
          context,
          "CONFIG_RELEASE_PUBLISHED",
          "CONFIG_RELEASE",
          null,
          {
            configVersion,
            contractVersion: value.contractVersion,
            sourceFingerprintSha256: hashes.sourceFingerprintSha256,
          },
        );
        return ConfigReleaseSchema.parse(r.rows[0]!);
      });
    },
  };
}
