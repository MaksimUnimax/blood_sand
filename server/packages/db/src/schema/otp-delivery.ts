import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
  customType,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { otpChallenges } from "./identity";
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

export const authRateLimitBuckets = pgTable(
  "auth_rate_limit_buckets",
  {
    action: varchar("action", { length: 64 }).notNull(),
    keyHash: varchar("key_hash", { length: 128 }).notNull(),
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
    }).notNull(),
    count: integer("count").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("auth_rate_limit_buckets_action_key_hash_unique").on(
      t.action,
      t.keyHash,
    ),
    check("auth_rate_limit_buckets_count_nonnegative", sql`${t.count} >= 0`),
  ],
);

export const otpEmailJobStatus = pgEnum("otp_email_job_status", [
  "PENDING",
  "PROCESSING",
  "SENT",
  "DEAD",
]);
export const otpEmailJobs = pgTable(
  "otp_email_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => otpChallenges.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    status: otpEmailJobStatus("status").notNull().default("PENDING"),
    ciphertext: bytea("ciphertext"),
    nonce: bytea("nonce"),
    authTag: bytea("auth_tag"),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull(),
    availableAt: timestamp("available_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    leaseId: uuid("lease_id"),
    leasedUntil: timestamp("leased_until", { withTimezone: true }),
    lastErrorCode: varchar("last_error_code", { length: 128 }),
    providerMessageId: varchar("provider_message_id", { length: 512 }),
    correlationId: varchar("correlation_id", { length: 128 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [
    unique("otp_email_jobs_challenge_id_unique").on(t.challengeId),
    index("otp_email_jobs_claim_index").on(
      t.status,
      t.availableAt,
      t.leasedUntil,
    ),
    check(
      "otp_email_jobs_attempt_count_nonnegative",
      sql`${t.attemptCount} >= 0`,
    ),
    check("otp_email_jobs_max_attempts_positive", sql`${t.maxAttempts} > 0`),
    check(
      "otp_email_jobs_attempt_count_within_max_attempts",
      sql`${t.attemptCount} <= ${t.maxAttempts}`,
    ),
  ],
);
