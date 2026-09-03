ALTER TABLE "device_authorizations" ADD COLUMN "exchange_idempotency_key_hash" varchar(128);
ALTER TABLE "device_authorizations" ADD COLUMN "exchange_replay_until" timestamp with time zone;
ALTER TABLE "device_authorizations" ADD COLUMN "exchanged_device_id" uuid REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "device_authorizations" ADD COLUMN "exchanged_session_id" uuid REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "device_authorizations" ADD CONSTRAINT "device_authorizations_p2_5_exchanged"
  CHECK (status <> 'EXCHANGED' OR (exchanged_at IS NOT NULL AND exchange_idempotency_key_hash IS NOT NULL AND exchange_replay_until IS NOT NULL AND exchanged_device_id IS NOT NULL AND exchanged_session_id IS NOT NULL AND start_secret_ciphertext IS NULL AND start_secret_nonce IS NULL AND start_secret_auth_tag IS NULL)) NOT VALID;
