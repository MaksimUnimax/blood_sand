import { createHash } from "node:crypto";
import {
  PlanMutationContextSchema,
  type PlanMutationContext,
} from "@product/plans";
import { z } from "zod";

const machineIdentifier = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/);

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

const TimestampSchema = z
  .union([z.date(), z.string().min(1)])
  .transform((value, ctx) => {
    const date =
      value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "invalid timestamp" });
      return z.NEVER;
    }
    return date;
  });

const AmountMinorSchema = z.number().int().safe().nonnegative();
const CurrencySchema = z.string().regex(/^[A-Z]{3}$/);
const PriceCodeSchema = machineIdentifier(64);
const MarketKeySchema = machineIdentifier(64);
const ChannelKeySchema = machineIdentifier(64);
const FingerprintSchema = z.string().regex(/^[0-9a-f]{64}$/);
const BillingIntervalUnitSchema = z.enum(["DAY", "MONTH", "YEAR"]);
const BillingIntervalCountSchema = z.number().int().min(1).max(1200);
const PriceStatusSchema = z.enum(["DRAFT", "ACTIVE", "HIDDEN", "ARCHIVED"]);
export const PriceRevisionStateSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const PriceMutationContextSchema = PlanMutationContextSchema;
export type PriceMutationContext = PlanMutationContext;
export type PriceStatus = z.infer<typeof PriceStatusSchema>;
export type PriceRevisionState = z.infer<typeof PriceRevisionStateSchema>;
export type BillingIntervalUnit = z.infer<typeof BillingIntervalUnitSchema>;

export const CreatePriceCommandSchema = z
  .object({
    planId: UuidSchema,
    code: PriceCodeSchema,
    marketKey: MarketKeySchema,
    channelKey: ChannelKeySchema,
  })
  .strict();
export type CreatePriceCommand = z.infer<typeof CreatePriceCommandSchema>;

const priceTermsShape = {
  amountMinor: AmountMinorSchema,
  currency: CurrencySchema,
  billingIntervalUnit: BillingIntervalUnitSchema,
  billingIntervalCount: BillingIntervalCountSchema,
  effectiveFrom: TimestampSchema,
  effectiveTo: TimestampSchema.nullable().optional().default(null),
};

export const CreateDraftPriceRevisionCommandSchema = z
  .object({
    priceId: UuidSchema,
    planRevisionId: UuidSchema,
    ...priceTermsShape,
  })
  .strict()
  .refine(
    (value) =>
      value.effectiveTo === null || value.effectiveTo > value.effectiveFrom,
    "effectiveTo must be later than effectiveFrom",
  );
export type CreateDraftPriceRevisionCommand = z.infer<
  typeof CreateDraftPriceRevisionCommandSchema
>;

