import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabaseRuntime,
  createP4CommercialCatalogRepository,
  createP4EntitlementRepository,
  createP4PlanCommandRepository,
  createP4PriceCommandRepository,
  type DatabaseQuery,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";
import { runMigrations } from "../packages/db/src/migrations.js";
import {
  BoundCommercialDeviceLimitResolver,
  DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
  type AccountEntitlementOverrideMutationPort,
  type CommercialEntitlementResolver,
} from "../packages/entitlements/src/index.js";
import {
  PRE_ENTITLEMENT_ACTIVE_DEVICE_LIMIT,
  PreEntitlementDeviceLimitResolver,
} from "../packages/device-management/src/index.js";
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
  PriceSummary,
  PublishedPriceRevision,
} from "../packages/pricing/src/index.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");

const beforeSwitch = new Date("2026-09-06T11:59:59.999Z");
const switchAt = new Date("2026-09-06T12:00:00.000Z");
const afterSwitch = new Date("2026-09-06T12:00:00.001Z");
const at = new Date("2026-09-06T12:00:00.000Z");
const code = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll("-", "")}`;
const system = (reason = "P4.6 final audit test"): PlanMutationContext => ({
  actorType: "SYSTEM",
  correlationId: randomUUID(),
  reason,
});

let db: DatabaseRuntime;
let plans: PlanEntitlementCommandRepository;
let prices: PriceCommandRepository;
let entitlements: AccountEntitlementOverrideMutationPort &
  CommercialEntitlementResolver;
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

async function tableCount(table: string): Promise<number> {
  const result = await q<{ count: string }>(
    `SELECT count(*)::text AS count FROM ${table}`,
  );
  return Number(result.rows[0]!.count);
}

async function resetCommercial(): Promise<void> {
  await q(
    "TRUNCATE billing_reconciliation_jobs,checkout_intents,billing_events,subscription_transitions,payments,subscriptions,price_sale_assignments,account_entitlement_overrides,price_revisions,plan_entitlements,prices,plan_revisions,entitlement_definitions,plans,audit_events",
  );
}

async function account(): Promise<string> {
  const id = randomUUID();
  await q("INSERT INTO accounts(id) VALUES($1)", [id]);
  return id;
}

async function definition(
  key = DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
  valueType: "BOOLEAN" | "INTEGER" = "INTEGER",
): Promise<void> {
  ok(
    await plans.createEntitlementDefinition(
      {
        entitlementKey: key,
        valueType,
        securityClassification:
          valueType === "BOOLEAN" ? "CAPABILITY" : "LIMIT",
        description: "P4.6 audit definition",
      },
      system(),
    ),
  );
}

type PlanFixture = {
  plan: PlanSummary;
  draft: PlanRevisionDraft;
  revisionId: string;
};

async function createPlan(
  value?: { key: string; value: TypedEntitlementValue },
  displayName = "Starter",
): Promise<PlanFixture> {
  const plan = ok(await plans.createPlan({ code: code("p46-plan") }, system()));
  let draft = ok(
    await plans.createDraftPlanRevision(
      { planId: plan.id, displayName, description: "P4.6 cross-stage audit" },
      system(),
    ),
  );
  if (value) {
    draft = ok(
      await plans.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          entitlementKey: value.key,
          value: value.value,
        },
        system(),
      ),
    );
  }
  const published = ok(
    await plans.publishPlanRevision(
      {
        planRevisionId: draft.id,
        expectedContentFingerprint: draft.contentFingerprintSha256,
      },
      system(),
    ),
  );
  ok(
    await plans.changePlanStatus(
      { planId: plan.id, expectedStatus: "DRAFT", targetStatus: "ACTIVE" },
      system(),
    ),
  );
  return { plan, draft, revisionId: published.id };
}

async function createDraftOnlyPlan(): Promise<PlanFixture> {
  const plan = ok(
    await plans.createPlan({ code: code("p46-draft") }, system()),
  );
  const draft = ok(
    await plans.createDraftPlanRevision(
      { planId: plan.id, displayName: "Draft", description: "Draft no-op" },
      system(),
    ),
  );
  return { plan, draft, revisionId: draft.id };
}

type OfferFixture = PlanFixture & {
  price: PriceSummary;
  priceRevision: PublishedPriceRevision;
};

async function createOffer(
  options: {
    plan?: PlanFixture;
    amountMinor?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    value?: { key: string; value: TypedEntitlementValue };
    marketKey?: string;
    channelKey?: string;
  } = {},
): Promise<OfferFixture> {
  const plan =
    options.plan ??
    (options.value ? await createPlan(options.value) : await createPlan());
  const price = ok(
    await prices.createPrice(
      {
        planId: plan.plan.id,
        code: code("p46-price"),
        marketKey: options.marketKey ?? "ru",
        channelKey: options.channelKey ?? "web",
      },
      system(),
    ),
  );
  const draft = ok(
    await prices.createDraftPriceRevision(
      {
        priceId: price.id,
        planRevisionId: plan.revisionId,
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
  const priceRevision = ok(
    await prices.publishPriceRevision(
      {
        priceRevisionId: draft.id,
        expectedContentFingerprint: draft.contentFingerprintSha256,
      },
      system(),
    ),
  );
  ok(
    await prices.changePriceStatus(
      { priceId: price.id, expectedStatus: "DRAFT", targetStatus: "ACTIVE" },
      system(),
    ),
  );
  await assign(price, priceRevision.id);
  return { ...plan, price, priceRevision };
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
        reason: "P4.6 audit assignment",
      },
      system(),
    ),
  );
}

async function secondPriceRevision(
  fixture: OfferFixture,
  options: {
    amountMinor?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
  } = {},
): Promise<PublishedPriceRevision> {
  const draft = ok(
    await prices.createDraftPriceRevision(
      {
        priceId: fixture.price.id,
        planRevisionId: fixture.revisionId,
        amountMinor: options.amountMinor ?? 29000,
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
  return ok(
    await prices.publishPriceRevision(
      {
        priceRevisionId: draft.id,
        expectedContentFingerprint: draft.contentFingerprintSha256,
      },
      system(),
    ),
  );
}

function failingAuditRuntime(): DatabaseRuntime {
  return {
    ...db,
    transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
      db.transaction((base) =>
        operation({
          query: async <
            R extends Record<string, unknown> = Record<string, unknown>,
          >(
            text: string,
            values?: unknown[],
          ) => {
            if (text.startsWith("INSERT INTO audit_events"))
              throw new Error("injected audit failure");
            return base.query<R>(text, values);
          },
        }),
      ),
  };
}

async function updateRejected(sql: string, values: unknown[]): Promise<void> {
  await expect(q(sql, values)).rejects.toMatchObject({ code: "55000" });
}

describe.sequential("P4.6 final commercial security architecture audit", () => {
  beforeAll(async () => {
    db = createDatabaseRuntime(connectionString!);
    await db.ready();
    await runMigrations({ connectionString: connectionString! });
    plans = createP4PlanCommandRepository(db);
    prices = createP4PriceCommandRepository(db, { clock: () => at });
    entitlements = createP4EntitlementRepository(db);
    catalog = createP4CommercialCatalogRepository(db);
  });
  beforeEach(resetCommercial);
  afterAll(() => db.close());

  it("1 proves the complete P4 lifecycle agrees across P4.3, P4.4, P4.5, and P5", async () => {
    await definition();
    const fixture = await createOffer({
      value: {
        key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
        value: { kind: "INTEGER", value: 3 },
      },
    });
    const p43 = await prices.resolvePriceForNewSale({
      priceId: fixture.price.id,
      at,
    });
    expect(p43.kind).toBe("RESOLVED");
    if (p43.kind === "RESOLVED") {
      expect(p43.value.priceRevision.id).toBe(fixture.priceRevision.id);
      expect(p43.value.priceRevision.amountMinor).toBe(19000);
    }
    const publicOffers = await catalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at,
    });
    expect(publicOffers[0]?.plan.planRevisionId).toBe(fixture.revisionId);
    expect(publicOffers[0]?.price.priceRevisionId).toBe(
      fixture.priceRevision.id,
    );
    const p5 = await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.priceRevision.id,
      at,
    });
    expect(p5).toMatchObject({
      kind: "OK",
      value: { planRevisionId: fixture.revisionId, amountMinor: 19000 },
    });
    const resolved = await entitlements.resolveCommercialEntitlement({
      accountId: await account(),
      planRevisionId: fixture.revisionId,
      entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      at,
    });
    expect(resolved).toMatchObject({
      kind: "OK",
      value: {
        effectiveValue: { kind: "INTEGER", value: 3 },
        plan: { planRevisionId: fixture.revisionId },
      },
    });
  });

  it("2 rejects direct UPDATE of a published plan revision", async () => {
    const fixture = await createOffer();
    await updateRejected(
      "UPDATE plan_revisions SET display_name='tampered' WHERE id=$1",
      [fixture.revisionId],
    );
  });

  it("3 rejects published plan entitlement INSERT, UPDATE, and DELETE", async () => {
    const key = code("flag");
    await definition(key, "BOOLEAN");
    const fixture = await createPlan({
      key,
      value: { kind: "BOOLEAN", value: true },
    });
    await updateRejected(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,$2,true)",
      [fixture.revisionId, key],
    );
    await updateRejected(
      "UPDATE plan_entitlements SET boolean_value=false WHERE plan_revision_id=$1 AND entitlement_key=$2",
      [fixture.revisionId, key],
    );
    await updateRejected(
      "DELETE FROM plan_entitlements WHERE plan_revision_id=$1 AND entitlement_key=$2",
      [fixture.revisionId, key],
    );
  });

  it("4 keeps entitlement semantic identity immutable and deprecation one-way", async () => {
    const key = code("semantic");
    await definition(key, "BOOLEAN");
    await updateRejected(
      "UPDATE entitlement_definitions SET value_type='INTEGER' WHERE entitlement_key=$1",
      [key],
    );
    ok(
      await plans.deprecateEntitlementDefinition(
        { entitlementKey: key },
        system(),
      ),
    );
    await updateRejected(
      "UPDATE entitlement_definitions SET deprecated_at=NULL WHERE entitlement_key=$1",
      [key],
    );
    expect(
      (
        await q<{ deprecatedAt: Date | null }>(
          'SELECT deprecated_at AS "deprecatedAt" FROM entitlement_definitions WHERE entitlement_key=$1',
          [key],
        )
      ).rows[0]!.deprecatedAt,
    ).not.toBeNull();
  });

  it("5 rejects published price revision mutation", async () => {
    const fixture = await createOffer();
    await updateRejected(
      "UPDATE price_revisions SET amount_minor=29000 WHERE id=$1",
      [fixture.priceRevision.id],
    );
  });

  it("6 rejects sale assignment UPDATE and DELETE", async () => {
    const fixture = await createOffer();
    const assignment = (
      await q<{ id: string }>(
        "SELECT id FROM price_sale_assignments WHERE price_id=$1",
        [fixture.price.id],
      )
    ).rows[0]!.id;
    await updateRejected(
      "UPDATE price_sale_assignments SET reason='tampered' WHERE id=$1",
      [assignment],
    );
    await updateRejected("DELETE FROM price_sale_assignments WHERE id=$1", [
      assignment,
    ]);
  });

  it("7 rejects account override UPDATE and DELETE", async () => {
    const key = code("override");
    await definition(key, "BOOLEAN");
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: true },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    );
    const override = (
      await q<{ id: string }>(
        "SELECT id FROM account_entitlement_overrides WHERE account_id=$1",
        [id],
      )
    ).rows[0]!.id;
    await updateRejected(
      "UPDATE account_entitlement_overrides SET reason='tampered' WHERE id=$1",
      [override],
    );
    await updateRejected(
      "DELETE FROM account_entitlement_overrides WHERE id=$1",
      [override],
    );
  });

  it("8 rejects stable plan identity mutation", async () => {
    const fixture = await createOffer();
    await updateRejected("UPDATE plans SET code='tampered' WHERE id=$1", [
      fixture.plan.id,
    ]);
  });

  it("9 rejects stable price identity mutation", async () => {
    const fixture = await createOffer();
    await updateRejected(
      "UPDATE prices SET market_key='tampered' WHERE id=$1",
      [fixture.price.id],
    );
  });

  it("10 grandfather switch keeps 19000 before and selects 29000 after while revision 1 remains immutable", async () => {
    const fixture = await createOffer();
    const next = await secondPriceRevision(fixture, {
      effectiveFrom: switchAt,
      amountMinor: 29000,
    });
    await assign(fixture.price, next.id, switchAt, 1);
    const before = await prices.resolvePriceForNewSale({
      priceId: fixture.price.id,
      at: beforeSwitch,
    });
    const after = await prices.resolvePriceForNewSale({
      priceId: fixture.price.id,
      at: afterSwitch,
    });
    expect(before).toMatchObject({
      kind: "RESOLVED",
      value: {
        priceRevision: { id: fixture.priceRevision.id, amountMinor: 19000 },
      },
    });
    expect(after).toMatchObject({
      kind: "RESOLVED",
      value: { priceRevision: { id: next.id, amountMinor: 29000 } },
    });
    expect(
      (
        await catalog.listPublicOffers({
          marketKey: "ru",
          channelKey: "web",
          at: beforeSwitch,
        })
      )[0]!.price.priceRevisionId,
    ).toBe(fixture.priceRevision.id);
    expect(
      (
        await catalog.listPublicOffers({
          marketKey: "ru",
          channelKey: "web",
          at: afterSwitch,
        })
      )[0]!.price.priceRevisionId,
    ).toBe(next.id);
    expect(
      (await prices.getPublishedPriceRevision(fixture.priceRevision.id))
        ?.amountMinor,
    ).toBe(19000);
  });

  it("11 explicit NULL closure agrees across P4.3, public catalog, and P5", async () => {
    const fixture = await createOffer();
    await assign(fixture.price, null, new Date("2026-09-01T00:00:00.000Z"), 1);
    expect(
      await prices.resolvePriceForNewSale({ priceId: fixture.price.id, at }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_SALE_CLOSED" });
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.priceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "EXPLICITLY_CLOSED" });
  });

  it("12 selected revision effectiveTo is sellable immediately before and closed at the boundary in all read paths", async () => {
    const fixture = await createOffer({ effectiveTo: switchAt });
    expect(
      (
        await prices.resolvePriceForNewSale({
          priceId: fixture.price.id,
          at: beforeSwitch,
        })
      ).kind,
    ).toBe("RESOLVED");
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.priceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "REVISION_OUTSIDE_EFFECTIVE_WINDOW" });
  });

  it("13 highest effective expired assignment does not fall back to an older valid revision", async () => {
    const fixture = await createOffer();
    const expired = await secondPriceRevision(fixture, {
      effectiveTo: new Date("2026-09-01T00:00:00.000Z"),
    });
    await assign(
      fixture.price,
      expired.id,
      new Date("2026-01-01T00:00:00.000Z"),
      1,
    );
    expect(
      await prices.resolvePriceForNewSale({ priceId: fixture.price.id, at }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_EXPIRED" });
    expect(
      await catalog.listPublicOffers({
        marketKey: "ru",
        channelKey: "web",
        at,
      }),
    ).toEqual([]);
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.priceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_NOT_SELECTED" });
  });

  it("14 non-monotonic effective times still use highest assignment revision as authority", async () => {
    const fixture = await createOffer();
    const next = await secondPriceRevision(fixture);
    await assign(
      fixture.price,
      next.id,
      new Date("2026-09-05T00:00:00.000Z"),
      1,
    );
    await assign(
      fixture.price,
      fixture.priceRevision.id,
      new Date("2026-06-01T00:00:00.000Z"),
      2,
    );
    expect(
      await prices.resolvePriceForNewSale({ priceId: fixture.price.id, at }),
    ).toMatchObject({
      kind: "RESOLVED",
      value: { priceRevision: { id: fixture.priceRevision.id } },
    });
  });

  it("15 P5 rejects a published historical revision that is no longer selected", async () => {
    const fixture = await createOffer();
    const next = await secondPriceRevision(fixture, {
      effectiveFrom: switchAt,
    });
    await assign(fixture.price, next.id, switchAt, 1);
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.priceRevision.id,
        at: afterSwitch,
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_NOT_SELECTED" });
  });

  it("16 serializes plan archival and price mutation through the shared plan lock", async () => {
    const fixture = await createOffer();
    let release!: () => void;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    let locked!: () => void;
    const reached = new Promise<void>((resolve) => {
      locked = resolve;
    });
    const holder = db.transaction(async (tx) => {
      await tx.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        `p4-plan:${fixture.plan.id}`,
      ]);
      locked();
      await released;
    });
    await reached;
    const archive = plans.changePlanStatus(
      {
        planId: fixture.plan.id,
        expectedStatus: "ACTIVE",
        targetStatus: "ARCHIVED",
      },
      system(),
    );
    const hide = prices.changePriceStatus(
      {
        priceId: fixture.price.id,
        expectedStatus: "ACTIVE",
        targetStatus: "HIDDEN",
      },
      system(),
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
    release();
    await holder;
    const results = await Promise.all([archive, hide]);
    expect(
      results.some(
        (result) => result.kind === "OK" && result.value.status === "ARCHIVED",
      ),
    ).toBe(true);
    const state = (
      await q<{ planStatus: string; priceStatus: string }>(
        'SELECT pl.status AS "planStatus",p.status AS "priceStatus" FROM plans pl JOIN prices p ON p.plan_id=pl.id WHERE p.id=$1',
        [fixture.price.id],
      )
    ).rows[0]!;
    expect(state.planStatus).toBe("ARCHIVED");
    expect(["ACTIVE", "HIDDEN"]).toContain(state.priceStatus);
  });

  it("17 serializes entitlement SET and definition deprecation without a deprecated SET commit", async () => {
    const key = code("definition-race");
    await definition(key, "BOOLEAN");
    const id = await account();
    const results = await Promise.all([
      entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: true },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
      plans.deprecateEntitlementDefinition({ entitlementKey: key }, system()),
    ]);
    expect(
      results[0]!.kind === "OK" ||
        results[0]!.code === "ENTITLEMENT_DEPRECATED",
    ).toBe(true);
    expect(results[1]!.kind).toBe("OK");
    if (results[0]!.kind === "OK") expect(results[0]!.value.revision).toBe(1);
  });

  it("18 concurrent price assignment writers with one expected revision have one winner and one stale result", async () => {
    const fixture = await createOffer();
    const next = await secondPriceRevision(fixture);
    const results = await Promise.all([
      prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: 1,
          selectedPriceRevisionId: next.id,
          effectiveFrom: switchAt,
          reason: "writer a",
        },
        system(),
      ),
      prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: 1,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: switchAt,
          reason: "writer b",
        },
        system(),
      ),
    ]);
    expect(results.filter((result) => result.kind === "OK")).toHaveLength(1);
    expect(
      results.filter(
        (result) =>
          result.kind === "REJECTED" &&
          result.code === "PRICE_ASSIGNMENT_STALE",
      ),
    ).toHaveLength(1);
    expect(await tableCount("price_sale_assignments")).toBe(2);
  });

  it("19 concurrent account override writers with one expected revision have one winner and one stale result", async () => {
    const key = code("override-race");
    await definition(key, "BOOLEAN");
    const id = await account();
    const results = await Promise.all([
      entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: true },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
      entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: false },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    ]);
    expect(results.filter((result) => result.kind === "OK")).toHaveLength(1);
    expect(
      results.filter(
        (result) =>
          result.kind === "REJECTED" &&
          result.code === "ACCOUNT_ENTITLEMENT_OVERRIDE_STALE",
      ),
    ).toHaveLength(1);
    expect(await tableCount("account_entitlement_overrides")).toBe(1);
  });

  it("20 concurrent plan draft updates with one stale fingerprint do not lose the winner", async () => {
    const fixture = await createDraftOnlyPlan();
    const results = await Promise.all([
      plans.updateDraftPlanRevision(
        {
          planRevisionId: fixture.draft.id,
          expectedContentFingerprint: fixture.draft.contentFingerprintSha256,
          displayName: "Winner A",
        },
        system(),
      ),
      plans.updateDraftPlanRevision(
        {
          planRevisionId: fixture.draft.id,
          expectedContentFingerprint: fixture.draft.contentFingerprintSha256,
          displayName: "Winner B",
        },
        system(),
      ),
    ]);
    expect(results.filter((result) => result.kind === "OK")).toHaveLength(1);
    expect(
      results.filter(
        (result) =>
          result.kind === "REJECTED" && result.code === "PLAN_DRAFT_STALE",
      ),
    ).toHaveLength(1);
    const current = await plans.getPlanRevisionDraft(fixture.draft.id);
    expect(["Winner A", "Winner B"]).toContain(current?.displayName);
  });

  it("21 active account SET overrides the exact plan value", async () => {
    await definition();
    const fixture = await createPlan({
      key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      value: { kind: "INTEGER", value: 1 },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: null,
          value: { kind: "INTEGER", value: 4 },
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          expiresAt: null,
        },
        system(),
      ),
    );
    expect(
      await entitlements.resolveCommercialEntitlement({
        accountId: id,
        planRevisionId: fixture.revisionId,
        entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
        at,
      }),
    ).toMatchObject({
      kind: "OK",
      value: {
        effectiveValue: { kind: "INTEGER", value: 4 },
        source: "ACCOUNT_OVERRIDE",
      },
    });
  });

  it("22 CLEAR returns to plan and older SET never resurrects", async () => {
    await definition();
    const fixture = await createPlan({
      key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      value: { kind: "INTEGER", value: 1 },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: null,
          value: { kind: "INTEGER", value: 4 },
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          expiresAt: null,
        },
        system(),
      ),
    );
    ok(
      await entitlements.clearAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: 1,
          effectiveFrom: new Date("2026-01-02T00:00:00.000Z"),
          expiresAt: null,
        },
        system(),
      ),
    );
    expect(
      await entitlements.resolveCommercialEntitlement({
        accountId: id,
        planRevisionId: fixture.revisionId,
        entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
        at,
      }),
    ).toMatchObject({
      kind: "OK",
      value: {
        effectiveValue: { kind: "INTEGER", value: 1 },
        reason: "ACCOUNT_OVERRIDE_CLEAR_TO_PLAN",
        selectedOverride: { overrideRevision: 2 },
      },
    });
  });

  it("23 expired latest SET returns to plan and older SET never resurrects", async () => {
    await definition();
    const fixture = await createPlan({
      key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      value: { kind: "INTEGER", value: 1 },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: null,
          value: { kind: "INTEGER", value: 4 },
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          expiresAt: new Date("2026-02-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: 1,
          value: { kind: "INTEGER", value: 5 },
          effectiveFrom: new Date("2026-02-02T00:00:00.000Z"),
          expiresAt: new Date("2026-03-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    expect(
      await entitlements.resolveCommercialEntitlement({
        accountId: id,
        planRevisionId: fixture.revisionId,
        entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
        at,
      }),
    ).toMatchObject({
      kind: "OK",
      value: {
        effectiveValue: { kind: "INTEGER", value: 1 },
        reason: "ACCOUNT_OVERRIDE_EXPIRED_TO_PLAN",
        selectedOverride: { overrideRevision: 2, state: "EXPIRED" },
      },
    });
  });

  it("24 future higher override is ignored before effectiveFrom and wins at its boundary", async () => {
    await definition();
    const fixture = await createPlan({
      key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      value: { kind: "INTEGER", value: 1 },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: null,
          value: { kind: "INTEGER", value: 4 },
          effectiveFrom: switchAt,
          expiresAt: null,
        },
        system(),
      ),
    );
    const before = await entitlements.resolveCommercialEntitlement({
      accountId: id,
      planRevisionId: fixture.revisionId,
      entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      at: beforeSwitch,
    });
    const after = await entitlements.resolveCommercialEntitlement({
      accountId: id,
      planRevisionId: fixture.revisionId,
      entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      at,
    });
    expect(before).toMatchObject({
      kind: "OK",
      value: { effectiveValue: { kind: "INTEGER", value: 1 } },
    });
    expect(after).toMatchObject({
      kind: "OK",
      value: { effectiveValue: { kind: "INTEGER", value: 4 } },
    });
  });

  it("25 same-time higher override revision wins", async () => {
    await definition();
    const fixture = await createPlan({
      key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      value: { kind: "INTEGER", value: 1 },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: null,
          value: { kind: "INTEGER", value: 4 },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    );
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: 1,
          value: { kind: "INTEGER", value: 5 },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    );
    const result = await entitlements.resolveCommercialEntitlement({
      accountId: id,
      planRevisionId: fixture.revisionId,
      entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      at,
    });
    expect(result).toMatchObject({
      kind: "OK",
      value: {
        effectiveValue: { kind: "INTEGER", value: 5 },
        selectedOverride: { overrideRevision: 2 },
      },
    });
  });

  it("26 deprecated definitions preserve historical plan and override resolution", async () => {
    const key = code("deprecated-history");
    await definition(key, "BOOLEAN");
    const fixture = await createPlan({
      key,
      value: { kind: "BOOLEAN", value: true },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: false },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    );
    ok(
      await plans.deprecateEntitlementDefinition(
        { entitlementKey: key },
        system(),
      ),
    );
    expect(
      await entitlements.resolveCommercialEntitlement({
        accountId: id,
        planRevisionId: fixture.revisionId,
        entitlementKey: key,
        at,
      }),
    ).toMatchObject({
      kind: "OK",
      value: {
        effectiveValue: { kind: "BOOLEAN", value: false },
        definition: { deprecatedAt: expect.any(Date) },
      },
    });
  });

  it("27 archived stable plan exact published revision remains internally resolvable", async () => {
    const fixture = await createOffer();
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
      await entitlements.resolveCommercialEntitlements({
        accountId: await account(),
        planRevisionId: fixture.revisionId,
        at,
      }),
    ).toMatchObject({ kind: "OK" });
    expect(
      await catalog.resolvePurchasableOffer({
        priceRevisionId: fixture.priceRevision.id,
        at,
      }),
    ).toEqual({ kind: "REJECTED", code: "PLAN_NOT_ACTIVE" });
  });

  it("28 archived or hidden plans disappear from public catalog while P6 inspection retains history", async () => {
    const fixture = await createOffer();
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
    expect((await catalog.inspectPlan(fixture.plan.id))?.status).toBe("HIDDEN");
  });

  it("29 account entitlement overrides do not change global public catalog output", async () => {
    const key = code("public-independent");
    await definition(key, "BOOLEAN");
    const fixture = await createOffer({
      value: { key, value: { kind: "BOOLEAN", value: true } },
    });
    const before = await catalog.listPublicOffers({
      marketKey: "ru",
      channelKey: "web",
      at,
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: false },
          effectiveFrom: at,
          expiresAt: null,
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
    ).toEqual(before);
    expect(fixture.price.id).toBeDefined();
  });

  it("30 P6 plan inspection contains all typed plan history but no account override history", async () => {
    const key = code("inspection-plan");
    await definition(key, "BOOLEAN");
    const fixture = await createOffer({
      value: { key, value: { kind: "BOOLEAN", value: true } },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: false },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    );
    const inspected = await catalog.inspectPlan(fixture.plan.id);
    expect(inspected?.revisions[0]?.entitlements).toEqual([
      {
        entitlementKey: key,
        value: { kind: "BOOLEAN", value: true },
        definition: {
          valueType: "BOOLEAN",
          securityClassification: "CAPABILITY",
          deprecatedAt: null,
        },
      },
    ]);
    expect(JSON.stringify(inspected)).not.toMatch(/override|accountId|reason/i);
  });

  it("31 P6 price inspection contains all revisions and assignments but no freeform reason", async () => {
    const fixture = await createOffer();
    const next = await secondPriceRevision(fixture, {
      effectiveFrom: switchAt,
    });
    await assign(fixture.price, next.id, switchAt, 1);
    const inspected = await catalog.inspectPrice(fixture.price.id);
    expect(inspected?.revisions.map((revision) => revision.id)).toEqual([
      fixture.priceRevision.id,
      next.id,
    ]);
    expect(inspected?.saleAssignments).toHaveLength(2);
    expect(JSON.stringify(inspected)).not.toMatch(/reason|freeform/i);
  });

  it("32 representative commercial read paths produce zero new audit rows", async () => {
    await definition();
    const fixture = await createOffer({
      value: {
        key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
        value: { kind: "INTEGER", value: 2 },
      },
    });
    const id = await account();
    ok(
      await entitlements.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          expectedLatestRevision: null,
          value: { kind: "INTEGER", value: 3 },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    );
    const before = await auditCount();
    await entitlements.resolveCommercialEntitlement({
      accountId: id,
      planRevisionId: fixture.revisionId,
      entitlementKey: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      at,
    });
    await catalog.listPublicOffers({ marketKey: "ru", channelKey: "web", at });
    await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.priceRevision.id,
      at,
    });
    await catalog.inspectPlan(fixture.plan.id);
    await catalog.inspectPrice(fixture.price.id);
    expect(await auditCount()).toBe(before);
  });

  it("33 semantic no-ops across plan, price, assignment, and override create no history or duplicate audit", async () => {
    const key = code("noop");
    await definition(key, "BOOLEAN");
    const fixture = await createOffer({
      value: { key, value: { kind: "BOOLEAN", value: true } },
    });
    const draftOnly = await createDraftOnlyPlan();
    const id = await account();
    const before = await auditCount();
    expect(
      (
        await plans.updateDraftPlanRevision(
          {
            planRevisionId: draftOnly.draft.id,
            expectedContentFingerprint:
              draftOnly.draft.contentFingerprintSha256,
            displayName: draftOnly.draft.displayName,
          },
          system(),
        )
      ).changed,
    ).toBe(false);
    const priceDraft = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.revisionId,
          amountMinor: 19000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    const priceBefore = await auditCount();
    expect(
      (
        await prices.updateDraftPriceRevision(
          {
            priceRevisionId: priceDraft.id,
            expectedContentFingerprint: priceDraft.contentFingerprintSha256,
            amountMinor: 19000,
          },
          system(),
        )
      ).changed,
    ).toBe(false);
    expect(
      (
        await prices.schedulePriceSaleAssignment(
          {
            priceId: fixture.price.id,
            expectedLatestAssignmentRevision: 1,
            selectedPriceRevisionId: fixture.priceRevision.id,
            effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
            reason: "P4.6 audit assignment",
          },
          system(),
        )
      ).changed,
    ).toBe(false);
    expect(
      (
        await entitlements.setAccountEntitlementOverride(
          {
            accountId: id,
            entitlementKey: key,
            expectedLatestRevision: null,
            value: { kind: "BOOLEAN", value: true },
            effectiveFrom: at,
            expiresAt: null,
          },
          system(),
        )
      ).changed,
    ).toBe(true);
    const overrideAudits = await auditCount();
    expect(
      (
        await entitlements.setAccountEntitlementOverride(
          {
            accountId: id,
            entitlementKey: key,
            expectedLatestRevision: 1,
            value: { kind: "BOOLEAN", value: true },
            effectiveFrom: at,
            expiresAt: null,
          },
          system(),
        )
      ).changed,
    ).toBe(false);
    expect(await auditCount()).toBe(overrideAudits);
    expect(await tableCount("account_entitlement_overrides")).toBe(1);
    expect(await auditCount()).toBeGreaterThan(before);
    expect(await auditCount()).toBe(overrideAudits);
    expect(priceBefore).toBeLessThanOrEqual(overrideAudits);
  });

  it("34 injected audit failure rolls a price mutation back without partial state", async () => {
    const fixture = await createOffer();
    const draft = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.revisionId,
          amountMinor: 20000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    const before = await auditCount();
    const failing = createP4PriceCommandRepository(failingAuditRuntime());
    await expect(
      failing.updateDraftPriceRevision(
        {
          priceRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          amountMinor: 21000,
        },
        system(),
      ),
    ).rejects.toThrow("injected audit failure");
    expect((await prices.getPriceRevisionDraft(draft.id))?.amountMinor).toBe(
      20000,
    );
    expect(await auditCount()).toBe(before);
  });

  it("35 injected audit failure rolls an account override mutation back without partial state", async () => {
    const key = code("override-rollback");
    await definition(key, "BOOLEAN");
    const id = await account();
    const failing = createP4EntitlementRepository(failingAuditRuntime());
    await expect(
      failing.setAccountEntitlementOverride(
        {
          accountId: id,
          entitlementKey: key,
          expectedLatestRevision: null,
          value: { kind: "BOOLEAN", value: true },
          effectiveFrom: at,
          expiresAt: null,
        },
        system(),
      ),
    ).rejects.toThrow("injected audit failure");
    expect(await tableCount("account_entitlement_overrides")).toBe(0);
  });

  it("36 repeatable-read public catalog snapshot never mixes assignment and status epochs", async () => {
    const fixture = await createOffer();
    let reachedSnapshot!: () => void;
    const reached = new Promise<void>((resolve) => {
      reachedSnapshot = resolve;
    });
    let releaseWriter!: () => void;
    const writerRelease = new Promise<void>((resolve) => {
      releaseWriter = resolve;
    });
    const writerDone = (async () => {
      await reached;
      await db.transaction(async (tx) => {
        await tx.query(
          "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,2,NULL,$2,$3)",
          [
            fixture.price.id,
            new Date("2026-09-01T00:00:00.000Z"),
            "coherent after-state",
          ],
        );
        await tx.query("UPDATE prices SET status='HIDDEN' WHERE id=$1", [
          fixture.price.id,
        ]);
      });
      releaseWriter();
    })();
    const snapshotRuntime: DatabaseRuntime = {
      ...db,
      transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
        db.transaction(async (tx) =>
          operation({
            query: async <
              R extends Record<string, unknown> = Record<string, unknown>,
            >(
              text: string,
              values?: unknown[],
            ) => {
              const result = await tx.query<R>(text, values);
              if (
                text.startsWith(
                  "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ",
                )
              ) {
                await tx.query("SELECT 1");
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
    await writerRelease;
    expect(offers).toHaveLength(1);
    expect(
      (
        await q<{ status: string }>("SELECT status FROM prices WHERE id=$1", [
          fixture.price.id,
        ])
      ).rows[0]!.status,
    ).toBe("HIDDEN");
  });

  it("37 commercial device limit resolves through a fake binding while production default remains one", async () => {
    await definition();
    const fixture = await createPlan({
      key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      value: { kind: "INTEGER", value: 4 },
    });
    const id = await account();
    const adapter = new BoundCommercialDeviceLimitResolver(
      {
        resolve: async () => ({
          planRevisionId: fixture.revisionId,
          source: "fake-binding",
        }),
      },
      entitlements,
      () => at,
    );
    expect(await adapter.resolve(id)).toEqual({
      maxActive: 4,
      source: "COMMERCIAL_PLAN_REVISION",
    });
    expect(PRE_ENTITLEMENT_ACTIVE_DEVICE_LIMIT).toBe(1);
    expect(await new PreEntitlementDeviceLimitResolver().resolve()).toEqual({
      maxActive: 1,
      source: "PRE_ENTITLEMENT_BASELINE",
    });
  });

  it("38 preserves exact integer money, currency, interval, and windows across price, public, and P5", async () => {
    const fixture = await createOffer({
      amountMinor: 9007199254740991,
      effectiveTo: new Date("2026-12-01T00:00:00.000Z"),
    });
    const p43 = await prices.resolvePriceForNewSale({
      priceId: fixture.price.id,
      at,
    });
    const publicOffer = (
      await catalog.listPublicOffers({ marketKey: "ru", channelKey: "web", at })
    )[0]!;
    const p5 = await catalog.resolvePurchasableOffer({
      priceRevisionId: fixture.priceRevision.id,
      at,
    });
    expect(p43).toMatchObject({
      kind: "RESOLVED",
      value: {
        priceRevision: {
          amountMinor: 9007199254740991,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
        },
      },
    });
    expect(publicOffer.price).toMatchObject({
      amountMinor: 9007199254740991,
      currency: "RUB",
      effectiveTo: new Date("2026-12-01T00:00:00.000Z"),
    });
    expect(p5).toMatchObject({
      kind: "OK",
      value: {
        amountMinor: 9007199254740991,
        currency: "RUB",
        billingIntervalUnit: "MONTH",
        billingIntervalCount: 1,
        effectiveTo: new Date("2026-12-01T00:00:00.000Z"),
      },
    });
  });
});
