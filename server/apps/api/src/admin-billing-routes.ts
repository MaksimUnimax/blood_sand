import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import type { AdminBillingService } from "@product/admin-billing";
import {
  AdminAccountParamsV1Schema,
  AdminBillingEventsResponseV1Schema,
  AdminBillingQueryV1Schema,
  AdminPaymentsResponseV1Schema,
  AdminReconciliationJobsResponseV1Schema,
  AdminSubscriptionExtendBodyV1Schema,
  AdminSubscriptionGrantBodyV1Schema,
  AdminSubscriptionMutationBodyV1Schema,
  AdminSubscriptionMutationResponseV1Schema,
  AdminSubscriptionResourceParamsV1Schema,
  ApiErrorEnvelopeV1Schema,
} from "@product/contracts";
import { ControlledError } from "./app.js";
import type { AdminRouteGuard } from "./admin-route-guard.js";

type Api = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  Logger
>;

const noStore = (reply: { header(name: string, value: string): unknown }) =>
  reply.header("cache-control", "no-store");
const unavailable = () =>
  new ControlledError("SERVICE_UNAVAILABLE", "Service unavailable", 503);
const invalid = () =>
  new ControlledError("INVALID_REQUEST", "Invalid request", 400);

async function invoke<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch {
    throw unavailable();
  }
}

const notFoundCodes = new Set([
  "ACCOUNT_NOT_FOUND",
  "SUBSCRIPTION_NOT_FOUND",
  "PLAN_REVISION_NOT_FOUND",
]);
const conflictCodes = new Set([
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
]);
function mutationFailure(kind: string): ControlledError {
  if (kind === "ADMIN_FORBIDDEN")
    return new ControlledError(
      "ADMIN_FORBIDDEN",
      "Admin authentication failed",
      403,
    );
  if (kind === "ADMIN_RESOURCE_NOT_FOUND" || notFoundCodes.has(kind))
    return new ControlledError(
      "ADMIN_RESOURCE_NOT_FOUND",
      "Admin resource not found",
      404,
    );
  if (kind === "SUBSCRIPTION_STATE_STALE")
    return new ControlledError(
      "ADMIN_STATE_STALE",
      "Admin state is stale",
      409,
    );
  if (conflictCodes.has(kind))
    return new ControlledError(
      "ADMIN_CONFLICT",
      "Admin operation conflicts with current state",
      409,
    );
  return unavailable();
}
function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
function subscriptionResponse(value: {
  id: string;
  accountId: string;
  state: string;
  stateRevision: number;
  currentPlanRevisionId: string;
  boundPriceRevisionId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  graceUntil: Date | null;
  cancelAtPeriodEnd: boolean;
  suspendedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    status: "applied" as const,
    changed: true,
    subscription: {
      id: value.id,
      accountId: value.accountId,
      state: value.state,
      stateRevision: value.stateRevision,
      planRevisionId: value.currentPlanRevisionId,
      boundPriceRevisionId: value.boundPriceRevisionId,
      currentPeriodStart: value.currentPeriodStart.toISOString(),
      currentPeriodEnd: value.currentPeriodEnd.toISOString(),
      graceUntil: iso(value.graceUntil),
      cancelAtPeriodEnd: value.cancelAtPeriodEnd,
      suspendedAt: iso(value.suspendedAt),
      updatedAt: value.updatedAt.toISOString(),
    },
  };
}

