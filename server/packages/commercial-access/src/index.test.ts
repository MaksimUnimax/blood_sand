import { describe, expect, it } from "vitest";
import type {
  CommercialEntitlementResolution,
  CommercialEntitlementsResolutionResult,
} from "@product/entitlements";
import type {
  SubscriptionAccessResult,
  SubscriptionSnapshot,
} from "@product/subscriptions";
import {
  CommercialAccessService,
  CommercialPortalService,
  type CommercialPortalRepository,
  type PortalPaymentRecord,
  type PortalSubscriptionRecord,
} from "./index.js";

const accountId = "00000000-0000-4000-8000-000000000001";
const subscriptionId = "00000000-0000-4000-8000-000000000002";
const planRevisionId = "00000000-0000-4000-8000-000000000003";
const priceRevisionId = "00000000-0000-4000-8000-000000000004";
const at = new Date("2030-01-10T00:00:00.000Z");
const periodEnd = new Date("2030-02-10T00:00:00.000Z");

function subscription(
  state: SubscriptionSnapshot["state"] = "ACTIVE",
): SubscriptionSnapshot {
  return {
    id: subscriptionId,
    accountId,
    state,
    stateRevision: 3,
    currentPlanRevisionId: planRevisionId,
    boundPriceRevisionId: priceRevisionId,
    startedAt: new Date("2030-01-01T00:00:00.000Z"),
    currentPeriodStart: new Date("2030-01-01T00:00:00.000Z"),
    currentPeriodEnd: periodEnd,
    graceUntil: new Date("2030-02-15T00:00:00.000Z"),
    cancelAtPeriodEnd: state === "CANCELED",
    canceledAt: null,
    suspendedAt: null,
    createdAt: new Date("2030-01-01T00:00:00.000Z"),
    updatedAt: at,
  };
}

function eligible(
  state: "TRIAL" | "ACTIVE" | "GRACE" | "CANCELED" = "ACTIVE",
): SubscriptionAccessResult {
  return {
    kind: "ELIGIBLE",
    subscriptionId,
    state,
    stateRevision: 3,
    planRevisionId,
    boundPriceRevisionId: priceRevisionId,
    currentPeriodEnd: periodEnd,
    graceUntil:
      state === "GRACE"
        ? new Date("2030-02-15T00:00:00.000Z")
        : subscription(state).graceUntil,
  };
}

function resolution(
  key: string,
  value:
    | { kind: "BOOLEAN"; value: boolean }
    | { kind: "INTEGER"; value: number }
    | null,
): CommercialEntitlementResolution {
  return {
    entitlementKey: key,
    definition: {
      valueType:
        value?.kind ?? (key === "device.max_active" ? "INTEGER" : "BOOLEAN"),
      securityClassification:
        key === "device.max_active" ? "LIMIT" : "CAPABILITY",
      deprecatedAt: null,
    },
    plan: {
      planId: "00000000-0000-4000-8000-000000000005",
      planCode: "basic",
      planRevisionId,
      planRevisionNumber: 2,
      baseValue: value,
    },
    selectedOverride: null,
    effectiveValue: value,
    source: value ? "PLAN_REVISION" : "NONE",
    reason: value ? "PLAN_VALUE" : "UNSET",
  };
}

function serviceFor(
  access: SubscriptionAccessResult,
  values: CommercialEntitlementResolution[] = [
    resolution("source.ozon", { kind: "BOOLEAN", value: false }),
    resolution("device.max_active", { kind: "INTEGER", value: 0 }),
    resolution("unset.feature", null),
  ],
): CommercialAccessService {
  const observationSubscription =
    access.kind === "ELIGIBLE" ? subscription(access.state) : null;
  return new CommercialAccessService({
    accessResolver: { resolve: async () => access },
    currentSubscriptionReader: {
      getCurrentSubscription: async () => observationSubscription,
    },
    entitlementResolver: {
      resolveCommercialEntitlement: async () => ({
        kind: "OK",
        value: values[0]!,
      }),
      resolveCommercialEntitlements:
        async (): Promise<CommercialEntitlementsResolutionResult> => ({
          kind: "OK",
          value: values,
        }),
    },
  });
}

const ineligibleReasons: Array<
  Extract<SubscriptionAccessResult, { kind: "INELIGIBLE" }>["reason"]
