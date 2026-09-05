import {
  createHash,
  createPublicKey,
  sign,
  verify,
  type KeyObject,
} from "node:crypto";
import {
  compareSemVerV1,
  StableMachineIdentifierV1Schema,
} from "@product/shared";
import {
  resolveCompatibility,
  type CompatibilityCatalogRepository,
  type CompatibilityPolicyRevision,
  type CompatibilityResolution,
  type P3MutationContext,
} from "@product/compatibility";
import { z } from "zod";
import {
  BootstrapSnapshotPayloadV1Schema,
  SignedBootstrapEnvelopeV1Schema,
  type BootstrapSnapshotPayloadV1,
  type SignedBootstrapEnvelopeV1,
} from "@product/contracts";

const HashSchema = z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = z.date();
export const SigningKeyMetadataSchema = z
  .object({
    keyId: StableMachineIdentifierV1Schema,
    algorithm: z.literal("Ed25519"),
    publicKeySpkiDer: z.instanceof(Buffer).refine((value) => value.length > 0),
    publicKeySha256: HashSchema,
    createdAt: TimestampSchema,
  })
  .strict();
export const SigningKeyEventSchema = z
  .object({
    id: z.uuid(),
    keyId: StableMachineIdentifierV1Schema,
    eventType: z.enum(["REGISTERED", "ACTIVATED", "RETIRED", "REVOKED"]),
    occurredAt: TimestampSchema,
    reasonCode: StableMachineIdentifierV1Schema.nullable(),
    createdAt: TimestampSchema,
  })
  .strict();
export const ConfigReleaseSchema = z
  .object({
    configVersion: z.number().int().positive(),
    contractVersion: z.literal("control_plane_v1"),
    snapshotVersion: z.literal("bootstrap_snapshot_v1"),
    envelopeVersion: z.literal("bootstrap_envelope_v1"),
    contentHashSha256: HashSchema,
    sourceFingerprintSha256: HashSchema,
    signingKeyId: StableMachineIdentifierV1Schema,
    publishedAt: TimestampSchema,
    createdAt: TimestampSchema,
  })
  .strict();
export const ConfigReleaseCompatibilityPolicySchema = z
  .object({
    configVersion: z.number().int().positive(),
    policyRevisionId: z.uuid(),
  })
  .strict();
export type SigningKeyMetadata = z.infer<typeof SigningKeyMetadataSchema>;
export type SigningKeyEvent = z.infer<typeof SigningKeyEventSchema>;
export type ConfigRelease = z.infer<typeof ConfigReleaseSchema>;
export type ConfigReleaseCompatibilityPolicy = z.infer<
  typeof ConfigReleaseCompatibilityPolicySchema
>;

export type SigningKeyLifecycleState =
  | "UNREGISTERED"
  | "REGISTERED"
  | "ACTIVE"
  | "RETIRED"
  | "REVOKED";
export type SigningKeyLifecycleResult =
  | { state: SigningKeyLifecycleState }
  | { state: "INVALID"; error: "INVALID_LIFECYCLE" };

/** Strict append-only state-machine evaluation. Event order is occurred_at,id. */
export function resolveSigningKeyLifecycle(
  events: readonly SigningKeyEvent[],
): SigningKeyLifecycleResult {
  let state: SigningKeyLifecycleState = "UNREGISTERED";
  let previous: Date | undefined;
  let keyId: string | undefined;
  for (const event of events) {
    if (keyId && event.keyId !== keyId)
      return { state: "INVALID", error: "INVALID_LIFECYCLE" };
    keyId ??= event.keyId;
    if (previous && event.occurredAt.getTime() <= previous.getTime())
      return { state: "INVALID", error: "INVALID_LIFECYCLE" };
    previous = event.occurredAt;
    const valid =
      (state === "UNREGISTERED" && event.eventType === "REGISTERED") ||
      (state === "REGISTERED" && event.eventType === "ACTIVATED") ||
      (state === "ACTIVE" && event.eventType === "RETIRED") ||
      ((state === "REGISTERED" || state === "ACTIVE" || state === "RETIRED") &&
        event.eventType === "REVOKED");
    if (!valid) return { state: "INVALID", error: "INVALID_LIFECYCLE" };
    state =
      event.eventType === "ACTIVATED"
        ? "ACTIVE"
        : event.eventType === "RETIRED"
          ? "RETIRED"
          : event.eventType === "REVOKED"
            ? "REVOKED"
            : "REGISTERED";
  }
  return { state };
}

