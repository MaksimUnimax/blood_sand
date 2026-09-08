import { afterEach, describe, expect, it } from "vitest";
import {
  ADMIN_PERMISSIONS,
  AdminAuthService,
  type AdminPermission,
  type AdminSubject,
} from "@product/admin-auth";
import {
  AdminBillingService,
  type AdminBillingEvent,
  type AdminPayment,
  type AdminReconciliationJob,
  type AdminSubscriptionCommandPort,
} from "@product/admin-billing";
import { createApiApp } from "./app.js";

const accountId = "00000000-0000-4000-8000-000000000004";
const subscriptionId = "00000000-0000-4000-8000-000000000005";
const planRevisionId = "00000000-0000-4000-8000-000000000006";
const actorId = "00000000-0000-4000-8000-000000000001";
const token = "admin-token";
const csrf = "valid-admin-csrf";
const cookie = `pcp_admin_session=${token}`;
const mutationHeaders = {
  cookie: `${cookie}; pcp_admin_csrf=${csrf}`,
  "x-csrf-token": csrf,
};
const periodEnd = "2027-01-01T00:00:00+00:00";
const snapshot = {
  id: subscriptionId,
  accountId,
  state: "ACTIVE" as const,
  stateRevision: 4,
  currentPlanRevisionId: planRevisionId,
  boundPriceRevisionId: null,
  startedAt: new Date("2026-09-01T00:00:00Z"),
  currentPeriodStart: new Date("2026-09-01T00:00:00Z"),
  currentPeriodEnd: new Date(periodEnd),
  graceUntil: null,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  suspendedAt: null,
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-08T00:00:00Z"),
};

const payment: AdminPayment = {
  id: "00000000-0000-4000-8000-000000000010",
  subscriptionId,
  state: "SUCCEEDED",
  priceRevisionId: "00000000-0000-4000-8000-000000000011",
  amountMinor: 1990,
  currency: "RUB",
  plan: {
    planRevisionId,
    planCode: "pro",
    planRevision: 2,
    displayName: "Pro",
  },
  billingInterval: { unit: "MONTH", count: 1 },
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-01T00:01:00Z"),
  confirmedAt: new Date("2026-09-01T00:01:00Z"),
};
const event: AdminBillingEvent = {
  id: "00000000-0000-4000-8000-000000000012",
  source: "WEBHOOK",
  eventType: "payment.succeeded",
  processingState: "APPLIED",
  paymentId: payment.id,
  subscriptionId,
  failureCode: null,
  receivedAt: new Date("2026-09-01T00:02:00Z"),
  verifiedAt: new Date("2026-09-01T00:02:00Z"),
  processedAt: new Date("2026-09-01T00:02:01Z"),
  createdAt: new Date("2026-09-01T00:02:00Z"),
};
const job: AdminReconciliationJob = {
  paymentId: payment.id,
  state: "SETTLED",
  nextAttemptAt: null,
  leaseUntil: null,
  attemptCount: 2,
  lastResultCode: null,
  createdAt: new Date("2026-09-01T00:02:00Z"),
  updatedAt: new Date("2026-09-01T00:03:00Z"),
};

