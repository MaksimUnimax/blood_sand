import {
  BoundCommercialDeviceLimitResolver,
  DeviceMaxActiveAdapterError,
  type CommercialEntitlementResolver,
} from "@product/entitlements";
import {
  SubscriptionPlanRevisionBindingAdapter,
  type CurrentSubscriptionReader,
  type SubscriptionAccessResolverPort,
  type SubscriptionAccessResult,
  type SubscriptionSnapshot,
} from "@product/subscriptions";

export type SafeEntitlementMap = Record<string, boolean | number>;

export type CommercialAccessSnapshot = {
  accountId: string;
  currentSubscription: SubscriptionSnapshot | null;
  access: Extract<
    SubscriptionAccessResult,
    { kind: "ELIGIBLE" | "INELIGIBLE" }
  >;
  planRevisionId: string | null;
  entitlements: SafeEntitlementMap;
  accessUntil: Date | null;
};

export type CommercialAccessResolution =
  | { kind: "OK"; value: CommercialAccessSnapshot }
  | { kind: "ACCOUNT_NOT_FOUND" }
  | { kind: "CORRUPTED" };

export type CommercialDeviceAdmission =
  | { kind: "ELIGIBLE"; maxActive: number; source: "COMMERCIAL_PLAN_REVISION" }
  | {
      kind: "INELIGIBLE";
      reason: Extract<
        SubscriptionAccessResult,
        { kind: "INELIGIBLE" }
      >["reason"];
    }
  | { kind: "ACCOUNT_NOT_FOUND" }
  | { kind: "CORRUPTED" };

export type CommercialAccessDependencies = {
  accessResolver: SubscriptionAccessResolverPort;
  currentSubscriptionReader: CurrentSubscriptionReader;
  entitlementResolver: CommercialEntitlementResolver;
};

function accessUntil(
  access: Extract<SubscriptionAccessResult, { kind: "ELIGIBLE" }>,
): Date {
  return access.state === "GRACE"
    ? new Date(access.graceUntil!.getTime())
    : new Date(access.currentPeriodEnd.getTime());
}

function primitiveEntitlements(
  values: Awaited<
    ReturnType<CommercialEntitlementResolver["resolveCommercialEntitlements"]>
  >,
): SafeEntitlementMap | null {
  if (values.kind !== "OK") return null;
  const map: SafeEntitlementMap = {};
  for (const resolution of values.value) {
    const value = resolution.effectiveValue;
    if (!value) continue;
    if (value.kind === "BOOLEAN") map[resolution.entitlementKey] = value.value;
    else if (value.kind === "INTEGER") {
      if (!Number.isSafeInteger(value.value)) return null;
      map[resolution.entitlementKey] = value.value;
    } else return null;
  }
  return map;
}

function sameDate(left: Date | null, right: Date | null): boolean {
  return left?.getTime() === right?.getTime();
}

export class CommercialAccessService {
  private readonly dependencies: CommercialAccessDependencies;

  public constructor(dependencies: CommercialAccessDependencies) {
    this.dependencies = dependencies;
  }

