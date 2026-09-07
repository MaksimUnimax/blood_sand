CREATE TYPE "checkout_intent_state" AS ENUM ('CREATING', 'READY', 'FAILED');
--> statement-breakpoint
CREATE TABLE "checkout_intents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL,
  "price_revision_id" uuid NOT NULL,
  "plan_revision_id" uuid NOT NULL,
  "provider" varchar(64) NOT NULL,
  "state" "checkout_intent_state" NOT NULL,
  "idempotency_key_hash" varchar(64) NOT NULL,
  "request_fingerprint_sha256" varchar(64) NOT NULL,
  "admitted_at" timestamp with time zone NOT NULL,
  "amount_minor" bigint NOT NULL,
  "currency" varchar(3) NOT NULL,
  "billing_interval_unit" "billing_interval_unit" NOT NULL,
  "billing_interval_count" integer NOT NULL,
  "provider_checkout_id" varchar(256),
  "provider_payment_id" varchar(256),
  "checkout_reference" varchar(256),
  "payment_id" uuid,
  "failure_code" varchar(128),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone,
  CONSTRAINT "checkout_intents_account_idempotency_unique" UNIQUE("account_id", "idempotency_key_hash"),
  CONSTRAINT "checkout_intents_provider_format" CHECK ("provider" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "checkout_intents_idempotency_hash_format" CHECK ("idempotency_key_hash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "checkout_intents_request_fingerprint_format" CHECK ("request_fingerprint_sha256" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "checkout_intents_amount_minor_safe_range" CHECK ("amount_minor" BETWEEN 0 AND 9007199254740991),
  CONSTRAINT "checkout_intents_currency_format" CHECK ("currency" ~ '^[A-Z]{3}$'),
  CONSTRAINT "checkout_intents_interval_count_range" CHECK ("billing_interval_count" BETWEEN 1 AND 1200),
  CONSTRAINT "checkout_intents_provider_checkout_opaque" CHECK ("provider_checkout_id" IS NULL OR ("provider_checkout_id" ~ '^[A-Za-z0-9._:-]+$' AND "provider_checkout_id" !~* '^https?:')),
  CONSTRAINT "checkout_intents_provider_payment_opaque" CHECK ("provider_payment_id" IS NULL OR ("provider_payment_id" ~ '^[A-Za-z0-9._:-]+$' AND "provider_payment_id" !~* '^https?:')),
  CONSTRAINT "checkout_intents_reference_opaque" CHECK ("checkout_reference" IS NULL OR ("checkout_reference" ~ '^[A-Za-z0-9._:-]+$' AND "checkout_reference" !~* '^https?:')),
  CONSTRAINT "checkout_intents_failure_code_safe" CHECK ("failure_code" IS NULL OR "failure_code" ~ '^[A-Z][A-Z0-9_]{0,127}$'),
  CONSTRAINT "checkout_intents_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "checkout_intents_completed_after_admitted" CHECK ("completed_at" IS NULL OR "completed_at" >= "admitted_at")
);
--> statement-breakpoint
ALTER TABLE "checkout_intents" ADD CONSTRAINT "checkout_intents_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "checkout_intents" ADD CONSTRAINT "checkout_intents_price_revision_id_fk" FOREIGN KEY ("price_revision_id") REFERENCES "price_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "checkout_intents" ADD CONSTRAINT "checkout_intents_plan_revision_id_fk" FOREIGN KEY ("plan_revision_id") REFERENCES "plan_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "checkout_intents" ADD CONSTRAINT "checkout_intents_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_intents_provider_checkout_unique" ON "checkout_intents" USING btree ("provider", "provider_checkout_id") WHERE "provider_checkout_id" IS NOT NULL;
CREATE UNIQUE INDEX "checkout_intents_provider_payment_unique" ON "checkout_intents" USING btree ("provider", "provider_payment_id") WHERE "provider_payment_id" IS NOT NULL;
CREATE UNIQUE INDEX "checkout_intents_payment_unique" ON "checkout_intents" USING btree ("payment_id") WHERE "payment_id" IS NOT NULL;
-- P5.3 V2 physical admission defence: one in-flight new-sale checkout/account.
CREATE UNIQUE INDEX "checkout_intents_one_creating_per_account_unique" ON "checkout_intents" USING btree ("account_id") WHERE "state" = 'CREATING';
CREATE INDEX "checkout_intents_account_index" ON "checkout_intents" USING btree ("account_id");
CREATE INDEX "checkout_intents_price_revision_index" ON "checkout_intents" USING btree ("price_revision_id");
--> statement-breakpoint
CREATE FUNCTION p5_3_checkout_intent_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  revision_plan_id uuid;
  revision_state price_revision_state;
  revision_amount bigint;
  revision_currency varchar(3);
  revision_interval billing_interval_unit;
  revision_interval_count integer;
  revision_from timestamptz;
  revision_to timestamptz;
  plan_state plan_revision_state;
  payment_state_value payment_state;
  payment_account_id uuid;
  payment_provider varchar(64);
  payment_provider_id varchar(256);
  payment_price_id uuid;
  payment_amount bigint;
  payment_currency varchar(3);
  payment_idempotency varchar(64);
  payment_fingerprint varchar(64);
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P5.3 checkout intents cannot be deleted' USING ERRCODE = '55000';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.state <> 'CREATING' OR NEW.provider_checkout_id IS NOT NULL
       OR NEW.provider_payment_id IS NOT NULL OR NEW.checkout_reference IS NOT NULL
       OR NEW.payment_id IS NOT NULL OR NEW.failure_code IS NOT NULL
       OR NEW.completed_at IS NOT NULL THEN
      RAISE EXCEPTION 'P5.3 checkout intents must start as CREATING' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF OLD.id IS DISTINCT FROM NEW.id
       OR OLD.account_id IS DISTINCT FROM NEW.account_id
       OR OLD.price_revision_id IS DISTINCT FROM NEW.price_revision_id
       OR OLD.plan_revision_id IS DISTINCT FROM NEW.plan_revision_id
       OR OLD.provider IS DISTINCT FROM NEW.provider
       OR OLD.idempotency_key_hash IS DISTINCT FROM NEW.idempotency_key_hash
       OR OLD.request_fingerprint_sha256 IS DISTINCT FROM NEW.request_fingerprint_sha256
       OR OLD.admitted_at IS DISTINCT FROM NEW.admitted_at
       OR OLD.amount_minor IS DISTINCT FROM NEW.amount_minor
       OR OLD.currency IS DISTINCT FROM NEW.currency
       OR OLD.billing_interval_unit IS DISTINCT FROM NEW.billing_interval_unit
       OR OLD.billing_interval_count IS DISTINCT FROM NEW.billing_interval_count
       OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'P5.3 checkout intent identity/snapshot is immutable' USING ERRCODE = '55000';
    END IF;
    IF OLD.state <> 'CREATING' THEN
      RAISE EXCEPTION 'P5.3 terminal checkout intents are immutable' USING ERRCODE = '55000';
    END IF;
    IF NEW.state NOT IN ('READY', 'FAILED') THEN
      RAISE EXCEPTION 'P5.3 checkout intents allow only CREATING to terminal transitions' USING ERRCODE = '23514';
    END IF;
  END IF;

  SELECT r.plan_revision_id,r.state,r.amount_minor,r.currency,r.billing_interval_unit,
         r.billing_interval_count,r.effective_from,r.effective_to,pr.state
    INTO revision_plan_id,revision_state,revision_amount,revision_currency,revision_interval,
         revision_interval_count,revision_from,revision_to,plan_state
    FROM price_revisions r
    JOIN plan_revisions pr ON pr.id=r.plan_revision_id
   WHERE r.id=NEW.price_revision_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'P5.3 checkout intent price revision missing' USING ERRCODE = '23514';
  END IF;
  IF revision_state <> 'PUBLISHED' OR plan_state <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'P5.3 checkout intent requires published revisions' USING ERRCODE = '23514';
  END IF;
  IF revision_plan_id IS DISTINCT FROM NEW.plan_revision_id THEN
    RAISE EXCEPTION 'P5.3 checkout intent plan revision mismatch' USING ERRCODE = '23514';
  END IF;
  IF revision_amount IS DISTINCT FROM NEW.amount_minor OR revision_currency IS DISTINCT FROM NEW.currency
     OR revision_interval IS DISTINCT FROM NEW.billing_interval_unit
     OR revision_interval_count IS DISTINCT FROM NEW.billing_interval_count THEN
    RAISE EXCEPTION 'P5.3 checkout intent terms must equal price revision' USING ERRCODE = '23514';
  END IF;
  IF revision_from > NEW.admitted_at OR (revision_to IS NOT NULL AND NEW.admitted_at >= revision_to) THEN
    RAISE EXCEPTION 'P5.3 checkout intent admitted outside price window' USING ERRCODE = '23514';
  END IF;

  IF NEW.state = 'FAILED' THEN
    IF NEW.failure_code IS NULL OR NEW.completed_at IS NULL OR NEW.payment_id IS NOT NULL
       OR NEW.provider_checkout_id IS NOT NULL OR NEW.provider_payment_id IS NOT NULL
       OR NEW.checkout_reference IS NOT NULL THEN
      RAISE EXCEPTION 'P5.3 FAILED checkout shape is invalid' USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.state = 'READY' THEN
    IF NEW.provider_checkout_id IS NULL OR NEW.provider_payment_id IS NULL
       OR NEW.checkout_reference IS NULL OR NEW.payment_id IS NULL
       OR NEW.failure_code IS NOT NULL OR NEW.completed_at IS NULL THEN
      RAISE EXCEPTION 'P5.3 READY checkout shape is invalid' USING ERRCODE = '23514';
    END IF;
    SELECT p.state,p.account_id,p.provider,p.provider_payment_id,p.price_revision_id,
           p.amount_minor,p.currency,p.idempotency_key_hash,p.request_fingerprint_sha256
      INTO payment_state_value,payment_account_id,payment_provider,payment_provider_id,
           payment_price_id,payment_amount,payment_currency,payment_idempotency,payment_fingerprint
      FROM payments p WHERE p.id=NEW.payment_id;
    IF NOT FOUND OR payment_state_value <> 'PENDING'
       OR payment_account_id IS DISTINCT FROM NEW.account_id
       OR payment_provider IS DISTINCT FROM NEW.provider
       OR payment_provider_id IS DISTINCT FROM NEW.provider_payment_id
       OR payment_price_id IS DISTINCT FROM NEW.price_revision_id
       OR payment_amount IS DISTINCT FROM NEW.amount_minor
       OR payment_currency IS DISTINCT FROM NEW.currency
       OR payment_idempotency IS DISTINCT FROM NEW.idempotency_key_hash
       OR payment_fingerprint IS DISTINCT FROM NEW.request_fingerprint_sha256 THEN
      RAISE EXCEPTION 'P5.3 READY checkout payment identity mismatch' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p5_3_checkout_intent_guard
  BEFORE INSERT OR UPDATE OR DELETE ON "checkout_intents"
  FOR EACH ROW EXECUTE FUNCTION p5_3_checkout_intent_guard();
