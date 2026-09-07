import { describe, expect, it } from "vitest";
import {
  BillingPaymentStatusFoundSchema,
  BillingPaymentStatusResultSchema,
  BillingReconciliationJobStateSchema,
  createBillingReconciliationService,
  reconciliationEventIdentity,
  reconciliationPayloadSha256,
  reconciliationRetryAt,
  type BillingReconciliationClaim,
} from "./index.js";

const at = new Date("2026-09-07T12:00:00.000Z");
const claim: BillingReconciliationClaim = {
  paymentId: "11111111-1111-4111-8111-111111111111",
  provider: "simulator",
  providerPaymentId: "sim_payment_1",
  accountId: "22222222-2222-4222-8222-222222222222",
  priceRevisionId: "33333333-3333-4333-8333-333333333333",
  amountMinor: 1900,
  currency: "RUB",
  paymentState: "PENDING",
  createdAt: new Date("2026-09-07T11:00:00.000Z"),
  attemptCount: 1,
  leaseToken: "44444444-4444-4444-8444-444444444444",
};
const found = {
  kind: "FOUND" as const,
  state: "SUCCEEDED" as const,
  amountMinor: 1900,
  currency: "RUB",
  statusAt: at,
};

describe("P5.5 reconciliation contracts", () => {
  it("accepts every durable job state", () => {
    for (const value of ["READY", "LEASED", "SETTLED", "BLOCKED"])
      expect(BillingReconciliationJobStateSchema.parse(value)).toBe(value);
  });
  it("rejects unknown durable job state", () => {
    expect(
      BillingReconciliationJobStateSchema.safeParse("RUNNING").success,
    ).toBe(false);
  });
  it("accepts terminal status snapshot", () => {
    expect(BillingPaymentStatusFoundSchema.parse(found).state).toBe(
      "SUCCEEDED",
    );
  });
  it("accepts pending status snapshot", () => {
    expect(
      BillingPaymentStatusResultSchema.parse({ ...found, state: "PENDING" })
        .kind,
    ).toBe("FOUND");
  });
  it("accepts not found", () => {
    expect(
      BillingPaymentStatusResultSchema.parse({ kind: "NOT_FOUND" }),
    ).toEqual({ kind: "NOT_FOUND" });
  });
  it("accepts unavailable", () => {
    expect(
      BillingPaymentStatusResultSchema.parse({ kind: "UNAVAILABLE" }),
    ).toEqual({ kind: "UNAVAILABLE" });
  });
  it("rejects refunded provider state", () => {
    expect(
      BillingPaymentStatusResultSchema.safeParse({
        ...found,
        state: "REFUNDED",
      }).success,
    ).toBe(false);
  });
  it("rejects lowercase currency", () => {
    expect(
      BillingPaymentStatusResultSchema.safeParse({ ...found, currency: "rub" })
        .success,
    ).toBe(false);
  });
  it("rejects fractional amount", () => {
    expect(
      BillingPaymentStatusResultSchema.safeParse({ ...found, amountMinor: 1.1 })
        .success,
    ).toBe(false);
  });
  it("uses deterministic retry delay", () => {
    expect(reconciliationRetryAt(at).toISOString()).toBe(
      "2026-09-07T12:01:00.000Z",
    );
  });
  it("allows injected retry delay", () => {
    expect(reconciliationRetryAt(at, 5_000).getTime()).toBe(
      at.getTime() + 5_000,
    );
  });
  it("rejects negative retry delay", () => {
    expect(() => reconciliationRetryAt(at, -1)).toThrow("INVALID_RETRY_DELAY");
  });
  it("payload hash is stable", () => {
    const a = reconciliationPayloadSha256({
      paymentId: claim.paymentId,
      provider: claim.provider,
      providerPaymentId: claim.providerPaymentId,
      state: found.state,
      amountMinor: found.amountMinor,
      currency: found.currency,
      statusAt: at,
    });
    expect(a).toBe(
      reconciliationPayloadSha256({
        paymentId: claim.paymentId,
        provider: claim.provider,
        providerPaymentId: claim.providerPaymentId,
        state: found.state,
        amountMinor: found.amountMinor,
        currency: found.currency,
        statusAt: at,
      }),
    );
  });
  it("payload hash changes with amount", () => {
    const a = reconciliationPayloadSha256({
      paymentId: claim.paymentId,
      provider: claim.provider,
      providerPaymentId: claim.providerPaymentId,
      state: found.state,
      amountMinor: found.amountMinor,
      currency: found.currency,
      statusAt: at,
    });
    const b = reconciliationPayloadSha256({
      paymentId: claim.paymentId,
      provider: claim.provider,
      providerPaymentId: claim.providerPaymentId,
      state: found.state,
      amountMinor: 1901,
      currency: found.currency,
      statusAt: at,
    });
    expect(a).not.toBe(b);
  });
  it("identity has required namespace", () => {
    expect(
      reconciliationEventIdentity({
        paymentId: claim.paymentId,
        attemptCount: 1,
        state: found.state,
        statusAt: at,
        normalizedPayloadSha256: "a".repeat(64),
      }),
    ).toMatch(/^recon_v1_[0-9a-f]{64}$/);
  });
  it("identity excludes provider payment id", () => {
    const common = {
      paymentId: claim.paymentId,
      attemptCount: 1,
      state: found.state,
      statusAt: at,
      normalizedPayloadSha256: "a".repeat(64),
    };
    expect(reconciliationEventIdentity(common)).not.toContain(
      claim.providerPaymentId,
    );
  });
  it("identity changes by attempt", () => {
    const base = {
      paymentId: claim.paymentId,
      state: found.state,
      statusAt: at,
      normalizedPayloadSha256: "a".repeat(64),
    };
    expect(reconciliationEventIdentity({ ...base, attemptCount: 1 })).not.toBe(
      reconciliationEventIdentity({ ...base, attemptCount: 2 }),
    );
  });
  it("identity changes by terminal state", () => {
    const base = {
      paymentId: claim.paymentId,
      attemptCount: 1,
      statusAt: at,
      normalizedPayloadSha256: "a".repeat(64),
    };
    expect(
      reconciliationEventIdentity({ ...base, state: "SUCCEEDED" }),
    ).not.toBe(reconciliationEventIdentity({ ...base, state: "FAILED" }));
  });
  it("identity changes by status time", () => {
    const base = {
      paymentId: claim.paymentId,
      attemptCount: 1,
      state: found.state,
      normalizedPayloadSha256: "a".repeat(64),
    };
    expect(reconciliationEventIdentity({ ...base, statusAt: at })).not.toBe(
      reconciliationEventIdentity({
        ...base,
        statusAt: new Date(at.getTime() + 1),
      }),
    );
  });
  it("maps unavailable to retry", async () => {
    let call = "";
    const service = createBillingReconciliationService({
      statusPort: {
        providerKey: "simulator",
        fetchPaymentStatus: async () => ({ kind: "UNAVAILABLE" as const }),
      },
      repository: {
        claimDue: async () => [],
        reschedule: async (v) => {
          call = v.code;
          return { kind: "RESCHEDULED", code: v.code };
        },
        applyStatus: async () => ({
          kind: "APPLIED",
          paymentId: claim.paymentId,
        }),
        blockUnsupported: async () => ({
          kind: "BLOCKED",
          paymentId: claim.paymentId,
        }),
      },
      now: () => at,
    });
    await service.processClaim(claim, "c");
    expect(call).toBe("PROVIDER_UNAVAILABLE");
  });
  it("maps not found to retry", async () => {
    let call = "";
    const service = createBillingReconciliationService({
      statusPort: {
        providerKey: "simulator",
        fetchPaymentStatus: async () => ({ kind: "NOT_FOUND" as const }),
      },
      repository: {
        claimDue: async () => [],
        reschedule: async (v) => {
          call = v.code;
          return { kind: "RESCHEDULED", code: v.code };
        },
        applyStatus: async () => ({
          kind: "APPLIED",
          paymentId: claim.paymentId,
        }),
        blockUnsupported: async () => ({
          kind: "BLOCKED",
          paymentId: claim.paymentId,
        }),
      },
      now: () => at,
    });
    await service.processClaim(claim, "c");
    expect(call).toBe("PROVIDER_NOT_FOUND");
  });
  it("maps pending to retry", async () => {
    let call = "";
    const service = createBillingReconciliationService({
      statusPort: {
        providerKey: "simulator",
        fetchPaymentStatus: async () => ({
          kind: "FOUND" as const,
          state: "PENDING" as const,
          amountMinor: 1900,
          currency: "RUB",
          statusAt: at,
        }),
      },
      repository: {
        claimDue: async () => [],
        reschedule: async (v) => {
          call = v.code;
          return { kind: "RESCHEDULED", code: v.code };
        },
        applyStatus: async () => ({
          kind: "APPLIED",
          paymentId: claim.paymentId,
        }),
        blockUnsupported: async () => ({
          kind: "BLOCKED",
          paymentId: claim.paymentId,
        }),
      },
      now: () => at,
    });
    await service.processClaim(claim, "c");
    expect(call).toBe("PROVIDER_PENDING");
  });
  it("maps adapter exception to retry", async () => {
    let call = "";
    const service = createBillingReconciliationService({
      statusPort: {
        providerKey: "simulator",
        fetchPaymentStatus: async () => {
          throw new Error("adapter");
        },
      },
      repository: {
        claimDue: async () => [],
        reschedule: async (v) => {
          call = v.code;
          return { kind: "RESCHEDULED", code: v.code };
        },
        applyStatus: async () => ({
          kind: "APPLIED",
          paymentId: claim.paymentId,
        }),
        blockUnsupported: async () => ({
          kind: "BLOCKED",
          paymentId: claim.paymentId,
        }),
      },
      now: () => at,
    });
    await service.processClaim(claim, "c");
    expect(call).toBe("PROVIDER_UNAVAILABLE");
  });
  it("does not use a mismatched status provider", async () => {
    let code = "";
    const service = createBillingReconciliationService({
      statusPort: {
        providerKey: "other",
        fetchPaymentStatus: async () => ({ kind: "NOT_FOUND" as const }),
      },
      repository: {
        claimDue: async () => [],
        reschedule: async () => ({
          kind: "RESCHEDULED",
          code: "PROVIDER_NOT_FOUND" as const,
        }),
        applyStatus: async () => ({
          kind: "APPLIED",
          paymentId: claim.paymentId,
        }),
        blockUnsupported: async (v) => {
          code = v.code;
          return { kind: "BLOCKED", paymentId: claim.paymentId };
        },
      },
      now: () => at,
    });
    await service.processClaim(claim, "c");
    expect(code).toBe("PROVIDER_MISMATCH");
  });
  it("passes terminal status to repository", async () => {
    let received = "";
    const service = createBillingReconciliationService({
      statusPort: {
        providerKey: "simulator",
        fetchPaymentStatus: async () => found,
      },
      repository: {
        claimDue: async () => [],
        reschedule: async () => ({
          kind: "RESCHEDULED",
          code: "PROVIDER_PENDING" as const,
        }),
        applyStatus: async (v) => {
          received = v.status.state;
          return { kind: "APPLIED", paymentId: claim.paymentId };
        },
        blockUnsupported: async () => ({
          kind: "BLOCKED",
          paymentId: claim.paymentId,
        }),
      },
      now: () => at,
    });
    await service.processClaim(claim, "c");
    expect(received).toBe("SUCCEEDED");
  });
  it("keeps provider identity out of synthetic identity", () => {
    const id = reconciliationEventIdentity({
      paymentId: claim.paymentId,
      attemptCount: 1,
      state: "SUCCEEDED",
      statusAt: at,
      normalizedPayloadSha256: "b".repeat(64),
    });
    expect(id).not.toContain("sim_payment_1");
  });
  it("hashes a separate payload domain", () => {
    expect(
      reconciliationPayloadSha256({
        paymentId: claim.paymentId,
        provider: "simulator",
        providerPaymentId: "x",
        state: "SUCCEEDED",
        amountMinor: 1,
        currency: "RUB",
        statusAt: at,
      }),
    ).toMatch(/^[0-9a-f]{64}$/);
  });
  for (const state of ["PENDING", "SUCCEEDED", "FAILED", "CANCELED"] as const)
    it(`accepts normalized state ${state}`, () => {
      expect(
        BillingPaymentStatusResultSchema.safeParse({
          kind: "FOUND",
          state,
          amountMinor: 1,
          currency: "RUB",
          statusAt: at,
        }).success,
      ).toBe(true);
    });
  for (const seconds of Array.from({ length: 25 }, (_, i) => i))
    it(`retry policy remains deterministic at ${seconds} seconds`, () => {
      const delay = seconds * 1000;
      expect(reconciliationRetryAt(at, delay).getTime()).toBe(
        at.getTime() + delay,
      );
    });
});
