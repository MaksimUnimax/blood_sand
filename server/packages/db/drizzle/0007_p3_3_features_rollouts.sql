CREATE TYPE "rollout_target_kind" AS ENUM ('CONFIG_RELEASE', 'FEATURE_RULE');
CREATE TYPE "rollout_subject_kind" AS ENUM ('ACCOUNT', 'DEVICE');
CREATE TYPE "rollout_state" AS ENUM ('ACTIVE', 'PAUSED', 'RETIRED');

CREATE TABLE "feature_definitions" (
  "feature_key" varchar(64) PRIMARY KEY NOT NULL,
  "description" varchar(256),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "feature_definitions_key_format" CHECK ("feature_key" ~ '^[a-z0-9][a-z0-9._-]*$')
);
CREATE TABLE "feature_rule_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "feature_key" varchar(64) NOT NULL,
  "revision" integer NOT NULL,
  "contract_version" varchar(64) NOT NULL,
  "enabled" boolean NOT NULL,
  "browser_family" "browser_family",
  "minimum_extension_version" varchar(64),
  "published_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "feature_rule_revisions_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "feature_rule_revisions_feature_revision_unique" UNIQUE("feature_key", "revision")
);
CREATE TABLE "rollouts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "rollout_key" varchar(64) UNIQUE NOT NULL,
  "target_kind" "rollout_target_kind" NOT NULL,
  "subject_kind" "rollout_subject_kind" NOT NULL,
  "cohort_seed" bytea NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "rollouts_key_format" CHECK ("rollout_key" ~ '^[a-z0-9][a-z0-9._-]*$'),
  CONSTRAINT "rollouts_seed_size" CHECK (octet_length("cohort_seed") = 32),
  CONSTRAINT "rollouts_config_key" CHECK (("target_kind" = 'CONFIG_RELEASE' AND "rollout_key" = 'bootstrap.config') OR "target_kind" = 'FEATURE_RULE'),
  CONSTRAINT "rollouts_id_target_kind_unique" UNIQUE("id", "target_kind")
);
CREATE TABLE "rollout_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "rollout_id" uuid NOT NULL,
  "target_kind" "rollout_target_kind" NOT NULL,
  "revision" integer NOT NULL,
  "state" "rollout_state" NOT NULL,
  "percentage_bps" integer NOT NULL,
  "baseline_config_version" integer,
  "candidate_config_version" integer,
  "baseline_feature_rule_revision_id" uuid,
  "candidate_feature_rule_revision_id" uuid,
  "published_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "rollout_revisions_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "rollout_revisions_percentage" CHECK ("percentage_bps" BETWEEN 0 AND 10000),
  CONSTRAINT "rollout_revisions_unique" UNIQUE("rollout_id", "revision"),
  CONSTRAINT "rollout_revisions_id_target_kind_unique" UNIQUE("id", "target_kind"),
  CONSTRAINT "rollout_revisions_target_shape" CHECK (("target_kind" = 'CONFIG_RELEASE' AND "baseline_config_version" IS NOT NULL AND "candidate_config_version" IS NOT NULL AND "baseline_config_version" <> "candidate_config_version" AND "baseline_feature_rule_revision_id" IS NULL AND "candidate_feature_rule_revision_id" IS NULL) OR ("target_kind" = 'FEATURE_RULE' AND "baseline_feature_rule_revision_id" IS NOT NULL AND "candidate_feature_rule_revision_id" IS NOT NULL AND "baseline_feature_rule_revision_id" <> "candidate_feature_rule_revision_id" AND "baseline_config_version" IS NULL AND "candidate_config_version" IS NULL))
);
CREATE TABLE "config_release_feature_rules" (
  "config_version" integer NOT NULL,
  "feature_rule_revision_id" uuid NOT NULL,
  CONSTRAINT "config_release_feature_rules_pk" PRIMARY KEY("config_version", "feature_rule_revision_id")
);
CREATE TABLE "config_release_rollout_revisions" (
  "config_version" integer NOT NULL,
  "rollout_revision_id" uuid NOT NULL,
  "target_kind" "rollout_target_kind" NOT NULL,
  CONSTRAINT "config_release_rollout_revisions_pk" PRIMARY KEY("config_version", "rollout_revision_id"),
  CONSTRAINT "config_release_rollout_revisions_feature_only" CHECK ("target_kind" = 'FEATURE_RULE')
);
ALTER TABLE "feature_rule_revisions" ADD CONSTRAINT "feature_rule_revisions_feature_fk" FOREIGN KEY ("feature_key") REFERENCES "feature_definitions"("feature_key") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "rollout_revisions" ADD CONSTRAINT "rollout_revisions_rollout_fk" FOREIGN KEY ("rollout_id", "target_kind") REFERENCES "rollouts"("id", "target_kind") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "rollout_revisions" ADD CONSTRAINT "rollout_revisions_baseline_config_fk" FOREIGN KEY ("baseline_config_version") REFERENCES "config_releases"("config_version") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "rollout_revisions" ADD CONSTRAINT "rollout_revisions_candidate_config_fk" FOREIGN KEY ("candidate_config_version") REFERENCES "config_releases"("config_version") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "rollout_revisions" ADD CONSTRAINT "rollout_revisions_baseline_feature_fk" FOREIGN KEY ("baseline_feature_rule_revision_id") REFERENCES "feature_rule_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "rollout_revisions" ADD CONSTRAINT "rollout_revisions_candidate_feature_fk" FOREIGN KEY ("candidate_feature_rule_revision_id") REFERENCES "feature_rule_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "config_release_feature_rules" ADD CONSTRAINT "config_release_feature_rules_config_fk" FOREIGN KEY ("config_version") REFERENCES "config_releases"("config_version") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "config_release_feature_rules" ADD CONSTRAINT "config_release_feature_rules_feature_fk" FOREIGN KEY ("feature_rule_revision_id") REFERENCES "feature_rule_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "config_release_rollout_revisions" ADD CONSTRAINT "config_release_rollout_revisions_config_fk" FOREIGN KEY ("config_version") REFERENCES "config_releases"("config_version") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "config_release_rollout_revisions" ADD CONSTRAINT "config_release_rollout_revisions_rollout_fk" FOREIGN KEY ("rollout_revision_id", "target_kind") REFERENCES "rollout_revisions"("id", "target_kind") ON DELETE RESTRICT ON UPDATE RESTRICT;
CREATE FUNCTION p3_3_reject_immutable_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'P3.3 immutable records cannot be %', TG_OP USING ERRCODE = '55000'; END; $$;
CREATE TRIGGER p3_3_feature_definitions_immutable BEFORE UPDATE OR DELETE ON "feature_definitions" FOR EACH ROW EXECUTE FUNCTION p3_3_reject_immutable_mutation();
CREATE TRIGGER p3_3_feature_rule_revisions_immutable BEFORE UPDATE OR DELETE ON "feature_rule_revisions" FOR EACH ROW EXECUTE FUNCTION p3_3_reject_immutable_mutation();
CREATE TRIGGER p3_3_rollouts_immutable BEFORE UPDATE OR DELETE ON "rollouts" FOR EACH ROW EXECUTE FUNCTION p3_3_reject_immutable_mutation();
CREATE TRIGGER p3_3_rollout_revisions_immutable BEFORE UPDATE OR DELETE ON "rollout_revisions" FOR EACH ROW EXECUTE FUNCTION p3_3_reject_immutable_mutation();
CREATE TRIGGER p3_3_config_feature_links_immutable BEFORE UPDATE OR DELETE ON "config_release_feature_rules" FOR EACH ROW EXECUTE FUNCTION p3_3_reject_immutable_mutation();
CREATE TRIGGER p3_3_config_rollout_links_immutable BEFORE UPDATE OR DELETE ON "config_release_rollout_revisions" FOR EACH ROW EXECUTE FUNCTION p3_3_reject_immutable_mutation();
