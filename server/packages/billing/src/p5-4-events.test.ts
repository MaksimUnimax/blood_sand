import { describe, expect, it, vi } from "vitest";
import {
  BillingEventContextSchema,
  BillingEventTypeSchema,
  VerifiedBillingEventSchema,
  addUtcCalendarInterval,
  createBillingEventService,
  type BillingEventApplicationRepository,
  type BillingEventVerificationPort,
  type VerifiedBillingEvent,
} from "./index.js";

const event = (overrides: Partial<VerifiedBillingEvent> = {}) => ({
  provider: "simulator",
  eventIdentity: "sim_event_001",
  eventType: "payment.succeeded" as const,
  providerPaymentId: "sim_payment_001",
  amountMinor: 19000,
  currency: "RUB",
  occurredAt: new Date("2026-01-31T12:34:56.789Z"),
  payloadSha256: "a".repeat(64),
  ...overrides,
});

describe("P5.4 normalized billing events", () => {
  it.each(["payment.succeeded", "payment.failed", "payment.canceled"] as const)(
    "accepts the exact normalized type %s",
    (eventType) => {
      expect(BillingEventTypeSchema.parse(eventType)).toBe(eventType);
      expect(
        VerifiedBillingEventSchema.safeParse(event({ eventType })).success,
      ).toBe(true);
    },
  );

  it.each([
    "payment.refunded",
    "payment.chargeback",
    "payment.pending",
    "payment.SUCCEEDED",
    "",
  ])("rejects unsupported event type %s", (eventType) => {
    expect(
      VerifiedBillingEventSchema.safeParse(event({ eventType } as never))
        .success,
    ).toBe(false);
  });

  it.each(["", "bad identity", "https://identity", "x".repeat(257)])(
    "rejects unsafe event identity %s",
    (eventIdentity) => {
      expect(
        VerifiedBillingEventSchema.safeParse(event({ eventIdentity })).success,
      ).toBe(false);
    },
  );

  it.each(["", "bad payment id", "https://payment", "x".repeat(257)])(
    "rejects unsafe provider payment id %s",
    (providerPaymentId) => {
      expect(
        VerifiedBillingEventSchema.safeParse(event({ providerPaymentId }))
          .success,
      ).toBe(false);
    },
  );

  it.each([-1, 1.2, Number.NaN, Number.POSITIVE_INFINITY, 9007199254740992])(
    "rejects unsafe amount %s",
    (amountMinor) => {
      expect(
        VerifiedBillingEventSchema.safeParse(event({ amountMinor })).success,
      ).toBe(false);
    },
  );

  it.each(["rub", "RU", "RUBB", "12$", ""])(
    "rejects non-canonical currency %s",
    (currency) => {
      expect(
        VerifiedBillingEventSchema.safeParse(event({ currency })).success,
      ).toBe(false);
    },
  );

  it.each(["0".repeat(64), "f".repeat(64)])(
    "accepts lowercase SHA-256 %s",
    (payloadSha256) => {
      expect(
        VerifiedBillingEventSchema.safeParse(event({ payloadSha256 })).success,
      ).toBe(true);
    },
  );

  it.each(["A".repeat(64), "x".repeat(63), "x".repeat(65), " ".repeat(64)])(
    "rejects invalid payload fingerprint %s",
    (payloadSha256) => {
      expect(
        VerifiedBillingEventSchema.safeParse(event({ payloadSha256 })).success,
      ).toBe(false);
    },
  );

  it("rejects provider-specific fields", () => {
    expect(
      VerifiedBillingEventSchema.safeParse({ ...event(), rawProviderBody: {} })
        .success,
    ).toBe(false);
  });

  it("rejects missing proof-derived fields", () => {
    const value = { ...event() } as Partial<VerifiedBillingEvent>;
    delete value.payloadSha256;
    expect(VerifiedBillingEventSchema.safeParse(value).success).toBe(false);
  });

  it("keeps normalized dates as Date values", () => {
    expect(VerifiedBillingEventSchema.parse(event()).occurredAt).toBeInstanceOf(
      Date,
    );
  });

  it.each([{ correlationId: "x" }, { correlationId: "c".repeat(128) }])(
    "accepts bounded processing context",
    (context) => {
      expect(BillingEventContextSchema.safeParse(context).success).toBe(true);
    },
  );

  it.each([
    {},
    { correlationId: "" },
    { correlationId: "x".repeat(129) },
    { correlationId: "x", extra: true },
  ])("rejects invalid processing context", (context) => {
    expect(BillingEventContextSchema.safeParse(context).success).toBe(false);
  });
});

