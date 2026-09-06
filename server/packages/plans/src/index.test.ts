import { describe, expect, it } from "vitest";
import {
  ChangePlanStatusCommandSchema,
  CreateEntitlementDefinitionCommandSchema,
  CreatePlanCommandSchema,
  PlanMutationContextSchema,
  SetDraftPlanEntitlementCommandSchema,
  TypedEntitlementValueSchema,
  UpdateDraftPlanRevisionCommandSchema,
  computeP4PlanRevisionContentFingerprintV1,
  validatePlanStatusTransition,
} from "./index.js";

const uuid = "00000000-0000-4000-8000-000000000001";
const fingerprint = "a".repeat(64);
const context = {
  actorType: "SYSTEM" as const,
  correlationId: "corr-1",
  reason: "local command test",
};

describe("P4.2 plan command domain", () => {
  it("rejects unknown command fields", () => {
    expect(() =>
      CreatePlanCommandSchema.parse({ code: "starter", extra: true }),
    ).toThrow();
    expect(() =>
      ChangePlanStatusCommandSchema.parse({
        planId: uuid,
        expectedStatus: "DRAFT",
        targetStatus: "ACTIVE",
        extra: true,
      }),
    ).toThrow();
  });

  it("validates plan codes and entitlement keys as bounded machine identifiers", () => {
    expect(() => CreatePlanCommandSchema.parse({ code: "Starter" })).toThrow();
    expect(() =>
      CreatePlanCommandSchema.parse({ code: "starter plan" }),
    ).toThrow();
    expect(CreatePlanCommandSchema.parse({ code: "starter.v1" })).toEqual({
      code: "starter.v1",
    });
  });

  it("requires ADMIN actor identity while allowing SYSTEM identity to be absent", () => {
    expect(PlanMutationContextSchema.parse(context).actorType).toBe("SYSTEM");
    expect(() =>
      PlanMutationContextSchema.parse({ ...context, actorType: "ADMIN" }),
    ).toThrow();
    expect(
      PlanMutationContextSchema.parse({
        actorType: "ADMIN",
        actorId: uuid,
        correlationId: "corr-2",
        reason: "operator request",
      }).actorId,
    ).toBe(uuid);
  });

  it("validates reason bounds, trimming, and unsafe characters", () => {
    expect(
      PlanMutationContextSchema.parse({ ...context, reason: "  okay  " })
        .reason,
    ).toBe("okay");
    expect(() =>
      PlanMutationContextSchema.parse({ ...context, reason: "  " }),
    ).toThrow();
    expect(() =>
      PlanMutationContextSchema.parse({ ...context, reason: "bad<reason" }),
    ).toThrow();
    expect(() =>
      PlanMutationContextSchema.parse({ ...context, reason: "x\nreason" }),
    ).toThrow();
    expect(() =>
      PlanMutationContextSchema.parse({ ...context, correlationId: "" }),
    ).toThrow();
  });

  it("accepts BOOLEAN/CAPABILITY and INTEGER/LIMIT pairs", () => {
    expect(
      CreateEntitlementDefinitionCommandSchema.parse({
        entitlementKey: "feature.analytics",
        valueType: "BOOLEAN",
        securityClassification: "CAPABILITY",
        description: "Analytics access",
      }).valueType,
    ).toBe("BOOLEAN");
    expect(
      CreateEntitlementDefinitionCommandSchema.parse({
        entitlementKey: "device.max-active",
        valueType: "INTEGER",
        securityClassification: "LIMIT",
        description: "Maximum active devices",
      }).securityClassification,
    ).toBe("LIMIT");
  });

  it("rejects bad type/classification pairs and malformed keys", () => {
    expect(() =>
      CreateEntitlementDefinitionCommandSchema.parse({
        entitlementKey: "feature.analytics",
        valueType: "INTEGER",
        securityClassification: "CAPABILITY",
        description: "bad pair",
      }),
    ).toThrow();
    expect(() =>
      CreateEntitlementDefinitionCommandSchema.parse({
        entitlementKey: "Device Limit",
        valueType: "INTEGER",
        securityClassification: "LIMIT",
        description: "bad key",
      }),
    ).toThrow();
  });

  it("accepts exact typed values and rejects coercion, floats, and unsafe integers", () => {
    expect(
      TypedEntitlementValueSchema.parse({ kind: "BOOLEAN", value: false }),
    ).toEqual({ kind: "BOOLEAN", value: false });
    expect(
      TypedEntitlementValueSchema.parse({
        kind: "INTEGER",
        value: Number.MAX_SAFE_INTEGER,
      }),
    ).toEqual({ kind: "INTEGER", value: Number.MAX_SAFE_INTEGER });
    expect(() =>
      TypedEntitlementValueSchema.parse({ kind: "BOOLEAN", value: 1 }),
    ).toThrow();
    expect(() =>
      TypedEntitlementValueSchema.parse({ kind: "INTEGER", value: 1.5 }),
    ).toThrow();
    expect(() =>
      TypedEntitlementValueSchema.parse({
        kind: "INTEGER",
        value: Number.MAX_SAFE_INTEGER + 1,
      }),
    ).toThrow();
    expect(() =>
      TypedEntitlementValueSchema.parse({ kind: "INTEGER", value: "3" }),
    ).toThrow();
  });

  it("requires at least one draft metadata field", () => {
    expect(() =>
      UpdateDraftPlanRevisionCommandSchema.parse({
        planRevisionId: uuid,
        expectedContentFingerprint: fingerprint,
      }),
    ).toThrow();
    expect(
      UpdateDraftPlanRevisionCommandSchema.parse({
        planRevisionId: uuid,
        expectedContentFingerprint: fingerprint,
        displayName: "Updated",
      }).displayName,
    ).toBe("Updated");
  });

  it("fingerprints equivalent entitlement input order identically", () => {
    const base = {
      planRevisionId: uuid,
      planId: "00000000-0000-4000-8000-000000000002",
      revision: 1,
      displayName: "Starter",
      description: "A plan",
    };
    const left = computeP4PlanRevisionContentFingerprintV1({
      ...base,
      entitlements: [
        { entitlementKey: "z.limit", value: { kind: "INTEGER", value: 3 } },
        { entitlementKey: "a.flag", value: { kind: "BOOLEAN", value: true } },
      ],
    });
    const right = computeP4PlanRevisionContentFingerprintV1({
      ...base,
      entitlements: [
        { entitlementKey: "a.flag", value: { kind: "BOOLEAN", value: true } },
        { entitlementKey: "z.limit", value: { kind: "INTEGER", value: 3 } },
      ],
    });
    expect(left).toBe(right);
    expect(left).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes fingerprints for metadata, typed kind, and value changes", () => {
    const base = {
      planRevisionId: uuid,
      planId: "00000000-0000-4000-8000-000000000002",
      revision: 1,
      displayName: "Starter",
      description: "A plan",
      entitlements: [
        {
          entitlementKey: "limit",
          value: { kind: "INTEGER" as const, value: 3 },
        },
      ],
    };
    const metadata = computeP4PlanRevisionContentFingerprintV1({
      ...base,
      displayName: "Changed",
    });
    const value = computeP4PlanRevisionContentFingerprintV1({
      ...base,
      entitlements: [
        { entitlementKey: "limit", value: { kind: "INTEGER", value: 4 } },
      ],
    });
    const boolean = computeP4PlanRevisionContentFingerprintV1({
      ...base,
      entitlements: [
        { entitlementKey: "limit", value: { kind: "BOOLEAN", value: true } },
      ],
    });
    const original = computeP4PlanRevisionContentFingerprintV1(base);
    expect(new Set([original, metadata, value, boolean]).size).toBe(4);
  });

  it("enforces the exact plan status transition table", () => {
    expect(validatePlanStatusTransition("DRAFT", "ACTIVE", false)).toBe(
      "PLAN_PUBLISHED_REVISION_REQUIRED",
    );
    expect(validatePlanStatusTransition("DRAFT", "HIDDEN", true)).toBeNull();
    expect(validatePlanStatusTransition("DRAFT", "ARCHIVED", false)).toBeNull();
    expect(validatePlanStatusTransition("ACTIVE", "HIDDEN", true)).toBeNull();
    expect(validatePlanStatusTransition("HIDDEN", "ACTIVE", true)).toBeNull();
    expect(validatePlanStatusTransition("ACTIVE", "DRAFT", true)).toBe(
      "PLAN_STATUS_TRANSITION_INVALID",
    );
    expect(validatePlanStatusTransition("HIDDEN", "DRAFT", true)).toBe(
      "PLAN_STATUS_TRANSITION_INVALID",
    );
    expect(validatePlanStatusTransition("ARCHIVED", "DRAFT", true)).toBe(
      "PLAN_STATUS_TRANSITION_INVALID",
    );
    expect(validatePlanStatusTransition("ACTIVE", "ACTIVE", false)).toBeNull();
  });

  it("rejects unknown fields on typed entitlement commands", () => {
    expect(() =>
      SetDraftPlanEntitlementCommandSchema.parse({
        planRevisionId: uuid,
        expectedContentFingerprint: fingerprint,
        entitlementKey: "feature.flag",
        value: { kind: "BOOLEAN", value: true },
        raw: "not allowed",
      }),
    ).toThrow();
  });
});
