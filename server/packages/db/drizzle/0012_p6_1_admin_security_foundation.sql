CREATE TYPE "public"."admin_principal_status" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "public"."admin_role" AS ENUM ('ADMIN_OWNER', 'ADMIN_OPS', 'ADMIN_SUPPORT', 'ADMIN_BILLING_READONLY');
--> statement-breakpoint
CREATE TABLE "admin_principals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "status" "admin_principal_status" DEFAULT 'ACTIVE' NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "admin_principals_user_id_unique" UNIQUE("user_id"),
  CONSTRAINT "admin_principals_revision_positive" CHECK ("revision" > 0),
  CONSTRAINT "admin_principals_updated_after_created" CHECK ("updated_at" >= "created_at"),
  CONSTRAINT "admin_principals_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
--> statement-breakpoint
CREATE INDEX "admin_principals_status_index" ON "admin_principals" USING btree ("status");
--> statement-breakpoint
CREATE TABLE "admin_role_grants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "admin_principal_id" uuid NOT NULL,
  "role" "admin_role" NOT NULL,
  "granted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "granted_by_admin_principal_id" uuid,
  "revoked_at" timestamp with time zone,
  "revoked_by_admin_principal_id" uuid,
  CONSTRAINT "admin_role_grants_principal_fk" FOREIGN KEY ("admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "admin_role_grants_granted_by_fk" FOREIGN KEY ("granted_by_admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "admin_role_grants_revoked_by_fk" FOREIGN KEY ("revoked_by_admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "admin_role_grants_revocation_shape" CHECK (("revoked_at" IS NULL AND "revoked_by_admin_principal_id" IS NULL) OR ("revoked_at" IS NOT NULL AND "revoked_by_admin_principal_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX "admin_role_grants_principal_index" ON "admin_role_grants" USING btree ("admin_principal_id");
CREATE UNIQUE INDEX "admin_role_grants_active_principal_role_unique" ON "admin_role_grants" USING btree ("admin_principal_id", "role") WHERE "revoked_at" IS NULL;
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "admin_principal_id" uuid NOT NULL,
  "source_portal_session_id" uuid NOT NULL,
  "session_token_hash" varchar(128) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_seen_at" timestamp with time zone,
  "expires_at" timestamp with time zone NOT NULL,
  "revoked_at" timestamp with time zone,
  "revoke_reason" varchar(128),
  CONSTRAINT "admin_sessions_session_token_hash_unique" UNIQUE("session_token_hash"),
  CONSTRAINT "admin_sessions_principal_fk" FOREIGN KEY ("admin_principal_id") REFERENCES "admin_principals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "admin_sessions_source_portal_session_fk" FOREIGN KEY ("source_portal_session_id") REFERENCES "portal_sessions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "admin_sessions_expiry_after_creation" CHECK ("expires_at" > "created_at"),
  CONSTRAINT "admin_sessions_revoke_shape" CHECK (("revoked_at" IS NULL AND "revoke_reason" IS NULL) OR ("revoked_at" IS NOT NULL AND "revoke_reason" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX "admin_sessions_principal_index" ON "admin_sessions" USING btree ("admin_principal_id");
CREATE INDEX "admin_sessions_source_portal_session_index" ON "admin_sessions" USING btree ("source_portal_session_id");
--> statement-breakpoint
CREATE FUNCTION p6_1_admin_principal_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P6.1 admin principals cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' AND (OLD.id IS DISTINCT FROM NEW.id OR OLD.user_id IS DISTINCT FROM NEW.user_id OR OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
    RAISE EXCEPTION 'P6.1 admin principal identity is immutable' USING ERRCODE = '55000';
  END IF;
  IF NEW.revision <= 0 OR NEW.updated_at < NEW.created_at THEN
    RAISE EXCEPTION 'P6.1 admin principal invariant failed' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p6_1_admin_principal_guard BEFORE INSERT OR UPDATE OR DELETE ON "admin_principals" FOR EACH ROW EXECUTE FUNCTION p6_1_admin_principal_guard();
--> statement-breakpoint
CREATE FUNCTION p6_1_admin_role_grant_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P6.1 admin role grants cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.id IS DISTINCT FROM NEW.id OR OLD.admin_principal_id IS DISTINCT FROM NEW.admin_principal_id OR OLD.role IS DISTINCT FROM NEW.role OR OLD.granted_at IS DISTINCT FROM NEW.granted_at OR OLD.granted_by_admin_principal_id IS DISTINCT FROM NEW.granted_by_admin_principal_id THEN
      RAISE EXCEPTION 'P6.1 admin role history is immutable' USING ERRCODE = '55000';
    END IF;
    IF OLD.revoked_at IS NOT NULL OR (OLD.revoked_at IS NULL AND NEW.revoked_at IS NULL) OR NEW.revoked_at < OLD.granted_at THEN
      RAISE EXCEPTION 'P6.1 admin role revocation is immutable or invalid' USING ERRCODE = '55000';
    END IF;
  END IF;
  IF (NEW.revoked_at IS NULL AND NEW.revoked_by_admin_principal_id IS NOT NULL) OR (NEW.revoked_at IS NOT NULL AND NEW.revoked_by_admin_principal_id IS NULL) THEN
    RAISE EXCEPTION 'P6.1 admin role revocation shape invalid' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p6_1_admin_role_grant_guard BEFORE INSERT OR UPDATE OR DELETE ON "admin_role_grants" FOR EACH ROW EXECUTE FUNCTION p6_1_admin_role_grant_guard();
--> statement-breakpoint
CREATE FUNCTION p6_1_admin_session_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE principal_user_id uuid;
DECLARE source_user_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'P6.1 admin sessions cannot be deleted' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO principal_user_id FROM admin_principals WHERE id = NEW.admin_principal_id;
    SELECT user_id INTO source_user_id FROM portal_sessions WHERE id = NEW.source_portal_session_id;
    IF principal_user_id IS NULL OR source_user_id IS NULL OR principal_user_id IS DISTINCT FROM source_user_id THEN
      RAISE EXCEPTION 'P6.1 admin session identity mismatch' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF OLD.id IS DISTINCT FROM NEW.id OR OLD.admin_principal_id IS DISTINCT FROM NEW.admin_principal_id OR OLD.source_portal_session_id IS DISTINCT FROM NEW.source_portal_session_id OR OLD.session_token_hash IS DISTINCT FROM NEW.session_token_hash OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'P6.1 admin session identity is immutable' USING ERRCODE = '55000';
    END IF;
    IF OLD.revoked_at IS NOT NULL OR (OLD.revoked_at IS NULL AND NEW.revoked_at IS NULL) THEN
      IF OLD.revoked_at IS DISTINCT FROM NEW.revoked_at OR OLD.revoke_reason IS DISTINCT FROM NEW.revoke_reason THEN
        RAISE EXCEPTION 'P6.1 admin session revocation is immutable' USING ERRCODE = '55000';
      END IF;
    END IF;
  END IF;
  IF NEW.expires_at <= NEW.created_at OR (NEW.revoked_at IS NULL AND NEW.revoke_reason IS NOT NULL) OR (NEW.revoked_at IS NOT NULL AND NEW.revoke_reason IS NULL) THEN
    RAISE EXCEPTION 'P6.1 admin session invariant failed' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER p6_1_admin_session_guard BEFORE INSERT OR UPDATE OR DELETE ON "admin_sessions" FOR EACH ROW EXECUTE FUNCTION p6_1_admin_session_guard();
