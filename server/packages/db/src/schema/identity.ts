import { sql } from "drizzle-orm";
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
} from "drizzle-orm/pg-core";

export const userStatus = pgEnum("user_status", ["ACTIVE", "SUSPENDED"]);
export const identityProvider = pgEnum("identity_provider", ["EMAIL"]);
export const accountStatus = pgEnum("account_status", ["ACTIVE", "SUSPENDED"]);
export const accountRole = pgEnum("account_role", ["OWNER"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: userStatus("status").notNull().default("ACTIVE"),
  ...timestamps,
});

export const userIdentities = pgTable(
  "user_identities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    provider: identityProvider("provider").notNull(),
    normalizedIdentifier: varchar("normalized_identifier", {
      length: 320,
    }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    unique("user_identities_provider_normalized_identifier_unique").on(
      table.provider,
      table.normalizedIdentifier,
    ),
  ],
);

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: accountStatus("status").notNull().default("ACTIVE"),
  displayName: varchar("display_name", { length: 256 }),
  ...timestamps,
});

export const accountMemberships = pgTable(
  "account_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    role: accountRole("role").notNull().default("OWNER"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("account_memberships_account_user_unique").on(
      table.accountId,
      table.userId,
    ),
  ],
);

export const otpPurpose = pgEnum("otp_purpose", ["LOGIN"]);

export const otpChallenges = pgTable(
  "otp_challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purpose: otpPurpose("purpose").notNull(),
    normalizedIdentityTarget: varchar("normalized_identity_target", {
      length: 320,
    }).notNull(),
    verificationHash: varchar("verification_hash", { length: 512 }).notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    invalidatedAt: timestamp("invalidated_at", { withTimezone: true }),
    invalidationReason: varchar("invalidation_reason", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("otp_challenges_normalized_identity_target_index").on(
      table.normalizedIdentityTarget,
    ),
    index("otp_challenges_expires_at_index").on(table.expiresAt),
    check(
      "otp_challenges_attempt_count_nonnegative",
      sql`${table.attemptCount} >= 0`,
    ),
    check(
      "otp_challenges_max_attempts_positive",
      sql`${table.maxAttempts} > 0`,
    ),
    check(
      "otp_challenges_attempt_count_within_max_attempts",
      sql`${table.attemptCount} <= ${table.maxAttempts}`,
    ),
  ],
);
