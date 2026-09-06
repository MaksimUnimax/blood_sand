import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabaseRuntime,
  createP4PlanCommandRepository,
  type DatabaseQuery,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";
import { runMigrations } from "../packages/db/src/migrations.js";
import {
  type CommandResult,
  type PlanEntitlementCommandRepository,
  type PlanMutationContext,
  type PlanRevisionDraft,
} from "../packages/plans/src/index.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is required for real PostgreSQL tests");

let db: DatabaseRuntime;
let commands: PlanEntitlementCommandRepository;
const system = (reason = "integration test"): PlanMutationContext => ({
  actorType: "SYSTEM",
  correlationId: randomUUID(),
  reason,
});
const code = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll("-", "")}`;
const uuid = () => randomUUID();

const q = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values?: unknown[],
) => db.query<T>(text, values);

function ok<T>(result: CommandResult<T>): T {
  if (result.kind !== "OK")
    throw new Error(`expected OK, received ${result.code}`);
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
    "TRUNCATE price_sale_assignments,account_entitlement_overrides,price_revisions,plan_entitlements,prices,plan_revisions,entitlement_definitions,plans,audit_events",
  );
}

async function createPlanAndDraft(): Promise<{
  planId: string;
  draft: PlanRevisionDraft;
}> {
  const plan = ok(
    await commands.createPlan({ code: code("p42-plan") }, system()),
  );
  const draft = ok(
    await commands.createDraftPlanRevision(
      {
        planId: plan.id,
        displayName: "Starter",
        description: "A bounded starter plan",
      },
      system(),
    ),
  );
  return { planId: plan.id, draft };
}

async function createBooleanDefinition(key = code("flag")) {
  return ok(
    await commands.createEntitlementDefinition(
      {
        entitlementKey: key,
        valueType: "BOOLEAN",
        securityClassification: "CAPABILITY",
        description: "A capability",
      },
      system(),
    ),
  );
}

async function createIntegerDefinition(key = code("limit")) {
  return ok(
    await commands.createEntitlementDefinition(
      {
        entitlementKey: key,
        valueType: "INTEGER",
        securityClassification: "LIMIT",
        description: "A bounded limit",
      },
      system(),
    ),
  );
}

describe.sequential("P4.2 plan and entitlement commands on PostgreSQL", () => {
  beforeAll(async () => {
    db = createDatabaseRuntime(connectionString!);
    await db.ready();
    await runMigrations({ connectionString: connectionString! });
    commands = createP4PlanCommandRepository(db, {
      clock: () => new Date("2026-09-06T00:00:00.000Z"),
    });
  });

  beforeEach(resetCommercial);
  afterAll(() => db.close());

  it("creates a plan and exactly one transactional audit", async () => {
    const result = await commands.createPlan(
      { code: code("basic") },
      { ...system(), correlationId: "p42-create-1" },
    );
    if (result.kind !== "OK") throw new Error(`unexpected ${result.code}`);
    expect(result.kind).toBe("OK");
    expect(result.changed).toBe(true);
    expect(await auditCount()).toBe(1);
    expect(
      (
        await q<{ action: string; target_type: string; target_id: string }>(
          "SELECT action,target_type,target_id FROM audit_events WHERE correlation_id='p42-create-1'",
        )
      ).rows[0],
    ).toMatchObject({ action: "PLAN_CREATED", target_type: "PLAN" });
  });

  it("returns a typed duplicate code conflict without a second audit", async () => {
    const planCode = code("duplicate");
    await commands.createPlan(
      { code: planCode },
      { ...system(), correlationId: "p42-duplicate-first" },
    );
    const result = await commands.createPlan(
      { code: planCode },
      { ...system(), correlationId: "p42-duplicate-second" },
    );
    expect(result).toEqual({ kind: "REJECTED", code: "PLAN_CODE_CONFLICT" });
    expect(await auditCount()).toBe(1);
  });

  it("serializes concurrent same-code creation deterministically", async () => {
    const planCode = code("same-code");
    const results = await Promise.all([
      commands.createPlan(
        { code: planCode },
        { ...system(), correlationId: "p42-concurrent-a" },
      ),
      commands.createPlan(
        { code: planCode },
        { ...system(), correlationId: "p42-concurrent-b" },
      ),
    ]);
    expect(results.filter((result) => result.kind === "OK")).toHaveLength(1);
    expect(
      results.filter(
        (result) =>
          result.kind === "REJECTED" && result.code === "PLAN_CODE_CONFLICT",
      ),
    ).toHaveLength(1);
    expect(await auditCount()).toBe(1);
  });

  it("allocates sequential server revisions and permits multiple drafts", async () => {
    const plan = ok(
      await commands.createPlan({ code: code("revisions") }, system()),
    );
    const first = ok(
      await commands.createDraftPlanRevision(
        { planId: plan.id, displayName: "One", description: "one" },
        system(),
      ),
    );
    const second = ok(
      await commands.createDraftPlanRevision(
        { planId: plan.id, displayName: "Two", description: "two" },
        system(),
      ),
    );
    expect([first.revision, second.revision]).toEqual([1, 2]);
    expect(first.state).toBe("DRAFT");
    expect(second.state).toBe("DRAFT");
  });

  it("allocates distinct revisions for concurrent same-plan drafts", async () => {
    const plan = ok(
      await commands.createPlan(
        { code: code("concurrent-revisions") },
        system(),
      ),
    );
    const results = await Promise.all([
      commands.createDraftPlanRevision(
        { planId: plan.id, displayName: "One", description: "one" },
        system(),
      ),
      commands.createDraftPlanRevision(
        { planId: plan.id, displayName: "Two", description: "two" },
        system(),
      ),
    ]);
    const revisions = results.map((result) => ok(result).revision).sort();
    expect(revisions).toEqual([1, 2]);
  });

  it("rejects draft creation under an archived plan", async () => {
    const plan = ok(
      await commands.createPlan({ code: code("archived") }, system()),
    );
    expect(
      ok(
        await commands.changePlanStatus(
          {
            planId: plan.id,
            expectedStatus: "DRAFT",
            targetStatus: "ARCHIVED",
          },
          system(),
        ),
      ).status,
    ).toBe("ARCHIVED");
    expect(
      await commands.createDraftPlanRevision(
        { planId: plan.id, displayName: "No", description: "no" },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PLAN_ARCHIVED" });
  });

  it("reads sorted draft composition and publishes a correct fingerprint", async () => {
    const { draft } = await createPlanAndDraft();
    const flag = await createBooleanDefinition("a.flag");
    const limit = await createIntegerDefinition("z.limit");
    const withFlag = ok(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
          value: { kind: "BOOLEAN", value: true },
        },
        system(),
      ),
    );
    const withLimit = ok(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: withFlag.contentFingerprintSha256,
          entitlementKey: limit.entitlementKey,
          value: { kind: "INTEGER", value: 4 },
        },
        system(),
      ),
    );
    expect(withLimit.entitlements.map((item) => item.entitlementKey)).toEqual([
      "a.flag",
      "z.limit",
    ]);
    const read = await commands.getPlanRevisionDraft(draft.id);
    expect(read?.contentFingerprintSha256).toBe(
      withLimit.contentFingerprintSha256,
    );
    expect(read?.entitlements).toEqual(withLimit.entitlements);
  });

  it("updates metadata, changes fingerprint, and rejects a stale writer", async () => {
    const { draft } = await createPlanAndDraft();
    const updated = ok(
      await commands.updateDraftPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          displayName: "Changed",
        },
        system(),
      ),
    );
    expect(updated.contentFingerprintSha256).not.toBe(
      draft.contentFingerprintSha256,
    );
    expect(
      await commands.updateDraftPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          description: "lost update",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PLAN_DRAFT_STALE" });
    expect((await commands.getPlanRevisionDraft(draft.id))?.description).toBe(
      draft.description,
    );
    expect(await auditCount()).toBe(3);
  });

  it("allows only one of two same-fingerprint draft writers to commit", async () => {
    const { draft } = await createPlanAndDraft();
    const results = await Promise.all([
      commands.updateDraftPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          displayName: "Writer A",
        },
        system(),
      ),
      commands.updateDraftPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          displayName: "Writer B",
        },
        system(),
      ),
    ]);
    expect(
      results.filter((result) => result.kind === "OK" && result.changed),
    ).toHaveLength(1);
    expect(
      results.filter(
        (result) =>
          result.kind === "REJECTED" && result.code === "PLAN_DRAFT_STALE",
      ),
    ).toHaveLength(1);
    expect(await auditCount()).toBe(3);
  });

  it("sets BOOLEAN and INTEGER values, rejects type mismatch, and treats same SET as a no-op", async () => {
    const { draft } = await createPlanAndDraft();
    const flag = await createBooleanDefinition("flag");
    const limit = await createIntegerDefinition("limit");
    const one = ok(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
          value: { kind: "BOOLEAN", value: true },
        },
        system(),
      ),
    );
    expect(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: one.contentFingerprintSha256,
          entitlementKey: limit.entitlementKey,
          value: { kind: "BOOLEAN", value: true },
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_TYPE_MISMATCH" });
    const two = ok(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: one.contentFingerprintSha256,
          entitlementKey: limit.entitlementKey,
          value: { kind: "INTEGER", value: 9 },
        },
        system(),
      ),
    );
    const noop = await commands.setDraftPlanEntitlement(
      {
        planRevisionId: draft.id,
        expectedContentFingerprint: two.contentFingerprintSha256,
        entitlementKey: limit.entitlementKey,
        value: { kind: "INTEGER", value: 9 },
      },
      system(),
    );
    expect(noop).toEqual({ kind: "OK", changed: false, value: two });
  });

  it("removes values, makes absent REMOVE a no-op, and permits removal after deprecation", async () => {
    const { draft } = await createPlanAndDraft();
    const flag = await createBooleanDefinition("removable");
    const set = ok(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
          value: { kind: "BOOLEAN", value: true },
        },
        system(),
      ),
    );
    const removed = ok(
      await commands.removeDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: set.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
        },
        system(),
      ),
    );
    expect(removed.entitlements).toHaveLength(0);
    expect(
      await commands.removeDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: removed.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
        },
        system(),
      ),
    ).toEqual({ kind: "OK", changed: false, value: removed });
    await commands.setDraftPlanEntitlement(
      {
        planRevisionId: draft.id,
        expectedContentFingerprint: removed.contentFingerprintSha256,
        entitlementKey: flag.entitlementKey,
        value: { kind: "BOOLEAN", value: true },
      },
      system(),
    );
    await commands.deprecateEntitlementDefinition(
      { entitlementKey: flag.entitlementKey },
      system(),
    );
    const current = await commands.getPlanRevisionDraft(draft.id);
    expect(
      await commands.removeDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: current!.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
        },
        system(),
      ),
    ).toMatchObject({ kind: "OK", changed: true });
  });

  it("publishes with injected time, audits once, and makes second publish idempotent", async () => {
    const { draft } = await createPlanAndDraft();
    const published = ok(
      await commands.publishPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
        },
        { ...system(), correlationId: "p42-publish-once" },
      ),
    );
    expect(published.publishedAt.toISOString()).toBe(
      "2026-09-06T00:00:00.000Z",
    );
    const second = await commands.publishPlanRevision(
      { planRevisionId: draft.id, expectedContentFingerprint: "f".repeat(64) },
      system(),
    );
    expect(second).toEqual({ kind: "OK", changed: false, value: published });
    expect(
      (
        await q<{ count: string }>(
          "SELECT count(*)::text AS count FROM audit_events WHERE action='PLAN_REVISION_PUBLISHED'",
        )
      ).rows[0]!.count,
    ).toBe("1");
  });

  it("rejects stale publication and preserves the draft", async () => {
    const { draft } = await createPlanAndDraft();
    await commands.updateDraftPlanRevision(
      {
        planRevisionId: draft.id,
        expectedContentFingerprint: draft.contentFingerprintSha256,
        description: "new",
      },
      system(),
    );
    expect(
      await commands.publishPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PLAN_DRAFT_STALE" });
    expect((await commands.getPlanRevisionDraft(draft.id))?.state).toBe(
      "DRAFT",
    );
  });

  it("rejects publication when a referenced definition is deprecated", async () => {
    const { draft } = await createPlanAndDraft();
    const flag = await createBooleanDefinition("publish-deprecated");
    const set = ok(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
          value: { kind: "BOOLEAN", value: true },
        },
        system(),
      ),
    );
    await commands.deprecateEntitlementDefinition(
      { entitlementKey: flag.entitlementKey },
      system(),
    );
    expect(
      await commands.publishPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: set.contentFingerprintSha256,
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_DEPRECATED" });
  });

  it("freezes published composition against later direct changes", async () => {
    const { draft } = await createPlanAndDraft();
    const flag = await createBooleanDefinition("freeze-flag");
    const set = ok(
      await commands.setDraftPlanEntitlement(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
          entitlementKey: flag.entitlementKey,
          value: { kind: "BOOLEAN", value: true },
        },
        system(),
      ),
    );
    await commands.publishPlanRevision(
      {
        planRevisionId: draft.id,
        expectedContentFingerprint: set.contentFingerprintSha256,
      },
      system(),
    );
    await expect(
      q("DELETE FROM plan_entitlements WHERE plan_revision_id=$1", [draft.id]),
    ).rejects.toBeInstanceOf(Error);
    await expect(
      q("UPDATE plan_revisions SET display_name='mutated' WHERE id=$1", [
        draft.id,
      ]),
    ).rejects.toBeInstanceOf(Error);
  });

  it("enforces publication-required and terminal plan status transitions", async () => {
    const plan = ok(
      await commands.createPlan({ code: code("status") }, system()),
    );
    expect(
      await commands.changePlanStatus(
        { planId: plan.id, expectedStatus: "DRAFT", targetStatus: "ACTIVE" },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PLAN_PUBLISHED_REVISION_REQUIRED" });
    const draft = ok(
      await commands.createDraftPlanRevision(
        { planId: plan.id, displayName: "Status", description: "status" },
        system(),
      ),
    );
    await commands.publishPlanRevision(
      {
        planRevisionId: draft.id,
        expectedContentFingerprint: draft.contentFingerprintSha256,
      },
      system(),
    );
    expect(
      ok(
        await commands.changePlanStatus(
          { planId: plan.id, expectedStatus: "DRAFT", targetStatus: "ACTIVE" },
          system(),
        ),
      ).status,
    ).toBe("ACTIVE");
    expect(
      ok(
        await commands.changePlanStatus(
          { planId: plan.id, expectedStatus: "ACTIVE", targetStatus: "HIDDEN" },
          system(),
        ),
      ).status,
    ).toBe("HIDDEN");
    expect(
      ok(
        await commands.changePlanStatus(
          { planId: plan.id, expectedStatus: "HIDDEN", targetStatus: "ACTIVE" },
          system(),
        ),
      ).status,
    ).toBe("ACTIVE");
    expect(
      await commands.changePlanStatus(
        { planId: plan.id, expectedStatus: "ACTIVE", targetStatus: "DRAFT" },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PLAN_STATUS_TRANSITION_INVALID" });
    expect(
      await commands.changePlanStatus(
        { planId: plan.id, expectedStatus: "ACTIVE", targetStatus: "ACTIVE" },
        system(),
      ),
    ).toMatchObject({ kind: "OK", changed: false });
    expect(
      ok(
        await commands.changePlanStatus(
          {
            planId: plan.id,
            expectedStatus: "ACTIVE",
            targetStatus: "ARCHIVED",
          },
          system(),
        ),
      ).status,
    ).toBe("ARCHIVED");
    expect(
      await commands.changePlanStatus(
        { planId: plan.id, expectedStatus: "ARCHIVED", targetStatus: "HIDDEN" },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "PLAN_STATUS_TRANSITION_INVALID" });
  });

  it("creates both definition kinds and handles conflict, stale description, and no-op deprecation", async () => {
    const flag = await createBooleanDefinition("definition-flag");
    const limit = await createIntegerDefinition("definition-limit");
    expect(flag.securityClassification).toBe("CAPABILITY");
    expect(limit.securityClassification).toBe("LIMIT");
    expect(
      await commands.createEntitlementDefinition(
        {
          entitlementKey: flag.entitlementKey,
          valueType: "BOOLEAN",
          securityClassification: "CAPABILITY",
          description: "again",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_DEFINITION_CONFLICT" });
    expect(
      await commands.updateEntitlementDefinitionDescription(
        {
          entitlementKey: flag.entitlementKey,
          expectedDescription: "wrong",
          newDescription: "new",
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_DEFINITION_STALE" });
    const updated = ok(
      await commands.updateEntitlementDefinitionDescription(
        {
          entitlementKey: flag.entitlementKey,
          expectedDescription: flag.description,
          newDescription: "new",
        },
        system(),
      ),
    );
    expect(updated.description).toBe("new");
    expect(
      await commands.updateEntitlementDefinitionDescription(
        {
          entitlementKey: flag.entitlementKey,
          expectedDescription: "new",
          newDescription: "new",
        },
        system(),
      ),
    ).toMatchObject({ kind: "OK", changed: false });
    const deprecated = ok(
      await commands.deprecateEntitlementDefinition(
        { entitlementKey: flag.entitlementKey },
        system(),
      ),
    );
    expect(deprecated.deprecatedAt?.toISOString()).toBe(
      "2026-09-06T00:00:00.000Z",
    );
    expect(
      await commands.deprecateEntitlementDefinition(
        { entitlementKey: flag.entitlementKey },
        system(),
      ),
    ).toMatchObject({ kind: "OK", changed: false });
  });

  it("writes ADMIN identity, correlation, reason, and privacy-safe metadata", async () => {
    const actorId = uuid();
    const result = await commands.createPlan(
      { code: code("privacy") },
      {
        actorType: "ADMIN",
        actorId,
        correlationId: "p42-privacy",
        reason: "approved by operator",
      },
    );
    const plan = ok(result);
    const audit = (
      await q<Record<string, unknown>>(
        'SELECT actor_type AS "actorType",actor_id AS "actorId",correlation_id AS "correlationId",reason,safe_metadata AS "safeMetadata" FROM audit_events WHERE target_id=$1',
        [plan.id],
      )
    ).rows[0]!;
    expect(audit).toMatchObject({
      actorType: "ADMIN",
      actorId,
      correlationId: "p42-privacy",
      reason: "approved by operator",
    });
    expect(JSON.stringify(audit.safeMetadata)).toContain(plan.code);
    expect(JSON.stringify(audit.safeMetadata)).not.toContain("operator");
  });

  it("rolls back a normal mutation when the same-transaction audit fails", async () => {
    const failing = failingAuditRuntime();
    const failingCommands = createP4PlanCommandRepository(failing);
    await expect(
      failingCommands.createPlan(
        { code: code("rollback") },
        { ...system(), correlationId: "p42-fail-create" },
      ),
    ).rejects.toBeInstanceOf(Error);
    expect(
      (
        await q<{ count: string }>(
          "SELECT count(*)::text AS count FROM plans WHERE code LIKE 'rollback-%'",
        )
      ).rows[0]!.count,
    ).toBe("0");
  });

  it("rolls back publication when the same-transaction audit fails", async () => {
    const { draft } = await createPlanAndDraft();
    const failingCommands = createP4PlanCommandRepository(
      failingAuditRuntime(),
    );
    await expect(
      failingCommands.publishPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: draft.contentFingerprintSha256,
        },
        system(),
      ),
    ).rejects.toBeInstanceOf(Error);
    expect(
      (
        await q<{ state: string }>(
          "SELECT state FROM plan_revisions WHERE id=$1",
          [draft.id],
        )
      ).rows[0]!.state,
    ).toBe("DRAFT");
  });

  it("serializes a consumer share lock against deprecation with explicit coordination", async () => {
    const { draft } = await createPlanAndDraft();
    const flag = await createBooleanDefinition("coordination");
    const started = deferred<void>();
    const release = deferred<void>();
    const controlled = controlledShareRuntime(started, release);
    const consumer = createP4PlanCommandRepository(controlled);
    const setPromise = consumer.setDraftPlanEntitlement(
      {
        planRevisionId: draft.id,
        expectedContentFingerprint: draft.contentFingerprintSha256,
        entitlementKey: flag.entitlementKey,
        value: { kind: "BOOLEAN", value: true },
      },
      system(),
    );
    await started.promise;
    const deprecatePromise = commands.deprecateEntitlementDefinition(
      { entitlementKey: flag.entitlementKey },
      system(),
    );
    await expect(
      q(
        "SELECT entitlement_key FROM entitlement_definitions WHERE entitlement_key=$1 FOR UPDATE NOWAIT",
        [flag.entitlementKey],
      ),
    ).rejects.toBeInstanceOf(Error);
    release.resolve();
    expect((await setPromise).kind).toBe("OK");
    expect((await deprecatePromise).kind).toBe("OK");
    const current = await commands.getPlanRevisionDraft(draft.id);
    expect(
      await commands.publishPlanRevision(
        {
          planRevisionId: draft.id,
          expectedContentFingerprint: current!.contentFingerprintSha256,
        },
        system(),
      ),
    ).toEqual({ kind: "REJECTED", code: "ENTITLEMENT_DEPRECATED" });
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function failingAuditRuntime(): DatabaseRuntime {
  return {
    ...db,
    transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
      db.transaction((q) =>
        operation({
          query: async <
            T extends Record<string, unknown> = Record<string, unknown>,
          >(
            text: string,
            values?: unknown[],
          ) => {
            if (text.startsWith("INSERT INTO audit_events"))
              throw new Error("injected audit failure");
            return q.query<T>(text, values);
          },
        }),
      ),
  };
}

function controlledShareRuntime(
  started: { resolve: () => void },
  release: { promise: Promise<void> },
): DatabaseRuntime {
  return {
    ...db,
    transaction: <T>(operation: (transaction: DatabaseQuery) => Promise<T>) =>
      db.transaction((q) =>
        operation({
          query: async <
            T extends Record<string, unknown> = Record<string, unknown>,
          >(
            text: string,
            values?: unknown[],
          ) => {
            const result = await q.query<T>(text, values);
            if (text.includes("FOR SHARE")) {
              started.resolve();
              await release.promise;
            }
            return result;
          },
        }),
      ),
  };
}
