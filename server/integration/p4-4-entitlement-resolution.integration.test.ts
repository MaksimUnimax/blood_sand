import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabaseRuntime,
  createP4EntitlementRepository,
  createP4PlanCommandRepository,
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
import type { DeviceLimitResolver } from "../packages/device-management/src/index.js";
import type {
  CommandResult,
  PlanEntitlementCommandRepository,
  PlanMutationContext,
  PlanRevisionDraft,
  TypedEntitlementValue,
} from "../packages/plans/src/index.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");

let db: DatabaseRuntime;
let plans: PlanEntitlementCommandRepository;
let entitlements: AccountEntitlementOverrideMutationPort &
  CommercialEntitlementResolver;
const at = (value: string) => new Date(value);
const now = at("2026-09-06T12:00:00.000Z");
const later = at("2026-09-07T12:00:00.000Z");
const code = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll("-", "")}`;
const q = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values?: unknown[],
) => db.query<T>(text, values);
const system = (reason = "P4.4 integration test"): PlanMutationContext => ({
  actorType: "SYSTEM",
  correlationId: randomUUID(),
  reason,
});

function ok<T>(result: CommandResult<T>) {
  if (result.kind !== "OK") throw new Error(`expected OK, got ${result.code}`);
  return result.value;
}

async function auditCount(action?: string) {
  const result = await q<{ count: string }>(
    action
      ? "SELECT count(*)::text AS count FROM audit_events WHERE action=$1"
      : "SELECT count(*)::text AS count FROM audit_events",
    action ? [action] : undefined,
  );
  return Number(result.rows[0]!.count);
}

async function resetCommercial() {
  await q(
    "TRUNCATE checkout_intents,billing_events,subscription_transitions,payments,subscriptions,price_sale_assignments,account_entitlement_overrides,price_revisions,plan_entitlements,prices,plan_revisions,entitlement_definitions,plans,audit_events",
  );
}

async function account() {
  const id = randomUUID();
  await q("INSERT INTO accounts(id) VALUES($1)", [id]);
  return id;
}

async function definition(
  key: string,
  valueType: "BOOLEAN" | "INTEGER" = "BOOLEAN",
) {
  return ok(
    await plans.createEntitlementDefinition(
      {
        entitlementKey: key,
        valueType,
        securityClassification:
          valueType === "BOOLEAN" ? "CAPABILITY" : "LIMIT",
        description: "P4.4 test definition",
      },
      system(),
    ),
  );
}

async function publishedPlan(
  values: Array<{ key: string; value: TypedEntitlementValue }> = [],
) {
  const plan = ok(await plans.createPlan({ code: code("p44-plan") }, system()));
  let draft = ok(
    await plans.createDraftPlanRevision(
      { planId: plan.id, displayName: "P4.4", description: "Resolution test" },
      system(),
    ),
  );
  for (const item of values) {
    draft = ok(
      await plans.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          entitlementKey: item.key,
          value: item.value,
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
  return {
    plan,
    draft: { ...draft, ...published } as unknown as PlanRevisionDraft,
    published,
  };
}

async function makeBooleanPlan(
  value: boolean | null = true,
  key = code("flag"),
) {
  await definition(key, "BOOLEAN");
  return publishedPlan(
    value === null ? [] : [{ key, value: { kind: "BOOLEAN", value } }],
  );
}

async function set(
  accountId: string,
  key: string,
  expectedLatestRevision: number | null,
  value: TypedEntitlementValue,
  effectiveFrom = at("2026-09-05T00:00:00.000Z"),
  expiresAt: Date | null = null,
  reason = "set reason",
) {
  return entitlements.setAccountEntitlementOverride(
    {
      accountId,
      entitlementKey: key,
      expectedLatestRevision,
      value,
      effectiveFrom,
      expiresAt,
    },
    { ...system(reason) },
  );
}

async function clear(
  accountId: string,
  key: string,
  expectedLatestRevision: number | null,
  effectiveFrom = at("2026-09-05T00:00:00.000Z"),
  expiresAt: Date | null = null,
) {
  return entitlements.clearAccountEntitlementOverride(
    {
      accountId,
      entitlementKey: key,
      expectedLatestRevision,
      effectiveFrom,
      expiresAt,
    },
    system("clear reason"),
  );
}

async function resolve(
  accountId: string,
  planRevisionId: string,
  key: string,
  evaluationTime = now,
) {
  const result = await entitlements.resolveCommercialEntitlement({
    accountId,
    planRevisionId,
    entitlementKey: key,
    at: evaluationTime,
  });
  if (result.kind !== "OK") throw new Error(`resolve rejected: ${result.code}`);
  return result.value;
}

function failingAuditRuntime(): DatabaseRuntime {
  return {
    ...db,
    transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
      db.transaction((q0) =>
        operation({
          query: async <
            R extends Record<string, unknown> = Record<string, unknown>,
          >(
            text: string,
            values?: unknown[],
          ) => {
            if (text.startsWith("INSERT INTO audit_events"))
              throw new Error("injected audit failure");
            return q0.query<R>(text, values);
          },
        }),
      ),
  };
}

describe.sequential(
  "P4.4 commercial entitlement resolution on PostgreSQL",
  () => {
    beforeAll(async () => {
      db = createDatabaseRuntime(connectionString!);
      await db.ready();
      await runMigrations({ connectionString: connectionString! });
      plans = createP4PlanCommandRepository(db);
      entitlements = createP4EntitlementRepository(db);
    });
    beforeEach(resetCommercial);
    afterAll(() => db.close());

    it("BOOLEAN SET creates revision 1 and one SET audit", async () => {
      const key = code("flag");
      await definition(key);
      const accountId = await account();
      const result = await set(accountId, key, null, {
        kind: "BOOLEAN",
        value: true,
      });
      expect(result).toMatchObject({
        kind: "OK",
        changed: true,
        value: { revision: 1, operation: "SET" },
      });
      expect(await auditCount("ACCOUNT_ENTITLEMENT_OVERRIDE_SET")).toBe(1);
    });

    it("INTEGER SET preserves the exact safe integer", async () => {
      const key = code("limit");
      await definition(key, "INTEGER");
      const accountId = await account();
      const result = await set(accountId, key, null, {
        kind: "INTEGER",
        value: 9007199254740991,
      });
      expect(result).toMatchObject({
        kind: "OK",
        value: { value: { kind: "INTEGER", value: 9007199254740991 } },
      });
    });

    it("persists context reason on the override row", async () => {
      const key = code("reason");
      await definition(key);
      const accountId = await account();
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        now,
        null,
        "bounded reason",
      );
      expect(
        (
          await q<{ reason: string }>(
            "SELECT reason FROM account_entitlement_overrides WHERE account_id=$1",
            [accountId],
          )
        ).rows[0]!.reason,
      ).toBe("bounded reason");
    });

    it("exact duplicate SET is a no-op without row or audit", async () => {
      const key = code("duplicate");
      await definition(key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: true });
      const audits = await auditCount();
      const result = await set(
        accountId,
        key,
        1,
        { kind: "BOOLEAN", value: true },
        at("2026-09-05T00:00:00.000Z"),
      );
      expect(result).toMatchObject({ kind: "OK", changed: false });
      expect(
        (
          await q<{ count: string }>(
            "SELECT count(*)::text AS count FROM account_entitlement_overrides WHERE account_id=$1",
            [accountId],
          )
        ).rows[0]!.count,
      ).toBe("1");
      expect(await auditCount()).toBe(audits);
    });

    it("rejects a stale expected revision before semantic duplicate handling", async () => {
      const key = code("stale");
      await definition(key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: true });
      expect(
        await set(accountId, key, null, { kind: "BOOLEAN", value: true }),
      ).toEqual({
        kind: "REJECTED",
        code: "ACCOUNT_ENTITLEMENT_OVERRIDE_STALE",
      });
    });

    it("concurrent same-expectation SET has one winner and one stale result", async () => {
      const key = code("concurrent");
      await definition(key);
      const accountId = await account();
      const results = await Promise.all([
        set(accountId, key, null, { kind: "BOOLEAN", value: true }),
        set(accountId, key, null, { kind: "BOOLEAN", value: false }),
      ]);
      expect(results.filter((result) => result.kind === "OK")).toHaveLength(1);
      expect(
        results.filter(
          (result) =>
            result.kind === "REJECTED" &&
            result.code === "ACCOUNT_ENTITLEMENT_OVERRIDE_STALE",
        ),
      ).toHaveLength(1);
      expect(
        (
          await q<{ count: string }>(
            "SELECT count(*)::text AS count FROM account_entitlement_overrides WHERE account_id=$1",
            [accountId],
          )
        ).rows[0]!.count,
      ).toBe("1");
    });

    it("CLEAR appends revision 2 and one CLEAR audit", async () => {
      const key = code("clear");
      await definition(key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: true });
      const result = await clear(accountId, key, 1);
      expect(result).toMatchObject({
        kind: "OK",
        changed: true,
        value: { revision: 2, operation: "CLEAR", value: null },
      });
      expect(await auditCount("ACCOUNT_ENTITLEMENT_OVERRIDE_CLEARED")).toBe(1);
    });

    it("exact duplicate CLEAR is a no-op", async () => {
      const key = code("cleardup");
      await definition(key);
      const accountId = await account();
      await clear(accountId, key, null);
      const audits = await auditCount();
      expect(await clear(accountId, key, 1)).toMatchObject({
        kind: "OK",
        changed: false,
      });
      expect(await auditCount()).toBe(audits);
    });

    it("rejects SET with the wrong definition type", async () => {
      const key = code("wrongtype");
      await definition(key, "INTEGER");
      const accountId = await account();
      expect(
        await set(accountId, key, null, { kind: "BOOLEAN", value: true }),
      ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_TYPE_MISMATCH" });
    });

    it("rejects SET for a deprecated definition", async () => {
      const key = code("deprecatedset");
      await definition(key);
      const accountId = await account();
      ok(
        await plans.deprecateEntitlementDefinition(
          { entitlementKey: key },
          system(),
        ),
      );
      expect(
        await set(accountId, key, null, { kind: "BOOLEAN", value: true }),
      ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_DEPRECATED" });
    });

    it("allows CLEAR for a deprecated definition", async () => {
      const key = code("deprecatedclear");
      await definition(key);
      const accountId = await account();
      ok(
        await plans.deprecateEntitlementDefinition(
          { entitlementKey: key },
          system(),
        ),
      );
      expect(await clear(accountId, key, null)).toMatchObject({
        kind: "OK",
        changed: true,
      });
    });

    it("serializes SET and definition deprecation without a deprecated SET commit", async () => {
      const key = code("serialize");
      await definition(key);
      const accountId = await account();
      const results = await Promise.all([
        set(accountId, key, null, { kind: "BOOLEAN", value: true }),
        plans.deprecateEntitlementDefinition({ entitlementKey: key }, system()),
      ]);
      const setResult = results[0]!;
      const deprecateResult = results[1]!;
      expect(
        setResult.kind === "OK" || setResult.code === "ENTITLEMENT_DEPRECATED",
      ).toBe(true);
      expect(deprecateResult.kind).toBe("OK");
      if (setResult.kind === "OK") expect(setResult.value.revision).toBe(1);
    });

    it("rolls back SET when audit insertion fails", async () => {
      const key = code("setrollback");
      await definition(key);
      const accountId = await account();
      const failing = createP4EntitlementRepository(failingAuditRuntime());
      await expect(
        failing.setAccountEntitlementOverride(
          {
            accountId,
            entitlementKey: key,
            expectedLatestRevision: null,
            value: { kind: "BOOLEAN", value: true },
            effectiveFrom: now,
            expiresAt: null,
          },
          system(),
        ),
      ).rejects.toThrow("injected audit failure");
      expect(
        (
          await q<{ count: string }>(
            "SELECT count(*)::text AS count FROM account_entitlement_overrides WHERE account_id=$1",
            [accountId],
          )
        ).rows[0]!.count,
      ).toBe("0");
    });

    it("rolls back CLEAR when audit insertion fails", async () => {
      const key = code("clearrollback");
      await definition(key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: true });
      const failing = createP4EntitlementRepository(failingAuditRuntime());
      await expect(
        failing.clearAccountEntitlementOverride(
          {
            accountId,
            entitlementKey: key,
            expectedLatestRevision: 1,
            effectiveFrom: now,
            expiresAt: null,
          },
          system(),
        ),
      ).rejects.toThrow("injected audit failure");
      expect(
        (
          await q<{ revision: number }>(
            "SELECT revision FROM account_entitlement_overrides WHERE account_id=$1 ORDER BY revision",
            [accountId],
          )
        ).rows.map((row) => row.revision),
      ).toEqual([1]);
    });

    it("rejects a missing account without audit", async () => {
      const key = code("missingaccount");
      await definition(key);
      const before = await auditCount();
      expect(
        await set(randomUUID(), key, null, { kind: "BOOLEAN", value: true }),
      ).toEqual({ kind: "REJECTED", code: "ACCOUNT_NOT_FOUND" });
      expect(await auditCount()).toBe(before);
    });

    it("rejects a missing definition without audit", async () => {
      const accountId = await account();
      const before = await auditCount();
      expect(
        await set(accountId, "missing.definition", null, {
          kind: "BOOLEAN",
          value: true,
        }),
      ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_DEFINITION_NOT_FOUND" });
      expect(await auditCount()).toBe(before);
    });

    it("resolves a plan BOOLEAN true as PLAN_VALUE", async () => {
      const key = code("plantrue");
      const { published } = await makeBooleanPlan(true, key);
      const value = await resolve(await account(), published.id, key);
      expect(value).toMatchObject({
        effectiveValue: { kind: "BOOLEAN", value: true },
        source: "PLAN_REVISION",
        reason: "PLAN_VALUE",
      });
    });

    it("resolves a plan BOOLEAN false exactly", async () => {
      const key = code("planfalse");
      const { published } = await makeBooleanPlan(false, key);
      const value = await resolve(await account(), published.id, key);
      expect(value.effectiveValue).toEqual({ kind: "BOOLEAN", value: false });
    });

    it("resolves a plan INTEGER exactly", async () => {
      const key = code("planinteger");
      await definition(key, "INTEGER");
      const { published } = await publishedPlan([
        { key, value: { kind: "INTEGER", value: 7 } },
      ]);
      expect(
        (await resolve(await account(), published.id, key)).effectiveValue,
      ).toEqual({ kind: "INTEGER", value: 7 });
    });

    it("active SET overrides the plan", async () => {
      const key = code("override");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: true });
      expect((await resolve(accountId, published.id, key)).reason).toBe(
        "ACCOUNT_OVERRIDE_SET",
      );
      expect((await resolve(accountId, published.id, key)).source).toBe(
        "ACCOUNT_OVERRIDE",
      );
    });

    it("SET can introduce a value absent from the plan", async () => {
      const key = code("introduced");
      const { published } = await makeBooleanPlan(null, key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: true });
      expect(
        (await resolve(accountId, published.id, key)).effectiveValue,
      ).toEqual({ kind: "BOOLEAN", value: true });
    });

    it("CLEAR falls back to the plan", async () => {
      const key = code("clearplan");
      const { published } = await makeBooleanPlan(true, key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: false });
      await clear(accountId, key, 1);
      expect((await resolve(accountId, published.id, key)).reason).toBe(
        "ACCOUNT_OVERRIDE_CLEAR_TO_PLAN",
      );
      expect(
        (await resolve(accountId, published.id, key)).effectiveValue,
      ).toEqual({ kind: "BOOLEAN", value: true });
    });

    it("CLEAR with no plan value resolves null with NONE source", async () => {
      const key = code("clearunset");
      const { published } = await makeBooleanPlan(null, key);
      const accountId = await account();
      await clear(accountId, key, null);
      expect(await resolve(accountId, published.id, key)).toMatchObject({
        effectiveValue: null,
        source: "NONE",
        reason: "ACCOUNT_OVERRIDE_CLEAR_TO_PLAN",
      });
    });

    it("SET is active exactly at effectiveFrom", async () => {
      const key = code("frominclusive");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      const effectiveFrom = at("2026-09-06T00:00:00.000Z");
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        effectiveFrom,
      );
      expect(
        (await resolve(accountId, published.id, key, effectiveFrom)).source,
      ).toBe("ACCOUNT_OVERRIDE");
    });

    it("SET is expired exactly at expiresAt", async () => {
      const key = code("toexclusive");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      const expiresAt = at("2026-09-06T12:00:00.000Z");
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        at("2026-09-06T00:00:00.000Z"),
        expiresAt,
      );
      expect(
        (await resolve(accountId, published.id, key, expiresAt))
          .selectedOverride?.state,
      ).toBe("EXPIRED");
    });

    it("expired latest override falls back to the plan", async () => {
      const key = code("expiredfallback");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        at("2026-09-01T00:00:00.000Z"),
        at("2026-09-05T00:00:00.000Z"),
      );
      expect(await resolve(accountId, published.id, key)).toMatchObject({
        effectiveValue: { kind: "BOOLEAN", value: false },
        reason: "ACCOUNT_OVERRIDE_EXPIRED_TO_PLAN",
      });
    });

    it("expired latest SET never resurrects an older SET", async () => {
      const key = code("noresurrect");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        at("2026-09-01T00:00:00.000Z"),
      );
      await set(
        accountId,
        key,
        1,
        { kind: "BOOLEAN", value: false },
        at("2026-09-05T00:00:00.000Z"),
        at("2026-09-06T00:00:00.000Z"),
      );
      expect(await resolve(accountId, published.id, key)).toMatchObject({
        effectiveValue: { kind: "BOOLEAN", value: false },
        reason: "ACCOUNT_OVERRIDE_EXPIRED_TO_PLAN",
      });
    });

    it("CLEAR supersedes older SET and never lets it resurrect", async () => {
      const key = code("clearsupersede");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      await set(accountId, key, null, { kind: "BOOLEAN", value: true });
      await clear(
        accountId,
        key,
        1,
        at("2026-09-05T00:00:00.000Z"),
        at("2026-09-06T00:00:00.000Z"),
      );
      expect(
        await resolve(
          accountId,
          published.id,
          key,
          at("2026-09-05T12:00:00.000Z"),
        ),
      ).toMatchObject({
        effectiveValue: { kind: "BOOLEAN", value: false },
        selectedOverride: { operation: "CLEAR", state: "ACTIVE_CLEAR" },
      });
      expect(await resolve(accountId, published.id, key, later)).toMatchObject({
        effectiveValue: { kind: "BOOLEAN", value: false },
        reason: "ACCOUNT_OVERRIDE_EXPIRED_TO_PLAN",
      });
    });

    it("ignores a future higher revision before its effectiveFrom", async () => {
      const key = code("futurebefore");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        at("2026-09-01T00:00:00.000Z"),
      );
      await set(accountId, key, 1, { kind: "BOOLEAN", value: false }, later);
      expect(
        (await resolve(accountId, published.id, key, now)).effectiveValue,
      ).toEqual({ kind: "BOOLEAN", value: true });
    });

    it("future higher revision wins at effectiveFrom", async () => {
      const key = code("futureat");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        at("2026-09-01T00:00:00.000Z"),
      );
      await set(accountId, key, 1, { kind: "BOOLEAN", value: false }, later);
      expect(
        (await resolve(accountId, published.id, key, later)).selectedOverride
          ?.overrideRevision,
      ).toBe(2);
    });

    it("same effectiveFrom uses the highest revision", async () => {
      const key = code("sametime");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      const effectiveFrom = at("2026-09-01T00:00:00.000Z");
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        effectiveFrom,
      );
      await set(
        accountId,
        key,
        1,
        { kind: "BOOLEAN", value: false },
        effectiveFrom,
      );
      expect(
        (await resolve(accountId, published.id, key, now)).selectedOverride
          ?.overrideRevision,
      ).toBe(2);
    });

    it("archived plan still resolves its exact published revision", async () => {
      const key = code("archivedhistory");
      const { plan, published } = await makeBooleanPlan(true, key);
      ok(
        await plans.changePlanStatus(
          {
            planId: plan.id,
            expectedStatus: "DRAFT",
            targetStatus: "ARCHIVED",
          },
          system(),
        ),
      );
      expect(
        (await resolve(await account(), published.id, key)).effectiveValue,
      ).toEqual({ kind: "BOOLEAN", value: true });
    });

    it("deprecated definition historical value still resolves with metadata", async () => {
      const key = code("deprecatedhistory");
      const { published } = await makeBooleanPlan(true, key);
      ok(
        await plans.deprecateEntitlementDefinition(
          { entitlementKey: key },
          system(),
        ),
      );
      const value = await resolve(await account(), published.id, key);
      expect(value.definition.deprecatedAt).toBeInstanceOf(Date);
    });

    it("rejects a DRAFT plan revision", async () => {
      const key = code("draftplan");
      await definition(key);
      const plan = ok(
        await plans.createPlan({ code: code("draft") }, system()),
      );
      const draft = ok(
        await plans.createDraftPlanRevision(
          { planId: plan.id, displayName: "Draft", description: "draft" },
          system(),
        ),
      );
      const result = await entitlements.resolveCommercialEntitlement({
        accountId: await account(),
        planRevisionId: draft.id,
        entitlementKey: key,
        at: now,
      });
      expect(result).toEqual({
        kind: "REJECTED",
        code: "PLAN_REVISION_NOT_PUBLISHED",
      });
    });

    it("rejects a missing plan revision", async () => {
      const key = code("missingplan");
      await definition(key);
      const result = await entitlements.resolveCommercialEntitlement({
        accountId: await account(),
        planRevisionId: randomUUID(),
        entitlementKey: key,
        at: now,
      });
      expect(result).toEqual({
        kind: "REJECTED",
        code: "PLAN_REVISION_NOT_FOUND",
      });
    });

    it("rejects resolution for a missing account", async () => {
      const key = code("missingresolutionaccount");
      const { published } = await makeBooleanPlan(true, key);
      const result = await entitlements.resolveCommercialEntitlement({
        accountId: randomUUID(),
        planRevisionId: published.id,
        entitlementKey: key,
        at: now,
      });
      expect(result).toEqual({ kind: "REJECTED", code: "ACCOUNT_NOT_FOUND" });
    });

    it("single-key resolution performs no audit", async () => {
      const key = code("readnoaudit");
      const { published } = await makeBooleanPlan(true, key);
      const accountId = await account();
      const before = await auditCount();
      await resolve(accountId, published.id, key);
      expect(await auditCount()).toBe(before);
    });

    it("bulk result is lexical by entitlementKey", async () => {
      const keys = ["z.p44", "a.p44", "m.p44"].map(
        (key) => `${key}.${randomUUID().replaceAll("-", "")}`,
      );
      for (const key of keys) await definition(key);
      const { published } = await publishedPlan(
        keys.map((key, index) => ({
          key,
          value: { kind: "BOOLEAN", value: index % 2 === 0 },
        })),
      );
      const result = await entitlements.resolveCommercialEntitlements({
        accountId: await account(),
        planRevisionId: published.id,
        at: now,
      });
      if (result.kind !== "OK") throw new Error(result.code);
      expect(result.value.map((item) => item.entitlementKey)).toEqual(
        [...keys].sort(),
      );
    });

    it("bulk includes definitions that resolve UNSET", async () => {
      const present = code("present");
      const absent = code("absent");
      await definition(present);
      await definition(absent);
      const { published } = await publishedPlan([
        { key: present, value: { kind: "BOOLEAN", value: true } },
      ]);
      const result = await entitlements.resolveCommercialEntitlements({
        accountId: await account(),
        planRevisionId: published.id,
        at: now,
      });
      if (result.kind !== "OK") throw new Error(result.code);
      expect(
        result.value.find((item) => item.entitlementKey === absent),
      ).toMatchObject({
        effectiveValue: null,
        source: "NONE",
        reason: "UNSET",
      });
    });

    it("bulk preserves mixed BOOLEAN and INTEGER values", async () => {
      const flag = code("bulkflag");
      const limit = code("bulklimit");
      await definition(flag);
      await definition(limit, "INTEGER");
      const { published } = await publishedPlan([
        { key: flag, value: { kind: "BOOLEAN", value: true } },
        { key: limit, value: { kind: "INTEGER", value: 5 } },
      ]);
      const result = await entitlements.resolveCommercialEntitlements({
        accountId: await account(),
        planRevisionId: published.id,
        at: now,
      });
      if (result.kind !== "OK") throw new Error(result.code);
      expect(result.value.map((item) => item.plan.baseValue)).toEqual([
        { kind: "BOOLEAN", value: true },
        { kind: "INTEGER", value: 5 },
      ]);
    });

    it("explanation exposes safe plan and override metadata but not freeform reason", async () => {
      const key = code("explanation");
      const { published } = await makeBooleanPlan(false, key);
      const accountId = await account();
      await set(
        accountId,
        key,
        null,
        { kind: "BOOLEAN", value: true },
        now,
        null,
        "private reason must not leak",
      );
      const value = await resolve(accountId, published.id, key);
      expect(value).toMatchObject({
        plan: { planRevisionId: published.id },
        selectedOverride: {
          overrideRevision: 1,
          operation: "SET",
          state: "ACTIVE_SET",
        },
        source: "ACCOUNT_OVERRIDE",
        reason: "ACCOUNT_OVERRIDE_SET",
      });
      expect(JSON.stringify(value)).not.toContain("private reason");
    });

    it("bulk resolution performs no audit", async () => {
      const key = code("bulknoaudit");
      const { published } = await makeBooleanPlan(true, key);
      const before = await auditCount();
      const result = await entitlements.resolveCommercialEntitlements({
        accountId: await account(),
        planRevisionId: published.id,
        at: now,
      });
      expect(result.kind).toBe("OK");
      expect(await auditCount()).toBe(before);
    });

    it("commercial adapter resolves device.max_active from a fake binding", async () => {
      const { published } = await makeIntegerPlan(3);
      const accountId = await account();
      const adapter = new BoundCommercialDeviceLimitResolver(
        {
          resolve: async () => ({
            planRevisionId: published.id,
            source: "FAKE_P5_BINDING",
          }),
        },
        entitlements,
        () => now,
      );
      expect(await adapter.resolve(accountId)).toEqual({
        maxActive: 3,
        source: "COMMERCIAL_PLAN_REVISION",
      });
    });

    it("commercial adapter is structurally compatible with DeviceLimitResolver", async () => {
      const { published } = await makeIntegerPlan(3);
      const adapter = new BoundCommercialDeviceLimitResolver(
        {
          resolve: async () => ({
            planRevisionId: published.id,
            source: "fake",
          }),
        },
        entitlements,
      );
      const compatible: DeviceLimitResolver = adapter;
      expect(compatible.resolve).toBe(adapter.resolve);
    });

    it("commercial adapter observes a SET override", async () => {
      const { published } = await makeIntegerPlan(3);
      const accountId = await account();
      await set(accountId, DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY, null, {
        kind: "INTEGER",
        value: 6,
      });
      const adapter = new BoundCommercialDeviceLimitResolver(
        {
          resolve: async () => ({
            planRevisionId: published.id,
            source: "fake",
          }),
        },
        entitlements,
        () => now,
      );
      expect((await adapter.resolve(accountId)).maxActive).toBe(6);
    });

    it("commercial adapter observes CLEAR returning to plan", async () => {
      const { published } = await makeIntegerPlan(3);
      const accountId = await account();
      await set(accountId, DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY, null, {
        kind: "INTEGER",
        value: 6,
      });
      await clear(accountId, DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY, 1);
      const adapter = new BoundCommercialDeviceLimitResolver(
        {
          resolve: async () => ({
            planRevisionId: published.id,
            source: "fake",
          }),
        },
        entitlements,
        () => now,
      );
      expect((await adapter.resolve(accountId)).maxActive).toBe(3);
    });

    it("commercial adapter fails closed for an unset key", async () => {
      const key = code("notdevice");
      await definition(key, "INTEGER");
      const { published } = await publishedPlan([
        { key, value: { kind: "INTEGER", value: 3 } },
      ]);
      const adapter = new BoundCommercialDeviceLimitResolver(
        {
          resolve: async () => ({
            planRevisionId: published.id,
            source: "fake",
          }),
        },
        entitlements,
        () => now,
      );
      await expect(adapter.resolve(await account())).rejects.toMatchObject({
        code: "DEVICE_MAX_ACTIVE_UNSET",
      });
    });

    it("commercial adapter fails closed for a negative persisted integer", async () => {
      const { published } = await makeIntegerPlan(3);
      const accountId = await account();
      await q(
        "INSERT INTO account_entitlement_overrides(account_id,entitlement_key,revision,operation,integer_value,effective_from,reason) VALUES($1,$2,1,'SET',-1,$3,'corrupt test')",
        [
          accountId,
          DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
          at("2026-09-01T00:00:00.000Z"),
        ],
      );
      const adapter = new BoundCommercialDeviceLimitResolver(
        {
          resolve: async () => ({
            planRevisionId: published.id,
            source: "fake",
          }),
        },
        entitlements,
        () => now,
      );
      await expect(adapter.resolve(accountId)).rejects.toMatchObject({
        code: "DEVICE_MAX_ACTIVE_VALUE_INVALID",
      });
    });
  },
);

async function makeIntegerPlan(value: number) {
  await definition(DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY, "INTEGER");
  return publishedPlan([
    {
      key: DEVICE_MAX_ACTIVE_ENTITLEMENT_KEY,
      value: { kind: "INTEGER", value },
    },
  ]);
}
