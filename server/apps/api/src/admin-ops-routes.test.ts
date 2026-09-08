import { afterEach, describe, expect, it } from "vitest";
import { createApiApp } from "./app.js";
import { AdminAuthService, type AdminSubject } from "@product/admin-auth";
import { AdminOpsService } from "@product/admin-ops";
import { generateOpenApiRepresentation } from "./openapi.js";

const token = "admin-token";
const subject: AdminSubject = {
  adminPrincipalId: "00000000-0000-4000-8000-000000000001",
  userId: "00000000-0000-4000-8000-000000000002",
  adminSessionId: "00000000-0000-4000-8000-000000000003",
  roles: ["ADMIN_OWNER"],
  permissions: [
    "account.read",
    "user.read",
    "subscription.read",
    "device.read",
    "device.revoke",
    "admin.audit.read",
    "admin.principal.read",
    "admin.principal.manage",
  ],
  expiresAt: new Date(Date.now() + 60_000),
};
const fakeOpsRepository = {
  listAccounts: async () => ({ items: [] }),
  listUsers: async () => ({ items: [] }),
  listDevices: async () => ({ items: [] }),
  listAuditEvents: async () => ({ items: [] }),
  listPrincipals: async () => ({ items: [] }),
  revokeDevice: async () => "NOT_FOUND" as const,
  createPrincipal: async () => ({ kind: "CONFLICT" as const }),
  grantRole: async () => ({ kind: "CONFLICT" as const }),
  revokeRole: async () => ({ kind: "CONFLICT" as const }),
  setPrincipalStatus: async () => ({ kind: "NOT_FOUND" as const }),
};

function makeApp() {
  const adminAuth = new AdminAuthService(
    {
      createAdminSession: async () => ({ kind: "forbidden" }),
      authenticateAdminSession: async () => ({
        kind: "authenticated",
        subject,
      }),
      revokeAdminSession: async () => "missing",
      bootstrapOwner: async () => ({ kind: "closed" }),
    },
    { session: Buffer.alloc(32), csrf: Buffer.alloc(32) },
  );
  return createApiApp({
    config: {
      environment: "test",
      databaseUrl: "postgres://unused",
      logLevel: "error",
      apiPort: 0,
      workerReadyDelayMs: 0,
    },
    isInfrastructureReady: async () => true,
    adminAuthService: adminAuth,
    adminOpsService: new AdminOpsService(
      fakeOpsRepository as never,
      {} as never,
    ),
  });
}
const adminCookie = `${"pcp_admin_session"}=${token}`;

describe("P6.2 admin API boundary", () => {
  const apps: Awaited<ReturnType<typeof makeApp>>[] = [];
  afterEach(async () => {
    for (const app of apps.splice(0)) await app.close();
  });

  it.each([
    ["GET", "/v1/admin/accounts"],
    ["GET", "/v1/admin/users"],
    ["GET", "/v1/admin/audit-events"],
    ["GET", "/v1/admin/principals"],
    ["GET", "/v1/admin/accounts/00000000-0000-4000-8000-000000000004/devices"],
  ] as const)("rejects unauthenticated read %s %s", async (method, url) => {
    const app = makeApp();
    apps.push(app);
    const response = await app.inject({ method, url });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("ADMIN_UNAUTHORIZED");
  });
  it("does not require CSRF for a read", async () => {
    const app = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/accounts",
      headers: { cookie: adminCookie },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
  });
  it("requires admin CSRF for device revoke", async () => {
    const app = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/accounts/00000000-0000-4000-8000-000000000004/devices/00000000-0000-4000-8000-000000000005/revoke",
      headers: { cookie: adminCookie },
      payload: { reason: "ticket" },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_CSRF_INVALID");
  });
  it("rejects unknown mutation fields strictly", async () => {
    const app = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/principals",
      headers: { cookie: adminCookie },
      payload: {
        userId: "00000000-0000-4000-8000-000000000004",
        initialRole: "ADMIN_OPS",
        reason: "ticket",
        extra: true,
      },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_REQUEST");
  });
  it("returns no-store for a principal read", async () => {
    const app = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/principals",
      headers: { cookie: adminCookie },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
  });
  it("publishes the exact 33 method tuples", async () => {
    const document = JSON.parse(await generateOpenApiRepresentation()) as {
      paths: Record<string, Record<string, unknown>>;
    };
    expect(
      Object.values(document.paths).reduce(
        (count, path) => count + Object.keys(path).length,
        0,
      ),
    ).toBe(33);
  });
});
