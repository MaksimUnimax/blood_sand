import { describe, expect, it, vi } from "vitest";
import {
  AdminAuthService,
  deriveAdminAuthKeys,
  permissionsForRoles,
  type AdminAuthRepository,
  type AdminRole,
} from "@product/admin-auth";
import {
  AuthService,
  deriveAuthKeys,
  type AuthRepository,
} from "@product/auth";
import type { AppConfig } from "@product/shared";
import { createApiApp } from "./app.js";

const userId = "00000000-0000-4000-8000-000000000001";
const principalId = "00000000-0000-4000-8000-000000000002";
const adminSessionId = "00000000-0000-4000-8000-000000000003";
const now = new Date("2030-01-01T00:00:00.000Z");
const config: AppConfig = {
  environment: "test",
  databaseUrl: "postgres://test:test@localhost/test",
  logLevel: "error",
  apiPort: 0,
  workerReadyDelayMs: 0,
};
function authRepository(createdAt = now): AuthRepository {
  return {
    listOwnedAccounts: vi.fn(async () => []),
    requestOtp: vi.fn(async () => ({
      ok: false as const,
      code: "AUTH_RATE_LIMITED" as const,
    })),
    verifyOtp: vi.fn(async () => ({
      ok: false as const,
      code: "AUTH_OTP_INVALID" as const,
    })),
    authenticate: vi.fn(async () => ({
      sessionId: "portal-session",
      userId,
      createdAt,
    })),
    revoke: vi.fn(async () => "revoked" as const),
  };
}
function adminRepository(
  role: "owner" | "none" = "owner",
): AdminAuthRepository {
  const roles: AdminRole[] = role === "owner" ? ["ADMIN_OWNER"] : [];
  const supportRoles: AdminRole[] = ["ADMIN_SUPPORT"];
  return {
    createAdminSession: vi.fn(async (input) =>
      role === "none"
        ? { kind: "forbidden" as const }
        : {
            kind: "created" as const,
            subject: {
              adminPrincipalId: principalId,
              userId,
              adminSessionId,
              roles: [...roles],
              expiresAt: input.expiresAt,
            },
          },
    ),
    authenticateAdminSession: vi.fn(async () => ({
      kind: "authenticated" as const,
      subject: {
        adminPrincipalId: principalId,
        userId,
        adminSessionId,
        roles: supportRoles,
        expiresAt: new Date("2030-01-01T00:30:00Z"),
      },
    })),
    revokeAdminSession: vi.fn(async () => "revoked" as const),
    bootstrapOwner: vi.fn(async () => ({ kind: "closed" as const })),
  };
}
function fixture(
  repository = adminRepository(),
  portalCreatedAt = now,
  environment: AppConfig["environment"] = "test",
) {
  const portalAuth = new AuthService(
    authRepository(portalCreatedAt),
    deriveAuthKeys(Buffer.alloc(32, 4)),
    () => now,
  );
  const admin = new AdminAuthService(
    repository,
    deriveAdminAuthKeys(Buffer.alloc(32, 5)),
    () => now,
    () => "A".repeat(43),
  );
  return {
    app: createApiApp({
      config: { ...config, environment },
      isInfrastructureReady: async () => true,
      authService: portalAuth,
      adminAuthService: admin,
    }),
    portalAuth,
    repository,
  };
}
async function elevated(environment: AppConfig["environment"] = "test") {
  const f = fixture(undefined, now, environment);
  const portalCsrf = f.portalAuth.csrf("portal-token");
  const response = await f.app.inject({
    method: "POST",
    url: "/v1/admin/session",
    headers: {
      cookie: `pcp_portal_session=portal-token; pcp_csrf=${portalCsrf}`,
      "x-csrf-token": portalCsrf,
    },
  });
  const cookies = response.headers["set-cookie"] as string[];
  return {
    ...f,
    response,
    cookies,
    adminToken: cookies[0]!.split(";")[0]!.split("=")[1]!,
  };
}

