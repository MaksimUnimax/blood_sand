import { describe, expect, it, vi } from "vitest";
import type { ExtensionAuthService } from "@product/extension-auth";
import type { AppConfig } from "@product/shared";
import { createApiApp } from "./app.js";

const config: AppConfig = {
  environment: "test",
  databaseUrl: "postgres://test:test@localhost:5432/test",
  logLevel: "silent" as AppConfig["logLevel"],
  apiPort: 3000,
  workerReadyDelayMs: 0,
};
const refreshToken = "R".repeat(43),
  idempotencyKey = "I".repeat(16);
function fixture(
  result: unknown = {
    ok: true,
    value: {
      accessToken: "header.payload.signature",
      accessTokenExpiresAt: new Date("2026-09-03T12:15:00.000Z"),
      refreshToken: "N".repeat(43),
      expiresAt: new Date("2026-10-03T12:00:00.000Z"),
      replay: false,
    },
  },
) {
  const service = { refresh: vi.fn().mockResolvedValue(result) };
  const app = createApiApp({
    config,
    isInfrastructureReady: async () => true,
    extensionAuthService: service as unknown as ExtensionAuthService,
  });
  return { app, service };
}
describe("refresh Fastify boundary", () => {
  it("T3 A returns only explicit JSON credentials with no-store compatibility headers", async () => {
    const { app } = fixture();
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      headers: { "idempotency-key": idempotencyKey },
      payload: { refreshToken },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers.pragma).toBe("no-cache");
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(Object.keys(response.json()).sort()).toEqual([
      "accessToken",
      "accessTokenExpiresAt",
      "refreshToken",
      "refreshTokenExpiresAt",
      "tokenType",
    ]);
    expect(response.json().tokenType).toBe("Bearer");
    await app.close();
  });
  it("T3 B rejects malformed headers and strict bodies before the service", async () => {
    const { app, service } = fixture();
    for (const request of [
      { headers: {}, payload: { refreshToken } },
      { headers: { "idempotency-key": "short" }, payload: { refreshToken } },
      {
        headers: { "idempotency-key": "!".repeat(16) },
        payload: { refreshToken },
      },
      { headers: { "idempotency-key": idempotencyKey }, payload: {} },
      {
        headers: { "idempotency-key": idempotencyKey },
        payload: { refreshToken: "bad" },
      },
      {
        headers: { "idempotency-key": idempotencyKey },
        payload: { refreshToken, unknown: true },
      },
      { headers: { "idempotency-key": idempotencyKey }, payload: [] },
    ]) {
      const response = await app.inject({
        method: "POST",
        url: "/v1/auth/refresh",
        ...request,
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("INVALID_REQUEST");
    }
    expect(service.refresh).not.toHaveBeenCalled();
    await app.close();
  });
  it("T3 C maps safe service outcomes to the standard envelope", async () => {
    for (const [result, status, code] of [
      [
        { ok: false, code: "EXTENSION_AUTH_INVALID" },
        401,
        "AUTH_REFRESH_INVALID",
      ],
      [
        { ok: false, code: "EXTENSION_AUTH_RATE_LIMITED" },
        429,
        "AUTH_RATE_LIMITED",
      ],
      [{ ok: false, code: "SERVICE_UNAVAILABLE" }, 503, "SERVICE_UNAVAILABLE"],
    ]) {
      const { app } = fixture(result);
      const response = await app.inject({
        method: "POST",
        url: "/v1/auth/refresh",
        headers: { "idempotency-key": idempotencyKey },
        payload: { refreshToken },
      });
      expect(response.statusCode).toBe(status);
      expect(response.json().error).toMatchObject({
        code,
        correlationId: expect.any(String),
      });
      await app.close();
    }
  });
  it("T3 C exposes only a safe positive Retry-After for a rate decision", async () => {
    const { app } = fixture({
      ok: false,
      code: "EXTENSION_AUTH_RATE_LIMITED",
      retryAfterSeconds: 42,
    });
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      headers: { "idempotency-key": idempotencyKey },
      payload: { refreshToken },
    });
    expect(response.statusCode).toBe(429);
    expect(response.headers["retry-after"]).toBe("42");
    await app.close();
  });
  it("T3 E passes Fastify peer identity, not X-Forwarded-For", async () => {
    const { app, service } = fixture();
    await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      headers: {
        "idempotency-key": idempotencyKey,
        "x-forwarded-for": "198.51.100.1",
      },
      payload: { refreshToken },
    });
    expect(service.refresh.mock.calls[0]?.[3]).toBe("127.0.0.1");
    await app.close();
  });
});
