import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import type { PublicCommercialCatalogReader } from "@product/commercial-catalog";
import {
  ApiErrorEnvelopeV1Schema,
  PublicCommercialCatalogQueryV1Schema,
  PublicCommercialCatalogResponseV1Schema,
} from "@product/contracts";
import { ControlledError } from "./app.js";

function unavailable(): ControlledError {
  return new ControlledError("SERVICE_UNAVAILABLE", "Service unavailable", 503);
}

export function registerPublicCatalogRoutes(
  app: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >,
  reader: PublicCommercialCatalogReader | undefined,
  clock: () => Date,
): void {
  app.get(
    "/v1/plans/public",
    {
      schema: {
        summary: "List public commercial offers",
        description:
          "Lists currently sellable immutable plan and price offers for an explicit market and channel using one server evaluation time.",
        tags: ["catalog"],
        querystring: PublicCommercialCatalogQueryV1Schema,
        response: {
          200: PublicCommercialCatalogResponseV1Schema,
          400: ApiErrorEnvelopeV1Schema,
          503: ApiErrorEnvelopeV1Schema,
        },
      },
    },
    async (request, reply) => {
      if (!reader) throw unavailable();
      const query = PublicCommercialCatalogQueryV1Schema.parse(request.query);
      const at = clock();
      if (Number.isNaN(at.getTime())) throw unavailable();
      try {
        const offers = await reader.listPublicOffers({ ...query, at });
        const body = PublicCommercialCatalogResponseV1Schema.parse({
          catalogVersion: "public_commercial_catalog_v1",
          generatedAt: at.toISOString(),
          marketKey: query.marketKey,
          channelKey: query.channelKey,
          offers: offers.map((offer) => ({
            plan: offer.plan,
            price: {
              priceId: offer.price.priceId,
              priceCode: offer.price.priceCode,
              priceRevisionId: offer.price.priceRevisionId,
              priceRevision: offer.price.priceRevision,
              amount: {
                amountMinor: offer.price.amountMinor,
                currency: offer.price.currency,
              },
              billingInterval: {
                unit: offer.price.billingIntervalUnit,
                count: offer.price.billingIntervalCount,
              },
              effectiveFrom: offer.price.effectiveFrom.toISOString(),
              effectiveTo: offer.price.effectiveTo?.toISOString() ?? null,
            },
          })),
        });
        reply.header("cache-control", "no-store");
        return reply.status(200).send(body);
      } catch {
        throw unavailable();
      }
    },
  );
}
