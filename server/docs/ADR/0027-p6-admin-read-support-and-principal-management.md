# ADR-0027 — P6.2 admin read, support, and principal management

Status: Accepted  
Date: 2026-09-08

## Decision

P6.2 is implemented on the accepted P6.1 base (`29f69a02914c231b89351e79714ca0fe59491afd`, with final documentation at `7bb332c5cc1001a230a425ba55b799df9f3c5f8f`). It adds the DB-independent `@product/admin-ops` domain package, a reusable P6 admin route guard, and exactly these twelve routes:

`GET /v1/admin/accounts`, `GET /v1/admin/users`,
`GET /v1/admin/accounts/{account_id}/subscription`,
`GET /v1/admin/accounts/{account_id}/devices`,
`POST /v1/admin/accounts/{account_id}/devices/{device_id}/revoke`,
`GET /v1/admin/audit-events`, `GET /v1/admin/principals`,
`POST /v1/admin/principals`,
`POST /v1/admin/principals/{principal_id}/roles/{role}/grant`,
`POST /v1/admin/principals/{principal_id}/roles/{role}/revoke`,
`POST /v1/admin/principals/{principal_id}/suspend`, and
`POST /v1/admin/principals/{principal_id}/restore`.

The route permission map is, in order: `account.read`, `user.read`,
`subscription.read`, `device.read`, `device.revoke`, `admin.audit.read`,
`admin.principal.read`, and `admin.principal.manage` for principal creation,
role grant/revoke, suspend, and restore. Reads require no CSRF; every mutation
requires the accepted admin CSRF plus a trimmed 1–256 character reason with no
control characters or CR/LF.

Account and user lookup use exact UUID/status filters and exact normalized email
matching. Results expose only safe account fields, verified/unverified email
identity timestamps, and deterministic created-at/id descending pagination.
UUID cursors must belong to the same filtered result. No account membership
expansion, OTP, session, token, or secret material is exposed.

The admin subscription endpoint delegates to the shared P5 commercial account
subscription reader. It preserves timestamp-authoritative eligibility, exact
plan and bound-price revisions, period/grace boundaries, and commercial device
allowance parity while excluding `stateReason`, provider/payment identifiers,
billing events, checkout, reconciliation, and audit detail.

Portal and admin device revocation use one DB-internal transaction primitive.
Admin revocation requires `device.revoke`, rechecks current actor authority in
the transaction, revokes the device and all active extension sessions, emits
`ADMIN_DEVICE_REVOKED` and `EXTENSION_SESSION_REVOKED` with `ADMIN` actor data,
and is idempotent without new audit rows.

Audit reads expose only the safe envelope (`id`, actor, action, target,
correlation, and timestamp); `reason` and `safeMetadata` are deliberately
private. Principal reads expose active sorted roles only.

Principal creation requires an existing active user with a verified email,
creates an active principal at revision 1, writes the initial active role, and
audits `ADMIN_PRINCIPAL_CREATED` and `ADMIN_ROLE_GRANTED` atomically. Role
grant/revoke uses append-only role history and increments the principal
revision exactly once for semantic changes. Suspend/restore likewise uses
optimistic `expectedRevision`; suspend revokes all active admin sessions with
`ADMIN_PRINCIPAL_SUSPENDED`, while restore never reopens old sessions. No-op
operations return unchanged state and do not audit or increment revision.

All principal-management mutations acquire the advisory lock namespace
`product-control-plane/admin-auth/manage/v1`, lock actor and target principal
rows in lexical UUID order, reload current roles, reauthorize the actor, check
revision, enforce the last active `ADMIN_OWNER` invariant, mutate, and audit in
one transaction. The same transaction-time actor-RBAC recheck applies to
device revoke. An operation that would leave no active owner returns
`ADMIN_LAST_OWNER_REQUIRED`; concurrent owner removals are serialized.

No migration is added: the required migration set remains `0000..0012`, with
accepted migration 0012 unchanged. No admin UI, account/user status mutation,
subscription or billing mutation/read plane, plan/price/entitlement mutation,
AI/health/diagnostic admin domain, payment provider, webhook, or Bridge change
is included. P6.3, P6.4, P6.5, and P7 remain planned; payment go-live remains
deferred.

## Consequences

P6.1 retains its separate session, source-portal dependency, CSRF, role matrix,
and three-route semantics. P5 commercial behavior is unchanged except for the
shared reader entry point. The API surface is now 33 method tuples and remains
safe-by-projection for operational support.