  async resolve(
    accountId: string,
    at: Date,
  ): Promise<CommercialAccessResolution> {
    const access = await this.dependencies.accessResolver.resolve(
      accountId,
      at,
    );
    if (access.kind === "ACCOUNT_NOT_FOUND") return access;
    const currentSubscription =
      await this.dependencies.currentSubscriptionReader.getCurrentSubscription(
        accountId,
      );
    if (currentSubscription && currentSubscription.accountId !== accountId)
      return { kind: "CORRUPTED" };
    if (access.kind === "ELIGIBLE") {
      if (
        !currentSubscription ||
        currentSubscription.id !== access.subscriptionId ||
        currentSubscription.state !== access.state ||
        currentSubscription.stateRevision !== access.stateRevision ||
        currentSubscription.currentPlanRevisionId !== access.planRevisionId ||
        currentSubscription.boundPriceRevisionId !==
          access.boundPriceRevisionId ||
        !sameDate(
          currentSubscription.currentPeriodEnd,
          access.currentPeriodEnd,
        ) ||
        !sameDate(currentSubscription.graceUntil, access.graceUntil)
      )
        return { kind: "CORRUPTED" };
      const binding = new SubscriptionPlanRevisionBindingAdapter(
        this.dependencies.accessResolver,
        () => new Date(at.getTime()),
      );
      const bound = await binding.resolve(accountId);
      if (!bound || bound.planRevisionId !== access.planRevisionId)
        return { kind: "CORRUPTED" };
      const resolved =
        await this.dependencies.entitlementResolver.resolveCommercialEntitlements(
          {
            accountId,
            planRevisionId: access.planRevisionId,
            at: new Date(at.getTime()),
          },
        );
      const entitlements = primitiveEntitlements(resolved);
      if (!entitlements) return { kind: "CORRUPTED" };
      return {
        kind: "OK",
        value: {
          accountId,
          currentSubscription,
          access,
          planRevisionId: access.planRevisionId,
          entitlements,
          accessUntil: accessUntil(access),
        },
      };
    }
    return {
      kind: "OK",
      value: {
        accountId,
        currentSubscription,
        access,
        planRevisionId: null,
        entitlements: {},
        accessUntil: null,
      },
    };
  }

  async resolveDeviceAdmission(
    accountId: string,
    at: Date,
  ): Promise<CommercialDeviceAdmission> {
    const access = await this.dependencies.accessResolver.resolve(
      accountId,
      at,
    );
    if (access.kind === "ACCOUNT_NOT_FOUND") return access;
    if (access.kind === "INELIGIBLE")
      return { kind: "INELIGIBLE", reason: access.reason };
    const binding = new SubscriptionPlanRevisionBindingAdapter(
      this.dependencies.accessResolver,
      () => new Date(at.getTime()),
    );
    const limited = new BoundCommercialDeviceLimitResolver(
      binding,
      this.dependencies.entitlementResolver,
      () => new Date(at.getTime()),
    );
    try {
      const result = await limited.resolve(accountId);
      if (result.source !== "COMMERCIAL_PLAN_REVISION")
        return { kind: "CORRUPTED" };
      if (result.maxActive < 0 || !Number.isSafeInteger(result.maxActive))
        return { kind: "CORRUPTED" };
      const parity = await binding.resolve(accountId);
      if (!parity || parity.planRevisionId !== access.planRevisionId)
        return { kind: "CORRUPTED" };
      return {
        kind: "ELIGIBLE",
        maxActive: result.maxActive,
        source: "COMMERCIAL_PLAN_REVISION",
      };
    } catch (error) {
      if (error instanceof DeviceMaxActiveAdapterError)
        return { kind: "CORRUPTED" };
      return { kind: "CORRUPTED" };
    }
  }
}

export type PortalSubscriptionRecord = {
  id: string;
  accountId: string;
  state: SubscriptionSnapshot["state"];
  stateRevision: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  graceUntil: Date | null;
  cancelAtPeriodEnd: boolean;
  plan: {
    planRevisionId: string;
    planCode: string;
    planRevision: number;
    displayName: string;
  };
  price: {
    priceRevisionId: string;
    amountMinor: number;
    currency: string;
    billingIntervalUnit: "DAY" | "MONTH" | "YEAR";
    billingIntervalCount: number;
  } | null;
};

export type PortalPaymentRecord = {
  id: string;
  state:
    | "PENDING"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED"
    | "CHARGEBACK";
  amountMinor: number;
  currency: string;
  priceRevisionId: string;
  plan: {
    planCode: string;
    planRevision: number;
    displayName: string;
  } | null;
  billingInterval: {
    unit: "DAY" | "MONTH" | "YEAR";
    count: number;
  } | null;
  createdAt: Date;
  confirmedAt: Date | null;
  subscriptionLinked: boolean;
};

