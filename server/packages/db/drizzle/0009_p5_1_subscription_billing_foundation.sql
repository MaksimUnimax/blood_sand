CREATE TYPE "subscription_state" AS ENUM ('TRIAL', 'ACTIVE', 'GRACE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'SUSPENDED');
CREATE TYPE "subscription_transition_source" AS ENUM ('CHECKOUT', 'WEBHOOK', 'RECONCILIATION', 'JOB', 'ADMIN', 'SYSTEM');
CREATE TYPE "payment_state" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'CHARGEBACK');
CREATE TYPE "billing_event_source" AS ENUM ('WEBHOOK', 'RECONCILIATION');
CREATE TYPE "billing_event_processing_state" AS ENUM ('VERIFIED', 'APPLIED', 'IGNORED', 'FAILED');
--> statement-breakpoint
CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL,
  "state" "subscription_state" NOT NULL,
  "state_revision" integer DEFAULT 1 NOT NULL,
  "current_plan_revision_id" uuid NOT NULL,
  "bound_price_revision_id" uuid,
  "started_at" timestamp with time zone NOT NULL,
  "current_period_start" timestamp with time zone NOT NULL,
  "current_period_end" timestamp with time zone NOT NULL,
  "grace_until" timestamp with time zone,
  "cancel_at_period_end" boolean DEFAULT false NOT NULL,
  "canceled_at" timestamp with time zone,
  "suspended_at" timestamp with time zone,
  "state_reason" varchar(512) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "subscriptions_state_revision_positive" CHECK ("state_revision" > 0),
  CONSTRAINT "subscriptions_period_order" CHECK ("current_period_end" > "current_period_start"),
  CONSTRAINT "subscriptions_started_before_period" CHECK ("started_at" <= "current_period_start"),
  CONSTRAINT "subscriptions_grace_after_period" CHECK ("grace_until" IS NULL OR "grace_until" > "current_period_end"),
  CONSTRAINT "subscriptions_canceled_after_start" CHECK ("canceled_at" IS NULL OR "canceled_at" >= "started_at"),
  CONSTRAINT "subscriptions_suspended_after_start" CHECK ("suspended_at" IS NULL OR "suspended_at" >= "started_at"),
  CONSTRAINT "subscriptions_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "subscriptions_state_reason_nonempty" CHECK (char_length(btrim("state_reason")) > 0)
);
--> statement-breakpoint
CREATE TABLE "subscription_transitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "subscription_id" uuid NOT NULL,
  "transition_revision" integer NOT NULL,
  "from_state" "subscription_state",
  "to_state" "subscription_state" NOT NULL,
  "source" "subscription_transition_source" NOT NULL,
  "source_event_id" varchar(256),
  "actor_type" varchar(64),
  "actor_id" uuid,
  "reason" varchar(512) NOT NULL,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "subscription_transitions_subscription_revision_unique" UNIQUE("subscription_id", "transition_revision"),
  CONSTRAINT "subscription_transitions_revision_positive" CHECK ("transition_revision" > 0),
  CONSTRAINT "subscription_transitions_revision_origin" CHECK (("transition_revision" = 1 AND "from_state" IS NULL) OR ("transition_revision" > 1 AND "from_state" IS NOT NULL)),
  CONSTRAINT "subscription_transitions_state_changes" CHECK ("from_state" IS NULL OR "from_state" <> "to_state"),
  CONSTRAINT "subscription_transitions_reason_nonempty" CHECK (char_length(btrim("reason")) > 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL,
  "subscription_id" uuid,
  "provider" varchar(64) NOT NULL,
  "provider_payment_id" varchar(256) NOT NULL,
  "price_revision_id" uuid NOT NULL,
  "amount_minor" bigint NOT NULL,
  "currency" varchar(3) NOT NULL,
  "state" "payment_state" NOT NULL,
  "idempotency_key_hash" varchar(64) NOT NULL,
  "request_fingerprint_sha256" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "confirmed_at" timestamp with time zone,
  CONSTRAINT "payments_provider_payment_unique" UNIQUE("provider", "provider_payment_id"),
  CONSTRAINT "payments_account_idempotency_unique" UNIQUE("account_id", "idempotency_key_hash"),
  CONSTRAINT "payments_provider_format" CHECK ("provider" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "payments_provider_payment_id_nonempty" CHECK ("provider_payment_id" ~ '[^[:space:]]'),
  CONSTRAINT "payments_amount_minor_safe_range" CHECK ("amount_minor" BETWEEN 0 AND 9007199254740991),
  CONSTRAINT "payments_currency_format" CHECK ("currency" ~ '^[A-Z]{3}$'),
  CONSTRAINT "payments_idempotency_hash_format" CHECK ("idempotency_key_hash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "payments_request_fingerprint_format" CHECK ("request_fingerprint_sha256" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "payments_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "payments_confirmed_after_created" CHECK ("confirmed_at" IS NULL OR "confirmed_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "billing_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider" varchar(64) NOT NULL,
  "source" "billing_event_source" NOT NULL,
  "event_identity" varchar(256) NOT NULL,
  "event_type" varchar(128) NOT NULL,
  "payload_sha256" varchar(64) NOT NULL,
  "processing_state" "billing_event_processing_state" DEFAULT 'VERIFIED' NOT NULL,
  "received_at" timestamp with time zone NOT NULL,
  "verified_at" timestamp with time zone NOT NULL,
  "processed_at" timestamp with time zone,
  "payment_id" uuid,
  "subscription_id" uuid,
  "subscription_transition_id" uuid,
  "failure_code" varchar(128),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "billing_events_provider_identity_unique" UNIQUE("provider", "event_identity"),
  CONSTRAINT "billing_events_provider_format" CHECK ("provider" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "billing_events_event_identity_nonempty" CHECK ("event_identity" ~ '[^[:space:]]'),
  CONSTRAINT "billing_events_event_type_nonempty" CHECK ("event_type" ~ '[^[:space:]]'),
  CONSTRAINT "billing_events_payload_sha256_format" CHECK ("payload_sha256" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "billing_events_failure_code_nonempty" CHECK ("failure_code" IS NULL OR "failure_code" ~ '[^[:space:]]'),
  CONSTRAINT "billing_events_verified_after_received" CHECK ("verified_at" >= "received_at"),
  CONSTRAINT "billing_events_processed_after_verified" CHECK ("processed_at" IS NULL OR "processed_at" >= "verified_at")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_current_plan_revision_id_fk" FOREIGN KEY ("current_plan_revision_id") REFERENCES "plan_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_bound_price_revision_id_fk" FOREIGN KEY ("bound_price_revision_id") REFERENCES "price_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "subscription_transitions" ADD CONSTRAINT "subscription_transitions_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "payments" ADD CONSTRAINT "payments_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "payments" ADD CONSTRAINT "payments_price_revision_id_fk" FOREIGN KEY ("price_revision_id") REFERENCES "price_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_subscription_transition_id_fk" FOREIGN KEY ("subscription_transition_id") REFERENCES "subscription_transitions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_one_current_per_account" ON "subscriptions" USING btree ("account_id") WHERE "state" <> 'EXPIRED';
CREATE INDEX "subscriptions_plan_revision_index" ON "subscriptions" USING btree ("current_plan_revision_id");
CREATE INDEX "subscription_transitions_subscription_index" ON "subscription_transitions" USING btree ("subscription_id");
CREATE INDEX "payments_account_index" ON "payments" USING btree ("account_id");
CREATE INDEX "payments_subscription_index" ON "payments" USING btree ("subscription_id");
CREATE INDEX "billing_events_payment_index" ON "billing_events" USING btree ("payment_id");
CREATE INDEX "billing_events_subscription_index" ON "billing_events" USING btree ("subscription_id");
--> statement-breakpoint
CREATE FUNCTION p5_1_subscription_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  current_plan_id uuid;
  current_plan_state plan_revision_state;
  bound_plan_id uuid;
  bound_price_state price_revision_state;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P5.1 subscriptions cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    OLD.id IS DISTINCT FROM NEW.id
    OR OLD.account_id IS DISTINCT FROM NEW.account_id
    OR OLD.created_at IS DISTINCT FROM NEW.created_at
  ) THEN
    RAISE EXCEPTION 'P5.1 subscription identity is immutable' USING ERRCODE = '55000';
  END IF;

  SELECT plan_id, state INTO current_plan_id, current_plan_state
  FROM plan_revisions WHERE id = NEW.current_plan_revision_id;
  IF current_plan_state IS DISTINCT FROM 'PUBLISHED' THEN
    RAISE EXCEPTION 'P5.1 subscription requires a published plan revision' USING ERRCODE = '23514';
  END IF;

  IF NEW.bound_price_revision_id IS NOT NULL THEN
    SELECT pr.state, p.plan_id INTO bound_price_state, bound_plan_id
    FROM price_revisions pr
    JOIN prices p ON p.id = pr.price_id
    WHERE pr.id = NEW.bound_price_revision_id;
    IF bound_price_state IS DISTINCT FROM 'PUBLISHED' THEN
      RAISE EXCEPTION 'P5.1 subscription requires a published bound price revision' USING ERRCODE = '23514';
    END IF;
    IF bound_plan_id IS DISTINCT FROM current_plan_id THEN
      RAISE EXCEPTION 'P5.1 subscription price crosses stable plan identity' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p5_1_subscription_transition_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'P5.1 subscription transitions are append-only' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p5_1_payment_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  price_state price_revision_state;
  price_amount bigint;
  price_currency varchar(3);
  subscription_account_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P5.1 payments cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    OLD.id IS DISTINCT FROM NEW.id
    OR OLD.account_id IS DISTINCT FROM NEW.account_id
    OR OLD.provider IS DISTINCT FROM NEW.provider
    OR OLD.provider_payment_id IS DISTINCT FROM NEW.provider_payment_id
    OR OLD.price_revision_id IS DISTINCT FROM NEW.price_revision_id
    OR OLD.amount_minor IS DISTINCT FROM NEW.amount_minor
    OR OLD.currency IS DISTINCT FROM NEW.currency
    OR OLD.idempotency_key_hash IS DISTINCT FROM NEW.idempotency_key_hash
    OR OLD.request_fingerprint_sha256 IS DISTINCT FROM NEW.request_fingerprint_sha256
    OR OLD.created_at IS DISTINCT FROM NEW.created_at
  ) THEN
    RAISE EXCEPTION 'P5.1 payment commercial identity is immutable' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.subscription_id IS NOT NULL
     AND NEW.subscription_id IS DISTINCT FROM OLD.subscription_id THEN
    RAISE EXCEPTION 'P5.1 payment subscription link is set-once' USING ERRCODE = '55000';
  END IF;

  SELECT state, amount_minor, currency INTO price_state, price_amount, price_currency
  FROM price_revisions WHERE id = NEW.price_revision_id;
  IF price_state IS DISTINCT FROM 'PUBLISHED' THEN
    RAISE EXCEPTION 'P5.1 payment requires a published price revision' USING ERRCODE = '23514';
  END IF;
  IF NEW.amount_minor IS DISTINCT FROM price_amount OR NEW.currency IS DISTINCT FROM price_currency THEN
    RAISE EXCEPTION 'P5.1 payment terms must equal the immutable price revision' USING ERRCODE = '23514';
  END IF;

  IF NEW.subscription_id IS NOT NULL THEN
    SELECT account_id INTO subscription_account_id FROM subscriptions WHERE id = NEW.subscription_id;
    IF subscription_account_id IS DISTINCT FROM NEW.account_id THEN
      RAISE EXCEPTION 'P5.1 payment subscription must belong to the same account' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p5_1_billing_event_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  transition_subscription_id uuid;
  payment_account_id uuid;
  subscription_account_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P5.1 billing events cannot be deleted' USING ERRCODE = '55000';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.processing_state <> 'VERIFIED'
       OR NEW.processed_at IS NOT NULL
       OR NEW.failure_code IS NOT NULL
       OR NEW.payment_id IS NOT NULL
       OR NEW.subscription_id IS NOT NULL
       OR NEW.subscription_transition_id IS NOT NULL THEN
      RAISE EXCEPTION 'P5.1 billing events must be inserted as unprocessed VERIFIED rows' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.processing_state <> 'VERIFIED' THEN
    RAISE EXCEPTION 'P5.1 terminal billing events are immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.id IS DISTINCT FROM NEW.id
     OR OLD.provider IS DISTINCT FROM NEW.provider
     OR OLD.source IS DISTINCT FROM NEW.source
     OR OLD.event_identity IS DISTINCT FROM NEW.event_identity
     OR OLD.event_type IS DISTINCT FROM NEW.event_type
     OR OLD.payload_sha256 IS DISTINCT FROM NEW.payload_sha256
     OR OLD.received_at IS DISTINCT FROM NEW.received_at
     OR OLD.verified_at IS DISTINCT FROM NEW.verified_at
     OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'P5.1 billing event identity/content is immutable' USING ERRCODE = '55000';
  END IF;
  IF NEW.processing_state NOT IN ('APPLIED', 'IGNORED', 'FAILED') OR NEW.processed_at IS NULL THEN
    RAISE EXCEPTION 'P5.1 billing events allow only VERIFIED to terminal transitions' USING ERRCODE = '23514';
  END IF;
  IF NEW.processing_state = 'FAILED' AND (NEW.failure_code IS NULL OR NEW.failure_code !~ '[^[:space:]]') THEN
    RAISE EXCEPTION 'P5.1 FAILED billing events require a failure code' USING ERRCODE = '23514';
  END IF;
  IF NEW.processing_state IN ('APPLIED', 'IGNORED') AND NEW.failure_code IS NOT NULL THEN
    RAISE EXCEPTION 'P5.1 APPLIED/IGNORED billing events cannot have a failure code' USING ERRCODE = '23514';
  END IF;

  IF NEW.subscription_transition_id IS NOT NULL THEN
    IF NEW.subscription_id IS NULL THEN
      RAISE EXCEPTION 'P5.1 transition reference requires a subscription reference' USING ERRCODE = '23514';
    END IF;
    SELECT subscription_id INTO transition_subscription_id
    FROM subscription_transitions WHERE id = NEW.subscription_transition_id;
    IF transition_subscription_id IS DISTINCT FROM NEW.subscription_id THEN
      RAISE EXCEPTION 'P5.1 transition reference must match event subscription' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW.payment_id IS NOT NULL AND NEW.subscription_id IS NOT NULL THEN
    SELECT account_id INTO payment_account_id FROM payments WHERE id = NEW.payment_id;
    SELECT account_id INTO subscription_account_id FROM subscriptions WHERE id = NEW.subscription_id;
    IF payment_account_id IS DISTINCT FROM subscription_account_id THEN
      RAISE EXCEPTION 'P5.1 billing event payment and subscription must share an account' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p5_1_subscription_guard
  BEFORE INSERT OR UPDATE OR DELETE ON "subscriptions"
  FOR EACH ROW EXECUTE FUNCTION p5_1_subscription_guard();
CREATE TRIGGER p5_1_subscription_transition_append_only
  BEFORE INSERT OR UPDATE OR DELETE ON "subscription_transitions"
  FOR EACH ROW EXECUTE FUNCTION p5_1_subscription_transition_guard();
CREATE TRIGGER p5_1_payment_guard
  BEFORE INSERT OR UPDATE OR DELETE ON "payments"
  FOR EACH ROW EXECUTE FUNCTION p5_1_payment_guard();
CREATE TRIGGER p5_1_billing_event_guard
  BEFORE INSERT OR UPDATE OR DELETE ON "billing_events"
  FOR EACH ROW EXECUTE FUNCTION p5_1_billing_event_guard();
