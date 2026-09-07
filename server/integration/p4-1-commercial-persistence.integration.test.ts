import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabaseRuntime,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";
import { runMigrations } from "../packages/db/src/migrations.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");

let db: DatabaseRuntime;
const q = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values?: unknown[],
) => db.query<T>(text, values);
const at = (value: string) => new Date(value);
const planCode = () => `p41-${randomUUID().replaceAll("-", "")}`;
const priceCode = () => `price-${randomUUID().replaceAll("-", "")}`;

async function rejects(text: string, values?: unknown[]) {
  await expect(q(text, values)).rejects.toBeInstanceOf(Error);
}

async function cleanCommercialRows() {
  await q(
    "TRUNCATE checkout_intents,billing_events,subscription_transitions,payments,subscriptions,price_sale_assignments,account_entitlement_overrides,price_revisions,plan_entitlements,prices,plan_revisions,entitlement_definitions,plans",
  );
}

async function createPlan(code = planCode()) {
  const id = randomUUID();
  await q("INSERT INTO plans(id,code) VALUES($1,$2)", [id, code]);
  return id;
}

async function createPlanRevision(
  planId: string,
  revision = 1,
  state: "DRAFT" | "PUBLISHED" = "DRAFT",
) {
  const id = randomUUID();
  await q(
    "INSERT INTO plan_revisions(id,plan_id,revision,state,display_name,description,published_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [
      id,
      planId,
      revision,
      state,
      `Plan revision ${revision}`,
      "A bounded commercial plan revision.",
      state === "PUBLISHED" ? at("2026-09-05T00:00:00.000Z") : null,
    ],
  );
  return id;
}

async function createPrice(planId: string) {
  const id = randomUUID();
  await q(
    "INSERT INTO prices(id,plan_id,code,market_key,channel_key) VALUES($1,$2,$3,'global','direct')",
    [id, planId, priceCode()],
  );
  return id;
}

async function createPriceRevision(
  priceId: string,
  planRevisionId: string,
  revision = 1,
  overrides: Record<string, unknown> = {},
) {
  const id = randomUUID();
  const values = {
    amountMinor: 19000,
    currency: "EUR",
    billingIntervalUnit: "MONTH",
    billingIntervalCount: 1,
    effectiveFrom: at("2026-09-01T00:00:00.000Z"),
    effectiveTo: null,
    state: "DRAFT",
    publishedAt: null,
    ...overrides,
  };
  await q(
    "INSERT INTO price_revisions(id,price_id,plan_revision_id,revision,state,amount_minor,currency,billing_interval_unit,billing_interval_count,effective_from,effective_to,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
    [
      id,
      priceId,
      planRevisionId,
      revision,
      values.state,
      values.amountMinor,
      values.currency,
      values.billingIntervalUnit,
      values.billingIntervalCount,
      values.effectiveFrom,
      values.effectiveTo,
      values.publishedAt,
    ],
  );
  return id;
}

async function createAccount() {
  const id = randomUUID();
  await q("INSERT INTO accounts(id) VALUES($1)", [id]);
  return id;
}

