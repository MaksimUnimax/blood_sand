import { randomUUID } from "node:crypto";
import type { AdminAuthRepository, AdminRole } from "@product/admin-auth";
import type { DatabaseQuery, DatabaseRuntime } from "./index.js";

const bootstrapLockKey = "product-control-plane/admin-auth/bootstrap/v1";

async function rolesFor(
  query: DatabaseQuery,
  principalId: string,
): Promise<AdminRole[]> {
  const result = await query.query<{ role: AdminRole }>(
    "SELECT role FROM admin_role_grants WHERE admin_principal_id=$1 AND revoked_at IS NULL ORDER BY role ASC",
    [principalId],
  );
  return result.rows.map((row) => row.role);
}

export function createAdminAuthRepository(
  runtime: DatabaseRuntime,
): AdminAuthRepository {
  return {
    async createAdminSession(input) {
      return runtime.transaction(async (tx) => {
        const principal = await tx.query<{
          principal_id: string;
          principal_status: "ACTIVE" | "SUSPENDED";
          user_status: "ACTIVE" | "SUSPENDED";
          source_user_id: string;
          source_revoked_at: Date | null;
          source_expires_at: Date;
        }>(
          `SELECT ap.id principal_id,ap.status principal_status,u.status user_status,ps.user_id source_user_id,ps.revoked_at source_revoked_at,ps.expires_at source_expires_at
             FROM admin_principals ap JOIN users u ON u.id=ap.user_id
             JOIN portal_sessions ps ON ps.id=$2
            WHERE ap.user_id=$1 FOR UPDATE OF ap,ps`,
          [input.userId, input.sourcePortalSessionId],
        );
        const row = principal.rows[0];
        if (!row || row.source_user_id !== input.userId)
          return { kind: "forbidden" };
        if (row.principal_status === "SUSPENDED") return { kind: "suspended" };
        if (
          row.user_status !== "ACTIVE" ||
          row.source_revoked_at !== null ||
          new Date(row.source_expires_at) <= input.now
        )
          return { kind: "forbidden" };
        const roles = await rolesFor(tx, row.principal_id);
        if (roles.length === 0) return { kind: "forbidden" };
        const sessionId = randomUUID();
        await tx.query(
          `INSERT INTO admin_sessions(id,admin_principal_id,source_portal_session_id,session_token_hash,created_at,expires_at) VALUES($1,$2,$3,$4,$5,$6)`,
          [
            sessionId,
            row.principal_id,
            input.sourcePortalSessionId,
            input.sessionTokenHash,
            input.createdAt,
            input.expiresAt,
          ],
        );
        await tx.query(
          `INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id,safe_metadata) VALUES('USER',$1,'ADMIN_SESSION_CREATED','ADMIN_SESSION',$2,$3,$4::jsonb)`,
          [
            input.userId,
            sessionId,
            input.correlationId,
            JSON.stringify({
              roles,
              expiresAt: input.expiresAt.toISOString(),
            }),
          ],
        );
        return {
          kind: "created",
          subject: {
            adminPrincipalId: row.principal_id,
            userId: input.userId,
            adminSessionId: sessionId,
            roles,
            expiresAt: input.expiresAt,
          },
        };
      });
    },

    async authenticateAdminSession(sessionTokenHash, now) {
      const result = await runtime.query<{
        session_id: string;
        principal_id: string;
        principal_status: "ACTIVE" | "SUSPENDED";
        user_id: string;
        user_status: "ACTIVE" | "SUSPENDED";
        session_created_at: Date;
        session_expires_at: Date;
        session_revoked_at: Date | null;
        source_revoked_at: Date | null;
        source_expires_at: Date;
      }>(
        `SELECT s.id session_id,s.admin_principal_id principal_id,ap.status principal_status,ap.user_id,
                u.status user_status,s.created_at session_created_at,s.expires_at session_expires_at,
                s.revoked_at session_revoked_at,ps.revoked_at source_revoked_at,ps.expires_at source_expires_at
           FROM admin_sessions s JOIN admin_principals ap ON ap.id=s.admin_principal_id
           JOIN users u ON u.id=ap.user_id JOIN portal_sessions ps ON ps.id=s.source_portal_session_id
          WHERE s.session_token_hash=$1`,
        [sessionTokenHash],
      );
      const row = result.rows[0];
      if (!row) return { kind: "unauthorized" };
      if (row.principal_status === "SUSPENDED" || row.user_status !== "ACTIVE")
        return { kind: "suspended" };
      if (
        row.session_revoked_at !== null ||
        new Date(row.session_expires_at) <= now ||
        row.source_revoked_at !== null ||
        new Date(row.source_expires_at) <= now
      )
        return { kind: "expired" };
      const roles = await rolesFor(runtime, row.principal_id);
      if (roles.length === 0) return { kind: "unauthorized" };
      await runtime.query(
        "UPDATE admin_sessions SET last_seen_at=$2 WHERE id=$1",
        [row.session_id, now],
      );
      return {
        kind: "authenticated",
        subject: {
          adminPrincipalId: row.principal_id,
          userId: row.user_id,
          adminSessionId: row.session_id,
          roles,
          expiresAt: new Date(row.session_expires_at),
        },
      };
    },

    async revokeAdminSession(input) {
      return runtime.transaction(async (tx) => {
        const result = await tx.query<{ id: string }>(
          `UPDATE admin_sessions SET revoked_at=now(),revoke_reason='LOGOUT' WHERE session_token_hash=$1 AND admin_principal_id=$2 AND revoked_at IS NULL RETURNING id`,
          [input.sessionTokenHash, input.adminPrincipalId],
        );
        const row = result.rows[0];
        if (!row) return "missing";
        await tx.query(
          `INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id) VALUES('ADMIN',$1,'ADMIN_SESSION_REVOKED','ADMIN_SESSION',$2,$3)`,
          [input.adminPrincipalId, row.id, input.correlationId],
        );
        return "revoked";
      });
    },

    async bootstrapOwner(input) {
      return runtime.transaction(async (tx) => {
        await tx.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
          [bootstrapLockKey],
        );
        const active = await tx.query(
          "SELECT 1 FROM admin_role_grants WHERE revoked_at IS NULL LIMIT 1",
        );
        if (active.rows[0]) return { kind: "closed" };
        const identity = await tx.query<{
          user_id: string;
          status: "ACTIVE" | "SUSPENDED";
        }>(
          `SELECT i.user_id,u.status FROM user_identities i JOIN users u ON u.id=i.user_id WHERE i.provider='EMAIL' AND i.normalized_identifier=$1 AND i.verified_at IS NOT NULL`,
          [input.normalizedEmail],
        );
        const user = identity.rows[0];
        if (!user) return { kind: "user-not-found" };
        if (user.status !== "ACTIVE") return { kind: "user-inactive" };
        await tx.query(
          `INSERT INTO admin_principals(user_id) VALUES($1) ON CONFLICT (user_id) DO NOTHING`,
          [user.user_id],
        );
        const principal = await tx.query<{ id: string }>(
          "SELECT id FROM admin_principals WHERE user_id=$1 FOR UPDATE",
          [user.user_id],
        );
        const principalId = principal.rows[0]!.id;
        await tx.query(
          `INSERT INTO admin_role_grants(admin_principal_id,role,granted_by_admin_principal_id) VALUES($1,'ADMIN_OWNER',NULL)`,
          [principalId],
        );
        await tx.query(
          `INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id,safe_metadata) VALUES('SYSTEM',NULL,'ADMIN_OWNER_BOOTSTRAPPED','ADMIN_PRINCIPAL',$1,$2,$3::jsonb)`,
          [
            principalId,
            input.correlationId,
            JSON.stringify({ role: "ADMIN_OWNER", userId: user.user_id }),
          ],
        );
        return {
          kind: "bootstrapped",
          principalId,
          userId: user.user_id,
        };
      });
    },
  };
}
