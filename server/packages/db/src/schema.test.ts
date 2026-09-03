import { expect, it } from "vitest";
import { BrowserFamilies } from "@product/shared";
import {
  accountRole,
  accountStatus,
  browserFamily,
  deviceAuthorizationStatus,
  deviceStatus,
  identityProvider,
  otpPurpose,
  sessionStatus,
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

it("uses the shared browser family representation", () => {
  expect(browserFamily.enumValues).toEqual(BrowserFamilies);
});