describe.sequential("P4.1 real PostgreSQL commercial persistence", () => {
  beforeAll(async () => {
    db = createDatabaseRuntime(connectionString!);
    await db.ready();
    await runMigrations({ connectionString: connectionString! });
  });

  beforeEach(cleanCommercialRows);
  afterAll(() => db.close());

  it("inserts a valid draft plan and draft revision", async () => {
    const planId = await createPlan("seller-basic");
    const revisionId = await createPlanRevision(planId);
    const result = await q<{ code: string; state: string }>(
      "SELECT p.code,r.state FROM plans p JOIN plan_revisions r ON r.plan_id=p.id WHERE r.id=$1",
      [revisionId],
    );
    expect(result.rows).toEqual([{ code: "seller-basic", state: "DRAFT" }]);
  });

  it("rejects duplicate and invalid stable plan codes", async () => {
    await createPlan("seller-basic");
    await rejects("INSERT INTO plans(code) VALUES($1)", ["seller-basic"]);
    await rejects("INSERT INTO plans(code) VALUES($1)", ["Seller Basic"]);
    await rejects("INSERT INTO plans(code) VALUES($1)", ["<script>"]);
  });

  it("rejects duplicate, non-positive, and inconsistent plan revisions", async () => {
    const planId = await createPlan();
    await createPlanRevision(planId);
    await rejects(
      "INSERT INTO plan_revisions(plan_id,revision,display_name,description) VALUES($1,1,'Duplicate','x')",
      [planId],
    );
    await rejects(
      "INSERT INTO plan_revisions(plan_id,revision,display_name,description) VALUES($1,0,'Invalid','x')",
      [planId],
    );
    await rejects(
      "INSERT INTO plan_revisions(plan_id,revision,state,display_name,description,published_at) VALUES($1,2,'DRAFT','Invalid','x',now()) RETURNING id",
      [planId],
    );
    await rejects(
      "INSERT INTO plan_revisions(plan_id,revision,state,display_name,description,published_at) VALUES($1,3,'PUBLISHED','Invalid','x',NULL)",
      [planId],
    );
  });

  it("allows draft revision editing and one-way publication", async () => {
    const planId = await createPlan();
    const revisionId = await createPlanRevision(planId);
    await q("UPDATE plan_revisions SET display_name='Edited' WHERE id=$1", [
      revisionId,
    ]);
    await q(
      "UPDATE plan_revisions SET state='PUBLISHED',published_at=$2 WHERE id=$1",
      [revisionId, at("2026-09-05T00:00:00.000Z")],
    );
    const row = await q<{ state: string; display_name: string }>(
      "SELECT state,display_name FROM plan_revisions WHERE id=$1",
      [revisionId],
    );
    expect(row.rows[0]).toEqual({ state: "PUBLISHED", display_name: "Edited" });
  });

  it("rejects published plan revision update, delete, and demotion", async () => {
    const planId = await createPlan();
    const revisionId = await createPlanRevision(planId, 1, "PUBLISHED");
    await rejects(
      "UPDATE plan_revisions SET display_name='Changed' WHERE id=$1",
      [revisionId],
    );
    await rejects("DELETE FROM plan_revisions WHERE id=$1", [revisionId]);
    await rejects(
      "UPDATE plan_revisions SET state='DRAFT',published_at=NULL WHERE id=$1",
      [revisionId],
    );
  });

  it("freezes draft plan revision identity while allowing metadata and publication", async () => {
    const planId = await createPlan();
    const otherPlanId = await createPlan();
    const revisionId = await createPlanRevision(planId);
    await rejects("UPDATE plan_revisions SET id=$2 WHERE id=$1", [
      revisionId,
      randomUUID(),
    ]);
    await rejects("UPDATE plan_revisions SET plan_id=$2 WHERE id=$1", [
      revisionId,
      otherPlanId,
    ]);
    await rejects("UPDATE plan_revisions SET revision=2 WHERE id=$1", [
      revisionId,
    ]);
    await q("UPDATE plan_revisions SET display_name='Edited' WHERE id=$1", [
      revisionId,
    ]);
    await q(
      "UPDATE plan_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [revisionId],
    );
  });

  it("freezes direct SQL plan identity mutation and preserves archive terminality", async () => {
    const planId = await createPlan();
    await rejects("UPDATE plans SET id=$2 WHERE id=$1", [planId, randomUUID()]);
    await rejects("UPDATE plans SET code=$2 WHERE id=$1", [planId, planCode()]);
    await q("UPDATE plans SET status='ARCHIVED' WHERE id=$1", [planId]);
    await rejects("UPDATE plans SET status='ACTIVE' WHERE id=$1", [planId]);
  });

  it("accepts typed BOOLEAN and INTEGER plan entitlements", async () => {
    const planId = await createPlan();
    const revisionId = await createPlanRevision(planId);
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability'),('device.max_active','INTEGER','LIMIT','Active device limit')",
    );
    await q(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,'feature.analytics',true)",
      [revisionId],
    );
    await q(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,integer_value) VALUES($1,'device.max_active',2)",
      [revisionId],
    );
    expect(
      (
        await q("SELECT * FROM plan_entitlements WHERE plan_revision_id=$1", [
          revisionId,
        ])
      ).rows,
    ).toHaveLength(2);
  });

  it("rejects mismatched, mixed, and absent plan entitlement values", async () => {
    const planId = await createPlan();
    const revisionId = await createPlanRevision(planId);
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability'),('device.max_active','INTEGER','LIMIT','Active device limit')",
    );
    await rejects(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,integer_value) VALUES($1,'feature.analytics',1)",
      [revisionId],
    );
    await rejects(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,'device.max_active',true)",
      [revisionId],
    );
    await rejects(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value,integer_value) VALUES($1,'feature.analytics',true,1)",
      [revisionId],
    );
    await rejects(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key) VALUES($1,'feature.analytics')",
      [revisionId],
    );
  });

  it("freezes plan entitlements when the parent revision is published", async () => {
    const planId = await createPlan();
    const revisionId = await createPlanRevision(planId);
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability')",
    );
    await q(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,'feature.analytics',true)",
      [revisionId],
    );
    await q(
      "UPDATE plan_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [revisionId],
    );
    await rejects(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,'feature.analytics',false)",
      [revisionId],
    );
    await rejects(
      "UPDATE plan_entitlements SET boolean_value=false WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
      [revisionId],
    );
    await rejects(
      "DELETE FROM plan_entitlements WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
      [revisionId],
    );
  });

  it("rejects published entitlement reparenting to a draft and preserves composition", async () => {
    const planId = await createPlan();
    const publishedRevisionId = await createPlanRevision(planId);
    const draftRevisionId = await createPlanRevision(planId, 2);
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability')",
    );
    await q(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,'feature.analytics',true)",
      [publishedRevisionId],
    );
    await q(
      "UPDATE plan_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [publishedRevisionId],
    );
    await rejects(
      "UPDATE plan_entitlements SET plan_revision_id=$2 WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
      [publishedRevisionId, draftRevisionId],
    );
    expect(
      (
        await q<{ plan_revision_id: string; boolean_value: boolean }>(
          "SELECT plan_revision_id,boolean_value FROM plan_entitlements WHERE entitlement_key='feature.analytics'",
        )
      ).rows,
    ).toEqual([{ plan_revision_id: publishedRevisionId, boolean_value: true }]);
  });

  it("rejects draft entitlement reparenting into a published revision", async () => {
    const planId = await createPlan();
    const publishedRevisionId = await createPlanRevision(
      planId,
      1,
      "PUBLISHED",
    );
    const draftRevisionId = await createPlanRevision(planId, 2);
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability')",
    );
    await q(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,'feature.analytics',true)",
      [draftRevisionId],
    );
    await rejects(
      "UPDATE plan_entitlements SET plan_revision_id=$2 WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
      [draftRevisionId, publishedRevisionId],
    );
    expect(
      (
        await q<{ plan_revision_id: string }>(
          "SELECT plan_revision_id FROM plan_entitlements WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
          [draftRevisionId],
        )
      ).rows,
    ).toEqual([{ plan_revision_id: draftRevisionId }]);
  });

  it("rejects every direct SQL mutation of published entitlement composition", async () => {
    const planId = await createPlan();
    const revisionId = await createPlanRevision(planId);
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability'),('feature.reports','BOOLEAN','CAPABILITY','Reports capability')",
    );
    await q(
      "INSERT INTO plan_entitlements(plan_revision_id,entitlement_key,boolean_value) VALUES($1,'feature.analytics',true)",
      [revisionId],
    );
    await q(
      "UPDATE plan_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [revisionId],
    );
    await rejects(
      "UPDATE plan_entitlements SET boolean_value=false WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
      [revisionId],
    );
    await rejects(
      "UPDATE plan_entitlements SET entitlement_key='feature.reports' WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
      [revisionId],
    );
    await rejects(
      "DELETE FROM plan_entitlements WHERE plan_revision_id=$1 AND entitlement_key='feature.analytics'",
      [revisionId],
    );
  });

  it("enforces entitlement definition typing and key uniqueness", async () => {
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability'),('device.max_active','INTEGER','LIMIT','Active device limit')",
    );
    await rejects(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Duplicate')",
    );
    await rejects(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('limit.bad','BOOLEAN','LIMIT','Mismatch')",
    );
    await rejects(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('capability.bad','INTEGER','CAPABILITY','Mismatch')",
    );
  });

  it("allows only metadata correction and one-way entitlement deprecation", async () => {
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Original')",
    );
    await q(
      "UPDATE entitlement_definitions SET description='Corrected',deprecated_at=now() WHERE entitlement_key='feature.analytics'",
    );
    await rejects(
      "UPDATE entitlement_definitions SET value_type='INTEGER' WHERE entitlement_key='feature.analytics'",
    );
    await rejects(
      "UPDATE entitlement_definitions SET deprecated_at=NULL WHERE entitlement_key='feature.analytics'",
    );
    await rejects(
      "DELETE FROM entitlement_definitions WHERE entitlement_key='feature.analytics'",
    );
  });

  it("accepts a same-plan draft price revision and exact binding", async () => {
    const planId = await createPlan();
    const planRevisionId = await createPlanRevision(planId);
    const priceId = await createPrice(planId);
    const priceRevisionId = await createPriceRevision(priceId, planRevisionId);
    expect(
      (await q("SELECT id FROM price_revisions WHERE id=$1", [priceRevisionId]))
        .rows,
    ).toHaveLength(1);
  });

  it("freezes every stable price identity field under direct SQL", async () => {
    const planId = await createPlan();
    const otherPlanId = await createPlan();
    const priceId = await createPrice(planId);
    await rejects("UPDATE prices SET id=$2 WHERE id=$1", [
      priceId,
      randomUUID(),
    ]);
    await rejects("UPDATE prices SET plan_id=$2 WHERE id=$1", [
      priceId,
      otherPlanId,
    ]);
    await rejects("UPDATE prices SET code=$2 WHERE id=$1", [
      priceId,
      priceCode(),
    ]);
    await rejects("UPDATE prices SET market_key='eu' WHERE id=$1", [priceId]);
    await rejects("UPDATE prices SET channel_key='partner' WHERE id=$1", [
      priceId,
    ]);
  });

  it("rejects duplicate and cross-plan price revision bindings", async () => {
    const planA = await createPlan();
    const planB = await createPlan();
    const revisionA = await createPlanRevision(planA);
    const revisionB = await createPlanRevision(planB);
    const priceA = await createPrice(planA);
    await createPriceRevision(priceA, revisionA);
    await rejects(
      "INSERT INTO price_revisions(price_id,plan_revision_id,revision,amount_minor,currency,billing_interval_unit,billing_interval_count,effective_from) VALUES($1,$2,1,19000,'EUR','MONTH',1,$3)",
      [priceA, revisionA, at("2026-09-01T00:00:00.000Z")],
    );
    await rejects(
      "INSERT INTO price_revisions(price_id,plan_revision_id,revision,amount_minor,currency,billing_interval_unit,billing_interval_count,effective_from) VALUES($1,$2,2,19000,'EUR','MONTH',1,$3)",
      [priceA, revisionB, at("2026-09-01T00:00:00.000Z")],
    );
  });

  it("freezes draft price revision identity fields under direct SQL", async () => {
    const planId = await createPlan();
    const priceId = await createPrice(planId);
    const planRevisionId = await createPlanRevision(planId);
    const otherPriceId = await createPrice(planId);
    const priceRevisionId = await createPriceRevision(priceId, planRevisionId);
    await rejects("UPDATE price_revisions SET id=$2 WHERE id=$1", [
      priceRevisionId,
      randomUUID(),
    ]);
    await rejects("UPDATE price_revisions SET price_id=$2 WHERE id=$1", [
      priceRevisionId,
      otherPriceId,
    ]);
    await rejects("UPDATE price_revisions SET revision=2 WHERE id=$1", [
      priceRevisionId,
    ]);
  });

  it("allows same-plan draft price revision rebinding and rejects cross-plan rebinding", async () => {
    const planId = await createPlan();
    const otherPlanId = await createPlan();
    const firstPlanRevisionId = await createPlanRevision(planId, 1);
    const secondPlanRevisionId = await createPlanRevision(planId, 2);
    const otherPlanRevisionId = await createPlanRevision(otherPlanId, 1);
    const priceId = await createPrice(planId);
    const priceRevisionId = await createPriceRevision(
      priceId,
      firstPlanRevisionId,
    );
    await q("UPDATE price_revisions SET plan_revision_id=$2 WHERE id=$1", [
      priceRevisionId,
      secondPlanRevisionId,
    ]);
    await rejects(
      "UPDATE price_revisions SET plan_revision_id=$2 WHERE id=$1",
      [priceRevisionId, otherPlanRevisionId],
    );
    expect(
      (
        await q<{ plan_revision_id: string }>(
          "SELECT plan_revision_id FROM price_revisions WHERE id=$1",
          [priceRevisionId],
        )
      ).rows,
    ).toEqual([{ plan_revision_id: secondPlanRevisionId }]);
  });

  it("requires a published plan revision before publishing a price revision", async () => {
    const planId = await createPlan();
    const planRevisionId = await createPlanRevision(planId);
    const priceId = await createPrice(planId);
    const priceRevisionId = await createPriceRevision(priceId, planRevisionId);
    await rejects(
      "UPDATE price_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [priceRevisionId],
    );
    await q(
      "UPDATE plan_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [planRevisionId],
    );
    await q(
      "UPDATE price_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [priceRevisionId],
    );
  });

  it("rejects all invalid money, currency, period, and effective-window terms", async () => {
    const planId = await createPlan();
    const planRevisionId = await createPlanRevision(planId);
    const priceId = await createPrice(planId);
    const base = (overrides: Record<string, unknown>) =>
      createPriceRevision(priceId, planRevisionId, 1, overrides);
    await rejects(
      "INSERT INTO price_revisions(price_id,plan_revision_id,revision,amount_minor,currency,billing_interval_unit,billing_interval_count,effective_from) VALUES($1,$2,1,-1,'EUR','MONTH',1,$3)",
      [priceId, planRevisionId, at("2026-09-01T00:00:00.000Z")],
    );
    await rejects(
      "INSERT INTO price_revisions(price_id,plan_revision_id,revision,amount_minor,currency,billing_interval_unit,billing_interval_count,effective_from) VALUES($1,$2,2,9007199254740992,'EUR','MONTH',1,$3)",
      [priceId, planRevisionId, at("2026-09-01T00:00:00.000Z")],
    );
    await expect(base({ currency: "eur" })).rejects.toBeInstanceOf(Error);
    await expect(base({ currency: "EURO" })).rejects.toBeInstanceOf(Error);
    await expect(base({ billingIntervalCount: 0 })).rejects.toBeInstanceOf(
      Error,
    );
    await expect(base({ billingIntervalUnit: "WEEK" })).rejects.toBeInstanceOf(
      Error,
    );
    await expect(
      base({
        effectiveTo: at("2026-09-01T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(Error);
    await expect(
      createPriceRevision(priceId, planRevisionId, 3, { currency: "USD" }),
    ).resolves.toBeTypeOf("string");
  });

  it("keeps published price revision terms immutable", async () => {
    const planId = await createPlan();
    const planRevisionId = await createPlanRevision(planId);
    await q(
      "UPDATE plan_revisions SET state='PUBLISHED',published_at=now() WHERE id=$1",
      [planRevisionId],
    );
    const priceId = await createPrice(planId);
    const priceRevisionId = await createPriceRevision(
      priceId,
      planRevisionId,
      1,
      { state: "PUBLISHED", publishedAt: at("2026-09-05T00:00:00.000Z") },
    );
    await rejects("UPDATE price_revisions SET amount_minor=29000 WHERE id=$1", [
      priceRevisionId,
    ]);
    await rejects("DELETE FROM price_revisions WHERE id=$1", [priceRevisionId]);
  });

  it("selects a published price revision for new sales", async () => {
    const planId = await createPlan();
    const planRevisionId = await createPlanRevision(planId, 1, "PUBLISHED");
    const priceId = await createPrice(planId);
    const priceRevisionId = await createPriceRevision(
      priceId,
      planRevisionId,
      1,
      { state: "PUBLISHED", publishedAt: at("2026-09-05T00:00:00.000Z") },
    );
    await q(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,1,$2,$3,'Initial sale selection')",
      [priceId, priceRevisionId, at("2026-09-02T00:00:00.000Z")],
    );
  });

  it("rejects cross-price, draft, and out-of-window sale selections", async () => {
    const planId = await createPlan();
    const planRevisionId = await createPlanRevision(planId, 1, "PUBLISHED");
    const otherPlanId = await createPlan();
    const otherPlanRevisionId = await createPlanRevision(
      otherPlanId,
      1,
      "PUBLISHED",
    );
    const priceId = await createPrice(planId);
    const otherPriceId = await createPrice(otherPlanId);
    const draftRevisionId = await createPriceRevision(priceId, planRevisionId);
    const publishedRevisionId = await createPriceRevision(
      priceId,
      planRevisionId,
      2,
      {
        state: "PUBLISHED",
        publishedAt: at("2026-09-05T00:00:00.000Z"),
        effectiveTo: at("2026-10-01T00:00:00.000Z"),
      },
    );
    const otherPriceRevisionId = await createPriceRevision(
      otherPriceId,
      otherPlanRevisionId,
      1,
      { state: "PUBLISHED", publishedAt: at("2026-09-05T00:00:00.000Z") },
    );
    await rejects(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,1,$2,$3,'Cross price')",
      [priceId, otherPriceRevisionId, at("2026-09-02T00:00:00.000Z")],
    );
    await rejects(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,2,$2,$3,'Draft')",
      [priceId, draftRevisionId, at("2026-09-02T00:00:00.000Z")],
    );
    await rejects(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,3,$2,$3,'Outside')",
      [priceId, publishedRevisionId, at("2026-10-01T00:00:00.000Z")],
    );
  });

  it("supports explicit new-sale closure with NULL selection and preserves assignment history", async () => {
    const planId = await createPlan();
    const priceId = await createPrice(planId);
    await q(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,1,NULL,$2,'Close new sales')",
      [priceId, at("2026-09-02T00:00:00.000Z")],
    );
    await rejects(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,1,NULL,$2,'Duplicate')",
      [priceId, at("2026-09-03T00:00:00.000Z")],
    );
    await rejects(
      "UPDATE price_sale_assignments SET reason='Changed' WHERE price_id=$1 AND assignment_revision=1",
      [priceId],
    );
    await rejects(
      "DELETE FROM price_sale_assignments WHERE price_id=$1 AND assignment_revision=1",
      [priceId],
    );
  });

  it("accepts typed BOOLEAN and INTEGER account SET overrides", async () => {
    const accountId = await createAccount();
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability'),('device.max_active','INTEGER','LIMIT','Active device limit')",
    );
    await q(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,boolean_value,effective_from,reason) VALUES($1,'feature.analytics',1,'SET',true,$2,'Support grant')",
      [accountId, at("2026-09-05T00:00:00.000Z")],
    );
    await q(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,integer_value,effective_from,reason) VALUES($1,'device.max_active',1,'SET',3,$2,'Support limit')",
      [accountId, at("2026-09-05T00:00:00.000Z")],
    );
  });

  it("accepts CLEAR overrides and rejects type/value/window violations", async () => {
    const accountId = await createAccount();
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability')",
    );
    const from = at("2026-09-05T00:00:00.000Z");
    await q(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,effective_from,reason) VALUES($1,'feature.analytics',1,'CLEAR',$2,'Clear grant')",
      [accountId, from],
    );
    await rejects(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,integer_value,effective_from,reason) VALUES($1,'feature.analytics',2,'SET',1,$2,'Wrong type')",
      [accountId, from],
    );
    await rejects(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,boolean_value,effective_from,reason) VALUES($1,'feature.analytics',3,'CLEAR',true,$2,'Clear value')",
      [accountId, from],
    );
    await rejects(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,effective_from,expires_at,reason) VALUES($1,'feature.analytics',4,'CLEAR',$2,$2,'Bad window')",
      [accountId, from],
    );
  });

  it("enforces append-only account override revisions", async () => {
    const accountId = await createAccount();
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability')",
    );
    await q(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,boolean_value,effective_from,reason) VALUES($1,'feature.analytics',1,'SET',true,$2,'Grant')",
      [accountId, at("2026-09-05T00:00:00.000Z")],
    );
    await rejects(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,boolean_value,effective_from,reason) VALUES($1,'feature.analytics',1,'SET',false,$2,'Duplicate')",
      [accountId, at("2026-09-06T00:00:00.000Z")],
    );
    await rejects(
      "UPDATE account_entitlement_overrides SET reason='Changed' WHERE account_id=$1",
      [accountId],
    );
    await rejects(
      "DELETE FROM account_entitlement_overrides WHERE account_id=$1",
      [accountId],
    );
  });

  it("uses RESTRICT to preserve referenced commercial history", async () => {
    const accountId = await createAccount();
    const planId = await createPlan();
    const planRevisionId = await createPlanRevision(planId, 1, "PUBLISHED");
    await q(
      "INSERT INTO entitlement_definitions(entitlement_key,value_type,security_classification,description) VALUES('feature.analytics','BOOLEAN','CAPABILITY','Analytics capability')",
    );
    await q(
      "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,boolean_value,effective_from,reason) VALUES($1,'feature.analytics',1,'SET',true,$2,'Grant')",
      [accountId, at("2026-09-05T00:00:00.000Z")],
    );
    const priceId = await createPrice(planId);
    const priceRevisionId = await createPriceRevision(
      priceId,
      planRevisionId,
      1,
      { state: "PUBLISHED", publishedAt: at("2026-09-05T00:00:00.000Z") },
    );
    await q(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,1,$2,$3,'Select')",
      [priceId, priceRevisionId, at("2026-09-05T00:00:00.000Z")],
    );
    await rejects("DELETE FROM plans WHERE id=$1", [planId]);
    await rejects("DELETE FROM plan_revisions WHERE id=$1", [planRevisionId]);
    await rejects(
      "DELETE FROM entitlement_definitions WHERE entitlement_key='feature.analytics'",
    );
    await rejects("DELETE FROM prices WHERE id=$1", [priceId]);
    await rejects("DELETE FROM price_revisions WHERE id=$1", [priceRevisionId]);
  });
});
