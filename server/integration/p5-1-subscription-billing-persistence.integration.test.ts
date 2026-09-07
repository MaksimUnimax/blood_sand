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
const hash = (character = "a") => character.repeat(64);

async function rejects(text: string, values?: unknown[]) {
  await expect(q(text, values)).rejects.toBeInstanceOf(Error);
}

async function cleanP5Rows() {
  await q(
    "TRUNCATE checkout_intents,billing_events,subscription_transitions,payments,subscriptions,price_sale_assignments,account_entitlement_overrides,price_revisions,plan_entitlements,prices,plan_revisions,entitlement_definitions,plans",
  );
}

async function createAccount() {
  const id = randomUUID();
  await q("INSERT INTO accounts(id) VALUES($1)", [id]);
  return id;
}

async function createPlan(status = "ACTIVE") {
  const id = randomUUID();
  await q("INSERT INTO plans(id,code,status) VALUES($1,$2,$3)", [
    id,
    `p51-${randomUUID().replaceAll("-", "")}`,
    status,
  ]);
  return id;
}

async function createPlanRevision(
  planId: string,
  revision = 1,
  state: "DRAFT" | "PUBLISHED" = "PUBLISHED",
) {
  const id = randomUUID();
  await q(
    "INSERT INTO plan_revisions(id,plan_id,revision,state,display_name,description,published_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [
      id,
      planId,
      revision,
      state,
      `P5.1 Plan ${revision}`,
      "A bounded P5.1 test plan.",
      state === "PUBLISHED" ? at("2026-09-01T00:00:00.000Z") : null,
    ],
  );
  return id;
}

async function createPrice(planId: string) {
  const id = randomUUID();
  await q(
    "INSERT INTO prices(id,plan_id,code,market_key,channel_key,status) VALUES($1,$2,$3,'global','direct','ACTIVE')",
    [id, planId, `price-${randomUUID().replaceAll("-", "")}`],
  );
  return id;
}

async function createPriceRevision(
  priceId: string,
  planRevisionId: string,
  options: {
    revision?: number;
    state?: "DRAFT" | "PUBLISHED";
    amountMinor?: number;
    currency?: string;
  } = {},
) {
  const id = randomUUID();
  const state = options.state ?? "PUBLISHED";
  await q(
    "INSERT INTO price_revisions(id,price_id,plan_revision_id,revision,state,amount_minor,currency,billing_interval_unit,billing_interval_count,effective_from,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,'MONTH',1,$8,$9)",
    [
      id,
      priceId,
      planRevisionId,
      options.revision ?? 1,
      state,
      options.amountMinor ?? 19000,
      options.currency ?? "EUR",
      at("2026-09-01T00:00:00.000Z"),
      state === "PUBLISHED" ? at("2026-09-01T00:00:00.000Z") : null,
    ],
  );
  return id;
}

async function commercialFixture(
  options: {
    planStatus?: string;
    planRevisionState?: "DRAFT" | "PUBLISHED";
    priceRevisionState?: "DRAFT" | "PUBLISHED";
    amountMinor?: number;
    currency?: string;
  } = {},
) {
  const accountId = await createAccount();
  const planId = await createPlan(options.planStatus);
  const planRevisionId = await createPlanRevision(
    planId,
    1,
    options.planRevisionState,
  );
  const priceId = await createPrice(planId);
  const priceRevisionId = await createPriceRevision(priceId, planRevisionId, {
    state: options.priceRevisionState,
    amountMinor: options.amountMinor,
    currency: options.currency,
  });
  return { accountId, planId, planRevisionId, priceId, priceRevisionId };
}

async function createSubscription(
  fixture: Awaited<ReturnType<typeof commercialFixture>>,
  overrides: Record<string, unknown> = {},
) {
  const id = randomUUID();
  await q(
    "INSERT INTO subscriptions(id,account_id,state,state_revision,current_plan_revision_id,bound_price_revision_id,started_at,current_period_start,current_period_end,grace_until,cancel_at_period_end,canceled_at,suspended_at,state_reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
    [
      id,
      fixture.accountId,
      overrides.state ?? "ACTIVE",
      overrides.stateRevision ?? 1,
      overrides.currentPlanRevisionId ?? fixture.planRevisionId,
      overrides.boundPriceRevisionId === undefined
        ? null
        : overrides.boundPriceRevisionId,
      overrides.startedAt ?? at("2026-09-01T00:00:00.000Z"),
      overrides.currentPeriodStart ?? at("2026-09-01T00:00:00.000Z"),
      overrides.currentPeriodEnd ?? at("2026-10-01T00:00:00.000Z"),
      overrides.graceUntil ?? null,
      overrides.cancelAtPeriodEnd ?? false,
      overrides.canceledAt ?? null,
      overrides.suspendedAt ?? null,
      overrides.stateReason ?? "P5.1 test reason",
    ],
  );
  return id;
}