export function registerAdminBillingRoutes(
  app: Api,
  guard: AdminRouteGuard,
  service: AdminBillingService,
): void {
  const readSchema = (response: unknown) => ({
    schema: {
      params: AdminAccountParamsV1Schema,
      querystring: AdminBillingQueryV1Schema,
      response: {
        200: response,
        400: ApiErrorEnvelopeV1Schema,
        401: ApiErrorEnvelopeV1Schema,
        403: ApiErrorEnvelopeV1Schema,
        404: ApiErrorEnvelopeV1Schema,
        503: ApiErrorEnvelopeV1Schema,
      },
    },
  });

  app.get(
    "/v1/admin/accounts/:account_id/billing/payments",
    readSchema(AdminPaymentsResponseV1Schema),
    async (request, reply) => {
      await guard.requireAdminPermission(request, "billing.read");
      const params = AdminAccountParamsV1Schema.parse(request.params);
      const query = AdminBillingQueryV1Schema.parse(request.query);
      const result = await invoke(() =>
        service.listPayments({ accountId: params.account_id, ...query }),
      );
      if ("kind" in result) {
        if (result.kind === "ACCOUNT_NOT_FOUND")
          throw mutationFailure(result.kind);
        if (result.kind === "INVALID_CURSOR") throw invalid();
        throw unavailable();
      }
      noStore(reply);
      return {
        items: result.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          confirmedAt: iso(item.confirmedAt),
        })),
        nextCursor: result.nextCursor ?? null,
      };
    },
  );

  app.get(
    "/v1/admin/accounts/:account_id/billing/events",
    readSchema(AdminBillingEventsResponseV1Schema),
    async (request, reply) => {
      await guard.requireAdminPermission(request, "billing.read");
      const params = AdminAccountParamsV1Schema.parse(request.params);
      const query = AdminBillingQueryV1Schema.parse(request.query);
      const result = await invoke(() =>
        service.listEvents({ accountId: params.account_id, ...query }),
      );
      if ("kind" in result) {
        if (result.kind === "ACCOUNT_NOT_FOUND")
          throw mutationFailure(result.kind);
        if (result.kind === "INVALID_CURSOR") throw invalid();
        throw unavailable();
      }
      noStore(reply);
      return {
        items: result.items.map((item) => ({
          ...item,
          receivedAt: item.receivedAt.toISOString(),
          verifiedAt: item.verifiedAt.toISOString(),
          processedAt: iso(item.processedAt),
          createdAt: item.createdAt.toISOString(),
        })),
        nextCursor: result.nextCursor ?? null,
      };
    },
  );

  app.get(
    "/v1/admin/accounts/:account_id/billing/reconciliation-jobs",
    readSchema(AdminReconciliationJobsResponseV1Schema),
    async (request, reply) => {
      await guard.requireAdminPermission(request, "billing.read");
      const params = AdminAccountParamsV1Schema.parse(request.params);
      const query = AdminBillingQueryV1Schema.parse(request.query);
      const result = await invoke(() =>
        service.listReconciliationJobs({
          accountId: params.account_id,
          ...query,
        }),
      );
      if ("kind" in result) {
        if (result.kind === "ACCOUNT_NOT_FOUND")
          throw mutationFailure(result.kind);
        if (result.kind === "INVALID_CURSOR") throw invalid();
        throw unavailable();
      }
      noStore(reply);
      return {
        items: result.items.map((item) => ({
          ...item,
          nextAttemptAt: iso(item.nextAttemptAt),
          leaseUntil: iso(item.leaseUntil),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
        nextCursor: result.nextCursor ?? null,
      };
    },
  );

  app.post(
    "/v1/admin/accounts/:account_id/subscription/grant",
    {
      schema: {
        params: AdminAccountParamsV1Schema,
        body: AdminSubscriptionGrantBodyV1Schema,
        response: {
          200: AdminSubscriptionMutationResponseV1Schema,
          400: ApiErrorEnvelopeV1Schema,
          401: ApiErrorEnvelopeV1Schema,
          403: ApiErrorEnvelopeV1Schema,
          404: ApiErrorEnvelopeV1Schema,
          409: ApiErrorEnvelopeV1Schema,
          503: ApiErrorEnvelopeV1Schema,
        },
      },
    },
    async (request, reply) => {
      const { subject } = await guard.requireAdminMutation(
        request,
        "subscription.grant",
      );
      const params = AdminAccountParamsV1Schema.parse(request.params);
      const body = AdminSubscriptionGrantBodyV1Schema.parse(request.body);
      const result = await invoke(() =>
        service.grant({
          accountId: params.account_id,
          actorId: subject.adminPrincipalId,
          correlationId: request.id,
          reason: body.reason,
          planRevisionId: body.planRevisionId,
          currentPeriodEnd: new Date(body.currentPeriodEnd),
        } as never),
      );
      if (result.kind !== "OK")
        throw mutationFailure(
          result.kind === "REJECTED" ? result.code : result.kind,
        );
      noStore(reply);
      return subscriptionResponse(result.value);
    },
  );

  for (const [path, permission, operation, bodySchema] of [
    [
      "/v1/admin/accounts/:account_id/subscription/:subscription_id/extend",
      "subscription.extend",
      "extend",
      AdminSubscriptionExtendBodyV1Schema,
    ],
    [
      "/v1/admin/accounts/:account_id/subscription/:subscription_id/suspend",
      "subscription.suspend",
      "suspend",
      AdminSubscriptionMutationBodyV1Schema,
    ],
    [
      "/v1/admin/accounts/:account_id/subscription/:subscription_id/restore",
      "subscription.restore",
      "restore",
      AdminSubscriptionMutationBodyV1Schema,
    ],
  ] as const) {
    app.post(
      path,
      {
        schema: {
          params: AdminSubscriptionResourceParamsV1Schema,
          body: bodySchema,
          response: {
            200: AdminSubscriptionMutationResponseV1Schema,
            400: ApiErrorEnvelopeV1Schema,
            401: ApiErrorEnvelopeV1Schema,
            403: ApiErrorEnvelopeV1Schema,
            404: ApiErrorEnvelopeV1Schema,
            409: ApiErrorEnvelopeV1Schema,
            503: ApiErrorEnvelopeV1Schema,
          },
        },
      },
      async (request, reply) => {
        const { subject } = await guard.requireAdminMutation(
          request,
          permission,
        );
        const params = AdminSubscriptionResourceParamsV1Schema.parse(
          request.params,
        );
        const body = bodySchema.parse(request.body) as {
          expectedStateRevision: number;
          reason: string;
          newCurrentPeriodEnd?: string;
        };
        const input = {
          accountId: params.account_id,
          subscriptionId: params.subscription_id,
          actorId: subject.adminPrincipalId,
          correlationId: request.id,
          reason: body.reason,
          expectedStateRevision: body.expectedStateRevision,
          newCurrentPeriodEnd: body.newCurrentPeriodEnd
            ? new Date(body.newCurrentPeriodEnd)
            : undefined,
        };
        const result = await invoke(() => service[operation](input as never));
        if (result.kind !== "OK")
          throw mutationFailure(
            result.kind === "REJECTED" ? result.code : result.kind,
          );
        noStore(reply);
        const response = subscriptionResponse(result.value);
        response.changed = result.changed;
        return response;
      },
    );
  }
}
