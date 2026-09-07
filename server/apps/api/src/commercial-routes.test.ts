import { describe, expect, it, vi } from "vitest";
import type { AuthService } from "@product/auth";
import type { CommercialPortalService } from "@product/commercial-access";
import type { AppConfig } from "@product/shared";
import { createApiApp } from "./app.js";

const config: AppConfig = {
  environment: "test",
  databaseUrl: "postgres://test:test@localhost/test",
  logLevel: "info" as AppConfig["logLevel"],
  apiPort: 0,
  workerReadyDelayMs: 0,
};
const accountId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const subscriptionId = "00000000-0000-4000-8000-000000000003";
const planRevisionId = "00000000-0000-4000-8000-000000000004";
const priceRevisionId = "00000000-0000-4000-8000-000000000005";
const safeSubscription = {
  accountId,
  access: { status: "ELIGIBLE" as const, reason: null },
  subscription: {
    id: subscriptionId,
    state: "ACTIVE" as const,
    stateRevision: 2,
    plan: {
      planRevisionId,
      planCode: "basic",
      planRevision: 1,
      displayName: "Basic",
    },
    price: {
      priceRevisionId,
      amountMinor: 1000,
      currency: "RUB",
      billingInterval: { unit: "MONTH" as const, count: 1 },
    },
    currentPeriodStart: "2030-01-01T00:00:00.000Z",
    currentPeriodEnd: "2030-02-01T00:00:00.000Z",
    graceUntil: null,
    cancelAtPeriodEnd: false,
  },
  deviceAllowance: {
    maxActive: 2,
    activeCount: 1,
    remaining: 1,
    overLimit: false,
  },
  billing: {
    purchaseStatus: "UNAVAILABLE" as const,
    reason: "PAYMENT_GO_LIVE_DEFERRED" as const,
  },
};
const internalSubscription = {
  id: subscriptionId,
  state: "ACTIVE" as const,
  stateRevision: 2,
  accountId,
  plan: safeSubscription.subscription.plan,
  price: {
    priceRevisionId,
    amountMinor: 1000,
    currency: "RUB",
    billingIntervalUnit: "MONTH" as const,
    billingIntervalCount: 1,
  },
  currentPeriodStart: new Date(
    safeSubscription.subscription.currentPeriodStart,
  ),
  currentPeriodEnd: new Date(safeSubscription.subscription.currentPeriodEnd),
  graceUntil: null,
  cancelAtPeriodEnd: false,
};
function fixture(
  subscriptionResult: unknown = {
    kind: "OK",
    value: { ...safeSubscription, subscription: internalSubscription },
  },
  paymentResult: unknown = { kind: "OK", payments: [], nextCursor: undefined },
) {
  const auth = {
    authenticate: vi.fn().mockResolvedValue({ userId, sessionId: "session" }),
  };
  const service = {
    readSubscription: vi.fn().mockResolvedValue(subscriptionResult),
    listPayments: vi.fn().mockResolvedValue(paymentResult),
  } as unknown as CommercialPortalService;
  return {
    auth,
    service,
    app: createApiApp({
      config,
      isInfrastructureReady: async () => true,
      authService: auth as unknown as AuthService,
      commercialPortalService: service,
    }),
  };
}

describe("P5.6 commercial read routes", () => {
  it("requires a portal session for subscription", async () => {
    const f = fixture();
    f.auth.authenticate.mockResolvedValueOnce(undefined);
    const response = await f.app.inject({
      url: `/v1/subscription?accountId=${accountId}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("AUTH_SESSION_INVALID");
    await f.app.close();
  });
  it("requires a portal session for payments", async () => {
    const f = fixture();
    f.auth.authenticate.mockResolvedValueOnce(undefined);
    const response = await f.app.inject({
      url: `/v1/billing/payments?accountId=${accountId}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(response.statusCode).toBe(401);
    await f.app.close();
  });
  it("returns no-store and exact safe subscription data", async () => {
    const f = fixture();
    const response = await f.app.inject({
      url: `/v1/subscription?accountId=${accountId}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.json()).toEqual(safeSubscription);
    expect(JSON.stringify(response.json())).not.toMatch(
      /provider|idempotency|event|reason.*audit/i,
    );
    await f.app.close();
  });
  it("maps owner denial to account forbidden", async () => {
    const f = fixture({ kind: "ACCOUNT_FORBIDDEN" });
    const response = await f.app.inject({
      url: `/v1/subscription?accountId=${accountId}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ACCOUNT_FORBIDDEN");
    await f.app.close();
  });
  it("does not enumerate missing accounts", async () => {
    const f = fixture({ kind: "ACCOUNT_NOT_FOUND" });
    const response = await f.app.inject({
      url: `/v1/subscription?accountId=${accountId}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe("SERVICE_UNAVAILABLE");
    await f.app.close();
  });
  it("accepts a suspended account read result", async () => {
    const f = fixture({
      kind: "OK",
      value: {
        ...safeSubscription,
        access: { status: "INELIGIBLE", reason: "ACCOUNT_SUSPENDED" },
        subscription: { ...internalSubscription, state: "SUSPENDED" },
        deviceAllowance: {
          maxActive: null,
          activeCount: 1,
          remaining: null,
          overLimit: false,
        },
      },
    });
    expect(
      (
        await f.app.inject({
          url: `/v1/subscription?accountId=${accountId}`,
          headers: { cookie: "pcp_portal_session=session" },
        })
      ).statusCode,
    ).toBe(200);
    await f.app.close();
  });
  it("rejects invalid subscription queries", async () => {
    const f = fixture();
    expect(
      (
        await f.app.inject({
          url: "/v1/subscription?accountId=bad",
          headers: { cookie: "pcp_portal_session=session" },
        })
      ).statusCode,
    ).toBe(400);
    expect(f.service.readSubscription).not.toHaveBeenCalled();
    await f.app.close();
  });
  it("returns payment history with no-store", async () => {
    const f = fixture(undefined, {
      kind: "OK",
      payments: [],
      nextCursor: undefined,
    });
    const response = await f.app.inject({
      url: `/v1/billing/payments?accountId=${accountId}&limit=50`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(f.service.listPayments).toHaveBeenCalledWith(
      userId,
      accountId,
      50,
      undefined,
    );
    await f.app.close();
  });
  it("defaults payment limit to 50", async () => {
    const f = fixture();
    await f.app.inject({
      url: `/v1/billing/payments?accountId=${accountId}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(f.service.listPayments).toHaveBeenCalledWith(
      userId,
      accountId,
      50,
      undefined,
    );
    await f.app.close();
  });
  it("passes a scoped cursor", async () => {
    const f = fixture();
    const cursor = "00000000-0000-4000-8000-000000000006";
    await f.app.inject({
      url: `/v1/billing/payments?accountId=${accountId}&limit=2&cursor=${cursor}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(f.service.listPayments).toHaveBeenCalledWith(
      userId,
      accountId,
      2,
      cursor,
    );
    await f.app.close();
  });
  it("maps invalid payment cursors to safe 400", async () => {
    const f = fixture(undefined, { kind: "INVALID_CURSOR" });
    const response = await f.app.inject({
      url: `/v1/billing/payments?accountId=${accountId}`,
      headers: { cookie: "pcp_portal_session=session" },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_REQUEST");
    await f.app.close();
  });
  it("does not expose checkout HTTP", async () => {
    const f = fixture();
    expect(
      (
        await f.app.inject({
          method: "POST",
          url: "/v1/billing/checkouts",
          payload: {},
        })
      ).statusCode,
    ).toBe(404);
    await f.app.close();
  });
});
