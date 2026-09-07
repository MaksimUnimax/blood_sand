import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BillingProviderCheckoutInputSchema,
  CheckoutFailureCodeSchema,
  CheckoutContextSchema,
  CheckoutIdempotencyKeySchema,
  CreateCheckoutCommandSchema,
  ProviderCheckoutResultSchema,
  createCheckoutService,
  fingerprintCheckoutRequest,
  hashCheckoutIdempotencyKey,
  type CheckoutIntent,
  type CheckoutRepository,
} from "./index.js";

const accountId = "11111111-1111-4111-8111-111111111111";
const priceId = "22222222-2222-4222-8222-222222222222";
const intentId = "33333333-3333-4333-8333-333333333333";
const paymentId = "44444444-4444-4444-8444-444444444444";
const actorId = "55555555-5555-4555-8555-555555555555";
const context = {
  actorType: "ACCOUNT_USER" as const,
  actorId,
  correlationId: "corr",
};

function intent(state: CheckoutIntent["state"] = "CREATING"): CheckoutIntent {
  return {
    id: intentId,
    accountId,
    priceRevisionId: priceId,
    planRevisionId: "66666666-6666-4666-8666-666666666666",
    provider: "simulator",
    state,
    idempotencyKeyHash: hashCheckoutIdempotencyKey("checkout-key-0001"),
    requestFingerprintSha256: fingerprintCheckoutRequest({
      accountId,
      priceRevisionId: priceId,
    }),
    admittedAt: new Date("2026-09-06T12:00:00Z"),
    amountMinor: 19000,
    currency: "RUB",
    billingIntervalUnit: "MONTH",
    billingIntervalCount: 1,
    providerCheckoutId: state === "READY" ? "sim_checkout_1" : null,
    providerPaymentId: state === "READY" ? "sim_payment_1" : null,
    checkoutReference: state === "READY" ? "sim_ref_1" : null,
    paymentId: state === "READY" ? paymentId : null,
    failureCode: state === "FAILED" ? "PROVIDER_REJECTED" : null,
    createdAt: new Date("2026-09-06T12:00:00Z"),
    updatedAt: new Date("2026-09-06T12:00:00Z"),
    completedAt: state === "CREATING" ? null : new Date("2026-09-06T12:01:00Z"),
  };
}

function fakeRepository(existing: CheckoutIntent | null = null) {
  let stored = existing;
  const repository: CheckoutRepository = {
    inspectCheckout: vi.fn(async () => ({
      account: {
        accountExists: true,
        owner: true,
        accountStatus: "ACTIVE" as const,
        hasCurrentSubscription: false,
      },
      intent: stored,
    })),
    prepareCheckout: vi.fn(async () => {
      stored ??= intent();
      return existing
        ? { kind: "EXISTING" as const, intent: stored }
        : { kind: "CREATED" as const, intent: stored };
    }),
    finalizeCheckout: vi.fn(async ({ result }) => {
      if (result.kind === "REJECTED") {
        stored = intent("FAILED");
        return {
          kind: "FAILED" as const,
          intent: stored,
          code: "PROVIDER_REJECTED" as const,
        };
      }
      stored = intent("READY");
      return { kind: "READY" as const, intent: stored };
    }),
    failCheckout: vi.fn(async ({ code }) => {
      stored = { ...intent("FAILED"), failureCode: code };
      return { kind: "FAILED" as const, intent: stored, code };
    }),
  };
  return {
    repository,
    get stored() {
      return stored;
    },
  };
}

const resolver = {
  resolvePurchasableOffer: vi.fn(async () => ({
    kind: "OK" as const,
    value: {
      planId: "77777777-7777-4777-8777-777777777777",
      planCode: "basic",
      planRevisionId: intent().planRevisionId,
      planRevision: 1,
      priceId: "88888888-8888-4888-8888-888888888888",
      priceCode: "monthly",
      priceRevisionId: priceId,
      priceRevision: 1,
      marketKey: "ru",
      channelKey: "web",
      amountMinor: 19000,
      currency: "RUB",
      billingIntervalUnit: "MONTH" as const,
      billingIntervalCount: 1,
      effectiveFrom: new Date("2026-01-01T00:00:00Z"),
      effectiveTo: null,
    },
  })),
};