describe("P5.4 UTC calendar arithmetic", () => {
  it.each([
    ["2026-01-01T00:00:00.000Z", "DAY", 1, "2026-01-02T00:00:00.000Z"],
    ["2026-01-01T23:59:59.999Z", "DAY", 5, "2026-01-06T23:59:59.999Z"],
    ["2026-12-31T12:00:00.000Z", "DAY", 1, "2027-01-01T12:00:00.000Z"],
    ["2026-01-31T12:34:56.789Z", "MONTH", 1, "2026-02-28T12:34:56.789Z"],
    ["2024-01-31T12:34:56.789Z", "MONTH", 1, "2024-02-29T12:34:56.789Z"],
    ["2026-01-31T12:34:56.789Z", "MONTH", 2, "2026-03-31T12:34:56.789Z"],
    ["2026-11-30T12:34:56.789Z", "MONTH", 3, "2027-02-28T12:34:56.789Z"],
    ["2024-02-29T12:34:56.789Z", "YEAR", 1, "2025-02-28T12:34:56.789Z"],
    ["2024-02-29T12:34:56.789Z", "YEAR", 4, "2028-02-29T12:34:56.789Z"],
    ["2026-12-31T12:34:56.789Z", "YEAR", 1, "2027-12-31T12:34:56.789Z"],
    ["2026-01-31T12:34:56.789Z", "MONTH", 12, "2027-01-31T12:34:56.789Z"],
    ["2026-03-31T12:34:56.789Z", "MONTH", 11, "2027-02-28T12:34:56.789Z"],
    ["2026-05-31T12:34:56.789Z", "MONTH", 9, "2027-02-28T12:34:56.789Z"],
    ["2026-08-31T12:34:56.789Z", "YEAR", 2, "2028-08-31T12:34:56.789Z"],
    ["2026-10-31T12:34:56.789Z", "DAY", 365, "2027-10-31T12:34:56.789Z"],
  ] as const)("adds %s %s x%s in UTC", (start, unit, count, expected) => {
    expect(
      addUtcCalendarInterval(new Date(start), unit, count).toISOString(),
    ).toBe(expected);
  });

  it.each([0, -1, 1.5, Number.NaN])(
    "rejects invalid interval count %s",
    (count) => {
      expect(() => addUtcCalendarInterval(new Date(), "DAY", count)).toThrow(
        "INVALID_INTERVAL",
      );
    },
  );

  it("does not use the host local timezone", () => {
    const start = new Date("2026-01-31T23:00:00.000Z");
    expect(addUtcCalendarInterval(start, "MONTH", 1).toISOString()).toBe(
      "2026-02-28T23:00:00.000Z",
    );
  });
});

describe("P5.4 verification-before-ledger service", () => {
  const verified = event();
  const context = { correlationId: "correlation-1" };
  const applied = {
    kind: "APPLIED" as const,
    replay: false,
    billingEventId: "event-row",
    paymentId: "payment-row",
    subscriptionId: null,
    subscriptionTransitionId: null,
  };
  function harness(
    verification: Awaited<
      ReturnType<BillingEventVerificationPort["verifyEvent"]>
    >,
  ) {
    const verifier: BillingEventVerificationPort = {
      providerKey: "simulator",
      verifyEvent: vi.fn(() => verification),
    };
    const repository: BillingEventApplicationRepository = {
      applyVerifiedBillingEvent: vi.fn(async () => applied),
    };
    return {
      repository,
      verifier,
      service: createBillingEventService({
        verifier,
        repository,
        now: () => new Date("2026-01-01T00:00:00.000Z"),
      }),
    };
  }

  it("does not call the repository for malformed verification", async () => {
    const h = harness({ kind: "REJECTED", code: "MALFORMED_EVENT" });
    const result = await h.service.processBillingEvent({}, context);
    expect(result).toEqual({
      kind: "REJECTED",
      code: "MALFORMED_EVENT",
      replay: false,
    });
    expect(h.repository.applyVerifiedBillingEvent).not.toHaveBeenCalled();
  });

  it("does not call the repository for invalid proof", async () => {
    const h = harness({ kind: "REJECTED", code: "INVALID_EVENT_PROOF" });
    const result = await h.service.processBillingEvent({}, context);
    expect(result).toEqual({
      kind: "REJECTED",
      code: "INVALID_EVENT_PROOF",
      replay: false,
    });
    expect(h.repository.applyVerifiedBillingEvent).not.toHaveBeenCalled();
  });

  it("passes one captured time to both simulated timestamps", async () => {
    const h = harness({ kind: "VERIFIED", event: verified });
    await h.service.processBillingEvent({}, context);
    expect(h.repository.applyVerifiedBillingEvent).toHaveBeenCalledWith({
      event: verified,
      context,
      receivedAt: new Date("2026-01-01T00:00:00.000Z"),
      verifiedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  it("returns only the safe repository result", async () => {
    const h = harness({ kind: "VERIFIED", event: verified });
    const result = await h.service.processBillingEvent(
      { proof: "secret" },
      context,
    );
    expect(result).toEqual(applied);
    expect(JSON.stringify(result)).not.toContain("sim_payment_001");
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("maps verifier exceptions to a retryable safe result", async () => {
    const verifier: BillingEventVerificationPort = {
      providerKey: "simulator",
      verifyEvent: vi.fn(() => {
        throw new Error("provider body");
      }),
    };
    const repository: BillingEventApplicationRepository = {
      applyVerifiedBillingEvent: vi.fn(),
    };
    const service = createBillingEventService({ verifier, repository });
    await expect(service.processBillingEvent({}, context)).resolves.toEqual({
      kind: "RETRYABLE",
      code: "SERVICE_UNAVAILABLE",
    });
    expect(repository.applyVerifiedBillingEvent).not.toHaveBeenCalled();
  });

  it("maps repository exceptions to a retryable safe result", async () => {
    const verifier: BillingEventVerificationPort = {
      providerKey: "simulator",
      verifyEvent: () => ({ kind: "VERIFIED", event: verified }),
    };
    const repository: BillingEventApplicationRepository = {
      applyVerifiedBillingEvent: vi.fn(async () => {
        throw new Error("raw sqlstate");
      }),
    };
    const service = createBillingEventService({ verifier, repository });
    await expect(service.processBillingEvent({}, context)).resolves.toEqual({
      kind: "RETRYABLE",
      code: "SERVICE_UNAVAILABLE",
    });
  });

  it("rejects a verified event from the wrong provider", async () => {
    const h = harness({
      kind: "VERIFIED",
      event: event({ provider: "other" }),
    });
    await expect(h.service.processBillingEvent({}, context)).resolves.toEqual({
      kind: "REJECTED",
      code: "MALFORMED_EVENT",
      replay: false,
    });
    expect(h.repository.applyVerifiedBillingEvent).not.toHaveBeenCalled();
  });
});