function makeApp(
  options: {
    permissions?: readonly AdminPermission[];
    csrfValid?: boolean;
    commandResult?: unknown;
    rows?: {
      payments?: AdminPayment[];
      events?: AdminBillingEvent[];
      jobs?: AdminReconciliationJob[];
    };
  } = {},
) {
  const calls: { operation: string; input: unknown }[] = [];
  const subject: AdminSubject = {
    adminPrincipalId: actorId,
    userId: "00000000-0000-4000-8000-000000000002",
    adminSessionId: "00000000-0000-4000-8000-000000000003",
    roles: ["ADMIN_OWNER"],
    permissions: [...(options.permissions ?? ADMIN_PERMISSIONS)],
    expiresAt: new Date("2026-09-09T00:00:00Z"),
  };
  const result = options.commandResult ?? {
    kind: "OK",
    changed: true,
    value: snapshot,
  };
  const commands: AdminSubscriptionCommandPort = {
    grant: async (input) => {
      calls.push({ operation: "GRANT", input });
      return result as never;
    },
    extend: async (input) => {
      calls.push({ operation: "EXTEND", input });
      return result as never;
    },
    suspend: async (input) => {
      calls.push({ operation: "SUSPEND", input });
      return result as never;
    },
    restore: async (input) => {
      calls.push({ operation: "RESTORE", input });
      return result as never;
    },
  };
  const reads = {
    listPayments: async () => ({ items: options.rows?.payments ?? [payment] }),
    listEvents: async () => ({ items: options.rows?.events ?? [event] }),
    listReconciliationJobs: async () => ({
      items: options.rows?.jobs ?? [job],
    }),
  };
  const adminAuth = {
    authenticateAdminSession: async () => ({
      ok: true as const,
      value: subject,
    }),
    authorize: (candidate: AdminSubject, permission: string) =>
      candidate.permissions.includes(permission as never)
        ? { ok: true as const, value: true as const }
        : { ok: false as const, code: "ADMIN_FORBIDDEN" as const },
    csrfValid: () => options.csrfValid ?? true,
  } as unknown as AdminAuthService;
  const app = createApiApp({
    config: {
      environment: "test",
      databaseUrl: "postgres://unused",
      logLevel: "error",
      apiPort: 0,
      workerReadyDelayMs: 0,
    },
    isInfrastructureReady: async () => true,
    adminAuthService: adminAuth,
    adminBillingService: new AdminBillingService(commands, reads),
  });
  return { app, calls };
}

const readRoutes = [
  `/v1/admin/accounts/${accountId}/billing/payments`,
  `/v1/admin/accounts/${accountId}/billing/events`,
  `/v1/admin/accounts/${accountId}/billing/reconciliation-jobs`,
] as const;
const mutationRoutes = [
  `/v1/admin/accounts/${accountId}/subscription/grant`,
  `/v1/admin/accounts/${accountId}/subscription/${subscriptionId}/extend`,
  `/v1/admin/accounts/${accountId}/subscription/${subscriptionId}/suspend`,
  `/v1/admin/accounts/${accountId}/subscription/${subscriptionId}/restore`,
] as const;

