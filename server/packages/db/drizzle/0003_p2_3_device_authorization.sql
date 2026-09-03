ALTER TABLE "device_authorizations" ADD COLUMN "idempotency_key_hash" varchar(128);
ALTER TABLE "device_authorizations" ADD COLUMN "request_fingerprint" varchar(128);
ALTER TABLE "device_authorizations" ADD COLUMN "start_secret_ciphertext" bytea;
ALTER TABLE "device_authorizations" ADD COLUMN "start_secret_nonce" bytea;
ALTER TABLE "device_authorizations" ADD COLUMN "start_secret_auth_tag" bytea;
ALTER TABLE "device_authorizations" ADD COLUMN "expired_at" timestamp with time zone;

CREATE UNIQUE INDEX "device_authorizations_idempotency_key_hash_unique"
  ON "device_authorizations" ("idempotency_key_hash") WHERE "idempotency_key_hash" IS NOT NULL;

ALTER TABLE "device_authorizations" ADD CONSTRAINT "device_authorizations_browser_extension_client"
  CHECK ("requested_client_type" = 'browser_extension') NOT VALID;
ALTER TABLE "device_authorizations" ADD CONSTRAINT "device_authorizations_p2_3_secret_state"
  CHECK (
    "idempotency_key_hash" IS NULL OR
    (("status" IN ('PENDING','APPROVED')) = ("start_secret_ciphertext" IS NOT NULL AND "start_secret_nonce" IS NOT NULL AND "start_secret_auth_tag" IS NOT NULL))
  ) NOT VALID;
ALTER TABLE "device_authorizations" ADD CONSTRAINT "device_authorizations_p2_3_fingerprint"
  CHECK ("idempotency_key_hash" IS NULL OR "request_fingerprint" IS NOT NULL) NOT VALID;
