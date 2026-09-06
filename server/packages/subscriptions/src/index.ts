import {
  PlanMutationContextSchema,
  type PlanMutationContext,
} from "@product/plans";
import { z } from "zod";

export const SubscriptionMutationContextSchema = PlanMutationContextSchema;
export type SubscriptionMutationContext = PlanMutationContext;

export const SubscriptionStateSchema = z.enum([
  "TRIAL",
  "ACTIVE",
  "GRACE",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
  "SUSPENDED",
]);
export type SubscriptionState = z.infer<typeof SubscriptionStateSchema>;

const UuidSchema = z.uuid();
const TimestampSchema = z.date();
const PositiveSafeIntegerSchema = z.number().int().positive().safe();

export const GrantSubscriptionCommandSchema = z
  .object({
    accountId: UuidSchema,
    planRevisionId: UuidSchema,
    currentPeriodEnd: TimestampSchema,
  })
  .strict();
export type GrantSubscriptionCommand = z.infer<
  typeof GrantSubscriptionCommandSchema
>;

export const ExtendSubscriptionCommandSchema = z
  .object({
    subscriptionId: UuidSchema,
    expectedStateRevision: PositiveSafeIntegerSchema,
    newCurrentPeriodEnd: TimestampSchema,
  })
  .strict();
export type ExtendSubscriptionCommand = z.infer<
  typeof ExtendSubscriptionCommandSchema
>;

export const SuspendSubscriptionCommandSchema = z
  .object({
    subscriptionId: UuidSchema,
    expectedStateRevision: PositiveSafeIntegerSchema,
  })
  .strict();
export type SuspendSubscriptionCommand = z.infer<
  typeof SuspendSubscriptionCommandSchema
>;

export const RestoreSubscriptionCommandSchema = z
  .object({
    subscriptionId: UuidSchema,
    expectedStateRevision: PositiveSafeIntegerSchema,
  })
  .strict();
export type RestoreSubscriptionCommand = z.infer<
  typeof RestoreSubscriptionCommandSchema
>;

export const SubscriptionFailureCodeSchema = z.enum([
  "ACCOUNT_NOT_FOUND",
  "SUBSCRIPTION_NOT_FOUND",
  "SUBSCRIPTION_ALREADY_EXISTS",
  "SUBSCRIPTION_STATE_STALE",
  "PLAN_REVISION_NOT_FOUND",
  "PLAN_REVISION_NOT_PUBLISHED",
  "SUBSCRIPTION_PERIOD_INVALID",
  "SUBSCRIPTION_PERIOD_NOT_EXTENDED",
  "SUBSCRIPTION_GRACE_WINDOW_CONFLICT",
  "SUBSCRIPTION_STATE_TRANSITION_INVALID",
  "SUBSCRIPTION_ALREADY_SUSPENDED",
  "SUBSCRIPTION_NOT_SUSPENDED",
  "SUBSCRIPTION_RESTORE_ORIGIN_NOT_FOUND",
  "SUBSCRIPTION_PERIOD_ENDED",
  "SUBSCRIPTION_GRACE_ENDED",
  "SUBSCRIPTION_CORRUPTED",
]);
export type SubscriptionFailureCode = z.infer<
  typeof SubscriptionFailureCodeSchema
>;