> = [
  "ACCOUNT_SUSPENDED",
  "NO_CURRENT_SUBSCRIPTION",
  "PERIOD_ENDED",
  "GRACE_ENDED",
  "PAST_DUE",
  "CANCELED",
  "SUBSCRIPTION_SUSPENDED",
  "SUBSCRIPTION_EXPIRED",
  "SUBSCRIPTION_CORRUPTED",
];

describe("P5.6 commercial access projection", () => {
  it.each([
    ["trial", "TRIAL"],
    ["active", "ACTIVE"],
    ["grace", "GRACE"],
    ["canceled", "CANCELED"],
  ] as const)("projects eligible %s state", async (_name, state) => {
    const result = await serviceFor(eligible(state)).resolve(accountId, at);
    expect(result.kind).toBe("OK");
    if (result.kind === "OK") {
      expect(result.value.planRevisionId).toBe(planRevisionId);
      expect(result.value.entitlements).toEqual({
        "source.ozon": false,
        "device.max_active": 0,
      });
      expect(result.value.accessUntil).toBeInstanceOf(Date);
      expect(result.value.currentSubscription?.state).toBe(state);
    }
  });

  it.each(ineligibleReasons)(
    "empties entitlements for ineligible %s",
    async (reason) => {
      const result = await serviceFor({ kind: "INELIGIBLE", reason }).resolve(
        accountId,
        at,
      );
      expect(result).toEqual({
        kind: "OK",
        value: expect.objectContaining({
          planRevisionId: null,
          entitlements: {},
          accessUntil: null,
        }),
      });
    },
  );

  it("preserves account not found as a typed result", async () => {
    expect(
      await serviceFor({ kind: "ACCOUNT_NOT_FOUND" }).resolve(accountId, at),
    ).toEqual({ kind: "ACCOUNT_NOT_FOUND" });
  });

  it("maps false and zero without truthiness loss", async () => {
    const result = await serviceFor(eligible(), [
      resolution("a", { kind: "BOOLEAN", value: false }),
      resolution("b", { kind: "INTEGER", value: 0 }),
    ]).resolve(accountId, at);
    expect(result.kind === "OK" && result.value.entitlements).toEqual({
      a: false,
      b: 0,
    });
  });

  it("omits unset values", async () => {
    const result = await serviceFor(eligible(), [
      resolution("unset", null),
    ]).resolve(accountId, at);
    expect(result.kind === "OK" && result.value.entitlements).toEqual({});
  });

  it("uses one explicit timestamp for entitlement resolution", async () => {
    let observed: Date | undefined;
    const service = new CommercialAccessService({
      accessResolver: {
        resolve: async (_id, value) => {
          observed = value;
          return eligible();
        },
      },
      currentSubscriptionReader: {
        getCurrentSubscription: async () => subscription(),
      },
      entitlementResolver: {
        resolveCommercialEntitlement: async () => ({
          kind: "OK",
          value: resolution("x", { kind: "BOOLEAN", value: true }),
        }),
        resolveCommercialEntitlements: async (input) => {
          expect(input.at.getTime()).toBe(at.getTime());
          return {
            kind: "OK",
            value: [resolution("x", { kind: "BOOLEAN", value: true })],
          };
        },
      },
    });
    await service.resolve(accountId, at);
    expect(observed?.getTime()).toBe(at.getTime());
  });

  it("fails closed on binding parity corruption", async () => {
    let calls = 0;
    const service = new CommercialAccessService({
      accessResolver: {
        resolve: async () => {
          calls++;
          return calls === 1
            ? eligible()
            : { kind: "INELIGIBLE", reason: "PAST_DUE" };
        },
      },
      currentSubscriptionReader: {
        getCurrentSubscription: async () => subscription(),
      },
      entitlementResolver: {
        resolveCommercialEntitlement: async () => ({
          kind: "OK",
          value: resolution("x", { kind: "BOOLEAN", value: true }),
        }),
        resolveCommercialEntitlements: async () => ({ kind: "OK", value: [] }),
      },
    });
    expect(await service.resolve(accountId, at)).toEqual({ kind: "CORRUPTED" });
  });

  it.each([
    ["trial", "TRIAL"],
    ["active", "ACTIVE"],
    ["grace", "GRACE"],
    ["canceled", "CANCELED"],
  ] as const)("device admission accepts %s", async (_name, state) => {
    const result = await serviceFor(eligible(state), [
      resolution("device.max_active", { kind: "INTEGER", value: 4 }),
    ]).resolveDeviceAdmission(accountId, at);
    expect(result).toEqual({
      kind: "ELIGIBLE",
      maxActive: 4,
      source: "COMMERCIAL_PLAN_REVISION",
    });
  });

  it.each(ineligibleReasons)("device admission denies %s", async (reason) => {
    expect(
      await serviceFor({ kind: "INELIGIBLE", reason }).resolveDeviceAdmission(
        accountId,
        at,
      ),
    ).toEqual({ kind: "INELIGIBLE", reason });
  });

  it("device admission preserves missing accounts", async () => {
    expect(
      await serviceFor({ kind: "ACCOUNT_NOT_FOUND" }).resolveDeviceAdmission(
        accountId,
        at,
      ),
    ).toEqual({ kind: "ACCOUNT_NOT_FOUND" });
  });

  it.each([
    ["negative", -1],
    ["unsafe", Number.MAX_SAFE_INTEGER + 1],
  ] as const)("rejects %s device limits", async (_name, value) => {
    const result = await serviceFor(eligible(), [
      resolution("device.max_active", { kind: "INTEGER", value }),
    ]).resolveDeviceAdmission(accountId, at);
    expect(result.kind).toBe("CORRUPTED");
  });

  it("rejects a boolean device limit", async () => {
    expect(
      (
        await serviceFor(eligible(), [
          resolution("device.max_active", { kind: "BOOLEAN", value: true }),
        ]).resolveDeviceAdmission(accountId, at)
      ).kind,
    ).toBe("CORRUPTED");
  });

  it("rejects an unset device limit", async () => {
    expect(
      (
        await serviceFor(eligible(), [
          resolution("device.max_active", null),
        ]).resolveDeviceAdmission(accountId, at)
      ).kind,
    ).toBe("CORRUPTED");
  });
});

