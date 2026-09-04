import { describe, expect, it, vi } from "vitest";
import {
  AuthService,
  deriveAuthKeys,
  type AuthRepository,
} from "@product/auth";
import type { DeviceAuthorizationService } from "@product/device-auth";
import type { AppConfig } from "@product/shared";
import { createApiApp } from "./app.js";

const config: AppConfig = {
  environment: "test",
  databaseUrl: "postgres://test:test@localhost/test",
  logLevel: "info",
  apiPort: 3000,
  workerReadyDelayMs: 0,
};
const repo: AuthRepository = {
  listOwnedAccounts: vi.fn(async () => [
    {
      id: "123e4567-e89b-42d3-a456-426614174000",
      displayName: "Owned",
      status: "ACTIVE" as const,
    },
  ]),
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
  revoke: vi.fn(),
  authenticate: vi.fn(async () => ({ sessionId: "s", userId: "u" })),
};
function app(
  preview: () => Promise<
    | {
        id: string;
        browserFamily: "chrome";
        browserVersion: string;
        extensionVersion: string;
        deviceLabel: string;
        expiresAt: Date;
      }
    | undefined
  > = async () => ({
    id: "123e4567-e89b-42d3-a456-426614174001",
    browserFamily: "chrome" as const,
    browserVersion: "1",
    extensionVersion: "2",
    deviceLabel: "Device",
    expiresAt: new Date("2030-01-01T00:00:00Z"),
  }),
) {
  return createApiApp({
    config,
    isInfrastructureReady: async () => true,
    authService: new AuthService(repo, deriveAuthKeys(Buffer.alloc(32, 1))),
    deviceAuthorizationService: {
      previewPendingAuthorization: preview,
    } as unknown as DeviceAuthorizationService,
  });
}
describe("P2.6 portal support routes", () => {
  it("requires a valid portal session and projects accounts safely", async () => {
    const server = app();
    expect(
      (await server.inject({ method: "GET", url: "/v1/accounts" })).statusCode,
    ).toBe(401);
    const response = await server.inject({
      method: "GET",
      url: "/v1/accounts",
      headers: { cookie: "pcp_portal_session=valid" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toContain("no-store");
    expect(response.json()).toEqual({
      accounts: [
        {
          id: "123e4567-e89b-42d3-a456-426614174000",
          displayName: "Owned",
          status: "ACTIVE",
        },
      ],
    });
    await server.close();
  });
  it("validates and safely previews only available authorizations", async () => {
    const server = app(async () => undefined);
    const malformed = await server.inject({
      method: "GET",
      url: "/v1/device-authorizations/nope",
      headers: { cookie: "pcp_portal_session=valid" },
    });
    expect(malformed.statusCode).toBe(400);
    const unavailable = await server.inject({
      method: "GET",
      url: "/v1/device-authorizations/123e4567-e89b-42d3-a456-426614174001",
      headers: { cookie: "pcp_portal_session=valid" },
    });
    expect(unavailable.statusCode).toBe(404);
    await server.close();
  });
});
