import type {
  AdminBillingEvent,
  AdminBillingReadRepository,
  AdminPayment,
  AdminReconciliationJob,
} from "@product/admin-billing";
import type { DatabaseRuntime } from "./index.js";

function safeInteger(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0)
    throw new Error("ADMIN_BILLING_READ_CORRUPTED");
  return parsed;
}

function date(value: unknown): Date {
  const parsed = new Date(String(value));
  if (!Number.isFinite(parsed.getTime()))
    throw new Error("ADMIN_BILLING_READ_CORRUPTED");
  return parsed;
}

async function accountExists(
  runtime: DatabaseRuntime,
  accountId: string,
): Promise<boolean> {
  const result = await runtime.query<{ id: string }>(
    "SELECT id FROM accounts WHERE id=$1",
    [accountId],
  );
  return Boolean(result.rows[0]);
}

type PaymentRow = {
  id: string;
  subscriptionId: string | null;
  state: AdminPayment["state"];
  priceRevisionId: string;
  amountMinor: number | string;
  currency: string;
  planRevisionId: string | null;
  planCode: string | null;
  planRevision: number | string | null;
  displayName: string | null;
  billingIntervalUnit: "DAY" | "MONTH" | "YEAR" | null;
  billingIntervalCount: number | string | null;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt: Date | null;
};

function payment(row: PaymentRow): AdminPayment {
  const hasPlan =
    row.planRevisionId !== null &&
    row.planCode !== null &&
    row.planRevision !== null &&
    row.displayName !== null;
  const hasInterval =
    row.billingIntervalUnit !== null && row.billingIntervalCount !== null;
  if (!hasPlan && (row.planRevisionId !== null || row.planCode !== null))
    throw new Error("ADMIN_BILLING_READ_CORRUPTED");
  return {
    id: row.id,
    subscriptionId: row.subscriptionId,
    state: row.state,
    priceRevisionId: row.priceRevisionId,
    amountMinor: safeInteger(row.amountMinor),
    currency: row.currency,
    plan: hasPlan
      ? {
          planRevisionId: row.planRevisionId!,
          planCode: row.planCode!,
          planRevision: safeInteger(row.planRevision),
          displayName: row.displayName!,
        }
      : null,
    billingInterval: hasInterval
      ? {
          unit: row.billingIntervalUnit!,
          count: safeInteger(row.billingIntervalCount),
        }
      : null,
    createdAt: date(row.createdAt),
    updatedAt: date(row.updatedAt),
    confirmedAt: row.confirmedAt ? date(row.confirmedAt) : null,
  };
}

