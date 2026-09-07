import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { payments } from "./billing";

export const billingReconciliationJobs = pgTable(
  "billing_reconciliation_jobs",
  {
    paymentId: uuid("payment_id")
      .primaryKey()
      .references(() => payments.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    state: varchar("state", { length: 16 }).notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    leaseToken: uuid("lease_token"),
    leaseUntil: timestamp("lease_until", { withTimezone: true }),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastResultCode: varchar("last_result_code", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "billing_reconciliation_jobs_state_safe",
      sql`${table.state} IN ('READY','LEASED','SETTLED','BLOCKED')`,
    ),
    check(
      "billing_reconciliation_jobs_attempt_nonnegative",
      sql`${table.attemptCount} >= 0`,
    ),
    check(
      "billing_reconciliation_jobs_updated_after_created",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
    check(
      "billing_reconciliation_jobs_result_code_safe",
      sql`${table.lastResultCode} IS NULL OR ${table.lastResultCode} ~ '^[A-Z][A-Z0-9_]{0,127}$'`,
    ),
    index("billing_reconciliation_jobs_due_index").on(
      table.state,
      table.nextAttemptAt,
    ),
  ],
);
