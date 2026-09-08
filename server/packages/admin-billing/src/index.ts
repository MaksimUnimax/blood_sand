import { AdminReasonV1Schema, type AdminReasonV1 } from "@product/admin-ops";
import type { AdminPermission } from "@product/admin-auth";
import {
  type SubscriptionCommandResult,
  type SubscriptionSnapshot,
} from "@product/subscriptions";
import { z } from "zod";

export { AdminReasonV1Schema };
export type { AdminReasonV1 };

export const AdminBillingLimitSchema = z.number().int().min(1).max(100);
export const AdminBillingCursorSchema = z.uuid();

export type AdminPayment = {
  id: string;
  subscriptionId: string | null;
  state:
    | "PENDING"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED"
    | "CHARGEBACK";
  priceRevisionId: string;
  amountMinor: number;
  currency: string;
  plan: {
    planRevisionId: string;
    planCode: string;
    planRevision: number;
    displayName: string;
  } | null;
  billingInterval: {
    unit: "DAY" | "MONTH" | "YEAR";
    count: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt: Date | null;
};

export type AdminBillingEvent = {
  id: string;
  source: "WEBHOOK" | "RECONCILIATION";
  eventType: string;
  processingState: "VERIFIED" | "APPLIED" | "IGNORED" | "FAILED";
  paymentId: string | null;
  subscriptionId: string | null;
  failureCode: string | null;
  receivedAt: Date;
  verifiedAt: Date;
  processedAt: Date | null;
  createdAt: Date;
};

export type AdminReconciliationJob = {
  paymentId: string;
  state: "READY" | "LEASED" | "SETTLED" | "BLOCKED";
  nextAttemptAt: Date | null;
  leaseUntil: Date | null;
  attemptCount: number;
  lastResultCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminPage<T> = { items: T[]; nextCursor?: string };
export type AdminBillingReadFailure =
  | { kind: "ACCOUNT_NOT_FOUND" }
  | { kind: "INVALID_CURSOR" }
  | { kind: "SERVICE_UNAVAILABLE" };

export interface AdminBillingReadRepository {
  listPayments(input: {
    accountId: string;
    limit: number;
    cursor?: string;
  }): Promise<AdminPage<AdminPayment> | AdminBillingReadFailure>;
  listEvents(input: {
    accountId: string;
    limit: number;
    cursor?: string;
  }): Promise<AdminPage<AdminBillingEvent> | AdminBillingReadFailure>;
  listReconciliationJobs(input: {
    accountId: string;
    limit: number;
    cursor?: string;
  }): Promise<AdminPage<AdminReconciliationJob> | AdminBillingReadFailure>;
}

export type AdminSubscriptionCommandInput = {
  accountId: string;
  actorId: string;
  correlationId: string;
  reason: AdminReasonV1;
  operation: "GRANT" | "EXTEND" | "SUSPEND" | "RESTORE";
  planRevisionId: string;
  currentPeriodEnd: Date;
  subscriptionId: string;
  expectedStateRevision: number;
  newCurrentPeriodEnd: Date;
};

export type AdminSubscriptionCommandResult =
  | SubscriptionCommandResult
  | { kind: "ADMIN_FORBIDDEN" | "ADMIN_RESOURCE_NOT_FOUND" };

export interface AdminSubscriptionCommandPort {
  grant(
    input: Omit<AdminSubscriptionCommandInput, "operation">,
  ): Promise<AdminSubscriptionCommandResult>;
  extend(
    input: Omit<AdminSubscriptionCommandInput, "operation">,
  ): Promise<AdminSubscriptionCommandResult>;
  suspend(
    input: Omit<AdminSubscriptionCommandInput, "operation">,
  ): Promise<AdminSubscriptionCommandResult>;
  restore(
    input: Omit<AdminSubscriptionCommandInput, "operation">,
  ): Promise<AdminSubscriptionCommandResult>;
}

export type AdminBillingServiceResult<T> =
  | { kind: "OK"; value: T }
  | { kind: "ACCOUNT_NOT_FOUND" | "INVALID_CURSOR" | "SERVICE_UNAVAILABLE" };

export class AdminBillingService {
  public constructor(
    private readonly commands: AdminSubscriptionCommandPort,
    private readonly reads: AdminBillingReadRepository,
  ) {}

  private limit(value?: number): number | undefined {
    const result = value ?? 50;
    return Number.isInteger(result) && result >= 1 && result <= 100
      ? result
      : undefined;
  }

  listPayments(input: { accountId: string; limit?: number; cursor?: string }) {
    const limit = this.limit(input.limit);
    return limit
      ? this.reads.listPayments({ ...input, limit })
      : Promise.resolve({ kind: "INVALID_CURSOR" as const });
  }
  listEvents(input: { accountId: string; limit?: number; cursor?: string }) {
    const limit = this.limit(input.limit);
    return limit
      ? this.reads.listEvents({ ...input, limit })
      : Promise.resolve({ kind: "INVALID_CURSOR" as const });
  }
  listReconciliationJobs(input: {
    accountId: string;
    limit?: number;
    cursor?: string;
  }) {
    const limit = this.limit(input.limit);
    return limit
      ? this.reads.listReconciliationJobs({ ...input, limit })
      : Promise.resolve({ kind: "INVALID_CURSOR" as const });
  }

  grant(input: Omit<AdminSubscriptionCommandInput, "operation">) {
    return this.commands.grant(input);
  }
  extend(input: Omit<AdminSubscriptionCommandInput, "operation">) {
    return this.commands.extend(input);
  }
  suspend(input: Omit<AdminSubscriptionCommandInput, "operation">) {
    return this.commands.suspend(input);
  }
  restore(input: Omit<AdminSubscriptionCommandInput, "operation">) {
    return this.commands.restore(input);
  }
}

export const ADMIN_BILLING_PERMISSIONS = {
  payments: "billing.read",
  events: "billing.read",
  reconciliationJobs: "billing.read",
  grant: "subscription.grant",
  extend: "subscription.extend",
  suspend: "subscription.suspend",
  restore: "subscription.restore",
} as const satisfies Record<string, AdminPermission>;

export type SafeAdminSubscription = Pick<
  SubscriptionSnapshot,
  | "id"
  | "accountId"
  | "state"
  | "stateRevision"
  | "currentPlanRevisionId"
  | "boundPriceRevisionId"
  | "currentPeriodStart"
  | "currentPeriodEnd"
  | "graceUntil"
  | "cancelAtPeriodEnd"
  | "suspendedAt"
  | "updatedAt"
>;
