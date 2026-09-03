ALTER TABLE "otp_challenges" ADD COLUMN "invalidated_at" timestamp with time zone;
ALTER TABLE "otp_challenges" ADD COLUMN "invalidation_reason" varchar(64);
ALTER TABLE "audit_events" ALTER COLUMN "correlation_id" TYPE varchar(128) USING "correlation_id"::text;

CREATE TABLE "auth_rate_limit_buckets" (
  "action" varchar(64) NOT NULL,
  "key_hash" varchar(128) NOT NULL,
  "window_started_at" timestamp with time zone NOT NULL,
  "count" integer NOT NULL,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "auth_rate_limit_buckets_action_key_hash_unique" UNIQUE("action","key_hash"),
  CONSTRAINT "auth_rate_limit_buckets_count_nonnegative" CHECK ("auth_rate_limit_buckets"."count" >= 0)
);
CREATE TYPE "public"."otp_email_job_status" AS ENUM('PENDING', 'PROCESSING', 'SENT', 'DEAD');
CREATE TABLE "otp_email_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "challenge_id" uuid NOT NULL,
  "status" "otp_email_job_status" DEFAULT 'PENDING' NOT NULL,
  "ciphertext" bytea,
  "nonce" bytea,
  "auth_tag" bytea,
  "attempt_count" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer NOT NULL,
  "available_at" timestamp with time zone DEFAULT now() NOT NULL,
  "lease_id" uuid,
  "leased_until" timestamp with time zone,
  "last_error_code" varchar(128),
  "provider_message_id" varchar(512),
  "correlation_id" varchar(128) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "sent_at" timestamp with time zone,
  CONSTRAINT "otp_email_jobs_challenge_id_unique" UNIQUE("challenge_id"),
  CONSTRAINT "otp_email_jobs_attempt_count_nonnegative" CHECK ("otp_email_jobs"."attempt_count" >= 0),
  CONSTRAINT "otp_email_jobs_max_attempts_positive" CHECK ("otp_email_jobs"."max_attempts" > 0),
  CONSTRAINT "otp_email_jobs_attempt_count_within_max_attempts" CHECK ("otp_email_jobs"."attempt_count" <= "otp_email_jobs"."max_attempts"),
  CONSTRAINT "otp_email_jobs_challenge_id_otp_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."otp_challenges"("id") ON DELETE restrict ON UPDATE restrict
);
CREATE INDEX "otp_email_jobs_claim_index" ON "otp_email_jobs" USING btree ("status","available_at","leased_until");