const portalSubscription: PortalSubscriptionRecord = {
  id: subscriptionId,
  accountId,
  state: "ACTIVE",
  stateRevision: 3,
  currentPeriodStart: new Date("2030-01-01T00:00:00.000Z"),
  currentPeriodEnd: periodEnd,
  graceUntil: null,
  cancelAtPeriodEnd: false,
  plan: {
    planRevisionId,
    planCode: "basic",
    planRevision: 2,
    displayName: "Basic",
  },
  price: {
    priceRevisionId,
    amountMinor: 1000,
    currency: "RUB",
    billingIntervalUnit: "MONTH",
    billingIntervalCount: 1,
  },
};
const payment: PortalPaymentRecord = {
  id: priceRevisionId,
  state: "SUCCEEDED",
  amountMinor: 1000,
  currency: "RUB",
  priceRevisionId,
  plan: { planCode: "basic", planRevision: 2, displayName: "Basic" },
  billingInterval: { unit: "MONTH", count: 1 },
  createdAt: at,
  confirmedAt: at,
  subscriptionLinked: true,
};

function portalService(
  owner = true,
  record: PortalSubscriptionRecord | null = portalSubscription,
) {
  const repository: CommercialPortalRepository = {
    isOwner: async () => owner,
    readSubscription: async () => record,
    countActiveDevices: async () => 2,
    listPayments: async () => ({ kind: "OK", payments: [payment] }),
  };
  return new CommercialPortalService(
    repository,
    serviceFor(eligible(), [
      resolution("device.max_active", { kind: "INTEGER", value: 3 }),
    ]),
    () => at,
  );
}

