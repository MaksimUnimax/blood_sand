import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabaseRuntime,
  createP4CommercialCatalogRepository,
  createP4PlanCommandRepository,
  createP4PriceCommandRepository,
  type DatabaseQuery,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";
import { runMigrations } from "../packages/db/src/migrations.js";
import type {
  CommandResult,
  PlanEntitlementCommandRepository,
  PlanMutationContext,
  PlanRevisionDraft,
  PlanSummary,
  TypedEntitlementValue,
} from "../packages/plans/src/index.js";
import type {
  PriceCommandRepository,
  PriceCommandResult,
  PriceRevisionDraft,
  PriceSummary,
  PublishedPriceRevision,
} from "../packages/pricing/src/index.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");

const at = new Date("2026-09-06T12:00:00.000Z");
const beforeSwitch = new Date("2026-09-06T11:59:59.999Z");
const switchAt = new Date("2026-09-06T12:00:00.000Z");
const afterSwitch = new Date("2026-09-06T12:00:00.001Z");
const code = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll("-", "")}`;
const system = (reason = "P4.5 integration test"): PlanMutationContext => ({
  actorType: "SYSTEM",
  correlationId: randomUUID(),
  reason,
});

let db: DatabaseRuntime;
let plans: PlanEntitlementCommandRepository;
let prices: PriceCommandRepository;
let catalog: ReturnType<typeof createP4CommercialCatalogRepository>;

const q = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values?: unknown[],
) => db.query<T>(text, values);

function ok<T>(result: CommandResult<T> | PriceCommandResult<T>): T {
  if (result.kind !== "OK") throw new Error(`expected OK, got ${result.code}`);
  return result.value;
}

async function auditCount(): Promise<number> {
  const result = await q<{ count: string }>(
    "SELECT count(*)::text AS count FROM audit_events",
  );
  return Number(result.rows[0]!.count);
}

async function resetCommercial(): Promise<void> {
  await q(
    "TRUNCATE checkout_intents,billing_events,subscription_transitions,payments,subscriptions,price_sale_assignments,account_entitlement_overrides,price_revisions,plan_entitlements,prices,plan_revisions,entitlement_definitions,plans,audit_events",
  );
}

type PlanFixture = {
  plan: PlanSummary;
  revision: PlanRevisionDraft;
};
type PriceFixture = PlanFixture & {
  price: PriceSummary;
  priceRevision: PriceRevisionDraft | PublishedPriceRevision;
};

async function createPlan(
  displayName = "Starter",
  description = "Starter plan",
): Promise<PlanFixture> {
  const plan = ok(await plans.createPlan({ code: code("p45-plan") }, system()));
  const revision = ok(
    await plans.createDraftPlanRevision(
      { planId: plan.id, displayName, description },
      system(),
    ),
  );
  return { plan, revision };
}

async function publishPlan(fixture: PlanFixture): Promise<void> {
  ok(
    await plans.publishPlanRevision(
      {
        planRevisionId: fixture.revision.id,
        expectedContentFingerprint: fixture.revision.contentFingerprintSha256,
      },
      system(),
    ),
  );
}

async function activatePlan(plan: PlanSummary): Promise<void> {
  ok(
    await plans.changePlanStatus(
      { planId: plan.id, expectedStatus: "DRAFT", targetStatus: "ACTIVE" },
      system(),
    ),
  );
}

async function createPrice(
  plan: PlanFixture,
  options: {
    codePrefix?: string;
    planRevisionId?: string;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    amountMinor?: number;
    marketKey?: string;
    channelKey?: string;
  } = {},
): Promise<PriceFixture> {
  const price = ok(
    await prices.createPrice(
      {
        planId: plan.plan.id,
        code: code(options.codePrefix ?? "p45-price"),
        marketKey: options.marketKey ?? "ru",
        channelKey: options.channelKey ?? "web",
      },
      system(),
    ),
  );
  const priceRevision = ok(
    await prices.createDraftPriceRevision(
      {
        priceId: price.id,
        planRevisionId: options.planRevisionId ?? plan.revision.id,
        amountMinor: options.amountMinor ?? 19000,
        currency: "RUB",
        billingIntervalUnit: "MONTH",
        billingIntervalCount: 1,
        effectiveFrom:
          options.effectiveFrom ?? new Date("2026-01-01T00:00:00.000Z"),
        effectiveTo: options.effectiveTo,
      },
      system(),
    ),
  );
  return { ...plan, price, priceRevision };
}

async function publishPrice(
  fixture: PriceFixture,
): Promise<PublishedPriceRevision> {
  return ok(
    await prices.publishPriceRevision(
      {
        priceRevisionId: fixture.priceRevision.id,
        expectedContentFingerprint:
          fixture.priceRevision.contentFingerprintSha256,
      },
      system(),
    ),
  );
}

async function createPriceRevision(
  fixture: PriceFixture,
  options: {
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    amountMinor?: number;
    planRevisionId?: string;
  } = {},
): Promise<PriceFixture> {
  const priceRevision = ok(
    await prices.createDraftPriceRevision(
      {
        priceId: fixture.price.id,
        planRevisionId: options.planRevisionId ?? fixture.revision.id,
        amountMinor: options.amountMinor ?? 19000,
        currency: "RUB",
        billingIntervalUnit: "MONTH",
        billingIntervalCount: 1,
        effectiveFrom:
          options.effectiveFrom ?? new Date("2026-01-01T00:00:00.000Z"),
        effectiveTo: options.effectiveTo,
      },
      system(),
    ),
  );
  return { ...fixture, priceRevision };
}

async function activatePrice(price: PriceSummary): Promise<void> {
  ok(
    await prices.changePriceStatus(
      { priceId: price.id, expectedStatus: "DRAFT", targetStatus: "ACTIVE" },
      system(),
    ),
  );
}

async function assign(
  price: PriceSummary,
  selectedPriceRevisionId: string | null,
  effectiveFrom = new Date("2026-01-01T00:00:00.000Z"),
  expectedLatestAssignmentRevision: number | null = null,
): Promise<void> {
  ok(
    await prices.schedulePriceSaleAssignment(
      {
        priceId: price.id,
        expectedLatestAssignmentRevision,
        selectedPriceRevisionId,
        effectiveFrom,
        reason: "P4.5 fixture assignment",
      },
      system(),
    ),
  );
}

async function activeOffer(
  options: {
    assign?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    amountMinor?: number;
    displayName?: string;
    description?: string;
    marketKey?: string;
    channelKey?: string;
  } = {},
): Promise<PriceFixture & { publishedPriceRevision: PublishedPriceRevision }> {
  const plan = await createPlan(options.displayName, options.description);
  await publishPlan(plan);
  await activatePlan(plan.plan);
  const fixture = await createPrice(plan, options);
  const publishedPriceRevision = await publishPrice(fixture);
  await activatePrice(fixture.price);
  if (options.assign !== false)
    await assign(
      fixture.price,
      publishedPriceRevision.id,
      options.effectiveFrom ?? new Date("2026-01-01T00:00:00.000Z"),
    );
  return { ...fixture, publishedPriceRevision };
}

async function compareP43AndPublic(
  fixture: PriceFixture,
  evaluationTime: Date,
): Promise<void> {
  const p43 = await prices.resolvePriceForNewSale({
    priceId: fixture.price.id,
    at: evaluationTime,
  });
  const publicOffers = await catalog.listPublicOffers({
    marketKey: "ru",
    channelKey: "web",
    at: evaluationTime,
  });
  expect(p43.kind === "RESOLVED").toBe(publicOffers.length > 0);
}

async function addPublishedPlanRevision(
  plan: PlanSummary,
  displayName: string,
  description: string,
): Promise<PlanRevisionDraft> {
  const revision = ok(
    await plans.createDraftPlanRevision(
      { planId: plan.id, displayName, description },
      system(),
    ),
  );
  ok(
    await plans.publishPlanRevision(
      {
        planRevisionId: revision.id,
        expectedContentFingerprint: revision.contentFingerprintSha256,
      },
      system(),
    ),
  );
  return revision;
}

async function addDefinition(
  entitlementKey: string,
  valueType: "BOOLEAN" | "INTEGER",
): Promise<void> {
  ok(
    await plans.createEntitlementDefinition(
      {
        entitlementKey,
        valueType,
        securityClassification:
          valueType === "BOOLEAN" ? "CAPABILITY" : "LIMIT",
        description: "P4.5 inspection definition",
      },
      system(),
    ),
  );
}

async function setDraftEntitlement(
  revision: PlanRevisionDraft,
  entitlementKey: string,
  value: TypedEntitlementValue,
): Promise<PlanRevisionDraft> {
  return ok(
    await plans.setDraftPlanEntitlement(
      {
        planRevisionId: revision.id,
        expectedContentFingerprint: revision.contentFingerprintSha256,
        entitlementKey,
        value,
      },
      system(),
    ),
  );
}

describe.sequential("P4.5 commercial catalog on real PostgreSQL", () => {
  beforeAll(async () => {
    db = createDatabaseRuntime(connectionString!);
    await db.ready();
    await runMigrations({ connectionString: connectionString! });
    plans = createP4PlanCommandRepository(db);
    prices = createP4PriceCommandRepository(db, { clock: () => at });
    catalog = createP4CommercialCatalogRepository(db);
  });
  beforeEach(resetCommercial);
  afterAll(() => db.close());

  it("1 active plan, price, selected published revision returns the exact offer", async () => {
    const fixture = await activeOffer();
    const offers = await catalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at,
    });
    expect(offers).toHaveLength(1);
    expect(offers[0]!.price.priceRevisionId).toBe(
      fixture.publishedPriceRevision.id,
    );
  });

  it("2 filters by exact marketKey", async () => {
    const fixture = await activeOffer();
    const other = await activeOffer({ marketKey: "kz" });
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toHaveLength(1);
    expect(
      (
        await catalog.listPublicOffers({
          marketKey: "kz",
          channelKey: "web",
          at,
        })
      )[0]!.price.priceId,
    ).toBe(other.price.id);
    expect(fixture.price.id).not.toBe(other.price.id);
  });

  it("3 filters by exact channelKey", async () => {
    const fixture = await activeOffer();
    const other = await activeOffer({ channelKey: "mobile" });
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toHaveLength(1);
    expect(
      (
        await catalog.listPublicOffers({
          marketKey: "ru",
          channelKey: "mobile",
          at,
        })
      )[0]!.price.priceId,
    ).toBe(other.price.id);
    expect(fixture.price.id).not.toBe(other.price.id);
  });

  it("4 omits a DRAFT plan", async () => {
    await activeOffer({ assign: false });
    await q("UPDATE plans SET status='DRAFT' WHERE true");
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("5 omits a HIDDEN plan", async () => {
    const fixture = await activeOffer();
    ok(
      await plans.changePlanStatus(
        {
          planId: fixture.plan.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    );
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("6 omits an ARCHIVED plan", async () => {
    const fixture = await activeOffer();
    ok(
      await plans.changePlanStatus(
        {
          planId: fixture.plan.id,
          expectedStatus: "ACTIVE",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("7 omits a DRAFT price", async () => {
    const fixture = await activeOffer();
    await q("UPDATE prices SET status='DRAFT' WHERE id=$1", [fixture.price.id]);
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("8 omits a HIDDEN price", async () => {
    const fixture = await activeOffer();
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    );
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("9 omits an ARCHIVED price", async () => {
    const fixture = await activeOffer();
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ACTIVE",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("10 omits a price with no assignment", async () => {
    await activeOffer({ assign: false });
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("11 omits an explicit NULL closure", async () => {
    const fixture = await activeOffer();
    await assign(fixture.price, null, new Date("2026-09-01T00:00:00.000Z"), 1);
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("12 ignores a future assignment before effectiveFrom", async () => {
    const fixture = await activeOffer({ assign: false });
    await assign(
      fixture.price,
      fixture.publishedPriceRevision.id,
      new Date("2026-09-10T00:00:00.000Z"),
    );
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("13 applies a future higher assignment at its effectiveFrom", async () => {
    const fixture = await activeOffer();
    const next = await createPriceRevision(fixture, {
      effectiveFrom: switchAt,
      amountMinor: 29000,
    });
    const nextRevision = await publishPrice(next);
    await assign(fixture.price, nextRevision.id, switchAt, 1);
    const offers = await catalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at: afterSwitch,
    });
    expect(offers[0]!.price.priceRevisionId).toBe(nextRevision.id);
  });

  it("14 sells a selected revision before effectiveTo", async () => {
    const fixture = await activeOffer({
      effectiveTo: new Date("2026-09-07T00:00:00.000Z"),
    });
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toHaveLength(1);
    expect(fixture.publishedPriceRevision.effectiveTo).not.toBeNull();
  });

  it("15 omits a selected revision at exact effectiveTo", async () => {
    await activeOffer({ effectiveTo: new Date("2026-09-06T12:00:00.000Z") });
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("16 does not fall back after selected revision expiry", async () => {
    const fixture = await activeOffer();
    const expired = await createPriceRevision(fixture, {
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      effectiveTo: new Date("2026-09-01T00:00:00.000Z"),
    });
    const expiredPublished = await publishPrice(expired);
    await assign(
      fixture.price,
      expiredPublished.id,
      new Date("2026-01-01T00:00:00.000Z"),
      1,
    );
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
  });

  it("17 supports multiple active price identities for one plan", async () => {
    const first = await activeOffer();
    const second = await createPrice(first, {
      codePrefix: "p45-second",
      amountMinor: 29000,
    });
    const secondPublished = await publishPrice(second);
    await activatePrice(second.price);
    await assign(second.price, secondPublished.id);
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toHaveLength(2);
  });

  it("18 allows one plan to expose offers bound to different plan revisions", async () => {
    const first = await activeOffer();
    const latest = await addPublishedPlanRevision(
      first.plan,
      "Latest",
      "Latest description",
    );
    const second = await createPrice(first, {
      codePrefix: "p45-second",
      planRevisionId: latest.id,
      amountMinor: 29000,
    });
    const secondPublished = await publishPrice(second);
    await activatePrice(second.price);
    await assign(second.price, secondPublished.id);
    const offers = await catalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at,
    });
    expect(new Set(offers.map((item) => item.plan.planRevisionId))).toEqual(
      new Set([first.revision.id, latest.id]),
    );
  });

  it("19 orders offers by planCode, priceCode, and immutable revision IDs", async () => {
    const first = await activeOffer();
    const second = await createPrice(first, {
      codePrefix: "p45-second",
      amountMinor: 29000,
    });
    const secondPublished = await publishPrice(second);
    await activatePrice(second.price);
    await assign(second.price, secondPublished.id);
    const offers = await catalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at,
    });
    const sorted = [...offers].sort(
      (a, b) =>
        a.plan.planCode.localeCompare(b.plan.planCode) ||
        a.price.priceCode.localeCompare(b.price.priceCode) ||
        a.plan.planRevisionId.localeCompare(b.plan.planRevisionId) ||
        a.price.priceRevisionId.localeCompare(b.price.priceRevisionId),
    );
    expect(offers).toEqual(sorted);
  });

  it("20 uses display metadata from the exact bound plan revision", async () => {
    const first = await activeOffer({
      displayName: "Old",
      description: "Old description",
    });
    await addPublishedPlanRevision(first.plan, "Latest", "Latest description");
    expect(
      (
        await catalog.listPublicOffers({
          marketKey: "ru",
          channelKey: "web",
          at,
        })
      )[0]!.plan.displayName,
    ).toBe("Old");
  });

  it("21 public reads create no audit event", async () => {
    const fixture = await activeOffer();
    const before = await auditCount();
    await catalog.listPublicOffers({ marketKey: "ru", channelKey: "web", at });
    await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.publishedPriceRevision.id,
      at,
    });
    expect(await auditCount()).toBe(before);
  });

  it("22 public offers exclude entitlements, overrides, and assignment internals", async () => {
    const fixture = await activeOffer();
    const offers = await catalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at,
    });
    const serialized = JSON.stringify(offers);
    expect(serialized).not.toMatch(
      /entitlement|accountId|assignmentId|reason|override/i,
    );
    expect(Object.keys(offers[0]!.price).sort()).toEqual([
      "amountMinor",
      "billingIntervalCount",
      "billingIntervalUnit",
      "currency",
      "effectiveFrom",
      "effectiveTo",
      "priceCode",
      "priceId",
      "priceRevision",
      "priceRevisionId",
    ]);
    expect(fixture.price.id).toBeDefined();
  });

  it("23 P4.3 conformance agrees for an ordinary selected offer", async () => {
    const fixture = await activeOffer();
    await compareP43AndPublic(fixture, at);
  });

  it("24 P4.3 conformance agrees before a future assignment", async () => {
    const fixture = await activeOffer();
    const next = await createPriceRevision(fixture, {
      effectiveFrom: switchAt,
    });
    const nextPublished = await publishPrice(next);
    await assign(fixture.price, nextPublished.id, switchAt, 1);
    await compareP43AndPublic(fixture, beforeSwitch);
  });

  it("25 P4.3 conformance agrees for explicit closure", async () => {
    const fixture = await activeOffer();
    await assign(fixture.price, null, new Date("2026-09-01T00:00:00.000Z"), 1);
    await compareP43AndPublic(fixture, at);
  });

  it("26 P4.3 conformance agrees for expiry", async () => {
    const fixture = await activeOffer({
      effectiveTo: new Date("2026-09-01T00:00:00.000Z"),
    });
    await compareP43AndPublic(fixture, at);
  });

  it("27 P4.3 conformance agrees for expiry without fallback", async () => {
    const fixture = await activeOffer({
      effectiveTo: new Date("2026-09-01T00:00:00.000Z"),
    });
    await compareP43AndPublic(fixture, at);
  });

  it("28 P4.3 conformance agrees for a hidden price", async () => {
    const fixture = await activeOffer();
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    );
    await compareP43AndPublic(fixture, at);
  });

  it("29 P4.3 conformance agrees for a non-active plan", async () => {
    const fixture = await activeOffer();
    ok(
      await plans.changePlanStatus(
        {
          planId: fixture.plan.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    );
    await compareP43AndPublic(fixture, at);
  });

  it("30 exact currently selected revision returns P5 OK", async () => {
    const fixture = await activeOffer();
    const result = await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.publishedPriceRevision.id,
      at,
    });
    expect(result.kind).toBe("OK");
  });

  it("31 published historical but no longer selected returns NOT_SELECTED", async () => {
    const fixture = await activeOffer();
    const next = await createPriceRevision(fixture, {
      effectiveFrom: switchAt,
    });
    const nextPublished = await publishPrice(next);
    await assign(fixture.price, nextPublished.id, switchAt, 1);
    const result = await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.publishedPriceRevision.id,
      at: afterSwitch,
    });
    expect(result).toEqual({
      kind: "REJECTED",
      code: "PRICE_REVISION_NOT_SELECTED",
    });
  });

  it("32 P5 returns NO_EFFECTIVE_ASSIGNMENT", async () => {
    const fixture = await activeOffer({ assign: false });
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.publishedPriceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "NO_EFFECTIVE_ASSIGNMENT" });
  });

  it("33 P5 returns EXPLICITLY_CLOSED", async () => {
    const fixture = await activeOffer();
    await assign(fixture.price, null, new Date("2026-09-01T00:00:00.000Z"), 1);
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.publishedPriceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "EXPLICITLY_CLOSED" });
  });

  it("34 P5 returns PLAN_NOT_ACTIVE", async () => {
    const fixture = await activeOffer();
    ok(
      await plans.changePlanStatus(
        {
          planId: fixture.plan.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    );
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.publishedPriceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "PLAN_NOT_ACTIVE" });
  });

  it("35 P5 returns PRICE_NOT_ACTIVE", async () => {
    const fixture = await activeOffer();
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    );
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.publishedPriceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_NOT_ACTIVE" });
  });

  it("36 P5 rejects an exact DRAFT price revision", async () => {
    const fixture = await activeOffer();
    const draft = await createPriceRevision(fixture);
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: draft.priceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_NOT_PUBLISHED" });
  });

  it("37 P5 returns REVISION_OUTSIDE_EFFECTIVE_WINDOW at exact effectiveTo", async () => {
    const fixture = await activeOffer({ effectiveTo: switchAt });
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.publishedPriceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "REVISION_OUTSIDE_EFFECTIVE_WINDOW" });
  });

  it("38 old exact revision remains purchasable before a future switch", async () => {
    const fixture = await activeOffer();
    const next = await createPriceRevision(fixture, {
      effectiveFrom: switchAt,
    });
    const nextPublished = await publishPrice(next);
    await assign(fixture.price, nextPublished.id, switchAt, 1);
    expect(
      (
        await catalog.resolvePurchasableOffer({
          priceRevisionId: fixture.publishedPriceRevision.id,
          at: beforeSwitch,
        })
      ).kind,
    ).toBe("OK");
  });

  it("39 old becomes NOT_SELECTED and new becomes OK at a future switch", async () => {
    const fixture = await activeOffer();
    const next = await createPriceRevision(fixture, {
      effectiveFrom: switchAt,
    });
    const nextPublished = await publishPrice(next);
    await assign(fixture.price, nextPublished.id, switchAt, 1);
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.publishedPriceRevision.id,
        at: afterSwitch,
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_NOT_SELECTED" });
    expect(
      (
        await catalog.resolvePurchasableOffer({
          priceRevisionId: nextPublished.id,
          at: afterSwitch,
        })
      ).kind,
    ).toBe("OK");
  });

  it("40 P5 returns exact amount, currency, period, and window", async () => {
    const fixture = await activeOffer({
      amountMinor: 29000,
      effectiveTo: new Date("2026-12-01T00:00:00.000Z"),
    });
    const result = await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.publishedPriceRevision.id,
      at,
    });
    expect(result.kind).toBe("OK");
    if (result.kind === "OK") {
      expect(result.value).toMatchObject({
        amountMinor: 29000,
        currency: "RUB",
        billingIntervalUnit: "MONTH",
        billingIntervalCount: 1,
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
        effectiveTo: new Date("2026-12-01T00:00:00.000Z"),
      });
    }
  });

  it("41 P5 reads create no audit event", async () => {
    const fixture = await activeOffer();
    const before = await auditCount();
    await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.publishedPriceRevision.id,
      at,
    });
    expect(await auditCount()).toBe(before);
  });

  it("42 inspectPlan returns all revisions in revision order", async () => {
    const fixture = await activeOffer();
    await addPublishedPlanRevision(
      fixture.plan,
      "Latest",
      "Latest description",
    );
    const inspected = await catalog.inspectPlan(fixture.plan.id);
    expect(inspected?.revisions.map((revision) => revision.revision)).toEqual([
      1, 2,
    ]);
  });

  it("43 plan entitlement composition is lexical and typed", async () => {
    const plan = await createPlan();
    const booleanKey = code("feature");
    const integerKey = code("limit");
    await addDefinition(booleanKey, "BOOLEAN");
    await addDefinition(integerKey, "INTEGER");
    let revision = await setDraftEntitlement(plan.revision, integerKey, {
      kind: "INTEGER",
      value: 2,
    });
    revision = await setDraftEntitlement(revision, booleanKey, {
      kind: "BOOLEAN",
      value: true,
    });
    await publishPlan({ ...plan, revision });
    const inspected = await catalog.inspectPlan(plan.plan.id);
    expect(
      inspected?.revisions[0]!.entitlements.map((item) => item.entitlementKey),
    ).toEqual([booleanKey, integerKey].sort());
    expect(
      inspected?.revisions[0]!.entitlements.find(
        (item) => item.entitlementKey === integerKey,
      )?.value,
    ).toEqual({ kind: "INTEGER", value: 2 });
  });

  it("44 inspectPlan preserves an archived plan and its history", async () => {
    const fixture = await activeOffer();
    ok(
      await plans.changePlanStatus(
        {
          planId: fixture.plan.id,
          expectedStatus: "ACTIVE",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    expect((await catalog.inspectPlan(fixture.plan.id))?.status).toBe(
      "ARCHIVED",
    );
  });

  it("45 inspectPlan returns null for a missing plan", async () => {
    expect(await catalog.inspectPlan(randomUUID())).toBeNull();
  });

  it("46 inspectPrice returns all revisions in revision order", async () => {
    const fixture = await activeOffer();
    const second = await createPriceRevision(fixture, {
      effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
    });
    await publishPrice(second);
    const inspected = await catalog.inspectPrice(fixture.price.id);
    expect(inspected?.revisions.map((revision) => revision.revision)).toEqual([
      1, 2,
    ]);
  });

  it("47 price sale assignments are ordered by assignmentRevision", async () => {
    const fixture = await activeOffer();
    await assign(fixture.price, null, new Date("2026-09-01T00:00:00.000Z"), 1);
    await assign(
      fixture.price,
      fixture.publishedPriceRevision.id,
      new Date("2026-09-02T00:00:00.000Z"),
      2,
    );
    const inspected = await catalog.inspectPrice(fixture.price.id);
    expect(
      inspected?.saleAssignments.map(
        (assignment) => assignment.assignmentRevision,
      ),
    ).toEqual([1, 2, 3]);
  });

  it("48 price inspection omits freeform assignment reasons", async () => {
    const fixture = await activeOffer();
    const inspected = await catalog.inspectPrice(fixture.price.id);
    expect(inspected?.saleAssignments[0]).not.toHaveProperty("reason");
  });

  it("49 inspectPrice preserves hidden and archived price history", async () => {
    const fixture = await activeOffer();
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    );
    expect((await catalog.inspectPrice(fixture.price.id))?.status).toBe(
      "HIDDEN",
    );
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "HIDDEN",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    expect((await catalog.inspectPrice(fixture.price.id))?.status).toBe(
      "ARCHIVED",
    );
  });

  it("50 inspectPrice returns null for a missing price", async () => {
    expect(await catalog.inspectPrice(randomUUID())).toBeNull();
  });

  it("51 P6 inspection reads create no audit event", async () => {
    const fixture = await activeOffer();
    const before = await auditCount();
    await catalog.inspectPlan(fixture.plan.id);
    await catalog.inspectPrice(fixture.price.id);
    expect(await auditCount()).toBe(before);
  });

  it("52 repeatable-read public snapshot never mixes assignment and status epochs", async () => {
    const fixture = await activeOffer();
    let reachedSnapshot: () => void = () => undefined;
    const reached = new Promise<void>((resolve) => {
      reachedSnapshot = resolve;
    });
    const writerDone = (async () => {
      await reached;
      await db.transaction(async (writer) => {
        await writer.query(
          "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,2,NULL,$2,$3)",
          [
            fixture.price.id,
            new Date("2026-09-01T00:00:00.000Z"),
            "coherent after-state",
          ],
        );
        await writer.query("UPDATE prices SET status='HIDDEN' WHERE id=$1", [
          fixture.price.id,
        ]);
      });
    })();
    const snapshotRuntime: DatabaseRuntime = {
      ...db,
      transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
        db.transaction(async (transaction) =>
          operation({
            query: async <
              R extends Record<string, unknown> = Record<string, unknown>,
            >(
              text: string,
              values?: unknown[],
            ) => {
              const result = await transaction.query<R>(text, values);
              if (
                text.startsWith(
                  "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ",
                )
              ) {
                await transaction.query("SELECT 1");
                reachedSnapshot();
                await writerDone;
              }
              return result;
            },
          }),
        ),
    };
    const snapshotCatalog =
      createP4CommercialCatalogRepository(snapshotRuntime);
    const offers = await snapshotCatalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at,
    });
    expect(offers).toHaveLength(1);
    expect(
      (
        await q<{ status: string }>("SELECT status FROM prices WHERE id=$1", [
          fixture.price.id,
        ])
      ).rows[0]!.status,
    ).toBe("HIDDEN");
  });
});
