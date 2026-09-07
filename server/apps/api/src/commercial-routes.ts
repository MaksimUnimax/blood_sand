import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import type { AuthService } from "@product/auth";
import {
  ApiErrorEnvelopeV1Schema,
  PaymentHistoryQueryV1Schema,
  PaymentHistoryResponseV1Schema,
  SubscriptionQueryV1Schema,
  SubscriptionResponseV1Schema,
} from "@product/contracts";
import type { CommercialPortalService } from "@product/commercial-access";
import { ControlledError } from "./app.js";

const sessionCookie = "pcp_portal_session";
function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

async function portalUser(
  auth: AuthService,
  request: { cookies: Record<string, string | undefined> },
) {
  const token = request.cookies[sessionCookie];
  const active = token ? await auth.authenticate(token) : undefined;
  if (!active)
    throw new ControlledError(
      "AUTH_SESSION_INVALID",
      "Authentication required",
      401,
    );
  return active;
}

export function registerCommercialRoutes(
  app: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >,
  auth: AuthService,
  service: CommercialPortalService,
): void {
  app.get(
    "/v1/subscription",
    {
      schema: {
        querystring: SubscriptionQueryV1Schema,
        response: {
          200: SubscriptionResponseV1Schema,
          400: ApiErrorEnvelopeV1Schema,
          401: ApiErrorEnvelopeV1Schema,
          403: ApiErrorEnvelopeV1Schema,
          503: ApiErrorEnvelopeV1Schema,
        },
      },
    },
    async (request, reply) => {
      const active = await portalUser(auth, request);
      const query = SubscriptionQueryV1Schema.parse(request.query);
      let result;
      try {
        result = await service.readSubscription(active.userId, query.accountId);
      } catch {
        throw new ControlledError(
          "SERVICE_UNAVAILABLE",
          "Service unavailable",
          503,
        );
      }
      if (result.kind === "ACCOUNT_FORBIDDEN")
        throw new ControlledError(
          "ACCOUNT_FORBIDDEN",
          "Account access forbidden",
          403,
        );
      if (result.kind !== "OK")
        throw new ControlledError(
          "SERVICE_UNAVAILABLE",
          "Service unavailable",
          503,
        );
      reply.header("cache-control", "no-store");
      return reply.send({
        ...result.value,
        subscription: result.value.subscription
          ? {
              id: result.value.subscription.id,
              state: result.value.subscription.state,
              stateRevision: result.value.subscription.stateRevision,
              plan: result.value.subscription.plan,
              price: result.value.subscription.price
                ? {
                    priceRevisionId:
                      result.value.subscription.price.priceRevisionId,
                    amountMinor: result.value.subscription.price.amountMinor,
                    currency: result.value.subscription.price.currency,
                    billingInterval: {
                      unit: result.value.subscription.price.billingIntervalUnit,
                      count:
                        result.value.subscription.price.billingIntervalCount,
                    },
                  }
                : null,
              currentPeriodStart: iso(
                result.value.subscription.currentPeriodStart,
              ),
              currentPeriodEnd: iso(result.value.subscription.currentPeriodEnd),
              graceUntil: result.value.subscription.graceUntil
                ? iso(result.value.subscription.graceUntil)
                : null,
              cancelAtPeriodEnd: result.value.subscription.cancelAtPeriodEnd,
            }
          : null,
      });
    },
  );

  app.get(
    "/v1/billing/payments",
    {
      schema: {
        querystring: PaymentHistoryQueryV1Schema,
        response: {
          200: PaymentHistoryResponseV1Schema,
          400: ApiErrorEnvelopeV1Schema,
          401: ApiErrorEnvelopeV1Schema,
          403: ApiErrorEnvelopeV1Schema,
          503: ApiErrorEnvelopeV1Schema,
        },
      },
    },
    async (request, reply) => {
      const active = await portalUser(auth, request);
      const query = PaymentHistoryQueryV1Schema.parse(request.query);
      let result;
      try {
        result = await service.listPayments(
          active.userId,
          query.accountId,
          query.limit ?? 50,
          query.cursor,
        );
      } catch {
        throw new ControlledError(
          "SERVICE_UNAVAILABLE",
          "Service unavailable",
          503,
        );
      }
      if (result.kind === "ACCOUNT_FORBIDDEN")
        throw new ControlledError(
          "ACCOUNT_FORBIDDEN",
          "Account access forbidden",
          403,
        );
      if (result.kind === "INVALID_CURSOR")
        throw new ControlledError("INVALID_REQUEST", "Invalid request", 400);
      if (result.kind !== "OK")
        throw new ControlledError(
          "SERVICE_UNAVAILABLE",
          "Service unavailable",
          503,
        );
      reply.header("cache-control", "no-store");
      return reply.send({
        payments: result.payments.map((payment) => ({
          ...payment,
          createdAt: payment.createdAt.toISOString(),
          confirmedAt: payment.confirmedAt?.toISOString() ?? null,
        })),
        nextCursor: result.nextCursor ?? null,
      });
    },
  );
}
