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
import { portalSessions } from "./auth";
import { users } from "./identity";

export const adminPrincipalStatus = pgEnum("admin_principal_status", [
  "ACTIVE",
  "SUSPENDED",
]);
export const adminRole = pgEnum("admin_role", [
  "ADMIN_OWNER",
  "ADMIN_OPS",
  "ADMIN_SUPPORT",
  "ADMIN_BILLING_READONLY",
]);

export const adminPrincipals = pgTable(
  "admin_principals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    status: adminPrincipalStatus("status").notNull().default("ACTIVE"),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("admin_principals_user_id_unique").on(table.userId),
    check("admin_principals_revision_positive", sql`${table.revision} > 0`),
    index("admin_principals_status_index").on(table.status),
  ],
);

export const adminRoleGrants = pgTable(
  "admin_role_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminPrincipalId: uuid("admin_principal_id")
      .notNull()
      .references(() => adminPrincipals.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    role: adminRole("role").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    grantedByAdminPrincipalId: uuid("granted_by_admin_principal_id").references(
      () => adminPrincipals.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedByAdminPrincipalId: uuid("revoked_by_admin_principal_id").references(
      () => adminPrincipals.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
  },
  (table) => [
    index("admin_role_grants_principal_index").on(table.adminPrincipalId),
    unique("admin_role_grants_active_principal_role_unique").on(
      table.adminPrincipalId,
      table.role,
    ),
  ],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminPrincipalId: uuid("admin_principal_id")
      .notNull()
      .references(() => adminPrincipals.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    sourcePortalSessionId: uuid("source_portal_session_id")
      .notNull()
      .references(() => portalSessions.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    sessionTokenHash: varchar("session_token_hash", { length: 128 })
      .notNull()
      .unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokeReason: varchar("revoke_reason", { length: 128 }),
  },
  (table) => [
    index("admin_sessions_principal_index").on(table.adminPrincipalId),
    index("admin_sessions_source_portal_session_index").on(
      table.sourcePortalSessionId,
    ),
    check(
      "admin_sessions_expiry_after_creation",
      sql`${table.expiresAt} > ${table.createdAt}`,
    ),
    check(
      "admin_sessions_revoke_shape",
      sql`(${table.revokedAt} IS NULL AND ${table.revokeReason} IS NULL) OR (${table.revokedAt} IS NOT NULL AND ${table.revokeReason} IS NOT NULL)`,
    ),
  ],
);
