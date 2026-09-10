CREATE TYPE "public"."ai_adapter_status" AS ENUM ('ACTIVE', 'DISABLED', 'ARCHIVED');
--> statement-breakpoint
CREATE TYPE "public"."ai_surface_status" AS ENUM ('ACTIVE', 'DISABLED', 'ARCHIVED');
--> statement-breakpoint
CREATE TYPE "public"."ai_variant_status" AS ENUM ('ACTIVE', 'DISABLED', 'ARCHIVED');
--> statement-breakpoint
CREATE TYPE "public"."adapter_profile_status" AS ENUM ('ACTIVE', 'DISABLED', 'ARCHIVED');
--> statement-breakpoint
CREATE TYPE "public"."adapter_profile_revision_state" AS ENUM ('DRAFT', 'CANDIDATE', 'PUBLISHED', 'RETIRED');
--> statement-breakpoint
CREATE TABLE "ai_adapters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "machine_key" varchar(64) NOT NULL,
  "display_name" varchar(256) NOT NULL,
  "description" varchar(512) DEFAULT '' NOT NULL,
  "status" "ai_adapter_status" DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ai_adapters_machine_key_unique" UNIQUE("machine_key"),
  CONSTRAINT "ai_adapters_machine_key_format" CHECK ("machine_key" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "ai_adapters_updated_after_created" CHECK ("updated_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "ai_surfaces" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "adapter_id" uuid NOT NULL,
  "machine_key" varchar(64) NOT NULL,
  "display_name" varchar(256) NOT NULL,
  "status" "ai_surface_status" DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ai_surfaces_adapter_machine_key_unique" UNIQUE("adapter_id", "machine_key"),
  CONSTRAINT "ai_surfaces_id_adapter_unique" UNIQUE("id", "adapter_id"),
  CONSTRAINT "ai_surfaces_machine_key_format" CHECK ("machine_key" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "ai_surfaces_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "ai_surfaces_adapter_id_fk" FOREIGN KEY ("adapter_id") REFERENCES "ai_adapters"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
--> statement-breakpoint
CREATE TABLE "ai_variants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "surface_id" uuid NOT NULL,
  "machine_key" varchar(64) NOT NULL,
  "display_name" varchar(256) NOT NULL,
  "status" "ai_variant_status" DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ai_variants_surface_machine_key_unique" UNIQUE("surface_id", "machine_key"),
  CONSTRAINT "ai_variants_id_surface_unique" UNIQUE("id", "surface_id"),
  CONSTRAINT "ai_variants_machine_key_format" CHECK ("machine_key" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "ai_variants_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "ai_variants_surface_id_fk" FOREIGN KEY ("surface_id") REFERENCES "ai_surfaces"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
--> statement-breakpoint
CREATE TABLE "adapter_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "adapter_id" uuid NOT NULL,
  "surface_id" uuid NOT NULL,
  "variant_id" uuid,
  "machine_key" varchar(64) NOT NULL,
  "display_name" varchar(256) NOT NULL,
  "status" "adapter_profile_status" DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "adapter_profiles_machine_key_unique" UNIQUE("machine_key"),
  CONSTRAINT "adapter_profiles_identity_hierarchy_unique" UNIQUE("id", "adapter_id", "surface_id"),
  CONSTRAINT "adapter_profiles_id_variant_unique" UNIQUE("id", "variant_id"),
  CONSTRAINT "adapter_profiles_machine_key_format" CHECK ("machine_key" ~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'),
  CONSTRAINT "adapter_profiles_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "adapter_profiles_adapter_id_fk" FOREIGN KEY ("adapter_id") REFERENCES "ai_adapters"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profiles_surface_adapter_fk" FOREIGN KEY ("surface_id", "adapter_id") REFERENCES "ai_surfaces"("id", "adapter_id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profiles_variant_surface_fk" FOREIGN KEY ("variant_id", "surface_id") REFERENCES "ai_variants"("id", "surface_id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
--> statement-breakpoint
CREATE INDEX "adapter_profiles_surface_index" ON "adapter_profiles" USING btree ("surface_id", "variant_id");
--> statement-breakpoint
CREATE TABLE "adapter_profile_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "adapter_id" uuid NOT NULL,
  "surface_id" uuid NOT NULL,
  "variant_id" uuid,
  "revision" integer NOT NULL,
  "schema_version" varchar(64) NOT NULL,
  "state" "adapter_profile_revision_state" DEFAULT 'DRAFT' NOT NULL,
  "content" jsonb NOT NULL,
  "compatibility_constraints" jsonb NOT NULL,
  "content_sha256" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "published_at" timestamp with time zone,
  "created_by_admin_principal_id" uuid,
  "published_by_admin_principal_id" uuid,
  CONSTRAINT "adapter_profile_revisions_profile_revision_unique" UNIQUE("profile_id", "revision"),
  CONSTRAINT "adapter_profile_revisions_identity_hierarchy_unique" UNIQUE("id", "profile_id", "adapter_id", "surface_id", "variant_id"),
  CONSTRAINT "adapter_profile_revisions_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "adapter_profile_revisions_schema_version" CHECK ("schema_version" = 'adapter_profile_v1'),
  CONSTRAINT "adapter_profile_revisions_content_object" CHECK (jsonb_typeof("content") = 'object'),
  CONSTRAINT "adapter_profile_revisions_compatibility_object" CHECK (jsonb_typeof("compatibility_constraints") = 'object'),
  CONSTRAINT "adapter_profile_revisions_payload_size" CHECK (octet_length("content"::text) + octet_length("compatibility_constraints"::text) <= 65536),
  CONSTRAINT "adapter_profile_revisions_checksum_format" CHECK ("content_sha256" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "adapter_profile_revisions_publication_state_time" CHECK (("state" IN ('DRAFT', 'CANDIDATE') AND "published_at" IS NULL) OR ("state" IN ('PUBLISHED', 'RETIRED') AND "published_at" IS NOT NULL)),
  CONSTRAINT "adapter_profile_revisions_profile_hierarchy_fk" FOREIGN KEY ("profile_id", "adapter_id", "surface_id") REFERENCES "adapter_profiles"("id", "adapter_id", "surface_id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_revisions_profile_variant_fk" FOREIGN KEY ("profile_id", "variant_id") REFERENCES "adapter_profiles"("id", "variant_id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_revisions_created_by_fk" FOREIGN KEY ("created_by_admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_revisions_published_by_fk" FOREIGN KEY ("published_by_admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
--> statement-breakpoint
CREATE INDEX "adapter_profile_revisions_profile_index" ON "adapter_profile_revisions" USING btree ("profile_id");
--> statement-breakpoint
CREATE FUNCTION p7_1_adapter_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P7.1 adapter identity cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    OLD.id IS DISTINCT FROM NEW.id OR
    OLD.machine_key IS DISTINCT FROM NEW.machine_key OR
    OLD.created_at IS DISTINCT FROM NEW.created_at
  ) THEN
    RAISE EXCEPTION 'P7.1 adapter identity is immutable' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_1_adapter_identity_guard
BEFORE INSERT OR UPDATE OR DELETE ON "ai_adapters"
FOR EACH ROW EXECUTE FUNCTION p7_1_adapter_identity_guard();
--> statement-breakpoint
CREATE FUNCTION p7_1_surface_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P7.1 surface identity cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    OLD.id IS DISTINCT FROM NEW.id OR
    OLD.adapter_id IS DISTINCT FROM NEW.adapter_id OR
    OLD.machine_key IS DISTINCT FROM NEW.machine_key OR
    OLD.created_at IS DISTINCT FROM NEW.created_at
  ) THEN
    RAISE EXCEPTION 'P7.1 surface identity is immutable' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_1_surface_identity_guard
BEFORE INSERT OR UPDATE OR DELETE ON "ai_surfaces"
FOR EACH ROW EXECUTE FUNCTION p7_1_surface_identity_guard();
--> statement-breakpoint
CREATE FUNCTION p7_1_variant_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P7.1 variant identity cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    OLD.id IS DISTINCT FROM NEW.id OR
    OLD.surface_id IS DISTINCT FROM NEW.surface_id OR
    OLD.machine_key IS DISTINCT FROM NEW.machine_key OR
    OLD.created_at IS DISTINCT FROM NEW.created_at
  ) THEN
    RAISE EXCEPTION 'P7.1 variant identity is immutable' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_1_variant_identity_guard
BEFORE INSERT OR UPDATE OR DELETE ON "ai_variants"
FOR EACH ROW EXECUTE FUNCTION p7_1_variant_identity_guard();
--> statement-breakpoint
CREATE FUNCTION p7_1_profile_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P7.1 profile identity cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    OLD.id IS DISTINCT FROM NEW.id OR
    OLD.adapter_id IS DISTINCT FROM NEW.adapter_id OR
    OLD.surface_id IS DISTINCT FROM NEW.surface_id OR
    OLD.variant_id IS DISTINCT FROM NEW.variant_id OR
    OLD.machine_key IS DISTINCT FROM NEW.machine_key OR
    OLD.created_at IS DISTINCT FROM NEW.created_at
  ) THEN
    RAISE EXCEPTION 'P7.1 profile identity is immutable' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_1_profile_identity_guard
BEFORE INSERT OR UPDATE OR DELETE ON "adapter_profiles"
FOR EACH ROW EXECUTE FUNCTION p7_1_profile_identity_guard();
--> statement-breakpoint
CREATE FUNCTION p7_1_profile_revision_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.state IN ('PUBLISHED', 'RETIRED') THEN
      RAISE EXCEPTION 'P7.1 published profile revision cannot be deleted' USING ERRCODE = '55000';
    END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.id IS DISTINCT FROM NEW.id OR
       OLD.profile_id IS DISTINCT FROM NEW.profile_id OR
       OLD.adapter_id IS DISTINCT FROM NEW.adapter_id OR
       OLD.surface_id IS DISTINCT FROM NEW.surface_id OR
       OLD.variant_id IS DISTINCT FROM NEW.variant_id OR
       OLD.revision IS DISTINCT FROM NEW.revision OR
       OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'P7.1 profile revision identity is immutable' USING ERRCODE = '55000';
    END IF;
    IF OLD.state = 'RETIRED' THEN
      RAISE EXCEPTION 'P7.1 retired profile revision is immutable' USING ERRCODE = '55000';
    END IF;
    IF OLD.state = 'PUBLISHED' THEN
      IF NEW.state NOT IN ('PUBLISHED', 'RETIRED') OR
         OLD.schema_version IS DISTINCT FROM NEW.schema_version OR
         OLD.content IS DISTINCT FROM NEW.content OR
         OLD.compatibility_constraints IS DISTINCT FROM NEW.compatibility_constraints OR
         OLD.content_sha256 IS DISTINCT FROM NEW.content_sha256 OR
         OLD.published_at IS DISTINCT FROM NEW.published_at OR
         OLD.created_by_admin_principal_id IS DISTINCT FROM NEW.created_by_admin_principal_id OR
         OLD.published_by_admin_principal_id IS DISTINCT FROM NEW.published_by_admin_principal_id THEN
        RAISE EXCEPTION 'P7.1 published profile revision is immutable' USING ERRCODE = '55000';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_1_profile_revision_guard
BEFORE INSERT OR UPDATE OR DELETE ON "adapter_profile_revisions"
FOR EACH ROW EXECUTE FUNCTION p7_1_profile_revision_guard();