export function createP6AdminBillingRepository(
  runtime: DatabaseRuntime,
): AdminBillingReadRepository {
  return {
    async listPayments({ accountId, limit, cursor }) {
      if (!(await accountExists(runtime, accountId)))
        return { kind: "ACCOUNT_NOT_FOUND" };
      let cursorRow: { createdAt: Date; id: string } | undefined;
      if (cursor) {
        const result = await runtime.query<{ createdAt: Date; id: string }>(
          'SELECT created_at AS "createdAt",id FROM payments WHERE id=$1 AND account_id=$2',
          [cursor, accountId],
        );
        cursorRow = result.rows[0];
        if (!cursorRow) return { kind: "INVALID_CURSOR" };
      }
      const result = await runtime.query<PaymentRow>(
        `SELECT pay.id,pay.subscription_id AS "subscriptionId",pay.state,
                pay.price_revision_id AS "priceRevisionId",pay.amount_minor AS "amountMinor",pay.currency,
                pr.id AS "planRevisionId",p.code AS "planCode",pr.revision AS "planRevision",pr.display_name AS "displayName",
                price.billing_interval_unit AS "billingIntervalUnit",price.billing_interval_count AS "billingIntervalCount",
                pay.created_at AS "createdAt",pay.updated_at AS "updatedAt",pay.confirmed_at AS "confirmedAt"
           FROM payments pay
           LEFT JOIN price_revisions price ON price.id=pay.price_revision_id
           LEFT JOIN plan_revisions pr ON pr.id=price.plan_revision_id
           LEFT JOIN plans p ON p.id=pr.plan_id
          WHERE pay.account_id=$1
            ${cursorRow ? "AND (pay.created_at,pay.id)<($2,$3)" : ""}
          ORDER BY pay.created_at DESC,pay.id DESC
          LIMIT $${cursorRow ? 4 : 2}`,
        [
          accountId,
          ...(cursorRow ? [cursorRow.createdAt, cursorRow.id] : []),
          limit + 1,
        ],
      );
      const items = result.rows.slice(0, limit).map(payment);
      return {
        items,
        ...(result.rows.length > limit && items.length
          ? { nextCursor: items.at(-1)!.id }
          : {}),
      };
    },

    async listEvents({ accountId, limit, cursor }) {
      if (!(await accountExists(runtime, accountId)))
        return { kind: "ACCOUNT_NOT_FOUND" };
      let cursorRow: { createdAt: Date; id: string } | undefined;
      if (cursor) {
        const result = await runtime.query<{ createdAt: Date; id: string }>(
          `SELECT e.created_at AS "createdAt",e.id
             FROM billing_events e
             LEFT JOIN payments pay ON pay.id=e.payment_id
             LEFT JOIN subscriptions sub ON sub.id=e.subscription_id
            WHERE e.id=$1 AND (pay.account_id=$2 OR sub.account_id=$2)`,
          [cursor, accountId],
        );
        cursorRow = result.rows[0];
        if (!cursorRow) return { kind: "INVALID_CURSOR" };
      }
      type EventRow = AdminBillingEvent & {
        paymentAccountId: string | null;
        subscriptionAccountId: string | null;
      };
      const result = await runtime.query<EventRow>(
        `SELECT e.id,e.source,e.event_type AS "eventType",e.processing_state AS "processingState",
                e.payment_id AS "paymentId",e.subscription_id AS "subscriptionId",e.failure_code AS "failureCode",
                e.received_at AS "receivedAt",e.verified_at AS "verifiedAt",e.processed_at AS "processedAt",e.created_at AS "createdAt",
                pay.account_id AS "paymentAccountId",sub.account_id AS "subscriptionAccountId"
           FROM billing_events e
           LEFT JOIN payments pay ON pay.id=e.payment_id
           LEFT JOIN subscriptions sub ON sub.id=e.subscription_id
          WHERE (pay.account_id=$1 OR sub.account_id=$1)
            ${cursorRow ? "AND (e.created_at,e.id)<($2,$3)" : ""}
          ORDER BY e.created_at DESC,e.id DESC
          LIMIT $${cursorRow ? 4 : 2}`,
        [
          accountId,
          ...(cursorRow ? [cursorRow.createdAt, cursorRow.id] : []),
          limit + 1,
        ],
      );
      for (const row of result.rows) {
        if (
          row.paymentAccountId !== null &&
          row.subscriptionAccountId !== null &&
          row.paymentAccountId !== row.subscriptionAccountId
        )
          return { kind: "SERVICE_UNAVAILABLE" };
      }
      const items = result.rows.slice(0, limit).map((row) => ({
        id: row.id,
        source: row.source,
        eventType: row.eventType,
        processingState: row.processingState,
        paymentId: row.paymentId,
        subscriptionId: row.subscriptionId,
        failureCode: row.failureCode,
        receivedAt: date(row.receivedAt),
        verifiedAt: date(row.verifiedAt),
        processedAt: row.processedAt ? date(row.processedAt) : null,
        createdAt: date(row.createdAt),
      }));
      return {
        items,
        ...(result.rows.length > limit && items.length
          ? { nextCursor: items.at(-1)!.id }
          : {}),
      };
    },

    async listReconciliationJobs({ accountId, limit, cursor }) {
      if (!(await accountExists(runtime, accountId)))
        return { kind: "ACCOUNT_NOT_FOUND" };
      let cursorRow: { updatedAt: Date; paymentId: string } | undefined;
      if (cursor) {
        const result = await runtime.query<{
          updatedAt: Date;
          paymentId: string;
        }>(
          `SELECT j.updated_at AS "updatedAt",j.payment_id AS "paymentId"
             FROM billing_reconciliation_jobs j JOIN payments p ON p.id=j.payment_id
            WHERE j.payment_id=$1 AND p.account_id=$2`,
          [cursor, accountId],
        );
        cursorRow = result.rows[0];
        if (!cursorRow) return { kind: "INVALID_CURSOR" };
      }
      type JobRow = AdminReconciliationJob;
      const result = await runtime.query<JobRow>(
        `SELECT j.payment_id AS "paymentId",j.state,j.next_attempt_at AS "nextAttemptAt",
                j.lease_until AS "leaseUntil",j.attempt_count AS "attemptCount",
                j.last_result_code AS "lastResultCode",j.created_at AS "createdAt",j.updated_at AS "updatedAt"
           FROM billing_reconciliation_jobs j JOIN payments p ON p.id=j.payment_id
          WHERE p.account_id=$1
            ${cursorRow ? "AND (j.updated_at,j.payment_id)<($2,$3)" : ""}
          ORDER BY j.updated_at DESC,j.payment_id DESC
          LIMIT $${cursorRow ? 4 : 2}`,
        [
          accountId,
          ...(cursorRow ? [cursorRow.updatedAt, cursorRow.paymentId] : []),
          limit + 1,
        ],
      );
      const items = result.rows.slice(0, limit).map((row) => ({
        paymentId: row.paymentId,
        state: row.state,
        nextAttemptAt: row.nextAttemptAt ? date(row.nextAttemptAt) : null,
        leaseUntil: row.leaseUntil ? date(row.leaseUntil) : null,
        attemptCount: safeInteger(row.attemptCount),
        lastResultCode: row.lastResultCode,
        createdAt: date(row.createdAt),
        updatedAt: date(row.updatedAt),
      }));
      return {
        items,
        ...(result.rows.length > limit && items.length
          ? { nextCursor: items.at(-1)!.paymentId }
          : {}),
      };
    },
  };
}