export type SubscriptionSnapshot = {
  id: string;
  accountId: string;
  state: SubscriptionState;
  stateRevision: number;
  currentPlanRevisionId: string;
  boundPriceRevisionId: string | null;
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  graceUntil: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  suspendedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const SubscriptionSnapshotSchema = z
  .object({
    id: UuidSchema,
    accountId: UuidSchema,
    state: SubscriptionStateSchema,
    stateRevision: PositiveSafeIntegerSchema,
    currentPlanRevisionId: UuidSchema,
    boundPriceRevisionId: UuidSchema.nullable(),
    startedAt: TimestampSchema,
    currentPeriodStart: TimestampSchema,
    currentPeriodEnd: TimestampSchema,
    graceUntil: TimestampSchema.nullable(),
    cancelAtPeriodEnd: z.boolean(),
    canceledAt: TimestampSchema.nullable(),
    suspendedAt: TimestampSchema.nullable(),
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema,
  })
  .strict();

export type SubscriptionCommandResult =
  | { kind: "OK"; changed: boolean; value: SubscriptionSnapshot }
  | { kind: "REJECTED"; code: SubscriptionFailureCode };

export function validateSubscriptionStateTransition(
  currentState: SubscriptionState | null,
  targetState: SubscriptionState,
): SubscriptionFailureCode | null {
  const allowed: readonly SubscriptionState[] =
    currentState === null
      ? targetState === "TRIAL" || targetState === "ACTIVE"
        ? [targetState]
        : []
      : currentState === "TRIAL"
        ? ["ACTIVE", "EXPIRED", "SUSPENDED"]
        : currentState === "ACTIVE"
          ? ["GRACE", "PAST_DUE", "CANCELED", "EXPIRED", "SUSPENDED"]
          : currentState === "GRACE"
            ? ["ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED", "SUSPENDED"]
            : currentState === "PAST_DUE"
              ? ["ACTIVE", "GRACE", "CANCELED", "EXPIRED", "SUSPENDED"]
              : currentState === "CANCELED"
                ? ["ACTIVE", "EXPIRED", "SUSPENDED"]
                : currentState === "SUSPENDED"
                  ? [
                      "TRIAL",
                      "ACTIVE",
                      "GRACE",
                      "PAST_DUE",
                      "CANCELED",
                      "EXPIRED",
                    ]
                  : [];
  return allowed.includes(targetState)
    ? null
    : "SUBSCRIPTION_STATE_TRANSITION_INVALID";
}

export type SubscriptionAccessReason =
  | "ACCOUNT_SUSPENDED"
  | "NO_CURRENT_SUBSCRIPTION"
  | "PERIOD_ENDED"
  | "GRACE_ENDED"
  | "PAST_DUE"
  | "CANCELED"
  | "SUBSCRIPTION_SUSPENDED"
  | "SUBSCRIPTION_EXPIRED"
  | "SUBSCRIPTION_CORRUPTED";
export const SubscriptionAccessReasonSchema = z.enum([
  "ACCOUNT_SUSPENDED",
  "NO_CURRENT_SUBSCRIPTION",
  "PERIOD_ENDED",
  "GRACE_ENDED",
  "PAST_DUE",
  "CANCELED",
  "SUBSCRIPTION_SUSPENDED",
  "SUBSCRIPTION_EXPIRED",
  "SUBSCRIPTION_CORRUPTED",
]);

export type SubscriptionAccessResult =
  | { kind: "ACCOUNT_NOT_FOUND" }
  | { kind: "INELIGIBLE"; reason: SubscriptionAccessReason }
  | {
      kind: "ELIGIBLE";
      subscriptionId: string;
      state: Extract<
        SubscriptionState,
        "TRIAL" | "ACTIVE" | "GRACE" | "CANCELED"
      >;
      stateRevision: number;
      planRevisionId: string;
      boundPriceRevisionId: string | null;
      currentPeriodEnd: Date;
      graceUntil: Date | null;
    };

export function resolveSubscriptionAccess(
  accountStatus: "ACTIVE" | "SUSPENDED",
  subscription: SubscriptionSnapshot | null,
  at: Date,
): Exclude<SubscriptionAccessResult, { kind: "ACCOUNT_NOT_FOUND" }> {
  if (accountStatus === "SUSPENDED")
    return { kind: "INELIGIBLE", reason: "ACCOUNT_SUSPENDED" };
  if (!subscription)
    return { kind: "INELIGIBLE", reason: "NO_CURRENT_SUBSCRIPTION" };
  if (subscription.state === "EXPIRED")
    return { kind: "INELIGIBLE", reason: "SUBSCRIPTION_EXPIRED" };
  if (subscription.state === "SUSPENDED")
    return { kind: "INELIGIBLE", reason: "SUBSCRIPTION_SUSPENDED" };
  if (subscription.state === "PAST_DUE")
    return { kind: "INELIGIBLE", reason: "PAST_DUE" };
  if (subscription.state === "GRACE") {
    if (!subscription.graceUntil)
      return { kind: "INELIGIBLE", reason: "SUBSCRIPTION_CORRUPTED" };
    if (!(at < subscription.graceUntil))
      return { kind: "INELIGIBLE", reason: "GRACE_ENDED" };
  } else if (subscription.state === "CANCELED") {
    if (
      !subscription.cancelAtPeriodEnd ||
      !(at < subscription.currentPeriodEnd)
    )
      return { kind: "INELIGIBLE", reason: "CANCELED" };
  } else if (!(at < subscription.currentPeriodEnd)) {
    return { kind: "INELIGIBLE", reason: "PERIOD_ENDED" };
  }
  return {
    kind: "ELIGIBLE",
    subscriptionId: subscription.id,
    state: subscription.state,
    stateRevision: subscription.stateRevision,
    planRevisionId: subscription.currentPlanRevisionId,
    boundPriceRevisionId: subscription.boundPriceRevisionId,
    currentPeriodEnd: subscription.currentPeriodEnd,
    graceUntil: subscription.graceUntil,
  };
}

export interface CurrentSubscriptionReader {
  getCurrentSubscription(
    accountId: string,
  ): Promise<SubscriptionSnapshot | null>;
}

export type SubscriptionAccessObservation = {
  accountStatus: "ACTIVE" | "SUSPENDED";
  subscription: SubscriptionSnapshot | null;
};

export interface SubscriptionAccessObservationReader {
  readSubscriptionAccessObservation(
    accountId: string,
    at: Date,
  ): Promise<SubscriptionAccessObservation | null>;
}

export interface SubscriptionAccessResolverPort {
  resolve(accountId: string, at: Date): Promise<SubscriptionAccessResult>;
}

export class SubscriptionAccessResolver {
  constructor(private readonly reader: SubscriptionAccessObservationReader) {}

  async resolve(
    accountId: string,
    at: Date,
  ): Promise<SubscriptionAccessResult> {
    const observation = await this.reader.readSubscriptionAccessObservation(
      accountId,
      at,
    );
    if (!observation) return { kind: "ACCOUNT_NOT_FOUND" };
    return resolveSubscriptionAccess(
      observation.accountStatus,
      observation.subscription,
      at,
    );
  }
}

export class SubscriptionPlanRevisionBindingAdapter {
  constructor(
    private readonly accessResolver: SubscriptionAccessResolverPort,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async resolve(accountId: string): Promise<{
    planRevisionId: string;
    source: "ELIGIBLE_SUBSCRIPTION";
  } | null> {
    const result = await this.accessResolver.resolve(accountId, this.now());
    return result.kind === "ELIGIBLE"
      ? {
          planRevisionId: result.planRevisionId,
          source: "ELIGIBLE_SUBSCRIPTION",
        }
      : null;
  }
}

export type AccountPlanRevisionBindingPortCompatible = {
  resolve(
    accountId: string,
  ): Promise<{ planRevisionId: string; source: string } | null>;
};

export const SubscriptionBindingAdapter =
  SubscriptionPlanRevisionBindingAdapter;

export interface SubscriptionCommandRepository {
  grantSubscription(
    command: GrantSubscriptionCommand,
    context: SubscriptionMutationContext,
  ): Promise<SubscriptionCommandResult>;
  extendSubscription(
    command: ExtendSubscriptionCommand,
    context: SubscriptionMutationContext,
  ): Promise<SubscriptionCommandResult>;
  suspendSubscription(
    command: SuspendSubscriptionCommand,
    context: SubscriptionMutationContext,
  ): Promise<SubscriptionCommandResult>;
  restoreSubscription(
    command: RestoreSubscriptionCommand,
    context: SubscriptionMutationContext,
  ): Promise<SubscriptionCommandResult>;
}