describe("P5.6 portal-safe service", () => {
  it("requires owner scope", async () => {
    expect(
      (await portalService(false).readSubscription("user", accountId)).kind,
    ).toBe("ACCOUNT_FORBIDDEN");
  });
  it("returns the exact plan revision", async () => {
    const result = await portalService().readSubscription("user", accountId);
    expect(
      result.kind === "OK" && result.value.subscription?.plan.planRevisionId,
    ).toBe(planRevisionId);
  });
  it("returns the exact bound price", async () => {
    const result = await portalService().readSubscription("user", accountId);
    expect(
      result.kind === "OK" && result.value.subscription?.price?.priceRevisionId,
    ).toBe(priceRevisionId);
  });
  it("supports manual grants without price", async () => {
    const result = await portalService(true, {
      ...portalSubscription,
      price: null,
    }).readSubscription("user", accountId);
    expect(result.kind === "OK" && result.value.subscription?.price).toBeNull();
  });
  it("computes remaining allowance", async () => {
    const result = await portalService().readSubscription("user", accountId);
    expect(result.kind === "OK" && result.value.deviceAllowance).toEqual({
      maxActive: 3,
      activeCount: 2,
      remaining: 1,
      overLimit: false,
    });
  });
  it("returns safe purchase-unavailable status", async () => {
    const result = await portalService().readSubscription("user", accountId);
    expect(result.kind === "OK" && result.value.billing).toEqual({
      purchaseStatus: "UNAVAILABLE",
      reason: "PAYMENT_GO_LIVE_DEFERRED",
    });
  });
  it("returns safe payment history", async () => {
    const result = await portalService().listPayments("user", accountId, 50);
    expect(result).toEqual({ kind: "OK", payments: [payment] });
  });
  it("does not return payment history to another user", async () => {
    expect(
      (await portalService(false).listPayments("user", accountId, 50)).kind,
    ).toBe("ACCOUNT_FORBIDDEN");
  });
  it("shows over-limit without revoking devices", async () => {
    const repository: CommercialPortalRepository = {
      isOwner: async () => true,
      readSubscription: async () => portalSubscription,
      countActiveDevices: async () => 4,
      listPayments: async () => ({ kind: "OK", payments: [] }),
    };
    const result = await new CommercialPortalService(
      repository,
      serviceFor(eligible(), [
        resolution("device.max_active", { kind: "INTEGER", value: 3 }),
      ]),
      () => at,
    ).readSubscription("user", accountId);
    expect(result.kind === "OK" && result.value.deviceAllowance.overLimit).toBe(
      true,
    );
  });
});

describe("P5.6 boundary matrix", () => {
  it.each([
    ["trial", "TRIAL", "2030-02-10T00:00:00.000Z"],
    ["active", "ACTIVE", "2030-02-10T00:00:00.000Z"],
    ["grace", "GRACE", "2030-02-15T00:00:00.000Z"],
    ["canceled", "CANCELED", "2030-02-10T00:00:00.000Z"],
  ] as const)(
    "uses the timestamp-authoritative %s deadline",
    async (_name, state, deadline) => {
      const result = await serviceFor(eligible(state)).resolve(accountId, at);
      expect(
        result.kind === "OK" && result.value.accessUntil?.toISOString(),
      ).toBe(deadline);
    },
  );
  it.each([0, 1, 2, 3, 10, 100, 10_000])(
    "preserves safe commercial max-active value %i",
    async (maxActive) => {
      const result = await serviceFor(eligible(), [
        resolution("device.max_active", { kind: "INTEGER", value: maxActive }),
      ]).resolveDeviceAdmission(accountId, at);
      expect(result).toMatchObject({ kind: "ELIGIBLE", maxActive });
    },
  );
  it.each(["ACTIVE", "TRIAL", "GRACE", "CANCELED"] as const)(
    "retains state identity for portal %s",
    async (state) => {
      const result = await serviceFor(eligible(state)).resolve(accountId, at);
      expect(
        result.kind === "OK" && result.value.currentSubscription?.state,
      ).toBe(state);
    },
  );
  it.each([1, 50, 100])(
    "forwards bounded payment page size %i",
    async (limit) => {
      const result = await portalService().listPayments(
        "user",
        accountId,
        limit,
      );
      expect(result.kind).toBe("OK");
    },
  );
  it("does not invent a price for a manual grant", async () => {
    const result = await portalService(true, {
      ...portalSubscription,
      price: null,
    }).readSubscription("user", accountId);
    expect(result.kind === "OK" && result.value.subscription?.price).toBeNull();
  });
  it("keeps ineligible device allowance unbounded and non-fabricated", async () => {
    const repository: CommercialPortalRepository = {
      isOwner: async () => true,
      readSubscription: async () => null,
      countActiveDevices: async () => 7,
      listPayments: async () => ({ kind: "OK", payments: [] }),
    };
    const access = serviceFor({
      kind: "INELIGIBLE",
      reason: "NO_CURRENT_SUBSCRIPTION",
    });
    const result = await new CommercialPortalService(
      repository,
      access,
      () => at,
    ).readSubscription("user", accountId);
    expect(result.kind === "OK" && result.value.deviceAllowance).toEqual({
      maxActive: null,
      activeCount: 7,
      remaining: null,
      overLimit: false,
    });
  });
});