async function createPayment(
  fixture: Awaited<ReturnType<typeof commercialFixture>>,
  overrides: Record<string, unknown> = {},
) {
  const id = randomUUID();
  await q(
    "INSERT INTO payments(id,account_id,subscription_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256,created_at,updated_at,confirmed_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
    [
      id,
      overrides.accountId ?? fixture.accountId,
      overrides.subscriptionId ?? null,
      overrides.provider ?? "fake.billing",
      overrides.providerPaymentId ?? `payment-${randomUUID()}`,
      overrides.priceRevisionId ?? fixture.priceRevisionId,
      overrides.amountMinor ?? 19000,
      overrides.currency ?? "EUR",
      overrides.state ?? "PENDING",
      overrides.idempotencyKeyHash ?? hash("b"),
      overrides.requestFingerprintSha256 ?? hash("c"),
      overrides.createdAt ?? at("2026-09-01T00:00:00.000Z"),
      overrides.updatedAt ?? at("2026-09-01T00:00:00.000Z"),
      overrides.confirmedAt ?? null,
    ],
  );
  return id;
}

async function createEvent(overrides: Record<string, unknown> = {}) {
  const id = randomUUID();
  await q(
    "INSERT INTO billing_events(id,provider,source,event_identity,event_type,payload_sha256,processing_state,received_at,verified_at,processed_at,payment_id,subscription_id,subscription_transition_id,failure_code) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
    [
      id,
      overrides.provider ?? "fake.billing",
      overrides.source ?? "WEBHOOK",
      overrides.eventIdentity ?? `event-${randomUUID()}`,
      overrides.eventType ?? "payment.succeeded",
      overrides.payloadSha256 ?? hash("d"),
      overrides.processingState ?? "VERIFIED",
      overrides.receivedAt ?? at("2026-09-01T00:00:00.000Z"),
      overrides.verifiedAt ?? at("2026-09-01T00:01:00.000Z"),
      overrides.processedAt ?? null,
      overrides.paymentId ?? null,
      overrides.subscriptionId ?? null,
      overrides.subscriptionTransitionId ?? null,
      overrides.failureCode ?? null,
    ],
  );
  return id;
}

async function createTransition(subscriptionId: string, revision = 1) {
  const id = randomUUID();
  await q(
    "INSERT INTO subscription_transitions(id,subscription_id,transition_revision,from_state,to_state,source,reason,occurred_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
    [
      id,
      subscriptionId,
      revision,
      revision === 1 ? null : "TRIAL",
      "ACTIVE",
      "WEBHOOK",
      "P5.1 transition",
      at("2026-09-01T00:02:00.000Z"),
    ],
  );
  return id;
}