export const RegisterSigningKeyCommandSchema = z
  .object({
    keyId: StableMachineIdentifierV1Schema,
    publicKeySpkiDer: z.instanceof(Buffer).refine((value) => value.length > 0),
  })
  .strict();
export const SigningKeyReasonCommandSchema = z
  .object({
    keyId: StableMachineIdentifierV1Schema,
    reasonCode: StableMachineIdentifierV1Schema,
  })
  .strict();
export type RegisterSigningKeyCommand = z.infer<
  typeof RegisterSigningKeyCommandSchema
>;
export type SigningKeyReasonCommand = z.infer<
  typeof SigningKeyReasonCommandSchema
>;

export function validateSigningKeyRegistration(
  command: RegisterSigningKeyCommand,
): {
  keyId: string;
  algorithm: "Ed25519";
  publicKeySpkiDer: Buffer;
  publicKeySha256: string;
} {
  const value = RegisterSigningKeyCommandSchema.parse(command);
  try {
    const publicKey = createPublicKey({
      key: value.publicKeySpkiDer,
      format: "der",
      type: "spki",
    });
    if (publicKey.asymmetricKeyType !== "ed25519")
      throw new Error("not Ed25519");
    return {
      keyId: value.keyId,
      algorithm: "Ed25519",
      publicKeySpkiDer: Buffer.from(value.publicKeySpkiDer),
      publicKeySha256: createHash("sha256")
        .update(value.publicKeySpkiDer)
        .digest("hex"),
    };
  } catch {
    throw new Error("P3_SIGNING_KEY_INVALID");
  }
}

export const ConfigReleaseManifestV1Schema = z
  .object({
    contractVersion: z.literal("control_plane_v1"),
    snapshotVersion: z.literal("bootstrap_snapshot_v1"),
    envelopeVersion: z.literal("bootstrap_envelope_v1"),
    signingKeyId: StableMachineIdentifierV1Schema,
    compatibilityPolicyRevisionIds: z.array(z.uuid()),
    featureRuleRevisionIds: z.array(z.uuid()),
    featureRolloutRevisionIds: z.array(z.uuid()),
  })
  .strict();
export type ConfigReleaseManifestV1 = z.infer<
  typeof ConfigReleaseManifestV1Schema
>;
export function configReleaseHashes(manifest: ConfigReleaseManifestV1): {
  sourceFingerprintSha256: string;
  contentHashSha256: string;
} {
  const normalized = ConfigReleaseManifestV1Schema.parse({
    contractVersion: manifest.contractVersion,
    snapshotVersion: manifest.snapshotVersion,
    envelopeVersion: manifest.envelopeVersion,
    signingKeyId: manifest.signingKeyId,
    compatibilityPolicyRevisionIds: [
      ...manifest.compatibilityPolicyRevisionIds,
    ].sort(),
    featureRuleRevisionIds: [...manifest.featureRuleRevisionIds].sort(),
    featureRolloutRevisionIds: [...manifest.featureRolloutRevisionIds].sort(),
  });
  const source = canonicalizeJson({
    compatibilityPolicyRevisionIds: normalized.compatibilityPolicyRevisionIds,
    featureRuleRevisionIds: normalized.featureRuleRevisionIds,
    featureRolloutRevisionIds: normalized.featureRolloutRevisionIds,
  });
  return {
    sourceFingerprintSha256: createHash("sha256").update(source).digest("hex"),
    contentHashSha256: createHash("sha256")
      .update(canonicalizeJson(normalized))
      .digest("hex"),
  };
}

export type RolloutSubjectKind = "ACCOUNT" | "DEVICE";
export type RolloutState = "ACTIVE" | "PAUSED" | "RETIRED";
export type ConfigRolloutSelectionMode =
  | "COHORT"
  | "BASELINE_ONLY"
  | "ORDINARY_LATEST";

/** The single source of truth for bootstrap.config rollout selection. */
export function configRolloutSelectionModeV1(
  state: RolloutState,
): ConfigRolloutSelectionMode {
  switch (state) {
    case "ACTIVE":
      return "COHORT";
    case "PAUSED":
      return "BASELINE_ONLY";
    case "RETIRED":
      return "ORDINARY_LATEST";
  }
}

