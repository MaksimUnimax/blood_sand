ALTER TABLE "refresh_tokens" ADD COLUMN "rotation_idempotency_hash" varchar(128);
ALTER TABLE "refresh_tokens" ADD COLUMN "replay_expires_at" timestamp with time zone;
CREATE INDEX "refresh_tokens_rotation_replay_index"
  ON "refresh_tokens" ("rotation_idempotency_hash","replay_expires_at");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_p2_4_rotation_replay"
  CHECK (("rotation_idempotency_hash" IS NULL) = ("replay_expires_at" IS NULL)) NOT VALID;
