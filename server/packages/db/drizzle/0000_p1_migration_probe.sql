-- P1 infrastructure-only migration lifecycle probe. It deliberately leaves no table behind.
CREATE TABLE "__p1_migration_probe" (
  "id" integer PRIMARY KEY
);
--> statement-breakpoint
DROP TABLE "__p1_migration_probe";