const FeatureKeySchema = StableMachineIdentifierV1Schema;
export const CreateFeatureDefinitionCommandSchema = z
  .object({
    featureKey: FeatureKeySchema,
    description: z.string().min(1).max(256).optional(),
  })
  .strict();
export const PublishFeatureRuleRevisionCommandSchema = z
  .object({
    featureKey: FeatureKeySchema,
    contractVersion: z.literal("control_plane_v1"),
    enabled: z.boolean(),
    browserFamily: z.enum(["chrome", "yandex_chromium"]).nullable(),
    minimumExtensionVersion: z.string().nullable(),
    publishedAt: z.date(),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.minimumExtensionVersion) {
      try {
        compareSemVerV1(v.minimumExtensionVersion, v.minimumExtensionVersion);
      } catch {
        c.addIssue({ code: "custom", message: "invalid SemVer" });
      }
    }
  });
export const CreateRolloutCommandSchema = z
  .object({
    rolloutKey: StableMachineIdentifierV1Schema,
    targetKind: z.enum(["CONFIG_RELEASE", "FEATURE_RULE"]),
    subjectKind: z.enum(["ACCOUNT", "DEVICE"]),
  })
  .strict()
  .superRefine((v, c) => {
    if (
      v.targetKind === "CONFIG_RELEASE" &&
      v.rolloutKey !== "bootstrap.config"
    )
      c.addIssue({ code: "custom", message: "reserved config rollout key" });
  });
export const PublishRolloutRevisionCommandSchema = z
  .object({
    rolloutKey: StableMachineIdentifierV1Schema,
    state: z.enum(["ACTIVE", "PAUSED", "RETIRED"]),
    percentageBps: z.number().int().min(0).max(10000),
    baselineConfigVersion: z.number().int().positive().optional(),
    candidateConfigVersion: z.number().int().positive().optional(),
    baselineFeatureRuleRevisionId: z.uuid().optional(),
    candidateFeatureRuleRevisionId: z.uuid().optional(),
    publishedAt: z.date(),
  })
  .strict();
export const PublishConfigReleaseCommandSchema =
  ConfigReleaseManifestV1Schema.extend({ publishedAt: z.date() })
    .strict()
    .superRefine((v, c) => {
      for (const [name, ids] of [
        ["compatibility", v.compatibilityPolicyRevisionIds],
        ["feature rule", v.featureRuleRevisionIds],
        ["feature rollout", v.featureRolloutRevisionIds],
      ] as const)
        if (new Set(ids).size !== ids.length)
          c.addIssue({ code: "custom", message: `duplicate ${name} source` });
    });
export type CreateFeatureDefinitionCommand = z.infer<
  typeof CreateFeatureDefinitionCommandSchema
>;
export type PublishFeatureRuleRevisionCommand = z.infer<
  typeof PublishFeatureRuleRevisionCommandSchema
>;
export type CreateRolloutCommand = z.infer<typeof CreateRolloutCommandSchema>;
export type PublishRolloutRevisionCommand = z.infer<
  typeof PublishRolloutRevisionCommandSchema
>;
export type PublishConfigReleaseCommand = z.infer<
  typeof PublishConfigReleaseCommandSchema
