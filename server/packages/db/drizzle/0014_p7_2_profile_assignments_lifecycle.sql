CREATE TYPE "public"."adapter_profile_assignment_subject_kind" AS ENUM ('ACCOUNT', 'DEVICE');
--> statement-breakpoint
CREATE TYPE "public"."adapter_profile_assignment_mode" AS ENUM ('DIRECT', 'ROLLOUT', 'PAUSED');
--> statement-breakpoint
CREATE TABLE "adapter_profile_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "adapter_id" uuid NOT NULL,
  "surface_id" uuid NOT NULL,
  "variant_id" uuid,
  "browser_family" varchar(32) NOT NULL,
  "subject_kind" "adapter_profile_assignment_subject_kind" NOT NULL,
  "cohort_seed" bytea NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by_admin_principal_id" uuid,
  CONSTRAINT "adapter_profile_assignments_adapter_fk" FOREIGN KEY ("adapter_id") REFERENCES "ai_adapters"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_assignments_surface_adapter_fk" FOREIGN KEY ("surface_id", "adapter_id") REFERENCES "ai_surfaces"("id", "adapter_id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_assignments_variant_surface_fk" FOREIGN KEY ("variant_id", "surface_id") REFERENCES "ai_variants"("id", "surface_id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_assignments_actor_fk" FOREIGN KEY ("created_by_admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_assignments_browser_family" CHECK ("browser_family" IN ('chrome', 'yandex_chromium')),
  CONSTRAINT "adapter_profile_assignments_seed_length" CHECK (octet_length("cohort_seed") = 32)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "adapter_profile_assignments_exact_scope_unique" ON "adapter_profile_assignments" ("adapter_id", "surface_id", "variant_id", "browser_family") WHERE "variant_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "adapter_profile_assignments_default_scope_unique" ON "adapter_profile_assignments" ("adapter_id", "surface_id", "browser_family") WHERE "variant_id" IS NULL;
--> statement-breakpoint
CREATE TABLE "adapter_profile_assignment_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "assignment_id" uuid NOT NULL,
  "revision" integer NOT NULL,
  "mode" "adapter_profile_assignment_mode" NOT NULL,
  "baseline_profile_revision_id" uuid NOT NULL,
  "candidate_profile_revision_id" uuid,
  "percentage_bps" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by_admin_principal_id" uuid,
  "reason" varchar(512),
  CONSTRAINT "adapter_profile_assignment_revisions_assignment_fk" FOREIGN KEY ("assignment_id") REFERENCES "adapter_profile_assignments"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,

  CONSTRAINT "adapter_profile_assignment_revisions_actor_fk" FOREIGN KEY ("created_by_admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "adapter_profile_assignment_revisions_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "adapter_profile_assignment_revisions_percentage_bounds" CHECK ("percentage_bps" BETWEEN 0 AND 10000),
  CONSTRAINT "adapter_profile_assignment_revisions_shape" CHECK (
    ("mode" = 'DIRECT' AND "candidate_profile_revision_id" IS NULL AND "percentage_bps" = 0) OR
    ("mode" IN ('ROLLOUT', 'PAUSED') AND "candidate_profile_revision_id" IS NOT NULL AND "baseline_profile_revision_id" <> "candidate_profile_revision_id")
  ),
  CONSTRAINT "adapter_profile_assignment_revisions_unique" UNIQUE ("assignment_id", "revision")
);
--> statement-breakpoint
CREATE INDEX "adapter_profile_assignment_revisions_assignment_index" ON "adapter_profile_assignment_revisions" ("assignment_id", "revision" DESC);
--> statement-breakpoint
CREATE FUNCTION p7_2_assignment_scope_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  adapter_status text;
  surface_status text;
  variant_status text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P7.2 assignment scope cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.id IS DISTINCT FROM NEW.id OR OLD.adapter_id IS DISTINCT FROM NEW.adapter_id OR OLD.surface_id IS DISTINCT FROM NEW.surface_id OR OLD.variant_id IS DISTINCT FROM NEW.variant_id OR OLD.browser_family IS DISTINCT FROM NEW.browser_family OR OLD.subject_kind IS DISTINCT FROM NEW.subject_kind OR OLD.cohort_seed IS DISTINCT FROM NEW.cohort_seed OR OLD.created_at IS DISTINCT FROM NEW.created_at OR OLD.created_by_admin_principal_id IS DISTINCT FROM NEW.created_by_admin_principal_id THEN
      RAISE EXCEPTION 'P7.2 assignment scope is immutable' USING ERRCODE = '55000';
    END IF;
    RETURN NEW;
  END IF;
  IF octet_length(NEW.cohort_seed) <> 32 THEN
    RAISE EXCEPTION 'P7.2 cohort seed must be 32 bytes' USING ERRCODE = '23514';
  END IF;
  SELECT a.status, s.status, v.status INTO adapter_status, surface_status, variant_status
    FROM ai_adapters a JOIN ai_surfaces s ON s.id = NEW.surface_id AND s.adapter_id = NEW.adapter_id
    LEFT JOIN ai_variants v ON v.id = NEW.variant_id AND v.surface_id = NEW.surface_id
    WHERE a.id = NEW.adapter_id;
  IF adapter_status IS DISTINCT FROM 'ACTIVE' OR surface_status IS DISTINCT FROM 'ACTIVE' OR (NEW.variant_id IS NOT NULL AND variant_status IS DISTINCT FROM 'ACTIVE') THEN
    RAISE EXCEPTION 'P7.2 inactive assignment hierarchy' USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_2_assignment_scope_guard BEFORE INSERT OR UPDATE OR DELETE ON "adapter_profile_assignments" FOR EACH ROW EXECUTE FUNCTION p7_2_assignment_scope_guard();
