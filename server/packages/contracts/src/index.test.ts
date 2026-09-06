import { describe, expect, it } from "vitest";
import {
  PublicCommercialBillingIntervalV1Schema,
  PublicCommercialCatalogQueryV1Schema,
  PublicCommercialCatalogResponseV1Schema,
  PublicCommercialMoneyV1Schema,
} from "./index.js";

const ids = {
  planId: "123e4567-e89b-42d3-a456-426614174001",
  planRevisionId: "123e4567-e89b-42d3-a456-426614174002",
  priceId: "123e4567-e89b-42d3-a456-426614174003",
  priceRevisionId: "123e4567-e89b-42d3-a456-426614174004",
};

const response = {
  catalogVersion: "public_commercial_catalog_v1",
  generatedAt: "2026-09-06T12:00:00.000Z",
  marketKey: "ru",
  channelKey: "web",
  offers: [
    {
      plan: {
        planId: ids.planId,
        planCode: "starter",
        planRevisionId: ids.planRevisionId,
        planRevision: 1,
        displayName: "Starter",
        description: "Starter plan",
      },
      price: {
        priceId: ids.priceId,
        priceCode: "starter-monthly",
        priceRevisionId: ids.priceRevisionId,
        priceRevision: 1,
        amount: { amountMinor: 19000, currency: "RUB" },
        billingInterval: { unit: "MONTH", count: 1 },
        effectiveFrom: "2026-01-01T00:00:00.000Z",
        effectiveTo: null,
      },
    },
  ],
};

describe("P4.5 public catalog contracts", () => {
  it("requires both explicit query identifiers", () => {
    expect(PublicCommercialCatalogQueryV1Schema.safeParse({}).success).toBe(
      false,
    );
    expect(
      PublicCommercialCatalogQueryV1Schema.safeParse({ marketKey: "ru" })
        .success,
    ).toBe(false);
    expect(
      PublicCommercialCatalogQueryV1Schema.safeParse({ channelKey: "web" })
        .success,
    ).toBe(false);
  });

  it("rejects invalid identifiers and unknown query fields", () => {
    for (const query of [
      { marketKey: "RU", channelKey: "web" },
      { marketKey: "ru", channelKey: "web/checkout" },
      { marketKey: "ru", channelKey: "web", at: "now" },
    ])
      expect(
        PublicCommercialCatalogQueryV1Schema.safeParse(query).success,
      ).toBe(false);
  });

  it("enforces safe nonnegative integer money and uppercase currency", () => {
    expect(
      PublicCommercialMoneyV1Schema.safeParse(response.offers[0]!.price.amount)
        .success,
    ).toBe(true);
    expect(
      PublicCommercialMoneyV1Schema.safeParse({
        amountMinor: -1,
        currency: "RUB",
      }).success,
    ).toBe(false);
    expect(
      PublicCommercialMoneyV1Schema.safeParse({
        amountMinor: 1.5,
        currency: "RUB",
      }).success,
    ).toBe(false);
    expect(
      PublicCommercialMoneyV1Schema.safeParse({
        amountMinor: 1,
        currency: "rub",
      }).success,
    ).toBe(false);
    expect(
      PublicCommercialMoneyV1Schema.safeParse({
        amountMinor: Number.MAX_SAFE_INTEGER + 1,
        currency: "RUB",
      }).success,
    ).toBe(false);
  });

  it("enforces the billing interval bounds", () => {
    expect(
      PublicCommercialBillingIntervalV1Schema.parse({
        unit: "YEAR",
        count: 1200,
      }),
    ).toEqual({
      unit: "YEAR",
      count: 1200,
    });
    expect(
      PublicCommercialBillingIntervalV1Schema.safeParse({
        unit: "MONTH",
        count: 0,
      }).success,
    ).toBe(false);
    expect(
      PublicCommercialBillingIntervalV1Schema.safeParse({
        unit: "WEEK",
        count: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects extra public response fields", () => {
    expect(
      PublicCommercialCatalogResponseV1Schema.safeParse({
        ...response,
        accountId: ids.planId,
      }).success,
    ).toBe(false);
    expect(
      PublicCommercialCatalogResponseV1Schema.safeParse({
        ...response,
        offers: [{ ...response.offers[0], entitlements: [] }],
      }).success,
    ).toBe(false);
  });

  it("accepts the exact safe v1 response shape", () => {
    expect(PublicCommercialCatalogResponseV1Schema.parse(response)).toEqual(
      response,
    );
  });
});
