import { describe, expect, it } from "vitest";
import {
  allowedRoute,
  controlPlaneOrigin,
} from "../../../../lib/control-plane-route.js";
import config from "../../../../next.config.js";

describe("portal control-plane BFF boundary", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";
  it.each([
    ["POST", "/v1/auth/otp/request"],
    ["POST", "/v1/auth/otp/verify"],
    ["POST", "/v1/auth/logout"],
    ["GET", "/v1/accounts"],
    ["GET", `/v1/device-authorizations/${id}`],
    ["POST", `/v1/device-authorizations/${id}/approve`],
    ["POST", `/v1/device-authorizations/${id}/deny`],
    ["GET", "/v1/devices"],
    ["POST", `/v1/devices/${id}/revoke`],
  ])("allows %s %s", (method, path) =>
    expect(allowedRoute(method, path)).toBeTruthy(),
  );
  it.each([
    ["POST", "/v1/device-authorizations"],
    ["POST", "/v1/device-authorizations/token"],
    ["POST", "/v1/auth/refresh"],
    ["GET", "/v1/bootstrap"],
    ["DELETE", "/v1/accounts"],
    ["GET", "/v1/anything"],
    ["GET", "/v1/devices/else"],
  ])("rejects %s %s", (method, path) =>
    expect(allowedRoute(method, path)).toBeUndefined(),
  );
  it("accepts only a root absolute http(s) origin", () => {
    expect(controlPlaneOrigin("https://api.example.test")).toBe(
      "https://api.example.test",
    );
    for (const value of [
      "file:///x",
      "ftp://x",
      "javascript:x",
      "https://u:p@x",
      "https://x/a",
      "https://x/?q=1",
      "https://x/#x",
      "/relative",
    ])
      expect(controlPlaneOrigin(value)).toBeUndefined();
  });
});

describe("portal response security headers", () => {
  it("sets the P2 production HTML security baseline and disables powered-by", async () => {
    const environment = process.env as Record<string, string | undefined>;
    const prior = environment.NODE_ENV;
    environment.NODE_ENV = "production";
    try {
      const routes = await config.headers?.();
      const headers = new Map(
        routes?.[0]?.headers.map((header) => [
          header.key.toLowerCase(),
          header.value,
        ]),
      );
      const csp = headers.get("content-security-policy");
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(headers.get("x-content-type-options")).toBe("nosniff");
      expect(headers.get("referrer-policy")).toBeTruthy();
      expect(headers.get("permissions-policy")).toBeTruthy();
      expect(headers.get("x-frame-options")).toBe("DENY");
      expect(headers.get("strict-transport-security")).toContain("max-age=");
      expect(config.poweredByHeader).toBe(false);
    } finally {
      environment.NODE_ENV = prior;
    }
  });
});
