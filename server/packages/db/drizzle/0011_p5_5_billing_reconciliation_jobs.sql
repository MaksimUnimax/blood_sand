CREATE TABLE "billing_reconciliation_jobs" (
  "payment_id" uuid PRIMARY KEY,
  "state" varchar(16) NOT NULL,
  "next_attempt_at" timestamp with time zone,
  "lease_token" uuid,
  "lease_until" timestamp with time zone,
  "attempt_count" integer DEFAULT 0 NOT NULL,
  "last_result_code" varchar(128),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "billing_reconciliation_jobs_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "billing_reconciliation_jobs_state_safe" CHECK ("state" IN ('READY','LEASED','SETTLED','BLOCKED')),
  CONSTRAINT "billing_reconciliation_jobs_attempt_nonnegative" CHECK ("attempt_count" >= 0),
  CONSTRAINT "billing_reconciliation_jobs_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "billing_reconciliation_jobs_result_code_safe" CHECK ("last_result_code" IS NULL OR "last_result_code" ~ '^[A-Z][A-Z0-9_]{0,127}$'),
  CONSTRAINT "billing_reconciliation_jobs_ready_shape" CHECK ("state" <> 'READY' OR ("next_attempt_at" IS NOT NULL AND "lease_token" IS NULL AND "lease_until" IS NULL)),
  CONSTRAINT "billing_reconciliation_jobs_leased_shape" CHECK ("state" <> 'LEASED' OR ("next_attempt_at" IS NULL AND "lease_token" IS NOT NULL AND "lease_until" IS NOT NULL)),
  CONSTRAINT "billing_reconciliation_jobs_terminal_shape" CHECK ("state" NOT IN ('SETTLED','BLOCKED') OR ("next_attempt_at" IS NULL AND "lease_token" IS NULL AND "lease_until" IS NULL))
);
--> statement-breakpoint
CREATE INDEX "billing_reconciliation_jobs_due_index" ON "billing_reconciliation_jobs" USING btree ("state", "next_attempt_at");
--> statement-breakpoint
CREATE FUNCTION p5_5_reconciliation_job_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P5.5 reconciliation jobs cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.attempt_count < 0 THEN RAISE EXCEPTION 'P5.5 attempt count invalid' USING ERRCODE = '23514'; END IF;
  ELSE
    IF OLD.payment_id IS DISTINCT FROM NEW.payment_id OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'P5.5 reconciliation job identity is immutable' USING ERRCODE = '55000';
    END IF;
    IF OLD.state IN ('SETTLED','BLOCKED') THEN
      RAISE EXCEPTION 'P5.5 terminal reconciliation jobs are immutable' USING ERRCODE = '55000';
    END IF;
    IF NEW.attempt_count < OLD.attempt_count THEN
      RAISE EXCEPTION 'P5.5 attempt count cannot decrease' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW.updated_at < NEW.created_at THEN RAISE EXCEPTION 'P5.5 timestamps invalid' USING ERRCODE = '23514'; END IF;
  IF NEW.last_result_code IS NOT NULL AND NEW.last_result_code !~ '^[A-Z][A-Z0-9_]{0,127}$' THEN
    RAISE EXCEPTION 'P5.5 result code invalid' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p5_5_reconciliation_job_guard
  BEFORE INSERT OR UPDATE OR DELETE ON "billing_reconciliation_jobs"
  FOR EACH ROW EXECUTE FUNCTION p5_5_reconciliation_job_guard();
--> statement-breakpoint
INSERT INTO "billing_reconciliation_jobs"
  (payment_id,state,next_attempt_at,last_result_code,created_at,updated_at)
SELECT p.id,
       CASE
         WHEN p.state IN ('REFUNDED','CHARGEBACK') THEN 'BLOCKED'
         WHEN p.state = 'SUCCEEDED' AND p.subscription_id IS NOT NULL
              AND EXISTS (SELECT 1 FROM subscriptions s WHERE s.id=p.subscription_id AND s.account_id=p.account_id) THEN 'SETTLED'
         ELSE 'READY'
       END,
       CASE
         WHEN p.state IN ('REFUNDED','CHARGEBACK') THEN NULL
         WHEN p.state = 'SUCCEEDED' AND p.subscription_id IS NOT NULL
              AND EXISTS (SELECT 1 FROM subscriptions s WHERE s.id=p.subscription_id AND s.account_id=p.account_id) THEN NULL
         ELSE CURRENT_TIMESTAMP
       END,
       CASE WHEN p.state IN ('REFUNDED','CHARGEBACK') THEN 'UNSUPPORTED_PAYMENT_STATE' ELSE NULL END,
       CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
  FROM payments p;
