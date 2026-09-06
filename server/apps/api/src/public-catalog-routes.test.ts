import { describe, expect, it, vi } from "vitest";
import type {
  PublicCommercialCatalogReader,
  PublicCommercialOffer,
} from "@product/commercial-catalog";
import { PublicCommercialCatalogResponseV1Schema } from "@product/contracts";
import type { AppConfig } from "@product/shared";
import { createApiApp } from "./app.js";

const config: AppConfig = {
  environment: "test",
  databaseUrl: "postgres://test:test@localhost:5432/test",
  logLevel: "error",
  apiPort: 3000,
  workerReadyDelayMs: 0,
};

const ids = {
  planId: "123e4567-e89b-42d3-a456-426614174001",
  planRevisionId: "123e4567-e89b-42d3-a456-426614174002",
  priceId: "123e4567-e89b-42d3-a456-426614174003",
  priceRevisionId: "123e4567-e89b-42d3-a456-426614174004",
};

const evaluatedAt = new Date("2026-09-06T12:00:00.000Z");
const offer: PublicCommercialOffer = {
  plan: {
    planId: ids.planId,
    planCode: "starter",
    planRevisionId: ids.planRevisionId,
    planRevision: 1,
    displayName: "Starter",
    description: "Starter plan",
  },
  price: {
    priceId: ids.priceId,
    priceCode: "starter-monthly",
    priceRevisionId: ids.priceRevisionId,
    priceRevision: 1,
    amountMinor: 19000,
    currency: "RUB",
    billingIntervalUnit: "MONTH",
    billingIntervalCount: 1,
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
  },
};

function fixture(
  result: PublicCommercialOffer[] | Error = [offer],
  clock = () => evaluatedAt,
) {
  const reader: PublicCommercialCatalogReader = {
    listPublicOffers: vi.fn(async () => {
      if (result instanceof Error) throw result;
      return result;
    }),
  };
  const app = createApiApp({
    config,
    isInfrastructureReady: async () => true,
    publicCommercialCatalogReader: reader,
    catalogClock: clock,
  });
  return { app, reader };
}

