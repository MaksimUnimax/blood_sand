import { describe, expect, it } from "vitest";
import {
  ExtendSubscriptionCommandSchema,
  GrantSubscriptionCommandSchema,
  RestoreSubscriptionCommandSchema,
  SubscriptionMutationContextSchema,
  SubscriptionPlanRevisionBindingAdapter,
  SubscriptionStateSchema,
  SuspendSubscriptionCommandSchema,
  resolveSubscriptionAccess,
  validateSubscriptionStateTransition,
  type SubscriptionSnapshot,
} from "./index.js";

const id = "11111111-1111-4111-8111-111111111111";
const end = new Date("2030-01-01T00:00:00.000Z");
const base: SubscriptionSnapshot = {
  id,
  accountId: "00000000-0000-0000-0000-000000000002",
  state: "ACTIVE",
  stateRevision: 2,
  currentPlanRevisionId: "00000000-0000-0000-0000-000000000003",
  boundPriceRevisionId: null,
  startedAt: new Date("2029-01-01T00:00:00.000Z"),
  currentPeriodStart: new Date("2029-01-01T00:00:00.000Z"),
  currentPeriodEnd: end,
  graceUntil: null,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  suspendedAt: null,
  createdAt: new Date("2029-01-01T00:00:00.000Z"),
  updatedAt: new Date("2029-01-01T00:00:00.000Z"),
};

