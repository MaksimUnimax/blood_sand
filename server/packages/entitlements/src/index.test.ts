import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  BoundCommercialDeviceLimitResolver,
  ClearAccountEntitlementOverrideCommandSchema,
  CommercialEntitlementReasonSchema,
  CommercialEntitlementSourceSchema,
  DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
  DeviceMaxActiveAdapterError,
  ResolveCommercialEntitlementInputSchema,
  SetAccountEntitlementOverrideCommandSchema,
} from "./index.js";

const accountId = randomUUID();
const baseDates = {
  effectiveFrom: new Date("2026-09-06T00:00:00.000Z"),
  expiresAt: null,
};

describe("@product/entitlements P4.4 contracts", () => {
  it("accepts strict BOOLEAN and INTEGER SET values", () => {
    expect(
      SetAccountEntitlementOverrideCommandSchema.parse({
        accountId,
        entitlementKey: "feature.analytics",
        expectedLatestRevision: null,
        value: { kind: "BOOLEAN", value: true },
        ...baseDates,
      }).value,
    ).toEqual({ kind: "BOOLEAN", value: true });
    expect(
      SetAccountEntitlementOverrideCommandSchema.parse({
        accountId,
        entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
        expectedLatestRevision: 2,
        value: { kind: "INTEGER", value: 4 },
        ...baseDates,
      }).value,
    ).toEqual({ kind: "INTEGER", value: 4 });
  });

  it("rejects unknown SET fields and generic/coerced values", () => {
    expect(() =>
      SetAccountEntitlementOverrideCommandSchema.parse({
        accountId,
        entitlementKey: "feature.analytics",
        expectedLatestRevision: null,
        value: { kind: "BOOLEAN", value: true },
        ...baseDates,
        reason: "not a command field",
      }),
    ).toThrow();
    expect(() =>
      SetAccountEntitlementOverrideCommandSchema.parse({
        accountId,
        entitlementKey: "feature.analytics",
        expectedLatestRevision: null,
        value: { kind: "BOOLEAN", value: "true" },
        ...baseDates,
      }),
    ).toThrow();
  });

  it("accepts strict CLEAR without a value", () => {
    expect(
      ClearAccountEntitlementOverrideCommandSchema.parse({
        accountId,
        entitlementKey: "feature.analytics",
        expectedLatestRevision: 1,
        ...baseDates,
      }),
    ).toMatchObject({ expectedLatestRevision: 1 });
    expect(() =>
      ClearAccountEntitlementOverrideCommandSchema.parse({
        accountId,
        entitlementKey: "feature.analytics",
        expectedLatestRevision: null,
        ...baseDates,
        value: { kind: "BOOLEAN", value: false },
      }),
    ).toThrow();
  });

  it("requires null or a positive expected revision", () => {
    for (const expectedLatestRevision of [0, -1, 1.5])
      expect(() =>
        SetAccountEntitlementOverrideCommandSchema.parse({
          accountId,
          entitlementKey: "feature.analytics",
          expectedLatestRevision,
          value: { kind: "BOOLEAN", value: true },
          ...baseDates,
        }),
      ).toThrow();
  });

  it("enforces the half-open effective window", () => {
    expect(() =>
      SetAccountEntitlementOverrideCommandSchema.parse({
        accountId,
        entitlementKey: "feature.analytics",
        expectedLatestRevision: null,
        value: { kind: "BOOLEAN", value: true },
        effectiveFrom: new Date("2026-09-06T00:00:00.000Z"),
        expiresAt: new Date("2026-09-05T00:00:00.000Z"),
      }),
    ).toThrow();
  });

  it("exposes stable explanation source and reason enums", () => {
    expect(CommercialEntitlementSourceSchema.options).toEqual([
      "ACCOUNT_OVERRIDE",
      "PLAN_REVISION",
      "NONE",
    ]);
    expect(CommercialEntitlementReasonSchema.options).toEqual([
      "ACCOUNT_OVERRIDE_SET",
      "ACCOUNT_OVERRIDE_CLEAR_TO_PLAN",
      "ACCOUNT_OVERRIDE_EXPIRED_TO_PLAN",
      "PLAN_VALUE",
      "UNSET",
    ]);
  });

  it("keeps the device key stable and resolver input explicit", () => {
    expect(DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY).toBe("device.max_active");
    expect(
      ResolveCommercialEntitlementInputSchema.parse({
        accountId,
        planRevisionId: randomUUID(),
        entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
        at: new Date(),
      }).entitlementKey,
    ).toBe("device.max_active");
  });

  it("fails closed when no future plan binding exists", async () => {
    const resolver = new BoundCommercialDeviceLimitResolver(
      { resolve: async () => null },
      {} as never,
    );
    await expect(resolver.resolve(accountId)).rejects.toMatchObject({
      code: "PLAN_BINDING_UNAVAILABLE",
    });
  });

  it("fails closed for unset, wrong type, and negative device limits", async () => {
    const binding = {
      resolve: async () => ({ planRevisionId: randomUUID(), source: "fake" }),
    };
    for (const effectiveValue of [
      null,
      { kind: "BOOLEAN", value: true },
      { kind: "INTEGER", value: -1 },
    ]) {
      const resolver = new BoundCommercialDeviceLimitResolver(binding, {
        resolveCommercialEntitlement: async () => ({
          kind: "OK",
          value: { effectiveValue },
        }),
      } as never);
      await expect(resolver.resolve(accountId)).rejects.toBeInstanceOf(
        DeviceMaxActiveAdapterError,
      );
    }
  });

  it("returns a valid safe integer through the future adapter contract", async () => {
    const resolver = new BoundCommercialDeviceLimitResolver(
      {
        resolve: async () => ({ planRevisionId: randomUUID(), source: "fake" }),
      },
      {
        resolveCommercialEntitlement: async () => ({
          kind: "OK",
          value: { effectiveValue: { kind: "INTEGER", value: 3 } },
        }),
      } as never,
    );
    await expect(resolver.resolve(accountId)).resolves.toEqual({
      maxActive: 3,
      source: "COMMERCIAL_PLAN_REVISION",
    });
  });
});