export interface CommercialPortalRepository {
  isOwner(userId: string, accountId: string): Promise<boolean>;
  readSubscription(accountId: string): Promise<PortalSubscriptionRecord | null>;
  countActiveDevices(accountId: string): Promise<number>;
  listPayments(input: {
    accountId: string;
    limit: number;
    cursor?: string;
  }): Promise<
    | { kind: "OK"; payments: PortalPaymentRecord[]; nextCursor?: string }
    | { kind: "INVALID_CURSOR" }
  >;
}

export type PortalSubscriptionRead = {
  accountId: string;
  access: {
    status: "ELIGIBLE" | "INELIGIBLE";
    reason:
      | Extract<SubscriptionAccessResult, { kind: "INELIGIBLE" }>["reason"]
      | null;
  };
  subscription: PortalSubscriptionRecord | null;
  deviceAllowance: {
    maxActive: number | null;
    activeCount: number;
    remaining: number | null;
    overLimit: boolean;
  };
  billing: {
    purchaseStatus: "UNAVAILABLE";
    reason: "PAYMENT_GO_LIVE_DEFERRED";
  };
};

export class CommercialPortalService {
  public constructor(
    private readonly repository: CommercialPortalRepository,
    private readonly commercialAccess: CommercialAccessService,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async readSubscription(
    userId: string,
    accountId: string,
  ): Promise<
    | { kind: "OK"; value: PortalSubscriptionRead }
    | { kind: "ACCOUNT_FORBIDDEN" }
    | { kind: "ACCOUNT_NOT_FOUND" }
    | { kind: "SERVICE_UNAVAILABLE" }
  > {
    if (!(await this.repository.isOwner(userId, accountId)))
      return { kind: "ACCOUNT_FORBIDDEN" };
    const at = new Date(this.now().getTime());
    const access = await this.commercialAccess.resolve(accountId, at);
    if (access.kind === "ACCOUNT_NOT_FOUND") return access;
    if (access.kind === "CORRUPTED") return { kind: "SERVICE_UNAVAILABLE" };
    const record = await this.repository.readSubscription(accountId);
    if (record && access.value.currentSubscription) {
      if (
        record.id !== access.value.currentSubscription.id ||
        record.state !== access.value.currentSubscription.state ||
        record.stateRevision !==
          access.value.currentSubscription.stateRevision ||
        record.plan.planRevisionId !==
          access.value.currentSubscription.currentPlanRevisionId
      )
        return { kind: "SERVICE_UNAVAILABLE" };
    } else if (record || access.value.currentSubscription)
      return { kind: "SERVICE_UNAVAILABLE" };
    let allowance = { maxActive: null as number | null };
    const activeCount = await this.repository.countActiveDevices(accountId);
    if (access.value.access.kind === "ELIGIBLE") {
      const admission = await this.commercialAccess.resolveDeviceAdmission(
        accountId,
        at,
      );
      if (admission.kind === "CORRUPTED" || admission.kind !== "ELIGIBLE")
        return { kind: "SERVICE_UNAVAILABLE" };
      allowance = { maxActive: admission.maxActive };
    }
    return {
      kind: "OK",
      value: {
        accountId,
        access: {
          status:
            access.value.access.kind === "ELIGIBLE" ? "ELIGIBLE" : "INELIGIBLE",
          reason:
            access.value.access.kind === "INELIGIBLE"
              ? access.value.access.reason
              : null,
        },
        subscription: record,
        deviceAllowance: {
          maxActive: allowance.maxActive,
          activeCount,
          remaining:
            allowance.maxActive === null
              ? null
              : Math.max(0, allowance.maxActive - activeCount),
          overLimit:
            allowance.maxActive !== null && activeCount > allowance.maxActive,
        },
        billing: {
          purchaseStatus: "UNAVAILABLE",
          reason: "PAYMENT_GO_LIVE_DEFERRED",
        },
      },
    };
  }

  async listPayments(
    userId: string,
    accountId: string,
    limit: number,
    cursor?: string,
  ) {
    if (!(await this.repository.isOwner(userId, accountId)))
      return { kind: "ACCOUNT_FORBIDDEN" as const };
    return this.repository.listPayments({ accountId, limit, cursor });
  }
}