>;
export interface P3PublicationPort {
  registerSigningKey(
    command: RegisterSigningKeyCommand,
    context: P3MutationContext,
  ): Promise<SigningKeyMetadata>;
  activateSigningKey(
    keyId: string,
    context: P3MutationContext,
  ): Promise<SigningKeyEvent>;
  retireSigningKey(
    command: SigningKeyReasonCommand,
    context: P3MutationContext,
  ): Promise<SigningKeyEvent>;
  revokeSigningKey(
    command: SigningKeyReasonCommand,
    context: P3MutationContext,
  ): Promise<SigningKeyEvent>;
  createFeatureDefinition(
    command: CreateFeatureDefinitionCommand,
    context: P3MutationContext,
  ): Promise<{ featureKey: string }>;
  publishFeatureRuleRevision(
    command: PublishFeatureRuleRevisionCommand,
    context: P3MutationContext,
  ): Promise<{ id: string; revision: number }>;
  createRollout(
    command: CreateRolloutCommand,
    context: P3MutationContext,
    testCohortSeed?: Buffer,
  ): Promise<{ id: string; rolloutKey: string }>;
  publishRolloutRevision(
    command: PublishRolloutRevisionCommand,
    context: P3MutationContext,
  ): Promise<{ id: string; revision: number }>;
  publishConfigRelease(
    command: PublishConfigReleaseCommand,
    context: P3MutationContext,
  ): Promise<ConfigRelease>;
}
export function rolloutBucketV1(input: {
  rolloutKey: string;
  cohortSeed: Buffer;
  subjectKind: RolloutSubjectKind;
  subjectId: string;
}): number {
  StableMachineIdentifierV1Schema.parse(input.rolloutKey);
  if (input.cohortSeed.length !== 32)
    throw new TypeError("cohort seed must be 32 bytes");
  const bytes = Buffer.concat([
    Buffer.from("product-control-plane/rollout/v1\0", "utf8"),
    Buffer.from(input.rolloutKey, "utf8"),
    Buffer.from([0]),
    input.cohortSeed,
    Buffer.from([0]),
    Buffer.from(input.subjectKind, "ascii"),
    Buffer.from([0]),
    Buffer.from(input.subjectId, "utf8"),
  ]);
  return Number(
    createHash("sha256").update(bytes).digest().readBigUInt64BE(0) % 10000n,
  );
}
export function selectRolloutCandidateV1(input: {
  state: RolloutState;
  percentageBps: number;
  rolloutKey: string;
  cohortSeed: Buffer;
  subjectKind: RolloutSubjectKind;
  subjectId: string;
}): boolean {
  if (
    !Number.isInteger(input.percentageBps) ||
    input.percentageBps < 0 ||
    input.percentageBps > 10000
  )
    throw new TypeError("invalid rollout percentage");
  return (
    input.state === "ACTIVE" && rolloutBucketV1(input) < input.percentageBps
  );
}
/** Read-only P3.2 persistence boundary; publication is deliberately deferred. */
export interface RemoteConfigCatalogRepository {
  findSigningKey(keyId: string): Promise<SigningKeyMetadata | undefined>;
  listSigningKeyEvents(keyId: string): Promise<SigningKeyEvent[]>;
  findConfigRelease(configVersion: number): Promise<ConfigRelease | undefined>;
  findLatestConfigRelease(
    contractVersion: "control_plane_v1",
  ): Promise<ConfigRelease | undefined>;
  listConfigReleaseCompatibilityPolicies(
    configVersion: number,
  ): Promise<ConfigReleaseCompatibilityPolicy[]>;
}

export type P3FeatureRule = {
  id: string;
  featureKey: string;
  revision: number;
  contractVersion: "control_plane_v1";
  enabled: boolean;
  browserFamily: "chrome" | "yandex_chromium" | null;
  minimumExtensionVersion: string | null;
};
export type P3Rollout = {
  id: string;
  rolloutKey: string;
  targetKind: "CONFIG_RELEASE" | "FEATURE_RULE";
  subjectKind: RolloutSubjectKind;
  cohortSeed: Buffer;
};
export type P3RolloutRevision = {
  id: string;
  rolloutId: string;
  targetKind: "CONFIG_RELEASE" | "FEATURE_RULE";
  revision: number;
  state: RolloutState;
  percentageBps: number;
  baselineConfigVersion: number | null;
  candidateConfigVersion: number | null;
  baselineFeatureRuleRevisionId: string | null;
  candidateFeatureRuleRevisionId: string | null;
};
export const P3FeatureRuleSchema = z
  .object({
    id: z.uuid(),
    featureKey: FeatureKeySchema,
    revision: z.number().int().positive(),
    contractVersion: z.literal("control_plane_v1"),
    enabled: z.boolean(),
    browserFamily: z.enum(["chrome", "yandex_chromium"]).nullable(),
    minimumExtensionVersion: z.string().nullable(),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.minimumExtensionVersion) {
      try {
        compareSemVerV1(v.minimumExtensionVersion, v.minimumExtensionVersion);
      } catch {
        c.addIssue({ code: "custom", message: "invalid SemVer" });
      }
    }
  });
export const P3RolloutSchema = z
  .object({
    id: z.uuid(),
    rolloutKey: StableMachineIdentifierV1Schema,
    targetKind: z.enum(["CONFIG_RELEASE", "FEATURE_RULE"]),
    subjectKind: z.enum(["ACCOUNT", "DEVICE"]),
    cohortSeed: z.instanceof(Buffer).refine((v) => v.length === 32),
  })
  .strict();