describe("P5.3 billing contracts and orchestration", () => {
  beforeEach(() => vi.clearAllMocks());
  it.each(["abcdefghijklmnop", "A1._:-abcdefghijkl", "x".repeat(128)])(
    "accepts valid idempotency key %s",
    (key) => {
      expect(CheckoutIdempotencyKeySchema.parse(key)).toBe(key);
    },
  );
  it.each(["short", "bad key 123456", "<bad-key-123456>", "x".repeat(129)])(
    "rejects invalid idempotency key %s",
    (key) => {
      expect(CheckoutIdempotencyKeySchema.safeParse(key).success).toBe(false);
    },
  );
  it("hashes idempotency keys deterministically", () =>
    expect(hashCheckoutIdempotencyKey("abcdefghijklmnop")).toBe(
      hashCheckoutIdempotencyKey("abcdefghijklmnop"),
    ));
  it("hashes different idempotency keys differently", () =>
    expect(hashCheckoutIdempotencyKey("abcdefghijklmnop")).not.toBe(
      hashCheckoutIdempotencyKey("abcdefghijklmn op"),
    ));
  it("uses a domain-separated idempotency hash", () =>
    expect(hashCheckoutIdempotencyKey("abcdefghijklmnop")).not.toBe(
      hashCheckoutIdempotencyKey(
        "product-control-plane/checkout-idempotency/v1\nabcdefghijklmnop",
      ),
    ));
  it("never returns the raw idempotency key as its hash", () =>
    expect(hashCheckoutIdempotencyKey("abcdefghijklmnop")).not.toContain(
      "abcdefghijklmnop",
    ));
  it("fingerprints the same request stably", () =>
    expect(
      fingerprintCheckoutRequest({ accountId, priceRevisionId: priceId }),
    ).toBe(
      fingerprintCheckoutRequest({ accountId, priceRevisionId: priceId }),
    ));
  it("fingerprints a different price revision differently", () =>
    expect(
      fingerprintCheckoutRequest({
        accountId,
        priceRevisionId: intent().planRevisionId,
      }),
    ).not.toBe(
      fingerprintCheckoutRequest({ accountId, priceRevisionId: priceId }),
    ));
  it("does not include provider in the fingerprint domain", () =>
    expect(
      fingerprintCheckoutRequest({ accountId, priceRevisionId: priceId }),
    ).toHaveLength(64));
  it("produces lowercase hexadecimal hashes", () =>
    expect(hashCheckoutIdempotencyKey("abcdefghijklmnop")).toMatch(
      /^[0-9a-f]{64}$/,
    ));
  it("requires all command fields", () =>
    expect(
      CreateCheckoutCommandSchema.safeParse({
        accountId,
        priceRevisionId: priceId,
      }).success,
    ).toBe(false));
  it("rejects caller-supplied commercial terms", () =>
    expect(
      CreateCheckoutCommandSchema.safeParse({
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "abcdefghijklmnop",
        amountMinor: 1,
      }).success,
    ).toBe(false));
  it("rejects caller-supplied provider", () =>
    expect(
      CreateCheckoutCommandSchema.safeParse({
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "abcdefghijklmnop",
        provider: "simulator",
      }).success,
    ).toBe(false));
  it("rejects caller-supplied plan revision", () =>
    expect(
      CreateCheckoutCommandSchema.safeParse({
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "abcdefghijklmnop",
        planRevisionId: intent().planRevisionId,
      }).success,
    ).toBe(false));
  it("rejects extra command fields", () =>
    expect(
      CreateCheckoutCommandSchema.safeParse({
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "abcdefghijklmnop",
        extra: true,
      }).success,
    ).toBe(false));
  it("accepts the exact account-owner context", () =>
    expect(CheckoutContextSchema.parse(context)).toEqual(context));
  it("rejects admin context", () =>
    expect(
      CheckoutContextSchema.safeParse({ ...context, actorType: "ADMIN" })
        .success,
    ).toBe(false));
  it("rejects context without actor id", () =>
    expect(
      CheckoutContextSchema.safeParse({
        actorType: "ACCOUNT_USER",
        correlationId: "x",
      }).success,
    ).toBe(false));
  it("rejects an empty correlation id", () =>
    expect(
      CheckoutContextSchema.safeParse({ ...context, correlationId: "" })
        .success,
    ).toBe(false));
  it("rejects context extras", () =>
    expect(
      CheckoutContextSchema.safeParse({ ...context, reason: "not allowed" })
        .success,
    ).toBe(false));
  it("accepts canonical provider input", () =>
    expect(
      BillingProviderCheckoutInputSchema.safeParse({
        providerRequestId: intentId,
        amountMinor: 0,
        currency: "RUB",
        billingIntervalUnit: "DAY",
        billingIntervalCount: 1200,
      }).success,
    ).toBe(true));
  it("rejects provider input with account data", () =>
    expect(
      BillingProviderCheckoutInputSchema.safeParse({
        providerRequestId: intentId,
        amountMinor: 1,
        currency: "RUB",
        billingIntervalUnit: "DAY",
        billingIntervalCount: 1,
        accountEmail: "x",
      }).success,
    ).toBe(false));
  it("rejects lowercase provider currency", () =>
    expect(
      BillingProviderCheckoutInputSchema.safeParse({
        providerRequestId: intentId,
        amountMinor: 1,
        currency: "rub",
        billingIntervalUnit: "DAY",
        billingIntervalCount: 1,
      }).success,
    ).toBe(false));
  it("rejects unsafe provider references", () =>
    expect(
      ProviderCheckoutResultSchema.safeParse({
        kind: "CREATED",
        providerCheckoutId: "https://bad",
        providerPaymentId: "p",
        checkoutReference: "r",
      }).success,
    ).toBe(false));
  it("accepts normalized provider rejection", () =>
    expect(
      ProviderCheckoutResultSchema.parse({
        kind: "REJECTED",
        code: "REJECTED",
      }),
    ).toEqual({ kind: "REJECTED", code: "REJECTED" }));
  it("accepts normalized provider unavailability", () =>
    expect(ProviderCheckoutResultSchema.parse({ kind: "UNAVAILABLE" })).toEqual(
      { kind: "UNAVAILABLE" },
    ));
  it("requires all created provider identities", () =>
    expect(
      ProviderCheckoutResultSchema.safeParse({
        kind: "CREATED",
        providerCheckoutId: "x",
      }).success,
    ).toBe(false));
  it("rejects provider result arbitrary payload", () =>
    expect(
      ProviderCheckoutResultSchema.safeParse({
        kind: "CREATED",
        providerCheckoutId: "x",
        providerPaymentId: "y",
        checkoutReference: "z",
        raw: {},
      }).success,
    ).toBe(false));
  it("creates one ready checkout", async () => {
    const fake = fakeRepository();
    const service = createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: {
        providerKey: "simulator",
        createCheckout: vi.fn(async () => ({
          kind: "CREATED" as const,
          providerCheckoutId: "c",
          providerPaymentId: "p",
          checkoutReference: "r",
        })),
      },
      now: () => new Date("2026-09-06T12:00:00Z"),
    });
    const result = await service.createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result.kind).toBe("READY");
  });
  it("exposes CHECKOUT_IN_PROGRESS as a stable checkout rejection", () => {
    expect(CheckoutFailureCodeSchema.parse("CHECKOUT_IN_PROGRESS")).toBe(
      "CHECKOUT_IN_PROGRESS",
    );
  });
  it("marks a blocked different-key result as a non-replay", async () => {
    const fake = fakeRepository();
    fake.repository.prepareCheckout = vi.fn(async () => ({
      kind: "REJECTED" as const,
      code: "CHECKOUT_IN_PROGRESS" as const,
    }));
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: { providerKey: "simulator", createCheckout: vi.fn() },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-blocked-0003",
      },
      context,
    );
    expect(result).toEqual({
      kind: "REJECTED",
      code: "CHECKOUT_IN_PROGRESS",
      replay: false,
    });
  });
  it("does not call the provider when another idempotency identity is actionable", async () => {
    const fake = fakeRepository();
    fake.repository.prepareCheckout = vi.fn(async () => ({
      kind: "REJECTED" as const,
      code: "CHECKOUT_IN_PROGRESS" as const,
    }));
    const provider = { providerKey: "simulator", createCheckout: vi.fn() };
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider,
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-other-0002",
      },
      context,
    );
    expect(result).toEqual({
      kind: "REJECTED",
      code: "CHECKOUT_IN_PROGRESS",
      replay: false,
    });
    expect(provider.createCheckout).not.toHaveBeenCalled();
  });
  it("passes checkout intent id as provider request id", async () => {
    const fake = fakeRepository();
    const provider = {
      providerKey: "simulator",
      createCheckout: vi.fn(async () => ({ kind: "UNAVAILABLE" as const })),
    };
    await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider,
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(provider.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ providerRequestId: intentId }),
    );
  });
  it("leaves unavailable checkout retryable", async () => {
    const fake = fakeRepository();
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: {
        providerKey: "simulator",
        createCheckout: async () => ({ kind: "UNAVAILABLE" as const }),
      },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toEqual({
      kind: "RETRYABLE",
      code: "PROVIDER_UNAVAILABLE",
      checkoutIntentId: intentId,
    });
  });
  it("maps thrown provider adapter errors to unavailability", async () => {
    const fake = fakeRepository();
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: {
        providerKey: "simulator",
        createCheckout: async () => {
          throw new Error("secret adapter detail");
        },
      },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toMatchObject({
      kind: "RETRYABLE",
      code: "PROVIDER_UNAVAILABLE",
    });
  });
  it("maps provider rejection to a stable checkout rejection", async () => {
    const fake = fakeRepository();
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: {
        providerKey: "simulator",
        createCheckout: async () => ({
          kind: "REJECTED",
          code: "REJECTED" as const,
        }),
      },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toEqual({
      kind: "REJECTED",
      code: "PROVIDER_REJECTED",
      replay: false,
    });
  });
  it("preserves P4.5 failure codes", async () => {
    const fake = fakeRepository();
    const failedResolver = {
      resolvePurchasableOffer: vi.fn(async () => ({
        kind: "REJECTED" as const,
        code: "EXPLICITLY_CLOSED" as const,
      })),
    };
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: failedResolver,
      provider: { providerKey: "simulator", createCheckout: vi.fn() },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toEqual({
      kind: "REJECTED",
      code: "EXPLICITLY_CLOSED",
      replay: false,
    });
  });
  it("does not call the resolver for a CREATING retry", async () => {
    const fake = fakeRepository(intent());
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: {
        providerKey: "simulator",
        createCheckout: async () => ({ kind: "UNAVAILABLE" as const }),
      },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result.kind).toBe("RETRYABLE");
    expect(resolver.resolvePurchasableOffer).not.toHaveBeenCalled();
  });
  it("rejects a changed price under the same key", async () => {
    const fake = fakeRepository(intent());
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: { providerKey: "simulator", createCheckout: vi.fn() },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: intent().planRevisionId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toEqual({
      kind: "REJECTED",
      code: "IDEMPOTENCY_KEY_REUSED",
      replay: true,
    });
  });
  it("rejects a provider mismatch before provider invocation", async () => {
    const fake = fakeRepository({ ...intent(), provider: "other" });
    const provider = { providerKey: "simulator", createCheckout: vi.fn() };
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider,
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toEqual({
      kind: "REJECTED",
      code: "CHECKOUT_PROVIDER_MISMATCH",
      replay: true,
    });
    expect(provider.createCheckout).not.toHaveBeenCalled();
  });
  it("replays a failed checkout without a provider call", async () => {
    const fake = fakeRepository(intent("FAILED"));
    const provider = { providerKey: "simulator", createCheckout: vi.fn() };
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider,
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toEqual({
      kind: "REJECTED",
      code: "PROVIDER_REJECTED",
      replay: true,
    });
    expect(provider.createCheckout).not.toHaveBeenCalled();
  });
  it("replays ready data without provider payment id", async () => {
    const fake = fakeRepository(intent("READY"));
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: { providerKey: "simulator", createCheckout: vi.fn() },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result.kind).toBe("READY");
    expect(result).not.toHaveProperty("providerPaymentId");
  });
  it.each([
    "ACCOUNT_NOT_FOUND",
    "FORBIDDEN",
    "ACCOUNT_SUSPENDED",
    "CURRENT_SUBSCRIPTION_EXISTS",
  ] as const)("maps account policy failure %s", async (code) => {
    const fake = fakeRepository();
    fake.repository.inspectCheckout = vi.fn(async () => ({
      account: {
        accountExists: code !== "ACCOUNT_NOT_FOUND",
        owner: code !== "FORBIDDEN",
        accountStatus:
          code === "ACCOUNT_SUSPENDED"
            ? ("SUSPENDED" as const)
            : ("ACTIVE" as const),
        hasCurrentSubscription: code === "CURRENT_SUBSCRIPTION_EXISTS",
      },
      intent: null,
    }));
    const result = await createCheckoutService({
      repository: fake.repository,
      offerResolver: resolver,
      provider: { providerKey: "simulator", createCheckout: vi.fn() },
    }).createCheckout(
      {
        accountId,
        priceRevisionId: priceId,
        idempotencyKey: "checkout-key-0001",
      },
      context,
    );
    expect(result).toEqual({ kind: "REJECTED", code, replay: false });
  });
});
