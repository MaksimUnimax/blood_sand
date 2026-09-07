# P6.1 Admin Security Local Evidence — 2026-09-07

Status: **ACCEPTED — P6.1 DONE**

## Base and runtime

- Technical ID: `PRODUCT-CONTROL-PLANE-P6.1-ADMIN-IDENTITY-SESSION-RBAC-FOUNDATION-LOCAL`
- Attempt: `1`
- Base HEAD: `22bdf7997396894c3644d8690763fafc1541a1cf`
- Remote start reads 1/2: `22bdf7997396894c3644d8690763fafc1541a1cf`
- Node: `v24.20.0`; pnpm: `10.34.5`; Node 12 used: `NO`
- Root disk: `84%` used, `9,938,472 KiB` free; inodes: `31%` used
- Protected services remained active.

## Migration and persistence

Migration set is exactly `0000..0012`; no `0013` exists. Migration 0012 is:

`packages/db/drizzle/0012_p6_1_admin_security_foundation.sql`

0012 SHA-256: `9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679`

Historical migration SHA-256 values remain unchanged:

```text
0000  9a7cde34d8b38667ccedd630cd2dc40697b2ee5c922927bb08f93f242bc5af56
0001  0544b377425ee3a6ebc9dc21ebb402febe27852c7bf93666f4154fbc0f723b2f
0002  f6f302d14574a7f9dff3675b8b330fbbf90a4d69387041b9fdf8fbe0454ce449
0003  ffe1c20c37c92f1529251ff21921c5a3a1a946a09c661b162e8458c37c08c9b6
0004  38774ebb870f9d233ddc51d2b8d24dd361ae2274920d0f7b0286eae333273e1d
0005  6b95b4dae57e356804a83d1d34ff03286fb5465ff3d214a4b40ae70150283d21
0006  37aa137364c9327108ea0db8ca25cba7cbc99c0d1649b959499a4fa87824dd1f
0007  1c8c32d6f9ea073788507736f06daaa67dee2f74465d2b990eb7fbcc67d0abe6
0008  d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1
0009  d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec
0010  28ec7583b9ad7497246580ce19a22ba82d72cc6ab223c6f9503f4b88ad1eef18
0011  5f55a0e69bdc49769cdb5e8796c0e8f4290372aeeaaca7a93792cab48bebef12
```

The migration was applied twice to disposable PostgreSQL 18: `PASS` / `PASS`.
It adds exactly `admin_principals`, `admin_role_grants`, and `admin_sessions`.
Principal identity and role history are append-only/restricted as specified;
active `(principal, role)` grants are unique; session token hashes are unique;
session expiry/revocation shapes and the cross-user source-session invariant
are database-enforced.

## Identity, roles, and RBAC

Admin principals are separate persisted state mapped one-to-one to existing
verified product users. Account ownership does not confer admin privilege.
The exact roles are `ADMIN_OWNER`, `ADMIN_OPS`, `ADMIN_SUPPORT`, and
`ADMIN_BILLING_READONLY`; role grants retain revocation history.

The initial permission vocabulary is code-defined and contains the requested
21 P6 permissions. `ADMIN_OWNER` has all; `ADMIN_OPS` has operational/device
and read permissions; `ADMIN_SUPPORT` has support reads/device revoke; and
`ADMIN_BILLING_READONLY` has account/subscription/billing/audit reads only.
Server-side authorization is fail-closed, unknown roles/permissions are
rejected, and multiple active roles form a deterministic union.

## Sessions and CSRF

Admin sessions are a distinct `pcp_admin_session` audience with a 30-minute
TTL. Only opaque 32-byte tokens are issued; only a keyed lookup hash is
persisted. Elevation requires a valid portal session and portal CSRF, an
ACTIVE user/principal with an active role, and portal authentication created
within `15 minutes` (`ADMIN_ELEVATION_MAX_PORTAL_SESSION_AGE_MS`). The source
portal session remains a live dependency; revocation/expiry or user/principal
suspension immediately disables the admin session.

Admin crypto uses domain-separated session and CSRF derivations. Admin CSRF is
the separate `pcp_admin_csrf` strict double-submit/HMAC value, timing-safe
validated; it is required for admin logout/mutations. Cookies are strict,
HttpOnly only for the admin session, and Secure in production.

## Bootstrap and audit