describe("P5.2 subscription domain", () => {
  it.each([
    [null, "TRIAL"],
    [null, "ACTIVE"],
    ["TRIAL", "ACTIVE"],
    ["TRIAL", "EXPIRED"],
    ["TRIAL", "SUSPENDED"],
    ["ACTIVE", "GRACE"],
    ["ACTIVE", "PAST_DUE"],
    ["ACTIVE", "CANCELED"],
    ["ACTIVE", "EXPIRED"],
    ["ACTIVE", "SUSPENDED"],
    ["GRACE", "ACTIVE"],
    ["GRACE", "PAST_DUE"],
    ["PAST_DUE", "GRACE"],
    ["CANCELED", "ACTIVE"],
    ["SUSPENDED", "TRIAL"],
    ["SUSPENDED", "CANCELED"],
  ] as const)("accepts %s -> %s", (from, to) => {
    expect(validateSubscriptionStateTransition(from, to)).toBeNull();
  });

  it.each([
    [null, "GRACE"],
    [null, "EXPIRED"],
    ["TRIAL", "TRIAL"],
    ["ACTIVE", "ACTIVE"],
    ["ACTIVE", "TRIAL"],
    ["CANCELED", "GRACE"],
    ["EXPIRED", "ACTIVE"],
    ["EXPIRED", "SUSPENDED"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(validateSubscriptionStateTransition(from, to)).toBe(
      "SUBSCRIPTION_STATE_TRANSITION_INVALID",
    );
  });

  it("uses strict command schemas and positive safe revisions", () => {
    expect(() =>
      GrantSubscriptionCommandSchema.parse({
        accountId: id,
        planRevisionId: id,
        currentPeriodEnd: end,
        extra: true,
      }),
    ).toThrow();
    expect(() =>
      ExtendSubscriptionCommandSchema.parse({
        subscriptionId: id,
        expectedStateRevision: 0,
        newCurrentPeriodEnd: end,
      }),
    ).toThrow();
    expect(() =>
      SuspendSubscriptionCommandSchema.parse({
        subscriptionId: id,
        expectedStateRevision: 1.5,
      }),
    ).toThrow();
    expect(() =>
      RestoreSubscriptionCommandSchema.parse({
        subscriptionId: id,
        expectedStateRevision: Number.MAX_SAFE_INTEGER,
      }),
    ).not.toThrow();
  });

  it("reuses the strict mutation context authority", () => {
    expect(() =>
      SubscriptionMutationContextSchema.parse({
        actorType: "SYSTEM",
        correlationId: "c",
        reason: "r",
        extra: 1,
      }),
    ).toThrow();
    expect(
      SubscriptionMutationContextSchema.parse({
        actorType: "SYSTEM",
        correlationId: "c",
        reason: "r",
      }).reason,
    ).toBe("r");
  });

  it("rejects invalid states", () =>
    expect(() => SubscriptionStateSchema.parse("PAID")).toThrow());

  it.each([
    ["ACTIVE", "PERIOD_ENDED"],
    ["TRIAL", "PERIOD_ENDED"],
    ["GRACE", "GRACE_ENDED"],
    ["PAST_DUE", "PAST_DUE"],
    ["CANCELED", "CANCELED"],
    ["SUSPENDED", "SUBSCRIPTION_SUSPENDED"],
    ["EXPIRED", "SUBSCRIPTION_EXPIRED"],
  ] as const)("fails closed for %s", (state, reason) => {
    const at = state === "GRACE" ? new Date("2030-01-02") : end;
    const value = {
      ...base,
      state,
      graceUntil: state === "GRACE" ? new Date("2030-01-02") : null,
      cancelAtPeriodEnd: state === "CANCELED",
    } as SubscriptionSnapshot;
    expect(resolveSubscriptionAccess("ACTIVE", value, at)).toEqual({
      kind: "INELIGIBLE",
      reason,
    });
  });

  it("applies account suspension before subscription state", () => {
    expect(
      resolveSubscriptionAccess("SUSPENDED", base, new Date("2029-01-02")),
    ).toEqual({ kind: "INELIGIBLE", reason: "ACCOUNT_SUSPENDED" });
  });

  it("uses half-open period and grace boundaries", () => {
    expect(
      resolveSubscriptionAccess("ACTIVE", base, new Date("2029-12-31")),
    ).toMatchObject({
      kind: "ELIGIBLE",
      planRevisionId: base.currentPlanRevisionId,
    });
    expect(resolveSubscriptionAccess("ACTIVE", base, end)).toEqual({
      kind: "INELIGIBLE",
      reason: "PERIOD_ENDED",
    });
    const grace = {
      ...base,
      state: "GRACE" as const,
      graceUntil: new Date("2030-02-01"),
    };
    expect(
      resolveSubscriptionAccess("ACTIVE", grace, new Date("2030-02-01")),
    ).toEqual({ kind: "INELIGIBLE", reason: "GRACE_ENDED" });
  });

  it("requires a valid grace window", () => {
    expect(
      resolveSubscriptionAccess(
        "ACTIVE",
        { ...base, state: "GRACE", graceUntil: null },
        new Date("2029-01-02"),
      ),
    ).toEqual({ kind: "INELIGIBLE", reason: "SUBSCRIPTION_CORRUPTED" });
  });

  it("allows only remaining cancel-at-period-end access", () => {
    const canceled = {
      ...base,
      state: "CANCELED" as const,
      cancelAtPeriodEnd: true,
    };
    expect(
      resolveSubscriptionAccess("ACTIVE", canceled, new Date("2029-01-02")),
    ).toMatchObject({ kind: "ELIGIBLE" });
    expect(resolveSubscriptionAccess("ACTIVE", canceled, end)).toEqual({
      kind: "INELIGIBLE",
      reason: "CANCELED",
    });
    expect(
      resolveSubscriptionAccess(
        "ACTIVE",
        { ...canceled, cancelAtPeriodEnd: false },
        new Date("2029-01-02"),
      ),
    ).toEqual({ kind: "INELIGIBLE", reason: "CANCELED" });
  });

  it("returns safe exact binding and omits stateReason", async () => {
    const resolver = {
      resolve: async () => ({
        kind: "ELIGIBLE" as const,
        subscriptionId: id,
        state: "ACTIVE" as const,
        stateRevision: 1,
        planRevisionId: base.currentPlanRevisionId,
        boundPriceRevisionId: null,
        currentPeriodEnd: end,
        graceUntil: null,
      }),
    };
    const adapter = new SubscriptionPlanRevisionBindingAdapter(
      resolver as never,
    );
    await expect(adapter.resolve(id)).resolves.toEqual({
      planRevisionId: base.currentPlanRevisionId,
      source: "ELIGIBLE_SUBSCRIPTION",
    });
  });
});