describe("P6.1 minimal admin HTTP surface", () => {
  it("POST without a portal cookie is ADMIN_UNAUTHORIZED", async () => {
    const f = fixture();
    const response = await f.app.inject({
      method: "POST",
      url: "/v1/admin/session",
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("ADMIN_UNAUTHORIZED");
    await f.app.close();
  });
  it("POST requires portal double-submit CSRF", async () => {
    const f = fixture();
    const response = await f.app.inject({
      method: "POST",
      url: "/v1/admin/session",
      headers: { cookie: "pcp_portal_session=portal-token" },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_CSRF_INVALID");
    expect(f.repository.createAdminSession).not.toHaveBeenCalled();
    await f.app.close();
  });
  it("POST rejects portal authentication older than fifteen minutes", async () => {
    const f = fixture(undefined, new Date(now.getTime() - 900_001));
    const csrf = f.portalAuth.csrf("portal-token");
    const response = await f.app.inject({
      method: "POST",
      url: "/v1/admin/session",
      headers: {
        cookie: `pcp_portal_session=portal-token; pcp_csrf=${csrf}`,
        "x-csrf-token": csrf,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_REAUTH_REQUIRED");
    await f.app.close();
  });
  it("POST maps a non-admin user to ADMIN_FORBIDDEN", async () => {
    const f = fixture(adminRepository("none"));
    const csrf = f.portalAuth.csrf("portal-token");
    const response = await f.app.inject({
      method: "POST",
      url: "/v1/admin/session",
      headers: {
        cookie: `pcp_portal_session=portal-token; pcp_csrf=${csrf}`,
        "x-csrf-token": csrf,
      },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_FORBIDDEN");
    await f.app.close();
  });
  it("POST returns only safe status and expiry", async () => {
    const { app, response } = await elevated();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "authenticated",
      expiresAt: "2030-01-01T00:30:00.000Z",
    });
    expect(JSON.stringify(response.json())).not.toMatch(
      /token|csrf|principal/i,
    );
    await app.close();
  });
  it("sets distinct admin cookies with correct HttpOnly behavior", async () => {
    const { app, cookies } = await elevated("production");
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toMatch(
      /^pcp_admin_session=.*; Max-Age=1800; Path=\/; HttpOnly; Secure; SameSite=Strict/,
    );
    expect(cookies[1]).toMatch(
      /^pcp_admin_csrf=.*; Max-Age=1800; Path=\/; Secure; SameSite=Strict/,
    );
    expect(cookies[1]).not.toMatch(/HttpOnly/);
    expect(cookies.join("\n")).not.toMatch(/pcp_portal_session|pcp_csrf/);
    await app.close();
  });
  it("GET /me without an admin cookie is ADMIN_UNAUTHORIZED", async () => {
    const f = fixture();
    const response = await f.app.inject({ method: "GET", url: "/v1/admin/me" });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("ADMIN_UNAUTHORIZED");
    await f.app.close();
  });
  it("GET /me returns sorted safe roles and permissions", async () => {
    const f = await elevated();
    const response = await f.app.inject({
      method: "GET",
      url: "/v1/admin/me",
      headers: { cookie: `${f.cookies[0]}; ${f.cookies[1]}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "authenticated",
      principalId,
      roles: ["ADMIN_SUPPORT"],
      permissions: [...permissionsForRoles(["ADMIN_SUPPORT"])].sort(),
      expiresAt: "2030-01-01T00:30:00.000Z",
    });
    expect(JSON.stringify(response.json())).not.toMatch(
      /email|source|hash|csrf|token/i,
    );
    await f.app.close();
  });
  it("GET /me does not require CSRF", async () => {
    const f = await elevated();
    const response = await f.app.inject({
      method: "GET",
      url: "/v1/admin/me",
      headers: { cookie: f.cookies[0]! },
    });
    expect(response.statusCode).toBe(200);
    await f.app.close();
  });
  it("DELETE requires admin CSRF", async () => {
    const f = await elevated();
    const response = await f.app.inject({
      method: "DELETE",
      url: "/v1/admin/session",
      headers: { cookie: f.cookies[0]! },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_CSRF_INVALID");
    expect(f.repository.revokeAdminSession).not.toHaveBeenCalled();
    await f.app.close();
  });
  it("DELETE revokes and clears only admin cookies", async () => {
    const f = await elevated("production");
    const csrf = f.cookies[1]!.split(";")[0]!;
    const response = await f.app.inject({
      method: "DELETE",
      url: "/v1/admin/session",
      headers: {
        cookie: `${f.cookies[0]}; ${csrf}`,
        "x-csrf-token": csrf.split("=")[1],
      },
    });
    expect(response.statusCode).toBe(204);
    expect(f.repository.revokeAdminSession).toHaveBeenCalledOnce();
    expect((response.headers["set-cookie"] as string[]).join("\n")).toMatch(
      /pcp_admin_session=;/,
    );
    expect((response.headers["set-cookie"] as string[]).join("\n")).not.toMatch(
      /pcp_portal_session|pcp_csrf/,
    );
    await f.app.close();
  });
  it("all three admin responses are no-store", async () => {
    const f = await elevated();
    const me = await f.app.inject({
      method: "GET",
      url: "/v1/admin/me",
      headers: { cookie: f.cookies[0]! },
    });
    expect(f.response.headers["cache-control"]).toBe("no-store");
    expect(me.headers["cache-control"]).toBe("no-store");
    const csrf = f.cookies[1]!.split("=")[1]!.split(";")[0]!;
    const logout = await f.app.inject({
      method: "DELETE",
      url: "/v1/admin/session",
      headers: {
        cookie: `${f.cookies[0]}; ${f.cookies[1]}`,
        "x-csrf-token": csrf,
      },
    });
    expect(logout.headers["cache-control"]).toBe("no-store");
    await f.app.close();
  });
});