export const P3RolloutRevisionSchema = z
  .object({
    id: z.uuid(),
    rolloutId: z.uuid(),
    targetKind: z.enum(["CONFIG_RELEASE", "FEATURE_RULE"]),
    revision: z.number().int().positive(),
    state: z.enum(["ACTIVE", "PAUSED", "RETIRED"]),
    percentageBps: z.number().int().min(0).max(10000),
    baselineConfigVersion: z.number().int().positive().nullable(),
    candidateConfigVersion: z.number().int().positive().nullable(),
    baselineFeatureRuleRevisionId: z.uuid().nullable(),
    candidateFeatureRuleRevisionId: z.uuid().nullable(),
  })
  .strict()
  .superRefine((v, c) => {
    const config = v.targetKind === "CONFIG_RELEASE";
    const configShape =
      v.baselineConfigVersion !== null &&
      v.candidateConfigVersion !== null &&
      v.baselineFeatureRuleRevisionId === null &&
      v.candidateFeatureRuleRevisionId === null;
    const featureShape =
      v.baselineConfigVersion === null &&
      v.candidateConfigVersion === null &&
      v.baselineFeatureRuleRevisionId !== null &&
      v.candidateFeatureRuleRevisionId !== null;
    if ((config && !configShape) || (!config && !featureShape))
      c.addIssue({ code: "custom", message: "invalid target shape" });
  });
/** Exact-source catalog: deliberately no generic or latest-policy query exists. */
export interface P3BootstrapPolicyCatalog
  extends RemoteConfigCatalogRepository,
    CompatibilityCatalogRepository {
  findRolloutByKey(rolloutKey: string): Promise<P3Rollout | undefined>;
  findFeatureDefinition(
    featureKey: string,
  ): Promise<{ featureKey: string } | undefined>;
  findRolloutById(rolloutId: string): Promise<P3Rollout | undefined>;
  findLatestRolloutRevision(
    rolloutId: string,
  ): Promise<P3RolloutRevision | undefined>;
  findFeatureRuleRevision(id: string): Promise<P3FeatureRule | undefined>;
  listConfigFeatureRules(configVersion: number): Promise<P3FeatureRule[]>;
  listConfigFeatureRolloutRevisions(
    configVersion: number,
  ): Promise<P3RolloutRevision[]>;
  listConfigCompatibilityPolicyRevisions(
    configVersion: number,
  ): Promise<CompatibilityPolicyRevision[]>;
}

/** The exact P3.3 bootstrap.config selectable set, shared by retirement safety. */
export async function listP3SelectableConfigReleases(
  catalog: Pick<
    P3BootstrapPolicyCatalog,
    | "findRolloutByKey"
    | "findLatestRolloutRevision"
    | "findConfigRelease"
    | "findLatestConfigRelease"
  >,
): Promise<ConfigRelease[]> {
  const rollout = await catalog.findRolloutByKey("bootstrap.config");
  if (!rollout) {
    const ordinary = await catalog.findLatestConfigRelease("control_plane_v1");
    return ordinary ? [ordinary] : [];
  }
  if (
    rollout.targetKind !== "CONFIG_RELEASE" ||
    rollout.rolloutKey !== "bootstrap.config" ||
    rollout.cohortSeed.length !== 32
  )
    throw new Error("P3_ROLLOUT_SOURCE_INVALID");
  const revision = await catalog.findLatestRolloutRevision(rollout.id);
  if (
    !revision ||
    revision.targetKind !== "CONFIG_RELEASE" ||
    revision.rolloutId !== rollout.id
  )
    throw new Error("P3_ROLLOUT_SOURCE_INVALID");
  const selectionMode = configRolloutSelectionModeV1(revision.state);
  if (selectionMode === "ORDINARY_LATEST") {
    const ordinary = await catalog.findLatestConfigRelease("control_plane_v1");
    return ordinary ? [ordinary] : [];
  }
  const [baseline, candidate] = await Promise.all([
    revision.baselineConfigVersion === null
      ? undefined
      : catalog.findConfigRelease(revision.baselineConfigVersion),
    revision.candidateConfigVersion === null
      ? undefined
      : catalog.findConfigRelease(revision.candidateConfigVersion),
  ]);
  if (!baseline || !candidate) throw new Error("P3_ROLLOUT_SOURCE_INVALID");
  return selectionMode === "BASELINE_ONLY" ? [baseline] : [baseline, candidate];
}
export type ResolveP3BootstrapPolicyInput = {
  contractVersion: "control_plane_v1";
  extensionVersion: string;
  browser: { family: "chrome" | "yandex_chromium"; version: string };
  accountId: string;
  deviceId: string;
};
export type ResolveP3BootstrapPolicyFailure =
  | "NO_CONFIG_RELEASE"
  | "CONFIG_SOURCE_INVALID"
  | "COMPATIBILITY_SOURCE_INVALID"
  | "ROLLOUT_SOURCE_INVALID"
  | "FEATURE_SOURCE_INVALID";
