# ADR-0026 — P6 admin security foundation and decomposition

Status: Accepted  
Date: 2026-09-07

## Context

P5 is the accepted simulated-billing base at `22bdf7997396894c3644d8690763fafc1541a1cf`.
P6 needs a privileged control-plane identity without treating account
membership or an account owner as an administrator.

## Decision

P6 is decomposed as follows:

- P6.1 (active): admin identity, privileged session audience, CSRF, RBAC and
  one-time first-owner bootstrap.
- P6.2 (planned): admin read plane, safe account/user/subscription/device
  views, audit reads, support device revoke, and principal/role management.
- P6.3 (planned): subscription and billing operations through accepted P5
  commands and safe billing reads.
- P6.4 (planned): existing plan, price, entitlement and compatibility policy
  operations.
- P6.5 (planned): admin portal shell and operations UX.
- P6.6 (planned): P6 security, architecture, full regression and final
  acceptance.

P7 owns the AI adapter/profile admin module, P8 owns the Health admin module,
and P9 owns the diagnostics admin module. Those stages append their own
permissions and reuse the P6.1 session/RBAC framework; P6.1 creates no fake
AI, Health or diagnostics state.

An admin principal is a separate persisted mapping to exactly one existing
verified product user. Account membership, account role, email domain, email
heuristic, or environment wildcard never grants admin privilege. The initial
roles are exactly `ADMIN_OWNER`, `ADMIN_OPS`, `ADMIN_SUPPORT`, and
`ADMIN_BILLING_READONLY`. Role grants are append-only history with at most one
active grant per principal and role.

The permission vocabulary is code-defined and closed for P6.1:

`admin.principal.read`, `admin.principal.manage`, `admin.audit.read`,
`account.read`, `user.read`, `device.read`, `device.revoke`,
`subscription.read`, `subscription.grant`, `subscription.extend`,
`subscription.suspend`, `subscription.restore`, `billing.read`, `plan.read`,
`plan.manage`, `price.read`, `price.manage`, `entitlement.read`,
`entitlement.override`, `compatibility.read`, `compatibility.manage`.

The role-to-permission matrix is deterministic in `@product/admin-auth`:
`ADMIN_OWNER` has all current permissions; `ADMIN_OPS` has account/user/device
and subscription operations, billing/audit reads and compatibility read;
`ADMIN_SUPPORT` has account/user/device reads, device revoke, subscription and
billing/audit reads; `ADMIN_BILLING_READONLY` has account, subscription,
billing and audit reads. Server guards check the exact permission.

Admin sessions use the separate `pcp_admin_session` audience, a 30-minute TTL,
32-byte opaque token, and a persisted keyed lookup artifact only. They depend
on the source portal session: it must remain active, unexpired and bound to
the same user. Elevation requires a valid portal session and portal CSRF, and
the portal session must be no older than 15 minutes (the exact boundary is
accepted). Admin logout uses the separate `pcp_admin_csrf` double-submit/HMAC
CSRF domain. Cookies are HttpOnly/SameSite=strict as appropriate and Secure in
production.

The local operator command `pnpm admin:bootstrap-owner -- <email>` accepts one
bounded normalized email for an existing verified active user. It creates or
reuses the principal and grants `ADMIN_OWNER` only while no active admin role
exists globally. A transaction advisory lock serializes the first bootstrap;
the grant and exact `ADMIN_OWNER_BOOTSTRAPPED` SYSTEM audit event commit
atomically. There is no network bootstrap backdoor and no direct SQL operator
workflow.

P6.1 exposes only `POST /v1/admin/session`, `GET /v1/admin/me`, and
`DELETE /v1/admin/session`. It adds no admin UI or domain operation endpoint.
MFA is not implemented in this local foundation:
`ADMIN_MFA_PRODUCTION_GATE=DEFERRED`. Real payment-provider integration is
unchanged and deferred.

## Consequences

The privileged boundary is reusable by later P6/P7/P8/P9 modules and remains
independent of account ownership. Suspended principals, suspended users,
revoked/expired source portal sessions, revoked/expired admin sessions, and
missing active roles fail closed. Existing audit events remain the audit
authority; P6.1 adds no generic admin business-operation table.

P6.2 has not started.
