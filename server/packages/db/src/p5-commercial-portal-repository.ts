import type {
  CommercialPortalRepository,
  PortalPaymentRecord,
  PortalSubscriptionRecord,
} from "@product/commercial-access";
import type { DatabaseRuntime } from "./index.js";

function safeInteger(value: unknown): number {
  const result = Number(value);
  if (!Number.isSafeInteger(result))
    throw new Error("COMMERCIAL_READ_CORRUPTED");
  return result;
}

type SubscriptionRow = {
  id: string;
  accountId: string;
  state: PortalSubscriptionRecord["state"];
  stateRevision: number | string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  graceUntil: Date | null;
  cancelAtPeriodEnd: boolean;
  boundPriceRevisionId: string | null;
  planRevisionId: string;
  planCode: string;
  planRevision: number | string;
  displayName: string;
  priceRevisionId: string | null;
  amountMinor: number | string | null;
  currency: string | null;
  billingIntervalUnit: "DAY" | "MONTH" | "YEAR" | null;
  billingIntervalCount: number | string | null;
};

type PaymentRow = {
  id: string;
  state: PortalPaymentRecord["state"];
  amountMinor: number | string;
  currency: string;
  priceRevisionId: string;
  planCode: string | null;
  planRevision: number | string | null;
  displayName: string | null;
  billingIntervalUnit: "DAY" | "MONTH" | "YEAR" | null;
  billingIntervalCount: number | string | null;
  createdAt: Date;
  confirmedAt: Date | null;
  subscriptionLinked: boolean;
};

export function createP5CommercialPortalRepository(
  runtime: DatabaseRuntime,
): CommercialPortalRepository {
  return {
    async isOwner(userId, accountId) {
      const result = await runtime.query<{ id: string }>(
        `SELECT m.id FROM account_memberships m
          JOIN accounts a ON a.id=m.account_id
         WHERE m.user_id=$1 AND m.account_id=$2 AND m.role='OWNER'`,
        [userId, accountId],
      );
      return Boolean(result.rows[0]);
    },

    async readSubscription(accountId) {
      const result = await runtime.query<SubscriptionRow>(
        `SELECT s.id,s.account_id AS "accountId",s.state,s.state_revision AS "stateRevision",
                s.current_period_start AS "currentPeriodStart",s.current_period_end AS "currentPeriodEnd",
                s.grace_until AS "graceUntil",s.cancel_at_period_end AS "cancelAtPeriodEnd",
                s.bound_price_revision_id AS "boundPriceRevisionId",
                pr.id AS "planRevisionId",p.code AS "planCode",pr.revision AS "planRevision",pr.display_name AS "displayName",
                price.id AS "priceRevisionId",price.amount_minor AS "amountMinor",price.currency,
                price.billing_interval_unit AS "billingIntervalUnit",price.billing_interval_count AS "billingIntervalCount"
           FROM subscriptions s
           JOIN plan_revisions pr ON pr.id=s.current_plan_revision_id
           JOIN plans p ON p.id=pr.plan_id
           LEFT JOIN price_revisions price ON price.id=s.bound_price_revision_id
          WHERE s.account_id=$1 AND s.state <> 'EXPIRED'
          ORDER BY s.updated_at DESC,s.id DESC LIMIT 1`,
        [accountId],
      );
      const row = result.rows[0];
      if (!row) return null;
      if (
        row.boundPriceRevisionId &&
        (row.priceRevisionId === null ||
          row.amountMinor === null ||
          row.currency === null ||
          row.billingIntervalUnit === null ||
          row.billingIntervalCount === null)
      )
        throw new Error("COMMERCIAL_READ_CORRUPTED");
      const value: PortalSubscriptionRecord = {
        id: row.id,
        accountId: row.accountId,
        state: row.state,
        stateRevision: safeInteger(row.stateRevision),
        currentPeriodStart: new Date(row.currentPeriodStart),
        currentPeriodEnd: new Date(row.currentPeriodEnd),
        graceUntil: row.graceUntil ? new Date(row.graceUntil) : null,
        cancelAtPeriodEnd: row.cancelAtPeriodEnd,
        plan: {
          planRevisionId: row.planRevisionId,
          planCode: row.planCode,
          planRevision: safeInteger(row.planRevision),
          displayName: row.displayName,
        },
        price:
          row.priceRevisionId &&
          row.amountMinor !== null &&
          row.currency !== null &&
          row.billingIntervalUnit !== null &&
          row.billingIntervalCount !== null
            ? {
                priceRevisionId: row.priceRevisionId,
                amountMinor: safeInteger(row.amountMinor),
                currency: row.currency,
                billingIntervalUnit: row.billingIntervalUnit,
                billingIntervalCount: safeInteger(row.billingIntervalCount),
              }
            : null,
      };
      return value;
    },

    async countActiveDevices(accountId) {
      const result = await runtime.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM devices WHERE account_id=$1 AND status='ACTIVE'",
        [accountId],
      );
      return safeInteger(result.rows[0]?.count ?? "0");
    },

    async listPayments({ accountId, limit, cursor }) {
      let cursorRow: { createdAt: Date; id: string } | undefined;
      if (cursor) {
        const result = await runtime.query<{ createdAt: Date; id: string }>(
          `SELECT created_at AS "createdAt",id FROM payments WHERE id=$1 AND account_id=$2`,
          [cursor, accountId],
        );
        cursorRow = result.rows[0];
        if (!cursorRow) return { kind: "INVALID_CURSOR" as const };
      }
      const rows = await runtime.query<PaymentRow>(
        `SELECT pay.id,pay.state,pay.amount_minor AS "amountMinor",pay.currency,
                pay.price_revision_id AS "priceRevisionId",pr.revision AS "planRevision",
                p.code AS "planCode",pr.display_name AS "displayName",
                price.billing_interval_unit AS "billingIntervalUnit",
                price.billing_interval_count AS "billingIntervalCount",
                pay.created_at AS "createdAt",pay.confirmed_at AS "confirmedAt",
                (pay.subscription_id IS NOT NULL) AS "subscriptionLinked"
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
      const page = rows.rows.slice(0, limit).map(
        (row): PortalPaymentRecord => ({
          id: row.id,
          state: row.state,
          amountMinor: safeInteger(row.amountMinor),
          currency: row.currency,
          priceRevisionId: row.priceRevisionId,
          plan:
            row.planCode !== null &&
            row.planRevision !== null &&
            row.displayName !== null
              ? {
                  planCode: row.planCode,
                  planRevision: safeInteger(row.planRevision),
                  displayName: row.displayName,
                }
              : null,
          billingInterval:
            row.billingIntervalUnit !== null &&
            row.billingIntervalCount !== null
              ? {
                  unit: row.billingIntervalUnit,
                  count: safeInteger(row.billingIntervalCount),
                }
              : null,
          createdAt: new Date(row.createdAt),
          confirmedAt: row.confirmedAt ? new Date(row.confirmedAt) : null,
          subscriptionLinked: row.subscriptionLinked,
        }),
      );
      return {
        kind: "OK",
        payments: page,
        ...(rows.rows.length > limit && page.length
          ? { nextCursor: page.at(-1)!.id }
          : {}),
      };
    },
  };
}