describe.sequential("P5.1 subscription/billing persistence", () => {
  beforeAll(async () => {
    db = createDatabaseRuntime(connectionString!);
    await db.ready();
    await runMigrations({ connectionString: connectionString! });
    await runMigrations({ connectionString: connectionString! });
  });

  beforeEach(cleanP5Rows);
  afterAll(() => db.close());

  it("01 accepts ACTIVE subscription with published plan and null price", async () => {
    const fixture = await commercialFixture();
    const id = await createSubscription(fixture);
    expect(
      (
        await q(
          "SELECT state,bound_price_revision_id FROM subscriptions WHERE id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({ state: "ACTIVE", bound_price_revision_id: null });
  });

  it("02 accepts subscription with published bound price", async () => {
    const fixture = await commercialFixture();
    const id = await createSubscription(fixture, {
      boundPriceRevisionId: fixture.priceRevisionId,
    });
    expect(
      (
        await q(
          "SELECT bound_price_revision_id FROM subscriptions WHERE id=$1",
          [id],
        )
      ).rows[0]?.bound_price_revision_id,
    ).toBe(fixture.priceRevisionId);
  });

  it("03 rejects a DRAFT plan revision", async () => {
    const fixture = await commercialFixture({
      planRevisionState: "DRAFT",
      priceRevisionState: "DRAFT",
    });
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',$2,$3,$3,$4,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("04 rejects a missing plan revision", async () => {
    const accountId = await createAccount();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',$2,$3,$3,$4,'reason')",
      [
        accountId,
        randomUUID(),
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("05 rejects a DRAFT bound price revision", async () => {
    const fixture = await commercialFixture({ priceRevisionState: "DRAFT" });
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,bound_price_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',$2,$3,$4,$4,$5,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        fixture.priceRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("06 rejects a cross-stable-plan bound price", async () => {
    const fixture = await commercialFixture();
    const other = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,bound_price_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',$2,$3,$4,$4,$5,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        other.priceRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("07 allows same stable plan with different exact revisions", async () => {
    const fixture = await commercialFixture();
    const planRevisionTwo = await createPlanRevision(fixture.planId, 2);
    const id = await createSubscription(fixture, {
      currentPlanRevisionId: planRevisionTwo,
      boundPriceRevisionId: fixture.priceRevisionId,
    });
    expect(
      (
        await q(
          "SELECT current_plan_revision_id FROM subscriptions WHERE id=$1",
          [id],
        )
      ).rows[0]?.current_plan_revision_id,
    ).toBe(planRevisionTwo);
  });

  it("08 keeps hidden stable-plan exact published binding valid", async () => {
    const fixture = await commercialFixture({ planStatus: "HIDDEN" });
    const id = await createSubscription(fixture, {
      boundPriceRevisionId: fixture.priceRevisionId,
    });
    expect(
      (await q("SELECT id FROM subscriptions WHERE id=$1", [id])).rows,
    ).toHaveLength(1);
  });

  it("09 keeps archived stable-plan exact published binding valid", async () => {
    const fixture = await commercialFixture({ planStatus: "ARCHIVED" });
    const id = await createSubscription(fixture, {
      boundPriceRevisionId: fixture.priceRevisionId,
    });
    expect(
      (await q("SELECT id FROM subscriptions WHERE id=$1", [id])).rows,
    ).toHaveLength(1);
  });

  it("10 allows an old unselected published price to remain bound", async () => {
    const fixture = await commercialFixture();
    const newer = await createPriceRevision(
      fixture.priceId,
      fixture.planRevisionId,
      { revision: 2, amountMinor: 29000 },
    );
    await q(
      "INSERT INTO price_sale_assignments(price_id,assignment_revision,selected_price_revision_id,effective_from,reason) VALUES($1,1,$2,$3,'select newer')",
      [fixture.priceId, newer, at("2026-09-01T00:00:00Z")],
    );
    const id = await createSubscription(fixture, {
      boundPriceRevisionId: fixture.priceRevisionId,
    });
    expect(
      (
        await q(
          "SELECT bound_price_revision_id FROM subscriptions WHERE id=$1",
          [id],
        )
      ).rows[0]?.bound_price_revision_id,
    ).toBe(fixture.priceRevisionId);
  });

  it("11 rejects period end at or before period start", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',$2,$3,$3,$3,'reason')",
      [fixture.accountId, fixture.planRevisionId, at("2026-09-01T00:00:00Z")],
    );
  });

  it("12 rejects started_at after period start", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',$2,$3,$4,$5,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-02T00:00:00Z"),
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("13 rejects grace_until at or before period end", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,grace_until,state_reason) VALUES($1,'ACTIVE',$2,$3,$3,$4,$4,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("14 rejects non-positive state_revision", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,state_revision,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',0,$2,$3,$3,$4,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("15 rejects an invalid subscription state", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,$2,$3,$4,$4,$5,'reason')",
      [
        fixture.accountId,
        "FREE",
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("16 rejects an empty state reason", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'ACTIVE',$2,$3,$3,$4,'   ')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("16a rejects canceled_at before started_at", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,canceled_at,state_reason) VALUES($1,'CANCELED',$2,$3,$3,$4,$5,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
        at("2026-08-31T00:00:00Z"),
      ],
    );
  });

  it("16b rejects suspended_at before started_at", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,suspended_at,state_reason) VALUES($1,'SUSPENDED',$2,$3,$3,$4,$5,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
        at("2026-08-31T00:00:00Z"),
      ],
    );
  });

  it("16c rejects updated_at before created_at", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,created_at,updated_at,state_reason) VALUES($1,'ACTIVE',$2,$3,$3,$4,$5,$6,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
        at("2026-09-02T00:00:00Z"),
        at("2026-09-01T00:00:00Z"),
      ],
    );
  });

  it("17 permits only one non-EXPIRED subscription per account", async () => {
    const fixture = await commercialFixture();
    await createSubscription(fixture);
    await rejects(
      "INSERT INTO subscriptions(account_id,state,current_plan_revision_id,started_at,current_period_start,current_period_end,state_reason) VALUES($1,'TRIAL',$2,$3,$3,$4,'reason')",
      [
        fixture.accountId,
        fixture.planRevisionId,
        at("2026-09-01T00:00:00Z"),
        at("2026-10-01T00:00:00Z"),
      ],
    );
  });

  it("18 permits multiple historical EXPIRED subscriptions", async () => {
    const fixture = await commercialFixture();
    await createSubscription(fixture, { state: "EXPIRED" });
    await createSubscription(fixture, { state: "EXPIRED" });
    expect(
      (
        await q(
          "SELECT count(*)::int AS count FROM subscriptions WHERE account_id=$1",
          [fixture.accountId],
        )
      ).rows[0]?.count,
    ).toBe(2);
  });

  it("19 protects subscription id", async () => {
    const fixture = await commercialFixture();
    const id = await createSubscription(fixture);
    await rejects("UPDATE subscriptions SET id=$2 WHERE id=$1", [
      id,
      randomUUID(),
    ]);
  });

  it("20 protects subscription account_id", async () => {
    const fixture = await commercialFixture();
    const id = await createSubscription(fixture);
    await rejects("UPDATE subscriptions SET account_id=$2 WHERE id=$1", [
      id,
      await createAccount(),
    ]);
  });

  it("21 protects subscription created_at", async () => {
    const fixture = await commercialFixture();
    const id = await createSubscription(fixture);
    await rejects(
      "UPDATE subscriptions SET created_at=created_at - interval '1 second' WHERE id=$1",
      [id],
    );
  });

  it("22 rejects subscription DELETE", async () => {
    const fixture = await commercialFixture();
    const id = await createSubscription(fixture);
    await rejects("DELETE FROM subscriptions WHERE id=$1", [id]);
  });

  it("23 blocks referenced plan revision deletion", async () => {
    const fixture = await commercialFixture();
    await createSubscription(fixture);
    await rejects("DELETE FROM plan_revisions WHERE id=$1", [
      fixture.planRevisionId,
    ]);
  });

  it("24 blocks referenced price revision deletion", async () => {
    const fixture = await commercialFixture();
    await createSubscription(fixture, {
      boundPriceRevisionId: fixture.priceRevisionId,
    });
    await rejects("DELETE FROM price_revisions WHERE id=$1", [
      fixture.priceRevisionId,
    ]);
  });

  it("25 accepts revision one with null from_state", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    const id = await createTransition(subscriptionId);
    expect(
      (
        await q(
          "SELECT transition_revision,from_state,to_state FROM subscription_transitions WHERE id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({ transition_revision: 1, from_state: null, to_state: "ACTIVE" });
  });

  it("26 rejects revision one with non-null from_state", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    await rejects(
      "INSERT INTO subscription_transitions(subscription_id,transition_revision,from_state,to_state,source,reason) VALUES($1,1,'TRIAL','ACTIVE','SYSTEM','reason')",
      [subscriptionId],
    );
  });

  it("27 rejects revision greater than one with null from_state", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    await rejects(
      "INSERT INTO subscription_transitions(subscription_id,transition_revision,to_state,source,reason) VALUES($1,2,'ACTIVE','SYSTEM','reason')",
      [subscriptionId],
    );
  });

  it("28 rejects duplicate transition revision", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    await createTransition(subscriptionId);
    await rejects(
      "INSERT INTO subscription_transitions(subscription_id,transition_revision,to_state,source,reason) VALUES($1,1,'ACTIVE','SYSTEM','reason')",
      [subscriptionId],
    );
  });

  it("29 rejects a transition with equal from and to states", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    await rejects(
      "INSERT INTO subscription_transitions(subscription_id,transition_revision,from_state,to_state,source,reason) VALUES($1,2,'ACTIVE','ACTIVE','SYSTEM','reason')",
      [subscriptionId],
    );
  });

  it("30 rejects an invalid transition source", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    await rejects(
      "INSERT INTO subscription_transitions(subscription_id,transition_revision,to_state,source,reason) VALUES($1,1,'ACTIVE','PROVIDER','reason')",
      [subscriptionId],
    );
  });

  it("31 rejects an empty transition reason", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    await rejects(
      "INSERT INTO subscription_transitions(subscription_id,transition_revision,to_state,source,reason) VALUES($1,1,'ACTIVE','SYSTEM','   ')",
      [subscriptionId],
    );
  });

  it("32 rejects transition UPDATE", async () => {
    const fixture = await commercialFixture();
    const id = await createTransition(await createSubscription(fixture));
    await rejects(
      "UPDATE subscription_transitions SET reason='changed' WHERE id=$1",
      [id],
    );
  });

  it("33 rejects transition DELETE", async () => {
    const fixture = await commercialFixture();
    const id = await createTransition(await createSubscription(fixture));
    await rejects("DELETE FROM subscription_transitions WHERE id=$1", [id]);
  });

  it("34 preserves transition source, state, reason, and time", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    const occurredAt = at("2026-09-03T12:34:56.000Z");
    const id = randomUUID();
    await q(
      "INSERT INTO subscription_transitions(id,subscription_id,transition_revision,from_state,to_state,source,source_event_id,actor_type,actor_id,reason,occurred_at) VALUES($1,$2,1,NULL,'ACTIVE','ADMIN','evt-1','operator',$3,'manual grant',$4)",
      [id, subscriptionId, randomUUID(), occurredAt],
    );
    const row = await q(
      "SELECT source,source_event_id,actor_type,reason,occurred_at FROM subscription_transitions WHERE id=$1",
      [id],
    );
    expect(row.rows[0]).toMatchObject({
      source: "ADMIN",
      source_event_id: "evt-1",
      actor_type: "operator",
      reason: "manual grant",
    });
    expect(new Date(String(row.rows[0]?.occurred_at)).toISOString()).toBe(
      occurredAt.toISOString(),
    );
  });

  it("35 accepts a PENDING payment with exact immutable price terms", async () => {
    const fixture = await commercialFixture();
    const id = await createPayment(fixture);
    expect(
      (
        await q(
          "SELECT state,amount_minor,currency FROM payments WHERE id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({ state: "PENDING", amount_minor: "19000", currency: "EUR" });
  });

  it("36 allows zero amount", async () => {
    const fixture = await commercialFixture({ amountMinor: 0 });
    const id = await createPayment(fixture, { amountMinor: 0 });
    expect(
      (await q("SELECT amount_minor FROM payments WHERE id=$1", [id])).rows[0]
        ?.amount_minor,
    ).toBe("0");
  });

  it("37 rejects negative amount", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','payment-negative',$2,-1,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("38 rejects amount above MAX_SAFE_INTEGER", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','payment-too-large',$2,9007199254740992,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("39 rejects lowercase currency", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','payment-lower',$2,19000,'eur','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("40 rejects malformed currency", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','payment-currency',$2,19000,'EU1','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("41 rejects a DRAFT price revision", async () => {
    const fixture = await commercialFixture({ priceRevisionState: "DRAFT" });
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','payment-draft',$2,19000,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("42 rejects amount mismatch with price revision", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','payment-amount',$2,19001,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("43 rejects currency mismatch with price revision", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','payment-currency-mismatch',$2,19000,'USD','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("44 rejects duplicate provider payment identity", async () => {
    const fixture = await commercialFixture();
    await createPayment(fixture, { providerPaymentId: "same-payment" });
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','same-payment',$2,19000,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("d"), hash("e")],
    );
  });

  it("45 rejects duplicate account idempotency across providers", async () => {
    const fixture = await commercialFixture();
    await createPayment(fixture, { idempotencyKeyHash: hash("b") });
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'other.billing','other-payment',$2,19000,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("e")],
    );
  });

  it("46 allows the same idempotency hash for different accounts", async () => {
    const fixture = await commercialFixture();
    const other = await commercialFixture();
    await createPayment(fixture, { idempotencyKeyHash: hash("b") });
    const id = await createPayment(other, { idempotencyKeyHash: hash("b") });
    expect(
      (await q("SELECT account_id FROM payments WHERE id=$1", [id])).rows[0]
        ?.account_id,
    ).toBe(other.accountId);
  });

  it("47 rejects invalid idempotency hash", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','bad-idem',$2,19000,'EUR','PENDING','ABC',$3)",
      [fixture.accountId, fixture.priceRevisionId, hash("c")],
    );
  });

  it("48 rejects invalid request fingerprint hash", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','bad-fingerprint',$2,19000,'EUR','PENDING',$3,'ABC')",
      [fixture.accountId, fixture.priceRevisionId, hash("b")],
    );
  });

  it("49 rejects invalid provider machine key", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'Fake Provider','bad-provider',$2,19000,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("50 rejects blank provider payment id", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,'fake.billing','   ',$2,19000,'EUR','PENDING',$3,$4)",
      [fixture.accountId, fixture.priceRevisionId, hash("b"), hash("c")],
    );
  });

  it("51 rejects provider payment id update", async () => {
    const fixture = await commercialFixture();
    const id = await createPayment(fixture);
    await rejects(
      "UPDATE payments SET provider_payment_id='changed' WHERE id=$1",
      [id],
    );
  });

  it("52 rejects price revision id update", async () => {
    const fixture = await commercialFixture();
    const second = await createPriceRevision(
      fixture.priceId,
      fixture.planRevisionId,
      { revision: 2, amountMinor: 29000 },
    );
    const id = await createPayment(fixture);
    await rejects(
      "UPDATE payments SET price_revision_id=$2,amount_minor=29000 WHERE id=$1",
      [id, second],
    );
  });

  it("53 rejects amount and currency updates", async () => {
    const fixture = await commercialFixture();
    const id = await createPayment(fixture);
    await rejects("UPDATE payments SET amount_minor=19001 WHERE id=$1", [id]);
    await rejects("UPDATE payments SET currency='USD' WHERE id=$1", [id]);
  });

  it("54 rejects account and provider updates", async () => {
    const fixture = await commercialFixture();
    const id = await createPayment(fixture);
    await rejects("UPDATE payments SET account_id=$2 WHERE id=$1", [
      id,
      await createAccount(),
    ]);
    await rejects("UPDATE payments SET provider='other.billing' WHERE id=$1", [
      id,
    ]);
  });

  it("55 rejects payment DELETE", async () => {
    const fixture = await commercialFixture();
    const id = await createPayment(fixture);
    await rejects("DELETE FROM payments WHERE id=$1", [id]);
  });

  it("56 allows a same-account null to subscription link", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    const id = await createPayment(fixture);
    await q("UPDATE payments SET subscription_id=$2 WHERE id=$1", [
      id,
      subscriptionId,
    ]);
    expect(
      (await q("SELECT subscription_id FROM payments WHERE id=$1", [id]))
        .rows[0]?.subscription_id,
    ).toBe(subscriptionId);
  });

  it("57 rejects a cross-account subscription link", async () => {
    const fixture = await commercialFixture();
    const other = await commercialFixture();
    const subscriptionId = await createSubscription(other);
    await rejects(
      "INSERT INTO payments(account_id,subscription_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256) VALUES($1,$2,'fake.billing','cross-account',$3,19000,'EUR','PENDING',$4,$5)",
      [
        fixture.accountId,
        subscriptionId,
        fixture.priceRevisionId,
        hash("b"),
        hash("c"),
      ],
    );
  });

  it("58 rejects changing a linked subscription A to B", async () => {
    const fixture = await commercialFixture();
    const other = await commercialFixture();
    const first = await createSubscription(fixture);
    const second = await createSubscription(other);
    const id = await createPayment(fixture, { subscriptionId: first });
    await rejects("UPDATE payments SET subscription_id=$2 WHERE id=$1", [
      id,
      second,
    ]);
  });

  it("59 rejects clearing a linked subscription", async () => {
    const fixture = await commercialFixture();
    const subscriptionId = await createSubscription(fixture);
    const id = await createPayment(fixture, { subscriptionId });
    await rejects("UPDATE payments SET subscription_id=NULL WHERE id=$1", [id]);
  });

  it("60 keeps historical payment valid after subscription plan change", async () => {
    const fixture = await commercialFixture();
    const secondPlanRevision = await createPlanRevision(fixture.planId, 2);
    const subscriptionId = await createSubscription(fixture, {
      boundPriceRevisionId: fixture.priceRevisionId,
    });
    const paymentId = await createPayment(fixture, { subscriptionId });
    await q(
      "UPDATE subscriptions SET current_plan_revision_id=$2,updated_at=now() WHERE id=$1",
      [subscriptionId, secondPlanRevision],
    );
    expect(
      (
        await q("SELECT price_revision_id FROM payments WHERE id=$1", [
          paymentId,
        ])
      ).rows[0]?.price_revision_id,
    ).toBe(fixture.priceRevisionId);
  });

  it("61 rejects confirmed_at before created_at", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256,created_at,updated_at,confirmed_at) VALUES($1,'fake.billing','confirmed-too-early',$2,19000,'EUR','SUCCEEDED',$3,$4,$5,$5,$6)",
      [
        fixture.accountId,
        fixture.priceRevisionId,
        hash("b"),
        hash("c"),
        at("2026-09-02T00:00:00Z"),
        at("2026-09-01T00:00:00Z"),
      ],
    );
  });

  it("61a rejects payment updated_at before created_at", async () => {
    const fixture = await commercialFixture();
    await rejects(
      "INSERT INTO payments(account_id,provider,provider_payment_id,price_revision_id,amount_minor,currency,state,idempotency_key_hash,request_fingerprint_sha256,created_at,updated_at) VALUES($1,'fake.billing','updated-too-early',$2,19000,'EUR','PENDING',$3,$4,$5,$6)",
      [
        fixture.accountId,
        fixture.priceRevisionId,
        hash("b"),
        hash("c"),
        at("2026-09-02T00:00:00Z"),
        at("2026-09-01T00:00:00Z"),
      ],
    );
  });

  it("62 accepts a VERIFIED WEBHOOK event", async () => {
    const id = await createEvent();
    expect(
      (
        await q(
          "SELECT source,processing_state FROM billing_events WHERE id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({ source: "WEBHOOK", processing_state: "VERIFIED" });
  });

  it("63 accepts a VERIFIED RECONCILIATION event", async () => {
    const id = await createEvent({ source: "RECONCILIATION" });
    expect(
      (await q("SELECT source FROM billing_events WHERE id=$1", [id])).rows[0]
        ?.source,
    ).toBe("RECONCILIATION");
  });

  it("64 rejects duplicate event identity within one source", async () => {
    await createEvent({ eventIdentity: "same-event" });
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at) VALUES('fake.billing','WEBHOOK','same-event','payment.succeeded',$1,$2,$3)",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("65 rejects duplicate event identity across sources", async () => {
    await createEvent({ eventIdentity: "cross-source" });
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at) VALUES('fake.billing','RECONCILIATION','cross-source','payment.succeeded',$1,$2,$3)",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("66 allows the same event identity for different providers", async () => {
    await createEvent({
      eventIdentity: "provider-scoped",
      provider: "fake.billing",
    });
    const id = await createEvent({
      eventIdentity: "provider-scoped",
      provider: "other.billing",
    });
    expect(
      (await q("SELECT provider FROM billing_events WHERE id=$1", [id])).rows[0]
        ?.provider,
    ).toBe("other.billing");
  });

  it("67 rejects an invalid event provider key", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at) VALUES('Fake Provider','WEBHOOK','event','type',$1,$2,$3)",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("68 rejects empty event identity", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at) VALUES('fake.billing','WEBHOOK','   ','type',$1,$2,$3)",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("69 rejects empty event type", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at) VALUES('fake.billing','WEBHOOK','event','   ',$1,$2,$3)",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("70 rejects invalid payload SHA", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at) VALUES('fake.billing','WEBHOOK','event','type','ABC',$1,$2)",
      [at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("71 rejects verified_at before received_at", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at) VALUES('fake.billing','WEBHOOK','event','type',$1,$2,$3)",
      [hash("e"), at("2026-09-02T00:00:00Z"), at("2026-09-01T00:00:00Z")],
    );
  });

  it("72 rejects direct APPLIED insert", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,processing_state,received_at,verified_at) VALUES('fake.billing','WEBHOOK','applied','type',$1,'APPLIED',$2,$3)",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("73 rejects direct IGNORED insert", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,processing_state,received_at,verified_at) VALUES('fake.billing','WEBHOOK','ignored','type',$1,'IGNORED',$2,$3)",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("74 rejects direct FAILED insert", async () => {
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,processing_state,received_at,verified_at,failure_code) VALUES('fake.billing','WEBHOOK','failed','type',$1,'FAILED',$2,$3,'failure')",
      [hash("e"), at("2026-09-01T00:00:00Z"), at("2026-09-01T00:01:00Z")],
    );
  });

  it("75 rejects billing event insert with payment reference", async () => {
    const fixture = await commercialFixture();
    const paymentId = await createPayment(fixture);
    await rejects(
      "INSERT INTO billing_events(provider,source,event_identity,event_type,payload_sha256,received_at,verified_at,payment_id) VALUES('fake.billing','WEBHOOK','with-payment','type',$1,$2,$3,$4)",
      [
        hash("e"),
        at("2026-09-01T00:00:00Z"),
        at("2026-09-01T00:01:00Z"),
        paymentId,
      ],
    );
  });

  it("76 allows VERIFIED to APPLIED with processed_at", async () => {
    const id = await createEvent();
    await q(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
    expect(
      (
        await q(
          "SELECT processing_state,processed_at FROM billing_events WHERE id=$1",
          [id],
        )
      ).rows[0]?.processing_state,
    ).toBe("APPLIED");
  });

  it("77 allows VERIFIED to IGNORED", async () => {
    const id = await createEvent();
    await q(
      "UPDATE billing_events SET processing_state='IGNORED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
    expect(
      (await q("SELECT processing_state FROM billing_events WHERE id=$1", [id]))
        .rows[0]?.processing_state,
    ).toBe("IGNORED");
  });

  it("78 allows VERIFIED to FAILED with failure_code", async () => {
    const id = await createEvent();
    await q(
      "UPDATE billing_events SET processing_state='FAILED',processed_at=$2,failure_code='INVALID_STATE' WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
    expect(
      (
        await q(
          "SELECT processing_state,failure_code FROM billing_events WHERE id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({ processing_state: "FAILED", failure_code: "INVALID_STATE" });
  });

  it("79 rejects FAILED without failure_code", async () => {
    const id = await createEvent();
    await rejects(
      "UPDATE billing_events SET processing_state='FAILED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
  });

  it("80 rejects APPLIED with failure_code", async () => {
    const id = await createEvent();
    await rejects(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2,failure_code='NOT_ALLOWED' WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
  });

  it("81 rejects terminal processed_at before verified_at", async () => {
    const id = await createEvent();
    await rejects(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:00:30Z")],
    );
  });

  it("82 rejects a second transition out of APPLIED", async () => {
    const id = await createEvent();
    await q(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
    await rejects(
      "UPDATE billing_events SET processing_state='IGNORED' WHERE id=$1",
      [id],
    );
  });

  it("83 rejects a second transition out of IGNORED", async () => {
    const id = await createEvent();
    await q(
      "UPDATE billing_events SET processing_state='IGNORED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
    await rejects(
      "UPDATE billing_events SET processing_state='FAILED',processed_at=$2,failure_code='late' WHERE id=$1",
      [id, at("2026-09-01T00:03:00Z")],
    );
  });

  it("84 rejects a second transition out of FAILED", async () => {
    const id = await createEvent();
    await q(
      "UPDATE billing_events SET processing_state='FAILED',processed_at=$2,failure_code='failed' WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
    await rejects(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:03:00Z")],
    );
  });

  it("85 rejects immutable event content update after terminalization", async () => {
    const id = await createEvent();
    await q(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2 WHERE id=$1",
      [id, at("2026-09-01T00:02:00Z")],
    );
    await rejects(
      "UPDATE billing_events SET event_type='changed' WHERE id=$1",
      [id],
    );
  });

  it("86 rejects billing event DELETE", async () => {
    const id = await createEvent();
    await rejects("DELETE FROM billing_events WHERE id=$1", [id]);
  });

  it("87 requires a transition reference to match the event subscription", async () => {
    const fixture = await commercialFixture();
    const other = await commercialFixture();
    const firstSubscription = await createSubscription(fixture);
    const otherSubscription = await createSubscription(other);
    const transitionId = await createTransition(firstSubscription);
    const eventId = await createEvent();
    await rejects(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2,subscription_id=$3,subscription_transition_id=$4 WHERE id=$1",
      [eventId, at("2026-09-01T00:02:00Z"), otherSubscription, transitionId],
    );
  });

  it("88 rejects payment and subscription references from different accounts", async () => {
    const fixture = await commercialFixture();
    const other = await commercialFixture();
    const paymentId = await createPayment(fixture);
    const subscriptionId = await createSubscription(other);
    const eventId = await createEvent();
    await rejects(
      "UPDATE billing_events SET processing_state='APPLIED',processed_at=$2,payment_id=$3,subscription_id=$4 WHERE id=$1",
      [eventId, at("2026-09-01T00:02:00Z"), paymentId, subscriptionId],
    );
  });

  it("89 stores no raw or general provider payload column", async () => {
    const columns = await q<{ column_name: string; data_type: string }>(
      "SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='billing_events' ORDER BY ordinal_position",
    );
    expect(columns.rows.map((row) => row.column_name)).not.toEqual(
      expect.arrayContaining([
        "raw_payload",
        "payload_json",
        "request_body",
        "response_body",
        "headers",
        "raw_event",
        "provider_payload",
        "provider_metadata",
      ]),
    );
    expect(
      columns.rows.find((row) => row.column_name === "payload_sha256")
        ?.data_type,
    ).toBe("character varying");
  });

  it("90 exposes exactly four P5 tables and required physical protections", async () => {
    const tables = await q<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('subscriptions','subscription_transitions','payments','billing_events','billing_customers','reconciliation_jobs') ORDER BY table_name",
    );
    expect(tables.rows.map((row) => row.table_name)).toEqual([
      "billing_events",
      "payments",
      "subscription_transitions",
      "subscriptions",
    ]);
    const checks = await q<{ conname: string }>(
      "SELECT conname FROM pg_constraint WHERE conrelid IN ('subscriptions'::regclass,'subscription_transitions'::regclass,'payments'::regclass,'billing_events'::regclass) AND contype='c' ORDER BY conname",
    );
    expect(checks.rows.length).toBeGreaterThan(20);
    const triggers = await q<{ tgname: string }>(
      "SELECT tgname FROM pg_trigger WHERE tgrelid IN ('subscriptions'::regclass,'subscription_transitions'::regclass,'payments'::regclass,'billing_events'::regclass) AND NOT tgisinternal ORDER BY tgname",
    );
    expect(triggers.rows.map((row) => row.tgname)).toEqual([
      "p5_1_billing_event_guard",
      "p5_1_payment_guard",
      "p5_1_subscription_guard",
      "p5_1_subscription_transition_append_only",
    ]);
  });
});