`pnpm admin:bootstrap-owner <existing-verified-email>` is the one-time local
operator command. It normalizes the email, requires an exact verified ACTIVE
user, serializes the global bootstrap, creates/reuses the principal, grants
`ADMIN_OWNER`, and atomically writes `ADMIN_OWNER_BOOTSTRAPPED` as SYSTEM with
null actor. Any active admin role closes the bootstrap globally with
`ADMIN_BOOTSTRAP_CLOSED`; concurrent attempts produce exactly one owner.
No user, verification, membership, wildcard, or network backdoor is created.

`ADMIN_SESSION_CREATED` and `ADMIN_SESSION_REVOKED` are transactionally audited.
Bootstrap, session creation, and revocation roll back on injected audit
failure. Audit metadata excludes tokens, hashes, CSRF, portal tokens, email,
and other sensitive provider/session material.

## HTTP and contract surface

P6.1 adds exactly:

- `POST /v1/admin/session`
- `GET /v1/admin/me`
- `DELETE /v1/admin/session`

All three are `no-store`; `/me` returns only authenticated status, principal
ID, sorted roles/permissions, and expiry. OpenAPI has 21 method tuples and
SHA-256 `587d67234a22b1529cad3ce447ca10f0dcc1eddd18646fae2310c28f99861a09`.
No admin UI was added.

## Acceptance results

- Unit/API: `685` passed, `0` failed, `0` skipped/todo; new P6.1: `50`; crypto: `12/12`.
- Real PostgreSQL integration: `1,165` passed, `0` failed, `0` skipped/todo; P6.1: `77`.
- Retained P5 integration counts: P5.7/P5.6/P5.5/P5.4/P5.3/P5.2/P5.1 = `80/152/120/116/102/90/94`.
- Retained P4 integration counts P4.6/P4.5/P4.4/P4.3/P4.2/P4.1 = `38/52/48/52/21/30`.
- DB-down gate bundle: `PASS`; DB-up gate bundle: `PASS`.
- Existing E2E: `32/32 PASS`, `0` failed, `0` skipped, `0` retry.
- P5 product behavior: unchanged; only migration/route acceptance expectations were advanced for P6.1.

## Boundaries and roadmap

- `ADMIN_SEPARATE_PRINCIPAL=YES`
- `ADMIN_SEPARATE_SESSION=YES`
- `ADMIN_SESSION_SHORT_LIVED=YES`
- `ADMIN_CSRF=YES`
- `SERVER_SIDE_RBAC=YES`
- `ADMIN_MFA_IMPLEMENTED=NO`
- `ADMIN_MFA_PRODUCTION_GATE=DEFERRED`
- `REAL_PROVIDER=ABSENT`; `PAYMENT_PROVIDER_CHANGE=NO`
- `BRIDGE_CHANGED=NO`
- `P6_2_STARTED=NO`; `P7_STARTED=NO`
- Payment go-live: `DEFERRED`

ADR-0026 freezes P6.1-P6.6 and assigns AI/health/diagnostic admin ownership
to P7/P8/P9 respectively. ROADMAP is `P6 ACTIVE`, `P6.1 DONE`, `P6.2 NEXT`,
and `P6.3..P6.6 PLANNED`; P7-P15 remain planned.

## Remote acceptance and finalization

- Implementation SHA: `29f69a02914c231b89351e79714ca0fe59491afd`
- Implementation Server CI: run `34125514652`; https://github.com/MaksimUnimax/blood_sand/actions/runs/34125514652; `SUCCESS`
- `REMOTE_P6_1_REVIEW=PASS`
- Findings: critical/high/material medium `0/0/0`
- Unit/API: `685`; integration: `1165`; P6.1: `77`
- Retained P5.7/P5.6/P5.5/P5.4/P5.3/P5.2/P5.1: `80/152/120/116/102/90/94`
- Retained P4.6/P4.5/P4.4/P4.3/P4.2/P4.1: `38/52/48/52/21/30`
- Crypto: `12/12`; E2E: `32/32`
- OpenAPI: `21`; SHA-256 `587d67234a22b1529cad3ce447ca10f0dcc1eddd18646fae2310c28f99861a09`
- Migrations: `0000..0012`; 0012 SHA-256 `9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679`; `0013` absent
- Exact domain roles: `ADMIN_OWNER`, `ADMIN_OPS`, `ADMIN_SUPPORT`, `ADMIN_BILLING_READONLY`
- Separate admin principal/session audience and server-side RBAC accepted
- `ADMIN_MFA_IMPLEMENTED=NO`; `ADMIN_MFA_PRODUCTION_GATE=DEFERRED`
- P6.2 and P7 were not executed; real payment-provider go-live remains deferred
