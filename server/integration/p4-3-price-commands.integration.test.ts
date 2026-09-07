import { randomUUID } from "node:crypto";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  createDatabaseRuntime,
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

let db: DatabaseRuntime;
let plans: PlanEntitlementCommandRepository;
let prices: PriceCommandRepository;

const system = (reason = "P4.3 integration test"): PlanMutationContext => ({
  actorType: "SYSTEM",
  correlationId: randomUUID(),
  reason,
});
const code = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll("-", "")}`;
const q = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values?: unknown[],
) => db.query<T>(text, values);

function ok<T>(result: CommandResult<T> | PriceCommandResult<T>): T {
  if (result.kind !== "OK")
    throw new Error(`expected OK, received ${result.code}`);
  return result.value;
}

async function auditCount(action?: string): Promise<number> {
  const result = await q<{ count: string }>(
    action
      ? "SELECT count(*)::text AS count FROM audit_events WHERE action=$1"
      : "SELECT count(*)::text AS count FROM audit_events",
    action ? [action] : undefined,
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
    "TRUNCATE checkout_intents,billing_events,subscription_transitions,payments,subscriptions,price_sale_assignments,account_entitlement_overrides,price_revisions,plan_entitlements,prices,plan_revisions,entitlement_definitions,plans,audit_events",
  );
}

async function clearAuditFailure(): Promise<void> {
  await q("DROP TRIGGER IF EXISTS p4_3_fail_audit_trigger ON audit_events");
  await q("DROP FUNCTION IF EXISTS p4_3_fail_audit()");
}

type PlanFixture = { plan: PlanSummary; planRevision: PlanRevisionDraft };
type PriceFixture = PlanFixture & {
  price: PriceSummary;
  priceRevision: PriceRevisionDraft;
};
type PublishedPriceFixture = Omit<PriceFixture, "priceRevision"> & {
  priceRevision: PublishedPriceRevision;
};

async function createPlanFixture(): Promise<PlanFixture> {
  const plan = ok(await plans.createPlan({ code: code("p43-plan") }, system()));
  const planRevision = ok(
    await plans.createDraftPlanRevision(
      {
        planId: plan.id,
        displayName: "Starter",
        description: "Starter plan",
      },
      system(),
    ),
  );
  return { plan, planRevision };
}

async function publishPlanFixture(
  fixture: PlanFixture,
): Promise<PlanRevisionDraft> {
  const published = ok(
    await plans.publishPlanRevision(
      {
        planRevisionId: fixture.planRevision.id,
        expectedContentFingerprint:
          fixture.planRevision.contentFingerprintSha256,
      },
      system(),
    ),
  );
  return {
    ...fixture.planRevision,
    ...published,
  } as PlanRevisionDraft;
}

async function activatePlan(plan: PlanSummary): Promise<void> {
  ok(
    await plans.changePlanStatus(
      { planId: plan.id, expectedStatus: "DRAFT", targetStatus: "ACTIVE" },
      system(),
    ),
  );
}

async function createPriceFixture(
  options: {
    publishPlan?: boolean;
    amountMinor?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
  } = {},
): Promise<PriceFixture> {
  const base = await createPlanFixture();
  if (options.publishPlan) await publishPlanFixture(base);
  const price = ok(
    await prices.createPrice(
      {
        planId: base.plan.id,
        code: code("p43-price"),
        marketKey: "global",
        channelKey: "web",
      },
      system(),
    ),
  );
  const priceRevision = ok(
    await prices.createDraftPriceRevision(
      {
        priceId: price.id,
        planRevisionId: base.planRevision.id,
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
  return { ...base, price, priceRevision };
}

async function publishPriceFixture(
  fixture: PriceFixture,
): Promise<PublishedPriceFixture> {
  const published = ok(
    await prices.publishPriceRevision(
      {
        priceRevisionId: fixture.priceRevision.id,
        expectedContentFingerprint:
          fixture.priceRevision.contentFingerprintSha256,
      },
      system(),
    ),
  );
  return { ...fixture, priceRevision: published };
}

async function activePublishedPriceFixture(
  options: {
    amountMinor?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
  } = {},
): Promise<PublishedPriceFixture> {
  const fixture = await createPriceFixture({
    ...options,
    publishPlan: true,
  });
  const published = await publishPriceFixture(fixture);
  await activatePlan(published.plan);
  ok(
    await prices.changePriceStatus(
      {
        priceId: published.price.id,
        expectedStatus: "DRAFT",
        targetStatus: "ACTIVE",
      },
      system(),
    ),
  );
  return published;
}

function failingAuditRuntime(): DatabaseRuntime {
  return {
    ...db,
    transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
      db.transaction((q) =>
        operation({
          query: async <
            R extends Record<string, unknown> = Record<string, unknown>,
          >(
            text: string,
            values?: unknown[],
          ) => {
            if (text.startsWith("INSERT INTO audit_events"))
              throw new Error("injected audit failure");
            return q.query<R>(text, values);
          },
        }),
      ),
  };
}

function gatedPlanLockRuntime(
  planId: string,
  reached: { resolve: () => void },
  release: { promise: Promise<void> },
): DatabaseRuntime {
  let gateUsed = false;
  return {
    ...db,
    transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
      db.transaction((q) =>
        operation({
          query: async <
            R extends Record<string, unknown> = Record<string, unknown>,
          >(
            text: string,
            values?: unknown[],
          ) => {
            if (
              !gateUsed &&
              text.startsWith("SELECT pg_advisory_xact_lock") &&
              values?.[0] === `p4-plan:${planId}`
            ) {
              gateUsed = true;
              reached.resolve();
              await release.promise;
            }
            return q.query<R>(text, values);
          },
        }),
      ),
  };
}

describe.sequential("P4.3 price commands on PostgreSQL", () => {
  beforeAll(async () => {
    db = createDatabaseRuntime(connectionString!);
    await db.ready();
    await runMigrations({ connectionString: connectionString! });
    plans = createP4PlanCommandRepository(db, {
      clock: () => new Date("2026-09-06T00:00:00.000Z"),
    });
    prices = createP4PriceCommandRepository(db, {
      clock: () => new Date("2026-09-06T00:00:00.000Z"),
    });
  });

  beforeEach(resetCommercial);
  afterEach(clearAuditFailure);
  afterAll(() => db.close());

  it("creates a DRAFT price with stable identity and one PRICE_CREATED audit", async () => {
    const fixture = await createPriceFixture();
    expect(fixture.price).toMatchObject({
      planId: fixture.plan.id,
      status: "DRAFT",
      marketKey: "global",
      channelKey: "web",
    });
    expect(await auditCount("PRICE_CREATED")).toBe(1);
    expect(await tableCount("prices")).toBe(1);
  });

  it("rejects duplicate price code without a second audit", async () => {
    const base = await createPlanFixture();
    const priceCode = code("duplicate-price");
    expect(
      await prices.createPrice(
        {
          planId: base.plan.id,
          code: priceCode,
          marketKey: "global",
          channelKey: "web",
        },
        system(),
      ),
    ).toMatchObject({ kind: "OK" });
    const before = await auditCount();
    expect(
      await prices.createPrice(
        {
          planId: base.plan.id,
          code: priceCode,
          marketKey: "global",
          channelKey: "web",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_CODE_CONFLICT" });
    expect(await tableCount("prices")).toBe(1);
    expect(await auditCount()).toBe(before);
  });

  it("serializes concurrent same-code creates to one row and one audit", async () => {
    const base = await createPlanFixture();
    const priceCode = code("concurrent-price");
    const results = await Promise.all([
      prices.createPrice(
        {
          planId: base.plan.id,
          code: priceCode,
          marketKey: "global",
          channelKey: "web",
        },
        system(),
      ),
      prices.createPrice(
        {
          planId: base.plan.id,
          code: priceCode,
          marketKey: "global",
          channelKey: "web",
        },
        system(),
      ),
    ]);
    expect(results.filter((result) => result.kind === "OK")).toHaveLength(1);
    expect(
      results.filter(
        (result) =>
          result.kind === "REJECTED" && result.code === "PRICE_CODE_CONFLICT",
      ),
    ).toHaveLength(1);
    expect(await tableCount("prices")).toBe(1);
    expect(await auditCount("PRICE_CREATED")).toBe(1);
  });

  it("rejects price creation under an archived plan without mutation or audit", async () => {
    const base = await createPlanFixture();
    ok(
      await plans.changePlanStatus(
        {
          planId: base.plan.id,
          expectedStatus: "DRAFT",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    const before = await auditCount();
    expect(
      await prices.createPrice(
        {
          planId: base.plan.id,
          code: code("archived-plan-price"),
          marketKey: "global",
          channelKey: "web",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_PLAN_ARCHIVED" });
    expect(await tableCount("prices")).toBe(0);
    expect(await auditCount()).toBe(before);
  });

  it("allocates sequential draft price revisions on the server", async () => {
    const fixture = await createPriceFixture();
    const second = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.planRevision.id,
          amountMinor: 29000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    expect([fixture.priceRevision.revision, second.revision]).toEqual([1, 2]);
    expect(
      (
        await q<{ revision: number }>(
          "SELECT revision FROM price_revisions WHERE price_id=$1 ORDER BY revision",
          [fixture.price.id],
        )
      ).rows.map((row) => row.revision),
    ).toEqual([1, 2]);
  });

  it("allocates distinct revision numbers for concurrent draft creation", async () => {
    const fixture = await createPriceFixture();
    const results = await Promise.all([
      prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.planRevision.id,
          amountMinor: 20000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
        },
        system(),
      ),
      prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.planRevision.id,
          amountMinor: 21000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-02-15T00:00:00.000Z"),
        },
        system(),
      ),
    ]);
    expect(results.map((result) => ok(result).revision).sort()).toEqual([2, 3]);
    expect(await tableCount("price_revisions")).toBe(3);
  });

  it("allows a DRAFT price revision to bind to a same-plan DRAFT plan revision", async () => {
    const fixture = await createPriceFixture();
    const secondPlanRevision = ok(
      await plans.createDraftPlanRevision(
        {
          planId: fixture.plan.id,
          displayName: "Second",
          description: "second",
        },
        system(),
      ),
    );
    const rebound = ok(
      await prices.updateDraftPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
          planRevisionId: secondPlanRevision.id,
        },
        system(),
      ),
    );
    expect(rebound.planRevisionId).toBe(secondPlanRevision.id);
    expect(rebound.state).toBe("DRAFT");
  });

  it("rejects cross-plan draft revision binding without mutation or audit", async () => {
    const fixture = await createPriceFixture();
    const other = await createPlanFixture();
    const before = await auditCount();
    expect(
      await prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: other.planRevision.id,
          amountMinor: 20000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
        },
        system(),
      ),
    ).toEqual({
      kind: "REJECTED",
      code: "PRICE_PLAN_REVISION_PLAN_MISMATCH",
    });
    expect(await tableCount("price_revisions")).toBe(1);
    expect(await auditCount()).toBe(before);
  });

  it("rejects new draft revision creation for an archived price", async () => {
    const fixture = await createPriceFixture();
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "DRAFT",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    const before = await auditCount();
    expect(
      await prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.planRevision.id,
          amountMinor: 20000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_ARCHIVED" });
    expect(await tableCount("price_revisions")).toBe(1);
    expect(await auditCount()).toBe(before);
  });

  it("returns a deterministic current draft fingerprint", async () => {
    const fixture = await createPriceFixture();
    const first = await prices.getPriceRevisionDraft(fixture.priceRevision.id);
    const second = await prices.getPriceRevisionDraft(fixture.priceRevision.id);
    expect(first).toEqual(second);
    expect(first?.contentFingerprintSha256).toBe(
      fixture.priceRevision.contentFingerprintSha256,
    );
  });

  it("updates valid draft terms, changes the fingerprint, and audits once", async () => {
    const fixture = await createPriceFixture();
    const updated = ok(
      await prices.updateDraftPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
          amountMinor: 20000,
        },
        system(),
      ),
    );
    expect(updated.amountMinor).toBe(20000);
    expect(updated.contentFingerprintSha256).not.toBe(
      fixture.priceRevision.contentFingerprintSha256,
    );
    expect(await auditCount("PRICE_REVISION_DRAFT_UPDATED")).toBe(1);
  });

  it("rejects a stale second writer and preserves the first writer without stale audit", async () => {
    const fixture = await createPriceFixture();
    const updated = ok(
      await prices.updateDraftPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
          amountMinor: 20000,
        },
        system(),
      ),
    );
    const before = await auditCount("PRICE_REVISION_DRAFT_UPDATED");
    expect(
      await prices.updateDraftPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
          amountMinor: 21000,
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_DRAFT_STALE" });
    const stored = await prices.getPriceRevisionDraft(fixture.priceRevision.id);
    expect(stored?.amountMinor).toBe(updated.amountMinor);
    expect(stored?.contentFingerprintSha256).toBe(
      updated.contentFingerprintSha256,
    );
    expect(await auditCount("PRICE_REVISION_DRAFT_UPDATED")).toBe(before);
  });

  it("treats same resulting draft terms as a no-op without duplicate audit", async () => {
    const fixture = await createPriceFixture();
    const before = await auditCount();
    const result = await prices.updateDraftPriceRevision(
      {
        priceRevisionId: fixture.priceRevision.id,
        expectedContentFingerprint:
          fixture.priceRevision.contentFingerprintSha256,
        amountMinor: fixture.priceRevision.amountMinor,
      },
      system(),
    );
    expect(result).toEqual({
      kind: "OK",
      changed: false,
      value: fixture.priceRevision,
    });
    expect(await auditCount()).toBe(before);
  });

  it("allows same-plan rebind and changes the draft fingerprint", async () => {
    const fixture = await createPriceFixture();
    const secondPlanRevision = ok(
      await plans.createDraftPlanRevision(
        {
          planId: fixture.plan.id,
          displayName: "Second",
          description: "second",
        },
        system(),
      ),
    );
    const result = ok(
      await prices.updateDraftPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
          planRevisionId: secondPlanRevision.id,
        },
        system(),
      ),
    );
    expect(result.planRevisionId).toBe(secondPlanRevision.id);
    expect(result.contentFingerprintSha256).not.toBe(
      fixture.priceRevision.contentFingerprintSha256,
    );
  });

  it("rejects cross-plan draft rebind without changing terms or audit", async () => {
    const fixture = await createPriceFixture();
    const other = await createPlanFixture();
    const before = await auditCount();
    expect(
      await prices.updateDraftPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
          planRevisionId: other.planRevision.id,
        },
        system(),
      ),
    ).toEqual({
      kind: "REJECTED",
      code: "PRICE_PLAN_REVISION_PLAN_MISMATCH",
    });
    expect(
      await prices.getPriceRevisionDraft(fixture.priceRevision.id),
    ).toEqual(fixture.priceRevision);
    expect(await auditCount()).toBe(before);
  });

  it("rejects invalid money, interval, and effective-window inputs before commercial mutation", async () => {
    const fixture = await createPriceFixture();
    const valid = {
      priceId: fixture.price.id,
      planRevisionId: fixture.planRevision.id,
      amountMinor: 20000,
      currency: "RUB",
      billingIntervalUnit: "MONTH" as const,
      billingIntervalCount: 1,
      effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
    };
    const invalidCommands: readonly unknown[] = [
      { ...valid, amountMinor: -1 },
      { ...valid, currency: "usd" },
      { ...valid, billingIntervalCount: 0 },
      { ...valid, effectiveTo: new Date("2026-01-31T00:00:00.000Z") },
    ];
    const beforeAudit = await auditCount();
    for (const command of invalidCommands) {
      await expect(
        prices.createDraftPriceRevision(
          command as Parameters<
            PriceCommandRepository["createDraftPriceRevision"]
          >[0],
          system(),
        ),
      ).rejects.toThrow();
    }
    expect(await tableCount("price_revisions")).toBe(1);
    expect(await auditCount()).toBe(beforeAudit);
  });

  it("publishes a price against a published plan revision with injected time and one audit", async () => {
    const fixture = await createPriceFixture({ publishPlan: true });
    const published = ok(
      await prices.publishPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
        },
        system(),
      ),
    );
    expect(published.state).toBe("PUBLISHED");
    expect(published.publishedAt).toEqual(new Date("2026-09-06T00:00:00.000Z"));
    expect(await auditCount("PRICE_REVISION_PUBLISHED")).toBe(1);
  });

  it("rejects publication while the bound plan revision is DRAFT", async () => {
    const fixture = await createPriceFixture();
    const before = await auditCount();
    expect(
      await prices.publishPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_PLAN_REVISION_NOT_PUBLISHED" });
    expect(
      await prices.getPriceRevisionDraft(fixture.priceRevision.id),
    ).toEqual(fixture.priceRevision);
    expect(await auditCount()).toBe(before);
  });

  it("makes second publication idempotent with unchanged publishedAt and no audit", async () => {
    const fixture = await createPriceFixture({ publishPlan: true });
    const first = ok(
      await prices.publishPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
        },
        system(),
      ),
    );
    const before = await auditCount();
    const second = await prices.publishPriceRevision(
      {
        priceRevisionId: fixture.priceRevision.id,
        expectedContentFingerprint: "0".repeat(64),
      },
      system(),
    );
    expect(second).toEqual({ kind: "OK", changed: false, value: first });
    expect(await auditCount()).toBe(before);
  });

  it("rejects stale fingerprint publication", async () => {
    const fixture = await createPriceFixture({ publishPlan: true });
    const updated = ok(
      await prices.updateDraftPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
          amountMinor: 20000,
        },
        system(),
      ),
    );
    expect(
      await prices.publishPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_DRAFT_STALE" });
    expect(
      await prices.getPriceRevisionDraft(fixture.priceRevision.id),
    ).toEqual(updated);
  });

  it("rolls back publication and audit when audit insertion fails", async () => {
    const fixture = await createPriceFixture({ publishPlan: true });
    const failingPrices = createP4PriceCommandRepository(
      failingAuditRuntime(),
      {
        clock: () => new Date("2026-09-06T00:00:00.000Z"),
      },
    );
    const before = await auditCount();
    await expect(
      failingPrices.publishPriceRevision(
        {
          priceRevisionId: fixture.priceRevision.id,
          expectedContentFingerprint:
            fixture.priceRevision.contentFingerprintSha256,
        },
        system(),
      ),
    ).rejects.toThrow("injected audit failure");
    const stored = await q<{
      state: string;
      publishedAt: Date | null;
    }>(
      'SELECT state,published_at AS "publishedAt" FROM price_revisions WHERE id=$1',
      [fixture.priceRevision.id],
    );
    expect(stored.rows[0]).toEqual({ state: "DRAFT", publishedAt: null });
    expect(await auditCount()).toBe(before);
  });

  it("retains the P4.1 database protection against direct published-term mutation", async () => {
    const fixture = await publishPriceFixture(
      await createPriceFixture({ publishPlan: true }),
    );
    await expect(
      q("UPDATE price_revisions SET amount_minor=123 WHERE id=$1", [
        fixture.priceRevision.id,
      ]),
    ).rejects.toThrow(/published price revision/i);
    const stored = await q<{ amountMinor: string }>(
      'SELECT amount_minor AS "amountMinor" FROM price_revisions WHERE id=$1',
      [fixture.priceRevision.id],
    );
    expect(Number(stored.rows[0]!.amountMinor)).toBe(19000);
  });

  it("requires a published price revision before DRAFT can become ACTIVE", async () => {
    const fixture = await createPriceFixture();
    const before = await auditCount();
    expect(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "DRAFT",
          targetStatus: "ACTIVE",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_PUBLISHED_REVISION_REQUIRED" });
    expect(
      (await q("SELECT status FROM prices WHERE id=$1", [fixture.price.id]))
        .rows,
    ).toEqual([{ status: "DRAFT" }]);
    expect(await auditCount()).toBe(before);
  });

  it("allows DRAFT to become ACTIVE after publication and audits the transition", async () => {
    const fixture = await activePublishedPriceFixture();
    expect(fixture.price.status).toBe("DRAFT");
    expect(await auditCount("PRICE_STATUS_CHANGED")).toBe(1);
    expect(
      (
        await q<{ status: string }>("SELECT status FROM prices WHERE id=$1", [
          fixture.price.id,
        ])
      ).rows,
    ).toEqual([{ status: "ACTIVE" }]);
  });

  it("supports ACTIVE to HIDDEN and HIDDEN to ACTIVE", async () => {
    const fixture = await activePublishedPriceFixture();
    expect(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ACTIVE",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    ).toMatchObject({ kind: "OK", changed: true, value: { status: "HIDDEN" } });
    expect(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "HIDDEN",
          targetStatus: "ACTIVE",
        },
        system(),
      ),
    ).toMatchObject({ kind: "OK", changed: true, value: { status: "ACTIVE" } });
    expect(await auditCount("PRICE_STATUS_CHANGED")).toBe(3);
  });

  it("rejects ACTIVE or HIDDEN to DRAFT", async () => {
    const fixture = await activePublishedPriceFixture();
    expect(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ACTIVE",
          targetStatus: "DRAFT",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_STATUS_TRANSITION_INVALID" });
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
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "HIDDEN",
          targetStatus: "DRAFT",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_STATUS_TRANSITION_INVALID" });
  });

  it("makes ARCHIVED terminal", async () => {
    const fixture = await createPriceFixture();
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "DRAFT",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    expect(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "ARCHIVED",
          targetStatus: "HIDDEN",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_STATUS_TRANSITION_INVALID" });
    expect(
      (await q("SELECT status FROM prices WHERE id=$1", [fixture.price.id]))
        .rows,
    ).toEqual([{ status: "ARCHIVED" }]);
  });

  it("treats same-state price status changes as no-ops without audit", async () => {
    const fixture = await createPriceFixture();
    const before = await auditCount();
    const result = await prices.changePriceStatus(
      {
        priceId: fixture.price.id,
        expectedStatus: "DRAFT",
        targetStatus: "DRAFT",
      },
      system(),
    );
    expect(result).toMatchObject({
      kind: "OK",
      changed: false,
      value: { status: "DRAFT" },
    });
    expect(await auditCount()).toBe(before);
  });

  it("rejects ACTIVE and HIDDEN targets when the parent plan is archived", async () => {
    const fixture = await createPriceFixture({ publishPlan: true });
    ok(
      await plans.changePlanStatus(
        {
          planId: fixture.plan.id,
          expectedStatus: "DRAFT",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    for (const targetStatus of ["ACTIVE", "HIDDEN"] as const) {
      expect(
        await prices.changePriceStatus(
          { priceId: fixture.price.id, expectedStatus: "DRAFT", targetStatus },
          system(),
        ),
      ).toEqual({ kind: "REJECTED", code: "PRICE_PLAN_ARCHIVED" });
    }
    expect(
      (await q("SELECT status FROM prices WHERE id=$1", [fixture.price.id]))
        .rows,
    ).toEqual([{ status: "DRAFT" }]);
  });

  it("can archive a price after its parent plan is already archived", async () => {
    const fixture = await createPriceFixture();
    ok(
      await plans.changePlanStatus(
        {
          planId: fixture.plan.id,
          expectedStatus: "DRAFT",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    );
    expect(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "DRAFT",
          targetStatus: "ARCHIVED",
        },
        system(),
      ),
    ).toMatchObject({
      kind: "OK",
      changed: true,
      value: { status: "ARCHIVED" },
    });
  });

  it("creates the first sale assignment with server revision and one audit", async () => {
    const fixture = await activePublishedPriceFixture();
    const assignment = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "initial sale price",
        },
        system(),
      ),
    );
    expect(assignment.assignmentRevision).toBe(1);
    expect(assignment.selectedPriceRevisionId).toBe(fixture.priceRevision.id);
    expect(await tableCount("price_sale_assignments")).toBe(1);
    expect(await auditCount("PRICE_SALE_ASSIGNMENT_SCHEDULED")).toBe(1);
  });

  it("rejects selecting a DRAFT price revision without assignment mutation", async () => {
    const fixture = await activePublishedPriceFixture();
    const draft = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.planRevision.id,
          amountMinor: 29000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    const before = await auditCount();
    expect(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: draft.id,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
          reason: "draft must not sell",
        },
        system(),
      ),
    ).toEqual({
      kind: "REJECTED",
      code: "PRICE_ASSIGNMENT_REVISION_NOT_PUBLISHED",
    });
    expect(await tableCount("price_sale_assignments")).toBe(0);
    expect(await auditCount()).toBe(before);
  });

  it("rejects a cross-price selected revision", async () => {
    const first = await activePublishedPriceFixture();
    const second = await activePublishedPriceFixture();
    const before = await auditCount();
    expect(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: first.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: second.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "cross-price must fail",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_NOT_FOUND" });
    expect(await tableCount("price_sale_assignments")).toBe(0);
    expect(await auditCount()).toBe(before);
  });

  it("rejects assignment effectiveFrom outside the selected revision window", async () => {
    const fixture = await activePublishedPriceFixture({
      effectiveTo: new Date("2026-02-01T00:00:00.000Z"),
    });
    const before = await auditCount();
    expect(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
          reason: "outside revision",
        },
        system(),
      ),
    ).toEqual({
      kind: "REJECTED",
      code: "PRICE_ASSIGNMENT_OUTSIDE_REVISION_WINDOW",
    });
    expect(await tableCount("price_sale_assignments")).toBe(0);
    expect(await auditCount()).toBe(before);
  });

  it("serializes concurrent assignments with one optimistic-concurrency winner and final DB revision 1", async () => {
    const fixture = await activePublishedPriceFixture();
    const results = await Promise.all([
      prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "writer one",
        },
        system(),
      ),
      prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "writer two",
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
    expect(
      (
        await q<{ assignmentRevision: number }>(
          'SELECT assignment_revision AS "assignmentRevision" FROM price_sale_assignments WHERE price_id=$1',
          [fixture.price.id],
        )
      ).rows,
    ).toEqual([{ assignmentRevision: 1 }]);
    expect(await auditCount("PRICE_SALE_ASSIGNMENT_SCHEDULED")).toBe(1);
  });

  it("makes an exact current assignment idempotent without a duplicate row or audit", async () => {
    const fixture = await activePublishedPriceFixture();
    const command = {
      priceId: fixture.price.id,
      expectedLatestAssignmentRevision: 0,
      selectedPriceRevisionId: fixture.priceRevision.id,
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      reason: "same schedule",
    } as const;
    const first = ok(
      await prices.schedulePriceSaleAssignment(command, system()),
    );
    const before = await auditCount();
    const duplicate = await prices.schedulePriceSaleAssignment(
      {
        ...command,
        expectedLatestAssignmentRevision: first.assignmentRevision,
      },
      system(),
    );
    expect(duplicate).toEqual({ kind: "OK", changed: false, value: first });
    expect(await tableCount("price_sale_assignments")).toBe(1);
    expect(await auditCount()).toBe(before);
  });

  it("appends a new assignment revision when the schedule differs", async () => {
    const fixture = await activePublishedPriceFixture();
    const first = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "first schedule",
        },
        system(),
      ),
    );
    const second = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: first.assignmentRevision,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
          reason: "different schedule",
        },
        system(),
      ),
    );
    expect(second.assignmentRevision).toBe(2);
    expect(await tableCount("price_sale_assignments")).toBe(2);
  });

  it("appends a NULL selected revision as an explicit closure", async () => {
    const fixture = await activePublishedPriceFixture();
    const first = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "open sales",
        },
        system(),
      ),
    );
    const closure = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: first.assignmentRevision,
          selectedPriceRevisionId: null,
          effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
          reason: "close sales",
        },
        system(),
      ),
    );
    expect(closure).toMatchObject({
      assignmentRevision: 2,
      selectedPriceRevisionId: null,
    });
    expect(
      await prices.resolvePriceForNewSale({
        priceId: fixture.price.id,
        at: new Date("2026-02-15T00:00:00.000Z"),
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_SALE_CLOSED" });
  });

  it("rolls back sale assignment append and audit when audit insertion fails", async () => {
    const fixture = await activePublishedPriceFixture();
    const failingPrices = createP4PriceCommandRepository(
      failingAuditRuntime(),
      {
        clock: () => new Date("2026-09-06T00:00:00.000Z"),
      },
    );
    const before = await auditCount();
    await expect(
      failingPrices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "rollback schedule",
        },
        system(),
      ),
    ).rejects.toThrow("injected audit failure");
    expect(await tableCount("price_sale_assignments")).toBe(0);
    expect(await auditCount()).toBe(before);
  });

  it("rejects new-sale resolution when no assignment is effective", async () => {
    const fixture = await activePublishedPriceFixture();
    expect(
      await prices.resolvePriceForNewSale({
        priceId: fixture.price.id,
        at: new Date("2026-01-15T00:00:00.000Z"),
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_SALE_ASSIGNMENT_NOT_FOUND" });
  });

  it("rejects resolution when the parent plan is not ACTIVE", async () => {
    const fixture = await publishPriceFixture(
      await createPriceFixture({ publishPlan: true }),
    );
    ok(
      await prices.changePriceStatus(
        {
          priceId: fixture.price.id,
          expectedStatus: "DRAFT",
          targetStatus: "ACTIVE",
        },
        system(),
      ),
    );
    ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "plan inactive",
        },
        system(),
      ),
    );
    expect(
      await prices.resolvePriceForNewSale({ priceId: fixture.price.id }),
    ).toEqual({ kind: "REJECTED", code: "PLAN_NOT_ACTIVE" });
  });

  it("rejects resolution when the price is not ACTIVE", async () => {
    const fixture = await publishPriceFixture(
      await createPriceFixture({ publishPlan: true }),
    );
    await activatePlan(fixture.plan);
    ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "price inactive",
        },
        system(),
      ),
    );
    expect(
      await prices.resolvePriceForNewSale({ priceId: fixture.price.id }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_NOT_ACTIVE" });
  });

  it("resolves an active plan and price to exact immutable published terms", async () => {
    const fixture = await activePublishedPriceFixture();
    const assignment = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: fixture.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "sellable",
        },
        system(),
      ),
    );
    const result = await prices.resolvePriceForNewSale({
      priceId: fixture.price.id,
      at: new Date("2026-01-15T00:00:00.000Z"),
    });
    expect(result).toMatchObject({ kind: "RESOLVED" });
    if (result.kind === "RESOLVED") {
      expect(result.value.price.id).toBe(fixture.price.id);
      expect(result.value.priceRevision.id).toBe(fixture.priceRevision.id);
      expect(result.value.priceRevision.amountMinor).toBe(19000);
      expect(result.value.assignment.id).toBe(assignment.id);
      expect(result.value.assignment.assignmentRevision).toBe(1);
    }
  });

  it("ignores a future assignment before its effectiveFrom", async () => {
    const fixture = await activePublishedPriceFixture();
    await prices.schedulePriceSaleAssignment(
      {
        priceId: fixture.price.id,
        expectedLatestAssignmentRevision: null,
        selectedPriceRevisionId: fixture.priceRevision.id,
        effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
        reason: "future schedule",
      },
      system(),
    );
    expect(
      await prices.resolvePriceForNewSale({
        priceId: fixture.price.id,
        at: new Date("2026-02-28T23:59:59.999Z"),
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_SALE_ASSIGNMENT_NOT_FOUND" });
  });

  it("selects the highest assignment revision when multiple assignments are effective", async () => {
    const fixture = await activePublishedPriceFixture();
    const secondDraft = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: fixture.price.id,
          planRevisionId: fixture.planRevision.id,
          amountMinor: 29000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    const second = ok(
      await prices.publishPriceRevision(
        {
          priceRevisionId: secondDraft.id,
          expectedContentFingerprint: secondDraft.contentFingerprintSha256,
        },
        system(),
      ),
    );
    await prices.schedulePriceSaleAssignment(
      {
        priceId: fixture.price.id,
        expectedLatestAssignmentRevision: null,
        selectedPriceRevisionId: fixture.priceRevision.id,
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
        reason: "old schedule",
      },
      system(),
    );
    const later = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: fixture.price.id,
          expectedLatestAssignmentRevision: 1,
          selectedPriceRevisionId: second.id,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
          reason: "new schedule",
        },
        system(),
      ),
    );
    const result = await prices.resolvePriceForNewSale({
      priceId: fixture.price.id,
      at: new Date("2026-03-15T00:00:00.000Z"),
    });
    expect(result).toMatchObject({ kind: "RESOLVED" });
    if (result.kind === "RESOLVED") {
      expect(result.value.assignment.assignmentRevision).toBe(
        later.assignmentRevision,
      );
      expect(result.value.assignment.id).toBe(later.id);
      expect(result.value.priceRevision.id).toBe(second.id);
    }
  });

  it("resolves an effective NULL assignment as explicitly closed", async () => {
    const fixture = await activePublishedPriceFixture();
    await prices.schedulePriceSaleAssignment(
      {
        priceId: fixture.price.id,
        expectedLatestAssignmentRevision: null,
        selectedPriceRevisionId: null,
        effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
        reason: "explicit closure",
      },
      system(),
    );
    expect(
      await prices.resolvePriceForNewSale({
        priceId: fixture.price.id,
        at: new Date("2026-02-15T00:00:00.000Z"),
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_SALE_CLOSED" });
  });

  it("fails closed at the exact selected revision effectiveTo", async () => {
    const fixture = await activePublishedPriceFixture({
      effectiveTo: new Date("2026-02-01T00:00:00.000Z"),
    });
    await prices.schedulePriceSaleAssignment(
      {
        priceId: fixture.price.id,
        expectedLatestAssignmentRevision: null,
        selectedPriceRevisionId: fixture.priceRevision.id,
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
        reason: "expires at boundary",
      },
      system(),
    );
    expect(
      await prices.resolvePriceForNewSale({
        priceId: fixture.price.id,
        at: new Date("2026-02-01T00:00:00.000Z"),
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_EXPIRED" });
  });

  it("does not fall back when the highest effective assignment selects an expired revision", async () => {
    const first = await activePublishedPriceFixture({
      effectiveTo: new Date("2026-02-01T00:00:00.000Z"),
    });
    const secondDraft = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: first.price.id,
          planRevisionId: first.planRevision.id,
          amountMinor: 29000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-02-02T00:00:00.000Z"),
          effectiveTo: new Date("2026-02-15T00:00:00.000Z"),
        },
        system(),
      ),
    );
    const second = ok(
      await prices.publishPriceRevision(
        {
          priceRevisionId: secondDraft.id,
          expectedContentFingerprint: secondDraft.contentFingerprintSha256,
        },
        system(),
      ),
    );
    await prices.schedulePriceSaleAssignment(
      {
        priceId: first.price.id,
        expectedLatestAssignmentRevision: null,
        selectedPriceRevisionId: first.priceRevision.id,
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
        reason: "old",
      },
      system(),
    );
    await prices.schedulePriceSaleAssignment(
      {
        priceId: first.price.id,
        expectedLatestAssignmentRevision: 1,
        selectedPriceRevisionId: second.id,
        effectiveFrom: new Date("2026-02-02T00:00:00.000Z"),
        reason: "new but expiring",
      },
      system(),
    );
    expect(
      await prices.resolvePriceForNewSale({
        priceId: first.price.id,
        at: new Date("2026-02-20T00:00:00.000Z"),
      }),
    ).toEqual({ kind: "REJECTED", code: "PRICE_REVISION_EXPIRED" });
  });

  it("performs resolution without audit mutation", async () => {
    const fixture = await activePublishedPriceFixture();
    await prices.schedulePriceSaleAssignment(
      {
        priceId: fixture.price.id,
        expectedLatestAssignmentRevision: null,
        selectedPriceRevisionId: fixture.priceRevision.id,
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
        reason: "no resolver audit",
      },
      system(),
    );
    const before = await auditCount();
    expect(
      await prices.resolvePriceForNewSale({
        priceId: fixture.price.id,
        at: new Date("2026-01-15T00:00:00.000Z"),
      }),
    ).toMatchObject({ kind: "RESOLVED" });
    expect(await auditCount()).toBe(before);
  });

  it("grandfathers exact published revision 1 after switching new sales to revision 2", async () => {
    const first = await activePublishedPriceFixture({ amountMinor: 19000 });
    const assignmentA = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: first.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: first.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "revision one",
        },
        system(),
      ),
    );
    const secondDraft = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: first.price.id,
          planRevisionId: first.planRevision.id,
          amountMinor: 29000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    const second = ok(
      await prices.publishPriceRevision(
        {
          priceRevisionId: secondDraft.id,
          expectedContentFingerprint: secondDraft.contentFingerprintSha256,
        },
        system(),
      ),
    );
    const assignmentB = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: first.price.id,
          expectedLatestAssignmentRevision: assignmentA.assignmentRevision,
          selectedPriceRevisionId: second.id,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
          reason: "revision two",
        },
        system(),
      ),
    );
    const beforeSwitch = await prices.resolvePriceForNewSale({
      priceId: first.price.id,
      at: new Date("2026-02-28T23:59:59.999Z"),
    });
    const afterSwitch = await prices.resolvePriceForNewSale({
      priceId: first.price.id,
      at: new Date("2026-03-01T00:00:00.000Z"),
    });
    expect(beforeSwitch).toMatchObject({ kind: "RESOLVED" });
    expect(afterSwitch).toMatchObject({ kind: "RESOLVED" });
    if (beforeSwitch.kind === "RESOLVED") {
      expect(beforeSwitch.value.assignment.id).toBe(assignmentA.id);
      expect(beforeSwitch.value.priceRevision.id).toBe(first.priceRevision.id);
      expect(beforeSwitch.value.priceRevision.amountMinor).toBe(19000);
    }
    if (afterSwitch.kind === "RESOLVED") {
      expect(afterSwitch.value.assignment.id).toBe(assignmentB.id);
      expect(afterSwitch.value.priceRevision.id).toBe(second.id);
      expect(afterSwitch.value.priceRevision.amountMinor).toBe(29000);
    }
    const historical = await prices.getPublishedPriceRevision(
      first.priceRevision.id,
    );
    expect(historical).toMatchObject({
      id: first.priceRevision.id,
      state: "PUBLISHED",
      amountMinor: 19000,
      currency: "RUB",
      billingIntervalUnit: "MONTH",
      billingIntervalCount: 1,
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      effectiveTo: null,
    });
  });

  it("supports selection, NULL closure, and reopen with a new selected revision", async () => {
    const first = await activePublishedPriceFixture({ amountMinor: 19000 });
    const old = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: first.price.id,
          expectedLatestAssignmentRevision: null,
          selectedPriceRevisionId: first.priceRevision.id,
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          reason: "old selection",
        },
        system(),
      ),
    );
    const closed = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: first.price.id,
          expectedLatestAssignmentRevision: old.assignmentRevision,
          selectedPriceRevisionId: null,
          effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
          reason: "closure",
        },
        system(),
      ),
    );
    const secondDraft = ok(
      await prices.createDraftPriceRevision(
        {
          priceId: first.price.id,
          planRevisionId: first.planRevision.id,
          amountMinor: 29000,
          currency: "RUB",
          billingIntervalUnit: "MONTH",
          billingIntervalCount: 1,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
        },
        system(),
      ),
    );
    const second = ok(
      await prices.publishPriceRevision(
        {
          priceRevisionId: secondDraft.id,
          expectedContentFingerprint: secondDraft.contentFingerprintSha256,
        },
        system(),
      ),
    );
    const reopened = ok(
      await prices.schedulePriceSaleAssignment(
        {
          priceId: first.price.id,
          expectedLatestAssignmentRevision: closed.assignmentRevision,
          selectedPriceRevisionId: second.id,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
          reason: "reopen",
        },
        system(),
      ),
    );
    const beforeClose = await prices.resolvePriceForNewSale({
      priceId: first.price.id,
      at: new Date("2026-01-15T00:00:00.000Z"),
    });
    const duringClose = await prices.resolvePriceForNewSale({
      priceId: first.price.id,
      at: new Date("2026-02-15T00:00:00.000Z"),
    });
    const afterReopen = await prices.resolvePriceForNewSale({
      priceId: first.price.id,
      at: new Date("2026-03-15T00:00:00.000Z"),
    });
    expect(beforeClose).toMatchObject({ kind: "RESOLVED" });
    if (beforeClose.kind === "RESOLVED") {
      expect(beforeClose.value.assignment.id).toBe(old.id);
      expect(beforeClose.value.priceRevision.id).toBe(first.priceRevision.id);
    }
    expect(duringClose).toEqual({
      kind: "REJECTED",
      code: "PRICE_SALE_CLOSED",
    });
    expect(afterReopen).toMatchObject({ kind: "RESOLVED" });
    if (afterReopen.kind === "RESOLVED") {
      expect(afterReopen.value.assignment.id).toBe(reopened.id);
      expect(afterReopen.value.priceRevision.id).toBe(second.id);
    }
  });

  it("serializes plan archival against a price mutation with a deterministic archive-first gate", async () => {
    const fixture = await createPriceFixture();
    let releaseGate!: () => void;
    const release = {
      promise: new Promise<void>((resolve) => {
        releaseGate = resolve;
      }),
    };
    let reachedGate!: () => void;
    const reached = {
      promise: new Promise<void>((resolve) => {
        reachedGate = resolve;
      }),
      resolve: () => reachedGate(),
    };
    const gatedPrices = createP4PriceCommandRepository(
      gatedPlanLockRuntime(fixture.plan.id, reached, release),
      { clock: () => new Date("2026-09-06T00:00:00.000Z") },
    );
    const priceMutation = gatedPrices.createDraftPriceRevision(
      {
        priceId: fixture.price.id,
        planRevisionId: fixture.planRevision.id,
        amountMinor: 20000,
        currency: "RUB",
        billingIntervalUnit: "MONTH",
        billingIntervalCount: 1,
        effectiveFrom: new Date("2026-02-01T00:00:00.000Z"),
      },
      system(),
    );
    await reached.promise;
    const archiveResult = await plans.changePlanStatus(
      {
        planId: fixture.plan.id,
        expectedStatus: "DRAFT",
        targetStatus: "ARCHIVED",
      },
      system(),
    );
    expect(archiveResult).toMatchObject({
      kind: "OK",
      value: { status: "ARCHIVED" },
    });
    releaseGate();
    expect(await priceMutation).toEqual({
      kind: "REJECTED",
      code: "PRICE_PLAN_ARCHIVED",
    });
    expect(await tableCount("price_revisions")).toBe(1);
    expect(
      (await q("SELECT status FROM plans WHERE id=$1", [fixture.plan.id])).rows,
    ).toEqual([{ status: "ARCHIVED" }]);
  });
});