describe("P6.3 admin billing API boundary", () => {
  const apps: ReturnType<typeof makeApp>["app"][] = [];
  afterEach(async () => {
    for (const app of apps.splice(0)) await app.close();
  });

  it.each(readRoutes)("requires an admin session for read %s", async (url) => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({ method: "GET", url });
    expect(response.statusCode).toBe(401);
  });

  it.each(readRoutes)("allows read %s without CSRF", async (url) => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url,
      headers: { cookie },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it.each(mutationRoutes)("requires CSRF for mutation %s", async (url) => {
    const { app } = makeApp({ csrfValid: false });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url,
      headers: { cookie },
      payload: url.endsWith("grant")
        ? { planRevisionId, currentPeriodEnd: periodEnd, reason: "ticket" }
        : url.endsWith("extend")
          ? {
              expectedStateRevision: 4,
              newCurrentPeriodEnd: periodEnd,
              reason: "ticket",
            }
          : { expectedStateRevision: 4, reason: "ticket" },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_CSRF_INVALID");
  });

  it("denies billing reads without billing.read", async () => {
    const { app } = makeApp({ permissions: ["subscription.read"] });
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: readRoutes[0],
      headers: { cookie },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_FORBIDDEN");
  });

  it("denies grant without subscription.grant", async () => {
    const { app } = makeApp({ permissions: ["billing.read"] });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[0],
      headers: mutationHeaders,
      payload: {
        planRevisionId,
        currentPeriodEnd: periodEnd,
        reason: "ticket",
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it("denies extend without subscription.extend", async () => {
    const { app } = makeApp({ permissions: ["billing.read"] });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[1],
      headers: mutationHeaders,
      payload: {
        expectedStateRevision: 4,
        newCurrentPeriodEnd: periodEnd,
        reason: "ticket",
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it("denies suspend without subscription.suspend", async () => {
    const { app } = makeApp({ permissions: ["billing.read"] });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[2],
      headers: mutationHeaders,
      payload: { expectedStateRevision: 4, reason: "ticket" },
    });
    expect(response.statusCode).toBe(403);
  });

  it("denies restore without subscription.restore", async () => {
    const { app } = makeApp({ permissions: ["billing.read"] });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[3],
      headers: mutationHeaders,
      payload: { expectedStateRevision: 4, reason: "ticket" },
    });
    expect(response.statusCode).toBe(403);
  });

  it.each([
    {
      name: "grant",
      url: mutationRoutes[0],
      payload: {
        planRevisionId,
        currentPeriodEnd: periodEnd,
        reason: "ticket",
        extra: true,
      },
    },
    {
      name: "extend",
      url: mutationRoutes[1],
      payload: {
        expectedStateRevision: 4,
        newCurrentPeriodEnd: periodEnd,
        reason: "ticket",
        extra: true,
      },
    },
    {
      name: "suspend",
      url: mutationRoutes[2],
      payload: { expectedStateRevision: 4, reason: "ticket", extra: true },
    },
    {
      name: "restore",
      url: mutationRoutes[3],
      payload: { expectedStateRevision: 4, reason: "ticket", extra: true },
    },
  ])("strictly rejects unknown $name body fields", async ({ url, payload }) => {
    const { app, calls } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url,
      headers: mutationHeaders,
      payload,
    });
    expect(response.statusCode).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("rejects a non-offset grant timestamp", async () => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[0],
      headers: mutationHeaders,
      payload: {
        planRevisionId,
        currentPeriodEnd: "2027-01-01T00:00:00",
        reason: "ticket",
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it("rejects a non-offset extension timestamp", async () => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[1],
      headers: mutationHeaders,
      payload: {
        expectedStateRevision: 4,
        newCurrentPeriodEnd: "2027-01-01T00:00:00",
        reason: "ticket",
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it.each([
    {
      name: "grant",
      url: mutationRoutes[0],
      payload: {
        planRevisionId,
        currentPeriodEnd: periodEnd,
        reason: "ticket",
      },
    },
    {
      name: "extend",
      url: mutationRoutes[1],
      payload: {
        expectedStateRevision: 4,
        newCurrentPeriodEnd: periodEnd,
        reason: "ticket",
      },
    },
    {
      name: "suspend",
      url: mutationRoutes[2],
      payload: { expectedStateRevision: 4, reason: "ticket" },
    },
    {
      name: "restore",
      url: mutationRoutes[3],
      payload: { expectedStateRevision: 4, reason: "ticket" },
    },
  ])("maps $name to its P5 command port", async ({ name, url, payload }) => {
    const { app, calls } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url,
      headers: mutationHeaders,
      payload,
    });
    expect(response.statusCode).toBe(200);
    expect(calls[0]?.operation).toBe(name.toUpperCase());
    expect(response.json().subscription).not.toHaveProperty("stateReason");
  });

  it.each([
    "ACCOUNT_NOT_FOUND",
    "SUBSCRIPTION_NOT_FOUND",
    "PLAN_REVISION_NOT_FOUND",
  ] as const)("maps P5 not-found %s to the safe admin 404", async (code) => {
    const { app } = makeApp({ commandResult: { kind: "REJECTED", code } });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[0],
      headers: mutationHeaders,
      payload: {
        planRevisionId,
        currentPeriodEnd: periodEnd,
        reason: "ticket",
      },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("ADMIN_RESOURCE_NOT_FOUND");
  });

  it.each([
    "SUBSCRIPTION_ALREADY_EXISTS",
    "PLAN_REVISION_NOT_PUBLISHED",
    "SUBSCRIPTION_PERIOD_INVALID",
    "SUBSCRIPTION_PERIOD_NOT_EXTENDED",
    "SUBSCRIPTION_GRACE_WINDOW_CONFLICT",
    "SUBSCRIPTION_STATE_TRANSITION_INVALID",
    "SUBSCRIPTION_ALREADY_SUSPENDED",
    "SUBSCRIPTION_NOT_SUSPENDED",
    "SUBSCRIPTION_RESTORE_ORIGIN_NOT_FOUND",
    "SUBSCRIPTION_PERIOD_ENDED",
    "SUBSCRIPTION_GRACE_ENDED",
  ] as const)("maps P5 conflict %s to ADMIN_CONFLICT", async (code) => {
    const { app } = makeApp({ commandResult: { kind: "REJECTED", code } });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[0],
      headers: mutationHeaders,
      payload: {
        planRevisionId,
        currentPeriodEnd: periodEnd,
        reason: "ticket",
      },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe("ADMIN_CONFLICT");
  });

  it("maps transaction-time authorization denial to ADMIN_FORBIDDEN", async () => {
    const { app } = makeApp({ commandResult: { kind: "ADMIN_FORBIDDEN" } });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[2],
      headers: mutationHeaders,
      payload: { expectedStateRevision: 4, reason: "ticket" },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ADMIN_FORBIDDEN");
  });

  it("maps corruption to service unavailable without raw error data", async () => {
    const { app } = makeApp({
      commandResult: { kind: "REJECTED", code: "SUBSCRIPTION_CORRUPTED" },
    });
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[3],
      headers: mutationHeaders,
      payload: { expectedStateRevision: 4, reason: "ticket" },
    });
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe("SERVICE_UNAVAILABLE");
    expect(JSON.stringify(response.json())).not.toContain(
      "SUBSCRIPTION_CORRUPTED",
    );
  });

  it("returns a non-empty safe payment projection", async () => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: readRoutes[0],
      headers: { cookie },
    });
    expect(response.statusCode).toBe(200);
    const item = response.json().items[0];
    expect(item.amountMinor).toBe(1990);
    expect(item).not.toHaveProperty("provider");
    expect(item).not.toHaveProperty("providerPaymentId");
    expect(item).not.toHaveProperty("idempotencyKeyHash");
    expect(item).not.toHaveProperty("requestFingerprintSha256");
  });

  it("returns a non-empty safe billing-event projection", async () => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: readRoutes[1],
      headers: { cookie },
    });
    const item = response.json().items[0];
    expect(response.statusCode).toBe(200);
    expect(item.eventType).toBe("payment.succeeded");
    expect(item).not.toHaveProperty("provider");
    expect(item).not.toHaveProperty("eventIdentity");
    expect(item).not.toHaveProperty("payloadSha256");
  });

  it("returns a non-empty safe reconciliation projection", async () => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: readRoutes[2],
      headers: { cookie },
    });
    const item = response.json().items[0];
    expect(response.statusCode).toBe(200);
    expect(item.attemptCount).toBe(2);
    expect(item).not.toHaveProperty("leaseToken");
    expect(item).not.toHaveProperty("providerPaymentId");
  });

  it("returns the strict mutation response and no-store header", async () => {
    const { app } = makeApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: mutationRoutes[1],
      headers: mutationHeaders,
      payload: {
        expectedStateRevision: 4,
        newCurrentPeriodEnd: periodEnd,
        reason: "ticket",
      },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.json()).toEqual({
      status: "applied",
      changed: true,
      subscription: {
        id: subscriptionId,
        accountId,
        state: "ACTIVE",
        stateRevision: 4,
        planRevisionId,
        boundPriceRevisionId: null,
        currentPeriodStart: "2026-09-01T00:00:00.000Z",
        currentPeriodEnd: "2027-01-01T00:00:00.000Z",
        graceUntil: null,
        cancelAtPeriodEnd: false,
        suspendedAt: null,
        updatedAt: "2026-09-08T00:00:00.000Z",
      },
    });
  });

  it("returns an empty successful page for an existing account", async () => {
    const { app } = makeApp({ rows: { payments: [], events: [], jobs: [] } });
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: readRoutes[0],
      headers: { cookie },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ items: [], nextCursor: null });
  });
});
