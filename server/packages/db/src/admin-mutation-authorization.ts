import {
  permissionsForRoles,
  type AdminPermission,
  type AdminRole,
} from "@product/admin-auth";
import type { DatabaseQuery } from "./index.js";

export class AdminMutationAuthorizationError extends Error {
  public readonly code = "ADMIN_FORBIDDEN" as const;

  public constructor() {
    super("ADMIN_FORBIDDEN");
    this.name = "AdminMutationAuthorizationError";
  }
}

/**
 * Locks the actor principal for the duration of the caller transaction before
 * reading current, non-revoked grants.  This is the mutation authority for
 * both P6.2 and later admin mutation compositions.
 */
export async function authorizeAdminMutationInTransaction(
  tx: DatabaseQuery,
  actorPrincipalId: string,
  requiredPermission: AdminPermission,
): Promise<void> {
  const principal = await tx.query<{ status: "ACTIVE" | "SUSPENDED" }>(
    "SELECT status FROM admin_principals WHERE id=$1 FOR UPDATE",
    [actorPrincipalId],
  );
  if (principal.rows[0]?.status !== "ACTIVE")
    throw new AdminMutationAuthorizationError();
  const grants = await tx.query<{ role: AdminRole }>(
    "SELECT role FROM admin_role_grants WHERE admin_principal_id=$1 AND revoked_at IS NULL ORDER BY role ASC",
    [actorPrincipalId],
  );
  if (
    !permissionsForRoles(grants.rows.map((row) => row.role)).includes(
      requiredPermission,
    )
  )
    throw new AdminMutationAuthorizationError();
}
