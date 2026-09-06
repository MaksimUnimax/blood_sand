import { createHash } from "node:crypto";
import { z } from "zod";

const machineIdentifier = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/);

export const PlanCodeSchema = machineIdentifier(64);
export const EntitlementKeySchema = machineIdentifier(128);
const UuidSchema = z.uuid();

const SafeReasonSchema = z
  .string()
  .min(1)
  .max(512)
  .refine((value) => value.trim().length > 0, "reason must not be blank")
  .refine(
    (value) =>
      !value.includes("<") &&
      !value.includes(">") &&
      ![...value].some((character) => {
        const code = character.codePointAt(0) ?? 0;
        return code < 0x20 || code === 0x7f;
      }),
    "reason contains unsafe characters",
  )
  .transform((value) => value.trim());

export const PlanMutationContextSchema = z.discriminatedUnion("actorType", [
  z
    .object({
      actorType: z.literal("SYSTEM"),
      actorId: UuidSchema.optional(),
      correlationId: z.string().min(1).max(128),
      reason: SafeReasonSchema,
    })
    .strict(),
  z
    .object({
      actorType: z.literal("ADMIN"),
      actorId: UuidSchema,
      correlationId: z.string().min(1).max(128),
      reason: SafeReasonSchema,
    })
    .strict(),
]);
export type PlanMutationContext = z.infer<typeof PlanMutationContextSchema>;

export const PlanStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "HIDDEN",
  "ARCHIVED",
]);
export type PlanStatus = z.infer<typeof PlanStatusSchema>;
export const PlanRevisionStateSchema = z.enum(["DRAFT", "PUBLISHED"]);
export type PlanRevisionState = z.infer<typeof PlanRevisionStateSchema>;
export const EntitlementValueTypeSchema = z.enum(["BOOLEAN", "INTEGER"]);
export type EntitlementValueType = z.infer<typeof EntitlementValueTypeSchema>;
export const EntitlementSecurityClassificationSchema = z.enum([
  "CAPABILITY",
  "LIMIT",
]);
export type EntitlementSecurityClassification = z.infer<
  typeof EntitlementSecurityClassificationSchema
>;

export const TypedEntitlementValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("BOOLEAN"), value: z.boolean() }).strict(),
  z
    .object({
      kind: z.literal("INTEGER"),
      value: z.number().int().safe(),
    })
    .strict(),
]);
export type TypedEntitlementValue = z.infer<typeof TypedEntitlementValueSchema>;

const DisplayNameSchema = z
  .string()
  .max(256)
  .refine((value) => value.trim().length > 0, "displayName must not be blank")
  .transform((value) => value.trim());
const DescriptionSchema = z.string().max(4000);
const DefinitionDescriptionSchema = z
  .string()
  .max(512)
  .transform((value) => value.trim());
const FingerprintSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const CreatePlanCommandSchema = z
  .object({ code: PlanCodeSchema })
  .strict();
export type CreatePlanCommand = z.infer<typeof CreatePlanCommandSchema>;

export const CreateDraftPlanRevisionCommandSchema = z
  .object({
    planId: UuidSchema,
    displayName: DisplayNameSchema,
    description: DescriptionSchema,
  })
  .strict();
export type CreateDraftPlanRevisionCommand = z.infer<
  typeof CreateDraftPlanRevisionCommandSchema
>;