export const UpdateDraftPriceRevisionCommandSchema = z
  .object({
    priceRevisionId: UuidSchema,
    expectedContentFingerprint: FingerprintSchema,
    planRevisionId: UuidSchema.optional(),
    amountMinor: AmountMinorSchema.optional(),
    currency: CurrencySchema.optional(),
    billingIntervalUnit: BillingIntervalUnitSchema.optional(),
    billingIntervalCount: BillingIntervalCountSchema.optional(),
    effectiveFrom: TimestampSchema.optional(),
    effectiveTo: TimestampSchema.nullable().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.planRevisionId !== undefined ||
      value.amountMinor !== undefined ||
      value.currency !== undefined ||
      value.billingIntervalUnit !== undefined ||
      value.billingIntervalCount !== undefined ||
      value.effectiveFrom !== undefined ||
      value.effectiveTo !== undefined,
    "at least one draft field is required",
  );
export type UpdateDraftPriceRevisionCommand = z.infer<
  typeof UpdateDraftPriceRevisionCommandSchema
>;

export const PublishPriceRevisionCommandSchema = z
  .object({
    priceRevisionId: UuidSchema,
    expectedContentFingerprint: FingerprintSchema,
  })
  .strict();
export type PublishPriceRevisionCommand = z.infer<
  typeof PublishPriceRevisionCommandSchema
>;

export const ChangePriceStatusCommandSchema = z
  .object({
    priceId: UuidSchema,
    expectedStatus: PriceStatusSchema,
    targetStatus: PriceStatusSchema,
  })
  .strict();
export type ChangePriceStatusCommand = z.infer<
  typeof ChangePriceStatusCommandSchema
>;

export const SchedulePriceSaleAssignmentCommandSchema = z
  .object({
    priceId: UuidSchema,
    expectedLatestAssignmentRevision: z.number().int().nonnegative().nullable(),
    selectedPriceRevisionId: UuidSchema.nullable(),
    effectiveFrom: TimestampSchema,
    reason: SafeReasonSchema,
  })
  .strict();
export type SchedulePriceSaleAssignmentCommand = z.infer<
  typeof SchedulePriceSaleAssignmentCommandSchema
>;

export const ResolvePriceForNewSaleCommandSchema = z
  .object({
    priceId: UuidSchema,
    at: TimestampSchema.optional(),
    effectiveAt: TimestampSchema.optional(),
    evaluatedAt: TimestampSchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      [value.at, value.effectiveAt, value.evaluatedAt].filter(
        (item) => item !== undefined,
      ).length <= 1,
    "only one resolution timestamp may be supplied",
  );
export type ResolvePriceForNewSaleCommand = z.infer<
  typeof ResolvePriceForNewSaleCommandSchema
>;

export const PriceFailureCodeSchema = z.enum([
  "PRICE_NOT_FOUND",
  "PRICE_CODE_CONFLICT",
  "PRICE_ARCHIVED",
  "PRICE_PLAN_NOT_FOUND",
  "PRICE_PLAN_ARCHIVED",
  "PRICE_STATUS_STALE",
  "PRICE_STATUS_TRANSITION_INVALID",
  "PRICE_PUBLISHED_REVISION_REQUIRED",
  "PRICE_REVISION_NOT_FOUND",
  "PRICE_REVISION_NOT_DRAFT",
  "PRICE_DRAFT_STALE",
  "PRICE_PLAN_REVISION_NOT_FOUND",
  "PRICE_PLAN_REVISION_PLAN_MISMATCH",
  "PRICE_PLAN_REVISION_NOT_PUBLISHED",
  "PRICE_ASSIGNMENT_STALE",
  "PRICE_ASSIGNMENT_OUTSIDE_REVISION_WINDOW",
  "PRICE_ASSIGNMENT_REVISION_NOT_PUBLISHED",
  "PRICE_SALE_ASSIGNMENT_NOT_FOUND",
  "PRICE_SALE_CLOSED",
  "PRICE_REVISION_EXPIRED",
  "PRICE_NOT_ACTIVE",
  "PLAN_NOT_ACTIVE",
]);
export type PriceFailureCode = z.infer<typeof PriceFailureCodeSchema>;

export type PriceCommandResult<T> =
  | { kind: "OK"; changed: boolean; value: T }
  | { kind: "REJECTED"; code: PriceFailureCode };

export type PriceSummary = {
  id: string;
  planId: string;
  code: string;
  marketKey: string;
  channelKey: string;
  status: PriceStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PriceRevisionDraft = {
  id: string;
  priceId: string;
  planRevisionId: string;
  revision: number;
  state: "DRAFT";
  amountMinor: number;
  currency: string;
  billingIntervalUnit: BillingIntervalUnit;
  billingIntervalCount: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  contentFingerprintSha256: string;
};

export type PublishedPriceRevision = Omit<PriceRevisionDraft, "state"> & {
  state: "PUBLISHED";
  publishedAt: Date;
};

export type PriceSaleAssignment = {
  id: string;
  priceId: string;
  assignmentRevision: number;
  selectedPriceRevisionId: string | null;
  effectiveFrom: Date;
  reason: string;
  createdAt: Date;
};

export type ResolvedPriceForNewSale = {
  price: PriceSummary;
  priceRevision: PublishedPriceRevision;
  assignment: PriceSaleAssignment;
};

export type PriceResolutionResult =
  | { kind: "RESOLVED"; value: ResolvedPriceForNewSale }
  | { kind: "REJECTED"; code: PriceFailureCode };

export type PriceRevisionFingerprintInput = Omit<
  PriceRevisionDraft,
  "state" | "createdAt" | "contentFingerprintSha256"
>;

export const P4PriceRevisionContentFingerprintV1 =
  "product-control-plane/price-revision-content/v1" as const;

export function computeP4PriceRevisionContentFingerprintV1(
  input: PriceRevisionFingerprintInput,
): string {
  const canonical = JSON.stringify({
    domain: P4PriceRevisionContentFingerprintV1,
    id: input.id,
    priceId: input.priceId,
    planRevisionId: input.planRevisionId,
    revision: input.revision,
    amountMinor: input.amountMinor,
    currency: input.currency,
    billingIntervalUnit: input.billingIntervalUnit,
    billingIntervalCount: input.billingIntervalCount,
    effectiveFrom: input.effectiveFrom.toISOString(),
    effectiveTo: input.effectiveTo?.toISOString() ?? null,
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function validatePriceStatusTransition(
  currentStatus: PriceStatus,
  targetStatus: PriceStatus,
  hasPublishedRevision: boolean,
): PriceFailureCode | null {
  if (currentStatus === targetStatus) return null;
  if (currentStatus === "ARCHIVED") return "PRICE_STATUS_TRANSITION_INVALID";
  if (
    (targetStatus === "ACTIVE" || targetStatus === "HIDDEN") &&
    !hasPublishedRevision
  )
    return "PRICE_PUBLISHED_REVISION_REQUIRED";
  const allowed =
    (currentStatus === "DRAFT" &&
      (targetStatus === "ACTIVE" ||
        targetStatus === "HIDDEN" ||
        targetStatus === "ARCHIVED")) ||
    (currentStatus === "ACTIVE" &&
      (targetStatus === "HIDDEN" || targetStatus === "ARCHIVED")) ||
    (currentStatus === "HIDDEN" &&
      (targetStatus === "ACTIVE" || targetStatus === "ARCHIVED"));
  return allowed ? null : "PRICE_STATUS_TRANSITION_INVALID";
}

export interface PriceCommandRepository {
  createPrice(
    command: CreatePriceCommand,
    context: PriceMutationContext,
  ): Promise<PriceCommandResult<PriceSummary>>;
  createDraftPriceRevision(
    command: CreateDraftPriceRevisionCommand,
    context: PriceMutationContext,
  ): Promise<PriceCommandResult<PriceRevisionDraft>>;
  getPriceRevisionDraft(
    priceRevisionId: string,
  ): Promise<PriceRevisionDraft | undefined>;
  getPublishedPriceRevision(
    priceRevisionId: string,
  ): Promise<PublishedPriceRevision | undefined>;
  updateDraftPriceRevision(
    command: UpdateDraftPriceRevisionCommand,
    context: PriceMutationContext,
  ): Promise<PriceCommandResult<PriceRevisionDraft>>;
  publishPriceRevision(
    command: PublishPriceRevisionCommand,
    context: PriceMutationContext,
  ): Promise<PriceCommandResult<PublishedPriceRevision>>;
  changePriceStatus(
    command: ChangePriceStatusCommand,
    context: PriceMutationContext,
  ): Promise<PriceCommandResult<PriceSummary>>;
  schedulePriceSaleAssignment(
    command: SchedulePriceSaleAssignmentCommand,
    context: PriceMutationContext,
  ): Promise<PriceCommandResult<PriceSaleAssignment>>;
  resolvePriceForNewSale(
    command: ResolvePriceForNewSaleCommand,
  ): Promise<PriceResolutionResult>;
}