--> statement-breakpoint
CREATE FUNCTION p7_2_profile_revision_lifecycle_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.state <> 'DRAFT' OR NEW.published_at IS NOT NULL OR NEW.published_by_admin_principal_id IS NOT NULL THEN
      RAISE EXCEPTION 'P7.2 profile revisions must be inserted as unpublished DRAFT rows' USING ERRCODE = '55000';
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.state = 'DRAFT' THEN
    IF NEW.state NOT IN ('DRAFT', 'CANDIDATE') THEN
      RAISE EXCEPTION 'P7.2 illegal profile lifecycle transition' USING ERRCODE = '22023';
    END IF;
    IF NEW.published_at IS NOT NULL OR NEW.published_by_admin_principal_id IS NOT NULL THEN
      RAISE EXCEPTION 'P7.2 draft and candidate rows cannot contain publication metadata' USING ERRCODE = '55000';
    END IF;
    IF NEW.state = 'CANDIDATE' AND (
      OLD.id IS DISTINCT FROM NEW.id OR
      OLD.profile_id IS DISTINCT FROM NEW.profile_id OR
      OLD.adapter_id IS DISTINCT FROM NEW.adapter_id OR
      OLD.surface_id IS DISTINCT FROM NEW.surface_id OR
      OLD.variant_id IS DISTINCT FROM NEW.variant_id OR
      OLD.revision IS DISTINCT FROM NEW.revision OR
      OLD.schema_version IS DISTINCT FROM NEW.schema_version OR
      OLD.content IS DISTINCT FROM NEW.content OR
      OLD.compatibility_constraints IS DISTINCT FROM NEW.compatibility_constraints OR
      OLD.content_sha256 IS DISTINCT FROM NEW.content_sha256 OR
      OLD.created_at IS DISTINCT FROM NEW.created_at OR
      OLD.created_by_admin_principal_id IS DISTINCT FROM NEW.created_by_admin_principal_id
    ) THEN
      RAISE EXCEPTION 'P7.2 candidate transition must freeze the committed DRAFT payload' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.state = 'CANDIDATE' THEN
    IF NEW.state <> 'PUBLISHED' OR NEW.published_at IS NULL OR
      OLD.id IS DISTINCT FROM NEW.id OR
      OLD.profile_id IS DISTINCT FROM NEW.profile_id OR
      OLD.adapter_id IS DISTINCT FROM NEW.adapter_id OR
      OLD.surface_id IS DISTINCT FROM NEW.surface_id OR
      OLD.variant_id IS DISTINCT FROM NEW.variant_id OR
      OLD.revision IS DISTINCT FROM NEW.revision OR
      OLD.schema_version IS DISTINCT FROM NEW.schema_version OR
      OLD.content IS DISTINCT FROM NEW.content OR
      OLD.compatibility_constraints IS DISTINCT FROM NEW.compatibility_constraints OR
      OLD.content_sha256 IS DISTINCT FROM NEW.content_sha256 OR
      OLD.created_at IS DISTINCT FROM NEW.created_at OR
      OLD.created_by_admin_principal_id IS DISTINCT FROM NEW.created_by_admin_principal_id THEN
      RAISE EXCEPTION 'P7.2 candidate is immutable' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.state = 'PUBLISHED' THEN
    IF NEW.state <> 'RETIRED' OR
      OLD.id IS DISTINCT FROM NEW.id OR
      OLD.profile_id IS DISTINCT FROM NEW.profile_id OR
      OLD.adapter_id IS DISTINCT FROM NEW.adapter_id OR
      OLD.surface_id IS DISTINCT FROM NEW.surface_id OR
      OLD.variant_id IS DISTINCT FROM NEW.variant_id OR
      OLD.revision IS DISTINCT FROM NEW.revision OR
      OLD.schema_version IS DISTINCT FROM NEW.schema_version OR
      OLD.content IS DISTINCT FROM NEW.content OR
      OLD.compatibility_constraints IS DISTINCT FROM NEW.compatibility_constraints OR
      OLD.content_sha256 IS DISTINCT FROM NEW.content_sha256 OR
      OLD.created_at IS DISTINCT FROM NEW.created_at OR
      OLD.created_by_admin_principal_id IS DISTINCT FROM NEW.created_by_admin_principal_id OR
      OLD.published_at IS DISTINCT FROM NEW.published_at OR
      OLD.published_by_admin_principal_id IS DISTINCT FROM NEW.published_by_admin_principal_id THEN
      RAISE EXCEPTION 'P7.2 published profile revision is immutable' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.state = 'RETIRED' THEN
    RAISE EXCEPTION 'P7.2 retired profile revision is immutable' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_2_profile_revision_lifecycle_guard BEFORE INSERT OR UPDATE ON "adapter_profile_revisions" FOR EACH ROW EXECUTE FUNCTION p7_2_profile_revision_lifecycle_guard();