export const UpdateDraftPlanRevisionCommandSchema = z
  .object({
    planRevisionId: UuidSchema,
    expectedContentFingerprint: FingerprintSchema,
    displayName: DisplayNameSchema.optional(),
    description: DescriptionSchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.displayName !== undefined || value.description !== undefined,
    "at least one draft field is required",
  );
export type UpdateDraftPlanRevisionCommand = z.infer<
  typeof UpdateDraftPlanRevisionCommandSchema
>;

export const SetDraftPlanEntitlementCommandSchema = z
  .object({
    planRevisionId: UuidSchema,
    expectedContentFingerprint: FingerprintSchema,
    entitlementKey: EntitlementKeySchema,
    value: TypedEntitlementValueSchema,
  })
  .strict();
export type SetDraftPlanEntitlementCommand = z.infer<
  typeof SetDraftPlanEntitlementCommandSchema
>;

export const RemoveDraftPlanEntitlementCommandSchema = z
  .object({
    planRevisionId: UuidSchema,
    expectedContentFingerprint: FingerprintSchema,
    entitlementKey: EntitlementKeySchema,
  })
  .strict();
export type RemoveDraftPlanEntitlementCommand = z.infer<
  typeof RemoveDraftPlanEntitlementCommandSchema
>;

export const PublishPlanRevisionCommandSchema = z
  .object({
    planRevisionId: UuidSchema,
    expectedContentFingerprint: FingerprintSchema,
  })
  .strict();
export type PublishPlanRevisionCommand = z.infer<
  typeof PublishPlanRevisionCommandSchema
>;

export const ChangePlanStatusCommandSchema = z
  .object({
    planId: UuidSchema,
    expectedStatus: PlanStatusSchema,
    targetStatus: PlanStatusSchema,
  })
  .strict();
export type ChangePlanStatusCommand = z.infer<
  typeof ChangePlanStatusCommandSchema
>;

export const CreateEntitlementDefinitionCommandSchema = z
  .object({
    entitlementKey: EntitlementKeySchema,
    valueType: EntitlementValueTypeSchema,
    securityClassification: EntitlementSecurityClassificationSchema,
    description: DefinitionDescriptionSchema,
  })
  .strict()
  .refine(
    (value) =>
      (value.valueType === "BOOLEAN" &&
        value.securityClassification === "CAPABILITY") ||
      (value.valueType === "INTEGER" &&
        value.securityClassification === "LIMIT"),
    "value type and security classification do not match",
  );
export type CreateEntitlementDefinitionCommand = z.infer<
  typeof CreateEntitlementDefinitionCommandSchema
>;

export const UpdateEntitlementDefinitionDescriptionCommandSchema = z
  .object({
    entitlementKey: EntitlementKeySchema,
    expectedDescription: DefinitionDescriptionSchema,
    newDescription: DefinitionDescriptionSchema,
  })
  .strict();
export type UpdateEntitlementDefinitionDescriptionCommand = z.infer<
  typeof UpdateEntitlementDefinitionDescriptionCommandSchema
>;

export const DeprecateEntitlementDefinitionCommandSchema = z
  .object({ entitlementKey: EntitlementKeySchema })
  .strict();
export type DeprecateEntitlementDefinitionCommand = z.infer<
  typeof DeprecateEntitlementDefinitionCommandSchema
>;

export const FailureCodeSchema = z.enum([
  "PLAN_NOT_FOUND",
  "PLAN_CODE_CONFLICT",
  "PLAN_ARCHIVED",
  "PLAN_STATUS_STALE",
  "PLAN_STATUS_TRANSITION_INVALID",
  "PLAN_PUBLISHED_REVISION_REQUIRED",
  "PLAN_REVISION_NOT_FOUND",
  "PLAN_REVISION_NOT_DRAFT",
  "PLAN_DRAFT_STALE",
  "ENTITLEMENT_DEFINITION_NOT_FOUND",
  "ENTITLEMENT_DEFINITION_CONFLICT",
  "ENTITLEMENT_DEFINITION_STALE",
  "ENTITLEMENT_DEPRECATED",
  "ENTITLEMENT_TYPE_MISMATCH",
]);
export type FailureCode = z.infer<typeof FailureCodeSchema>;

export type CommandResult<T> =
  | { kind: "OK"; changed: boolean; value: T }
  | { kind: "REJECTED"; code: FailureCode };

export type PlanSummary = {
  id: string;
  code: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PlanEntitlement = {
  entitlementKey: string;
  value: TypedEntitlementValue;
};

export type PlanRevisionDraft = {
  id: string;
  planId: string;
  revision: number;
  state: "DRAFT";
  displayName: string;
  description: string;
  entitlements: PlanEntitlement[];
  contentFingerprintSha256: string;
};

export type PublishedPlanRevision = {
  id: string;
  planId: string;
  revision: number;
  state: "PUBLISHED";
  publishedAt: Date;
  contentFingerprintSha256: string;
  entitlementCount: number;
};

export type EntitlementDefinition = {
  entitlementKey: string;
  valueType: EntitlementValueType;
  securityClassification: EntitlementSecurityClassification;
  description: string;
  deprecatedAt: Date | null;
  createdAt: Date;
};

export type PlanRevisionFingerprintInput = {
  planRevisionId: string;
  planId: string;
  revision: number;
  displayName: string;
  description: string;
  entitlements: readonly PlanEntitlement[];
};

export const P4PlanRevisionContentFingerprintV1 =
  "product-control-plane/plan-revision-content/v1" as const;

export function computeP4PlanRevisionContentFingerprintV1(
  input: PlanRevisionFingerprintInput,
): string {
  const entitlements = [...input.entitlements]
    .sort((a, b) =>
      a.entitlementKey < b.entitlementKey
        ? -1
        : a.entitlementKey > b.entitlementKey
          ? 1
          : 0,
    )
    .map((entitlement) => ({
      entitlementKey: entitlement.entitlementKey,
      value: entitlement.value,
    }));
  const canonical = JSON.stringify({
    domain: P4PlanRevisionContentFingerprintV1,
    planRevisionId: input.planRevisionId,
    planId: input.planId,
    revision: input.revision,
    displayName: input.displayName,
    description: input.description,
    entitlements,
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function validateEntitlementValueType(
  valueType: EntitlementValueType,
  value: TypedEntitlementValue,
): boolean {
  return valueType === value.kind;
}

export function validatePlanStatusTransition(
  currentStatus: PlanStatus,
  targetStatus: PlanStatus,
  hasPublishedRevision: boolean,
): FailureCode | null {
  if (currentStatus === targetStatus) return null;
  if (currentStatus === "ARCHIVED") return "PLAN_STATUS_TRANSITION_INVALID";
  if (
    (targetStatus === "ACTIVE" || targetStatus === "HIDDEN") &&
    !hasPublishedRevision
  )
    return "PLAN_PUBLISHED_REVISION_REQUIRED";
  const allowed =
    (currentStatus === "DRAFT" &&
      (targetStatus === "ACTIVE" ||
        targetStatus === "HIDDEN" ||
        targetStatus === "ARCHIVED")) ||
    (currentStatus === "ACTIVE" &&
      (targetStatus === "HIDDEN" || targetStatus === "ARCHIVED")) ||
    (currentStatus === "HIDDEN" &&
      (targetStatus === "ACTIVE" || targetStatus === "ARCHIVED"));
  return allowed ? null : "PLAN_STATUS_TRANSITION_INVALID";
}

export interface PlanEntitlementCommandRepository {
  createPlan(
    command: CreatePlanCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<PlanSummary>>;
  createDraftPlanRevision(
    command: CreateDraftPlanRevisionCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<PlanRevisionDraft>>;
  getPlanRevisionDraft(
    planRevisionId: string,
  ): Promise<PlanRevisionDraft | undefined>;
  updateDraftPlanRevision(
    command: UpdateDraftPlanRevisionCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<PlanRevisionDraft>>;
  setDraftPlanEntitlement(
    command: SetDraftPlanEntitlementCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<PlanRevisionDraft>>;
  removeDraftPlanEntitlement(
    command: RemoveDraftPlanEntitlementCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<PlanRevisionDraft>>;
  publishPlanRevision(
    command: PublishPlanRevisionCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<PublishedPlanRevision>>;
  changePlanStatus(
    command: ChangePlanStatusCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<PlanSummary>>;
  createEntitlementDefinition(
    command: CreateEntitlementDefinitionCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<EntitlementDefinition>>;
  updateEntitlementDefinitionDescription(
    command: UpdateEntitlementDefinitionDescriptionCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<EntitlementDefinition>>;
  deprecateEntitlementDefinition(
    command: DeprecateEntitlementDefinitionCommand,
    context: PlanMutationContext,
  ): Promise<CommandResult<EntitlementDefinition>>;
}
