import { describe, expect, it, vi } from "vitest";
import {
  AdminAuthService,
  deriveAdminAuthKeys,
  permissionsForRoles,
  type AdminAuthRepository,
  type AdminRole,
} from "@product/admin-auth";
import type { AdminAiService } from "@product/admin-ai";
import type { AppConfig } from "@product/shared";
import { createApiApp } from "./app.js";

const principalId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const sessionId = "00000000-0000-4000-8000-000000000003";
const token = "admin-session-token";
const config: AppConfig = {
  environment: "test",
  databaseUrl: "postgres://test:test@localhost/test",
  logLevel: "error",
  apiPort: 0,
  workerReadyDelayMs: 0,
};

function fixture(role: AdminRole = "ADMIN_SUPPORT") {
  const repository: AdminAuthRepository = {
    createAdminSession: vi.fn(),
    authenticateAdminSession: vi.fn(async () => ({
      kind: "authenticated" as const,
      subject: {
        adminPrincipalId: principalId,
        userId,
        adminSessionId: sessionId,
        roles: [role],
        expiresAt: new Date("2030-01-01T00:30:00Z"),
      },
    })),
    revokeAdminSession: vi.fn(async () => "revoked" as const),
    bootstrapOwner: vi.fn(),
  };
  const adminAuth = new AdminAuthService(
    repository,
    deriveAdminAuthKeys(Buffer.alloc(32, 9)),
    () => new Date("2030-01-01T00:00:00Z"),
  );
  const listAdapters = vi.fn(async () => ({ items: [], nextCursor: null }));
  const service = {
    listAdapters,
    createAdapter: vi.fn(),
  } as unknown as AdminAiService;
  const app = createApiApp({
    config,
    isInfrastructureReady: async () => true,
    adminAuthService: adminAuth,
    adminAiService: service,
  });
  const csrf = adminAuth.csrf(token);
  return {
    app,
    service,
    listAdapters,
    headers: {
      cookie: `pcp_admin_session=${token}; pcp_admin_csrf=${csrf}`,
      "x-csrf-token": csrf,
    },
  };
}

describe("P7.4 admin AI route security", () => {
  it("allows support safe registry reads", async () => {
    const f = fixture();
    const response = await f.app.inject({
      method: "GET",
      url: "/v1/admin/ai/registry/adapters",
      headers: f.headers,
    });
    expect(response.statusCode).toBe(200);
    expect(f.listAdapters).toHaveBeenCalled();
    expect(permissionsForRoles(["ADMIN_SUPPORT"])).toContain(
      "ai.registry.read",
    );
    await f.app.close();
  });
  it("rejects support registry mutations despite a valid CSRF token", async () => {
    const f = fixture();
    const response = await f.app.inject({
      method: "POST",
      url: "/v1/admin/ai/registry/adapters",
      headers: f.headers,
      payload: {
        machineKey: "chatgpt",
        displayName: "ChatGPT",
        description: "",
        reason: "onboard",
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_FORBIDDEN");
    await f.app.close();
  });
  it("rejects every cookie mutation without admin CSRF", async () => {
    const f = fixture("ADMIN_OWNER");
    const response = await f.app.inject({
      method: "POST",
      url: "/v1/admin/ai/registry/adapters",
      headers: { cookie: f.headers.cookie },
      payload: {
        machineKey: "chatgpt",
        displayName: "ChatGPT",
        description: "",
        reason: "onboard",
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_CSRF_INVALID");
    await f.app.close();
  });
});
