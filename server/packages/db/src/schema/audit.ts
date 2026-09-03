import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorType: varchar("actor_type", { length: 64 }).notNull(),
    actorId: uuid("actor_id"),
    action: varchar("action", { length: 128 }).notNull(),
    targetType: varchar("target_type", { length: 64 }).notNull(),
    targetId: uuid("target_id"),
    correlationId: varchar("correlation_id", { length: 128 }).notNull(),
    reason: varchar("reason", { length: 512 }),
    safeMetadata: jsonb("safe_metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_events_actor_type_actor_id_index").on(
      table.actorType,
      table.actorId,
    ),
    index("audit_events_target_type_target_id_index").on(
      table.targetType,
      table.targetId,
    ),
    index("audit_events_created_at_index").on(table.createdAt),
  ],
);
