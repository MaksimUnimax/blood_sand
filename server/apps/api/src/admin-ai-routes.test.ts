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
const assignmentId = "00000000-0000-4000-8000-000000000004";
const baselineProfileRevisionId = "00000000-0000-4000-8000-000000000005";
const candidateProfileRevisionId = "00000000-0000-4000-8000-000000000006";
const mutationResult = {
  id: "00000000-0000-4000-8000-000000000007",
  revision: 2,
  mode: "ROLLOUT" as const,
  baselineProfileRevisionId,
  candidateProfileRevisionId,
  percentageBps: 5000,
  createdAt: new Date("2030-01-01T00:01:00Z"),
};
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
  const mutations = {
    direct: vi.fn(async () => mutationResult),
    rollout: vi.fn(async () => mutationResult),
    percentage: vi.fn(async () => mutationResult),
    pause: vi.fn(async () => mutationResult),
    resume: vi.fn(async () => mutationResult),
    complete: vi.fn(async () => mutationResult),
    rollback: vi.fn(async () => mutationResult),
  };
  const service = {
    listAdapters,
    createAdapter: vi.fn(),
    ...mutations,
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
    mutations,
    headers: {
      cookie: `pcp_admin_session=${token}; pcp_admin_csrf=${csrf}`,
      "x-csrf-token": csrf,
    },
  };
}

const mutationResponseFields = [
  "baselineProfileRevisionId",
  "candidateProfileRevisionId",
  "createdAt",
  "mode",
  "percentageBps",
  "revision",
];
type AssignmentMutationOperation =
  | "direct"
  | "rollout"
  | "percentage"
  | "pause"
  | "resume"
  | "complete"
  | "rollback";
const assignmentMutationCases: Array<{
  operation: AssignmentMutationOperation;
  body: Record<string, string | number | null>;
}> = [
  {
    operation: "direct",
    body: {
      baselineProfileRevisionId,
      expectedLatestAssignmentRevision: null,
      reason: "regression",
    },
  },
  {
    operation: "rollout",
    body: {
      baselineProfileRevisionId,
      candidateProfileRevisionId,
      percentageBps: 5000,
      expectedLatestAssignmentRevision: null,
      reason: "regression",
    },
  },
  {
    operation: "percentage",
    body: {
      percentageBps: 5000,
      expectedLatestAssignmentRevision: 1,
      reason: "regression",
    },
  },
  {
    operation: "pause",
    body: { expectedLatestAssignmentRevision: 1, reason: "regression" },
  },
  {
    operation: "resume",
    body: { expectedLatestAssignmentRevision: 1, reason: "regression" },
  },
  {
    operation: "complete",
    body: { expectedLatestAssignmentRevision: 1, reason: "regression" },
  },
  {
    operation: "rollback",
    body: {
      profileRevisionId: baselineProfileRevisionId,
      expectedLatestAssignmentRevision: 1,
      reason: "regression",
    },
  },
];

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

  it.each(assignmentMutationCases)(
    "serializes the accepted mutation response for $operation without internal fields",
    async ({ operation, body }) => {
      const f = fixture("ADMIN_OWNER");
      const response = await f.app.inject({
        method: "POST",
        url: `/v1/admin/ai/assignments/${assignmentId}/${operation}`,
        headers: f.headers,
        payload: body,
      });

      expect(response.statusCode).toBe(200);
      const responseBody = response.json();
      expect(Object.keys(responseBody).sort()).toEqual(mutationResponseFields);
      expect(responseBody).toEqual({
        revision: 2,
        mode: "ROLLOUT",
        baselineProfileRevisionId,
        candidateProfileRevisionId,
        percentageBps: 5000,
        createdAt: "2030-01-01T00:01:00.000Z",
      });
      expect(responseBody).not.toHaveProperty("id");
      expect(responseBody).not.toHaveProperty("assignmentId");
      expect(responseBody).not.toHaveProperty("cohortSeed");
      expect(responseBody).not.toHaveProperty("reason");
      expect(f.mutations[operation]).toHaveBeenCalledOnce();
      await f.app.close();
    },
  );
});