export type ResolveP3BootstrapPolicyResult = {
  configVersion: number;
  signingKeyId: string;
  sourceFingerprintSha256: string;
  compatibility: {
    extension: {
      status: CompatibilityResolution["extension"];
      minimumVersion: string | null;
    };
    browser: { status: CompatibilityResolution["browser"] };
  };
  features: Record<string, boolean>;
};
export async function resolveP3BootstrapPolicy(
  input: ResolveP3BootstrapPolicyInput,
  catalog: P3BootstrapPolicyCatalog,
): Promise<
  ResolveP3BootstrapPolicyResult | { failure: ResolveP3BootstrapPolicyFailure }
> {
  let selected: ConfigRelease | undefined;
  try {
    const configRollout = await catalog.findRolloutByKey("bootstrap.config");
    if (!configRollout)
      selected = await catalog.findLatestConfigRelease("control_plane_v1");
    else {
      if (
        configRollout.targetKind !== "CONFIG_RELEASE" ||
        configRollout.rolloutKey !== "bootstrap.config" ||
        configRollout.cohortSeed.length !== 32
      )
        return { failure: "ROLLOUT_SOURCE_INVALID" };
      const revision = await catalog.findLatestRolloutRevision(
        configRollout.id,
      );
      if (!revision) return { failure: "ROLLOUT_SOURCE_INVALID" };
      if (
        revision.targetKind !== "CONFIG_RELEASE" ||
        revision.rolloutId !== configRollout.id
      )
        return { failure: "ROLLOUT_SOURCE_INVALID" };
      const selectionMode = configRolloutSelectionModeV1(revision.state);
      if (selectionMode === "ORDINARY_LATEST")
        selected = await catalog.findLatestConfigRelease("control_plane_v1");
      else {
        const subjectId =
          configRollout.subjectKind === "ACCOUNT"
            ? input.accountId
            : input.deviceId;
        const candidate = selectRolloutCandidateV1({
          state: revision.state,
          percentageBps: revision.percentageBps,
          rolloutKey: configRollout.rolloutKey,
          cohortSeed: configRollout.cohortSeed,
          subjectKind: configRollout.subjectKind,
          subjectId,
        });
        selected = await catalog.findConfigRelease(
          selectionMode === "BASELINE_ONLY" || !candidate
            ? revision.baselineConfigVersion!
            : revision.candidateConfigVersion!,
        );
      }
    }
    if (!selected) return { failure: "NO_CONFIG_RELEASE" };
    if (
      selected.contractVersion !== "control_plane_v1" ||
      selected.snapshotVersion !== "bootstrap_snapshot_v1" ||
      selected.envelopeVersion !== "bootstrap_envelope_v1"
    )
      return { failure: "CONFIG_SOURCE_INVALID" };
    const [policies, rules, linkedRollouts] = await Promise.all([
      catalog.listConfigCompatibilityPolicyRevisions(selected.configVersion),
      catalog.listConfigFeatureRules(selected.configVersion),
      catalog.listConfigFeatureRolloutRevisions(selected.configVersion),
    ]);
    const release = await catalog.findExtensionRelease(input.extensionVersion);
    const [contracts, browsers] = release
      ? await Promise.all([
          catalog.listReleaseContracts(release.id),
          catalog.listReleaseBrowsers(release.id),
        ])
      : [[], []];
    const blocked = new Map<
      string,
      readonly import("@product/compatibility").BlockedExtensionVersion[]
    >();
    for (const policy of policies)
      blocked.set(policy.id, await catalog.listBlockedVersions(policy.id));
    const compatibility = resolveCompatibility({
      contractVersion: input.contractVersion,
      extensionVersion: input.extensionVersion,
      browserFamily: input.browser.family,
      browserVersion: input.browser.version,
      release,
      releaseContracts: contracts,
      releaseBrowsers: browsers,
      policies,
      blockedVersions: blocked,
    });
    if (!compatibility) return { failure: "COMPATIBILITY_SOURCE_INVALID" };
    const featureIds = new Set<string>();
    const features: Record<string, boolean> = {};
    for (const rule of rules) {
      if (
        featureIds.has(rule.featureKey) ||
        rule.contractVersion !== "control_plane_v1"
      )
        return { failure: "FEATURE_SOURCE_INVALID" };
      featureIds.add(rule.featureKey);
      features[rule.featureKey] =
        rule.enabled &&
        (!rule.browserFamily || rule.browserFamily === input.browser.family) &&
        (!rule.minimumExtensionVersion ||
          compareSemVerV1(
            input.extensionVersion,
            rule.minimumExtensionVersion,
          ) >= 0);
    }
    for (const revision of linkedRollouts) {
      if (
        revision.targetKind !== "FEATURE_RULE" ||
        revision.baselineFeatureRuleRevisionId === null ||
        revision.candidateFeatureRuleRevisionId === null
      )
        return { failure: "ROLLOUT_SOURCE_INVALID" };
      const [rollout, baseline, candidate] = await Promise.all([
        catalog.findRolloutById(revision.rolloutId),
        catalog.findFeatureRuleRevision(revision.baselineFeatureRuleRevisionId),
        catalog.findFeatureRuleRevision(
          revision.candidateFeatureRuleRevisionId,
        ),
      ]);
      if (
        !rollout ||
        rollout.targetKind !== "FEATURE_RULE" ||
        rollout.cohortSeed.length !== 32 ||
        !baseline ||
        !candidate ||
        baseline.featureKey !== candidate.featureKey ||
        !rules.some((r) => r.id === baseline.id)
      )
        return { failure: "FEATURE_SOURCE_INVALID" };
      const subjectId =
        rollout.subjectKind === "ACCOUNT" ? input.accountId : input.deviceId;
      const selectedRule = selectRolloutCandidateV1({
        state: revision.state === "RETIRED" ? "PAUSED" : revision.state,
        percentageBps: revision.percentageBps,
        rolloutKey: rollout.rolloutKey,
        cohortSeed: rollout.cohortSeed,
        subjectKind: rollout.subjectKind,
        subjectId,
      })
        ? candidate
        : baseline;
      features[selectedRule.featureKey] =
        selectedRule.enabled &&
        (!selectedRule.browserFamily ||
          selectedRule.browserFamily === input.browser.family) &&
        (!selectedRule.minimumExtensionVersion ||
          compareSemVerV1(
            input.extensionVersion,
            selectedRule.minimumExtensionVersion,
          ) >= 0);
    }
    return {
      configVersion: selected.configVersion,
      signingKeyId: selected.signingKeyId,
      sourceFingerprintSha256: selected.sourceFingerprintSha256,
      compatibility: {
        extension: {
          status: compatibility.extension,
          minimumVersion: compatibility.minimumVersion,
        },
        browser: { status: compatibility.browser },
      },
      features,
    };
  } catch {
    return { failure: "CONFIG_SOURCE_INVALID" };
  }
}

