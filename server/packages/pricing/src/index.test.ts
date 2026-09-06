import { describe, expect, it } from "vitest";
import {
  CreateDraftPriceRevisionCommandSchema,
  computeP4PriceRevisionContentFingerprintV1,
  validatePriceStatusTransition,
} from "./index.js";

const terms = {
  id: "11111111-1111-4111-8111-111111111111",
  priceId: "22222222-2222-4222-8222-222222222222",
  planRevisionId: "33333333-3333-4333-8333-333333333333",
  revision: 1,
  amountMinor: 19000,
  currency: "RUB",
  billingIntervalUnit: "MONTH" as const,
  billingIntervalCount: 1,
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: null,
};

describe("P4.3 pricing contracts", () => {
  it("computes a stable content fingerprint from exact terms", () => {
    expect(computeP4PriceRevisionContentFingerprintV1(terms)).toBe(
      computeP4PriceRevisionContentFingerprintV1({ ...terms }),
    );
    expect(
      computeP4PriceRevisionContentFingerprintV1({
        ...terms,
        amountMinor: 29000,
      }),
    ).not.toBe(computeP4PriceRevisionContentFingerprintV1(terms));
  });

  it("requires an effective window to be ordered", () => {
    expect(() =>
      CreateDraftPriceRevisionCommandSchema.parse({
        priceId: terms.priceId,
        planRevisionId: terms.planRevisionId,
        amountMinor: terms.amountMinor,
        currency: terms.currency,
        billingIntervalUnit: terms.billingIntervalUnit,
        billingIntervalCount: terms.billingIntervalCount,
        effectiveFrom: terms.effectiveFrom,
        effectiveTo: new Date("2025-12-31T00:00:00.000Z"),
      }),
    ).toThrow();
  });

  it("requires a published revision for sellable statuses", () => {
    expect(validatePriceStatusTransition("DRAFT", "ACTIVE", false)).toBe(
      "PRICE_PUBLISHED_REVISION_REQUIRED",
    );
    expect(validatePriceStatusTransition("DRAFT", "ACTIVE", true)).toBeNull();
    expect(validatePriceStatusTransition("ARCHIVED", "ACTIVE", true)).toBe(
      "PRICE_STATUS_TRANSITION_INVALID",
    );
  });

  it("rejects negative money and malformed currency before command execution", () => {
    expect(() =>
      CreateDraftPriceRevisionCommandSchema.parse({
        priceId: terms.priceId,
        planRevisionId: terms.planRevisionId,
        amountMinor: -1,
        currency: terms.currency,
        billingIntervalUnit: terms.billingIntervalUnit,
        billingIntervalCount: terms.billingIntervalCount,
        effectiveFrom: terms.effectiveFrom,
      }),
    ).toThrow();
    expect(() =>
      CreateDraftPriceRevisionCommandSchema.parse({
        priceId: terms.priceId,
        planRevisionId: terms.planRevisionId,
        amountMinor: terms.amountMinor,
        currency: "usd",
        billingIntervalUnit: terms.billingIntervalUnit,
        billingIntervalCount: terms.billingIntervalCount,
        effectiveFrom: terms.effectiveFrom,
      }),
    ).toThrow();
  });

  it("bounds billing interval counts to the commercial contract", () => {
    expect(() =>
      CreateDraftPriceRevisionCommandSchema.parse({
        priceId: terms.priceId,
        planRevisionId: terms.planRevisionId,
        amountMinor: terms.amountMinor,
        currency: terms.currency,
        billingIntervalUnit: terms.billingIntervalUnit,
        billingIntervalCount: 1201,
        effectiveFrom: terms.effectiveFrom,
      }),
    ).toThrow();
  });

  it("normalizes timestamp strings and a missing end to a nullable window", () => {
    const parsed = CreateDraftPriceRevisionCommandSchema.parse({
      priceId: terms.priceId,
      planRevisionId: terms.planRevisionId,
      amountMinor: terms.amountMinor,
      currency: terms.currency,
      billingIntervalUnit: terms.billingIntervalUnit,
      billingIntervalCount: terms.billingIntervalCount,
      effectiveFrom: "2026-01-01T00:00:00.000Z",
    });
    expect(parsed.effectiveFrom).toEqual(terms.effectiveFrom);
    expect(parsed.effectiveTo).toBeNull();
  });
});
