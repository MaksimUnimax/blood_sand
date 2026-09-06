import { expect, it } from "vitest";
import { BrowserFamilies } from "@product/shared";
import {
  accountRole,
  accountStatus,
  billingIntervalUnit,
  browserFamily,
  deviceAuthorizationStatus,
  deviceStatus,
  entitlementOverrideOperation,
  entitlementSecurityClassification,
  entitlementValueType,
  identityProvider,
  planRevisionState,
  planStatus,
  priceRevisionState,
  priceStatus,
  otpPurpose,
  sessionStatus,
  signingKeyEventType,
  userStatus,
} from "./schema.js";

it("exports the exact P2.1 lifecycle states", () => {
  expect(userStatus.enumValues).toEqual(["ACTIVE", "SUSPENDED"]);
  expect(accountStatus.enumValues).toEqual(["ACTIVE", "SUSPENDED"]);
  expect(identityProvider.enumValues).toEqual(["EMAIL"]);
  expect(accountRole.enumValues).toEqual(["OWNER"]);
  expect(otpPurpose.enumValues).toEqual(["LOGIN"]);
  expect(deviceAuthorizationStatus.enumValues).toEqual([
    "PENDING",
    "APPROVED",
    "DENIED",
    "EXPIRED",
    "EXCHANGED",
  ]);
  expect(deviceStatus.enumValues).toEqual(["ACTIVE", "REVOKED"]);
  expect(sessionStatus.enumValues).toEqual([
    "ACTIVE",
    "REVOKED",
    "COMPROMISED",
  ]);
});

it("exports the exact P3.2 signing lifecycle values", () => {
  expect(signingKeyEventType.enumValues).toEqual([
    "REGISTERED",
    "ACTIVATED",
    "RETIRED",
    "REVOKED",
  ]);
});

it("uses the shared browser family representation", () => {
  expect(browserFamily.enumValues).toEqual(BrowserFamilies);
});

it("exports the P4.1 commercial lifecycle enums", () => {
  expect(planStatus.enumValues).toEqual([
    "DRAFT",
    "ACTIVE",
    "HIDDEN",
    "ARCHIVED",
  ]);
  expect(planRevisionState.enumValues).toEqual(["DRAFT", "PUBLISHED"]);
  expect(priceStatus.enumValues).toEqual([
    "DRAFT",
    "ACTIVE",
    "HIDDEN",
    "ARCHIVED",
  ]);
  expect(priceRevisionState.enumValues).toEqual(["DRAFT", "PUBLISHED"]);
  expect(billingIntervalUnit.enumValues).toEqual(["DAY", "MONTH", "YEAR"]);
});

it("exports only the typed P4.1 entitlement vocabulary", () => {
  expect(entitlementValueType.enumValues).toEqual(["BOOLEAN", "INTEGER"]);
  expect(entitlementSecurityClassification.enumValues).toEqual([
    "CAPABILITY",
    "LIMIT",
  ]);
  expect(entitlementOverrideOperation.enumValues).toEqual(["SET", "CLEAR"]);
});