export const BOOTSTRAP_SIGNATURE_DOMAIN = Buffer.from(
  "product-control-plane/bootstrap-snapshot/v1\0",
  "utf8",
);

export type CanonicalJsonValue =
  | null
  | boolean
  | string
  | number
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

/** Deterministic JSON for already schema-validated declarative snapshots only. */
export function canonicalizeJson(value: unknown): Buffer {
  return Buffer.from(canonicalize(value), "utf8");
}

function canonicalize(value: unknown): string {
  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "string":
      return JSON.stringify(value);
    case "number":
      if (!Number.isSafeInteger(value) || Object.is(value, -0))
        throw new TypeError(
          "canonical JSON numbers must be safe integers excluding -0",
        );
      return String(value);
    case "object": {
      if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
      if (Object.getPrototypeOf(value) !== Object.prototype)
        throw new TypeError(
          "canonical JSON objects must have Object.prototype",
        );
      const object = value as Record<string, unknown>;
      return `{${Object.keys(object)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`)
        .join(",")}}`;
    }
    default:
      throw new TypeError("value is not valid canonical JSON");
  }
}

/** Packaged public keys; lookup is strictly by the envelope keyId. */
export type TrustedConfigSigningKeyRing = ReadonlyMap<string, KeyObject>;

export type BootstrapVerificationFailure =
  | "INVALID_ENVELOPE"
  | "UNSUPPORTED_ALGORITHM"
  | "UNKNOWN_SIGNING_KEY"
  | "INVALID_SIGNATURE"
  | "INVALID_PAYLOAD_ENCODING"
  | "INVALID_PAYLOAD_JSON"
  | "INVALID_PAYLOAD_SCHEMA"
  | "NON_CANONICAL_PAYLOAD";
export type VerifyBootstrapEnvelopeResult =
  | { ok: true; payload: BootstrapSnapshotPayloadV1 }
  | { ok: false; error: BootstrapVerificationFailure };

export function signBootstrapSnapshot(
  payload: BootstrapSnapshotPayloadV1,
  keyId: string,
  privateKey: KeyObject,
): SignedBootstrapEnvelopeV1 {
  const parsed = BootstrapSnapshotPayloadV1Schema.parse(payload);
  const payloadBytes = canonicalizeJson(parsed);
  const signingBytes = bootstrapSigningBytes(keyId, payloadBytes);
  return SignedBootstrapEnvelopeV1Schema.parse({
    envelopeVersion: "bootstrap_envelope_v1",
    algorithm: "Ed25519",
    keyId,
    payload: payloadBytes.toString("base64url"),
    signature: sign(null, signingBytes, privateKey).toString("base64url"),
  });
}

export function verifyBootstrapEnvelope(
  input: unknown,
  ring: TrustedConfigSigningKeyRing,
): VerifyBootstrapEnvelopeResult {
  const envelope = SignedBootstrapEnvelopeV1Schema.safeParse(input);
  if (!envelope.success) {
    const algorithm = asRecord(input)?.algorithm;
    const raw = asRecord(input);
    if (typeof algorithm === "string" && algorithm !== "Ed25519")
      return { ok: false, error: "UNSUPPORTED_ALGORITHM" };
    if (
      (typeof raw?.payload === "string" && !isBase64Url(raw.payload)) ||
      (typeof raw?.signature === "string" && !isBase64Url(raw.signature))
    )
      return { ok: false, error: "INVALID_PAYLOAD_ENCODING" };
    return {
      ok: false,
      error: "INVALID_ENVELOPE",
    };
  }
  if (envelope.data.algorithm !== "Ed25519")
    return { ok: false, error: "UNSUPPORTED_ALGORITHM" };
  const publicKey = ring.get(envelope.data.keyId);
  if (!publicKey) return { ok: false, error: "UNKNOWN_SIGNING_KEY" };
  const payloadBytes = decodeBase64Url(envelope.data.payload);
  const signature = decodeBase64Url(envelope.data.signature);
  if (!payloadBytes || !signature)
    return { ok: false, error: "INVALID_PAYLOAD_ENCODING" };
  let valid: boolean;
  try {
    valid = verify(
      null,
      bootstrapSigningBytes(envelope.data.keyId, payloadBytes),
      publicKey,
      signature,
    );
  } catch {
    return { ok: false, error: "INVALID_SIGNATURE" };
  }
  if (!valid) return { ok: false, error: "INVALID_SIGNATURE" };
  let json: unknown;
  try {
    json = JSON.parse(payloadBytes.toString("utf8"));
  } catch {
    return { ok: false, error: "INVALID_PAYLOAD_JSON" };
  }
  const payload = BootstrapSnapshotPayloadV1Schema.safeParse(json);
  if (!payload.success) return { ok: false, error: "INVALID_PAYLOAD_SCHEMA" };
  try {
    if (!canonicalizeJson(payload.data).equals(payloadBytes))
      return { ok: false, error: "NON_CANONICAL_PAYLOAD" };
  } catch {
    return { ok: false, error: "INVALID_PAYLOAD_SCHEMA" };
  }
  return { ok: true, payload: payload.data };
}

function bootstrapSigningBytes(keyId: string, payload: Buffer): Buffer {
  return Buffer.concat([
    BOOTSTRAP_SIGNATURE_DOMAIN,
    Buffer.from(keyId, "utf8"),
    Buffer.from([0]),
    payload,
  ]);
}
function decodeBase64Url(value: string): Buffer | undefined {
  if (!isBase64Url(value)) return undefined;
  try {
    const decoded = Buffer.from(value, "base64url");
    return decoded.toString("base64url") === value ? decoded : undefined;
  } catch {
    return undefined;
  }
}
function isBase64Url(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}
function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