describe("P4.5 public commercial catalog route", () => {
  it("is public and requires no Authorization header", async () => {
    const { app, reader } = fixture();
    const response = await app.inject({
      method: "GET",
      url: "/v1/plans/public?marketKey=ru&channelKey=web",
    });
    expect(response.statusCode).toBe(200);
    expect(reader.listPublicOffers).toHaveBeenCalledWith({
      marketKey: "ru",
      channelKey: "web",
      at: evaluatedAt,
    });
    await app.close();
  });

  it("returns no-store for successful catalog reads", async () => {
    const { app } = fixture();
    const response = await app.inject(
      "/v1/plans/public?marketKey=ru&channelKey=web",
    );
    expect(response.headers["cache-control"]).toBe("no-store");
    await app.close();
  });

  it("preserves a syntactically valid request id", async () => {
    const { app } = fixture();
    const response = await app.inject({
      method: "GET",
      url: "/v1/plans/public?marketKey=ru&channelKey=web",
      headers: { "x-request-id": "catalog-request-1" },
    });
    expect(response.headers["x-request-id"]).toBe("catalog-request-1");
    await app.close();
  });

  it("rejects a missing marketKey", async () => {
    const { app, reader } = fixture();
    const response = await app.inject("/v1/plans/public?channelKey=web");
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_REQUEST");
    expect(reader.listPublicOffers).not.toHaveBeenCalled();
    await app.close();
  });

  it("rejects a missing channelKey", async () => {
    const { app, reader } = fixture();
    const response = await app.inject("/v1/plans/public?marketKey=ru");
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_REQUEST");
    expect(reader.listPublicOffers).not.toHaveBeenCalled();
    await app.close();
  });

  it("rejects malformed market and channel identifiers", async () => {
    const { app, reader } = fixture();
    for (const url of [
      "/v1/plans/public?marketKey=RU&channelKey=web",
      "/v1/plans/public?marketKey=ru&channelKey=web%2Fcheckout",
    ]) {
      const response = await app.inject(url);
      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("INVALID_REQUEST");
    }
    expect(reader.listPublicOffers).not.toHaveBeenCalled();
    await app.close();
  });

  it("rejects an unknown query field and arbitrary-time input", async () => {
    const { app, reader } = fixture();
    for (const url of [
      "/v1/plans/public?marketKey=ru&channelKey=web&extra=1",
      "/v1/plans/public?marketKey=ru&channelKey=web&at=2026-09-06T12%3A00%3A00Z",
    ]) {
      const response = await app.inject(url);
      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("INVALID_REQUEST");
    }
    expect(reader.listPublicOffers).not.toHaveBeenCalled();
    await app.close();
  });

  it("maps a reader failure to safe 503", async () => {
    const { app } = fixture(new Error("SQL secret must not escape"));
    const response = await app.inject(
      "/v1/plans/public?marketKey=ru&channelKey=web",
    );
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Service unavailable",
        correlationId: expect.any(String),
      },
    });
    expect(response.body).not.toContain("SQL secret");
    await app.close();
  });

  it("returns 200 with an empty offers array", async () => {
    const { app } = fixture([]);
    const response = await app.inject(
      "/v1/plans/public?marketKey=ru&channelKey=web",
    );
    expect(response.statusCode).toBe(200);
    expect(response.json().offers).toEqual([]);
    await app.close();
  });

  it("materializes the strict camelCase response and excludes internal data", async () => {
    const { app } = fixture();
    const response = await app.inject(
      "/v1/plans/public?marketKey=ru&channelKey=web",
    );
    const body = PublicCommercialCatalogResponseV1Schema.parse(response.json());
    expect(body).toEqual({
      catalogVersion: "public_commercial_catalog_v1",
      generatedAt: evaluatedAt.toISOString(),
      marketKey: "ru",
      channelKey: "web",
      offers: [
        {
          plan: offer.plan,
          price: {
            priceId: ids.priceId,
            priceCode: "starter-monthly",
            priceRevisionId: ids.priceRevisionId,
            priceRevision: 1,
            amount: { amountMinor: 19000, currency: "RUB" },
            billingInterval: { unit: "MONTH", count: 1 },
            effectiveFrom: "2026-01-01T00:00:00.000Z",
            effectiveTo: null,
          },
        },
      ],
    });
    expect(response.body).not.toMatch(
      /accountId|entitlements|reason|assignment/i,
    );
    await app.close();
  });

  it("uses one injected server evaluation time for reader and response", async () => {
    const clock = vi.fn(() => evaluatedAt);
    const { app, reader } = fixture([offer], clock);
    const response = await app.inject(
      "/v1/plans/public?marketKey=ru&channelKey=web",
    );
    expect(clock).toHaveBeenCalledTimes(1);
    expect(
      (reader.listPublicOffers as ReturnType<typeof vi.fn>).mock.calls[0]![0]
        .at,
    ).toBe(evaluatedAt);
    expect(response.json().generatedAt).toBe(evaluatedAt.toISOString());
    await app.close();
  });

  it("does not require the optional reader at app construction", async () => {
    const app = (await import("./app.js")).createApiApp({
      config,
      isInfrastructureReady: async () => true,
    });
    const response = await app.inject(
      "/v1/plans/public?marketKey=ru&channelKey=web",
    );
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe("SERVICE_UNAVAILABLE");
    await app.close();
  });

  it("materializes exactly one catalog operation in OpenAPI", async () => {
    const { app } = fixture();
    await app.ready();
    const paths = (app.swagger() as { paths: Record<string, unknown> }).paths;
    expect(
      Object.keys(paths).filter((path) => path === "/v1/plans/public"),
    ).toHaveLength(1);
    expect((paths["/v1/plans/public"] as { get?: unknown }).get).toBeDefined();
    await app.close();
  });
});
