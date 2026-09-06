CREATE TYPE "plan_status" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN', 'ARCHIVED');
CREATE TYPE "plan_revision_state" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "entitlement_value_type" AS ENUM ('BOOLEAN', 'INTEGER');
CREATE TYPE "entitlement_security_classification" AS ENUM ('CAPABILITY', 'LIMIT');
CREATE TYPE "entitlement_override_operation" AS ENUM ('SET', 'CLEAR');
CREATE TYPE "price_status" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN', 'ARCHIVED');
CREATE TYPE "price_revision_state" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "billing_interval_unit" AS ENUM ('DAY', 'MONTH', 'YEAR');
--> statement-breakpoint
CREATE TABLE "plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(64) NOT NULL,
  "status" "plan_status" DEFAULT 'DRAFT' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "plans_code_unique" UNIQUE("code"),
  CONSTRAINT "plans_code_format" CHECK ("code" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "plan_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL,
  "revision" integer NOT NULL,
  "state" "plan_revision_state" DEFAULT 'DRAFT' NOT NULL,
  "display_name" varchar(256) NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "published_at" timestamp with time zone,
  CONSTRAINT "plan_revisions_plan_id_revision_unique" UNIQUE("plan_id", "revision"),
  CONSTRAINT "plan_revisions_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "plan_revisions_publication_state_time" CHECK (("state" = 'DRAFT' AND "published_at" IS NULL) OR ("state" = 'PUBLISHED' AND "published_at" IS NOT NULL)),
  CONSTRAINT "plan_revisions_description_bounded" CHECK (char_length("description") <= 4000)
);
--> statement-breakpoint
CREATE TABLE "entitlement_definitions" (
  "entitlement_key" varchar(128) PRIMARY KEY NOT NULL,
  "value_type" "entitlement_value_type" NOT NULL,
  "security_classification" "entitlement_security_classification" NOT NULL,
  "description" varchar(512) NOT NULL,
  "deprecated_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "entitlement_definitions_key_format" CHECK ("entitlement_key" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "entitlement_definitions_type_classification" CHECK (("security_classification" = 'CAPABILITY' AND "value_type" = 'BOOLEAN') OR ("security_classification" = 'LIMIT' AND "value_type" = 'INTEGER'))
);
--> statement-breakpoint
CREATE TABLE "plan_entitlements" (
  "plan_revision_id" uuid NOT NULL,
  "entitlement_key" varchar(128) NOT NULL,
  "boolean_value" boolean,
  "integer_value" bigint,
  CONSTRAINT "plan_entitlements_pk" PRIMARY KEY("plan_revision_id", "entitlement_key"),
  CONSTRAINT "plan_entitlements_exactly_one_value" CHECK (("boolean_value" IS NOT NULL)::integer + ("integer_value" IS NOT NULL)::integer = 1),
  CONSTRAINT "plan_entitlements_integer_safe_range" CHECK ("integer_value" IS NULL OR "integer_value" BETWEEN -9007199254740991 AND 9007199254740991)
);
--> statement-breakpoint
CREATE TABLE "account_entitlement_overrides" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL,
  "entitlement_key" varchar(128) NOT NULL,
  "revision" integer NOT NULL,
  "operation" "entitlement_override_operation" NOT NULL,
  "boolean_value" boolean,
  "integer_value" bigint,
  "effective_from" timestamp with time zone NOT NULL,
  "expires_at" timestamp with time zone,
  "reason" varchar(512) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "account_entitlement_overrides_account_key_revision_unique" UNIQUE("account_id", "entitlement_key", "revision"),
  CONSTRAINT "account_entitlement_overrides_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "account_entitlement_overrides_effective_window" CHECK ("expires_at" IS NULL OR "expires_at" > "effective_from"),
  CONSTRAINT "account_entitlement_overrides_reason_safe" CHECK (char_length(btrim("reason")) > 0 AND "reason" !~ '[<>[:cntrl:]]'),
  CONSTRAINT "account_entitlement_overrides_exactly_one_value_for_set" CHECK ("operation" = 'CLEAR' OR (("boolean_value" IS NOT NULL)::integer + ("integer_value" IS NOT NULL)::integer = 1)),
  CONSTRAINT "account_entitlement_overrides_clear_has_no_value" CHECK ("operation" <> 'CLEAR' OR ("boolean_value" IS NULL AND "integer_value" IS NULL)),
  CONSTRAINT "account_entitlement_overrides_integer_safe_range" CHECK ("integer_value" IS NULL OR "integer_value" BETWEEN -9007199254740991 AND 9007199254740991)
);
--> statement-breakpoint
CREATE TABLE "prices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL,
  "code" varchar(64) NOT NULL,
  "market_key" varchar(64) NOT NULL,
  "channel_key" varchar(64) NOT NULL,
  "status" "price_status" DEFAULT 'DRAFT' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "prices_code_unique" UNIQUE("code"),
  CONSTRAINT "prices_code_format" CHECK ("code" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "prices_market_key_format" CHECK ("market_key" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "prices_channel_key_format" CHECK ("channel_key" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "price_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "price_id" uuid NOT NULL,
  "plan_revision_id" uuid NOT NULL,
  "revision" integer NOT NULL,
  "state" "price_revision_state" DEFAULT 'DRAFT' NOT NULL,
  "amount_minor" bigint NOT NULL,
  "currency" varchar(3) NOT NULL,
  "billing_interval_unit" "billing_interval_unit" NOT NULL,
  "billing_interval_count" integer NOT NULL,
  "effective_from" timestamp with time zone NOT NULL,
  "effective_to" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "published_at" timestamp with time zone,
  CONSTRAINT "price_revisions_price_id_revision_unique" UNIQUE("price_id", "revision"),
  CONSTRAINT "price_revisions_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "price_revisions_publication_state_time" CHECK (("state" = 'DRAFT' AND "published_at" IS NULL) OR ("state" = 'PUBLISHED' AND "published_at" IS NOT NULL)),
  CONSTRAINT "price_revisions_amount_minor_safe_range" CHECK ("amount_minor" BETWEEN 0 AND 9007199254740991),
  CONSTRAINT "price_revisions_currency_format" CHECK ("currency" ~ '^[A-Z]{3}$'),
  CONSTRAINT "price_revisions_interval_count_range" CHECK ("billing_interval_count" BETWEEN 1 AND 1200),
  CONSTRAINT "price_revisions_effective_window" CHECK ("effective_to" IS NULL OR "effective_to" > "effective_from")
);
--> statement-breakpoint
CREATE TABLE "price_sale_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "price_id" uuid NOT NULL,
  "assignment_revision" integer NOT NULL,
  "selected_price_revision_id" uuid,
  "effective_from" timestamp with time zone NOT NULL,
  "reason" varchar(512) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "price_sale_assignments_price_id_revision_unique" UNIQUE("price_id", "assignment_revision"),
  CONSTRAINT "price_sale_assignments_revision_positive" CHECK ("assignment_revision" > 0),
  CONSTRAINT "price_sale_assignments_reason_safe" CHECK (char_length(btrim("reason")) > 0 AND "reason" !~ '[<>[:cntrl:]]')
);
--> statement-breakpoint
ALTER TABLE "plan_revisions" ADD CONSTRAINT "plan_revisions_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "plan_entitlements" ADD CONSTRAINT "plan_entitlements_plan_revision_id_fk" FOREIGN KEY ("plan_revision_id") REFERENCES "plan_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "plan_entitlements" ADD CONSTRAINT "plan_entitlements_entitlement_key_fk" FOREIGN KEY ("entitlement_key") REFERENCES "entitlement_definitions"("entitlement_key") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "account_entitlement_overrides" ADD CONSTRAINT "account_entitlement_overrides_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "account_entitlement_overrides" ADD CONSTRAINT "account_entitlement_overrides_entitlement_key_fk" FOREIGN KEY ("entitlement_key") REFERENCES "entitlement_definitions"("entitlement_key") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "prices" ADD CONSTRAINT "prices_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "price_revisions" ADD CONSTRAINT "price_revisions_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "prices"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "price_revisions" ADD CONSTRAINT "price_revisions_plan_revision_id_fk" FOREIGN KEY ("plan_revision_id") REFERENCES "plan_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "price_sale_assignments" ADD CONSTRAINT "price_sale_assignments_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "prices"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "price_sale_assignments" ADD CONSTRAINT "price_sale_assignments_selected_price_revision_id_fk" FOREIGN KEY ("selected_price_revision_id") REFERENCES "price_revisions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
--> statement-breakpoint
CREATE INDEX "plan_entitlements_entitlement_key_index" ON "plan_entitlements" USING btree ("entitlement_key");
CREATE INDEX "account_entitlement_overrides_lookup_index" ON "account_entitlement_overrides" USING btree ("account_id", "entitlement_key", "effective_from", "expires_at");
CREATE INDEX "price_revisions_plan_revision_id_index" ON "price_revisions" USING btree ("plan_revision_id");
CREATE INDEX "price_sale_assignments_resolution_index" ON "price_sale_assignments" USING btree ("price_id", "effective_from", "assignment_revision");
--> statement-breakpoint
CREATE FUNCTION p4_1_reject_published_revision_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.state = 'PUBLISHED' THEN
      RAISE EXCEPTION 'P4.1 published revision cannot be %', TG_OP USING ERRCODE = '55000';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.state = 'PUBLISHED' THEN
    RAISE EXCEPTION 'P4.1 published revision cannot be %', TG_OP USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_plan_revision_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.id IS DISTINCT FROM NEW.id
     OR OLD.plan_id IS DISTINCT FROM NEW.plan_id
     OR OLD.revision IS DISTINCT FROM NEW.revision THEN
    RAISE EXCEPTION 'P4.1 plan revision identity is immutable' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_plan_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'DRAFT' THEN
      RAISE EXCEPTION 'P4.1 non-draft plan cannot be deleted' USING ERRCODE = '55000';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.id IS DISTINCT FROM NEW.id OR OLD.code IS DISTINCT FROM NEW.code THEN
    RAISE EXCEPTION 'P4.1 plan code is immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.status = 'ARCHIVED' AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'P4.1 archived plan is terminal' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_entitlement_definition_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P4.1 entitlement definitions cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF OLD.entitlement_key IS DISTINCT FROM NEW.entitlement_key
     OR OLD.value_type IS DISTINCT FROM NEW.value_type
     OR OLD.security_classification IS DISTINCT FROM NEW.security_classification THEN
    RAISE EXCEPTION 'P4.1 entitlement semantic identity is immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.deprecated_at IS NOT NULL AND NEW.deprecated_at IS DISTINCT FROM OLD.deprecated_at THEN
    RAISE EXCEPTION 'P4.1 entitlement deprecation is one-way' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_plan_entitlement_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  old_revision_state plan_revision_state;
  new_revision_state plan_revision_state;
  definition_value_type entitlement_value_type;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT state INTO old_revision_state FROM plan_revisions WHERE id = OLD.plan_revision_id;
    IF old_revision_state = 'PUBLISHED' THEN
      RAISE EXCEPTION 'P4.1 published plan entitlement composition is immutable' USING ERRCODE = '55000';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT state INTO old_revision_state FROM plan_revisions WHERE id = OLD.plan_revision_id;
    IF old_revision_state = 'PUBLISHED' THEN
      RAISE EXCEPTION 'P4.1 published plan entitlement composition is immutable' USING ERRCODE = '55000';
    END IF;
  END IF;

  SELECT state INTO new_revision_state FROM plan_revisions WHERE id = NEW.plan_revision_id;
  IF new_revision_state = 'PUBLISHED' THEN
    RAISE EXCEPTION 'P4.1 published plan entitlement composition is immutable' USING ERRCODE = '55000';
  END IF;
  SELECT ed.value_type INTO definition_value_type FROM entitlement_definitions AS ed WHERE ed.entitlement_key = NEW.entitlement_key;
  IF definition_value_type = 'BOOLEAN' AND (NEW.boolean_value IS NULL OR NEW.integer_value IS NOT NULL) THEN
    RAISE EXCEPTION 'P4.1 BOOLEAN entitlement requires only boolean_value' USING ERRCODE = '23514';
  ELSIF definition_value_type = 'INTEGER' AND (NEW.integer_value IS NULL OR NEW.boolean_value IS NOT NULL) THEN
    RAISE EXCEPTION 'P4.1 INTEGER entitlement requires only integer_value' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_override_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  definition_value_type entitlement_value_type;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'P4.1 account entitlement overrides are append-only' USING ERRCODE = '55000';
  END IF;
  IF NEW.operation = 'CLEAR' THEN
    IF NEW.boolean_value IS NOT NULL OR NEW.integer_value IS NOT NULL THEN
      RAISE EXCEPTION 'P4.1 CLEAR override cannot carry a value' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;
  SELECT ed.value_type INTO definition_value_type FROM entitlement_definitions AS ed WHERE ed.entitlement_key = NEW.entitlement_key;
  IF definition_value_type = 'BOOLEAN' AND (NEW.boolean_value IS NULL OR NEW.integer_value IS NOT NULL) THEN
    RAISE EXCEPTION 'P4.1 BOOLEAN override requires only boolean_value' USING ERRCODE = '23514';
  ELSIF definition_value_type = 'INTEGER' AND (NEW.integer_value IS NULL OR NEW.boolean_value IS NOT NULL) THEN
    RAISE EXCEPTION 'P4.1 INTEGER override requires only integer_value' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_price_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'DRAFT' THEN
      RAISE EXCEPTION 'P4.1 non-draft price cannot be deleted' USING ERRCODE = '55000';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.id IS DISTINCT FROM NEW.id
     OR OLD.plan_id IS DISTINCT FROM NEW.plan_id
     OR OLD.code IS DISTINCT FROM NEW.code
     OR OLD.market_key IS DISTINCT FROM NEW.market_key
     OR OLD.channel_key IS DISTINCT FROM NEW.channel_key THEN
    RAISE EXCEPTION 'P4.1 price stable identity is immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.status = 'ARCHIVED' AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'P4.1 archived price is terminal' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_price_revision_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  price_plan_id uuid;
  revision_plan_id uuid;
  revision_state plan_revision_state;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.state = 'PUBLISHED' THEN
      RAISE EXCEPTION 'P4.1 published price revision cannot be %', TG_OP USING ERRCODE = '55000';
    END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.state = 'PUBLISHED' THEN
    RAISE EXCEPTION 'P4.1 published price revision cannot be %', TG_OP USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (OLD.id IS DISTINCT FROM NEW.id
     OR OLD.price_id IS DISTINCT FROM NEW.price_id
     OR OLD.revision IS DISTINCT FROM NEW.revision) THEN
    RAISE EXCEPTION 'P4.1 price revision identity is immutable' USING ERRCODE = '55000';
  END IF;
  SELECT plan_id INTO price_plan_id FROM prices WHERE id = NEW.price_id;
  SELECT plan_id, state INTO revision_plan_id, revision_state FROM plan_revisions WHERE id = NEW.plan_revision_id;
  IF price_plan_id IS DISTINCT FROM revision_plan_id THEN
    RAISE EXCEPTION 'P4.1 price revision crosses stable plan identity' USING ERRCODE = '23514';
  END IF;
  IF NEW.state = 'PUBLISHED' AND revision_state <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'P4.1 published price revision requires published plan revision' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p4_1_price_sale_assignment_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  selected_price_id uuid;
  selected_state price_revision_state;
  selected_from timestamptz;
  selected_to timestamptz;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'P4.1 price sale assignments are append-only' USING ERRCODE = '55000';
  END IF;
  IF NEW.selected_price_revision_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT price_id, state, effective_from, effective_to
    INTO selected_price_id, selected_state, selected_from, selected_to
    FROM price_revisions WHERE id = NEW.selected_price_revision_id;
  IF selected_price_id IS DISTINCT FROM NEW.price_id THEN
    RAISE EXCEPTION 'P4.1 sale assignment crosses stable price identity' USING ERRCODE = '23514';
  END IF;
  IF selected_state <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'P4.1 sale assignment requires published price revision' USING ERRCODE = '23514';
  END IF;
  IF NEW.effective_from < selected_from OR (selected_to IS NOT NULL AND NEW.effective_from >= selected_to) THEN
    RAISE EXCEPTION 'P4.1 sale assignment is outside selected price revision effective window' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p4_1_plan_revision_published_immutable
  BEFORE UPDATE OR DELETE ON "plan_revisions"
  FOR EACH ROW EXECUTE FUNCTION p4_1_reject_published_revision_mutation();
CREATE TRIGGER p4_1_plan_revision_identity
  BEFORE UPDATE ON "plan_revisions"
  FOR EACH ROW EXECUTE FUNCTION p4_1_plan_revision_identity_guard();
CREATE TRIGGER p4_1_plan_identity
  BEFORE UPDATE OR DELETE ON "plans"
  FOR EACH ROW EXECUTE FUNCTION p4_1_plan_identity_guard();
CREATE TRIGGER p4_1_entitlement_definition_immutable
  BEFORE UPDATE OR DELETE ON "entitlement_definitions"
  FOR EACH ROW EXECUTE FUNCTION p4_1_entitlement_definition_guard();
CREATE TRIGGER p4_1_plan_entitlement_typed_and_parent_frozen
  BEFORE INSERT OR UPDATE OR DELETE ON "plan_entitlements"
  FOR EACH ROW EXECUTE FUNCTION p4_1_plan_entitlement_guard();
CREATE TRIGGER p4_1_account_override_append_only
  BEFORE INSERT OR UPDATE OR DELETE ON "account_entitlement_overrides"
  FOR EACH ROW EXECUTE FUNCTION p4_1_override_guard();
CREATE TRIGGER p4_1_price_identity
  BEFORE UPDATE OR DELETE ON "prices"
  FOR EACH ROW EXECUTE FUNCTION p4_1_price_identity_guard();
CREATE TRIGGER p4_1_price_revision_immutable_and_coherent
  BEFORE UPDATE OR DELETE ON "price_revisions"
  FOR EACH ROW EXECUTE FUNCTION p4_1_price_revision_guard();
CREATE TRIGGER p4_1_price_revision_coherent_on_insert
  BEFORE INSERT ON "price_revisions"
  FOR EACH ROW EXECUTE FUNCTION p4_1_price_revision_guard();
CREATE TRIGGER p4_1_price_sale_assignment_append_only_and_coherent
  BEFORE INSERT OR UPDATE OR DELETE ON "price_sale_assignments"
  FOR EACH ROW EXECUTE FUNCTION p4_1_price_sale_assignment_guard();
