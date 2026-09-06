import { expect, it } from "vitest";
import { BrowserFamilies } from "@product/shared";
import {
  accountRole,
  accountStatus,
  billingIntervalUnit,
  billingEventProcessingState,
  billingEventSource,
  browserFamily,
  deviceAuthorizationStatus,
  deviceStatus,
  entitlementOverrideOperation,
  entitlementSecurityClassification,
  entitlementValueType,
  identityProvider,
  paymentState,
  planRevisionState,
  planStatus,
  priceRevisionState,
  priceStatus,
  otpPurpose,
  sessionStatus,
  signingKeyEventType,
  userStatus,
  subscriptionState,
  subscriptionTransitionSource,
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

it("exports the exact P5.1 subscription and payment state vocabulary", () => {
  expect(subscriptionState.enumValues).toEqual([
    "TRIAL",
    "ACTIVE",
    "GRACE",
    "PAST_DUE",
    "CANCELED",
    "EXPIRED",
    "SUSPENDED",
  ]);
  expect(subscriptionTransitionSource.enumValues).toEqual([
    "CHECKOUT",
    "WEBHOOK",
    "RECONCILIATION",
    "JOB",
    "ADMIN",
    "SYSTEM",
  ]);
  expect(paymentState.enumValues).toEqual([
    "PENDING",
    "SUCCEEDED",
    "FAILED",
    "CANCELED",
    "REFUNDED",
    "CHARGEBACK",
  ]);
});

it("exports the exact P5.1 billing-event vocabulary", () => {
  expect(billingEventSource.enumValues).toEqual(["WEBHOOK", "RECONCILIATION"]);
  expect(billingEventProcessingState.enumValues).toEqual([
    "VERIFIED",
    "APPLIED",
    "IGNORED",
    "FAILED",
  ]);
});