--> statement-breakpoint
CREATE FUNCTION p7_2_assignment_revision_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'P7.2 assignment revision history is append-only' USING ERRCODE = '55000';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_2_assignment_revision_guard BEFORE UPDATE OR DELETE ON "adapter_profile_assignment_revisions" FOR EACH ROW EXECUTE FUNCTION p7_2_assignment_revision_guard();
--> statement-breakpoint
CREATE FUNCTION p7_2_assignment_revision_validate() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  next_revision integer;
  invalid_count integer;
  target_uuid uuid;
BEGIN
  FOR target_uuid IN
    SELECT targets.id
    FROM (
      SELECT DISTINCT target.id
      FROM unnest(ARRAY[NEW.baseline_profile_revision_id, NEW.candidate_profile_revision_id]::uuid[]) AS target(id)
      WHERE target.id IS NOT NULL
    ) AS targets
    ORDER BY targets.id::text
  LOOP
    PERFORM p7_2_lock_profile_revision_target(target_uuid);
  END LOOP;
  SELECT COALESCE(max(revision), 0) + 1 INTO next_revision FROM adapter_profile_assignment_revisions WHERE assignment_id = NEW.assignment_id;
  IF NEW.revision <> next_revision THEN RAISE EXCEPTION 'P7.2 assignment revision must be the next revision' USING ERRCODE = '23514'; END IF;
  SELECT count(*) INTO invalid_count
    FROM unnest(ARRAY[NEW.baseline_profile_revision_id, NEW.candidate_profile_revision_id]::uuid[]) target(id)
    WHERE target.id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM adapter_profile_assignments a
      JOIN adapter_profile_revisions r ON r.id = target.id
      JOIN adapter_profiles p ON p.id = r.profile_id
      JOIN ai_adapters ad ON ad.id = p.adapter_id
      JOIN ai_surfaces s ON s.id = p.surface_id AND s.adapter_id = p.adapter_id
      LEFT JOIN ai_variants v ON v.id = p.variant_id AND v.surface_id = p.surface_id
      WHERE a.id = NEW.assignment_id AND r.state = 'PUBLISHED' AND p.adapter_id = a.adapter_id AND p.surface_id = a.surface_id AND p.variant_id IS NOT DISTINCT FROM a.variant_id AND r.compatibility_constraints -> 'browserFamilies' ? a.browser_family AND ad.status = 'ACTIVE' AND s.status = 'ACTIVE' AND p.status = 'ACTIVE' AND (a.variant_id IS NULL OR v.status = 'ACTIVE')
    );
  IF invalid_count > 0 THEN RAISE EXCEPTION 'P7.2 assignment target is not eligible for this scope' USING ERRCODE = '22023'; END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_2_assignment_revision_validate BEFORE INSERT ON "adapter_profile_assignment_revisions" FOR EACH ROW EXECUTE FUNCTION p7_2_assignment_revision_validate();
--> statement-breakpoint
CREATE FUNCTION p7_2_lock_profile_revision_target(target_uuid uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('p7.2/profile-revision-target/' || target_uuid::text, 0));
END;
$$;
--> statement-breakpoint
CREATE FUNCTION p7_2_retirement_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.state = 'PUBLISHED' AND NEW.state = 'RETIRED' THEN
    PERFORM p7_2_lock_profile_revision_target(OLD.id);
  END IF;
  IF OLD.state = 'PUBLISHED' AND NEW.state = 'RETIRED' AND EXISTS (
    SELECT 1 FROM adapter_profile_assignment_revisions ar
    JOIN (SELECT assignment_id, max(revision) AS revision FROM adapter_profile_assignment_revisions GROUP BY assignment_id) latest ON latest.assignment_id = ar.assignment_id AND latest.revision = ar.revision
    WHERE (ar.mode = 'DIRECT' AND ar.baseline_profile_revision_id = OLD.id) OR (ar.mode IN ('ROLLOUT','PAUSED') AND (ar.baseline_profile_revision_id = OLD.id OR ar.candidate_profile_revision_id = OLD.id))
  ) THEN
    RAISE EXCEPTION 'P7.2 active assignment target cannot be retired' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p7_2_retirement_guard BEFORE UPDATE ON "adapter_profile_revisions" FOR EACH ROW EXECUTE FUNCTION p7_2_retirement_guard();
